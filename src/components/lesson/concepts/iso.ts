import type { ConceptConfig } from '../InteractiveLesson';
import { isoFilter, isoOverlay } from '../../../lib/filters';

export const isoConfig: ConceptConfig = {
  key: 'iso', title: 'ISO 感光度', kicker: '第 5 课 · 曝光三要素',
  scene: 'lowlight',
  alt: '昏黄街灯夜景',
  param: { name: 'ISO', min: 100, max: 6400, step: 50, unit: '', default: 400 },
  filter: isoFilter,
  overlay: (v) => { const o = isoOverlay(v); return o > 0 ? { opacity: o } : null; },
  readout: (v) => ({ value: `ISO ${v}`, label: '感光度' }),
  target: 400, hitTolerance: 150,
  captions: [
    { range: [100, 250], text: '低感光度 · 画质干净细腻', level: 'ok' },
    { range: [250, 1600], text: '正常 · 明暗与噪点平衡', level: 'ok' },
    { range: [1600, 6401], text: '高感光度 · 噪点增多，画质下降', level: 'over' },
  ],
  hitToast: '命中低感光度 · 画质最干净',
  nextConcepts: ['aperture', 'focal'],
};
