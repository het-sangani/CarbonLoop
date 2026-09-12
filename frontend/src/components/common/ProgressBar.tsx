import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
  color?: 'emerald' | 'cyan' | 'teal' | 'amber';
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  valueSuffix = '%',
  color = 'emerald',
  height = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    emerald: 'bg-emerald-400 shadow-glow-emerald',
    cyan: 'bg-cyan-400 shadow-glow-cyan',
    teal: 'bg-teal-400',
    amber: 'bg-amber-400'
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          {showValue && (
            <span className="font-semibold text-slate-200 tabular-nums">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-800/80 overflow-hidden ${heights[height]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
