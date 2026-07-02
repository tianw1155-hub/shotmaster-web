import type { Variants, Transition } from 'framer-motion';

export const EASE = {
  editorial: [0.22, 1, 0.36, 1] as const,
  soft: [0.65, 0, 0.35, 1] as const,
};

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE.editorial } },
  } satisfies Variants,
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  } satisfies Variants,
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  } satisfies Variants,
  routeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.editorial } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE.soft } },
  } satisfies Variants,
  stagger: (i: number): Variants => ({
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.04, ease: EASE.editorial } },
  }),
};

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 30 };
