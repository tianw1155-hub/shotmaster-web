import { GalleryImage, ImageCategory, Difficulty, PhotoPreference, Chapter } from '../types';
import { aiService } from './aiService';

// 本地预存的每周挑战图（方案1：直接放仓库，由 Vercel CDN 加速）
// 命名：week-{N}.jpg，N 为 1..WEEKLY_CHALLENGE_IMAGES.length
// 每周由 ISO 周序号稳定轮换；新增图片只需往 public/images/challenges/ 加文件并改下面数组长度
const WEEKLY_CHALLENGE_IMAGES: { file: string; title: string; category: ImageCategory }[] = [
  { file: 'week-1.jpg', title: '三分法日落', category: 'composition' },
  { file: 'week-2.jpg', title: '对称大桥', category: 'composition' },
  { file: 'week-3.jpg', title: '林间小路', category: 'composition' },
  { file: 'week-4.jpg', title: '窗户框架', category: 'composition' },
];

const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
    links?: {
      html?: string;
    };
  };
  width: number;
  height: number;
  tags?: { title: string }[];
}

const categoryKeywords: Record<ImageCategory, string[]> = {
  composition: ['composition', 'architecture', 'minimal', 'lines', 'geometry'],
  light: ['light', 'sunset', 'golden hour', 'shadow', 'silhouette', 'lighting'],
  color: ['colorful', 'vibrant', 'pastel', 'color', 'gradient'],
  portrait: ['portrait', 'people', 'face', 'human'],
  landscape: ['landscape', 'nature', 'mountain', 'ocean', 'scenic'],
  still: ['still life', 'food', 'object', 'product'],
  street: ['street', 'urban', 'city', 'candid'],
};

const preferenceToCategory: Record<PhotoPreference, ImageCategory> = {
  landscape: 'landscape',
  portrait: 'portrait',
  street: 'street',
  still: 'still',
  architecture: 'composition',
  nature: 'landscape',
  travel: 'landscape',
  food: 'still',
};

const preferenceKeywords: Record<PhotoPreference, string[]> = {
  landscape: ['landscape', 'scenic', 'nature landscape'],
  portrait: ['portrait photography', 'people portrait', 'face'],
  street: ['street photography', 'urban street', 'city life'],
  still: ['still life', 'object photography', 'product'],
  architecture: ['architecture', 'building', 'modern architecture'],
  nature: ['nature', 'forest', 'wilderness'],
  travel: ['travel', 'wanderlust', 'adventure'],
  food: ['food photography', 'foodie', 'delicious'],
};

// 章节到图片类别和搜索关键词的映射
const chapterKeywords: Record<Chapter, { categories: ImageCategory[]; keywords: string[] }> = {
  composition: {
    categories: ['composition', 'landscape', 'still'],
    keywords: ['composition photography', 'rule of thirds', 'leading lines', 'symmetry', 'framing'],
  },
  light: {
    categories: ['light', 'landscape', 'portrait'],
    keywords: ['golden hour', 'dramatic lighting', 'sunset photography', 'silhouette', 'natural light'],
  },
  color: {
    categories: ['color', 'landscape', 'still'],
    keywords: ['vibrant colors', 'color photography', 'pastel colors', 'colorful landscape', 'moody colors'],
  },
  narrative: {
    categories: ['street', 'portrait', 'composition'],
    keywords: ['storytelling photography', 'candid moments', 'street life', 'documentary', 'emotional portrait'],
  },
  master: {
    categories: ['composition', 'light', 'color'],
    keywords: ['master photography', 'award winning', 'fine art', 'professional photography', 'editorial'],
  },
  challenge: {
    categories: ['composition', 'light', 'color', 'portrait', 'landscape', 'street', 'still'],
    keywords: ['photography challenge', 'creative photography', 'unique perspective', 'artistic'],
  },
};

