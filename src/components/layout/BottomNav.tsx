import { Link } from 'react-router-dom';
import { Trophy, Image as ImageIcon, Users, BookOpen, Camera } from 'lucide-react';

export type NavSection = 'levels' | 'gallery' | 'community' | 'learn' | 'profile';
const ITEMS: { id: NavSection; icon: typeof Trophy; label: string; path: string }[] = [
  { id: 'levels', icon: Trophy, label: '闯关', path: '/' },
  { id: 'gallery', icon: ImageIcon, label: '图库', path: '/gallery' },
  { id: 'community', icon: Users, label: '挑战', path: '/community' },
  { id: 'learn', icon: BookOpen, label: '学习', path: '/learn' },
  { id: 'profile', icon: Camera, label: '我的', path: '/profile' },
];

export function BottomNav({ active }: { active: NavSection }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/90 backdrop-blur-md border-t border-line">
      <div className="max-w-6xl mx-auto px-2 h-16 flex items-center justify-around">
        {ITEMS.map(({ id, icon: Icon, label, path }) => (
          <Link key={id} to={path} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors ${active === id ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}