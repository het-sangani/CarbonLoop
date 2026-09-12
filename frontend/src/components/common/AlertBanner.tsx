import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertBannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  variant,
  title,
  message,
  onDismiss,
  onClose,
  actionLabel,
  onAction,
  className = ''
}) => {
  const alertType = variant || type || 'info';
  const handleDismiss = onClose || onDismiss;

  const configs = {
    error: {
      icon: AlertCircle,
      container: 'border-rose-500/30 bg-rose-950/25 text-rose-300',
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-200'
    },
    warning: {
      icon: AlertTriangle,
      container: 'border-amber-500/30 bg-amber-950/25 text-amber-300',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-200'
    },
    info: {
      icon: Info,
      container: 'border-cyan-500/30 bg-cyan-950/25 text-cyan-300',
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-200'
    },
    success: {
      icon: CheckCircle2,
      container: 'border-emerald-500/30 bg-emerald-950/25 text-emerald-300',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-200'
    }
  };

  const { icon: Icon, container, iconColor, titleColor } = configs[alertType];

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-xs sm:text-sm backdrop-blur-md transition-all ${container} ${className}`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 space-y-1">
        {title && <h4 className={`font-semibold ${titleColor}`}>{title}</h4>}
        <p className="leading-relaxed opacity-90">{message}</p>
        {actionLabel && onAction && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onAction}
              className="text-xs font-bold underline hover:opacity-80 transition-opacity"
            >
              {actionLabel} →
            </button>
          </div>
        )}
      </div>
      {handleDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

