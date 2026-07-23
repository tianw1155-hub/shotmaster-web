import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trophy, Clock, Camera, X, Flame, Star, Target, User, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/useGameStore';
import { PageLayout } from '../components/layout/PageLayout';
import { Badge, Button } from '../components/ui/Button';
import { variants } from '../lib/motion';
import type { CommunityWork } from '../types';

// 用户详情弹窗
function UserDetailModal({
  work,
  onClose,
  isVoted,
  onVote,
}: {
  work: CommunityWork;
  onClose: () => void;
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
    topAchievements: work?.topAchievements || [],
    topWorks: work?.topWorks || [],
    image: work?.image || '',
    votes: work?.votes || 0,
    createdAt: work?.createdAt || '',
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      variants={variants.fadeIn}
      initial="hidden"
      animate="show"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-lg bg-surface-card rounded-md max-h-[85vh] flex flex-col overflow-hidden"
        variants={variants.scaleIn}
        initial="hidden"
        animate="show"
        exit="hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 用户信息头部（固定） */}
        <div className="flex-shrink-0 bg-surface-card border-b border-line">
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-muted/95 backdrop-blur flex items-center justify-center text-ink-secondary hover:bg-ink-muted/15 transition-colors z-20"
          >
            <X className="w-4 h-4" strokeWidth={1.25} />
          </button>
          
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-gold/20 flex items-center justify-center text-3xl">
                {workData.avatar || '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-bold text-ink">{workData.author || '未知用户'}</h2>
                  <Badge color="gold">Lv.{workData.authorLevel || 1}</Badge>
                </div>
                <p className="text-ink-muted text-sm">{workData.authorCompletedCount || 0} 关已通关 · {workData.authorStreak || 0} 天连胜</p>
              </div>
            </div>
          </div>
        </div>

        {/* 可滚动内容区 */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain" 
          onWheelCapture={(e) => {
            const target = e.currentTarget;
            if (e.deltaY < 0 && target.scrollTop === 0) {
              e.preventDefault();
            }
            if (e.deltaY > 0 && target.scrollTop + target.clientHeight >= target.scrollHeight) {
              e.preventDefault();
            }
          }}
          onTouchMoveCapture={(e) => {
            const target = e.currentTarget;
            const touch = e.touches[0];
            if (touch && target.scrollTop === 0 && touch.clientY < e.currentTarget.getBoundingClientRect().top + 50) {
              e.preventDefault();
            }
            if (touch && target.scrollTop + target.clientHeight >= target.scrollHeight && touch.clientY > e.currentTarget.getBoundingClientRect().bottom - 50) {
              e.preventDefault();
            }
          }}
        >
          {/* 主要成就 */}
          <div className="px-6 py-4 border-b border-line">
            <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" strokeWidth={1.25} />
              主要成就
            </h3>
            <div className="flex flex-wrap gap-2">
              {(workData.topAchievements || []).map((ach, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium">
                  {ach}
                </span>
              ))}
            </div>
          </div>

          {/* 统计数据 */}
          <div className="px-6 py-4 border-b border-line">
            <h3 className="font-medium text-ink mb-3">数据概览</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-muted rounded-md p-3 text-center">
                <Star className="w-5 h-5 mx-auto text-gold mb-1" strokeWidth={1.25} />
                <p className="text-lg font-bold text-ink">{workData.authorStars || 0}</p>
                <p className="text-xs text-ink-muted">总星数</p>
              </div>
              <div className="bg-surface-muted rounded-md p-3 text-center">
                <Target className="w-5 h-5 mx-auto text-accent mb-1" strokeWidth={1.25} />
                <p className="text-lg font-bold text-ink">{workData.authorCompletedCount || 0}</p>
                <p className="text-xs text-ink-muted">已通关</p>
              </div>
              <div className="bg-surface-muted rounded-md p-3 text-center">
                <Flame className="w-5 h-5 mx-auto text-accent mb-1" strokeWidth={1.25} />
                <p className="text-lg font-bold text-ink">{workData.authorStreak || 0}</p>
                <p className="text-xs text-ink-muted">连胜</p>
              </div>
            </div>
          </div>

          {/* 主要作品 */}
          <div className="px-6 py-4">
            <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" strokeWidth={1.25} />
              主要作品
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(workData.topWorks || []).map((imgUrl, idx) => (
                <div key={idx} className="aspect-square rounded-md overflow-hidden">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* 本周作品 */}
          <div className="px-6 py-4 pb-8">
            <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" strokeWidth={1.25} />
              本周作品
            </h3>
            <div className="rounded-md overflow-hidden">
              <img src={workData.image || ''} alt="" className="w-full aspect-square object-cover" loading="lazy" />
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-ink-muted text-xs">{workData.createdAt || ''}</span>
              <button
                onClick={onVote}
                disabled={isVoted}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isVoted
                    ? 'bg-accent/12 text-accent cursor-not-allowed'
                    : 'bg-accent/5 text-accent hover:bg-accent/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isVoted ? 'fill-accent' : ''}`} strokeWidth={1.25} />
                {workData.votes || 0} 票
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WeeklyChallengeCard({
  weeklyChallenge,
  onChallengeClick,
}: {
  weeklyChallenge: { url: string; title: string };
  onChallengeClick: () => void;
}) {
  return (
    <div className="border border-line rounded-md overflow-hidden">
      <div className="relative">
        <img src={weeklyChallenge.url} alt={weeklyChallenge.title} className="w-full aspect-video object-cover" loading="lazy" />
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-accent text-surface text-xs font-bold flex items-center gap-1">
          <Clock className="w-3 h-3" strokeWidth={1.25} />
          还剩 3 天
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-ink">本周挑战</h2>
            <p className="text-ink-muted text-sm">{weeklyChallenge.title}</p>
          </div>
          <Badge color="accent">进行中</Badge>
        </div>
        <Button variant="primary" className="w-full" onClick={onChallengeClick}>
          <Camera className="w-4 h-4" strokeWidth={1.25} />
          我要挑战
        </Button>
      </div>
    </div>
  );
}

export function CommunityPage() {
  const navigate = useNavigate();
  const { communityWorks = [], voteWork, galleryImages = [], isVoted, removeCommunityWork, user, weeklyChallengeImage, weeklyChallengeInfo, refreshWeeklyChallenge, fetchCommunityWorks } = useGameStore();
  const [selectedWork, setSelectedWork] = useState<CommunityWork | null>(null);
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'mine'>('hot');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<CommunityWork | null>(null);

  React.useEffect(() => {
    refreshWeeklyChallenge();
    fetchCommunityWorks();
  }, [refreshWeeklyChallenge, fetchCommunityWorks]);

  const weeklyChallenge = weeklyChallengeInfo || { url: weeklyChallengeImage, title: '本周挑战' };

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
      // 兜底：如果用户ID不是默认的 '1'，同时匹配 authorId='1'（游客模式上传的作品）
      const currentUserId = user.id;
      return communityWorks.filter(w => {
        if (w.authorId === currentUserId) return true;
        if (currentUserId !== '1' && w.authorId === '1') return true;
        return false;
      });
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

  return (
    <PageLayout desktop="split">
      {/* ===== 左侧：主信息流 ===== */}
      <div className="space-y-5">
        {/* 页头 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">社区挑战</h1>
          <p className="text-ink-secondary text-sm">每周一张参考图，全员模仿投票</p>
        </motion.div>

        {/* 移动端：本周挑战内联（桌面端在右侧栏显示） */}
        <div className="lg:hidden">
          <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
            <WeeklyChallengeCard
              weeklyChallenge={weeklyChallenge}
              onChallengeClick={() => navigate('/shoot/1?mode=upload&from=community')}
            />
          </motion.div>
        </div>

        {/* 排行榜 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy className="w-5 h-5 text-gold" strokeWidth={1.25} />
            <h2 className="font-display font-bold text-lg text-ink">本周排行</h2>
          </div>

          {/* 标签页切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('hot')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'hot'
                  ? 'bg-accent text-surface'
                  : 'bg-surface-muted text-ink-secondary hover:bg-ink-muted/15'
              }`}
            >
              <Flame className="w-4 h-4" strokeWidth={1.25} />
              最热
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-accent text-surface'
                  : 'bg-surface-muted text-ink-secondary hover:bg-ink-muted/15'
              }`}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.25} />
              最新
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'mine'
                  ? 'bg-accent text-surface'
                  : 'bg-surface-muted text-ink-secondary hover:bg-ink-muted/15'
              }`}
            >
              <User className="w-4 h-4" strokeWidth={1.25} />
              我的
            </button>
          </div>

          {/* 我的标签页：显示已上传数量 */}
          {activeTab === 'mine' && filteredWorks.length > 0 && (
            <div className="bg-accent/5 rounded-md p-3 mb-4 flex items-center justify-between">
              <p className="text-accent text-sm">您已上传 {filteredWorks.length} 张作品</p>
            </div>
          )}

          {/* 我的标签页为空 */}
          {activeTab === 'mine' && filteredWorks.length === 0 && (
            <div className="border border-line rounded-md p-6 text-center mb-4">
              <Camera className="w-10 h-10 mx-auto text-ink-muted mb-2" strokeWidth={1.25} />
              <p className="text-ink-secondary text-sm mb-1">还没有上传过作品</p>
              <p className="text-ink-muted text-xs">参与本周挑战并上传作品</p>
            </div>
          )}

          {/* 最热标签页：显示 TOP 3（领奖台布局：3、1、2） */}
          {activeTab === 'hot' && filteredWorks.length > 0 && (
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
                    <motion.div
                      key={work.id}
                      className={`relative ${rank === 1 ? 'mt-0' : 'mt-6'}`}
                      variants={variants.stagger(idx)}
                      initial="hidden"
                      animate="show"
                    >
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-surface z-10 ${
                        rank === 1 ? 'bg-gold' : rank === 2 ? 'bg-ink-muted' : 'bg-warning'
                      }`}>
                        {rank}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(work);
                        }}
                        aria-label={`查看 ${work.author} 的主页`}
                        className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-surface-card shadow-elevated flex items-center justify-center text-lg hover:scale-110 transition-transform z-10"
                      >
                        {work.avatar}
                      </button>
                      <div className="rounded-md overflow-hidden shadow-elevated">
                        <img src={work.image} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <button
                          onClick={() => voteWork(work.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            isVoted(work.id)
                              ? 'bg-accent/10 text-accent'
                              : 'bg-surface-muted text-ink-secondary hover:text-accent'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-accent' : ''}`} strokeWidth={1.25} />
                          {work.votes}
                        </button>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          )}

          {/* 最热标签页：其他作品（2 列网格 hairline） */}
          {activeTab === 'hot' && filteredWorks.length > 3 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredWorks.slice(3).map((work, idx) => (
                <motion.div
                  key={work.id}
                  className="border border-line rounded-md overflow-hidden"
                  variants={variants.stagger(idx)}
                  initial="hidden"
                  animate="show"
                >
                  <img src={work.image} alt="" className="w-full aspect-square object-cover" loading="lazy" />
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
                            ? 'bg-accent/10 text-accent'
                            : 'bg-surface-muted text-ink-secondary hover:text-accent'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-accent' : ''}`} strokeWidth={1.25} />
                        {work.votes}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 最新和我的标签页：统一网格展示（hairline） */}
          {activeTab !== 'hot' && filteredWorks.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredWorks.map((work, idx) => (
                <motion.div
                  key={work.id}
                  className="border border-line rounded-md overflow-hidden"
                  variants={variants.stagger(idx)}
                  initial="hidden"
                  animate="show"
                >
                  <div className="relative">
                    <img src={work.image} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                    {/* 我的标签页：下架按钮 */}
                    {activeTab === 'mine' && (work.authorId === user.id || (user.id !== '1' && work.authorId === '1')) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWork(work);
                        }}
                        aria-label="下架作品"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/50 flex items-center justify-center text-surface hover:bg-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.25} />
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
                            ? 'bg-accent/10 text-accent'
                            : 'bg-surface-muted text-ink-secondary hover:text-accent'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isVoted(work.id) ? 'fill-accent' : ''}`} strokeWidth={1.25} />
                        {work.votes}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 投票提示 */}
        <motion.div
          className="border border-line rounded-md p-4 text-center"
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
        >
          <p className="text-ink-secondary text-sm">
            <Heart className="w-4 h-4 inline align-text-bottom text-accent mr-0.5" strokeWidth={1.25} />
            为喜欢的作品投票
          </p>
          <p className="text-ink-muted text-xs mt-1">点击头像查看用户详情</p>
        </motion.div>
      </div>

      {/* ===== 右侧栏：桌面端侧栏 ===== */}
      <aside className="hidden lg:block space-y-5">
        <div className="sticky top-24 space-y-5">
          <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
            <WeeklyChallengeCard
              weeklyChallenge={weeklyChallenge}
              onChallengeClick={() => navigate('/shoot/1?mode=upload&from=community')}
            />
          </motion.div>

          {/* 桌面端排行榜快照 */}
          <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
            <div className="border border-line rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-gold" strokeWidth={1.25} />
                <h3 className="font-bold text-ink">排行榜</h3>
              </div>
              <div className="divide-y divide-line">
                {[...communityWorks]
                  .sort((a, b) => (b?.votes || 0) - (a?.votes || 0))
                  .slice(0, 5)
                  .map((work, idx) => (
                    <button
                      key={work.id}
                      onClick={() => handleAvatarClick(work)}
                      className="w-full flex items-center gap-3 py-2.5 hover:bg-surface-muted/60 transition-colors text-left"
                    >
                      <span className={`w-5 text-center text-xs font-bold ${
                        idx === 0 ? 'text-gold' : idx === 1 ? 'text-ink-muted' : 'text-warning'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-lg">{work.avatar}</span>
                      <span className="flex-1 text-sm text-ink truncate">{work.author}</span>
                      <span className="text-xs text-ink-muted flex items-center gap-0.5">
                        <Heart className="w-3 h-3" strokeWidth={1.25} />
                        {work.votes}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* 用户详情弹窗 */}
      {selectedWork && (
        <UserDetailModal
          work={selectedWork}
          onClose={handleCloseModal}
          isVoted={typeof isVoted === 'function' ? isVoted(selectedWork?.id || '') : false}
          onVote={() => selectedWork?.id && voteWork(selectedWork.id)}
        />
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && workToDelete && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
          variants={variants.fadeIn}
          initial="hidden"
          animate="show"
          exit="hidden"
          onClick={cancelDelete}
        >
          <motion.div
            className="bg-surface-card rounded-md w-full max-w-sm mx-4 p-6"
            variants={variants.scaleIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/12 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-danger" strokeWidth={1.25} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink text-center mb-2">确认下架作品</h3>
            <p className="text-ink-secondary text-sm text-center mb-6">下架后作品将从排行榜中移除，无法恢复。</p>
            <div className="space-y-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3 rounded-md bg-danger text-surface font-medium hover:bg-danger/90 transition-colors"
              >
                确认下架
              </button>
              <button
                onClick={cancelDelete}
                className="w-full py-3 rounded-md bg-surface-muted text-ink-secondary font-medium hover:bg-ink-muted/15 transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageLayout>
  );
}
