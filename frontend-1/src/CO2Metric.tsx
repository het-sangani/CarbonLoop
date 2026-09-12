import { useEffect, useRef, useState } from "react";

export interface CO2MetricProps {
  value: number;          // 0–100
  size?: "large" | "small";
  estimated?: boolean;    // when true, shows mandatory "Estimated · Demo data" caption
}

const RING = {
  large: { px: 160, stroke: 7,   pctFont: 32, labelFont: 11 },
  small: { px:  96, stroke: 4.5, pctFont: 20, labelFont: 10 },
} as const;

const GREEN_STROKE = "#0F3D2E";
const GREEN_MID    = "#1A6146";  // slightly lighter for the gradient tip

function useCountUp(target: number, duration = 700): number {
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  const t0  = useRef<number | null>(null);

  useEffect(() => {
    t0.current = null;
    setV(0);
    function step(ts: number) {
      if (t0.current === null) t0.current = ts;
      const p = Math.min((ts - t0.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);   // ease-out cubic
      setV(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return v;
}

export default function CO2Metric({ value, size = "large", estimated = true }: CO2MetricProps) {
  const cfg  = RING[size];
  const S    = cfg.px;
  const sw   = cfg.stroke;
  const R    = (S - sw * 2) / 2;
  const circ = 2 * Math.PI * R;
  const cx   = S / 2;

  // IntersectionObserver — only start counting when visible
  const ref    = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const displayed = useCountUp(go ? value : 0, 700);
  const offset    = circ * (1 - displayed / 100);

  const gradId = `co2-grad-${size}`;

  return (
    <div
      ref={ref}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size === "large" ? 14 : 8,
      }}
    >
      {/* Ring */}
      <div style={{ position: "relative", width: S, height: S, flexShrink: 0 }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} aria-hidden>
          <defs>
            {/* Subtle gradient on the arc: deep green → slightly lighter at tip */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={GREEN_STROKE} />
              <stop offset="100%" stopColor={GREEN_MID} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={cx} cy={cx} r={R}
            fill="none" stroke="#EBEBEA" strokeWidth={sw} />
          {/* Arc */}
          <circle cx={cx} cy={cx} r={R}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cx}px` }}
          />
        </svg>

        {/* Centre text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: size === "large" ? 4 : 2,
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: cfg.pctFont,
            fontWeight: 700,
            color: GREEN_STROKE,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}>
            {displayed}%
          </span>
          <span style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: cfg.labelFont,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8A8C8A",
            lineHeight: 1,
          }}>
            CO₂ Utilized
          </span>
        </div>
      </div>

      {/* Mandatory estimated caption */}
      {estimated && (
        <span style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 10,
          color: "#A8AAA8",
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.4,
        }}>
          Estimated · Demo data
        </span>
      )}
    </div>
  );
}
