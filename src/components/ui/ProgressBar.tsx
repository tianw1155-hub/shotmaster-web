type Color = 'ink' | 'accent' | 'gold' | 'primary' | 'mint' | 'sun' | 'grape';
export function ProgressBar({ value, color = 'accent' }: { value: number; color?: Color }) {
  const colors: Record<Color, string> = {
    ink: 'bg-ink',
    accent: 'bg-accent',
    gold: 'bg-gold',
    // legacy compat — callers pass old color names (resolved via compat tokens)
    primary: 'bg-primary',
    mint: 'bg-mint',
    sun: 'bg-sun',
    grape: 'bg-grape',
  };
  return (
    <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden">
      <div className={`h-full ${colors[color]} rounded-full transition-all duration-slow ease-editorial`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}