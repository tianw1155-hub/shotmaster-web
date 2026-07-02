export function StarRating({ stars, size = 'md' }: { stars: 0 | 1 | 2 | 3; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <svg key={i} className={`${sizes[size]} ${i <= stars ? 'text-gold' : 'text-line'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}