import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'purple' | 'slate' | 'rose' | 'teal';
  size?: 'sm' | 'md';
  withDot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'emerald', 
  size = 'sm',
  withDot = false,
  pulse = false,
  className = '' 
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/25'
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
    rose: 'bg-rose-400',
    teal: 'bg-teal-400'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs tracking-wide',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

