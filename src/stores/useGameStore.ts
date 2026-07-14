import { create } from 'zustand';
import { Level, Score, ShootingPlan, GameUser, Achievement, Stars, GalleryImage, PhotoPreference, ImageCategory, Chapter, ShootingPlanDimension, DimensionFeedback, Difficulty } from '../types';
import { mockGalleryImages, mockCourses, mockAchievements, mockCommunityWorks } from '../services/mockData';
import type { CommunityWork } from '../types';
import { getLevel } from '../services/levelService';
import { aiService } from '../services/aiService';
import { syncUserData, syncFeedbacks, syncScoreFeedbacks, toggleUserFollow, userRegister, userLogin, getWeeklyChallenge } from '../services/apiService';
import { fetchRecommendedImages, hasUnsplashAccess } from '../services/unsplashService';

// 默认 Unsplash 图片（当未配置 API key 时使用）- 共50张
const defaultUnsplashImages: GalleryImage[] = [
  { id: 'unsplash_default_1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: '壮阔山景', category: 'landscape', difficulty: 'intermediate', tags: ['山脉', '日出', '自然'], author: 'Samuel Ferrara', authorUrl: 'https://unsplash.com/@samferrara' },
  { id: 'unsplash_default_2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', title: '林间晨光', category: 'landscape', difficulty: 'beginner', tags: ['森林', '光线', '自然'], author: 'David Marcu', authorUrl: 'https://unsplash.com/@davidmarcu' },
  { id: 'unsplash_default_3', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', title: '森林小径', category: 'landscape', difficulty: 'beginner', tags: ['森林', '小路', '自然'], author: 'Lukasz Szmigiel', authorUrl: 'https://unsplash.com/@szmigieldesign' },
  { id: 'unsplash_default_4', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800', title: '瀑布风光', category: 'landscape', difficulty: 'intermediate', tags: ['瀑布', '水流', '自然'], author: 'Robert Lukeman', authorUrl: 'https://unsplash.com/@robertlukeman' },
  { id: 'unsplash_default_5', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', title: '雾中山峰', category: 'landscape', difficulty: 'advanced', tags: ['山峰', '雾气', '自然'], author: 'Valentin Salja', authorUrl: 'https://unsplash.com/@valentinsalja' },
  { id: 'unsplash_default_6', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', title: '湖光山色', category: 'landscape', difficulty: 'beginner', tags: ['湖泊', '倒影', '风景'], author: 'Luca Bravo', authorUrl: 'https://unsplash.com/@lucabravo' },
  { id: 'unsplash_default_7', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', title: '海边日落', category: 'landscape', difficulty: 'intermediate', tags: ['大海', '日落', '天空'], author: 'S Migaj', authorUrl: 'https://unsplash.com/@simonmigaj' },
  { id: 'unsplash_default_8', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', title: '草原骏马', category: 'landscape', difficulty: 'intermediate', tags: ['草原', '动物', '自然'], author: 'Silas Baisch', authorUrl: 'https://unsplash.com/@silasbaisch' },
  { id: 'unsplash_default_9', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800', title: '夜空星河', category: 'landscape', difficulty: 'advanced', tags: ['星空', '夜景', '银河'], author: 'Randy Cao', authorUrl: 'https://unsplash.com/@randycao' },
  { id: 'unsplash_default_10', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', title: '海边悬崖', category: 'landscape', difficulty: 'intermediate', tags: ['海边', '悬崖', '风景'], author: 'Luca Bravo', authorUrl: 'https://unsplash.com/@lucabravo' },
  { id: 'unsplash_default_11', url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800', title: '雪山云海', category: 'landscape', difficulty: 'advanced', tags: ['雪山', '云海', '日出'], author: 'Kalen Emsley', authorUrl: 'https://unsplash.com/@kalenemsley' },
  { id: 'unsplash_default_12', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', title: '俯瞰大地', category: 'landscape', difficulty: 'advanced', tags: ['航拍', '山川', '风景'], author: 'NASA', authorUrl: 'https://unsplash.com/@nasa' },
  { id: 'unsplash_default_13', url: 'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=800', title: '静谧湖泊', category: 'landscape', difficulty: 'beginner', tags: ['湖泊', '倒影', '自然'], author: 'Todd Quackenbush', authorUrl: 'https://unsplash.com/@toddquackenbush' },
  { id: 'unsplash_default_14', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', title: '山谷秋色', category: 'landscape', difficulty: 'intermediate', tags: ['山谷', '秋天', '自然'], author: 'Jeff Scheid', authorUrl: 'https://unsplash.com/@jeffscheid' },
  { id: 'unsplash_default_15', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', title: '阳光森林', category: 'landscape', difficulty: 'beginner', tags: ['森林', '阳光', '自然'], author: 'Sergei Akulich', authorUrl: 'https://unsplash.com/@sabakrc' },
  { id: 'unsplash_default_16', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', title: '人像写真', category: 'portrait', difficulty: 'intermediate', tags: ['人像', '女性', '自然光'], author: 'Michael Dam', authorUrl: 'https://unsplash.com/@michaeldam' },
  { id: 'unsplash_default_17', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', title: '人物肖像', category: 'portrait', difficulty: 'beginner', tags: ['人像', '男性', '肖像'], author: 'Joseph Gonzalez', authorUrl: 'https://unsplash.com/@miracletwentyone' },
  { id: 'unsplash_default_18', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', title: '时尚人像', category: 'portrait', difficulty: 'advanced', tags: ['人像', '时尚', '妆容'], author: 'Beholder', authorUrl: 'https://unsplash.com/@beholdr' },
  { id: 'unsplash_default_19', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800', title: '自然光人像', category: 'portrait', difficulty: 'beginner', tags: ['人像', '自然光', '室内'], author: 'Emma', authorUrl: 'https://unsplash.com/@emmapointner' },
  { id: 'unsplash_default_20', url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', title: '温暖微笑', category: 'portrait', difficulty: 'intermediate', tags: ['人像', '微笑', '女性'], author: 'Allen Cook', authorUrl: 'https://unsplash.com/@allencook' },
  { id: 'unsplash_default_21', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', title: '侧颜光影', category: 'portrait', difficulty: 'advanced', tags: ['人像', '侧光', '女性'], author: 'Candice Picard', authorUrl: 'https://unsplash.com/@candicepicard' },
  { id: 'unsplash_default_22', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', title: '肖像特写', category: 'portrait', difficulty: 'intermediate', tags: ['人像', '特写', '男性'], author: 'Ayo Ogunseinde', authorUrl: 'https://unsplash.com/@armedshutter' },
  { id: 'unsplash_default_23', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', title: '光影面庞', category: 'portrait', difficulty: 'advanced', tags: ['人像', '光影', '女性'], author: 'Natalia Figueredo', authorUrl: 'https://unsplash.com/@nataliafigueredo' },
  { id: 'unsplash_default_24', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', title: '优雅身姿', category: 'portrait', difficulty: 'beginner', tags: ['人像', '优雅', '女性'], author: 'Laurentiu Morariu', authorUrl: 'https://unsplash.com/@laurentium' },
  { id: 'unsplash_default_25', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800', title: '户外人像', category: 'portrait', difficulty: 'intermediate', tags: ['人像', '户外', '自然'], author: 'Ethan Haddox', authorUrl: 'https://unsplash.com/@ethanhaddox' },
  { id: 'unsplash_default_26', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', title: '城市夜景', category: 'street', difficulty: 'intermediate', tags: ['城市', '夜景', '灯光'], author: 'Roberto Nickson', authorUrl: 'https://unsplash.com/@rpnickson' },
  { id: 'unsplash_default_27', url: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=800', title: '街头人像', category: 'street', difficulty: 'beginner', tags: ['街头', '人文', '城市'], author: 'Alex Shaw', authorUrl: 'https://unsplash.com/@alexshawphoto' },
  { id: 'unsplash_default_28', url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800', title: '东京街头', category: 'street', difficulty: 'intermediate', tags: ['街头', '日本', '城市'], author: 'Jezael Melgoza', authorUrl: 'https://unsplash.com/@jezael_' },
  { id: 'unsplash_default_29', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', title: '城市天际线', category: 'street', difficulty: 'advanced', tags: ['城市', '天际线', '建筑'], author: 'Daniel von Appen', authorUrl: 'https://unsplash.com/@danielvonappen' },
  { id: 'unsplash_default_30', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800', title: '街头咖啡', category: 'street', difficulty: 'beginner', tags: ['街头', '咖啡', '生活'], author: 'Clay Banks', authorUrl: 'https://unsplash.com/@claybanks' },
  { id: 'unsplash_default_31', url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800', title: '都市夜色', category: 'street', difficulty: 'intermediate', tags: ['城市', '夜景', '街拍'], author: 'Anthony DELANOIX', authorUrl: 'https://unsplash.com/@anthonydelanoix' },
  { id: 'unsplash_default_32', url: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800', title: '街头光影', category: 'street', difficulty: 'advanced', tags: ['街头', '光影', '城市'], author: 'Ryoji Iwata', authorUrl: 'https://unsplash.com/@ryoji__iwata' },
  { id: 'unsplash_default_33', url: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800', title: '雨天街景', category: 'street', difficulty: 'intermediate', tags: ['街头', '雨天', '城市'], author: 'Ifeoluwa Akinwale', authorUrl: 'https://unsplash.com/@ifeoluwato' },
  { id: 'unsplash_default_34', url: 'https://images.unsplash.com/photo-1519575762497-2f9a6fd6b8f1?w=800', title: '街角风景', category: 'street', difficulty: 'beginner', tags: ['街头', '建筑', '城市'], author: 'Heather Morse', authorUrl: 'https://unsplash.com/@heatherm' },
  { id: 'unsplash_default_35', url: 'https://images.unsplash.com/photo-1473950425543-a6cbd42e6682?w=800', title: '人来人往', category: 'street', difficulty: 'intermediate', tags: ['街头', '人群', '城市'], author: 'Andre Benz', authorUrl: 'https://unsplash.com/@traget' },
  { id: 'unsplash_default_36', url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', title: '咖啡时光', category: 'still', difficulty: 'beginner', tags: ['静物', '咖啡', '生活'], author: 'Nathan Dumlao', authorUrl: 'https://unsplash.com/@nate_dumlao' },
  { id: 'unsplash_default_37', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', title: '美食摄影', category: 'still', difficulty: 'intermediate', tags: ['美食', '静物', '摄影'], author: 'Eiliv Sonas', authorUrl: 'https://unsplash.com/@acerutti' },
  { id: 'unsplash_default_38', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', title: '香浓咖啡', category: 'still', difficulty: 'beginner', tags: ['咖啡', '静物', '饮品'], author: 'Chelsea Shapouri', authorUrl: 'https://unsplash.com/@chelseap' },
  { id: 'unsplash_default_39', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800', title: '水果拼盘', category: 'still', difficulty: 'intermediate', tags: ['水果', '静物', '美食'], author: 'Brenda Godinez', authorUrl: 'https://unsplash.com/@bregods' },
  { id: 'unsplash_default_40', url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800', title: '面包烘焙', category: 'still', difficulty: 'beginner', tags: ['面包', '烘焙', '美食'], author: 'Priscilla Du Preez', authorUrl: 'https://unsplash.com/@priscilladupreez' },
  { id: 'unsplash_default_41', url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', title: '花卉静物', category: 'still', difficulty: 'advanced', tags: ['花卉', '静物', '艺术'], author: 'Brigitte Tohm', authorUrl: 'https://unsplash.com/@brigittetohm' },
  { id: 'unsplash_default_42', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', title: '桌面摆件', category: 'still', difficulty: 'intermediate', tags: ['桌面', '静物', '生活'], author: 'Dominik Martin', authorUrl: 'https://unsplash.com/@dominik_photography' },
  { id: 'unsplash_default_43', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800', title: '美酒佳肴', category: 'still', difficulty: 'advanced', tags: ['美食', '红酒', '静物'], author: 'Sven Scheuermeier', authorUrl: 'https://unsplash.com/@svens' },
  { id: 'unsplash_default_44', url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800', title: '极简静物', category: 'still', difficulty: 'beginner', tags: ['极简', '静物', '风格'], author: 'Kari Shea', authorUrl: 'https://unsplash.com/@karishea' },
  { id: 'unsplash_default_45', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800', title: '蔬菜美食', category: 'still', difficulty: 'intermediate', tags: ['蔬菜', '健康', '美食'], author: 'Thomas Martinsen', authorUrl: 'https://unsplash.com/@tomasmartinsen' },
  { id: 'unsplash_default_46', url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800', title: '建筑线条', category: 'composition', difficulty: 'intermediate', tags: ['建筑', '线条', '构图'], author: 'Patrick Tomasso', authorUrl: 'https://unsplash.com/@impatrickt' },
  { id: 'unsplash_default_47', url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800', title: '几何建筑', category: 'composition', difficulty: 'advanced', tags: ['几何', '建筑', '极简'], author: 'Chris Barbalis', authorUrl: 'https://unsplash.com/@cbarbalis' },
  { id: 'unsplash_default_48', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800', title: '对称美学', category: 'composition', difficulty: 'beginner', tags: ['对称', '建筑', '构图'], author: 'Robert Lukeman', authorUrl: 'https://unsplash.com/@robertlukeman' },
  { id: 'unsplash_default_49', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', title: '极简构图', category: 'composition', difficulty: 'intermediate', tags: ['极简', '建筑', '线条'], author: 'Vadim Sherbakov', authorUrl: 'https://unsplash.com/@flomotion' },
  { id: 'unsplash_default_50', url: 'https://images.unsplash.com/photo-1470717279721-04a33d9e396b?w=800', title: '空间层次', category: 'composition', difficulty: 'advanced', tags: ['空间', '层次', '建筑'], author: 'Julian Bialowas', authorUrl: 'https://unsplash.com/@julianbialowas' },
];

const XP_PER_LEVEL = 500;

interface GameState {
  // 用户数据
  user: GameUser;
  updateUser: (updates: Partial<GameUser>) => void;

  // 认证
  login: (username: string) => void;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginAsGuest: () => void;
  logout: () => void;
  setPreferences: (preferences: PhotoPreference[]) => void;
  completeOnboarding: () => void;

  // 关卡
  currentLevelId: number;
  maxUnlockedLevel: number;
  levels: Level[];
  currentLevel: Level | null;
  setCurrentLevel: (level: Level) => void;
  loadLevel: (levelId: number) => void;

  // AI 拍摄计划
  shootingPlan: ShootingPlan | null;
  isAnalyzing: boolean;
  generateShootingPlan: (imageUrl: string) => Promise<void>;

  // 拍摄
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;

  // 评分
  score: Score | null;
  lastScore: Score | null; // 最后一次评分结果，用于关卡详情页展示
  lastScoreLevelId: number | null; // 最后评分的关卡ID
  lastCapturedImage: string | null; // 最后提交的作品图片
  isScoring: boolean;
  compareImages: (referenceUrl: string, userImageUrl: string, levelId: number) => Promise<void>;
  clearLastScore: () => void; // 清除最后评分记录
  clearScore: () => void; // 清除当前评分

  // 本周挑战图片
  weeklyChallengeImage: string;
  weeklyChallengeInfo: GalleryImage | null;
  lastWeeklyRefresh: string | null;
  setWeeklyChallengeImage: (url: string) => void;
  refreshWeeklyChallenge: () => Promise<void>;

  // 通关
  completeLevel: (levelId: number, stars: Stars, score: number) => void;
  checkAchievements: () => string[];

  // 课程
  completeCourse: (courseId: string) => void;

  // 图库
  galleryImages: typeof mockGalleryImages;
  customGalleryImages: GalleryImage[];
  unsplashImages: GalleryImage[];
  isLoadingUnsplash: boolean;
  lastUnsplashRefresh: string | null;
  addCustomGalleryImage: (image: GalleryImage) => void;
  removeCustomGalleryImage: (imageId: string) => void;
  toggleFavoriteImage: (imageId: string, category: ImageCategory) => void;
  toggleDislikeImage: (imageId: string, category: ImageCategory) => void;
  isFavoriteImage: (imageId: string) => boolean;
  isDislikedImage: (imageId: string) => boolean;
  recordImageView: (imageId: string, category: ImageCategory) => void;
  recordShootCategory: (category: ImageCategory) => void;
  getRecommendedImages: () => GalleryImage[];
  getAllGalleryImages: () => GalleryImage[];
  refreshUnsplashImages: () => Promise<void>;
  shouldRefreshUnsplash: () => boolean;

  // 拍摄计划反馈
  toggleLikeDimension: (imageId: string, dimension: ShootingPlanDimension, imageInfo?: { imageUrl?: string; imageTitle?: string; category?: string }) => void;
  toggleDislikeDimension: (imageId: string, dimension: ShootingPlanDimension, imageInfo?: { imageUrl?: string; imageTitle?: string; category?: string }) => void;
  getDimensionFeedback: (imageId: string, dimension: ShootingPlanDimension) => { liked: boolean; disliked: boolean };

  // 评分建议反馈
  toggleLikeSuggestion: (scoreId: string, suggestionKey: string, suggestionInfo?: { title?: string; dimension?: string }) => void;
  toggleDislikeSuggestion: (scoreId: string, suggestionKey: string, suggestionInfo?: { title?: string; dimension?: string }) => void;
  getSuggestionFeedback: (scoreId: string, suggestionKey: string) => { liked: boolean; disliked: boolean };
  toggleLikeFeedback: (scoreId: string, feedbackIndex: number) => void;
  toggleDislikeFeedback: (scoreId: string, feedbackIndex: number) => void;
  getFeedbackItemFeedback: (scoreId: string, feedbackIndex: number) => { liked: boolean; disliked: boolean };

  // 课程
  courses: typeof mockCourses;

  // 社区
  communityWorks: CommunityWork[];
  addCommunityWork: (work: CommunityWork) => void;
  removeCommunityWork: (workId: string) => void;
  voteWork: (workId: string) => void;
  isVoted: (workId: string) => boolean;
  toggleFavoriteWork: (workId: string) => void;
  isFavoriteWork: (workId: string) => boolean;

  // 关注
  toggleFollow: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// 根据已完成关卡计算章节学习进度
function calculateChapterProgress(completedLevels: number[]): Chapter[] {
  const chapters: Chapter[] = [];
  const chapterRanges: Record<Chapter, [number, number]> = {
    composition: [1, 10],
    light: [11, 20],
    color: [21, 30],
    narrative: [31, 40],
    master: [41, 50],
    challenge: [51, 9999],
  };

  for (const [chapter, [start, end]] of Object.entries(chapterRanges)) {
    const completedInChapter = completedLevels.filter(l => l >= start && l <= end).length;
    const totalInChapter = chapter === 'challenge' ? 10 : Math.min(end, 50) - start + 1;
    if (completedInChapter >= Math.ceil(totalInChapter * 0.3)) {
      chapters.push(chapter as Chapter);
    }
  }

  return chapters;
}

function getUserStorageKey(userId: string): string {
  return `shotmaster_user_${userId}`;
}

function loadUserFromStorage(userId?: string): GameUser | null {
  try {
    // 如果提供了用户ID，使用用户特定的存储
    if (userId) {
      const stored = localStorage.getItem(getUserStorageKey(userId));
      if (stored) return JSON.parse(stored);
    }
    // 否则尝试加载当前用户
    const stored = localStorage.getItem('shotmaster_user');
    if (stored) return JSON.parse(stored);
    // 尝试从用户列表中加载
    const currentUserId = localStorage.getItem('shotmaster_current_user_id');
    if (currentUserId) {
      const userStored = localStorage.getItem(getUserStorageKey(currentUserId));
      if (userStored) return JSON.parse(userStored);
    }
  } catch {}
  return null;
}

let syncTimer: number | null = null;
let feedbackSyncTimer: number | null = null;

function saveUserToStorage(user: GameUser) {
  try {
    // 保存到用户特定的存储
    localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(user));
    // 同时保存当前用户ID
    localStorage.setItem('shotmaster_current_user_id', user.id);
    // 保持向后兼容
    localStorage.setItem('shotmaster_user', JSON.stringify(user));

    // 防抖同步到后端
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    syncTimer = window.setTimeout(() => {
      if (!user.isGuest) {
        syncUserData({
          userId: user.id,
          username: user.name,
          phone: user.phone,
          avatar: user.avatar,
          level: user.level,
          xp: user.xp,
          xpToNext: user.xpToNext,
          streak: user.streak,
          maxStreak: user.maxStreak,
          totalStars: user.totalStars,
          worksCount: user.worksCount,
          avgScore: user.averageScore,
          isLoggedIn: user.isLoggedIn,
          isGuest: user.isGuest,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          preferences: user.preferences as string[],
        });
      }
    }, 2000);
  } catch {}
}

// 同步反馈数据到后端
function syncFeedbacksToBackend(user: GameUser) {
  if (user.isGuest || !user.shootingPlanFeedbacks) return;

  if (feedbackSyncTimer) {
    clearTimeout(feedbackSyncTimer);
  }
  feedbackSyncTimer = window.setTimeout(() => {
    const allFeedbacks: Array<{
      imageId: string;
      imageUrl: string;
      imageTitle: string;
      category: string;
      dimension: string;
      liked: boolean;
      disliked: boolean;
      updatedAt: string;
    }> = [];

    for (const fb of user.shootingPlanFeedbacks) {
      for (const dim of fb.dimensions || []) {
        allFeedbacks.push({
          imageId: fb.imageId,
          imageUrl: fb.imageUrl || '',
          imageTitle: fb.imageTitle || '',
          category: fb.category || '',
          dimension: dim.dimension,
          liked: dim.liked,
          disliked: dim.disliked,
          updatedAt: fb.updatedAt || fb.createdAt,
        });
      }
    }

    if (allFeedbacks.length > 0) {
      syncFeedbacks(user.id, allFeedbacks);
    }
  }, 3000);
}

// 同步评分建议反馈到后端
let scoreFeedbackSyncTimer: number | undefined;
function syncScoreFeedbacksToBackend(user: GameUser) {
  if (user.isGuest || !user.scoreFeedbacks) return;

  if (scoreFeedbackSyncTimer) {
    clearTimeout(scoreFeedbackSyncTimer);
  }
  scoreFeedbackSyncTimer = window.setTimeout(() => {
    const allScoreFeedbacks: Array<{
      scoreId: string;
      suggestionKey: string;
      title: string;
      dimension: string;
      liked: boolean;
      disliked: boolean;
      updatedAt: string;
    }> = [];

    for (const fb of user.scoreFeedbacks) {
      for (const sugg of fb.suggestionFeedbacks || []) {
        if (sugg.liked || sugg.disliked) {
          allScoreFeedbacks.push({
            scoreId: fb.scoreId,
            suggestionKey: sugg.suggestionKey,
            title: sugg.title || '',
            dimension: sugg.dimension || '',
            liked: sugg.liked,
            disliked: sugg.disliked,
            updatedAt: fb.updatedAt || fb.createdAt,
          });
        }
      }
    }

    if (allScoreFeedbacks.length > 0) {
      syncScoreFeedbacks(user.id, allScoreFeedbacks);
    }
  }, 3000);
}

function loadCustomImagesFromStorage(): GalleryImage[] {
  try {
    // 使用当前用户ID加载用户特定的图片
    const currentUserId = localStorage.getItem('shotmaster_current_user_id');
    const key = currentUserId ? `shotmaster_custom_images_${currentUserId}` : 'shotmaster_custom_images';
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveCustomImagesToStorage(images: GalleryImage[]) {
  try {
    const currentUserId = localStorage.getItem('shotmaster_current_user_id');
    const key = currentUserId ? `shotmaster_custom_images_${currentUserId}` : 'shotmaster_custom_images';
    localStorage.setItem(key, JSON.stringify(images));
  } catch {}
}

function loadUnsplashImagesFromStorage(): { images: GalleryImage[]; lastRefresh: string | null } {
  try {
    // 使用当前用户ID加载用户特定的图片
    const currentUserId = localStorage.getItem('shotmaster_current_user_id');
    const key = currentUserId ? `shotmaster_unsplash_images_${currentUserId}` : 'shotmaster_unsplash_images';
    const refreshKey = currentUserId ? `shotmaster_unsplash_last_refresh_${currentUserId}` : 'shotmaster_unsplash_last_refresh';
    const stored = localStorage.getItem(key);
    const lastRefresh = localStorage.getItem(refreshKey);
    if (stored) {
      return { images: JSON.parse(stored), lastRefresh };
    }
  } catch {}
  return { images: [], lastRefresh: null };
}

function saveUnsplashImagesToStorage(images: GalleryImage[], lastRefresh: string) {
  try {
    const currentUserId = localStorage.getItem('shotmaster_current_user_id');
    const key = currentUserId ? `shotmaster_unsplash_images_${currentUserId}` : 'shotmaster_unsplash_images';
    const refreshKey = currentUserId ? `shotmaster_unsplash_last_refresh_${currentUserId}` : 'shotmaster_unsplash_last_refresh';
    localStorage.setItem(key, JSON.stringify(images));
    localStorage.setItem(refreshKey, lastRefresh);
  } catch {}
}

function getStoredUsers(): (GameUser & { password: string })[] {
  try {
    const stored = localStorage.getItem('shotmaster_users');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function validatePassword(password: string): { valid: boolean; message: string; strength: number } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度不能少于8位', strength: 0 };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母', strength: 1 };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含数字', strength: 2 };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含特殊符号（如 !@#$%^&* 等）', strength: 3 };
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const strength = hasLower && hasUpper ? 5 : 4;
  return { valid: true, message: '密码符合要求', strength };
}

const defaultUser: GameUser = loadUserFromStorage() || {
  id: '1',
  name: '摄影新手',
  avatar: '摄',
  level: 1,
  xp: 0,
  xpToNext: XP_PER_LEVEL,
  streak: 0,
  maxStreak: 0,
  totalStars: 0,
  worksCount: 0,
  averageScore: 0,
  achievements: mockAchievements,
  completedLevels: [],
  levelStars: {},
  followers: 0,
  following: [],
  votedWorks: [],
  isLoggedIn: false,
  isGuest: false,
  preferences: [],
  hasCompletedOnboarding: false,
  hasSetNickname: false,
  phone: '',
  favoriteImageIds: [],
  favoriteWorkIds: [],
  imageInteractions: [],
  shootCategories: [],
  shootingPlanFeedbacks: [],
  scoreFeedbacks: [],
};

// 加载本周挑战图片（用户独立）
let initialWeeklyChallengeImage = mockGalleryImages[0]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
let initialWeeklyChallengeInfo: GalleryImage | null = null;
let initialLastWeeklyRefresh: string | null = null;
try {
  const currentUserId = localStorage.getItem('shotmaster_current_user_id');
  const storedRefresh = localStorage.getItem(currentUserId ? `lastWeeklyRefresh_${currentUserId}` : 'lastWeeklyRefresh');
  const storedInfo = localStorage.getItem(currentUserId ? `weeklyChallengeInfo_${currentUserId}` : 'weeklyChallengeInfo');
  if (storedRefresh) initialLastWeeklyRefresh = storedRefresh;
  if (storedInfo) {
    initialWeeklyChallengeInfo = JSON.parse(storedInfo);
    initialWeeklyChallengeImage = initialWeeklyChallengeInfo.url;
  }
} catch {}

export const useGameStore = create<GameState>((set, get) => ({
  user: defaultUser,
  updateUser: (updates) => {
    const newUser = { ...get().user, ...updates };
    saveUserToStorage(newUser);
    set({ user: newUser });
  },

  // 认证
  login: (username) => {
    const { user } = get();
    const newUser = {
      ...user,
      name: username || '摄影新手',
      isLoggedIn: true,
      isGuest: false,
      hasSetNickname: true,
    };
    saveUserToStorage(newUser);
    set({ user: newUser });
  },
  register: async (username, password) => {
    // 前端基础校验
    if (username.length < 2 || username.length > 20) {
      return { success: false, message: '用户名长度需在2-20字符之间' };
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return { success: false, message: passwordCheck.message };
    }

    // 调用后端注册API
    const result = await userRegister(username, password);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    // 注册成功，初始化本地用户数据
    const newUserId = result.userId || Date.now().toString();
    const newUser: GameUser = {
      ...defaultUser,
      id: newUserId,
      name: username,
      isLoggedIn: true,
      isGuest: false,
      hasSetNickname: true,
      hasCompletedOnboarding: false,
    };

    saveUserToStorage(newUser);
    set({ user: newUser });

    return { success: true, message: '注册成功' };
  },
  verifyLogin: async (username, password) => {
    // 调用后端登录API
    const result = await userLogin(username, password);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    // 登录成功，使用后端返回的用户数据初始化本地状态
    const backendUser = result.user;
    const userId = result.userId || backendUser?.id || Date.now().toString();

    // 尝试从localStorage加载该用户的历史数据（关卡进度等本地数据）
    const localUserData = loadUserFromStorage(userId);

    // 解析preferences
    let preferences: PhotoPreference[] = [];
    if (backendUser?.preferences) {
      try {
        const parsed = typeof backendUser.preferences === 'string'
          ? JSON.parse(backendUser.preferences)
          : backendUser.preferences;
        if (Array.isArray(parsed)) {
          preferences = parsed;
        }
      } catch {}
    }

    const loggedInUser: GameUser = {
      ...defaultUser,
      ...(localUserData || {}), // 保留本地关卡进度数据
      id: userId,
      name: backendUser?.username || username,
      phone: backendUser?.phone || localUserData?.phone || '',
      avatar: backendUser?.avatar || localUserData?.avatar || '摄',
      level: backendUser?.level || localUserData?.level || 1,
      xp: backendUser?.xp || localUserData?.xp || 0,
      xpToNext: backendUser?.xpToNext || localUserData?.xpToNext || XP_PER_LEVEL,
      streak: backendUser?.streak || localUserData?.streak || 0,
      maxStreak: backendUser?.maxStreak || localUserData?.maxStreak || 0,
      totalStars: backendUser?.totalStars || localUserData?.totalStars || 0,
      worksCount: backendUser?.worksCount || localUserData?.worksCount || 0,
      averageScore: backendUser?.avgScore || localUserData?.averageScore || 0,
      followers: backendUser?.followers || localUserData?.followers || 0,
      isLoggedIn: true,
      isGuest: false,
      hasSetNickname: true,
      // 优先使用后端的 onboarding 状态（跨设备持久化），本地状态作为兜底
      hasCompletedOnboarding: backendUser?.hasCompletedOnboarding || localUserData?.hasCompletedOnboarding || false,
      // 优先使用后端的 preferences（跨设备持久化），本地状态作为兜底
      preferences: preferences.length > 0 ? preferences : (localUserData?.preferences || []),
    };

    saveUserToStorage(loggedInUser);
    set({ user: loggedInUser });

    return { success: true, message: '登录成功' };
  },
  loginAsGuest: () => {
    const newUser = {
      ...defaultUser,
      name: '游客用户',
      isLoggedIn: true,
      isGuest: true,
      id: defaultUser.id,
      level: defaultUser.level,
      xp: defaultUser.xp,
      xpToNext: defaultUser.xpToNext,
      achievements: defaultUser.achievements,
      completedLevels: defaultUser.completedLevels,
      levelStars: defaultUser.levelStars,
      totalStars: defaultUser.totalStars,
      hasSetNickname: true,
    };
    set({ user: newUser });
  },
  logout: () => {
    const newUser = {
      ...defaultUser,
      id: '1',
    };
    saveUserToStorage(newUser);
    set({ user: newUser });
  },
  setPreferences: (preferences) => {
    const { user } = get();
    const newUser = { ...user, preferences };
    saveUserToStorage(newUser);
    set({ user: newUser });
  },
  completeOnboarding: () => {
    const { user } = get();
    const newUser = { ...user, hasCompletedOnboarding: true };
    saveUserToStorage(newUser);
    set({ user: newUser });
  },

  // 关卡
  currentLevelId: 1,
  maxUnlockedLevel: defaultUser.completedLevels.length > 0
    ? Math.max(...defaultUser.completedLevels) + 1
    : 1,
  levels: [],
  currentLevel: null,
  setCurrentLevel: (level) => set({ currentLevel: level }),
  loadLevel: (levelId) => {
    const { user } = get();
    const completed = user.completedLevels.includes(levelId);
    const stars = user.levelStars[levelId] || 0;
    const level = getLevel(levelId, stars, completed);
    set({ currentLevel: level, currentLevelId: levelId });
  },

  // AI 拍摄计划
  shootingPlan: null,
  isAnalyzing: false,
  generateShootingPlan: async (imageUrl) => {
    set({ isAnalyzing: true });
    const plan = await aiService.generateShootingPlan(imageUrl);
    set({ isAnalyzing: false, shootingPlan: plan });
  },

  // 拍摄
  capturedImage: null,
  setCapturedImage: (image) => set({ capturedImage: image }),

  // 评分
  score: null,
  lastScore: null,
  lastScoreLevelId: null,
  lastCapturedImage: null,
  isScoring: false,
  compareImages: async (referenceUrl, userImageUrl, levelId) => {
    set({ isScoring: true, capturedImage: userImageUrl });
    const scoreResult = await aiService.compareImages(referenceUrl, userImageUrl);
    set({
      isScoring: false,
      score: scoreResult,
      lastScore: scoreResult,
      lastScoreLevelId: levelId,
      lastCapturedImage: userImageUrl,
    });

    // 通关处理
    if (scoreResult.overall >= 60) {
      get().completeLevel(levelId, scoreResult.stars, scoreResult.overall);
    }
  },
  clearLastScore: () => set({
    lastScore: null,
    lastScoreLevelId: null,
    lastCapturedImage: null,
    score: null,
    capturedImage: null,
  }),

  clearScore: () => set({
    score: null,
    capturedImage: null,
  }),

  // 本周挑战图片
  weeklyChallengeImage: initialWeeklyChallengeImage,
  weeklyChallengeInfo: initialWeeklyChallengeInfo,
  lastWeeklyRefresh: initialLastWeeklyRefresh,
  setWeeklyChallengeImage: (url: string) => set({ weeklyChallengeImage: url }),
  refreshWeeklyChallenge: async () => {
    const challenge = await getWeeklyChallenge();
    if (challenge) {
      const validCategories: ImageCategory[] = ['composition', 'light', 'color', 'portrait', 'landscape', 'still', 'street'];
      const category: ImageCategory = validCategories.includes(challenge.category as ImageCategory)
        ? challenge.category as ImageCategory
        : 'landscape';
      const validDifficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
      const difficulty: Difficulty = validDifficulties.includes(challenge.difficulty as Difficulty)
        ? challenge.difficulty as Difficulty
        : 'intermediate';

      const galleryImage: GalleryImage = {
        id: challenge.id,
        url: challenge.url,
        title: challenge.title,
        category,
        difficulty,
        tags: challenge.tags || [],
        author: challenge.author,
        authorUrl: challenge.authorUrl,
      };

      const now = new Date().toISOString();
      const currentUserId = localStorage.getItem('shotmaster_current_user_id');
      const refreshKey = currentUserId ? `lastWeeklyRefresh_${currentUserId}` : 'lastWeeklyRefresh';
      const infoKey = currentUserId ? `weeklyChallengeInfo_${currentUserId}` : 'weeklyChallengeInfo';

      set({
        weeklyChallengeImage: challenge.url,
        weeklyChallengeInfo: galleryImage,
        lastWeeklyRefresh: now,
      });

      localStorage.setItem(refreshKey, now);
      localStorage.setItem(infoKey, JSON.stringify(galleryImage));
    }
  },

  // 通关
  completeLevel: (levelId, stars, score) => {
    const { user } = get();
    const alreadyCompleted = user.completedLevels.includes(levelId);

    // 计算XP
    const xpGain = stars === 3 ? 200 : stars === 2 ? 100 : 50;
    const streakBonus = Math.floor(xpGain * (user.streak * 0.1));
    const totalXp = xpGain + streakBonus;

    // 更新数据
    const newCompletedLevels = alreadyCompleted ? user.completedLevels : [...user.completedLevels, levelId];
    const newLevelStars = { ...user.levelStars };
    // 只取最高星
    if (!newLevelStars[levelId] || stars > newLevelStars[levelId]) {
      newLevelStars[levelId] = stars;
    }

    const starsGained = (!alreadyCompleted || stars > (user.levelStars[levelId] || 0))
      ? stars - (user.levelStars[levelId] || 0)
      : 0;
    const newTotalStars = user.totalStars + Math.max(0, starsGained);

    let newXp = user.xp + totalXp;
    let newLevel = user.level;
    let newXpToNext = user.xpToNext;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = XP_PER_LEVEL + (newLevel - 1) * 100;
    }

    const newWorksCount = alreadyCompleted ? user.worksCount : user.worksCount + 1;
    const newAverageScore = newWorksCount > 0
      ? Math.round((user.averageScore * (newWorksCount - 1) + score) / newWorksCount)
      : score;

    const newStreak = alreadyCompleted ? user.streak : user.streak + 1;
    const newMaxStreak = Math.max(user.maxStreak, newStreak);

    const updatedUser: GameUser = {
      ...user,
      completedLevels: newCompletedLevels,
      levelStars: newLevelStars,
      totalStars: newTotalStars,
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      worksCount: newWorksCount,
      averageScore: newAverageScore,
      streak: newStreak,
      maxStreak: newMaxStreak,
    };

    saveUserToStorage(updatedUser);
    set({ user: updatedUser, maxUnlockedLevel: Math.max(get().maxUnlockedLevel, levelId + 1) });
  },

  // 成就检查
  checkAchievements: () => {
    const { user } = get();
    const newlyUnlocked: string[] = [];
    const achievements = user.achievements.map(a => {
      if (a.unlocked) return a;

      let unlocked = false;
      let progress = 0;

      switch (a.id) {
        case 'a1':
          unlocked = user.completedLevels.length >= 1;
          progress = Math.min(100, user.completedLevels.length * 100);
          break;
        case 'a2':
          const compLevels = [1, 2, 3, 4, 5].filter(id => user.completedLevels.includes(id));
          unlocked = compLevels.length === 5;
          progress = (compLevels.length / 5) * 100;
          break;
        case 'a3':
          const lightStars = [6, 7, 8, 9, 10].reduce((sum, id) => sum + (user.levelStars[id] || 0), 0);
          unlocked = lightStars === 15;
          progress = (lightStars / 15) * 100;
          break;
        case 'a4':
          const colorStars = [11, 12, 13, 14, 15].reduce((sum, id) => sum + (user.levelStars[id] || 0), 0);
          unlocked = colorStars === 15;
          progress = (colorStars / 15) * 100;
          break;
        case 'a5':
          unlocked = user.maxStreak >= 100;
          progress = Math.min(100, user.maxStreak);
          break;
        case 'a6':
          const challengeCount = user.completedLevels.filter(id => id > 20).length;
          unlocked = challengeCount >= 50;
          progress = Math.min(100, (challengeCount / 50) * 100);
          break;
        case 'a7':
          unlocked = user.totalStars >= 50;
          progress = Math.min(100, (user.totalStars / 50) * 100);
          break;
        case 'a8':
          unlocked = user.level >= 20;
          progress = Math.min(100, (user.level / 20) * 100);
          break;
      }

      if (unlocked && !a.unlocked) {
        newlyUnlocked.push(a.name);
        return { ...a, unlocked: true, progress: 100, unlockedAt: new Date().toISOString() };
      }
      return { ...a, progress: Math.round(progress) };
    });

    if (newlyUnlocked.length > 0) {
      const updatedUser = { ...user, achievements };
      saveUserToStorage(updatedUser);
      set({ user: updatedUser });
    }

    return newlyUnlocked;
  },

  // 课程完成
  completeCourse: (courseId) => {
    set(state => ({
      courses: state.courses.map(c =>
        c.id === courseId ? { ...c, completed: true } : c
      )
    }));
  },

  // 图库 - 完全使用 Unsplash 图片，不使用关卡图片
  galleryImages: [],  // 不再使用关卡的图片
  customGalleryImages: loadCustomImagesFromStorage(),
  unsplashImages: loadUnsplashImagesFromStorage().images.length > 0 
    ? loadUnsplashImagesFromStorage().images 
    : (!hasUnsplashAccess() ? defaultUnsplashImages : []),
  isLoadingUnsplash: false,
  lastUnsplashRefresh: loadUnsplashImagesFromStorage().lastRefresh || (hasUnsplashAccess() ? null : new Date().toISOString()),
  addCustomGalleryImage: (image) => {
    set(state => {
      const newImages = [image, ...state.customGalleryImages];
      saveCustomImagesToStorage(newImages);
      return { customGalleryImages: newImages };
    });
  },
  removeCustomGalleryImage: (imageId) => {
    set(state => {
      const newImages = state.customGalleryImages.filter(img => img.id !== imageId);
      saveCustomImagesToStorage(newImages);
      return { customGalleryImages: newImages };
    });
  },
  toggleFavoriteImage: (imageId, category) => {
    const { user } = get();
    const favorites = user.favoriteImageIds || [];
    const isFav = favorites.includes(imageId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== imageId)
      : [...favorites, imageId];

    // 更新交互记录
    const interactions = user.imageInteractions || [];
    const existingIdx = interactions.findIndex(i => i.imageId === imageId);
    const now = new Date().toISOString();
    let newInteractions;
    if (existingIdx >= 0) {
      newInteractions = interactions.map((i, idx) =>
        idx === existingIdx ? { ...i, liked: !isFav, lastInteractedAt: now } : i
      );
    } else {
      newInteractions = [...interactions, {
        imageId,
        category,
        liked: !isFav,
        disliked: false,
        viewed: false,
        usedInShoot: false,
        lastInteractedAt: now,
      }];
    }

    const updatedUser = {
      ...user,
      favoriteImageIds: newFavorites,
      imageInteractions: newInteractions,
    };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  toggleDislikeImage: (imageId, category) => {
    const { user } = get();
    const interactions = user.imageInteractions || [];
    const existingIdx = interactions.findIndex(i => i.imageId === imageId);
    const now = new Date().toISOString();
    let newInteractions;
    const existing = interactions.find(i => i.imageId === imageId);
    const isDisliked = existing?.disliked || false;

    if (existingIdx >= 0) {
      newInteractions = interactions.map((i, idx) =>
        idx === existingIdx ? { ...i, disliked: !isDisliked, lastInteractedAt: now } : i
      );
    } else {
      newInteractions = [...interactions, {
        imageId,
        category,
        liked: false,
        disliked: !isDisliked,
        viewed: false,
        usedInShoot: false,
        lastInteractedAt: now,
      }];
    }

    const updatedUser = { ...user, imageInteractions: newInteractions };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  isFavoriteImage: (imageId) => {
    const { user } = get();
    return (user.favoriteImageIds || []).includes(imageId);
  },
  isDislikedImage: (imageId) => {
    const { user } = get();
    const interaction = (user.imageInteractions || []).find(i => i.imageId === imageId);
    return interaction?.disliked || false;
  },
  recordImageView: (imageId, category) => {
    const { user } = get();
    const interactions = user.imageInteractions || [];
    const existingIdx = interactions.findIndex(i => i.imageId === imageId);
    const now = new Date().toISOString();
    let newInteractions;
    if (existingIdx >= 0) {
      newInteractions = interactions.map((i, idx) =>
        idx === existingIdx ? { ...i, viewed: true, lastInteractedAt: now } : i
      );
    } else {
      newInteractions = [...interactions, {
        imageId,
        category,
        liked: false,
        disliked: false,
        viewed: true,
        usedInShoot: false,
        lastInteractedAt: now,
      }];
    }
    const updatedUser = { ...user, imageInteractions: newInteractions };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  recordShootCategory: (category) => {
    const { user } = get();
    const shootCategories = user.shootCategories || [];
    const newShootCategories = [...shootCategories, category].slice(-20); // 只保留最近20条
    const updatedUser = { ...user, shootCategories: newShootCategories };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  // 拍摄计划反馈
  toggleLikeDimension: (imageId, dimension, imageInfo) => {
    const { user } = get();
    const feedbacks = user.shootingPlanFeedbacks || [];
    const existingIdx = feedbacks.findIndex(f => f.imageId === imageId);
    const now = new Date().toISOString();
    let newFeedbacks;

    if (existingIdx >= 0) {
      const existing = feedbacks[existingIdx];
      const dimIdx = existing.dimensions.findIndex(d => d.dimension === dimension);
      let newDimensions;
      if (dimIdx >= 0) {
        const dim = existing.dimensions[dimIdx];
        const newLiked = !dim.liked;
        newDimensions = existing.dimensions.map((d, idx) =>
          idx === dimIdx ? { ...d, liked: newLiked, disliked: false, createdAt: now } : d
        );
      } else {
        newDimensions = [...existing.dimensions, {
          dimension,
          liked: true,
          disliked: false,
          createdAt: now,
        }];
      }
      newFeedbacks = feedbacks.map((f, idx) =>
        idx === existingIdx ? { ...f, dimensions: newDimensions, updatedAt: now, imageUrl: imageInfo?.imageUrl || f.imageUrl, imageTitle: imageInfo?.imageTitle || f.imageTitle, category: imageInfo?.category || f.category } : f
      );
    } else {
      newFeedbacks = [...feedbacks, {
        imageId,
        imageUrl: imageInfo?.imageUrl || '',
        imageTitle: imageInfo?.imageTitle || '',
        category: imageInfo?.category || '',
        dimensions: [{
          dimension,
          liked: true,
          disliked: false,
          createdAt: now,
        }],
        createdAt: now,
        updatedAt: now,
      }];
    }
    const updatedUser = { ...user, shootingPlanFeedbacks: newFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
    syncFeedbacksToBackend(updatedUser);
  },
  toggleDislikeDimension: (imageId, dimension, imageInfo) => {
    const { user } = get();
    const feedbacks = user.shootingPlanFeedbacks || [];
    const existingIdx = feedbacks.findIndex(f => f.imageId === imageId);
    const now = new Date().toISOString();
    let newFeedbacks;

    if (existingIdx >= 0) {
      const existing = feedbacks[existingIdx];
      const dimIdx = existing.dimensions.findIndex(d => d.dimension === dimension);
      let newDimensions;
      if (dimIdx >= 0) {
        const dim = existing.dimensions[dimIdx];
        const newDisliked = !dim.disliked;
        newDimensions = existing.dimensions.map((d, idx) =>
          idx === dimIdx ? { ...d, disliked: newDisliked, liked: false, createdAt: now } : d
        );
      } else {
        newDimensions = [...existing.dimensions, {
          dimension,
          liked: false,
          disliked: true,
          createdAt: now,
        }];
      }
      newFeedbacks = feedbacks.map((f, idx) =>
        idx === existingIdx ? { ...f, dimensions: newDimensions, updatedAt: now, imageUrl: imageInfo?.imageUrl || f.imageUrl, imageTitle: imageInfo?.imageTitle || f.imageTitle, category: imageInfo?.category || f.category } : f
      );
    } else {
      newFeedbacks = [...feedbacks, {
        imageId,
        imageUrl: imageInfo?.imageUrl || '',
        imageTitle: imageInfo?.imageTitle || '',
        category: imageInfo?.category || '',
        dimensions: [{
          dimension,
          liked: false,
          disliked: true,
          createdAt: now,
        }],
        createdAt: now,
        updatedAt: now,
      }];
    }
    const updatedUser = { ...user, shootingPlanFeedbacks: newFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
    syncFeedbacksToBackend(updatedUser);
  },
  getDimensionFeedback: (imageId, dimension) => {
    const { user } = get();
    const feedback = (user.shootingPlanFeedbacks || []).find(f => f.imageId === imageId);
    if (!feedback) return { liked: false, disliked: false };
    const dim = feedback.dimensions.find(d => d.dimension === dimension);
    return { liked: dim?.liked || false, disliked: dim?.disliked || false };
  },
  // 评分建议反馈
  toggleLikeSuggestion: (scoreId, suggestionKey, suggestionInfo) => {
    const { user } = get();
    const scoreFeedbacks = user.scoreFeedbacks || [];
    const existingIdx = scoreFeedbacks.findIndex(f => f.scoreId === scoreId);
    const now = new Date().toISOString();
    let newScoreFeedbacks;

    if (existingIdx >= 0) {
      const existing = scoreFeedbacks[existingIdx];
      const suggIdx = existing.suggestionFeedbacks.findIndex(s => s.suggestionKey === suggestionKey);
      let newSuggestionFeedbacks;
      if (suggIdx >= 0) {
        const sugg = existing.suggestionFeedbacks[suggIdx];
        const newLiked = !sugg.liked;
        newSuggestionFeedbacks = existing.suggestionFeedbacks.map((s, i) =>
          i === suggIdx ? { ...s, liked: newLiked, disliked: newLiked ? false : s.disliked, title: suggestionInfo?.title || s.title, dimension: suggestionInfo?.dimension || s.dimension } : s
        );
      } else {
        newSuggestionFeedbacks = [
          ...existing.suggestionFeedbacks,
          { suggestionKey, liked: true, disliked: false, createdAt: now, title: suggestionInfo?.title, dimension: suggestionInfo?.dimension }
        ];
      }
      newScoreFeedbacks = scoreFeedbacks.map((f, i) =>
        i === existingIdx ? { ...f, suggestionFeedbacks: newSuggestionFeedbacks, updatedAt: now } : f
      );
    } else {
      newScoreFeedbacks = [
        ...scoreFeedbacks,
        {
          scoreId,
          suggestionFeedbacks: [{ suggestionKey, liked: true, disliked: false, createdAt: now, title: suggestionInfo?.title, dimension: suggestionInfo?.dimension }],
          feedbackFeedbacks: [],
          createdAt: now,
          updatedAt: now,
        }
      ];
    }
    const updatedUser = { ...user, scoreFeedbacks: newScoreFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
    syncScoreFeedbacksToBackend(updatedUser);
  },
  toggleDislikeSuggestion: (scoreId, suggestionKey, suggestionInfo) => {
    const { user } = get();
    const scoreFeedbacks = user.scoreFeedbacks || [];
    const existingIdx = scoreFeedbacks.findIndex(f => f.scoreId === scoreId);
    const now = new Date().toISOString();
    let newScoreFeedbacks;

    if (existingIdx >= 0) {
      const existing = scoreFeedbacks[existingIdx];
      const suggIdx = existing.suggestionFeedbacks.findIndex(s => s.suggestionKey === suggestionKey);
      let newSuggestionFeedbacks;
      if (suggIdx >= 0) {
        const sugg = existing.suggestionFeedbacks[suggIdx];
        const newDisliked = !sugg.disliked;
        newSuggestionFeedbacks = existing.suggestionFeedbacks.map((s, i) =>
          i === suggIdx ? { ...s, disliked: newDisliked, liked: newDisliked ? false : s.liked, title: suggestionInfo?.title || s.title, dimension: suggestionInfo?.dimension || s.dimension } : s
        );
      } else {
        newSuggestionFeedbacks = [
          ...existing.suggestionFeedbacks,
          { suggestionKey, liked: false, disliked: true, createdAt: now, title: suggestionInfo?.title, dimension: suggestionInfo?.dimension }
        ];
      }
      newScoreFeedbacks = scoreFeedbacks.map((f, i) =>
        i === existingIdx ? { ...f, suggestionFeedbacks: newSuggestionFeedbacks, updatedAt: now } : f
      );
    } else {
      newScoreFeedbacks = [
        ...scoreFeedbacks,
        {
          scoreId,
          suggestionFeedbacks: [{ suggestionKey, liked: false, disliked: true, createdAt: now, title: suggestionInfo?.title, dimension: suggestionInfo?.dimension }],
          feedbackFeedbacks: [],
          createdAt: now,
          updatedAt: now,
        }
      ];
    }
    const updatedUser = { ...user, scoreFeedbacks: newScoreFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
    syncScoreFeedbacksToBackend(updatedUser);
  },
  getSuggestionFeedback: (scoreId, suggestionKey) => {
    const { user } = get();
    const feedback = (user.scoreFeedbacks || []).find(f => f.scoreId === scoreId);
    if (!feedback) return { liked: false, disliked: false };
    const sugg = feedback.suggestionFeedbacks.find(s => s.suggestionKey === suggestionKey);
    return { liked: sugg?.liked || false, disliked: sugg?.disliked || false };
  },
  toggleLikeFeedback: (scoreId, feedbackIndex) => {
    const { user } = get();
    const scoreFeedbacks = user.scoreFeedbacks || [];
    const existingIdx = scoreFeedbacks.findIndex(f => f.scoreId === scoreId);
    const now = new Date().toISOString();
    let newScoreFeedbacks;

    if (existingIdx >= 0) {
      const existing = scoreFeedbacks[existingIdx];
      const fbIdx = existing.feedbackFeedbacks.findIndex(f => f.index === feedbackIndex);
      let newFeedbackFeedbacks;
      if (fbIdx >= 0) {
        const fb = existing.feedbackFeedbacks[fbIdx];
        const newLiked = !fb.liked;
        newFeedbackFeedbacks = existing.feedbackFeedbacks.map((f, i) =>
          i === fbIdx ? { ...f, liked: newLiked, disliked: newLiked ? false : f.disliked } : f
        );
      } else {
        newFeedbackFeedbacks = [
          ...existing.feedbackFeedbacks,
          { index: feedbackIndex, liked: true, disliked: false, createdAt: now }
        ];
      }
      newScoreFeedbacks = scoreFeedbacks.map((f, i) =>
        i === existingIdx ? { ...f, feedbackFeedbacks: newFeedbackFeedbacks, updatedAt: now } : f
      );
    } else {
      newScoreFeedbacks = [
        ...scoreFeedbacks,
        {
          scoreId,
          suggestionFeedbacks: [],
          feedbackFeedbacks: [{ index: feedbackIndex, liked: true, disliked: false, createdAt: now }],
          createdAt: now,
          updatedAt: now,
        }
      ];
    }
    const updatedUser = { ...user, scoreFeedbacks: newScoreFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  toggleDislikeFeedback: (scoreId, feedbackIndex) => {
    const { user } = get();
    const scoreFeedbacks = user.scoreFeedbacks || [];
    const existingIdx = scoreFeedbacks.findIndex(f => f.scoreId === scoreId);
    const now = new Date().toISOString();
    let newScoreFeedbacks;

    if (existingIdx >= 0) {
      const existing = scoreFeedbacks[existingIdx];
      const fbIdx = existing.feedbackFeedbacks.findIndex(f => f.index === feedbackIndex);
      let newFeedbackFeedbacks;
      if (fbIdx >= 0) {
        const fb = existing.feedbackFeedbacks[fbIdx];
        const newDisliked = !fb.disliked;
        newFeedbackFeedbacks = existing.feedbackFeedbacks.map((f, i) =>
          i === fbIdx ? { ...f, disliked: newDisliked, liked: newDisliked ? false : f.liked } : f
        );
      } else {
        newFeedbackFeedbacks = [
          ...existing.feedbackFeedbacks,
          { index: feedbackIndex, liked: false, disliked: true, createdAt: now }
        ];
      }
      newScoreFeedbacks = scoreFeedbacks.map((f, i) =>
        i === existingIdx ? { ...f, feedbackFeedbacks: newFeedbackFeedbacks, updatedAt: now } : f
      );
    } else {
      newScoreFeedbacks = [
        ...scoreFeedbacks,
        {
          scoreId,
          suggestionFeedbacks: [],
          feedbackFeedbacks: [{ index: feedbackIndex, liked: false, disliked: true, createdAt: now }],
          createdAt: now,
          updatedAt: now,
        }
      ];
    }
    const updatedUser = { ...user, scoreFeedbacks: newScoreFeedbacks };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  getFeedbackItemFeedback: (scoreId, feedbackIndex) => {
    const { user } = get();
    const feedback = (user.scoreFeedbacks || []).find(f => f.scoreId === scoreId);
    if (!feedback) return { liked: false, disliked: false };
    const fb = feedback.feedbackFeedbacks.find(f => f.index === feedbackIndex);
    return { liked: fb?.liked || false, disliked: fb?.disliked || false };
  },
  // 图库完全使用 Unsplash 图片，只返回 unsplash 图片
  getAllGalleryImages: () => {
    return get().unsplashImages;
  },
  getRecommendedImages: () => {
    const { user } = get();
    const images = get().getAllGalleryImages();

    // 偏好映射：PhotoPreference -> ImageCategory
    const preferenceToCategory: Record<string, ImageCategory> = {
      landscape: 'landscape',
      portrait: 'portrait',
      street: 'street',
      still: 'still',
      architecture: 'composition',
      nature: 'landscape',
      travel: 'landscape',
      food: 'still',
    };

    // 计算偏好权重
    const preferenceWeights: Record<string, number> = {};
    user.preferences.forEach(pref => {
      const cat = preferenceToCategory[pref];
      if (cat) {
        preferenceWeights[cat] = (preferenceWeights[cat] || 0) + 2;
      }
    });

    // 计算拍摄类别权重
    const shootCategoryCounts: Record<string, number> = {};
    (user.shootCategories || []).forEach(cat => {
      shootCategoryCounts[cat] = (shootCategoryCounts[cat] || 0) + 1;
    });
    Object.entries(shootCategoryCounts).forEach(([cat, count]) => {
      preferenceWeights[cat] = (preferenceWeights[cat] || 0) + count * 1.5;
    });

    // 计算点赞/收藏权重
    (user.imageInteractions || []).forEach(interaction => {
      if (interaction.liked) {
        preferenceWeights[interaction.category] = (preferenceWeights[interaction.category] || 0) + 3;
      }
    });

    // 计算章节学习进度权重
    const chapterProgress = calculateChapterProgress(user.completedLevels);
    const chapterCategoryMap: Record<string, string[]> = {
      composition: ['composition', 'landscape', 'still'],
      light: ['light', 'landscape', 'portrait'],
      color: ['color', 'landscape', 'still'],
      narrative: ['street', 'portrait', 'composition'],
      master: ['composition', 'light', 'color'],
      challenge: ['composition', 'light', 'color', 'portrait', 'landscape', 'street', 'still'],
    };
    chapterProgress.forEach(chapter => {
      const categories = chapterCategoryMap[chapter] || [];
      categories.forEach(cat => {
        preferenceWeights[cat] = (preferenceWeights[cat] || 0) + 2;
      });
    });

    // 计算每张图片的推荐分数
    const scoredImages = images.map(img => {
      let score = 0;

      // 类别匹配权重
      score += (preferenceWeights[img.category] || 0) * 10;

      // Unsplash 图片稍微加分，鼓励探索新内容
      if (img.id.startsWith('unsplash_')) {
        score += 2;
      }

      // 标签匹配权重（简单匹配偏好关键词）
      const prefKeywords = user.preferences;
      img.tags.forEach(tag => {
        prefKeywords.forEach(pref => {
          if (tag.includes(pref) || pref.includes(tag)) {
            score += 2;
          }
        });
      });

      // 已收藏的图片加分（但不要排在太前面，因为有专门收藏列表）
      if ((user.favoriteImageIds || []).includes(img.id)) {
        score += 1;
      }

      // 已看过的图片适当降权，增加多样性
      const interaction = (user.imageInteractions || []).find(i => i.imageId === img.id);
      if (interaction?.viewed) {
        score -= 5;
      }

      // 基于图片ID的稳定伪随机值（保证每次排序结果一致）
      const hash = img.id.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
      const stableRandom = ((hash % 1000) + 1000) % 1000 / 1000; // 0-1 之间的稳定值
      score += stableRandom * 2;

      return { image: img, score };
    });

    // 按分数排序，分数相同时按ID排序保证稳定性
    scoredImages.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.image.id.localeCompare(b.image.id);
    });

    return scoredImages.map(si => si.image);
  },
  shouldRefreshUnsplash: () => {
    const { lastUnsplashRefresh } = get();
    
    // 如果没有任何图片，需要刷新
    if (get().unsplashImages.length === 0) return true;
    
    if (!hasUnsplashAccess()) {
      // 没有 API key 时，每48小时重新排序一次
      const lastDate = lastUnsplashRefresh ? new Date(lastUnsplashRefresh) : new Date(0);
      const now = new Date();
      const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      // 每48小时重新排序一次
      if (diffHours >= 48) return true;
      
      return false;
    }
    
    if (!lastUnsplashRefresh) return true;

    const lastDate = new Date(lastUnsplashRefresh);
    const now = new Date();
    const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

    // 每48小时（2天）刷新一次
    if (diffHours >= 48) return true;

    return false;
  },
  refreshUnsplashImages: async () => {
    const { user, isLoadingUnsplash } = get();
    if (isLoadingUnsplash) return;

    set({ isLoadingUnsplash: true });

    try {
      const likedCategories: ImageCategory[] = [];
      (user.imageInteractions || []).forEach(interaction => {
        if (interaction.liked) {
          likedCategories.push(interaction.category);
        }
      });

      const shootCategories = user.shootCategories || [];
      const chapterProgress = calculateChapterProgress(user.completedLevels);

      let images: GalleryImage[] = [];

      if (hasUnsplashAccess()) {
        // 使用 Unsplash API
        images = await fetchRecommendedImages(
          user.preferences,
          likedCategories,
          shootCategories,
          chapterProgress,
          50
        );
      } else {
        // 使用默认图片，但根据用户偏好筛选
        const preferenceToCategory: Record<string, ImageCategory> = {
          landscape: 'landscape',
          portrait: 'portrait',
          street: 'street',
          still: 'still',
          architecture: 'composition',
          nature: 'landscape',
          travel: 'landscape',
          food: 'still',
        };

        // 计算各类别的权重
        const categoryWeights: Record<string, number> = {};
        
        // 偏好权重
        user.preferences.forEach(pref => {
          const cat = preferenceToCategory[pref];
          if (cat) categoryWeights[cat] = (categoryWeights[cat] || 0) + 3;
        });

        // 收藏类别权重
        likedCategories.forEach(cat => {
          categoryWeights[cat] = (categoryWeights[cat] || 0) + 2;
        });

        // 拍摄类别权重
        shootCategories.forEach(cat => {
          categoryWeights[cat] = (categoryWeights[cat] || 0) + 1;
        });

        // 章节进度权重
        chapterProgress.forEach(chapter => {
          const chapterCategories: Record<string, ImageCategory[]> = {
            composition: ['composition', 'landscape', 'still'],
            light: ['light', 'landscape', 'portrait'],
            color: ['color', 'landscape', 'still'],
            narrative: ['street', 'portrait', 'composition'],
            master: ['composition', 'light', 'color'],
            challenge: ['composition', 'light', 'color', 'portrait', 'landscape', 'street', 'still'],
          };
          (chapterCategories[chapter] || []).forEach(cat => {
            categoryWeights[cat] = (categoryWeights[cat] || 0) + 2;
          });
        });

        // 根据权重对默认图片排序
        images = [...defaultUnsplashImages].sort((a, b) => {
          const weightA = categoryWeights[a.category] || 0;
          const weightB = categoryWeights[b.category] || 0;
          if (weightB !== weightA) return weightB - weightA;
          return a.id.localeCompare(b.id);
        });
      }

      const now = new Date().toISOString();
      saveUnsplashImagesToStorage(images, now);
      set({ unsplashImages: images, lastUnsplashRefresh: now });
    } catch (error) {
      console.error('刷新图库图片失败:', error);
      // 出错时使用默认图片
      set({ unsplashImages: defaultUnsplashImages });
    } finally {
      set({ isLoadingUnsplash: false });
    }
  },

  // 课程
  courses: mockCourses.map(c => ({
    ...c,
    unlocked: c.requiredLevel <= defaultUser.level,
  })),

  // 社区
  communityWorks: mockCommunityWorks,
  addCommunityWork: (work) => {
    set(state => ({
      communityWorks: [work, ...state.communityWorks]
    }));
  },
  removeCommunityWork: (workId) => {
    set(state => ({
      communityWorks: state.communityWorks.filter(w => w.id !== workId)
    }));
  },
  voteWork: (workId) => {
    const { user } = get();
    const votedWorks = user.votedWorks || [];
    const hasVoted = votedWorks.includes(workId);
    const favoriteWorkIds = user.favoriteWorkIds || [];

    if (hasVoted) {
      // 取消点赞
      set(state => ({
        communityWorks: state.communityWorks.map(w =>
          w.id === workId ? { ...w, votes: Math.max(0, w.votes - 1) } : w
        )
      }));
      const newVotedWorks = votedWorks.filter(id => id !== workId);
      const newFavoriteWorkIds = favoriteWorkIds.filter(id => id !== workId);
      const updatedUser = { ...user, votedWorks: newVotedWorks, favoriteWorkIds: newFavoriteWorkIds };
      saveUserToStorage(updatedUser);
      set({ user: updatedUser });
    } else {
      // 点赞 + 自动收藏
      set(state => ({
        communityWorks: state.communityWorks.map(w =>
          w.id === workId ? { ...w, votes: w.votes + 1 } : w
        )
      }));
      const newVotedWorks = [...votedWorks, workId];
      const newFavoriteWorkIds = favoriteWorkIds.includes(workId)
        ? favoriteWorkIds
        : [...favoriteWorkIds, workId];
      const updatedUser = { ...user, votedWorks: newVotedWorks, favoriteWorkIds: newFavoriteWorkIds };
      saveUserToStorage(updatedUser);
      set({ user: updatedUser });
    }
  },
  isVoted: (workId: string) => {
    const votedWorks = get().user.votedWorks || [];
    return votedWorks.includes(workId);
  },
  toggleFavoriteWork: (workId) => {
    const { user } = get();
    const favorites = user.favoriteWorkIds || [];
    const isFav = favorites.includes(workId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== workId)
      : [...favorites, workId];
    const updatedUser = { ...user, favoriteWorkIds: newFavorites };
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  isFavoriteWork: (workId: string) => {
    const favorites = get().user.favoriteWorkIds || [];
    return favorites.includes(workId);
  },

  // 关注
  toggleFollow: async (userId) => {
    const { user } = get();
    try {
      const res = await toggleUserFollow(user.id, userId);
      if (res.success) {
        const following = user.following || [];
        const newFollowing = res.isFollowing
          ? [...following, userId]
          : following.filter(id => id !== userId);
        const updatedUser = { ...user, following: newFollowing };
        saveUserToStorage(updatedUser);
        set({ user: updatedUser });
      }
    } catch (e) {
      console.error('关注操作失败', e);
    }
  },
  isFollowing: (userId: string) => {
    if (!userId) return false;
    const following = get().user.following;
    if (!Array.isArray(following)) return false;
    return following.includes(userId);
  },
}));
