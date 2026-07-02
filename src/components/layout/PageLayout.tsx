import React from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  desktop?: 'single' | 'split';
  immersive?: boolean;
  mainClassName?: string;
}
export function PageLayout({ children, desktop = 'single', immersive = false, mainClassName }: PageLayoutProps) {
  return (
    <motion.main
      variants={variants.routeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'min-h-screen',
        immersive ? 'bg-ink text-surface' : 'bg-surface text-ink',
        immersive ? '' : 'pb-24 lg:pb-12',
      )}
    >
      <div className={cn(immersive ? '' : 'max-w-6xl mx-auto px-4 lg:px-8', desktop === 'split' && !immersive && 'lg:grid lg:grid-cols-[1fr_320px] lg:gap-8', mainClassName)}>
        {children}
      </div>
    </motion.main>
  );
}
