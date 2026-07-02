import { Level, GalleryImage, Stars } from '../types';
import { mockGalleryImages, fixedLevelsConfig, randomConstraints } from './mockData';

// 章节信息
export const chapterInfo: Record<string, { label: string; color: string; icon: string }> = {
  composition: { label: '构图基础篇', color: 'sky', icon: '📐' },
  light: { label: '光线运用篇', color: 'sun', icon: '☀️' },
  color: { label: '色彩搭配篇', color: 'grape', icon: '🎨' },
  narrative: { label: '叙事技巧篇', color: 'primary', icon: '🎯' },
  master: { label: '综合大师篇', color: 'mint', icon: '🏆' },
};

// 计算关卡难度 (1-5)
function calculateDifficulty(levelId: number): number {
  if (levelId <= 10) return 1;        // 入门
  if (levelId <= 20) return 2;        // 基础
  if (levelId <= 30) return 3;        // 进阶
  if (levelId <= 40) return 4;        // 高级
  return 5;                           // 大师
}

// 计算通关所需分数 (60-85)
function calculatePassScore(levelId: number): number {
  return 60 + Math.floor((levelId - 1) / 10) * 5;
}

// 生成固定教学关卡（1-50关）
export function getFixedLevel(levelId: number, stars: Stars = 0, completed: boolean = false): Level {
  const config = fixedLevelsConfig[levelId - 1];
  if (!config) {
    // 超出范围，生成随机关卡
    return generateChallengeLevel(levelId, stars, completed);
  }
  const referenceImage = mockGalleryImages.find(img => img.id === config.imageId) || mockGalleryImages[0];

  return {
    id: levelId,
    chapter: config.chapter,
    title: config.title,
    referenceImage,
    difficulty: calculateDifficulty(levelId),
    passScore: calculatePassScore(levelId),
    constraints: config.constraints,
    stars,
    status: completed ? 'completed' : 'available',
    isFixed: true,
  };
}

// 生成随机挑战关卡（51关起，无限）
export function generateChallengeLevel(levelId: number, stars: Stars = 0, completed: boolean = false): Level {
  const randomImage = mockGalleryImages[Math.floor(Math.random() * mockGalleryImages.length)];
  const numConstraints = Math.min(4, Math.floor((levelId - 50) / 10) + 2);
  const constraints: string[] = [];
  const usedIndices = new Set<number>();

  while (constraints.length < numConstraints) {
    const idx = Math.floor(Math.random() * randomConstraints.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      constraints.push(randomConstraints[idx]);
    }
  }

  return {
    id: levelId,
    chapter: 'challenge',
    title: `挑战 #${levelId - 50}`,
    referenceImage: randomImage,
    difficulty: 5,
    passScore: 85,
    constraints,
    stars,
    status: completed ? 'completed' : 'available',
    isFixed: false,
  };
}

// 根据关卡ID获取关卡（统一入口）
export function getLevel(levelId: number, stars: Stars = 0, completed: boolean = false): Level {
  if (levelId >= 1 && levelId <= 50) {
    return getFixedLevel(levelId, stars, completed);
  }
  return generateChallengeLevel(levelId, stars, completed);
}

// 获取章节的关卡列表
export function getLevelsByChapter(chapter: string, completedLevels: number[], levelStars: Record<number, Stars>): Level[] {
  if (chapter === 'challenge') {
    const maxLevel = Math.max(50, ...completedLevels, 50);
    const levels: Level[] = [];
    for (let i = 51; i <= maxLevel + 1; i++) {
      const completed = completedLevels.includes(i);
      const stars = levelStars[i] || 0;
      levels.push(getLevel(i, stars, completed));
    }
    return levels;
  }

  // 固定章节
  return fixedLevelsConfig
    .map((config, idx) => ({ config, id: idx + 1 }))
    .filter(({ config }) => config.chapter === chapter)
    .map(({ id }) => {
      const completed = completedLevels.includes(id);
      const stars = levelStars[id] || 0;
      return getFixedLevel(id, stars, completed);
    });
}
