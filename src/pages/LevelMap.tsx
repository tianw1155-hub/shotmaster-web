import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Camera, Sliders, Aperture } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel } from '../services/levelService';
import { PageLayout } from '../components/layout/PageLayout';
import { variants } from '../lib/motion';
import { ChapterHeader } from '../components/ui/ChapterHeader';
import { inferCompositionRule, compositionRuleLabels } from '../utils/compositionUtils';

type LessonStatus = 'locked' | 'available' | 'completed';
interface LevelNode { id: number; status: LessonStatus; stars: number; title: string; chapterKey: string; chapterName: string; }

const CHAPTERS = [
  { key: 'composition', name: '构图基础篇', color: '#6B8E7F' },
  { key: 'light', name: '光线运用篇', color: '#B0894A' },
  { key: 'color', name: '色彩搭配篇', color: '#8E7AA0' },
  { key: 'narrative', name: '叙事技巧篇', color: '#5E7AA0' },
  { key: 'master', name: '综合大师篇', color: '#A56B5A' },
];
const PER = 10;
const chapterOf = (id: number) => CHAPTERS[Math.min(Math.floor((id - 1) / PER), CHAPTERS.length - 1)];

export function LevelMapPage() {
  const navigate = useNavigate();
  const { user, maxUnlockedLevel } = useGameStore();

  const chapters = useMemo(() => {
    const total = Math.max(maxUnlockedLevel + 5, 50);
    const list: LevelNode[] = [];
    for (let id = 1; id <= total; id++) {
      const ch = chapterOf(id);
      const completed = user.completedLevels.includes(id);
      const stars = user.levelStars[id] || 0;
      list.push({ id, status: completed ? 'completed' : id <= maxUnlockedLevel ? 'available' : 'locked', stars, title: getLevel(id, stars, completed).title, chapterKey: ch.key, chapterName: ch.name });
    }
    const map = new Map<string, LevelNode[]>();
    list.forEach(n => { const k = n.chapterKey; if (!map.has(k)) map.set(k, []); map.get(k)!.push(n); });
    return Array.from(map.entries()).map(([k, lv]) => ({ key: k, chapter: CHAPTERS.find(c => c.key === k)!, levels: lv }));
  }, [user.completedLevels, user.levelStars, maxUnlockedLevel]);

  const cur = Math.min(maxUnlockedLevel, 50);
  const curLevel = getLevel(cur, user.levelStars[cur] || 0, user.completedLevels.includes(cur));
  const curChapter = chapterOf(cur);
  const totalDone = user.completedLevels.length;
  const totalStars = user.totalStars;

  const stats = [
    { n: totalDone, label: '已通关', c: 'text-accent' },
    { n: totalStars, label: '总星数', c: 'text-gold' },
    { n: user.level, label: '等级', c: 'text-ink' },
    { n: user.streak, label: '连击 · 日', c: 'text-ink' },
  ];

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-8 lg:py-12 flex flex-col gap-8 lg:gap-10">
        {/* breadcrumb */}
        <div className="flex items-center justify-between text-[11px] tracking-[.16em] uppercase text-ink-muted font-mono">
          <span>摄影之路 <span className="text-line">／</span> <span className="text-ink font-semibold">{curChapter.name}</span></span>
          <span className="hidden md:flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent" />本周挑战 · 残 3 日</span>
        </div>

        {/* hero asymmetric */}
        <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-12 items-end">
          <div className="flex flex-col gap-4">
            <motion.div variants={variants.heroTitle} initial="hidden" animate="show" className="text-[11px] tracking-[.18em] uppercase text-accent font-mono font-semibold flex items-center gap-2">
              <Aperture className="w-4 h-4" strokeWidth={1.25} />继续 · 第 {cur} 关
            </motion.div>
            <motion.h1 variants={variants.heroTitle} initial="hidden" animate="show" className="font-display text-4xl lg:text-5xl font-medium tracking-[-.015em] leading-[1.05]">
              {curLevel.title}
            </motion.h1>
            <motion.p variants={variants.heroTitle} initial="hidden" animate="show" className="text-[13px] lg:text-sm text-ink-secondary leading-relaxed max-w-[42ch]">
              将主体置于九宫格的交叉点，让视线自然流动。本关提供实时构图叠加，与参考图逐项对照。
            </motion.p>
            <motion.div variants={variants.heroTitle} initial="hidden" animate="show" className="flex gap-2.5 mt-1">
              <button onClick={() => navigate(`/shoot/${cur}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-[#9A3D30] active:translate-y-px transition-colors duration-base">
                <Camera className="w-4 h-4" strokeWidth={1.25} />开始拍摄
              </button>
              <button onClick={() => navigate(`/level/${cur}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-line text-ink-secondary text-[13px] font-medium hover:border-ink hover:text-ink active:translate-y-px transition-colors duration-base">
                <Sliders className="w-4 h-4" strokeWidth={1.25} />拍摄详情
              </button>
            </motion.div>
          </div>
          <motion.div variants={variants.heroImage} initial="hidden" animate="show" className="relative aspect-[4/5] rounded-md overflow-hidden border border-line bg-ink">
            <img src={curLevel.referenceImage.url} alt={curLevel.title} className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)', backgroundSize: '33.3% 33.3%' }} />
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <span className="text-white/90 text-[10px] font-mono tracking-wide bg-ink/55 backdrop-blur px-2 py-1 rounded">{curLevel.title} · 参考</span>
              <span className="text-white text-[10px] font-mono tracking-wide bg-accent/80 backdrop-blur px-2 py-1 rounded">{compositionRuleLabels[inferCompositionRule(curLevel.referenceImage)]}</span>
            </div>
          </motion.div>
        </section>

        {/* stats inline divide-x */}
        <section className="flex border-y border-line py-5">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-6 lg:px-8 ${i === 0 ? 'pl-0' : ''} ${i < stats.length - 1 ? 'border-r border-line' : ''}`}>
              <span className={`block font-mono text-2xl lg:text-3xl font-medium tracking-[-.02em] ${s.c}`}>{s.n}</span>
              <span className="text-[10px] lg:text-[11px] text-ink-muted tracking-[.06em] mt-1.5 block">{s.label}</span>
            </div>
          ))}
        </section>

        {/* two col: chapters + current chapter levels */}
        <section className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-12">
          <div>
            <h3 className="text-[11px] tracking-[.16em] uppercase text-ink-muted font-semibold mb-5 flex justify-between"><span>章节进度</span><span className="font-mono">{chapters.length} ／ {CHAPTERS.length}</span></h3>
            <div className="flex flex-col">
              {chapters.map(ch => {
                const done = ch.levels.filter(l => l.status === 'completed').length;
                return <ChapterHeader key={ch.key} name={ch.chapter.name} color={ch.chapter.color} completed={done} total={ch.levels.length} />;
              })}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] tracking-[.16em] uppercase text-ink-muted font-semibold mb-5 flex justify-between"><span>本章节关卡</span><span className="font-mono">{cur} — {Math.min(cur + 4, 50)}</span></h3>
            <div className="grid grid-cols-5 gap-x-2 gap-y-5">
              {chapters.find(c => c.chapter.key === curChapter.key)!.levels.map(n => (
                <button key={n.id} disabled={n.status === 'locked'} onClick={() => navigate(`/level/${n.id}`)} aria-label={`关卡 ${n.id}: ${n.title}`} className="flex flex-col items-center gap-2 disabled:cursor-default">
                  <motion.span layoutId={`lvl-${n.id}`} className={`w-9 h-9 rounded-full border flex items-center justify-center text-[12px] font-mono ${
                    n.status === 'completed' ? 'bg-ink text-surface border-ink' :
                    n.id === cur ? 'border-accent text-accent' : 'border-line text-ink-muted bg-surface-card'}`}>
                    {n.status === 'completed' ? <Check className="w-4 h-4" strokeWidth={2} /> : n.id}
                  </motion.span>
                  <span className="text-[9px] text-ink-muted text-center line-clamp-1 w-full">{n.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
