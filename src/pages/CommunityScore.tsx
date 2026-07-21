import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Button, RingProgress } from '../components/ui/Button';

export function CommunityScorePage() {
  const navigate = useNavigate();
  const { user, capturedImage, score, isScoring, compareImages, weeklyChallengeImage, setCapturedImage, clearScore, addCommunityWork, toggleLikeFeedback, toggleDislikeFeedback, getFeedbackItemFeedback } = useGameStore();
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const [hasAddedWork, setHasAddedWork] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);

  // 使用本周挑战图片作为参考图
  const referenceImage = weeklyChallengeImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';

  useEffect(() => {
    if (capturedImage && !score && !isScoring) {
      // 使用本周挑战图片进行评分
      compareImages(referenceImage, capturedImage, 1);
    }
  }, []);

  if (!capturedImage) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <TopBar title="AI 评分" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-ink-secondary mb-4">还没有作品</p>
          <Button variant="primary" onClick={() => navigate('/community')}>
            返回社区挑战
          </Button>
        </div>
        <BottomNav active="community" />
      </div>
    );
  }

  if (isScoring || !score) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <TopBar title="AI 评分" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink mb-1">AI 正在评分...</h2>
          <p className="text-ink-secondary text-sm">对比本周挑战参考图与你的作品</p>
        </div>
        <BottomNav active="community" />
      </div>
    );
  }

  const scoreItems = [
    { label: '构图', value: score.composition, color: 'bg-ink-muted' },
    { label: '光线', value: score.lighting, color: 'bg-gold' },
    { label: '色彩', value: score.color, color: 'bg-ink-muted' },
    { label: '相似度', value: score.similarity, color: 'bg-ink-muted' },
  ];

  const handleBackToCommunity = () => {
    if (capturedImage && score && !hasAddedWork) {
      // 先显示上传确认对话框
      setShowUploadConfirm(true);
    } else {
      // 已经处理过了，直接返回
      setCapturedImage(null);
      clearScore();
      navigate('/community');
    }
  };

  const handleUploadConfirm = async (shouldUpload: boolean) => {
    if (shouldUpload && capturedImage && score && !hasAddedWork) {
      const newWork = {
        id: `user_${Date.now()}`,
        author: user.name,
        avatar: user.avatar,
        authorId: user.id,
        authorLevel: user.level,
        authorStars: Object.values(user.levelStars).reduce((a, b) => a + b, 0),
        authorCompletedCount: user.completedLevels.length,
        authorStreak: user.streak,
        authorFollowers: 0,
        authorFollowing: user.following?.length || 0,
        topAchievements: user.achievements.filter(a => a.unlocked).map(a => a.name),
        topWorks: [capturedImage],
        image: capturedImage,
        votes: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      await addCommunityWork(newWork);
      setHasAddedWork(true);
    }
    setShowUploadConfirm(false);
    setCapturedImage(null);
    clearScore();
    navigate('/community');
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopBar title="评分结果" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 评分完成提示 */}
        <section className="text-center animate-bounce-in">
          <div className="flex justify-center gap-3 mb-3">
            {[1, 2, 3].map(i => (
              <svg
                key={i}
                className={`w-14 h-14 ${i <= score.stars ? 'text-gold animate-star-pop' : 'text-line'}`}
                style={{ animationDelay: `${i * 200}ms` }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">
            {score.stars === 3 ? '太棒了！' : score.stars === 2 ? '做得不错！' : '评分完成'}
          </h1>
          <p className="text-ink-secondary text-sm">总分 {score.overall} 分</p>
        </section>

        {/* 对比视图 */}
        <section className="animate-slide-up">
          <Card className="overflow-hidden">
            {compareMode === 'split' ? (
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface-muted">
                <div className="relative">
                  <img src={referenceImage} alt="参考" className="w-full aspect-square object-cover rounded-md" loading="lazy" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-white text-xs">本周挑战</span>
                </div>
                <div className="relative">
                  <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover rounded-md" loading="lazy" />
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-accent rounded-md text-white text-xs">你的作品</span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square">
                <img src={capturedImage} alt="作品" className="w-full h-full object-cover rounded-md" loading="lazy" />
                <img src={referenceImage} alt="参考" className="absolute inset-0 w-full h-full object-cover rounded-md opacity-30" loading="lazy" />
              </div>
            )}
          </Card>
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setCompareMode(prev => prev === 'split' ? 'overlay' : 'split')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-line text-ink-secondary text-sm hover:bg-surface-muted transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {compareMode === 'split' ? '叠加对比' : '分屏对比'}
            </button>
          </div>
        </section>

        {/* 评分详情 */}
        <section className="flex items-center justify-around animate-slide-up">
          <RingProgress value={score.similarity} size={90} label="相似度" />
          <div className="flex-1 pl-6 space-y-2">
            {scoreItems.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-secondary">{item.label}</span>
                  <span className="text-sm font-bold text-ink">{item.value}</span>
                </div>
                <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI 改进建议 */}
        <Card className="p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              AI 改进建议
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">整体评价有用吗？</span>
              <button
                onClick={() => toggleLikeFeedback('community', 0)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  getFeedbackItemFeedback('community', 0).liked
                    ? 'bg-accent/12 text-accent'
                    : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                有用
              </button>
              <button
                onClick={() => toggleDislikeFeedback('community', 0)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  getFeedbackItemFeedback('community', 0).disliked
                    ? 'bg-red-50 text-red-500'
                    : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                没用
              </button>
            </div>
          </div>
          {score.suggestions && score.suggestions.length > 0 ? (
            <div className="space-y-4">
              {score.suggestions.map((s, i) => (
                <div key={i} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      s.priority === 'high' ? 'bg-red-50 text-red-600' :
                      s.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-surface-muted text-ink-secondary'
                    }`}>
                      {s.priority === 'high' ? '重要' : s.priority === 'medium' ? '建议' : '可选'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-muted text-ink-secondary text-xs">{s.dimension}</span>
                    <span className="font-medium text-ink text-sm">{s.title}</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-ink-secondary">
                    <p><span className="font-medium text-ink">问题：</span>{s.problem}</p>
                    <p><span className="font-medium text-ink">分析：</span>{s.analysis}</p>
                    <p><span className="font-medium text-ink">方法：</span>{s.method}</p>
                    <p><span className="font-medium text-ink">参考：</span>{s.referencePoint}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : score.feedback && score.feedback.length > 0 ? (
            <ul className="space-y-3">
              {score.feedback.map((f, i) => (
                <li key={i} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-2 text-sm text-ink-secondary">
                    <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        {/* 返回按钮 */}
        <div className="animate-slide-up">
          <Button variant="primary" className="w-full" onClick={handleBackToCommunity}>
            返回社区挑战
          </Button>
        </div>

        {/* 上传确认对话框 */}
        {showUploadConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-md w-full max-w-sm mx-4 p-6 animate-slide-up">
              <h3 className="font-display text-lg font-bold text-ink text-center mb-2">上传到排行榜</h3>
              <p className="text-ink-secondary text-sm text-center mb-6">是否将您的作品上传到本周排行榜？</p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full" onClick={() => handleUploadConfirm(true)}>
                  上传并参与排行
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => handleUploadConfirm(false)}>
                  暂不上传
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 经验值提示 */}
        <div className="text-center animate-slide-up">
          <p className="text-ink-muted text-sm">
            获得 <span className="text-accent font-bold">+{score.stars === 3 ? 200 : score.stars === 2 ? 100 : 50}</span> 经验值
          </p>
        </div>
      </main>

      <BottomNav active="community" />
    </div>
  );
}