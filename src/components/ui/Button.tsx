import React from 'react';

// 按钮
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'mint' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'font-semibold rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95';
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110',
    secondary: 'bg-white text-ink shadow-sm border border-gray-100 hover:bg-gray-50',
    ghost: 'text-ink-secondary hover:bg-gray-100',
    mint: 'bg-mint text-white shadow-lg shadow-mint/30 hover:shadow-xl hover:brightness-110',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  };
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-5 py-3 text-base', lg: 'px-8 py-4 text-lg' };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// 卡片
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-gray-50 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >{children}</div>
  );
}

// 标签
export function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'primary' | 'mint' | 'sun' | 'sky' | 'grape' }) {
  const colors = {
    default: 'bg-gray-100 text-ink-secondary',
    primary: 'bg-primary/10 text-primary',
    mint: 'bg-mint/10 text-mint-dark',
    sun: 'bg-sun/20 text-yellow-700',
    sky: 'bg-sky/10 text-sky-dark',
    grape: 'bg-grape/10 text-grape-dark',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

// 星级显示
export function StarRating({ stars, size = 'md' }: { stars: 0 | 1 | 2 | 3; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map(i => (
        <svg
          key={i}
          className={`${sizes[size]} ${i <= stars ? 'text-sun' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// 进度条
export function ProgressBar({ value, color = 'primary' }: { value: number; color?: 'primary' | 'mint' | 'sun' | 'grape' }) {
  const colors = {
    primary: 'bg-primary',
    mint: 'bg-mint',
    sun: 'bg-sun',
    grape: 'bg-grape',
  };
  return (
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[color]} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// 环形进度
export function RingProgress({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F0F1F3" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#4ECDC4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-ink">{value}%</span>
        {label && <span className="text-xs text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}
