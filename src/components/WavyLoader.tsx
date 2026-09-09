import React from 'react';

interface WavyLoaderProps {
  size?: 'sm' | 'md' | 'lg' | number;
  text?: string;
  subtext?: string;
  center?: boolean;
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Generate smooth 12-scallop flower badge path
const SCALLOP_PATH = (() => {
  const cx = 50;
  const cy = 50;
  const rOuter = 44;
  const depth = 4.5;
  const scallops = 12;
  const totalSteps = scallops * 4;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const angle = (i / totalSteps) * Math.PI * 2;
    const r = rOuter - (depth / 2) + (depth / 2) * Math.cos(scallops * angle);
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);
    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < totalSteps; i += 1) {
    const p0 = points[(i - 1 + totalSteps) % totalSteps];
    const p1 = points[i];
    const p2 = points[(i + 1) % totalSteps];
    const p3 = points[(i + 2) % totalSteps];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d + ' Z';
})();

export const WavyLoader: React.FC<WavyLoaderProps> = ({
  size = 'md',
  text,
  subtext,
  center = true,
  inline = false,
  className = '',
  style = {}
}) => {
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'sm' ? 26 : size === 'lg' ? 96 : 56;

  const loaderElement = (
    <div
      className={`wavy-loader-root ${inline ? 'wavy-loader-inline' : ''} ${className}`}
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size === 'sm' ? 6 : size === 'lg' ? 16 : 12,
        ...style
      }}
    >
      <div
        className="wavy-loader-graphic"
        style={{
          width: pixelSize,
          height: pixelSize,
          position: 'relative',
          flexShrink: 0
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Scalloped badge clip mask */}
            <clipPath id="scallopClip">
              <path d={SCALLOP_PATH} />
            </clipPath>

            {/* Base Solid Purple/Indigo Fill */}
            <linearGradient id="solidBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="60%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* White/Translucent Liquid Shade Gradient */}
            <linearGradient id="whiteLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#c7d2fe" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer soft glowing shadow */}
          <path
            d={SCALLOP_PATH}
            fill="#6366f1"
            opacity="0.3"
            style={{
              filter: 'blur(8px)',
              transformOrigin: '50px 50px',
              animation: 'wavyPulse 2s ease-in-out infinite alternate'
            }}
          />

          {/* Liquid Container Inside Scalloped Badge */}
          <g clipPath="url(#scallopClip)">
            {/* 1. Base solid purple color inside center */}
            <rect x="0" y="0" width="100" height="100" fill="url(#solidBaseGrad)" />

            {/* 2. White liquid shade moving UP from below */}
            <path
              className="wavy-liquid-rise"
              d="M -100 50 Q -50 38 0 50 T 100 50 T 200 50 V 120 H -100 Z"
              fill="url(#whiteLiquidGrad)"
            />

            {/* 3. Second sloshing translucent white wave */}
            <path
              className="wavy-liquid-front"
              d="M -100 56 Q -50 66 0 56 T 100 56 T 200 56 V 120 H -100 Z"
              fill="rgba(255, 255, 255, 0.45)"
            />

          </g>

          {/* BOLD Scalloped Badge Outer Border Base */}
          <path
            d={SCALLOP_PATH}
            fill="none"
            stroke="#818cf8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Inner Crisp White Rim */}
          <path
            d={SCALLOP_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* BOLD Moving Highlight Arc Segment tracing along the border */}
          <path
            className="wavy-bold-border-move"
            d={SCALLOP_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeDasharray="50 160"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 3px #ffffff)' }}
          />
        </svg>
      </div>

      {/* Optional text caption */}
      {(text || subtext) && (
        <div style={{ textAlign: 'center' }}>
          {text && (
            <div
              style={{
                fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13.5,
                fontWeight: 600,
                color: 'var(--slate-800)',
                letterSpacing: '-0.01em'
              }}
            >
              {text}
            </div>
          )}
          {subtext && (
            <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>
              {subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (center && !inline) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size === 'lg' ? '60px 20px' : '36px 20px',
          width: '100%'
        }}
      >
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
};
