// 图片分类
export type ImageCategory = 'composition' | 'light' | 'color' | 'portrait' | 'landscape' | 'still' | 'street';
// 难度等级
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
// 关卡章节
export type Chapter = 'composition' | 'light' | 'color' | 'narrative' | 'master' | 'challenge';
// 关卡状态
export type LevelStatus = 'locked' | 'available' | 'completed';
// 星级
export type Stars = 0 | 1 | 2 | 3;

// 构图规则类型
export type CompositionRule = 
  | 'rule_of_thirds'      // 三分法
  | 'symmetry'            // 对称构图
  | 'leading_lines'       // 引导线
  | 'framing'             // 框架构图
  | 'foreground'          // 前景构图
  | 'negative_space'      // 留白/负空间
  | 'golden_ratio'        // 黄金比例
  | 'diagonal'            // 对角线
  | 'minimalism'          // 极简构图
  | 'triangles'           // 三角形构图
  | 'none';               // 无特定规则

// 参考图
export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: ImageCategory;
  difficulty: Difficulty;
  tags: string[];
  author?: string;
  authorUrl?: string;
  compositionRule?: CompositionRule;
}

// AI 拍摄计划
export interface ShootingPlan {
  scene: { type: string; description: string };
  lighting: { direction: string; quality: string; colorTemp: string; suggestion: string };
  composition: { rule: string; details: string };
  params: { iso: string; aperture: string; shutter: string };
  postProcessing: { style: string; steps: string[] };
  equipment: { camera: string; lens: string; accessories: string[] };
}

// 拍摄计划维度
export type ShootingPlanDimension = 'scene' | 'lighting' | 'composition' | 'params' | 'postProcessing' | 'equipment';

// 拍摄计划维度反馈
export interface DimensionFeedback {
  dimension: ShootingPlanDimension;
  liked: boolean;
  disliked: boolean;
  createdAt: string;
}

// 拍摄计划反馈
export interface ShootingPlanFeedback {
  imageId: string;
  imageUrl: string;
  imageTitle: string;
  category: string;
  dimensions: DimensionFeedback[];
  createdAt: string;
  updatedAt: string;
}

// 关卡
export interface Level {
  id: number;
  chapter: Chapter;
  title: string;
  referenceImage: GalleryImage;
  difficulty: number;
  passScore: number;
  constraints?: string[];
  shootingPlan?: ShootingPlan;
  stars: Stars;
  status: LevelStatus;
  isFixed: boolean;
}

// AI 评分
export interface ScoreSuggestion {
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  analysis: string;
  method: string;
  referencePoint: string;
}

export interface ScoreSummary {
  level: string;
  mainImprovement: string;
  nextPractice: string;
  encouragement: string;
}

export interface Score {
  similarity: number;
  composition: number;
  lighting: number;
  color: number;
  overall: number;
  stars: Stars;
  feedback: string[];
  strengths?: string[];
  suggestions?: ScoreSuggestion[];
  summary?: ScoreSummary;
  quickTips?: string[];
}

export interface SuggestionFeedback {
  suggestionKey: string;
  liked: boolean;
  disliked: boolean;
  createdAt: string;
}

export interface ScoreFeedback {
  scoreId: string;
  suggestionFeedbacks: SuggestionFeedback[];
  feedbackFeedbacks: { index: number; liked: boolean; disliked: boolean; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

// 成就徽章
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

// 课程
export interface Course {
  id: string;
  title: string;
  description: string;
  category: Chapter;
  difficulty: Difficulty;
  duration: string;
  lessons: number;
  unlocked: boolean;
  completed: boolean;
  thumbnail: string;
  requiredLevel: number;
}

// 社区作品
export interface CommunityWork {
  id: string;
  author: string;
  avatar: string;
  authorId: string; // 作者用户ID，用于关注
  authorLevel: number; // 作者等级
  authorStars: number; // 作者总星数
  authorCompletedCount: number; // 作者已通关关卡数
  authorStreak: number; // 作者连胜天数
  authorFollowers: number; // 粉丝数
  authorFollowing: number; // 关注数
  topAchievements: string[]; // 主要成就列表
  topWorks: string[]; // 主要作品图片URL列表
  image: string;
  votes: number;
  createdAt: string;
}

// 摄影偏好
export type PhotoPreference =
  | 'landscape'
  | 'portrait'
  | 'street'
  | 'still'
  | 'architecture'
  | 'nature'
  | 'travel'
  | 'food';

// 图片交互记录
export interface ImageInteraction {
  imageId: string;
  category: ImageCategory;
  liked: boolean;       // 点赞/收藏
  disliked: boolean;     // 点踩/不喜欢
  viewed: boolean;
  usedInShoot: boolean;
  lastInteractedAt: string;
}

// 用户游戏数据
export interface GameUser {
  id: string;
  phone: string; // 手机号
  name: string; // 昵称
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  maxStreak: number;
  totalStars: number;
  worksCount: number;
  averageScore: number;
  achievements: Achievement[];
  completedLevels: number[];
  levelStars: Record<number, Stars>;
  following: string[];
  votedWorks: string[];
  isLoggedIn: boolean;
  isGuest: boolean;
  preferences: PhotoPreference[];
  hasCompletedOnboarding: boolean;
  hasSetNickname: boolean; // 是否已设置昵称
  favoriteImageIds: string[]; // 收藏的图片ID
  imageInteractions: ImageInteraction[]; // 图片交互记录
  shootCategories: ImageCategory[]; // 经常拍摄的类别
  shootingPlanFeedbacks: ShootingPlanFeedback[]; // 拍摄计划反馈记录
  scoreFeedbacks: ScoreFeedback[]; // 评分建议反馈记录
}
