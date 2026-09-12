import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Loader2
} from 'lucide-react';

// ─── CarbonLoop Orb — The one recurring brand element ─────────────────────────
export function CarbonLoopOrb({
  size = 32,
  variant = 'teal-on-dark',
  animated = true,
  className = '',
}: {
  size?: number;
  variant?: 'teal-on-dark' | 'teal-on-white' | 'teal-on-green';
  animated?: boolean;
  className?: string;
}) {
  const sphereColor = '#2E9E8A';
  const ringColor = '#2E9E8A';
  const innerShade =
    variant === 'teal-on-dark' || variant === 'teal-on-green'
      ? 'rgba(255,255,255,0.07)'
      : 'rgba(26,29,27,0.06)';

  const r = size / 2;
  const sphereR = r * 0.42;
  const ringRx = r * 0.7;
  const ringRy = r * 0.22;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="CarbonLoop"
      role="img"
    >
      <defs>
        <radialGradient id={`orb-grad-${size}-${variant}`} cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor={sphereColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={sphereColor} stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id={`orb-shine-${size}-${variant}`} cx="32%" cy="28%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <ellipse
        cx={r}
        cy={r}
        rx={ringRx}
        ry={ringRy}
        fill="none"
        stroke={ringColor}
        strokeWidth="0.9"
        strokeOpacity="0.35"
        strokeDasharray="4 2"
        className={animated ? 'orb-ring' : ''}
        style={{ transformOrigin: `${r}px ${r}px` }}
      />
      <circle
        cx={r}
        cy={r}
        r={sphereR}
        fill={`url(#orb-grad-${size}-${variant})`}
        className={animated ? 'orb-pulse' : ''}
      />
      <circle
        cx={r}
        cy={r}
        r={sphereR}
        fill={`url(#orb-shine-${size}-${variant})`}
      />
      <circle
        cx={r}
        cy={r}
        r={sphereR * 0.65}
        fill="none"
        stroke={innerShade}
        strokeWidth="0.6"
      />
      <ellipse
        cx={r}
        cy={r}
        rx={ringRx}
        ry={ringRy}
        fill="none"
        stroke={ringColor}
        strokeWidth="0.9"
        strokeOpacity="0.7"
        strokeDasharray="4 2"
        strokeDashoffset="6"
        clipPath={`inset(${r}px 0 0 0)`}
        className={animated ? 'orb-ring' : ''}
        style={{ transformOrigin: `${r}px ${r}px` }}
      />
    </svg>
  );
}

