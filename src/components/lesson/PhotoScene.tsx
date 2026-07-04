import React from 'react';
import type { CSSProperties } from 'react';

export type SceneVariant = 'landscape' | 'neutral' | 'lowlight' | 'portrait' | 'street';

const SCENES: Record<SceneVariant, (uid: string) => React.ReactNode> = {
  // 曝光：日照风景（强明暗 + 色彩范围）
  landscape: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8D2E0" />
          <stop offset="1" stopColor="#F0E8D6" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4DC8C" />
          <stop offset="0.4" stopColor="#E8B86A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E8B86A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <circle cx="296" cy="74" r="78" fill={`url(#${uid}-sun)`} />
      <circle cx="296" cy="74" r="30" fill="#F4DC8C" />
      <path d="M0 188 L78 142 L150 184 L214 138 L286 182 L360 150 L400 172 L400 232 L0 232 Z" fill="#9AA6A0" />
      <path d="M0 214 L64 182 L140 210 L210 176 L282 214 L352 192 L400 206 L400 240 L0 240 Z" fill="#7E8B84" />
      <rect x="0" y="232" width="400" height="68" fill="#9DAE7C" />
      <rect x="0" y="232" width="400" height="8" fill="#8A9B68" />
      <rect x="68" y="200" width="6" height="32" fill="#5A6450" />
      <circle cx="71" cy="194" r="20" fill="#6E7A5E" />
    </>
  ),
  // 白平衡：雪景 + 白花 + 灰卡（中性白/灰让暖冷偏色最明显）
  neutral: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8E6E0" />
          <stop offset="1" stopColor="#F7F6F2" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <rect x="0" y="180" width="400" height="120" fill="#FBFAF7" />
      <path d="M0 180 Q100 168 200 180 Q300 192 400 178 L400 200 L0 200 Z" fill="#EDEFF2" />
      <rect x="40" y="150" width="56" height="42" fill="#8A8A86" />
      <rect x="40" y="150" width="56" height="42" fill="none" stroke="#6B6B66" strokeWidth="1" />
      <path d="M300 300 L300 150 M300 180 L280 150 M300 175 L322 150 M300 200 L286 175 M300 205 L316 182" stroke="#3D3D3A" strokeWidth="2" fill="none" />
      <g fill="#FFFFFF" stroke="#E6E4DE" strokeWidth="1">
        <circle cx="150" cy="220" r="9" />
        <circle cx="175" cy="245" r="7" />
        <circle cx="120" cy="250" r="8" />
        <circle cx="220" cy="225" r="8" />
      </g>
      <g fill="#E8B86A">
        <circle cx="150" cy="220" r="2" />
        <circle cx="175" cy="245" r="2" />
        <circle cx="120" cy="250" r="2" />
        <circle cx="220" cy="225" r="2" />
      </g>
    </>
  ),
  // ISO：昏黄街灯夜景（低光让 brightness/contrast/噪点读得清）
  lowlight: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2A3D" />
          <stop offset="1" stopColor="#3A3340" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4DC8C" />
          <stop offset="0.4" stopColor="#E8B86A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E8B86A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <rect x="0" y="120" width="90" height="180" fill="#1A1A1A" />
      <rect x="80" y="160" width="70" height="140" fill="#232321" />
      <rect x="250" y="140" width="80" height="160" fill="#232321" />
      <rect x="320" y="100" width="80" height="200" fill="#1A1A1A" />
      <g fill="#E8B86A" opacity="0.85">
        <rect x="20" y="150" width="8" height="12" />
        <rect x="40" y="150" width="8" height="12" />
        <rect x="20" y="190" width="8" height="12" />
        <rect x="340" y="140" width="8" height="12" />
        <rect x="360" y="180" width="8" height="12" />
      </g>
      <circle cx="200" cy="120" r="90" fill={`url(#${uid}-lamp)`} />
      <circle cx="200" cy="120" r="9" fill="#F4DC8C" />
      <rect x="198" y="120" width="4" height="180" fill="#1A1A1A" />
      <rect x="0" y="280" width="400" height="20" fill="#15151A" />
    </>
  ),
  // 光圈：中心人像主体 + 繁杂散景背景（径向 mask 揭示中心合焦点）
  portrait: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A86A" />
          <stop offset="1" stopColor="#8FA68A" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-bg)`} />
      <g opacity="0.5">
        <circle cx="60" cy="60" r="26" fill="#E8C77A" />
        <circle cx="340" cy="70" r="32" fill="#A8C0A2" />
        <circle cx="40" cy="220" r="22" fill="#D9B27A" />
        <circle cx="360" cy="200" r="28" fill="#9DB4A0" />
        <circle cx="110" cy="40" r="14" fill="#F0DC9A" />
        <circle cx="300" cy="240" r="18" fill="#C9A86A" />
        <circle cx="180" cy="50" r="12" fill="#B8C8A8" />
        <circle cx="240" cy="250" r="16" fill="#E8C77A" />
      </g>
      <circle cx="200" cy="140" r="42" fill="#3D3D3A" />
      <path d="M132 300 Q132 210 200 210 Q268 210 268 300 Z" fill="#3D3D3A" />
      <circle cx="200" cy="140" r="42" fill="none" stroke="#2A2A28" strokeWidth="1" />
    </>
  ),
  // 焦距：纵深透视街道（scale 裁切展示空间压缩）
  street: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CDD8DC" />
          <stop offset="1" stopColor="#EDEAE2" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <polygon points="0,300 0,90 200,150 200,300" fill="#6E6A60" />
      <polygon points="0,90 0,70 210,150 200,150" fill="#8A8578" />
      <polygon points="400,300 400,110 200,150 200,300" fill="#5E5A50" />
      <polygon points="400,110 400,90 190,150 200,150" fill="#7A7568" />
      <g fill="#3D3D3A" opacity="0.6">
        <rect x="30" y="120" width="20" height="28" />
        <rect x="70" y="130" width="18" height="26" />
        <rect x="30" y="180" width="20" height="28" />
        <rect x="70" y="185" width="18" height="26" />
        <rect x="350" y="135" width="18" height="26" />
        <rect x="310" y="125" width="20" height="28" />
        <rect x="350" y="185" width="18" height="26" />
      </g>
      <polygon points="150,300 250,300 200,150" fill="#4A4A45" />
      <polygon points="180,300 220,300 200,150" fill="#5A5A55" />
      <circle cx="200" cy="150" r="3" fill="#2A2A28" />
    </>
  ),
};

interface Props {
  variant: SceneVariant;
  alt: string;
  style?: CSSProperties;
  className?: string;
  ariaHidden?: boolean;
}

export function PhotoScene({ variant, alt, style, className = '', ariaHidden = false }: Props) {
  const uid = React.useId().replace(/:/g, '');
  return (
    <div className={className} style={style} aria-hidden={ariaHidden || undefined}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : alt}
        className="block w-full h-full"
      >
        {SCENES[variant](uid)}
      </svg>
    </div>
  );
}
