import React, { useState, useMemo } from 'react';
import { getFallbackImage } from '../../utils/fallbackImages';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill';
  category?: string;
  useFallbackPool?: boolean;
}

const gradients = [
  'from-amber-400 to-orange-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-blue-500',
];

function getGradientIndex(src: string): number {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
  }
  return hash % gradients.length;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  onClick,
  objectFit = 'cover',
  category,
  useFallbackPool = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackSrc = useMemo(() => {
    if (useFallbackPool && category) {
      return getFallbackImage(category, src);
    }
    return null;
  }, [category, src, useFallbackPool]);

  const currentSrc = hasError && fallbackSrc && !fallbackFailed ? fallbackSrc : src;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && !fallbackFailed) {
      setHasError(true);
    } else if (hasError || !fallbackSrc) {
      setFallbackFailed(true);
      setIsLoading(false);
    }
  };

  if (fallbackFailed) {
    const gradientIdx = getGradientIndex(src);
    return (
      <div
        className={`w-full h-full bg-gradient-to-br ${gradients[gradientIdx]} flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <div className="text-center px-3">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-white/70 truncate max-w-[120px]">{alt}</p>
        </div>
      </div>
    );
  }

  const objectFitClass =
    objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'contain'
        ? 'object-contain'
        : 'object-fill';

  return (
    <div className={`relative w-full h-full ${className}`} onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10">
          <svg
            className="w-6 h-6 text-slate-300 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full ${objectFitClass} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};
