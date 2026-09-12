import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
  color?: 'emerald' | 'cyan' | 'teal' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtext,
  color = 'emerald'
}) => {
  const iconColors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25'
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${iconColors[color]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{value}</span>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400/90 leading-relaxed truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};

