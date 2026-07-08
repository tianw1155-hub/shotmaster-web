import React, { useEffect, Suspense } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { MotionConfig, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SmoothScroll } from './SmoothScroll';
import { PageSkeleton } from '../ui/PageSkeleton';
import { deriveSection } from '../../lib/navSection';

const NO_NAV_PREFIXES = ['/login', '/preferences', '/admin'];
const IMMERSIVE_PREFIXES = ['/shoot'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const showNav = !noNav && !immersive;

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-accent focus:text-white focus:px-3 focus:py-2 focus:rounded-md">跳到主要内容</a>
      <SmoothScroll disabled={immersive}>
        <div className={showNav ? 'lg:grid lg:grid-cols-[208px_1fr]' : ''}>
          {showNav && <Sidebar />}
          <div className="flex flex-col min-h-dvh">
            {showNav && <TopBar />}
            <div className="flex-1 flex flex-col">
              <Suspense fallback={<PageSkeleton />}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    {children}
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>
            {showNav && <BottomNav active={deriveSection(location.pathname)} />}
          </div>
        </div>
      </SmoothScroll>
    </MotionConfig>
  );
}
