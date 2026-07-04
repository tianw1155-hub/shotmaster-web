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
    primary: 'bg-accent/10 text-accent',
    mint: 'bg-ink-muted/10 text-ink-muted',
    sun: 'bg-gold/16 text-gold',
    sky: 'bg-ink-muted/10 text-ink-muted',
    grape: 'bg-ink-muted/10 text-ink-muted',
  };
  return <span className={cn('inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider', colors[color], className)}>{children}</span>;
}