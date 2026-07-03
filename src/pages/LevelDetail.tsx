import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sun, Lightbulb, Grid3X3, Camera, Palette, Package, ChevronDown, ChevronUp, Loader2, Upload, Lock, X, Sparkles, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel, chapterInfo } from '../services/levelService';
import { Card, Badge, Button, RingProgress } from '../components/ui/Button';
import { Level, ShootingPlan, Score, ShootingPlanDimension } from '../types';
import { PageLayout } from '../components/layout/PageLayout';
import { InteractiveLesson } from '../components/lesson/InteractiveLesson';
import { exposureConfig } from '../components/lesson/concepts/exposure';

// AI 评图详情卡片
function ScoreDetailCard({
  score,
  capturedImage,
  referenceImage,
  levelTitle,
  onClose,
}: {
  score: Score;
  capturedImage: string;
  referenceImage: string;
  levelTitle: string;
  onClose: () => void;
}) {
  const scoreItems = [
    { label: '构图', value: score.composition, color: 'bg-sky' },
    { label: '光线', value: score.lighting, color: 'bg-sun' },
    { label: '色彩', value: score.color, color: 'bg-grape' },
    { label: '相似度', value: score.similarity, color: 'bg-mint' },
  ];

  return (
    <Card className="overflow-hidden animate-slide-up border-2 border-accent/20">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
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
              className={`w-8 h-8 ${i <= score.stars ? 'text-sun fill-sun' : 'text-ink-muted'}`}
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
          <img src={referenceImage} alt="参考" className="w-full aspect-square object-contain rounded-md" />
          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs">参考图</span>
        </div>
        <div className="relative">
          <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover rounded-md" />
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

        {/* 改进建议 */}
        <div className="bg-surface-muted rounded-md p-3">
          <p className="text-sm font-medium text-ink mb-2">💡 改进建议</p>
          <ul className="space-y-1">
            {score.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                <ChevronRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export function LevelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, maxUnlockedLevel, shootingPlan, isAnalyzing, generateShootingPlan, loadLevel, currentLevel, lastScore, lastScoreLevelId, lastCapturedImage, clearLastScore, toggleLikeDimension, toggleDislikeDimension, getDimensionFeedback } = useGameStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('scene');
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
    toggleLikeDimension(`level_${levelId}`, dimension);
  };

  const handleDislikeDimension = (dimension: ShootingPlanDimension) => {
    toggleDislikeDimension(`level_${levelId}`, dimension);
  };

  const planSections: { key: ShootingPlanDimension; icon: React.ElementType; title: string; color: string; content: (plan: ShootingPlan) => React.ReactNode }[] = [
    {
      key: 'scene', icon: Sun, title: '场景', color: 'text-accent',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-1">{p.scene.type}</p>
          <p className="text-ink-secondary text-sm">{p.scene.description}</p>
        </div>
      ),
    },
    {
      key: 'lighting', icon: Lightbulb, title: '光线', color: 'text-gold',
      content: (p) => (
        <div className="space-y-1 text-sm">
          <p className="text-ink-secondary">方向：<span className="text-ink font-medium">{p.lighting.direction}</span></p>
          <p className="text-ink-secondary">质量：<span className="text-ink font-medium">{p.lighting.quality}</span></p>
          <p className="text-ink-secondary">色温：<span className="text-ink font-medium">{p.lighting.colorTemp}</span></p>
          <p className="text-accent text-xs mt-2">💡 {p.lighting.suggestion}</p>
        </div>
      ),
    },
    {
      key: 'composition', icon: Grid3X3, title: '构图', color: 'text-sky',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-1">{p.composition.rule}</p>
          <p className="text-ink-secondary text-sm">{p.composition.details}</p>
        </div>
      ),
    },
    {
      key: 'params', icon: Camera, title: '参数建议', color: 'text-mint',
      content: (p) => (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-muted rounded-md p-2">
            <p className="text-xs text-ink-muted">ISO</p>
            <p className="text-sm font-medium text-ink">{p.params.iso}</p>
          </div>
          <div className="bg-surface-muted rounded-md p-2">
            <p className="text-xs text-ink-muted">光圈</p>
            <p className="text-sm font-medium text-ink">{p.params.aperture}</p>
          </div>
          <div className="bg-surface-muted rounded-md p-2">
            <p className="text-xs text-ink-muted">快门</p>
            <p className="text-sm font-medium text-ink">{p.params.shutter}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'postProcessing', icon: Palette, title: '后期调色', color: 'text-grape',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-2">{p.postProcessing.style}</p>
          <ul className="space-y-1">
            {p.postProcessing.steps.map((s, i) => (
              <li key={i} className="text-ink-secondary text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-grape" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: 'equipment', icon: Package, title: '推荐装备', color: 'text-sky',
      content: (p) => (
        <div className="space-y-1 text-sm">
          <p className="text-ink-secondary">相机：<span className="text-ink font-medium">{p.equipment.camera}</span></p>
          <p className="text-ink-secondary">镜头：<span className="text-ink font-medium">{p.equipment.lens}</span></p>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.equipment.accessories.map((a, i) => (
              <span key={i} className="px-2 py-1 rounded-full bg-sky/5 text-sky-dark text-xs">{a}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

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
            <img src={level.referenceImage.url} alt={level.title} className="w-full max-h-[70vh] object-contain mx-auto" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-card/80 backdrop-blur flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-ink rotate-180" />
          </button>
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
                🤖 AI 拍摄计划
              </h2>
            </div>

            {isAnalyzing || !shootingPlan ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                <p className="text-ink-secondary text-sm">AI 正在分析参考图...</p>
                <p className="text-ink-muted text-xs mt-1">生成结构化拍摄计划</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {planSections.map(({ key, icon: Icon, title, color, content }) => {
                  const isExpanded = expandedSection === key;
                  const dimFeedback = getDimensionFeedback(`level_${levelId}`, key);
                  return (
                    <Card key={key} className="overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : key)}
                        className="w-full p-4 flex items-center justify-between hover:bg-surface-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-md bg-surface-muted flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          <span className="font-medium text-ink">{title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLikeDimension(key); }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              dimFeedback.liked
                                ? 'bg-success/12 text-success'
                                : 'bg-surface-muted text-ink-muted hover:bg-surface'
                            }`}
                            title="这部分建议有用"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${dimFeedback.liked ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDislikeDimension(key); }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              dimFeedback.disliked
                                ? 'bg-danger/12 text-danger'
                                : 'bg-surface-muted text-ink-muted hover:bg-surface'
                            }`}
                            title="这部分建议没用"
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${dimFeedback.disliked ? 'fill-current' : ''}`} />
                          </button>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-ink-muted ml-1" /> : <ChevronDown className="w-5 h-5 text-ink-muted ml-1" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 animate-slide-up">
                          {content(shootingPlan)}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
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