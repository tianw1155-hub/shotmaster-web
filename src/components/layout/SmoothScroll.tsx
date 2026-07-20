import React, { useEffect } from 'react';

export function SmoothScroll({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    let isDesktop = false;
    try {
      isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    } catch {
      return;
    }
    if (!isDesktop) return;

    let lenis: any = null;
    let raf = 0;
    let cancelled = false;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled || disabled) return;
      try {
        lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        const loop = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
      } catch {
        lenis = null;
      }
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [disabled]);
  return <>{children}</>;
}