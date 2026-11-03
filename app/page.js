'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import Background from '../components/Background';
import HeartBurst from '../components/HeartBurst';
import RunawayButton from '../components/RunawayButton';
import Chips from '../components/Chips';

const STEPS = ['gate', 'hello', 'love', 'date', 'when', 'where', 'food', 'extras', 'final'];

async function sendToTelegram(type, data, retries = 0) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
        keepalive: true,
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) return true;
    } catch {}
    await new Promise((res) => setTimeout(res, 1200));
  }
  return false;
}

const todayStr = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const a = new Date(todayStr() + 'T00:00:00');
  const b = new Date(dateStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

const prettyDate = (s) => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
};

export default function Home() {
  const audioRef = useRef(null);
  const [step, setStep] = useState('gate');
  const [muted, setMuted] = useState(false);
  const [burst, setBurst] = useState(0);

  const [noLove, setNoLove] = useState(0);
  const [noDate, setNoDate] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [placePick, setPlacePick] = useState('');
  const [food, setFood] = useState('');
  const [foodPick, setFoodPick] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [after, setAfter] = useState([]);
  const [joy, setJoy] = useState(10);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(null);

  const idx = STEPS.indexOf(step);
  const progress = Math.round((idx / (STEPS.length - 1)) * 100);

  // Пытаемся включить музыку сразу при заходе. Браузеры часто блокируют звук без касания —
  // поэтому есть первый экран с кнопкой «Открыть», и любое первое касание тоже включает музыку.
  const startMusic = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.75;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  useEffect(() => {
    startMusic();
    const once = () => {
      startMusic();
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
    window.addEventListener('pointerdown', once);
    window.addEventListener('keydown', once);
    return () => {
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
  }, [startMusic]);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
    if (!a.muted && a.paused) startMusic();
  };

  const go = (s) => setStep(s);

  const open = () => {
    startMusic();
    sendToTelegram('open', {});
    go('hello');
  };

  const yesLove = () => {
    setBurst((b) => b + 1);
    setTimeout(() => go('date'), 1100);
  };

  const yesDate = () => {
    setBurst((b) => b + 1);
    sendToTelegram('progress', { title: 'Томарис согласилась на свидание! 🎉', text: 'Сейчас выбирает время и место…' });
    setTimeout(() => go('when'), 1100);
  };

  const finish = async () => {
    const foodAll = [...foodPick, food.trim()].filter(Boolean).join(', ');
    const placeAll = [placePick, place.trim()].filter(Boolean).join(' — ');
    go('final');
    setBurst((b) => b + 1);
    const ok = await sendToTelegram(
      'final',
      { love: 'Да 💖', noClicks: noLove + noDate, date: prettyDate(date), time, place: placeAll, food: foodAll, flowers, after, joy, message },
      3
    );
    setSent(ok);
  };

  const left = daysUntil(date);
  const hint = (n) => (n ? CONFIG.noHints[(n - 1) % CONFIG.noHints.length] : ' ');

  return (
    <main>
      <Background />
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" />

      <button className="mute" onClick={toggleMute} aria-label="Музыка">
        {muted ? '🔇' : '🎵'}
      </button>

      {step !== 'gate' && (
        <div className="progress" aria-hidden="true">
          <div style={{ width: progress + '%' }} />
        </div>
      )}

      {burst > 0 && <HeartBurst key={burst} />}

      <section className="card" key={step}>
        {step === 'gate' && (
          <>
            <div className="envelope pulse">💌</div>
            <h1 className="script">Для тебя, {CONFIG.girlName}</h1>
            <p>Здесь тебя ждёт маленький сюрприз</p>
            <button className="btn btn-yes big" onClick={open}>
              Открыть 💖
            </button>
            <small className="tip">включи звук 🎧</small>
          </>
        )}

        {step === 'hello' && (
          <>
            <div className="big-emoji beat">💖</div>
            <h1 className="script glow">Привет, {CONFIG.girlName}!</h1>
            <p>Я приготовил для тебя кое-что особенное…<br />Ответь на пару вопросов, ладно? 🥰</p>
            <button className="btn btn-yes" onClick={() => go('love')}>
              Что там? ✨
            </button>
          </>
        )}

        {step === 'love' && (
          <>
            <div className="big-emoji beat">🥹</div>
            <h1 className="script">{CONFIG.girlName}, ты любишь меня?</h1>
            <div className="btn-row">
              <button className="btn btn-yes" style={{ transform: `scale(${Math.min(1 + noLove * 0.07, 1.6)})` }} onClick={yesLove}>
                Да 💗
              </button>
              <RunawayButton onDodge={() => setNoLove((n) => n + 1)}>Нет 💔</RunawayButton>
            </div>
            <p className="hint">{hint(noLove)}</p>
          </>
        )}

        {step === 'date' && (
          <>
            <div className="big-emoji beat">🌹</div>
            <h1 className="script">Пойдёшь со мной на свидание?</h1>
            <div className="btn-row">
              <button className="btn btn-yes" style={{ transform: `scale(${Math.min(1 + noDate * 0.07, 1.6)})` }} onClick={yesDate}>
                Да, конечно! 😍
              </button>
              <RunawayButton onDodge={() => setNoDate((n) => n + 1)}>Нет 🙈</RunawayButton>
            </div>
            <p className="hint">{hint(noDate)}</p>
          </>
        )}

        {step === 'when' && (
          <>
            <div className="big-emoji beat">⏰</div>
            <h2 className="script">Когда тебе удобно?</h2>
            <label className="label">День</label>
            <input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
            <label className="label">Время</label>
            <Chips options={CONFIG.timeChips} value={time} onChange={setTime} />
            <input type="time" value={CONFIG.timeChips.includes(time) ? '' : time} onChange={(e) => setTime(e.target.value)} />
            <button className="btn btn-yes" disabled={!date || !time} onClick={() => go('where')}>
              Дальше 💕
            </button>
          </>
        )}

        {step === 'where' && (
          <>
            <div className="big-emoji beat">📍</div>
            <h2 className="script">Куда пойдём?</h2>
            <p className="small">Выбери или напиши своё — я всё устрою</p>
            <Chips options={CONFIG.placeChips} value={placePick} onChange={setPlacePick} />
            <textarea rows={2} placeholder="Или напиши своё место…" value={place} onChange={(e) => setPlace(e.target.value)} />
            <button className="btn btn-yes" disabled={!placePick && !place.trim()} onClick={() => go('food')}>
              Дальше 💕
            </button>
          </>
        )}

        {step === 'food' && (
          <>
            <div className="big-emoji beat">🍽</div>
            <h2 className="script">Что закажем?</h2>
            <p className="small">Можно выбрать несколько</p>
            <Chips options={CONFIG.foodChips} value={foodPick} onChange={setFoodPick} multi />
            <textarea rows={2} placeholder="Или напиши, чего хочется…" value={food} onChange={(e) => setFood(e.target.value)} />
            <button className="btn btn-yes" disabled={!foodPick.length && !food.trim()} onClick={() => go('extras')}>
              Дальше 💕
            </button>
          </>
        )}

        {step === 'extras' && (
          <>
            <div className="big-emoji beat">🎁</div>
            <h2 className="script">Ещё пара приятных мелочей</h2>
            <label className="label">Какие цветы любишь? 💐</label>
            <Chips options={CONFIG.flowerChips} value={flowers} onChange={setFlowers} multi />
            <label className="label">Что делаем после? 🎈</label>
            <Chips options={CONFIG.afterChips} value={after} onChange={setAfter} multi />
            <label className="label">
              Насколько ты рада? <b className="joy">{joy}/10</b> {'💖'.repeat(Math.max(1, Math.round(joy / 2)))}
            </label>
            <input type="range" min="1" max="10" value={joy} onChange={(e) => setJoy(Number(e.target.value))} />
            <label className="label">Пару слов для меня 💬</label>
            <textarea rows={3} placeholder="Что хочешь мне сказать…" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="btn btn-yes" onClick={finish}>
              Отправить 💌
            </button>
          </>
        )}

        {step === 'final' && (
          <>
            <div className="big-emoji beat">🎉</div>
            <h1 className="script glow">Ура, {CONFIG.girlName}!</h1>
            <p>
              Я получил твои ответы и уже готовлюсь 🥰
              <br />
              Ты делаешь меня самым счастливым 💖
            </p>
            <div className="summary">
              <div>📅 {prettyDate(date)} в {time}</div>
              {left !== null && left >= 0 && (
                <div>⏳ {left === 0 ? 'Это уже сегодня!' : left === 1 ? 'Остался 1 день' : `Осталось дней: ${left}`}</div>
              )}
              {(placePick || place) && <div>📍 {[placePick, place].filter(Boolean).join(' — ')}</div>}
              {(foodPick.length > 0 || food) && <div>🍽 {[...foodPick, food].filter(Boolean).join(', ')}</div>}
            </div>
            {sent === false && <small className="tip">Если вдруг я не получу — напиши мне сама 😘</small>}
            <div className="love-line">{CONFIG.girlName} 💞 Я люблю тебя</div>
          </>
        )}
      </section>
    </main>
  );
}
