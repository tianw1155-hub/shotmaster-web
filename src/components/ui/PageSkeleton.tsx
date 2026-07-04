export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin" />
    </div>
  );
}
