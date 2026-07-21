const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface SyncUserResponse {
  success: boolean;
  message: string;
  userId: string;
}

interface SyncFeedbackResponse {
  success: boolean;
  synced: number;
  message: string;
}

// ============== 用户注册/登录 ==============

export interface UserAuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  username?: string;
  user?: {
    id: string;
    username: string;
    phone: string;
    avatar: string;
    level: number;
    xp: number;
    xpToNext: number;
    streak: number;
    maxStreak: number;
    totalStars: number;
    worksCount: number;
    avgScore: number;
    followers: number;
    following: number;
    isLoggedIn: boolean;
    isGuest: boolean;
    preferences: string;
    hasCompletedOnboarding: boolean;
  };
}

export async function userRegister(username: string, password: string): Promise<UserAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    // 兼容后端可能返回的 error 字段
    if (!response.ok && !data.success) {
      return { success: false, message: data.message || data.error || '注册失败' };
    }
    return data;
  } catch (e) {
    console.error('User register failed:', e);
    return { success: false, message: '网络错误，请检查网络连接' };
  }
}

export async function userLogin(username: string, password: string): Promise<UserAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok && !data.success) {
      return { success: false, message: data.message || data.error || '登录失败' };
    }
    return data;
  } catch (e) {
    console.error('User login failed:', e);
    return { success: false, message: '网络错误，请检查网络连接' };
  }
}

export async function syncUserData(userData: {
  userId: string;
  username: string;
  phone: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  maxStreak: number;
  totalStars: number;
  worksCount: number;
  avgScore: number;
  isLoggedIn: boolean;
  isGuest: boolean;
  hasCompletedOnboarding: boolean;
  preferences: string[];
}): Promise<SyncUserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (e) {
    console.error('Sync user data failed:', e);
    return { success: false, message: '网络错误', userId: userData.userId };
  }
}

export async function syncFeedbacks(userId: string, feedbacks: Array<{
  imageId: string;
  imageUrl: string;
  imageTitle: string;
  category: string;
  dimension: string;
  liked: boolean;
  disliked: boolean;
  updatedAt: string;
}>): Promise<SyncFeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/sync-feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        feedbacks,
      }),
    });
    return await response.json();
  } catch (e) {
    console.error('Sync feedbacks failed:', e);
    return { success: false, synced: 0, message: '网络错误' };
  }
}

export async function syncScoreFeedbacks(userId: string, feedbacks: Array<{
  scoreId: string;
  suggestionKey: string;
  title: string;
  dimension: string;
  liked: boolean;
  disliked: boolean;
  updatedAt: string;
}>): Promise<SyncFeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/sync-score-feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        feedbacks,
      }),
    });
    return await response.json();
  } catch (e) {
    console.error('Sync score feedbacks failed:', e);
    return { success: false, synced: 0, message: '网络错误' };
  }
}

// 后台管理 API
export interface AdminLoginResponse {
  token: string;
  username: string;
}

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '登录失败');
  }
  return await response.json();
}

export async function getDashboardStats(token: string, startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取数据失败');
  }
  return await response.json();
}

export async function getUsers(token: string, page: number, pageSize: number, keyword?: string): Promise<any> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (keyword) {
    params.append('keyword', keyword);
  }
  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取用户列表失败');
  }
  return await response.json();
}

export async function getUserDetail(token: string, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取用户详情失败');
  }
  return await response.json();
}

// 反馈分析 API
export async function getFeedbackAnalysis(token: string, dimension?: string): Promise<any> {
  const params = dimension ? `?dimension=${dimension}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/feedback/analysis${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取反馈分析失败');
  }
  return await response.json();
}

export async function getFeedbackTrend(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/feedback/trend`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取反馈趋势失败');
  }
  return await response.json();
}

export async function getLowRatedFeedback(token: string, limit?: number): Promise<any> {
  const params = limit ? `?limit=${limit}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/feedback/low-rated${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取低评分反馈失败');
  }
  return await response.json();
}

export async function getScoreFeedbackList(token: string, filters?: {
  type?: string;
  dimension?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.dimension) params.append('dimension', filters.dimension);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/feedback/score/list${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取评图反馈列表失败');
  }
  return await response.json();
}

export async function getScoreFeedbackStats(token: string, filters?: {
  type?: string;
  dimension?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.dimension) params.append('dimension', filters.dimension);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/feedback/score/stats${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取评图反馈统计失败');
  }
  return await response.json();
}

// ==================== 用户文字反馈 ====================

export async function submitTextFeedback(data: {
  userId: string;
  username: string;
  category: string;
  content: string;
  contact?: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export async function getTextFeedbackList(token: string, filters?: {
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/feedback/text/list${query}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取文字反馈列表失败');
  return await response.json();
}

export async function updateTextFeedbackStatus(token: string, id: number, status: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/feedback/text/${id}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('更新反馈状态失败');
  return await response.json();
}

// 本周挑战
export interface WeeklyChallengeData {
  id: string;
  url: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  author: string;
  authorUrl: string;
  startDate: string;
  endDate: string;
}

export async function getWeeklyChallenge(): Promise<WeeklyChallengeData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/weekly-challenge`);
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.error('Get weekly challenge failed:', e);
    return null;
  }
}

export async function setWeeklyChallenge(token: string, data: {
  id?: string;
  url: string;
  title: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  author?: string;
  authorUrl?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/weekly-challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('设置失败');
  return await response.json();
}

export async function uploadImage(token: string, file: File): Promise<{ success: boolean; url: string; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '上传失败');
  }
  return await response.json();
}