export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 10,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<UnsplashPhoto[]> {
  if (!ACCESS_KEY) {
    console.warn('Unsplash Access Key 未配置，使用本地mock数据');
    return [];
  }

  try {
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=${orientation}&client_id=${ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API 错误: ${response.status}`);
    }

    const data = await response.json();
    return data.results as UnsplashPhoto[];
  } catch (error) {
    console.error('搜索 Unsplash 图片失败:', error);
    return [];
  }
}

export async function getPhoto(photoId: string): Promise<UnsplashPhoto | null> {
  if (!ACCESS_KEY) {
    console.warn('Unsplash Access Key 未配置');
    return null;
  }

  try {
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/photos/${photoId}?client_id=${ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API 错误: ${response.status}`);
    }

    return await response.json() as UnsplashPhoto;
  } catch (error) {
    console.error('获取 Unsplash 图片失败:', error);
    return null;
  }
}

export async function unsplashToGalleryImage(
  photo: UnsplashPhoto,
  category: ImageCategory,
  difficulty: Difficulty = 'intermediate'
): Promise<GalleryImage> {
  // 使用 AI 分析图片
  const analysis = await aiService.analyzeImage(photo.urls.regular, category);

  return {
    id: `unsplash_${photo.id}`,
    url: photo.urls.regular + '?w=800',
    title: analysis.title,
    category,
    difficulty: analysis.difficulty,
    tags: analysis.tags,
    author: photo.user.name,
    authorUrl: photo.user.links?.html || `https://unsplash.com/@${photo.user.username}`,
  };
}

function getDefaultTags(category: ImageCategory): string[] {
  const tagsMap: Record<ImageCategory, string[]> = {
    composition: ['构图', '建筑', '线条'],
    light: ['光线', '日落', '阴影'],
    color: ['色彩', '鲜艳', '色调'],
    portrait: ['人像', '人物', '表情'],
    landscape: ['风景', '自然', '山脉'],
    still: ['静物', '美食', '物品'],
    street: ['街拍', '城市', '人文'],
  };
  return tagsMap[category] || ['摄影', '作品', '艺术'];
}

const tagTranslations: Record<string, string> = {
  // 英文标签 -> 中文
  landscape: '风景', nature: '自然', mountain: '山脉', ocean: '海洋',
  sunset: '日落', sunrise: '日出', forest: '森林', sky: '天空',
  water: '水流', lake: '湖泊', river: '河流', beach: '海滩',
  portrait: '人像', person: '人物', people: '人物', face: '面部',
  woman: '女性', man: '男性', girl: '女孩', boy: '男孩',
  'street photography': '街拍', street: '街拍', urban: '城市', city: '城市',
  architecture: '建筑', building: '建筑', minimal: '极简', lines: '线条',
  geometry: '几何', composition: '构图', symmetry: '对称',
  light: '光线', lighting: '光影', shadow: '阴影', 'golden hour': '黄金时刻',
  silhouette: '剪影', sunlight: '阳光',
  color: '色彩', colorful: '鲜艳', vibrant: '活力', pastel: '柔和',
  gradient: '渐变',
  food: '美食', 'food photography': '美食', coffee: '咖啡',
  'still life': '静物', object: '物品', product: '产品',
  travel: '旅行', adventure: '探险', wanderlust: '漫游',
  'portrait photography': '人像摄影', candid: '抓拍', documentary: '纪实',
};

function translateTag(tag: string, category: ImageCategory): string {
  const lowerTag = tag.toLowerCase().trim();
  if (tagTranslations[lowerTag]) {
    return tagTranslations[lowerTag];
  }
  // 如果找不到翻译，返回类别对应的默认标签
  const defaults = getDefaultTags(category);
  return defaults[0] || '摄影';
}

const categoryTitles: Record<ImageCategory, string[]> = {
  landscape: ['山川湖海', '自然之美', '壮丽风光', '晨曦暮色', '山水画卷', '林海雪原', '海岸风光', '高山流水', '云霞满天', '静谧湖畔'],
  portrait: ['光影人像', '时光定格', '人物写真', '自然神态', '优雅瞬间', '青春影像', '人物故事', '眸中星辰', '温婉时光', '生动表情'],
  composition: ['几何之美', '线条艺术', '建筑光影', '极简构图', '对称美学', '空间层次', '结构之韵', '城市线条', '建筑韵律', '视角探索'],
  light: ['光影交织', '暮光时刻', '阳光斑驳', '光影魔术', '晨光熹微', '光影诗篇', '逆光之美', '柔和光线', '戏剧性光影', '光影剪影'],
  color: ['色彩斑斓', '光影色调', '缤纷世界', '色彩叙事', '柔和色调', '色彩碰撞', '暖调时光', '冷调静谧', '色彩层次', '色调美学'],
  street: ['街头掠影', '城市故事', '人间烟火', '街头瞬间', '都市光影', '街头人文', '城市节奏', '街角风景', '市井生活', '城市脉搏'],
  still: ['静物之美', '生活细节', '美食映像', '物品叙事', '静谧时光', '光影静物', '生活美学', '品质细节', '雅致生活', '食物摄影'],
};

