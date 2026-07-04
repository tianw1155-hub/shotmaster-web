import { ChevronLeft } from 'lucide-react';
interface HeroBackProps { onClick: () => void; className?: string; }
export function HeroBack({ onClick, className = '' }: HeroBackProps) {
  return (
    <button onClick={onClick} aria-label="返回"
      className={`absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-card/80 backdrop-blur flex items-center justify-center shadow-elevated hover:bg-surface-card transition-colors z-10 ${className}`}>
      <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
    </button>
  );
}
