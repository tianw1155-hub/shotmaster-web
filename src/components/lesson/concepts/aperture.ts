import type { ConceptConfig } from '../InteractiveLesson';
import { apertureFilter, apertureMask } from '../../../lib/filters';

export const apertureConfig: ConceptConfig = {
  key: 'aperture', title: '光圈 · 景深', kicker: '第 6 课 · 曝光三要素',
  image: { src: 'https://images.unsplash.com/photo-1504198266287-5f4a2f4a2f1f?auto=format&fit=crop&w=900&q=80', alt: '光圈示例' },
  param: { name: '光圈', min: 1.4, max: 16, step: 0.1, unit: 'f/', default: 5.6 },
  filter: apertureFilter,
  layers: { foregroundMask: apertureMask },
  readout: (v) => ({ value: `f/${v}`, label: '光圈' }),
  target: 2.8, hitTolerance: 0.6,
  captions: [
    { range: [1.4, 2.8], text: '浅景深 · 背景虚化，主体突出', level: 'ok' },
    { range: [2.8, 8], text: '正常 · 主体与背景都较清晰', level: 'ok' },
    { range: [8, 17], text: '深景深 · 全画面清晰', level: 'over' },
  ],
  hitToast: '命中大光圈 · 浅景深虚化到位',
  nextConcepts: ['focal', 'exposure'],
};
