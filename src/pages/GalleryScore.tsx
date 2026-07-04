import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, ChevronRight, Camera } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Button, RingProgress } from '../components/ui/Button';

export function GalleryScorePage() {
  const navigate = useNavigate();
  const { user, capturedImage, score, isScoring, compareImages, weeklyChallengeImage, setCapturedImage, clearScore } = useGameStore();
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');

  const referenceImage = weeklyChallengeImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';

  useEffect(() => {
    if (capturedImage && !score && !isScoring) {
      compareImages(referenceImage, capturedImage, 1);
    }
  }, []);

  if (!capturedImage) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <TopBar title="AI 评分" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-ink-secondary mb-4">还没有作品</p>
          <Button variant="primary" onClick={() => navigate('/gallery')}>
            返回图库
          </Button>
        </div>
        <BottomNav active="gallery" />
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
          <p className="text-ink-secondary text-sm">对比参考图与你的作品</p>
        </div>
        <BottomNav active="gallery" />
      </div>
    );
  }

  const scoreItems = [
    { label: '构图', value: score.composition, color: 'bg-ink-muted' },
    { label: '光线', value: score.lighting, color: 'bg-gold' },
    { label: '色彩', value: score.color, color: 'bg-ink-muted' },
    { label: '相似度', value: score.similarity, color: 'bg-ink-muted' },
  ];

  const handleBackToGallery = () => {
    setCapturedImage(null);
    clearScore();
    navigate('/gallery');
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopBar title="评分结果" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
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

        <section className="animate-slide-up">
          <Card className="overflow-hidden">
            {compareMode === 'split' ? (
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface-muted">
                <div className="relative">
                  <img src={referenceImage} alt="参考" className="w-full aspect-square object-cover rounded-md" loading="lazy" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-white text-xs">参考图</span>
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

        <Card className="p-4 animate-slide-up">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI 改进建议
          </h3>
          <ul className="space-y-2">
            {score.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3 animate-slide-up">
          <Button variant="primary" className="w-full" onClick={handleBackToGallery}>
            <Camera className="w-5 h-5" />
            返回图库
          </Button>
        </div>

        <div className="text-center animate-slide-up">
          <p className="text-ink-muted text-sm">
            获得 <span className="text-accent font-bold">+{score.stars === 3 ? 200 : score.stars === 2 ? 100 : 50}</span> 经验值
          </p>
        </div>
      </main>

      <BottomNav active="gallery" />
    </div>
  );
}
