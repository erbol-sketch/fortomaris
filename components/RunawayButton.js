'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Кнопка, которая убегает от пальца/курсора по всему экрану.
export default function RunawayButton({ children, onDodge, className = '' }) {
  const holder = useRef(null);
  const btn = useRef(null);
  const [pos, setPos] = useState(null);
  const [size, setSize] = useState(null);

  const dodge = (e) => {
    if (e?.cancelable) e.preventDefault();
    const el = btn.current;
    const w = el ? el.offsetWidth : 110;
    const h = el ? el.offsetHeight : 50;
    if (!size) setSize({ w, h });
    const pad = 10;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad, window.innerHeight - h - pad);
    let x, y, tries = 0;
    // подальше от текущего места
    do {
      x = pad + Math.random() * (maxX - pad);
      y = pad + Math.random() * (maxY - pad);
      tries++;
    } while (pos && Math.hypot(x - pos.x, y - pos.y) < 140 && tries < 12);
    setPos({ x, y });
    onDodge?.();
  };

  const handlers = {
    onPointerEnter: dodge,
    onPointerDown: dodge,
    onTouchStart: dodge,
    onClick: dodge,
    onFocus: dodge,
  };

  return (
    <>
      <span ref={holder} className="runaway-holder" style={size ? { width: size.w, height: size.h } : undefined}>
        {!pos && (
          <button ref={btn} type="button" className={'btn btn-no ' + className} {...handlers}>
            {children}
          </button>
        )}
      </span>
      {pos &&
        createPortal(
          <button
            ref={btn}
            type="button"
            className={'btn btn-no flying ' + className}
            style={{ left: pos.x, top: pos.y }}
            {...handlers}
          >
            {children}
          </button>,
          document.body
        )}
    </>
  );
}
