'use client';
import { useEffect, useState } from 'react';
import { CONFIG } from '../config';

const EMOJIS = ['💖', '💕', '💗', '💓', '💘', '🌸', '✨', '🌹', '💞'];
const rnd = (a, b) => a + Math.random() * (b - a);

export default function Background() {
  const [hearts, setHearts] = useState([]);
  const [names, setNames] = useState([]);

  useEffect(() => {
    setHearts(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        e: EMOJIS[i % EMOJIS.length],
        left: rnd(0, 100),
        size: rnd(16, 38),
        dur: rnd(9, 20),
        delay: rnd(-20, 0),
        sway: rnd(-40, 40),
      }))
    );
    setNames(
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        top: 6 + i * 13 + rnd(-3, 3),
        size: rnd(15, 26),
        dur: rnd(22, 38),
        delay: rnd(-38, 0),
        reverse: i % 2 === 1,
      }))
    );

    // искорки за пальцем / курсором
    let last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = ['✨', '💖', '💕', '⭐'][Math.floor(Math.random() * 4)];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', rnd(-30, 30) + 'px');
      s.style.fontSize = rnd(10, 20) + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      {names.map((n) => (
        <span
          key={n.id}
          className={'float-name' + (n.reverse ? ' rev' : '')}
          style={{ top: n.top + '%', fontSize: n.size, animationDuration: n.dur + 's', animationDelay: n.delay + 's' }}
        >
          {CONFIG.girlName} <i>♡</i>
        </span>
      ))}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-float"
          style={{
            left: h.left + '%',
            fontSize: h.size,
            animationDuration: h.dur + 's',
            animationDelay: h.delay + 's',
            '--sway': h.sway + 'px',
          }}
        >
          {h.e}
        </span>
      ))}
    </div>
  );
}
