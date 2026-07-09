import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Lightbulb, Camera, Upload, Lock, X, Sparkles, Star, ThumbsUp, ThumbsDown, Target } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel, chapterInfo } from '../services/levelService';
import { Card, Badge, Button, RingProgress } from '../components/ui/Button';
import { Level, ShootingPlan, Score, ShootingPlanDimension } from '../types';
import { PageLayout } from '../components/layout/PageLayout';
import { HeroBack } from '../components/ui/HeroBack';
import { InteractiveLesson } from '../components/lesson/InteractiveLesson';
import { PlanSections } from '../components/lesson/PlanSections';
import { exposureConfig } from '../components/lesson/concepts/exposure';

// AI 评图详情卡片
function ScoreDetailCard({
  score,
  capturedImage,
  referenceImage,
  levelTitle,
  scoreId,
  onClose,
}: {
  score: Score;
  capturedImage: string;
  referenceImage: string;
  levelTitle: string;
  scoreId: string;
  onClose: () => void;
}) {
  const { toggleLikeSuggestion, toggleDislikeSuggestion, getSuggestionFeedback, toggleLikeFeedback, toggleDislikeFeedback, getFeedbackItemFeedback } = useGameStore();
  const scoreItems = [
    { label: '构图', value: score.composition, color: 'bg-ink-muted' },
    { label: '光线', value: score.lighting, color: 'bg-gold' },
    { label: '色彩', value: score.color, color: 'bg-ink-muted' },
    { label: '相似度', value: score.similarity, color: 'bg-ink-muted' },
  ];

  return (
    <Card className="overflow-hidden animate-slide-up border-2 border-accent/20">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-3 right-3 w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-ink-secondary hover:bg-surface transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 标题 */}
      <div className="p-4 bg-accent/5">
        <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI 评图详情
        </h3>
        <p className="text-ink-muted text-sm">{levelTitle}</p>
      </div>

      {/* 星级展示 */}
      <div className="p-4 text-center border-b border-line">
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <Star
              key={i}
              className={`w-8 h-8 ${i <= score.stars ? 'text-gold fill-gold' : 'text-ink-muted'}`}
            />
          ))}
        </div>
        <p className="text-2xl font-bold text-ink">{score.overall} 分</p>
        <p className="text-sm text-ink-secondary">
          {score.overall >= 60 ? '✓ 已通关' : '未及格，继续加油'}
        </p>
      </div>

      {/* 对比图 */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-surface-muted">
        <div className="relative bg-ink">
          <img src={referenceImage} alt="参考" className="w-full aspect-square object-contain rounded-md" loading="lazy" />
          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs">参考图</span>
        </div>
        <div className="relative">
          <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover rounded-md" loading="lazy" />
          <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-accent rounded text-white text-xs">你的作品</span>
        </div>
      </div>

      {/* 详细分数 */}
      <div className="p-4">
        <div className="flex items-center justify-around mb-4">
          <RingProgress value={score.similarity} size={80} label="相似度" />
          <div className="flex-1 pl-4 space-y-2">
            {scoreItems.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-ink-secondary">{item.label}</span>
                  <span className="text-xs font-bold text-ink">{item.value}</span>
                </div>
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 优点 */}
        {score.strengths && score.strengths.length > 0 && (
          <div className="bg-green-50 rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-ink mb-2 flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-accent" />做得好的地方</p>
            <ul className="space-y-1">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                  <span className="w-4 h-4 rounded-full bg-accent/12 flex items-center justify-center text-accent text-xs flex-shrink-0 mt-0.5">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 分维度改进建议 */}
        {score.suggestions && score.suggestions.length > 0 ? (
          <div className="bg-surface-muted rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-ink mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4 text-accent" />改进建议</p>
            <div className="space-y-3">
              {score.suggestions.map((s, i) => {
                const suggestionKey = `${s.dimension}-${s.title}-${i}`;
                const feedback = getSuggestionFeedback(scoreId, suggestionKey);
                return (
                  <div key={i} className="border-b border-line pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        s.priority === 'high' ? 'bg-red-50 text-red-600' :
                        s.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-surface-card text-ink-secondary'
                      }`}>
                        {s.priority === 'high' ? '重要' : s.priority === 'medium' ? '建议' : '可选'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-card text-ink-secondary text-xs">{s.dimension}</span>
                      <span className="font-medium text-ink text-xs">{s.title}</span>
                    </div>
                    <div className="space-y-1 text-xs text-ink-secondary">
                      <p><span className="font-medium text-ink">问题：</span>{s.problem}</p>
                      <p><span className="font-medium text-ink">分析：</span>{s.analysis}</p>
                      <p><span className="font-medium text-ink">方法：</span>{s.method}</p>
                      <p><span className="font-medium text-ink">参考：</span>{s.referencePoint}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-line/50">
                      <span className="text-[10px] text-ink-muted mr-0.5">有用吗？</span>
                      <button
                        onClick={() => toggleLikeSuggestion(scoreId, suggestionKey, { title: s.title, dimension: s.dimension })}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          feedback.liked
                            ? 'bg-accent/12 text-accent'
                            : 'bg-surface-card text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        有用
                      </button>
                      <button
                        onClick={() => toggleDislikeSuggestion(scoreId, suggestionKey, { title: s.title, dimension: s.dimension })}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          feedback.disliked
                            ? 'bg-red-50 text-red-500'
                            : 'bg-surface-card text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        没用
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : score.feedback && score.feedback.length > 0 && (
          /* 兼容旧版 */
          <div className="bg-surface-muted rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-ink mb-2">💡 改进建议</p>
            <ul className="space-y-2">
              {score.feedback.map((f, i) => {
                const feedback = getFeedbackItemFeedback(scoreId, i);
                return (
                  <li key={i} className="border-b border-line pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-2 text-xs text-ink-secondary mb-1.5">
                      <ChevronRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-ink-muted mr-0.5">有用吗？</span>
                      <button
                        onClick={() => toggleLikeFeedback(scoreId, i)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          feedback.liked
                            ? 'bg-accent/12 text-accent'
                            : 'bg-surface-card text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        有用
                      </button>
                      <button
                        onClick={() => toggleDislikeFeedback(scoreId, i)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          feedback.disliked
                            ? 'bg-red-50 text-red-500'
                            : 'bg-surface-card text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        没用
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 总结 */}
        {score.summary && (
          <div className="bg-accent/5 rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-ink mb-2 flex items-center gap-1"><Target className="w-4 h-4 text-accent" />总结</p>
            <div className="space-y-1 text-xs">
              <p className="text-ink"><span className="font-medium">水平：</span>{score.summary.level}</p>
              <p className="text-ink"><span className="font-medium">提升：</span>{score.summary.mainImprovement}</p>
              <p className="text-ink"><span className="font-medium">下一步：</span>{score.summary.nextPractice}</p>
              <p className="text-accent font-medium">{score.summary.encouragement}</p>
            </div>
          </div>
        )}

        {/* 快速小贴士 */}
        {score.quickTips && score.quickTips.length > 0 && (
          <div className="bg-gold/5 rounded-md p-3">
            <p className="text-sm font-medium text-ink mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4 text-gold" />快速小贴士</p>
            <ul className="space-y-1">
              {score.quickTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                  <span className="w-4 h-4 rounded-full bg-gold/12 flex items-center justify-center text-gold text-xs flex-shrink-0 mt-0.5">💡</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export function LevelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, maxUnlockedLevel, shootingPlan, isAnalyzing, generateShootingPlan, loadLevel, currentLevel, lastScore, lastScoreLevelId, lastCapturedImage, clearLastScore, toggleLikeDimension, toggleDislikeDimension, getDimensionFeedback } = useGameStore();
  const [showLesson, setShowLesson] = useState(false);

  const levelId = parseInt(id || '1');
  const level = currentLevel || getLevel(levelId, user.levelStars[levelId] || 0, user.completedLevels.includes(levelId));

  // 是否显示 AI 评图详情
  const showScoreDetail = lastScore && lastScoreLevelId === levelId && lastCapturedImage;

  useEffect(() => {
    loadLevel(levelId);
  }, [levelId]);

  // 如果关卡未解锁
  if (levelId > maxUnlockedLevel) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-ink-muted" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink mb-2">关卡未解锁</h2>
          <p className="text-ink-secondary text-sm mb-6">请先完成前面的关卡</p>
          <Button variant="primary" onClick={() => navigate('/')}>返回关卡地图</Button>
        </div>
      </PageLayout>
    );
  }

  // 生成拍摄计划
  useEffect(() => {
    if (!shootingPlan && level.status !== 'locked') {
      generateShootingPlan(level.referenceImage.url);
    }
  }, []);

  const info = chapterInfo[level.chapter];

  const handleStartShoot = () => {
    clearLastScore(); // 开始新拍摄时清除旧评分
    navigate(`/shoot/${levelId}`);
  };

  const handleUpload = () => {
    clearLastScore(); // 开始新上传时清除旧评分
    navigate(`/shoot/${levelId}?mode=upload`);
  };

  const handleCloseScoreDetail = () => {
    clearLastScore();
  };

  const handleLikeDimension = (dimension: ShootingPlanDimension) => {
    toggleLikeDimension(`level_${levelId}`, dimension, {
      imageUrl: level?.referenceImage?.url || '',
      imageTitle: level?.title || `关卡${levelId}`,
      category: level?.referenceImage?.category || '',
    });
  };

  const handleDislikeDimension = (dimension: ShootingPlanDimension) => {
    toggleDislikeDimension(`level_${levelId}`, dimension, {
      imageUrl: level?.referenceImage?.url || '',
      imageTitle: level?.title || `关卡${levelId}`,
      category: level?.referenceImage?.category || '',
    });
  };

  // 曝光练习课件覆盖
  if (showLesson) {
    return (
      <PageLayout>
        <InteractiveLesson concept={exposureConfig} onComplete={() => setShowLesson(false)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout desktop="split">
      <div className="max-w-lg lg:max-w-none pt-2 pb-6 space-y-5">
        {/* 参考图 */}
        <section className="relative animate-fade-in bg-ink">
          <motion.div layoutId={`lvl-${levelId}`}>
            <img src={level.referenceImage.url} alt={level.title} className="w-full max-h-[70vh] object-contain mx-auto" loading="lazy" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
          <HeroBack onClick={() => navigate('/')} />
          {level.referenceImage.author && (
            <a
              href={level.referenceImage.authorUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white text-xs flex items-center gap-1 hover:bg-black/80 transition"
            >
              <Camera className="w-3 h-3" />
              Photo by {level.referenceImage.author}
            </a>
          )}
        </section>

        <div className="px-4 -mt-8 relative z-10 space-y-4">
          {/* 标题 */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{info.icon}</span>
              <span className="text-sm text-ink-muted">第 {level.id} 关 · {info.label}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">{level.title}</h1>
            <div className="flex items-center gap-2">
              <Badge color="primary">及格分 {level.passScore}</Badge>
              <Badge color="sun">难度 {'★'.repeat(level.difficulty)}</Badge>
              {level.stars > 0 && <Badge color="mint">已获 {level.stars}★</Badge>}
            </div>
          </div>

          {/* AI 评图详情卡片（如果有） */}
          {showScoreDetail && (
            <ScoreDetailCard
              score={lastScore}
              capturedImage={lastCapturedImage}
              referenceImage={level.referenceImage.url}
              levelTitle={level.title}
              scoreId={`score_level_${levelId}`}
              onClose={handleCloseScoreDetail}
            />
          )}

          {/* 约束条件 */}
          {level.constraints && level.constraints.length > 0 && (
            <Card className="p-4 animate-slide-up border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-accent mb-2">📋 拍摄约束</h3>
              <div className="flex flex-wrap gap-2">
                {level.constraints.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-accent/5 text-accent text-xs font-medium">{c}</span>
                ))}
              </div>
            </Card>
          )}

          {/* AI 拍摄计划 */}
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.25} />
                AI 拍摄计划
              </h2>
            </div>

            <PlanSections
              plan={shootingPlan}
              isAnalyzing={isAnalyzing}
              onLike={handleLikeDimension}
              onDislike={handleDislikeDimension}
              getFeedback={(dim) => getDimensionFeedback(`level_${levelId}`, dim)}
            />
          </div>

          {/* 操作按钮 */}
          {!isAnalyzing && shootingPlan && (
            <div className="grid grid-cols-3 gap-3 animate-slide-up">
              <Button variant="primary" size="lg" onClick={handleStartShoot}>
                <Camera className="w-5 h-5" />
                实时拍摄
              </Button>
              <Button variant="secondary" size="lg" onClick={handleUpload}>
                <Upload className="w-5 h-5" />
                上传作品
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowLesson(true)}>
                <Lightbulb className="w-5 h-5" />
                练习曝光
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}