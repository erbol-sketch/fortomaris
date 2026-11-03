// Отправка ответов в Telegram. Токен лежит только на сервере (.env.local) — на сайте его не видно.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const clip = (s, n = 400) => esc(String(s ?? '').slice(0, n).trim()) || '—';
const list = (a) => (Array.isArray(a) && a.length ? a.slice(0, 20).map((x) => clip(x, 60)).join(', ') : '—');

// простая защита от спама: не больше 30 запросов в час с одного IP
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;
}

function buildText(body) {
  const d = body.data || {};
  if (body.type === 'open') {
    return '👀 <b>Томарис открыла сайт!</b>\nСейчас будет проходить опрос 💌';
  }
  if (body.type === 'progress') {
    return `✨ <b>${esc(d.title || 'Новый шаг')}</b>\n${clip(d.text)}`;
  }
  // final
  const lines = [
    '💌 <b>Томарис прошла опрос!</b>',
    '',
    `❤️ Любит тебя: <b>${clip(d.love, 40)}</b>`,
    `🙈 Кнопка «Нет» убегала: <b>${Number(d.noClicks) || 0}</b> раз`,
    `🌹 Свидание: <b>${clip(d.date, 40)}</b>`,
    `⏰ Время: <b>${clip(d.time, 40)}</b>`,
    `📍 Куда пойдём: <b>${clip(d.place)}</b>`,
    `🍽 Что закажем: <b>${clip(d.food)}</b>`,
    `💐 Любимые цветы: <b>${list(d.flowers)}</b>`,
    `🎈 После свидания: <b>${list(d.after)}</b>`,
    `😍 Радость от 1 до 10: <b>${Number(d.joy) || '—'}</b>`,
    `💬 Её слова: <b>${clip(d.message, 800)}</b>`,
  ];
  return lines.join('\n');
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'too_many' }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  if (!['open', 'progress', 'final'].includes(body?.type)) {
    return NextResponse.json({ ok: false, error: 'bad_type' }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  const payload = {
    chat_id: chatId,
    text: buildText(body),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (process.env.TELEGRAM_THREAD_ID) payload.message_thread_id = Number(process.env.TELEGRAM_THREAD_ID);

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      console.error('Telegram error:', j);
      return NextResponse.json({ ok: false, error: j.description || 'telegram_error' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Telegram fetch failed:', e);
    return NextResponse.json({ ok: false, error: 'network' }, { status: 502 });
  }
}
