export function RingProgress({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const c = radius * 2 * Math.PI;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E2DE" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#6E2233" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-scenic ease-editorial" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-ink text-lg">{value}</span>
        {label && <span className="text-[10px] text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}