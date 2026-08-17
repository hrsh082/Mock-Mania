import React, { useRef, useState, useEffect } from 'react';

export interface TabOption<T extends string = string> {
  label: string;
  value: T;
}

interface Props<T extends string = string> {
  tabs: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SlidingTabs<T extends string = string>({ tabs, value, onChange }: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = tabs.findIndex(t => t.value === value);
    const sync = () => {
      const el  = btnRefs.current[idx];
      const box = containerRef.current;
      if (el && box) {
        const er = el.getBoundingClientRect();
        const cr = box.getBoundingClientRect();
        setPill({ left: er.left - cr.left, width: er.width });
      }
    };
    sync();
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [value, tabs]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        padding: 4, background: '#f1f5f9', borderRadius: 999,
        border: '1px solid #e8eaf0',
      }}
    >
      {/* Sliding indicator */}
      <div style={{
        position: 'absolute', top: 3, height: 'calc(100% - 6px)',
        left: pill.left, width: pill.width,
        background: '#e0e7ff', borderRadius: 999,
        border: '1px solid #c7d2fe',
        transition: 'left 0.22s cubic-bezier(0.34,1.4,0.64,1), width 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        pointerEvents: 'none',
      }} />

      {tabs.map((t, i) => (
        <button
          key={t.value}
          ref={el => { btnRefs.current[i] = el; }}
          onClick={() => onChange(t.value)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '6px 16px', borderRadius: 999,
            fontSize: 12.5, fontWeight: 600,
            border: 'none', background: 'transparent',
            color: value === t.value ? '#4F46E5' : '#9ca3af',
            cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'color 0.18s', whiteSpace: 'nowrap',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
