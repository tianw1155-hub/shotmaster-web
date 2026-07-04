import type { ConceptConfig } from '../InteractiveLesson';
import { focalFilter } from '../../../lib/filters';

export const focalConfig: ConceptConfig = {
  key: 'focal', title: '焦距', kicker: '第 7 课 · 镜头语言',
  scene: 'street',
  alt: '纵深透视街道',
  param: { name: '焦距', min: 24, max: 200, step: 1, unit: 'mm', default: 50 },
  filter: focalFilter,
  readout: (v) => ({ value: `${v}mm`, label: '焦距' }),
  target: 50, hitTolerance: 15,
  captions: [
    { range: [24, 35], text: '广角 · 透视夸张，空间延展', level: 'under' },
    { range: [35, 85], text: '正常 · 接近人眼视角', level: 'ok' },
    { range: [85, 201], text: '长焦 · 空间压缩，背景放大', level: 'over' },
  ],
  hitToast: '命中标准焦距 · 接近人眼视角',
  nextConcepts: ['exposure', 'wb'],
};
