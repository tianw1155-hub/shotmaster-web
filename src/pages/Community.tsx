import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trophy, Clock, ChevronRight, Camera, X, UserPlus, UserCheck, Flame, Star, Target, Users, User, TrendingUp, Sparkles, Trash2 } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Badge, Button } from '../components/ui/Button';
import type { CommunityWork } from '../types';

// 用户详情弹窗
function UserDetailModal({
  work,
  onClose,
  onFollow,
  isFollowing,
  isVoted,
  onVote,
}: {
  work: CommunityWork;
  onClose: () => void;
  onFollow: () => void;
  isFollowing: boolean;
  isVoted: boolean;
  onVote: () => void;
}) {
  // 防御性检查：确保必要字段有默认值
  const workData = {
    avatar: work?.avatar || '👤',
    author: work?.author || '未知用户',
    authorId: work?.authorId || '',
    authorLevel: work?.authorLevel || 1,
    authorStars: work?.authorStars || 0,
    authorCompletedCount: work?.authorCompletedCount || 0,
    authorStreak: work?.authorStreak || 0,
    authorFollowers: work?.authorFollowers || 0,
    authorFollowing: work?.authorFollowing || 0,
    topAchievements: work?.topAchievements || [],
    topWorks: work?.topWorks || [],
    image: work?.image || '',
    votes: work?.votes || 0,
    createdAt: work?.createdAt || '',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-ink-secondary hover:bg-gray-200 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 用户信息头部 */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-sun/20 flex items-center justify-center text-3xl">
              {workData.avatar || '👤'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-lg font-bold text-ink">{workData.author || '未知用户'}</h2>
                <Badge color="sun">Lv.{workData.authorLevel || 1}</Badge>
              </div>
              <p className="text-ink-muted text-sm">{workData.authorCompletedCount || 0} 关已通关 · {workData.authorStreak || 0} 天连胜</p>
            </div>
          </div>

          {/* 粉丝和关注 */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-ink-muted" />
              <span className="font-medium text-ink">{workData.authorFollowers || 0}</span>
              <span className="text-ink-muted text-sm">粉丝</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-ink-muted" />
              <span className="font-medium text-ink">{workData.authorFollowing || 0}</span>
              <span className="text-ink-muted text-sm">关注</span>
            </div>
          </div>

          {/* 关注按钮 */}
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size="lg"
            className="w-full mt-4"
            onClick={onFollow}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-5 h-5" />
                已关注
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                关注TA
              </>
            )}
          </Button>
        </div>

        {/* 主要成就 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-sun" />
            主要成就
          </h3>
          <div className="flex flex-wrap gap-2">
            {(workData.topAchievements || []).map((ach, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-full bg-sun/10 text-sun text-sm font-medium">
                {ach}
              </span>
            ))}
          </div>
        </div>

        {/* 统计数据 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-medium text-ink mb-3">数据概览</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Star className="w-5 h-5 mx-auto text-sun mb-1" />
              <p className="text-lg font-bold text-ink">{workData.authorStars || 0}</p>
              <p className="text-xs text-ink-muted">总星数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-ink">{workData.authorCompletedCount || 0}</p>
              <p className="text-xs text-ink-muted">已通关</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-ink">{workData.authorStreak || 0}</p>
              <p className="text-xs text-ink-muted">连胜</p>
            </div>
          </div>
        </div>

        {/* 主要作品 */}
        <div className="px-6 py-4">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            主要作品
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(workData.topWorks || []).map((imgUrl, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* 本周作品 */}
        <div className="px-6 py-4 pb-6">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            本周作品
          </h3>
          <div className="rounded-2xl overflow-hidden">
            <img src={workData.image || ''} alt="" className="w-full aspect-square object-cover" />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-ink-muted text-xs">{workData.createdAt || ''}</span>
            <button
              onClick={onVote}
              disabled={isVoted}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isVoted
                  ? 'bg-pink-100 text-pink-500 cursor-not-allowed'
                  : 'bg-primary/5 text-primary hover:bg-primary/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isVoted ? 'fill-pink-500' : ''}`} />
              {workData.votes || 0} 票
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityPage() {
  const navigate = useNavigate();
  const { communityWorks = [], voteWork, galleryImages = [], toggleFollow, isFollowing, isVoted, removeCommunityWork, user } = useGameStore();
  const [selectedWork, setSelectedWork] = useState<CommunityWork | null>(null);
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'mine'>('hot');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<CommunityWork | null>(null);

  const weeklyChallenge = galleryImages[0] || { url: '', title: '加载中...' };
  const sortedWorks = Array.isArray(communityWorks)
    ? [...communityWorks].sort((a, b) => (b?.votes || 0) - (a?.votes || 0))
    : [];

  // 根据标签页筛选作品
  const filteredWorks = useMemo(() => {
    if (activeTab === 'hot') {
      return [...communityWorks].sort((a, b) => (b?.votes || 0) - (a?.votes || 0));
    } else if (activeTab === 'new') {
      return [...communityWorks].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else {
      // 我的：筛选当前用户上传的作品
      return communityWorks.filter(w => w.authorId === user.id);
    }
  }, [communityWorks, activeTab, user.id]);

  const handleRemoveWork = (work: CommunityWork) => {
    setWorkToDelete(work);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (workToDelete) {
      removeCommunityWork(workToDelete.id);
    }
    setShowDeleteConfirm(false);
    setWorkToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setWorkToDelete(null);
  };

  const handleAvatarClick = (work: CommunityWork) => {
    if (work && work.id) {
      setSelectedWork(work);
    }
  };

  const handleCloseModal = () => {
    setSelectedWork(null);
  };

  const handleFollow = () => {
    if (selectedWork) {
      toggleFollow(selectedWork.authorId);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">社区挑战</h1>
          <p className="text-ink-secondary text-sm">每周一张参考图，全员模仿投票</p>
        </div>

        {/* 本周挑战 */}
        <Card className="overflow-hidden animate-slide-up">
          <div className="relative">
            <img src={weeklyChallenge.url} alt={weeklyChallenge.title} className="w-full aspect-video object-cover" />
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              还剩 3 天
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-lg text-ink">本周挑战</h2>
                <p className="text-ink-muted text-sm">{weeklyChallenge.title}</p>
              </div>
              <Badge color="primary">进行中</Badge>
            </div>
            <Button variant="primary" className="w-full" onClick={() => navigate('/shoot/1?mode=upload&from=community')}>
              <Camera className="w-4 h-4" />
              我要挑战
            </Button>
          </div>
        </Card>

        {/* 排行榜 */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy className="w-5 h-5 text-sun" />
            <h2 className="font-display font-bold text-lg text-ink">本周排行</h2>
          </div>

          {/* 标签页切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('hot')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'hot'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-ink-secondary hover:bg-gray-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              最热
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-ink-secondary hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              最新
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'mine'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-ink-secondary hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              我的
            </button>
          </div>

          {/* 我的标签页：显示下架按钮 */}
          {activeTab === 'mine' && filteredWorks.length > 0 && (
            <div className="bg-primary/5 rounded-xl p-3 mb-4 flex items-center justify-between">
              <p className="text-primary text-sm">您已上传 {filteredWorks.length} 张作品</p>
            </div>
          )}

          {/* 我的标签页为空 */}
          {activeTab === 'mine' && filteredWorks.length === 0 && (
            <Card className="p-6 text-center mb-4">
              <Camera className="w-10 h-10 mx-auto text-ink-muted mb-2" />
              <p className="text-ink-secondary text-sm mb-1">还没有上传过作品</p>
              <p className="text-ink-muted text-xs">参与本周挑战并上传作品</p>
            </Card>
          )}

          {/* 最热标签页：显示 TOP 3（领奖台布局：3、1、2） */}
          {activeTab === 'hot' && filteredWorks.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4 items-end">
                {(() => {
                  const top3 = filteredWorks.slice(0, 3);
                  const displayOrder = top3.length >= 3
                    ? [top3[2], top3[0], top3[1]]
                    : top3.length === 2
                      ? [top3[1], top3[0]]
                      : [top3[0]];
                  const rankOrder = top3.length >= 3
                    ? [3, 1, 2]
                    : top3.length === 2
                      ? [2, 1]
                      : [1];
                  return displayOrder.map((work, idx) => {
                    const rank = rankOrder[idx];
                    return (
                      <div key={work.id} className={`relative ${rank === 1 ? 'mt-0' : 'mt-6'}`}>
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                          rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-400' : 'bg-amber-600'
                        }`}>
                          {rank}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarClick(work);
                          }}
                          className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-lg hover:scale-110 transition-transform z-10"
                        >
                          {work.avatar}
                        </button>
                        <div className="rounded-2xl overflow-hidden shadow-md">
                          <img src={work.image} alt="" className="w-full aspect-square object-cover" />
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          <button
                            onClick={() => voteWork(work.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              isVoted(work.id)
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-100 text-ink-secondary hover:text-primary'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-primary' : ''}`} />
                            {work.votes}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}

          {/* 最热标签页：其他作品 */}
          {activeTab === 'hot' && filteredWorks.length > 3 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredWorks.slice(3).map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <img src={work.image} alt="" className="w-full aspect-square object-cover" />
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      {/* 头像可点击 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(work);
                        }}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        <span className="text-lg">{work.avatar}</span>
                        <span className="text-xs text-ink-secondary truncate">{work.author}</span>
                      </button>
                      <button
                        onClick={() => voteWork(work.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          isVoted(work.id)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-ink-secondary hover:text-primary'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-primary' : ''}`} />
                        {work.votes}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 最新和我的标签页：统一网格展示 */}
          {activeTab !== 'hot' && filteredWorks.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredWorks.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <div className="relative">
                    <img src={work.image} alt="" className="w-full aspect-square object-cover" />
                    {/* 我的标签页：下架按钮 */}
                    {activeTab === 'mine' && work.authorId === user.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWork(work);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      {/* 头像可点击 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(work);
                        }}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        <span className="text-lg">{work.avatar}</span>
                        <span className="text-xs text-ink-secondary truncate">{work.author}</span>
                      </button>
                      <button
                        onClick={() => voteWork(work.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          isVoted(work.id)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-ink-secondary hover:text-primary'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-primary' : ''}`} />
                        {work.votes}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 投票提示 */}
        <Card className="p-4 text-center animate-slide-up">
          <p className="text-ink-secondary text-sm">点击 ❤️ 为喜欢的作品投票</p>
          <p className="text-ink-muted text-xs mt-1">点击头像查看用户详情并关注</p>
        </Card>
      </main>

      {/* 用户详情弹窗 */}
      {selectedWork && (
        <UserDetailModal
          work={selectedWork}
          onClose={handleCloseModal}
          onFollow={handleFollow}
          isFollowing={typeof isFollowing === 'function' ? isFollowing(selectedWork?.authorId || '') : false}
          isVoted={typeof isVoted === 'function' ? isVoted(selectedWork?.id || '') : false}
          onVote={() => selectedWork?.id && voteWork(selectedWork.id)}
        />
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && workToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={cancelDelete}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink text-center mb-2">确认下架作品</h3>
            <p className="text-ink-secondary text-sm text-center mb-6">下架后作品将从排行榜中移除，无法恢复。</p>
            <div className="space-y-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认下架
              </button>
              <button
                onClick={cancelDelete}
                className="w-full py-3 rounded-xl bg-gray-100 text-ink-secondary font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="community" />
    </div>
  );
}