import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold font-body transition-all duration-base ease-editorial disabled:opacity-40 disabled:cursor-not-allowed active:scale-[.97] focus-visible:outline-none focus-visible:shadow-focus',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-surface hover:bg-ink-secondary',
        accent: 'bg-accent text-white hover:brightness-110 shadow-elevated',
        secondary: 'bg-surface-card text-ink border border-line hover:bg-surface-muted',
        outline: 'border border-ink text-ink hover:bg-ink hover:text-surface',
        ghost: 'text-ink-secondary hover:bg-surface-muted',
        mint: 'bg-accent text-surface shadow-lg shadow-accent/30 hover:brightness-110',
      },
      size: {
        sm: 'rounded-md px-3 py-2 text-sm',
        md: 'rounded-md px-5 py-3 text-base',
        lg: 'rounded-lg px-8 py-4 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

// backward-compat re-exports — existing pages import Card/Badge/StarRating/ProgressBar/RingProgress from Button.tsx
export { Card } from './Card';
export { Badge } from './Badge';
export { StarRating } from './StarRating';
export { ProgressBar } from './ProgressBar';
export { RingProgress } from './RingProgress';