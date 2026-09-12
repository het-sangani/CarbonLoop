import React from 'react';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
  maxWidth = '7xl',
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]} px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-white/5 pb-6">
          <div>
            {badge && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                {badge}
              </span>
            )}
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm sm:text-base text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
