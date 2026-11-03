'use client';
import { useMemo } from 'react';

const EMOJIS = ['💖', '💕', '💗', '💘', '✨', '🌹', '💞', '🎉'];

// Взрыв сердечек. Меняй key, чтобы запустить заново.
export default function HeartBurst({ count = 36 }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 260;
        return {
          id: i,
          e: EMOJIS[i % EMOJIS.length],
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 80,
          size: 16 + Math.random() * 26,
          dur: 1.1 + Math.random() * 1.1,
          rot: (Math.random() - 0.5) * 540,
        };
      }),
    [count]
  );
  return (
    <div className="burst" aria-hidden="true">
      {parts.map((p) => (
        <span
          key={p.id}
          style={{ fontSize: p.size, animationDuration: p.dur + 's', '--x': p.x + 'px', '--y': p.y + 'px', '--r': p.rot + 'deg' }}
        >
          {p.e}
        </span>
      ))}
    </div>
  );
}
