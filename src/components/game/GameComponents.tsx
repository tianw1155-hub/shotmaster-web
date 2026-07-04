import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, Lock, Check, Camera, Image, Trophy, BookOpen, Users } from 'lucide-react';
import { Level, Stars, CompositionRule } from '../../types';
import { useGameStore } from '../../stores/useGameStore';
import { chapterInfo } from '../../services/levelService';
import { compositionRuleLabels } from '../../utils/compositionUtils';

// 参考线叠加组件
export function CompositionOverlay({ rule, showLabel = true }: { rule: CompositionRule; showLabel?: boolean }) {
  const label = compositionRuleLabels[rule] || compositionRuleLabels.none;

  const renderOverlay = () => {
    switch (rule) {
      case 'rule_of_thirds':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/40" />
              ))}
            </div>
            <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70" />
            <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70" />
            <div className="absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70" />
            <div className="absolute top-2/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70" />
          </div>
        );

      case 'symmetry':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-white/50" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 border-t-2 border-dashed border-white/30" />
          </div>
        );

      case 'leading_lines':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="50" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="50" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="25" y1="100" x2="50" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="1,2" />
              <line x1="75" y1="100" x2="50" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="1,2" />
            </svg>
          </div>
        );

      case 'framing':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg" />
            <div className="absolute inset-8 border border-white/20 rounded-md" />
          </div>
        );

      case 'foreground':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 rounded-full">
              <span className="text-white text-xs">前景区域</span>
            </div>
          </div>
        );

      case 'negative_space':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 bottom-4 left-1/2 border-2 border-dashed border-white/30 rounded-r-lg">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60 text-xs">留白区</span>
            </div>
          </div>
        );

      case 'golden_ratio':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-[61.8%] w-0.5 border-l border-white/50" />
            <div className="absolute top-[61.8%] left-0 right-0 h-0.5 border-t border-white/50" />
            <div className="absolute top-[38.2%] left-0 right-0 h-0.5 border-t border-white/30" />
            <div className="absolute top-0 bottom-0 left-[38.2%] w-0.5 border-l border-white/30" />
          </div>
        );

      case 'diagonal':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" strokeDasharray="3,2" />
              <line x1="0" y1="50" x2="50" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="2,2" />
              <line x1="50" y1="0" x2="100" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="2,2" />
            </svg>
          </div>
        );

      case 'triangles':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,10 10,90 90,90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" strokeDasharray="3,2" />
            </svg>
          </div>
        );

      case 'minimalism':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 border-2 border-dashed border-white/40 rounded-full">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 text-xs whitespace-nowrap">主体区</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderOverlay()}
      {showLabel && rule !== 'none' && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
          <span className="text-white text-xs font-medium">{label}</span>
        </div>
      )}
    </>
  );
}

// 顶部状态栏
export function TopBar({ title }: { title?: string }) {
  const { user } = useGameStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-line">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-xl shadow-sm">
            {user.avatar}
          </Link>
          <div>
            <p className="text-xs text-ink-muted">等级 {user.level}</p>
            <div className="flex items-center gap-1">
              <div className="w-24 h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-gold rounded-full transition-all duration-500"
                  style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
                />
              </div>
              <span className="text-xs text-ink-muted">{user.xp}/{user.xpToNext}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{user.streak}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// 底部导航
export function BottomNav({ active }: { active: 'levels' | 'gallery' | 'community' | 'learn' | 'profile' }) {
  const items = [
    { id: 'levels', icon: Trophy, label: '闯关', path: '/' },
    { id: 'gallery', icon: Image, label: '图库', path: '/gallery' },
    { id: 'community', icon: Users, label: '挑战', path: '/community' },
    { id: 'learn', icon: BookOpen, label: '学习', path: '/learn' },
    { id: 'profile', icon: Camera, label: '我的', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-line">
      <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
        {items.map(({ id, icon: Icon, label, path }) => (
          <Link
            key={id}
            to={path}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
              active === id ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${active === id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// 关卡节点
export function LevelNode({ level, isCurrent, onClick }: { level: Level; isCurrent: boolean; onClick: () => void }) {
  const info = chapterInfo[level.chapter];
  const colorMap: Record<string, string> = {
    mint: 'from-accent to-accent-soft',
    sky: 'from-chapter-composition to-chapter-composition',
    sun: 'from-chapter-light to-chapter-light',
    primary: 'from-chapter-narrative to-chapter-narrative',
    grape: 'from-chapter-color to-chapter-color',
  };

  if (level.status === 'locked') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center shadow-sm">
          <Lock className="w-6 h-6 text-ink-muted" />
        </div>
        <span className="text-xs text-ink-muted font-medium">{level.id}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${colorMap[info.color]} flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${
          isCurrent ? 'animate-pulse-ring ring-4 ring-white' : ''
        } ${level.status === 'completed' ? 'opacity-90' : ''}`}
      >
        <span className="text-2xl">{info.icon}</span>
        {level.status === 'completed' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center border-2 border-white">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )}
      </button>
      <div className="flex flex-col items-center gap-0.5">
        {level.stars > 0 && (
          <div className="flex gap-0.5">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={`w-3 h-3 ${i <= level.stars ? 'text-gold fill-gold' : 'text-line'}`}
              />
            ))}
          </div>
        )}
        <span className={`text-xs font-medium ${isCurrent ? 'text-ink' : 'text-ink-muted'}`}>
          {level.id}
        </span>
      </div>
    </div>
  );
}

// 连胜火焰
export function StreakFlame({ streak }: { streak: number }) {
  if (streak === 0) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
      <Flame className="w-5 h-5 text-accent animate-flame" fill="currentColor" />
      <div>
        <span className="font-bold text-accent text-lg">{streak}</span>
        <span className="text-xs text-ink-secondary ml-1">天连胜</span>
      </div>
    </div>
  );
}

// 通关奖励弹窗
export function RewardModal({ show, xp, stars, streak, onClose, onNext, fromCommunity }: {
  show: boolean;
  xp: number;
  stars: Stars;
  streak: number;
  onClose: () => void;
  onNext: () => void;
  fromCommunity?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-md p-8 mx-6 max-w-sm w-full animate-bounce-in text-center">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <svg
              key={i}
              className={`w-12 h-12 ${i <= stars ? 'text-gold animate-star-pop' : 'text-line'}`}
              style={{ animationDelay: `${i * 150}ms` }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold text-ink mb-1">{fromCommunity ? '评分完成！' : '通关成功！'}</h2>
        <p className="text-ink-secondary text-sm mb-6">{fromCommunity ? '感谢参与本周社区挑战' : '恭喜完成本关挑战'}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-accent/5 rounded-md p-3">
            <p className="text-2xl font-bold text-accent">+{xp}</p>
            <p className="text-xs text-ink-muted">经验值</p>
          </div>
          <div className="bg-gold/10 rounded-md p-3">
            <p className="text-2xl font-bold text-gold">{stars}★</p>
            <p className="text-xs text-ink-muted">本关星级</p>
          </div>
          <div className="bg-orange-50 rounded-md p-3">
            <p className="text-2xl font-bold text-accent">{streak}</p>
            <p className="text-xs text-ink-muted">连胜</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-md bg-surface-muted text-ink-secondary font-medium hover:bg-line transition-colors"
          >
            关闭
          </button>
          {!fromCommunity && (
            <button
              onClick={onNext}
              className="flex-1 px-4 py-3 rounded-md bg-accent text-white font-medium shadow-lg shadow-accent/30 hover:brightness-110 transition-all"
            >
              下一关
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
