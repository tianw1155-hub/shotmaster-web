import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-md border border-line',
        onClick && 'cursor-pointer hover:bg-surface-muted transition-colors',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}