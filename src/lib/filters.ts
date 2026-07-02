export type ParamMap = (value: number) => string;

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// 曝光补偿 ev ∈ [-2, 2]：亮度线性，极端处略降饱和度
export const exposureFilter: ParamMap = (ev) => {
  const brightness = 1 + ev * 0.3;
  const saturate = Math.max(0.6, 1 - Math.abs(ev) * 0.06);
  const fmt = (n: number) => `${+n.toFixed(3)}`;
  return `brightness(${fmt(brightness)}) saturate(${fmt(saturate)})`;
};
