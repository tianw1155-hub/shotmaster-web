import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Aperture, LayoutGrid, BookOpen, Image as ImageIcon, Users, User, Flame } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { deriveSection } from '../../lib/navSection';
import type { NavSection } from '../../lib/navSection';

const NAV: { id: NavSection; icon: typeof LayoutGrid; label: string; path: string }[] = [
  { id: 'levels', icon: LayoutGrid, label: '闯关', path: '/' },
  { id: 'learn', icon: BookOpen, label: '学习', path: '/learn' },
  { id: 'gallery', icon: ImageIcon, label: '图库', path: '/gallery' },
  { id: 'community', icon: Users, label: '社区', path: '/community' },
  { id: 'profile', icon: User, label: '我的', path: '/profile' },
];

export function Sidebar() {
  const { user } = useGameStore();
  const { pathname } = useLocation();
  const active = deriveSection(pathname);
  return (
    <aside className="hidden lg:flex lg:flex-col w-[208px] shrink-0 bg-surface-card border-r border-line sticky top-0 h-dvh">
      <div className="h-14 flex items-center gap-2 px-5 border-b border-line">
        <Aperture className="w-5 h-5 text-accent" strokeWidth={1.25} />
        <span className="font-display font-medium text-[14px] tracking-tight">ShotMaster</span>
      </div>
      <nav className="flex-1 px-3 py-5 relative">
        {NAV.map(({ id, icon: Icon, label, path }) => (
          <Link key={id} to={path}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors duration-base ease-editorial ${
              active === id ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-surface-muted/60'
            }`}>
            {active === id && (
              <motion.span layoutId="nav-indicator"
                className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-full"
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }} />
            )}
            <Icon className="w-[17px] h-[17px]" strokeWidth={1.25} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-line">
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-ink text-surface flex items-center justify-center text-[11px] font-medium">{user.avatar}</div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-ink truncate">Lv.{user.level} · 摄影师</p>
            <p className="text-[10px] text-ink-muted font-mono">{user.xp}/{user.xpToNext} XP</p>
          </div>
          <Flame className="w-4 h-4 text-accent ml-auto" strokeWidth={1.25} />
        </Link>
      </div>
    </aside>
  );
}
