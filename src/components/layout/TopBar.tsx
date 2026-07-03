import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export function TopBar() {
  const { user } = useGameStore();
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/profile" aria-label="个人中心" className="w-10 h-10 rounded-full bg-ink text-surface flex items-center justify-center text-lg font-display">
          {user.avatar}
        </Link>
        <div className="flex items-center gap-3" aria-label="等级">
          <div className="w-24 h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-slow" style={{ width: `${(user.xp / user.xpToNext) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-ink-muted">{user.xp}/{user.xpToNext}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20">
          <Flame className="w-4 h-4 text-accent" />
          <span className="font-mono font-bold text-accent text-sm">{user.streak}</span>
        </div>
      </div>
    </header>
  );
}