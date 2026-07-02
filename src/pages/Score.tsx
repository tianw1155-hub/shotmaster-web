import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, RefreshCw, ChevronRight, Loader2, Home, Sparkles } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel, chapterInfo } from '../services/levelService';
import { TopBar, BottomNav, RewardModal } from '../components/game/GameComponents';
import { Card, Badge, Button, RingProgress } from '../components/ui/Button';

export function ScorePage() {
  const { levelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, capturedImage, score, isScoring, compareImages, loadLevel, currentLevel, checkAchievements, setCapturedImage } = useGameStore();
  const [showReward, setShowReward] = useState(false);
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const lid = parseInt(levelId || '1');
  const fromCommunity = searchParams.get('from') === 'community';
  const level = currentLevel || getLevel(lid, user.levelStars[lid] || 0, user.completedLevels.includes(lid));

  useEffect(() => {
    if (capturedImage && !score && !isScoring) {
      compareImages(level.referenceImage.url, capturedImage, lid);
    }
  }, []);

  useEffect(() => {
    // 社区挑战模式不显示奖励弹窗
    if (score && score.overall >= 60 && !fromCommunity) {
      const newAch = checkAchievements();
      setNewAchievements(newAch);
      setTimeout(() => setShowReward(true), 1500);
    }
  }, [score]);

  if (!capturedImage) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <TopBar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-ink-secondary mb-4">还没有作品</p>
          <Button variant="primary" onClick={() => navigate(`/level/${lid}`)}>返回关卡</Button>
        </div>
        <BottomNav active={fromCommunity ? 'community' : 'levels'} />
      </div>
    );
  }

  if (isScoring || !score) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <TopBar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-ink mb-1">AI 正在评分...</h2>
          <p className="text-ink-secondary text-sm">对比参考图与你的作品</p>
        </div>
        <BottomNav active={fromCommunity ? 'community' : 'levels'} />
      </div>
    );
  }

  const scoreItems = [
    { label: '构图', value: score.composition, color: 'bg-sky' },
    { label: '光线', value: score.lighting, color: 'bg-sun' },
    { label: '色彩', value: score.color, color: 'bg-grape' },
    { label: '相似度', value: score.similarity, color: 'bg-mint' },
  ];

  const xpGained = score.stars === 3 ? 200 : score.stars === 2 ? 100 : 50;

  const handleRetake = () => {
    setCapturedImage(null);
    navigate(`/shoot/${lid}`);
  };

  const handleNext = () => {
    setShowReward(false);
    setCapturedImage(null);
    if (fromCommunity) {
      // 从社区挑战来的，返回社区挑战页面
      navigate('/community');
    } else {
      // 从关卡来的，进入下一关
      navigate(`/level/${lid + 1}`);
    }
  };

  const handleClose = () => {
    setShowReward(false);
    // 关闭弹窗后，留在当前页面展示完整的 AI 评图详情
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 星级展示 */}
        <section className="text-center animate-bounce-in">
          <div className="flex justify-center gap-3 mb-3">
            {[1, 2, 3].map(i => (
              <svg
                key={i}
                className={`w-16 h-16 ${i <= score.stars ? 'text-sun animate-star-pop' : 'text-gray-200'}`}
                style={{ animationDelay: `${i * 200}ms` }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {fromCommunity
              ? (score.stars === 3 ? '太棒了！' : score.stars === 2 ? '做得不错！' : '评分完成')
              : (score.stars === 3 ? '完美通关！' : score.stars === 2 ? '做得不错！' : score.overall >= 60 ? '通关成功！' : '再接再厉')}
          </h1>
          <p className="text-ink-secondary text-sm mt-1">
            总分 {score.overall} 分
          </p>
        </section>

        {/* 对比视图 */}
        <section className="animate-slide-up">
          <Card className="overflow-hidden">
            {compareMode === 'split' ? (
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50">
                <div className="relative">
                  <img src={level.referenceImage.url} alt="参考" className="w-full aspect-square object-cover rounded-2xl" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-white text-xs">参考图</span>
                </div>
                <div className="relative">
                  <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover rounded-2xl" />
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-primary rounded-md text-white text-xs">你的作品</span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square">
                <img src={capturedImage} alt="作品" className="w-full h-full object-cover rounded-2xl" />
                <img src={level.referenceImage.url} alt="参考" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30" />
              </div>
            )}
          </Card>
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setCompareMode(prev => prev === 'split' ? 'overlay' : 'split')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 text-ink-secondary text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {compareMode === 'split' ? '叠加对比' : '分屏对比'}
            </button>
          </div>
        </section>

        {/* 相似度评分 */}
        <section className="flex items-center justify-around animate-slide-up">
          <RingProgress value={score.similarity} size={90} label="相似度" />
          <div className="flex-1 pl-6 space-y-2">
            {scoreItems.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-secondary">{item.label}</span>
                  <span className="text-sm font-bold text-ink">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 改进建议 */}
        <Card className="p-4 animate-slide-up">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 改进建议
          </h3>
          <ul className="space-y-2">
            {score.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 操作按钮 */}
        {fromCommunity ? (
          // 社区挑战模式：只显示返回社区按钮
          <div className="space-y-3 animate-slide-up">
            <Button variant="primary" className="w-full" onClick={() => { setCapturedImage(null); navigate('/community'); }}>
              返回社区挑战
            </Button>
          </div>
        ) : (
          // 关卡模式：显示关卡相关按钮
          <>
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              <Button variant="secondary" onClick={handleRetake}>
                <RefreshCw className="w-4 h-4" />
                重新拍摄
              </Button>
              {score.overall >= 60 ? (
                <Button variant="primary" onClick={() => setShowReward(true)}>
                  <ChevronRight className="w-4 h-4" />
                  查看奖励
                </Button>
              ) : (
                <Button variant="primary" onClick={handleRetake}>
                  再试一次
                </Button>
              )}
            </div>

            <Button variant="ghost" className="w-full" onClick={() => { setCapturedImage(null); navigate('/', { replace: true }); }}>
              <Home className="w-4 h-4" />
              返回关卡地图
            </Button>
          </>
        )}
      </main>

      <BottomNav active={fromCommunity ? 'community' : 'levels'} />

      {/* 通关奖励弹窗 */}
      <RewardModal
        show={showReward}
        xp={xpGained}
        stars={score.stars}
        streak={user.streak}
        onClose={handleClose}
        onNext={handleNext}
        fromCommunity={fromCommunity}
      />

      {/* 成就解锁提示 - 仅关卡模式显示 */}
      {!fromCommunity && newAchievements.length > 0 && !showReward && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 animate-slide-up">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-sun/90 to-mint/90 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-white font-medium text-sm">解锁新成就！</p>
              <p className="text-white/80 text-xs">{newAchievements.join('、')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
