import { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, ChevronRight, Sparkles, Home, ThumbsUp, ThumbsDown, Lightbulb, Target } from 'lucide-react';
import { Card, Button, RingProgress } from '../ui/Button';
import { motion } from 'framer-motion';
import { variants } from '../../lib/motion';
import { Confetti } from '../ui/Confetti';
import { useGameStore } from '../../stores/useGameStore';

interface ScoreSuggestion {
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  analysis: string;
  method: string;
  referencePoint: string;
}

interface ScoreSummary {
  level: string;
  mainImprovement: string;
  nextPractice: string;
  encouragement: string;
}

interface ScoreData {
  overall: number; stars: 0 | 1 | 2 | 3;
  composition: number; lighting: number; color: number; similarity: number;
  feedback: string[];
  strengths?: string[];
  suggestions?: ScoreSuggestion[];
  summary?: ScoreSummary;
  quickTips?: string[];
}
interface Props {
  score: ScoreData;
  capturedImage: string;
  referenceImage: { url: string; title: string };
  scoreId: string;
  fromCommunity?: boolean;
  onRetake: () => void;
  onNext: () => void;
  onHome: () => void;
}
export function ScoreResultView({ score, capturedImage, referenceImage, scoreId, fromCommunity, onRetake, onNext, onHome }: Props) {
  const { toggleLikeSuggestion, toggleDislikeSuggestion, getSuggestionFeedback, toggleLikeFeedback, toggleDislikeFeedback, getFeedbackItemFeedback } = useGameStore();
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const [revealed, setRevealed] = useState(false);
  const [scoreNum, setScoreNum] = useState(0);
  const [ringNum, setRingNum] = useState(0);
  const items = [
    { label: '构图', value: score.composition },
    { label: '光线', value: score.lighting },
    { label: '色彩', value: score.color },
    { label: '相似度', value: score.similarity },
  ];
  const headline = fromCommunity
    ? score.stars === 3 ? '太棒了！' : score.stars === 2 ? '做得不错！' : '评分完成'
    : score.stars === 3 ? '完美通关！' : score.stars === 2 ? '做得不错！' : score.overall >= 60 ? '通关成功！' : '再接再厉';

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // count-up score
  useEffect(() => {
    if (!revealed) return;
    let raf = 0; const start = performance.now(); const dur = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setScoreNum(Math.round(score.overall * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealed, score.overall]);

  // count-up ring
  useEffect(() => {
    if (!revealed) return;
    let raf = 0; const start = performance.now(); const dur = 1000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setRingNum(Math.round(score.similarity * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealed, score.similarity]);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-5">
      <motion.section variants={variants.fadeUp} initial="hidden" animate="show" className="text-center">
        <div className="relative flex justify-center gap-3 mb-3">
          {revealed && (
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(177,74,58,.32),rgba(177,74,58,0) 70%)', animation: 'burst 900ms cubic-bezier(.22,1,.36,1) forwards' }}
            />
          )}
          {score.stars === 3 && revealed && (
            <Confetti count={30} className="absolute inset-0 pointer-events-none z-10" />
          )}
          {[1, 2, 3].map((i) => (
            <motion.svg
              key={i}
              variants={variants.starPop}
              initial="hidden"
              animate={revealed ? 'show' : 'hidden'}
              transition={{ delay: 0.18 + i * 0.15 }}
              className={`w-14 h-14 ${i <= score.stars ? 'text-gold' : 'text-line'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </motion.svg>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold">{headline}</h1>
        <p className="text-ink-secondary text-sm mt-1 font-mono">总分 {scoreNum} 分</p>
        <motion.div variants={variants.lineDraw} initial="hidden" animate={revealed ? 'show' : 'hidden'} transition={{ delay: 0.7 }} className="h-px bg-accent mx-auto w-1/2 origin-left mt-3" />
      </motion.section>

      <motion.section variants={variants.fadeUp} initial="hidden" animate="show">
        <Card className="overflow-hidden">
          {compareMode === 'split' ? (
            <div className="grid grid-cols-2 gap-px bg-line">
              <div className="relative">
                <img src={referenceImage.url} alt="参考" className="w-full aspect-square object-cover" loading="lazy" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-ink/60 text-white text-xs rounded-sm">参考图</span>
              </div>
              <div className="relative">
                <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover" loading="lazy" />
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-accent text-white text-xs rounded-sm">你的作品</span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square">
              <img src={capturedImage} alt="作品" className="w-full h-full object-cover" loading="lazy" />
              <img src={referenceImage.url} alt="参考" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
            </div>
          )}
        </Card>
        <div className="flex justify-center mt-3">
          <button onClick={() => setCompareMode((p) => (p === 'split' ? 'overlay' : 'split'))} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-line text-ink-secondary text-sm hover:bg-surface-muted transition-colors">
            <ArrowLeftRight className="w-4 h-4" />
            {compareMode === 'split' ? '叠加对比' : '分屏对比'}
          </button>
        </div>
      </motion.section>

      <motion.section variants={variants.fadeUp} initial="hidden" animate="show" className="flex flex-wrap items-center justify-around gap-4">
        <RingProgress value={revealed ? ringNum : 0} size={90} label="相似度" />
        <div className="flex-1 min-w-[200px] pl-2 space-y-2">
          {items.map((it) => (
            <div key={it.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-secondary">{it.label}</span>
                <span className="text-sm font-mono font-bold text-ink">{it.value}</span>
              </div>
              <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-ink rounded-full transition-all duration-slow ease-editorial" style={{ width: `${it.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 优点展示 */}
      {score.strengths && score.strengths.length > 0 && (
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-accent" />做得好的地方</h3>
            <ul className="space-y-2">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <span className="w-5 h-5 rounded-full bg-accent/12 flex items-center justify-center text-accent text-xs flex-shrink-0 mt-0.5">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* 分维度改进建议 */}
      {score.suggestions && score.suggestions.length > 0 && (
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />AI 改进建议</h3>
            <div className="space-y-4">
              {score.suggestions.map((s, i) => {
                const suggestionKey = `${s.dimension}-${s.title}-${i}`;
                const feedback = getSuggestionFeedback(scoreId, suggestionKey);
                return (
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
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-line/50">
                      <span className="text-xs text-ink-muted mr-1">这条建议有用吗？</span>
                      <button
                        onClick={() => toggleLikeSuggestion(scoreId, suggestionKey)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          feedback.liked
                            ? 'bg-accent/12 text-accent'
                            : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        有用
                      </button>
                      <button
                        onClick={() => toggleDislikeSuggestion(scoreId, suggestionKey)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          feedback.disliked
                            ? 'bg-red-50 text-red-500'
                            : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        没用
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 整体总结 */}
      {score.summary && (
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <Card className="p-4 bg-accent/5">
            <h3 className="font-medium mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-accent" />总结</h3>
            <div className="space-y-2 text-sm">
              <p className="text-ink"><span className="font-medium">水平：</span>{score.summary.level}</p>
              <p className="text-ink"><span className="font-medium">提升方向：</span>{score.summary.mainImprovement}</p>
              <p className="text-ink"><span className="font-medium">下一步：</span>{score.summary.nextPractice}</p>
              <p className="text-accent font-medium">{score.summary.encouragement}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 快速小贴士 */}
      {score.quickTips && score.quickTips.length > 0 && (
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-gold" />快速小贴士</h3>
            <ul className="space-y-2">
              {score.quickTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <span className="w-5 h-5 rounded-full bg-gold/12 flex items-center justify-center text-gold text-xs flex-shrink-0 mt-0.5">💡</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* 兼容旧版：当没有新数据时显示feedback */}
      {(!score.suggestions || score.suggestions.length === 0) && score.feedback && score.feedback.length > 0 && (
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />AI 改进建议</h3>
            <ul className="space-y-3">
              {score.feedback.map((f, i) => {
                const feedback = getFeedbackItemFeedback(scoreId, i);
                return (
                  <li key={i} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-2 text-sm text-ink-secondary mb-2">
                      <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted mr-1">这条建议有用吗？</span>
                      <button
                        onClick={() => toggleLikeFeedback(scoreId, i)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          feedback.liked
                            ? 'bg-accent/12 text-accent'
                            : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        有用
                      </button>
                      <button
                        onClick={() => toggleDislikeFeedback(scoreId, i)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          feedback.disliked
                            ? 'bg-red-50 text-red-500'
                            : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        没用
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </motion.div>
      )}

      {fromCommunity || score.overall >= 60 ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onRetake}><RefreshCw className="w-4 h-4" />重新拍摄</Button>
          <Button variant="accent" onClick={onNext}><ChevronRight className="w-4 h-4" />{fromCommunity ? '返回社区' : '下一关'}</Button>
        </div>
      ) : (
        <Button variant="accent" onClick={onRetake}><RefreshCw className="w-4 h-4" />再试一次</Button>
      )}
      <Button variant="ghost" className="w-full" onClick={onHome}><Home className="w-4 h-4" />返回关卡地图</Button>
    </div>
  );
}