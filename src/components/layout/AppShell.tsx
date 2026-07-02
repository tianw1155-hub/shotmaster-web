import React from 'react';
import { useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { TopBar } from './TopBar';
import { BottomNav, type NavSection } from './BottomNav';
import { SmoothScroll } from './SmoothScroll';

const NO_NAV_PREFIXES = ['/login', '/preferences', '/admin'];
const IMMERSIVE_PREFIXES = ['/shoot'];

function deriveSection(pathname: string): NavSection {
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/learn')) return 'learn';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'levels';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const showNav = !noNav && !immersive;

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll disabled={immersive}>
        {showNav && <TopBar />}
        {children}
        {showNav && <BottomNav active={deriveSection(location.pathname)} />}
      </SmoothScroll>
    </MotionConfig>
  );
}
