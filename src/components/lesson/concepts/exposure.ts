import type { ConceptConfig } from '../InteractiveLesson';
import { exposureFilter } from '../../../lib/filters';

export const exposureConfig: ConceptConfig = {
  key: 'exposure',
  title: '曝光补偿',
  kicker: '第 3 课 · 曝光三要素',
  scene: 'landscape',
  alt: '日照风景',
  param: { name: '曝光补偿', min: -2, max: 2, step: 0.05, unit: 'EV', default: 0 },
  filter: exposureFilter,
  readout: (v) => ({ value: `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}`, label: 'EV' }),
  target: 0.7,
  hitTolerance: 0.22,
  captions: [
    { range: [-2, -1.2], text: '欠曝 · 暗部细节丢失，画面沉闷压抑', level: 'under' },
    { range: [-1.2, -0.4], text: '偏暗 · 氛围压低，可适当提亮', level: 'under' },
    { range: [-0.4, 0.4], text: '正常曝光 · 明暗平衡，层次丰富', level: 'ok' },
    { range: [0.4, 1.2], text: '偏亮 · 轻快通透，注意高光', level: 'ok' },
    { range: [1.2, 2], text: '过曝 · 高光溢出，层次丢失', level: 'over' },
  ],
  hitToast: '命中目标曝光 · 阴天氛围还原到位',
  nextConcepts: ['aperture', 'shutter', 'iso'],
};