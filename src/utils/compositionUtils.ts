import { CompositionRule, GalleryImage, ImageCategory } from '../types';

export const compositionRuleLabels: Record<CompositionRule, string> = {
  rule_of_thirds: '三分法构图',
  symmetry: '对称构图',
  leading_lines: '引导线构图',
  framing: '框架构图',
  foreground: '前景构图',
  negative_space: '留白构图',
  golden_ratio: '黄金比例',
  diagonal: '对角线构图',
  minimalism: '极简构图',
  triangles: '三角形构图',
  none: '自由构图',
};

const tagToRule: Record<string, CompositionRule> = {
  '三分法': 'rule_of_thirds',
  '三分': 'rule_of_thirds',
  '对称': 'symmetry',
  '引导线': 'leading_lines',
  '框架': 'framing',
  '前景': 'foreground',
  '留白': 'negative_space',
  '极简': 'minimalism',
  '极简主义': 'minimalism',
  '黄金比例': 'golden_ratio',
  '对角线': 'diagonal',
  '三角形': 'triangles',
};

const categoryDefaultRules: Record<ImageCategory, CompositionRule[]> = {
  composition: ['rule_of_thirds', 'symmetry', 'leading_lines', 'framing', 'golden_ratio'],
  landscape: ['rule_of_thirds', 'leading_lines', 'foreground', 'golden_ratio'],
  portrait: ['rule_of_thirds', 'golden_ratio', 'negative_space', 'framing'],
  street: ['rule_of_thirds', 'leading_lines', 'framing', 'triangles'],
  still: ['rule_of_thirds', 'negative_space', 'framing', 'minimalism'],
  light: ['rule_of_thirds', 'negative_space', 'minimalism'],
  color: ['rule_of_thirds', 'negative_space', 'symmetry'],
};

export function inferCompositionRule(image: GalleryImage): CompositionRule {
  if (image.compositionRule) return image.compositionRule;

  for (const tag of image.tags) {
    const lowerTag = tag.toLowerCase();
    for (const [keyword, rule] of Object.entries(tagToRule)) {
      if (lowerTag.includes(keyword)) {
        return rule;
      }
    }
  }

  const defaultRules = categoryDefaultRules[image.category];
  if (defaultRules && defaultRules.length > 0) {
    const hash = image.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return defaultRules[hash % defaultRules.length];
  }

  return 'rule_of_thirds';
}
