import React, { useEffect, useRef, Suspense } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { MotionConfig, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SmoothScroll } from './SmoothScroll';
import { PageSkeleton } from '../ui/PageSkeleton';
import { deriveSection } from '../../lib/navSection';
import { reportPageVisit } from '../../services/apiService';
import { useGameStore } from '../../stores/useGameStore';

const NO_NAV_PREFIXES = ['/login', '/preferences', '/admin'];
const IMMERSIVE_PREFIXES = ['/shoot'];

const pageTitleMap: Record<string, string> = {
  '/': '首页',
  '/gallery': '图库',
  '/shoot': '拍摄',
  '/level-map': '关卡地图',
  '/community': '社区',
  '/profile': '我的',
  '/preferences': '偏好设置',
  '/login': '登录',
  '/score': '评分结果',
};

function getPageTitle(path: string): string {
  if (pageTitleMap[path]) return pageTitleMap[path];
  for (const [pattern, title] of Object.entries(pageTitleMap)) {
    if (path.startsWith(pattern) && pattern !== '/') return title;
  }
  return path;
}

let sessionId = '';
function getSessionId(): string {
  if (!sessionId) {
    const stored = sessionStorage.getItem('shotmaster_session_id');
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('shotmaster_session_id', sessionId);
    }
  }
  return sessionId;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user = useGameStore((s) => s.user);
  const noNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const showNav = !noNav && !immersive;

  const lastPageRef = useRef<string>('');
  const lastEnterTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location.pathname]);

  useEffect(() => {
    const currentPage = location.pathname;
    const now = Date.now();

    if (lastPageRef.current && lastEnterTimeRef.current > 0) {
      const staySec = Math.floor((now - lastEnterTimeRef.current) / 1000);
      if (staySec >= 1) {
        reportPageVisit({
          userId: user?.id || '',
          sessionId: getSessionId(),
          page: lastPageRef.current,
          pageTitle: getPageTitle(lastPageRef.current),
          referrer: '',
          staySec,
        });
      }
    }

    lastPageRef.current = currentPage;
    lastEnterTimeRef.current = now;
  }, [location.pathname, user?.id]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lastPageRef.current && lastEnterTimeRef.current > 0) {
        const staySec = Math.floor((Date.now() - lastEnterTimeRef.current) / 1000);
        if (staySec >= 1) {
          navigator.sendBeacon?.(
            `${import.meta.env.VITE_API_BASE_URL || '/api'}/logs/page-visit`,
            JSON.stringify({
              userId: user?.id || '',
              sessionId: getSessionId(),
              page: lastPageRef.current,
              pageTitle: getPageTitle(lastPageRef.current),
              referrer: '',
              staySec,
            })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user?.id]);

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
