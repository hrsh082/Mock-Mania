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
  const depth = 4.2;
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
    : size === 'sm' ? 24 : size === 'lg' ? 96 : 56;

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

            {/* Premium Purple Liquid Gradient */}
            <linearGradient id="purpleLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* Deep wave gradient */}
            <linearGradient id="waveFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
            </linearGradient>

            {/* Glowing rim stroke gradient */}
            <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Outer soft shadow glow */}
          <path
            d={SCALLOP_PATH}
            fill="#6366f1"
            opacity="0.25"
            style={{
              filter: 'blur(6px)',
              transformOrigin: '50px 50px',
              animation: 'wavyPulse 2.4s ease-in-out infinite alternate'
            }}
          />

          {/* Liquid container inside scalloped badge */}
          <g clipPath="url(#scallopClip)">
            {/* Base liquid fill */}
            <rect x="0" y="0" width="100" height="100" fill="url(#purpleLiquid)" />

            {/* Sloshing Wave Layer 1 (Back wave) */}
            <path
              className="wavy-wave-back"
              d="M -100 42 Q -50 32 0 42 T 100 42 T 200 42 V 110 H -100 Z"
              fill="rgba(255, 255, 255, 0.22)"
            />

            {/* Sloshing Wave Layer 2 (Front liquid wave) */}
            <path
              className="wavy-wave-front"
              d="M -100 48 Q -50 58 0 48 T 100 48 T 200 48 V 110 H -100 Z"
              fill="url(#waveFront)"
            />

            {/* Highlights and specular glint */}
            <ellipse cx="50" cy="22" rx="28" ry="10" fill="rgba(255, 255, 255, 0.25)" />
          </g>

          {/* Scalloped Badge Outer Border Contour */}
          <path
            d={SCALLOP_PATH}
            fill="none"
            stroke="url(#rimGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner crisp accent line */}
          <path
            d={SCALLOP_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.2"
          />

          {/* Rotating edge light pulse */}
          <path
            className="wavy-rim-light"
            d={SCALLOP_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="25 180"
            strokeLinecap="round"
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
