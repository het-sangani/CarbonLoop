import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table-row' | 'stat' | 'text';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const renderItem = (key: number) => {
    switch (variant) {
      case 'stat':
        return (
          <div key={key} className={`glass-panel rounded-2xl p-5 space-y-3 animate-pulse border-white/5 ${className}`}>
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-800 rounded-xl" />
            </div>
            <div className="h-7 w-32 bg-slate-700/60 rounded" />
            <div className="h-2.5 w-40 bg-slate-800/80 rounded" />
          </div>
        );

      case 'table-row':
        return (
          <tr key={key} className="animate-pulse border-b border-white/5">
            <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
            <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-800 rounded ml-auto" /></td>
          </tr>
        );

      case 'text':
        return (
          <div key={key} className={`space-y-2 animate-pulse ${className}`}>
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800/70 rounded w-4/5" />
            <div className="h-4 bg-slate-800/50 rounded w-3/5" />
          </div>
        );

      case 'card':
      default:
        return (
          <div key={key} className={`glass-panel rounded-2xl p-6 space-y-4 animate-pulse border-white/5 ${className}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-700/60 rounded" />
                <div className="h-3.5 w-28 bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-800 rounded-full" />
            </div>
            <div className="h-12 w-full bg-slate-800/50 rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 bg-slate-800/60 rounded-lg" />
              <div className="h-10 bg-slate-800/60 rounded-lg" />
              <div className="h-10 bg-slate-800/60 rounded-lg" />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => renderItem(i))}
    </>
  );
};