// 关注/取消关注用户
export async function toggleUserFollow(followerId: string, targetId: string): Promise<{
  success: boolean;
  isFollowing: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/users/toggle-follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId, targetId }),
  });
  if (!response.ok) throw new Error('关注操作失败');
  return await response.json();
}

// 社区作品
export interface CommunityWork {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  authorLevel: number;
  authorStars: number;
  authorCompletedCount: number;
  authorStreak: number;
  authorFollowers: number;
  authorFollowing: number;
  topAchievements: string[];
  topWorks: string[];
  image: string;
  votes: number;
  createdAt: string;
}

export async function getCommunityWorks(): Promise<{ success: boolean; data: CommunityWork[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/community-works`);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Get community works failed:', e);
    return { success: false, data: [] };
  }
}

export async function submitCommunityWork(work: Omit<CommunityWork, 'id' | 'votes'>): Promise<{ success: boolean; message: string; data?: CommunityWork }> {
  try {
    const response = await fetch(`${API_BASE_URL}/community-works`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(work),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Submit community work failed:', e);
    return { success: false, message: '提交失败' };
  }
}

export async function voteCommunityWork(workId: string, userId: string): Promise<{ success: boolean; data?: CommunityWork }> {
  try {
    const response = await fetch(`${API_BASE_URL}/community-works/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workId, userId }),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Vote community work failed:', e);
    return { success: false };
  }
}

export async function deleteCommunityWork(workId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/community-works/${workId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Delete community work failed:', e);
    return { success: false, message: '删除失败' };
  }
}

// 评测集管理 API
export interface EvalSet {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvalImage {
  id: number;
  evalSetId: number;
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  status: string;
  groundTruthScene: string;
  groundTruthLight: string;
  groundTruthComp: string;
  groundTruthParams: string;
  groundTruthPost: string;
  groundTruthEquip: string;
  createdAt: string;
  updatedAt: string;
}

export async function getEvalSets(token: string, page?: number, pageSize?: number, status?: string, keyword?: string): Promise<any> {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (pageSize) params.append('pageSize', String(pageSize));
  if (status) params.append('status', status);
  if (keyword) params.append('keyword', keyword);
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取评测集失败');
  }
  return await response.json();
}

export async function createEvalSet(token: string, data: { name: string; description?: string; category?: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('创建评测集失败');
  }
  return await response.json();
}

export async function getEvalSetDetail(token: string, id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取评测集详情失败');
  }
  return await response.json();
}

export async function updateEvalSet(token: string, id: number, data: Partial<EvalSet>): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('更新评测集失败');
  }
  return await response.json();
}

export async function deleteEvalSet(token: string, id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('删除评测集失败');
  }
  return await response.json();
}

export async function addEvalImage(token: string, evalSetId: number, data: { imageUrl: string; title?: string; description?: string; category?: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${evalSetId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('添加评测图片失败');
  }
  return await response.json();
}

export async function updateEvalImage(token: string, evalSetId: number, imageId: number, data: Partial<EvalImage>): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${evalSetId}/images/${imageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('更新评测图片失败');
  }
  return await response.json();
}

export async function deleteEvalImage(token: string, evalSetId: number, imageId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/eval-sets/${evalSetId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('删除评测图片失败');
  }
  return await response.json();
}

// 系统配置 API
export async function getSystemConfigs(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/configs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('获取系统配置失败');
  }
  return await response.json();
}

export async function updateSystemConfig(token: string, key: string, value: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/configs/${key}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    throw new Error('更新配置失败');
  }
  return await response.json();
}

// ============== 日志上报（前台调用） ==============

export async function reportAiCall(data: {
  userId: string;
  apiType: string;
  imageUrl?: string;
  category?: string;
  durationMs: number;
  status: string;
  errorMsg?: string;
}): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logs/ai-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('Report AI call failed:', e);
  }
}

export async function reportUnsplashCall(data: {
  userId: string;
  action: string;
  query?: string;
  category?: string;
  resultCount?: number;
  durationMs?: number;
  status: string;
  errorMsg?: string;
}): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logs/unsplash-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('Report Unsplash call failed:', e);
  }
}

export async function reportPageVisit(data: {
  userId: string;
  sessionId: string;
  page: string;
  pageTitle: string;
  referrer: string;
  staySec?: number;
}): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logs/page-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('Report page visit failed:', e);
  }
}

// ============== 日志统计（管理后台调用） ==============

export async function getAiCallStats(token: string, startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/logs/ai-stats${query}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取AI调用统计失败');
  return await response.json();
}

export async function getAiCallList(token: string, startDate?: string, endDate?: string, page = 1, pageSize = 20): Promise<any> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await fetch(`${API_BASE_URL}/admin/logs/ai-list?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取AI调用日志失败');
  return await response.json();
}

export async function getUnsplashCallStats(token: string, startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/logs/unsplash-stats${query}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取Unsplash调用统计失败');
  return await response.json();
}

export async function getUnsplashCallList(token: string, startDate?: string, endDate?: string, page = 1, pageSize = 20): Promise<any> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await fetch(`${API_BASE_URL}/admin/logs/unsplash-list?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取Unsplash调用日志失败');
  return await response.json();
}

export async function getPageVisitStats(token: string, startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/logs/page-visit-stats${query}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取页面访问统计失败');
  return await response.json();
}

export async function getPageVisitList(token: string, startDate?: string, endDate?: string, page = 1, pageSize = 20): Promise<any> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await fetch(`${API_BASE_URL}/admin/logs/page-visit-list?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('获取页面访问日志失败');
  return await response.json();
}
