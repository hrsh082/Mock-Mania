import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption { value: string; label: string; }

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const AppleSelect: React.FC<Props> = ({ value, onChange, options, style, onClick }) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect]  = useState<DOMRect | null>(null);
  const triggerRef       = useRef<HTMLButtonElement>(null);
  const panelRef         = useRef<HTMLDivElement>(null);
  const selected         = options.find(o => o.value === value);

  const openMenu = (e: React.MouseEvent) => {
    onClick?.(e);
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };

  // Close on outside mousedown
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    const closeScroll = () => setOpen(false);
    window.addEventListener('scroll', closeScroll, true);
    window.addEventListener('resize', closeScroll);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeScroll, true);
      window.removeEventListener('resize', closeScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const panel = open && rect ? ReactDOM.createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: Math.max(rect.width, 150),
        zIndex: 999999,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        padding: 5,
        animation: 'appleDropPop 0.16s cubic-bezier(0.34,1.4,0.64,1)',
      }}
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              width: '100%', padding: '7px 10px',
              background: isActive ? 'rgba(0,122,255,0.08)' : 'transparent',
              border: 'none', borderRadius: 8,
              fontFamily: 'inherit', fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#007AFF' : '#1D1D1F',
              cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? 'rgba(0,122,255,0.08)' : 'transparent'; }}
          >
            <span>{opt.label}</span>
            {isActive && <Check size={13} style={{ color: '#007AFF', flexShrink: 0 }} />}
          </button>
        );
      })}
      <style>{`@keyframes appleDropPop{from{opacity:0;transform:scale(.95) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '7px 10px 7px 12px',
          background: open ? 'rgba(255,255,255,0.95)' : 'rgba(118,118,128,0.12)',
          border: open ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 9, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          color: '#1D1D1F', outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(0,122,255,0.14)' : 'none',
          transition: 'all 0.12s',
        } as React.CSSProperties}
      >
        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{selected?.label ?? value}</span>
        <ChevronDown size={14} style={{ color: '#8E8E93', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {panel}
    </div>
  );
};
