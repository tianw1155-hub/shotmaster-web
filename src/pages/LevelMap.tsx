import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, ChevronDown } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel } from '../services/levelService';
import { PageLayout } from '../components/layout/PageLayout';

type LessonStatus = 'locked' | 'available' | 'completed';

interface LevelNode {
  id: number;
  status: LessonStatus;
  stars: number;
  title: string;
  chapterKey: string;
  chapterName: string;
}

const CHAPTERS = [
  { key: 'composition', name: '构图基础篇', color: '#6B8E7F', light: '#E8F0EC', dark: '#4F6E61' },
  { key: 'light', name: '光线运用篇', color: '#C9A24A', light: '#F4ECD6', dark: '#9A7A36' },
  { key: 'color', name: '色彩搭配篇', color: '#9B6B8A', light: '#ECE2EC', dark: '#735066' },
  { key: 'narrative', name: '叙事技巧篇', color: '#6B7B95', light: '#E5E9EF', dark: '#525F73' },
  { key: 'master', name: '综合大师篇', color: '#A56B5A', light: '#F0E4DE', dark: '#7C5043' },
];

const LEVELS_PER_CHAPTER = 10;

const getChapter = (levelId: number) => {
  if (levelId > 50) {
    // 51关以后显示为随机挑战
    return CHAPTERS[0]; // 返回一个默认章节
  }
  const chapterIdx = Math.floor((levelId - 1) / LEVELS_PER_CHAPTER);
  return CHAPTERS[Math.min(chapterIdx, CHAPTERS.length - 1)];
};

const getChapterRound = (levelId: number) => {
  if (levelId > 50) return 2;
  return 1;
};

