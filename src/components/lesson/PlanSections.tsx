import { useState } from 'react';
import { Sun, Lightbulb, Grid3X3, Camera, Palette, Package, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Loader2, Sparkles } from 'lucide-react';
import type { ShootingPlan, ShootingPlanDimension } from '../../types';

interface PlanSectionsProps {
  plan: ShootingPlan | null;
  isAnalyzing: boolean;
  onLike: (dim: ShootingPlanDimension) => void;
  onDislike: (dim: ShootingPlanDimension) => void;
  getFeedback: (dim: ShootingPlanDimension) => { liked: boolean; disliked: boolean };
}

export function PlanSections({ plan, isAnalyzing, onLike, onDislike, getFeedback }: PlanSectionsProps) {
  const [expanded, setExpanded] = useState<string | null>('scene');

  const sections: { key: ShootingPlanDimension; icon: React.ElementType; title: string; color: string; content: (plan: ShootingPlan) => React.ReactNode }[] = [
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
          <p className="text-gold text-xs mt-2 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.25} />
            {p.lighting.suggestion}
          </p>
        </div>
      ),
    },
    {
      key: 'composition', icon: Grid3X3, title: '构图', color: 'text-ink-muted',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-1">{p.composition.rule}</p>
          <p className="text-ink-secondary text-sm">{p.composition.details}</p>
        </div>
      ),
    },
    {
      key: 'params', icon: Camera, title: '参数建议', color: 'text-ink-muted',
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
      key: 'postProcessing', icon: Palette, title: '后期调色', color: 'text-ink-muted',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-2">{p.postProcessing.style}</p>
          <ul className="space-y-1">
            {p.postProcessing.steps.map((s, i) => (
              <li key={i} className="text-ink-secondary text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: 'equipment', icon: Package, title: '推荐装备', color: 'text-ink-muted',
      content: (p) => (
        <div className="space-y-1 text-sm">
          <p className="text-ink-secondary">相机：<span className="text-ink font-medium">{p.equipment.camera}</span></p>
          <p className="text-ink-secondary">镜头：<span className="text-ink font-medium">{p.equipment.lens}</span></p>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.equipment.accessories.map((a, i) => (
              <span key={i} className="px-2 py-1 rounded-full bg-ink-muted/5 text-ink-secondary text-xs">{a}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  if (isAnalyzing || !plan) {
    return (
      <div className="p-6 text-center rounded-md border border-line">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" strokeWidth={1.25} />
        <p className="text-ink-secondary text-sm">AI 正在分析参考图...</p>
        <p className="text-ink-muted text-xs mt-1">生成结构化拍摄计划</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map(({ key, icon: Icon, title, color, content }) => {
        const isExpanded = expanded === key;
        const feedback = getFeedback(key);
        return (
          <div key={key} className="border border-line rounded-md overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : key)}
              className="w-full p-3 flex items-center justify-between hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.25} />
                </div>
                <span className="font-medium text-ink text-sm">{title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(key); }}
                  aria-label="这部分建议有用"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    feedback.liked
                      ? 'bg-success/12 text-success'
                      : 'bg-surface-muted text-ink-muted hover:bg-surface'
                  }`}
                  title="这部分建议有用"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${feedback.liked ? 'fill-current' : ''}`} strokeWidth={1.25} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDislike(key); }}
                  aria-label="这部分建议没用"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    feedback.disliked
                      ? 'bg-danger/12 text-danger'
                      : 'bg-surface-muted text-ink-muted hover:bg-surface'
                  }`}
                  title="这部分建议没用"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${feedback.disliked ? 'fill-current' : ''}`} strokeWidth={1.25} />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-ink-muted ml-1" strokeWidth={1.25} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-muted ml-1" strokeWidth={1.25} />
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-line">
                <div className="pt-3">{content(plan)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