// ─── LabelCaps ────────────────────────────────────────────────────────────────
export function LabelCaps({
  children,
  light = false,
  style = {}
}: {
  children: React.ReactNode;
  light?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="label-caps"
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: light ? 'rgba(250,250,249,0.55)' : '#8A8C8A',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = 'neutral',
  dot = false,
  pulse = false,
  style = {}
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'green' | 'warning' | 'dark' | 'error';
  dot?: boolean;
  pulse?: boolean;
  style?: React.CSSProperties;
}) {
  const styles = {
    neutral: { background: '#F1F1EF', color: '#5A5C5A', border: '1px solid #E5E5E2' },
    teal: { background: 'rgba(46,158,138,0.12)', color: '#2E9E8A', border: '1px solid rgba(46,158,138,0.28)' },
    green: { background: 'rgba(15,61,46,0.08)', color: '#0F3D2E', border: '1px solid rgba(15,61,46,0.20)' },
    warning: { background: 'rgba(200,140,60,0.10)', color: '#9A6715', border: '1px solid rgba(200,140,60,0.25)' },
    dark: { background: '#1A1D1B', color: '#FAFAF9', border: '1px solid #3A3D3B' },
    error: { background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.20)' },
  };

  return (
    <span
      className="label-caps"
      style={{
        ...styles[variant],
        padding: '3px 9px',
        borderRadius: 9999,
        fontSize: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontWeight: 600,
        ...style
      }}
    >
      {dot && (
        <span
          className={pulse ? 'pulse-dot' : ''}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
  style = {},
  onClick,
  accentColor
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  accentColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`card-lift ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E2',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {accentColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: accentColor
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── CardHeader ───────────────────────────────────────────────────────────────
export function CardHeader({
  title,
  subtitle,
  action,
  style = {}
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #F1F1EF',
        gap: 12,
        ...style
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: '#1A1D1B',
            letterSpacing: '-0.01em'
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#8A8C8A', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style = {},
  type = 'button'
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}) {
  const variantStyles = {
    primary: {
      background: '#2E9E8A',
      color: '#FAFAF9',
      border: '1px solid #288C7A',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    secondary: {
      background: '#0F3D2E',
      color: '#FAFAF9',
      border: '1px solid #0B2C21',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    outline: {
      background: '#FFFFFF',
      color: '#1A1D1B',
      border: '1px solid #D0D0CC',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    },
    ghost: {
      background: 'transparent',
      color: '#5A5C5A',
      border: '1px solid transparent'
    },
    danger: {
      background: 'rgba(220,38,38,0.10)',
      color: '#DC2626',
      border: '1px solid rgba(220,38,38,0.25)'
    }
  };

  const sizeStyles = {
    sm: { padding: '5px 12px', fontSize: 12, borderRadius: 6, height: 28 },
    md: { padding: '8px 16px', fontSize: 13, borderRadius: 6, height: 36 },
    lg: { padding: '10px 22px', fontSize: 14, borderRadius: 8, height: 44 }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="focus-ring"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 500,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 150ms ease',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
          <span>{loadingText || 'Processing...'}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <span>{children}</span>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
}

// ─── StatTile ─────────────────────────────────────────────────────────────────
export function StatTile({
  label,
  value,
  delta,
  unit,
  style = {}
}: {
  label: string;
  value: string | number;
  delta?: string;
  unit?: string;
  style?: React.CSSProperties;
}) {
  const positive = delta?.startsWith('+');
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E2',
        borderRadius: 8,
        padding: '18px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        ...style
      }}
    >
      <LabelCaps style={{ marginBottom: 6 }}>{label}</LabelCaps>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          className="tabular-nums"
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#1A1D1B',
            letterSpacing: '-0.02em'
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 12, color: '#8A8C8A' }}>{unit}</span>}
      </div>
      {delta && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: positive ? '#2E9E8A' : '#C0604A',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{delta} vs last cycle</span>
        </div>
      )}
    </div>
  );
}

// ─── AlertBanner ──────────────────────────────────────────────────────────────
export function AlertBanner({
  variant = 'info',
  title,
  message,
  onDismiss,
  actionLabel,
  onAction
}: {
  variant?: 'info' | 'error' | 'success' | 'warning';
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const themes = {
    info: { bg: '#E8F4F1', color: '#1A6158', border: '#2E9E8A40', Icon: Info },
    error: { bg: '#FDF2F2', color: '#B91C1C', border: '#F8717150', Icon: AlertCircle },
    success: { bg: '#ECFDF5', color: '#0F3D2E', border: '#10B98140', Icon: CheckCircle2 },
    warning: { bg: '#FFFBEB', color: '#9A6715', border: '#FBBF2450', Icon: AlertTriangle }
  };

  const t = themes[variant];
  const IconComp = t.Icon;

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <IconComp size={18} color={t.color} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          {title && (
            <div style={{ fontWeight: 600, fontSize: 13, color: t.color, marginBottom: 2 }}>
              {title}
            </div>
          )}
          <div style={{ fontSize: 12, color: t.color, opacity: 0.95, lineHeight: 1.4 }}>
            {message}
          </div>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                color: t.color,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {actionLabel} →
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: t.color,
            fontSize: 16,
            cursor: 'pointer',
            padding: 2,
            lineHeight: 1
          }}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: '#FFFFFF',
        border: '1px solid #E5E5E2',
        borderRadius: 8
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        {icon || <CarbonLoopOrb size={44} variant="teal-on-white" animated={false} />}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1D1B', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: '#8A8C8A', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.4 }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  color = '#2E9E8A',
  label,
  height = 7
}: {
  value: number;
  color?: string;
  label?: string;
  height?: number;
}) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: '#5A5C5A' }}>{label}</span>
          <span className="tabular-nums" style={{ fontWeight: 600, color: '#1A1D1B' }}>
            {value}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          background: '#F1F1EF',
          borderRadius: 9999,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            height: '100%',
            background: color,
            borderRadius: 9999,
            transition: 'width 400ms ease'
          }}
        />
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  badge,
  title,
  subtitle,
  actions
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div style={{ maxWidth: 840 }}>
          {badge && <LabelCaps style={{ marginBottom: 6 }}>{badge}</LabelCaps>}
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1A1D1B',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: '#5A5C5A', marginTop: 4, marginBottom: 0, lineHeight: 1.4 }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
      </div>
    </div>
  );
}

// ─── Skeleton Loading Components ──────────────────────────────────────────────
export function SkeletonText({
  width = '100%',
  height = 14,
  style = {}
}: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        ...style
      }}
    />
  );
}

export function SkeletonCard({
  lines = 3
}: {
  lines?: number;
}) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <SkeletonText width="40%" height={16} />
        <SkeletonText width={60} height={16} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonText key={i} width={i === lines - 1 ? '60%' : '100%'} height={12} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonText width={80} height={24} />
        <SkeletonText width={80} height={24} />
      </div>
    </Card>
  );
}
