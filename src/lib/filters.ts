import type { CSSProperties } from 'react';

export type ParamMap = (value: number) => CSSProperties;

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
const fmt = (n: number) => `${+n.toFixed(3)}`;

// 曝光补偿 ev ∈ [-2, 2]
export const exposureFilter: ParamMap = (ev) => {
  const brightness = 1 + ev * 0.3;
  const saturate = Math.max(0.6, 1 - Math.abs(ev) * 0.06);
  return { filter: `brightness(${fmt(brightness)}) saturate(${fmt(saturate)})` };
};

// 白平衡 K ∈ [2000, 10000], default 5500
export const wbFilter: ParamMap = (K) => {
  const t = (K - 5500) / 4500;
  const sepia = Math.max(0, -t * 0.5);
  const hue = t * 50;
  const sat = 1 + Math.abs(t) * 0.15;
  return { filter: `sepia(${fmt(sepia)}) hue-rotate(${fmt(hue)}deg) saturate(${fmt(sat)})` };
};

// ISO ∈ [100, 6400], default 400
export const isoFilter: ParamMap = (iso) => {
  const t = (iso - 100) / 6300;
  const brightness = 1 + t * 0.35;
  const contrast = 1 - t * 0.12;
  return { filter: `brightness(${fmt(brightness)}) contrast(${fmt(contrast)})` };
};
// ISO 噪点 overlay opacity
export const isoOverlay = (iso: number): number => {
  const t = (iso - 100) / 6300;
  return +(t * 0.45).toFixed(3);
};

// 光圈 f ∈ [1.4, 16], default 5.6 — 背景 blur
export const apertureFilter: ParamMap = (f) => {
  const t = (16 - f) / (16 - 1.4);
  return { filter: `blur(${fmt(t * 8)}px)` };
};
// 光圈前景径向 mask 半径 %（大光圈=小清晰区）
export const apertureMask = (f: number): number => {
  const t = (16 - f) / (16 - 1.4);
  return Math.round(100 - t * 70);
};

// 焦距 mm ∈ [24, 200], default 50 — scale + crop
export const focalFilter: ParamMap = (mm) => {
  const t = (mm - 24) / 176;
  const scale = 1 + t * 0.8;
  return { transform: `scale(${fmt(scale)})` };
};