let titleIndex = 0;

function generateChineseTitle(photo: UnsplashPhoto, category: ImageCategory): string {
  const titles = categoryTitles[category] || categoryTitles.landscape;
  // 使用 photo.id 来选择稳定的标题，而不是随机
  const hash = photo.id.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  const idx = Math.abs(hash) % titles.length;
  return titles[idx];
}

export async function fetchImagesByCategory(
  category: ImageCategory,
  count: number = 5
): Promise<GalleryImage[]> {
  const keywords = categoryKeywords[category] || [category];
  const query = keywords[Math.floor(Math.random() * keywords.length)];
  const photos = await searchPhotos(query, 1, count, 'landscape');

  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
  const galleryImages = await Promise.all(
    photos.map((photo, idx) =>
      unsplashToGalleryImage(
        photo,
        category,
        difficulties[Math.min(Math.floor(idx / 2), 2)]
      )
    )
  );
  return galleryImages;
}

export async function fetchImagesByPreferences(
  preferences: PhotoPreference[],
  perPreference: number = 3
): Promise<GalleryImage[]> {
  const allImages: GalleryImage[] = [];

  for (const pref of preferences.slice(0, 4)) {
    const category = preferenceToCategory[pref];
    const keywords = preferenceKeywords[pref] || [pref];
    const query = keywords[Math.floor(Math.random() * keywords.length)];

    const photos = await searchPhotos(query, 1, perPreference, 'landscape');
    const images = await Promise.all(
      photos.map((photo, idx) =>
        unsplashToGalleryImage(
          photo,
          category,
          idx === 0 ? 'beginner' : idx < 3 ? 'intermediate' : 'advanced'
        )
      )
    );
    allImages.push(...images);
  }

  return allImages;
}

export async function fetchRecommendedImages(
  preferences: PhotoPreference[],
  likedCategories: ImageCategory[],
  shootCategories: ImageCategory[],
  chapterProgress: Chapter[] = [],
  totalCount: number = 20
): Promise<GalleryImage[]> {
  const allImages: GalleryImage[] = [];
  const categoryCount: Record<string, number> = {};

  // 1. 偏好权重
  preferences.forEach(pref => {
    const cat = preferenceToCategory[pref];
    categoryCount[cat] = (categoryCount[cat] || 0) + 3;
  });

  // 2. 点赞类别权重
  likedCategories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 2;
  });

  // 3. 拍摄类别权重
  shootCategories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // 4. 章节学习进度权重（学习过的章节相关图片加权）
  chapterProgress.forEach(chapter => {
    const chapterInfo = chapterKeywords[chapter];
    if (chapterInfo) {
      chapterInfo.categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 2;
      });
    }
  });

  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 收集所有关键词用于搜索
  const allKeywords: string[] = [];

  // 从偏好收集
  preferences.slice(0, 3).forEach(pref => {
    const keywords = preferenceKeywords[pref];
    if (keywords) allKeywords.push(keywords[Math.floor(Math.random() * keywords.length)]);
  });

  // 从章节收集
  chapterProgress.slice(0, 2).forEach(chapter => {
    const chapterInfo = chapterKeywords[chapter];
    if (chapterInfo) {
      allKeywords.push(chapterInfo.keywords[Math.floor(Math.random() * chapterInfo.keywords.length)]);
    }
  });

  if (allKeywords.length === 0 && sortedCategories.length === 0) {
    // 如果没有任何偏好，使用默认类别
    const defaultCats: ImageCategory[] = ['landscape', 'portrait', 'composition', 'street'];
    defaultCats.forEach(cat => categoryCount[cat] = 1);
    sortedCategories.push(...defaultCats.map(c => [c, 1] as [string, number]));
  }

  const countPerCategory = Math.ceil(totalCount / Math.max(sortedCategories.length, 1));

  for (const [category] of sortedCategories) {
    const images = await fetchImagesByCategory(category as ImageCategory, countPerCategory);
    allImages.push(...images);
  }

  // 加入关键词搜索的图片（增加多样性）
  if (allKeywords.length > 0) {
    const keywordQuery = allKeywords.slice(0, 2).join(', ');
    const keywordPhotos = await searchPhotos(keywordQuery, 1, 5, 'landscape');
    const keywordImages = await Promise.all(
      keywordPhotos.map((photo, idx) => {
        const cat = sortedCategories[0]?.[0] as ImageCategory || 'landscape';
        return unsplashToGalleryImage(photo, cat, idx < 2 ? 'intermediate' : 'advanced');
      })
    );
    allImages.push(...keywordImages);
  }

  return allImages.slice(0, totalCount);
}

