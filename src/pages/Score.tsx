import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel } from '../services/levelService';
import { RewardModal } from '../components/game/GameComponents';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { ScoreResultView } from '../components/score/ScoreResultView';

export function ScorePage() {
  const { levelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, capturedImage, score, isScoring, compareImages, currentLevel, checkAchievements, setCapturedImage } = useGameStore();
  const [showReward, setShowReward] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const lid = parseInt(levelId || '1');
  const fromCommunity = searchParams.get('from') === 'community';
  const level = currentLevel || getLevel(lid, user.levelStars[lid] || 0, user.completedLevels.includes(lid));
  const scoreId = `level_${lid}_${Date.now()}`;

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
      <PageLayout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-ink-secondary mb-4">还没有作品</p>
          <Button variant="primary" onClick={() => navigate(`/level/${lid}`)}>返回关卡</Button>
        </div>
      </PageLayout>
    );
  }

  if (isScoring || !score) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-ink mb-1">AI 正在评分...</h2>
          <p className="text-ink-secondary text-sm">对比参考图与你的作品</p>
        </div>
      </PageLayout>
    );
  }

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
    <PageLayout>
      <ScoreResultView
        score={score}
        capturedImage={capturedImage}
        referenceImage={level.referenceImage}
        scoreId={`score_level_${lid}`}
        fromCommunity={fromCommunity}
        onRetake={handleRetake}
        onNext={handleNext}
        onHome={() => { setCapturedImage(null); navigate('/', { replace: true }); }}
      />
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
        <div className="fixed bottom-24 inset-x-0 z-40 px-4">
          <div className="max-w-lg mx-auto bg-ink text-surface rounded-md p-4 shadow-elevated flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-medium text-sm">解锁新成就！</p>
              <p className="text-surface-muted text-xs">{newAchievements.join('、')}</p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}