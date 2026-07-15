import { useEffect, useRef } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { reportPageVisit } from '../services/apiService';
import { useGameStore } from '../stores/useGameStore';

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

const pageTitleMap: Record<string, string> = {
  '/': '首页',
  '/gallery': '图库',
  '/shoot': '拍摄',
  '/level-map': '关卡地图',
  '/community': '社区',
  '/profile': '我的',
  '/preferences': '偏好设置',
  '/login': '登录',
  '/shooting-plan': '拍摄计划',
  '/score-result': '评分结果',
};

function getPageTitle(path: string): string {
  if (pageTitleMap[path]) return pageTitleMap[path];
  for (const [pattern, title] of Object.entries(pageTitleMap)) {
    if (path.startsWith(pattern) && pattern !== '/') return title;
  }
  return path;
}

export function usePageVisitLogger() {
  const location = useLocation();
  const user = useGameStore((s) => s.user);
  const lastPageRef = useRef<string>('');
  const lastEnterTimeRef = useRef<number>(0);

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

  return null;
}