export function hasUnsplashAccess(): boolean {
  return !!ACCESS_KEY;
}

// 计算 ISO 周序号（返回 0-51），用于稳定地按周选择默认挑战图片
function getWeekIndex(date: Date = new Date()): number {
  const target = new Date(date.valueOf());
  target.setHours(0, 0, 0, 0);
  // ISO 周：周四为该周「年」的判定日
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

// 从本地 week-N.jpg 列表中按周稳定挑选一张
function pickWeeklyFallback(weekIndex: number): GalleryImage | null {
  if (WEEKLY_CHALLENGE_IMAGES.length === 0) return null;
  const idx = ((weekIndex % WEEKLY_CHALLENGE_IMAGES.length) + WEEKLY_CHALLENGE_IMAGES.length) % WEEKLY_CHALLENGE_IMAGES.length;
  const item = WEEKLY_CHALLENGE_IMAGES[idx];
  return {
    id: `weekly_challenge_${idx + 1}`,
    url: `/images/challenges/${item.file}`,
    title: item.title,
    category: item.category,
    difficulty: 'intermediate',
    tags: ['本周挑战'],
    author: '',
    authorUrl: '',
  };
}

// 获取本周挑战图片（每周一凌晨1点更新）
export async function fetchWeeklyChallengeImage(): Promise<GalleryImage | null> {
  // 无 Unsplash 配置时直接用内置本地图按周轮换
  if (!ACCESS_KEY) {
    return pickWeeklyFallback(getWeekIndex());
  }

  // 随机选择一个类别
  const categories: ImageCategory[] = ['landscape', 'portrait', 'street', 'composition', 'still'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  // 搜索高质量图片
  const keywords = categoryKeywords[category] || [category];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  // 随机选择图片方向
  const orientations: ('landscape' | 'portrait' | 'squarish')[] = ['landscape', 'portrait', 'squarish'];
  const orientation = orientations[Math.floor(Math.random() * orientations.length)];

  try {
    const photos = await searchPhotos(keyword, 1, 5, orientation);
    if (photos.length === 0) {
      return pickWeeklyFallback(getWeekIndex());
    }

    // 随机选择一张
    const photo = photos[Math.floor(Math.random() * photos.length)];
    return await unsplashToGalleryImage(photo, category, 'intermediate');
  } catch (e) {
    console.error('Failed to fetch weekly challenge image:', e);
    return pickWeeklyFallback(getWeekIndex());
  }
}

// 检查是否需要更新本周挑战（每周一凌晨1点）
export function shouldRefreshWeeklyChallenge(lastRefresh: string | null): boolean {
  if (!lastRefresh) return true;

  const lastDate = new Date(lastRefresh);
  const now = new Date();

  // 获取最近周一凌晨1点
  const dayOfWeek = now.getDay(); // 0 = 周日, 1 = 周一
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysSinceMonday);
  thisMonday.setHours(1, 0, 0, 0); // 凌晨1点

  // 如果当前时间在本周一凌晨1点之后，且上次更新时间在本周一之前
  if (now >= thisMonday && lastDate < thisMonday) {
    return true;
  }

  return false;
}
