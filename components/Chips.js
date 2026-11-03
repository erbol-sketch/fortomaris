'use client';

// Выбор из вариантов (можно один или несколько)
export default function Chips({ options, value, onChange, multi = false }) {
  const isOn = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => {
    if (multi) onChange(isOn(o) ? value.filter((x) => x !== o) : [...value, o]);
    else onChange(o);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} type="button" className={'chip' + (isOn(o) ? ' on' : '')} onClick={() => toggle(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
