import React from 'react';
import { cn } from '../../lib/utils';

type BadgeColor = 'default' | 'accent' | 'success' | 'warning' | 'gold' | 'primary' | 'mint' | 'sun' | 'sky' | 'grape';
export function Badge({ children, color = 'default', className }: { children: React.ReactNode; color?: BadgeColor; className?: string }) {
  const colors: Record<BadgeColor, string> = {
    default: 'bg-surface-muted text-ink-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    gold: 'bg-gold/16 text-gold',
    // legacy compat — callers pass old color names (resolved via compat tokens)
    primary: 'bg-primary/10 text-primary',
    mint: 'bg-mint/10 text-mint',
    sun: 'bg-sun/20 text-sun',
    sky: 'bg-sky/10 text-sky',
    grape: 'bg-grape/10 text-grape',
  };
  return <span className={cn('inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider', colors[color], className)}>{children}</span>;
}