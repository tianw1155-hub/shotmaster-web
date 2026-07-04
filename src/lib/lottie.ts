interface LottieShapeLayer {
  ty: 4; nm: string; sr: 1;
  ks: { o: { a: number; k: any[] }; p: { a: number; k: any[] }; s: { a: number; k: number[] } };
  shapes: any[]; ip: number; op: number; st: number; bm: number;
}
interface LottieData { v: string; fr: number; ip: number; op: number; w: number; h: number; layers: LottieShapeLayer[]; }

const COLORS = [
  [0.7, 0.29, 0.23, 1],   // 朱
  [0.6, 0.47, 0.24, 1],   // 金
  [0.1, 0.1, 0.1, 1],     // 墨
  [0.42, 0.56, 0.5, 1],   // 鼠尾草
  [0.37, 0.48, 0.63, 1],  // 石板
];

export function createConfettiData(count = 30, w = 400, h = 400): LottieData {
  const fr = 60; const duration = 90; // 1.5s
  const layers: LottieShapeLayer[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * w);
    const size = 8 + Math.round(Math.random() * 12);
    const color = COLORS[i % COLORS.length];
    const delay = Math.round(Math.random() * 20);
    const drift = Math.round((Math.random() - 0.5) * 120);
    const endX = x + drift;
    layers.push({
      ty: 4, nm: `p${i}`, sr: 1,
      ks: {
        o: { a: 1, k: [{ t: delay, s: [100], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: delay + 50, s: [0] }] },
        p: { a: 1, k: [{ t: delay, s: [x, -20, 0], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, to: [drift / 3, h / 3, 0], ti: [-drift / 3, -h / 3, 0] }, { t: delay + 60, s: [endX, h + 20, 0] }] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [size, size] } },
        { ty: 'fl', c: { a: 0, k: color } },
      ],
      ip: delay, op: delay + 60, st: 0, bm: 0,
    });
  }
  return { v: '5.7.4', fr, ip: 0, op: duration, w, h, layers };
}
