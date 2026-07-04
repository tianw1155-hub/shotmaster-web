import React from 'react';
import { createConfettiData } from '../../lib/lottie';

const Lottie = React.lazy(() => import('lottie-react'));

export function Confetti({ count = 30, className = '' }: { count?: number; className?: string }) {
  const [data] = React.useState(() => createConfettiData(count));
  const [reduced] = React.useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) return null;
  return (
    <React.Suspense fallback={null}>
      <Lottie animationData={data} loop={false} className={className} />
    </React.Suspense>
  );
}