export function LevelMapPage() {
  const navigate = useNavigate();
  const { user, maxUnlockedLevel } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 构建节点 —— 50关固定 + 无限挑战关
  const nodes = useMemo(() => {
    const totalLevels = Math.max(maxUnlockedLevel + 6, 50);
    const list: LevelNode[] = [];

    for (let id = 1; id <= totalLevels; id++) {
      const chapter = getChapter(id);
      const completed = user.completedLevels.includes(id);
      const stars = user.levelStars[id] || 0;
      const level = getLevel(id, stars, completed);
      const round = getChapterRound(id);

      let chapterName = chapter.name;
      if (id > 50) {
        chapterName = '随机挑战';
      } else if (round > 1) {
        chapterName = `${chapter.name} ${round}周目`;
      }

      list.push({
        id,
        status: completed ? 'completed' : id <= maxUnlockedLevel ? 'available' : 'locked',
        stars,
        title: level.title,
        chapterKey: id > 50 ? 'challenge' : chapter.key,
        chapterName,
      });
    }

    return list;
  }, [user.completedLevels, user.levelStars, maxUnlockedLevel]);

  // 按章节分组
  const chapters = useMemo(() => {
    const map = new Map<string, LevelNode[]>();
    nodes.forEach(node => {
      const key = `${node.chapterKey}-${getChapterRound(node.id)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(node);
    });
    return Array.from(map.entries()).map(([key, levels]) => ({
      key,
      chapterKey: levels[0].chapterKey,
      chapterName: levels[0].chapterName,
      levels,
    }));
  }, [nodes]);

  const totalCompleted = user.completedLevels.length;
  const totalStars = user.totalStars;

  useEffect(() => {
    const el = document.getElementById(`map-node-${maxUnlockedLevel}`);
    if (el && scrollRef.current) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [maxUnlockedLevel]);

  const handleClick = (node: LevelNode) => {
    if (node.status === 'locked') return;
    navigate(`/level/${node.id}`);
  };

  return (
    <PageLayout>
      {/* 游客提示 */}
      {user.isGuest && (
        <div className="fixed top-0 inset-x-0 bg-warning text-white px-4 py-3 text-center text-sm font-medium z-50">
          ⚠️ 游客模式，记录不会保存
        </div>
      )}

      <div className="max-w-lg mx-auto pt-2 pb-6 space-y-5">
        {/* 欢迎区 */}
        <section className="pl-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">摄影之路</h1>
        </section>

        {/* 数据概览 */}
        <section className="flex gap-3">
          <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
            <p className="text-2xl font-mono font-bold text-accent">{totalCompleted}</p>
            <p className="text-xs text-ink-muted mt-0.5">已通关</p>
          </div>
          <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
            <p className="text-2xl font-mono font-bold text-gold">{totalStars}</p>
            <p className="text-xs text-ink-muted mt-0.5">总星数</p>
          </div>
          <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
            <p className="text-2xl font-mono font-bold text-ink">Lv.{user.level}</p>
            <p className="text-xs text-ink-muted mt-0.5">等级</p>
          </div>
        </section>

        {/* 章节关卡列表 */}
        <section className="space-y-4">
          {chapters.map(chapter => {
            const chapterInfo = CHAPTERS.find(c => c.key === chapter.chapterKey)!;
            return (
              <div key={chapter.key} className="bg-surface-card rounded-md border border-line overflow-hidden">
                {/* 章节标题栏 */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${chapterInfo.light}, ${chapterInfo.color}20)` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: chapterInfo.color }}
                    >
                      {chapter.chapterName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-ink">{chapter.chapterName}</h3>
                      <p className="text-[10px] text-ink-muted">{chapter.levels.length} 个关卡</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    {chapter.levels.filter(l => l.status === 'completed').length}/{chapter.levels.length}
                  </div>
                </div>

                {/* 关卡网格 */}
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-3">
                    {chapter.levels.map(node => {
                      const isHovered = hoveredId === node.id;
                      const isCurrent = node.id === maxUnlockedLevel && node.status === 'available';
                      return (
                        <div key={node.id} className="flex flex-col items-center">
                          <button
                            id={`map-node-${node.id}`}
                            className="focus:outline-none transition-transform duration-200"
                            style={{
                              transform: `scale(${isHovered && node.status !== 'locked' ? 1.1 : 1})`,
                            }}
                            onClick={() => handleClick(node)}
                            onMouseEnter={() => setHoveredId(node.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            disabled={node.status === 'locked'}
                          >
                            <MapNode node={node} theme={chapterInfo} isCurrent={isCurrent} />
                          </button>
                          <p className="mt-1.5 text-[10px] text-ink-muted text-center line-clamp-1 w-full">
                            {node.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 底部无限提示 */}
          <div className="text-center py-2">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent bg-accent/8 px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              完成50关后解锁随机挑战
            </span>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function MapNode({
  node,
  theme,
  isCurrent,
}: {
  node: LevelNode;
  theme: { color: string; light: string; dark: string };
  isCurrent: boolean;
}) {
  const size = 48;

  if (node.status === 'locked') {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center">
          <Lock className="w-4 h-4 text-ink-muted" />
        </div>
      </div>
    );
  }

  if (node.status === 'completed') {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-sm"
          style={{ backgroundColor: theme.color }}
        />
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(135deg, ${theme.light}, ${theme.color})`,
          }}
        >
          <Check className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        {node.stars > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 bg-surface-card rounded-full px-1.5 py-0.5 shadow-sm">
            {[1, 2, 3].map(i => (
              <span key={i} className="text-[10px]" style={{ color: i <= node.stars ? '#FBBF24' : '#E5E7EB' }}>★</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {isCurrent && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: theme.color }}
          />
          <div
            className="absolute -inset-1 rounded-full border-2"
            style={{ borderColor: theme.color }}
          />
        </>
      )}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center shadow-md bg-surface-card"
        style={{
          border: `3px solid ${theme.color}`,
        }}
      >
        <span className="text-sm font-bold" style={{ color: theme.dark }}>{node.id}</span>
      </div>
    </div>
  );
}