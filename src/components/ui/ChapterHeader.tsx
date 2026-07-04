interface ChapterHeaderProps { name: string; color: string; completed: number; total: number; }
export function ChapterHeader({ name, color, completed, total }: ChapterHeaderProps) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-line last:border-b-0">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-[13px] flex-1">{name}<span className="block text-[10px] text-ink-muted font-mono mt-0.5">{String(completed).padStart(2,'0')} / {total}</span></span>
      <span className="w-14 h-[2px] bg-line rounded-full overflow-hidden"><span className="block h-full bg-ink" style={{ width: `${pct}%` }} /></span>
      <span className="text-[10px] text-ink-muted font-mono w-7 text-right">{pct}</span>
    </div>
  );
}
