import React, { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    // Smooth scroll is a progressive enhancement (desktop only); degrade silently if the
    // environment lacks matchMedia or Lenis can't initialize (e.g. jsdom, restricted iframes).
    let isDesktop = false;
    try {
      isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    } catch {
      return;
    }
    if (!isDesktop) return;
    let lenis: Lenis | null = null;
    let raf = 0;
    try {
      lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      const loop = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    } catch {
      lenis = null;
    }
    return () => { if (raf) cancelAnimationFrame(raf); lenis?.destroy(); };
  }, [disabled]);
  return <>{children}</>;
}