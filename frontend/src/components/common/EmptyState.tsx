import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'slate';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'emerald',
  className = ''
}) => {
  const iconColors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    slate: 'text-slate-400 bg-slate-800/60 border-white/10'
  };

  return (
    <div className={`glass-panel rounded-2xl p-10 sm:p-14 text-center max-w-md mx-auto space-y-4 border-white/10 ${className}`}>
      <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center mx-auto transition-transform duration-300 hover:scale-105 ${iconColors[variant]}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>
      {action && (
        <div className="pt-2 flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};
