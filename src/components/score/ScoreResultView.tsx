import { useState } from 'react';
import { ArrowLeftRight, RefreshCw, ChevronRight, Sparkles, Home } from 'lucide-react';
import { Card, Button, RingProgress } from '../ui/Button';
import { motion } from 'framer-motion';
import { variants } from '../../lib/motion';

interface ScoreData {
  overall: number; stars: 0 | 1 | 2 | 3;
  composition: number; lighting: number; color: number; similarity: number;
  feedback: string[];
}
interface Props {
  score: ScoreData;
  capturedImage: string;
  referenceImage: { url: string; title: string };
  fromCommunity?: boolean;
  onRetake: () => void;
  onNext: () => void;
  onHome: () => void;
}
export function ScoreResultView({ score, capturedImage, referenceImage, fromCommunity, onRetake, onNext, onHome }: Props) {
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const items = [
    { label: '构图', value: score.composition },
    { label: '光线', value: score.lighting },
    { label: '色彩', value: score.color },
    { label: '相似度', value: score.similarity },
  ];
  const headline = fromCommunity
    ? score.stars === 3 ? '太棒了！' : score.stars === 2 ? '做得不错！' : '评分完成'
    : score.stars === 3 ? '完美通关！' : score.stars === 2 ? '做得不错！' : score.overall >= 60 ? '通关成功！' : '再接再厉';

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-5">
      <motion.section variants={variants.fadeUp} initial="hidden" animate="show" className="text-center">
        <div className="flex justify-center gap-3 mb-3">
          {[1, 2, 3].map((i) => (
            <svg key={i} className={`w-16 h-16 ${i <= score.stars ? 'text-gold animate-star-pop' : 'text-line'}`} style={{ animationDelay: `${i * 200}ms` }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold">{headline}</h1>
        <p className="text-ink-secondary text-sm mt-1 font-mono">总分 {score.overall} 分</p>
      </motion.section>

      <motion.section variants={variants.fadeUp} initial="hidden" animate="show">
        <Card className="overflow-hidden">
          {compareMode === 'split' ? (
            <div className="grid grid-cols-2 gap-px bg-line">
              <div className="relative">
                <img src={referenceImage.url} alt="参考" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-ink/60 text-white text-xs rounded-sm">参考图</span>
              </div>
              <div className="relative">
                <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-accent text-white text-xs rounded-sm">你的作品</span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square">
              <img src={capturedImage} alt="作品" className="w-full h-full object-cover" />
              <img src={referenceImage.url} alt="参考" className="absolute inset-0 w-full h-full object-cover opacity-30" />
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
        <RingProgress value={score.similarity} size={90} label="相似度" />
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

      <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />AI 改进建议</h3>
          <ul className="space-y-2">
            {score.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onRetake}><RefreshCw className="w-4 h-4" />重新拍摄</Button>
        <Button variant="accent" onClick={onNext}><ChevronRight className="w-4 h-4" />{fromCommunity ? '返回社区' : '下一关'}</Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={onHome}><Home className="w-4 h-4" />返回关卡地图</Button>
    </div>
  );
}