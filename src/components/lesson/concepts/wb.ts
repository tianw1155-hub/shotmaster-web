import type { ConceptConfig } from '../InteractiveLesson';
import { wbFilter } from '../../../lib/filters';

export const wbConfig: ConceptConfig = {
  key: 'wb', title: '白平衡', kicker: '第 4 课 · 色彩与色温',
  image: { src: 'https://images.unsplash.com/photo-1519331379826-f10be5486986?auto=format&fit=crop&w=900&q=80', alt: '白平衡示例' },
  param: { name: '色温', min: 2000, max: 10000, step: 100, unit: 'K', default: 5500 },
  filter: wbFilter,
  readout: (v) => ({ value: `${v}K`, label: '色温' }),
  target: 5500, hitTolerance: 300,
  captions: [
    { range: [2000, 4500], text: '暖偏黄 · 低色温，画面偏暖', level: 'under' },
    { range: [4500, 6500], text: '正常 · 日光平衡，色彩还原', level: 'ok' },
    { range: [6500, 10001], text: '冷偏蓝 · 高色温，画面偏冷', level: 'over' },
  ],
  hitToast: '命中日光色温 · 色彩还原准确',
  nextConcepts: ['iso', 'aperture'],
};
