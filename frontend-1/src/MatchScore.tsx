import { useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface MatchCriteria {
  label: string;
  met: boolean;
}

export interface MatchScoreProps {
  score: number;                    // 0–100
  size?: "large" | "small";        // large ≈ 160px ring, small ≈ 64px ring
  criteria?: MatchCriteria[];       // checklist items
  animated?: boolean;               // fill animation on mount
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RING_SIZE   = { large: 160, small: 64 } as const;
const STROKE_W    = { large: 7,   small: 3.5 } as const;
const FONT_PCT    = { large: 32,  small: 13  } as const;
const FONT_LABEL  = { large: 11,  small: 9   } as const;

const DEFAULT_CRITERIA: MatchCriteria[] = [
  { label: "Quantity",     met: true  },
  { label: "Purity",       met: true  },
  { label: "Location",     met: true  },
  { label: "Availability", met: true  },
  { label: "Price",        met: true  },
];

// ─── useAnimatedScore — counts up from 0 → target over `duration` ms ──────────
function useAnimatedScore(target: number, duration = 600, enabled = true): number {
  const [displayed, setDisplayed] = useState(enabled ? 0 : target);
  const raf = useRef<number>(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) { setDisplayed(target); return; }
    start.current = null;
    setDisplayed(0);

    function step(ts: number) {
      if (start.current === null) start.current = ts;
      const elapsed = ts - start.current;
      // ease-out cubic
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(step);
    }

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, enabled]);

  return displayed;
}

// ─── Ring SVG ─────────────────────────────────────────────────────────────────
function Ring({
  score,
  size,
  animated,
}: {
  score: number;
  size: "large" | "small";
  animated: boolean;
}) {
  const S      = RING_SIZE[size];
  const sw     = STROKE_W[size];
  const R      = (S - sw * 2) / 2;
  const circ   = 2 * Math.PI * R;
  const cx     = S / 2;

  const displayed = useAnimatedScore(score, 600, animated);
  const offset    = circ * (1 - displayed / 100);

  // Colour: teal for high match, graded amber below 65
  const strokeColor =
    score >= 85 ? "#2E9E8A" :
    score >= 65 ? "#4DAA82" :
                  "#A09060";

  const pctSize   = FONT_PCT[size];
  const labelSize = FONT_LABEL[size];

  return (
    <div style={{ position: "relative", width: S, height: S, flexShrink: 0 }}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} aria-hidden>
        {/* Track */}
        <circle
          cx={cx} cy={cx} r={R}
          fill="none"
          stroke="#EBEBEA"
          strokeWidth={sw}
        />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cx} r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: `rotate(-90deg)`,
            transformOrigin: `${cx}px ${cx}px`,
            // CSS transition handles the small ring (non-animated) hover case
            transition: animated ? "none" : "stroke-dashoffset 500ms ease",
          }}
        />
      </svg>

      {/* Centre text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: size === "large" ? 3 : 1,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: pctSize,
            fontWeight: size === "large" ? 700 : 500,
            color: strokeColor,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
          aria-label={`${displayed}%`}
        >
          {displayed}%
        </span>
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: labelSize,
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#8A8C8A",
            lineHeight: 1,
          }}
        >
          Match
        </span>
      </div>
    </div>
  );
}

// ─── Checklist (large only) ───────────────────────────────────────────────────
function Checklist({ criteria }: { criteria: MatchCriteria[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      aria-label="Match criteria"
    >
      {criteria.map(({ label, met }) => (
        <li
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          {/* Check / cross icon */}
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: met ? "rgba(46,158,138,0.10)" : "rgba(180,60,60,0.08)",
              border: `1px solid ${met ? "rgba(46,158,138,0.25)" : "rgba(180,60,60,0.20)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden
          >
            {met ? (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2E9E8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M2.5 2.5L6.5 6.5M6.5 2.5L2.5 6.5" stroke="#C04040" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 13,
              color: met ? "#1A1D1B" : "#8A8C8A",
              fontWeight: met ? 400 : 400,
            }}
          >
            {label}
          </span>
          {/* Right-aligned status text */}
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: met ? "#2E9E8A" : "#8A8C8A",
            }}
          >
            {met ? "Met" : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Small tooltip — appears on hover over small ring ────────────────────────
function SmallTooltip({ criteria, score }: { criteria: MatchCriteria[]; score: number }) {
  const [visible, setVisible] = useState(false);
  const metCount = criteria.filter((c) => c.met).length;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <Ring score={score} size="small" animated={false} />

      {visible && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            background: "#FFFFFF",
            border: "1px solid #E5E5E2",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            padding: "12px 14px",
            minWidth: 170,
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {/* Tip header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A8C8A",
              }}
            >
              Criteria
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                fontWeight: 500,
                color: "#2E9E8A",
              }}
            >
              {metCount}/{criteria.length}
            </span>
          </div>

          {/* Mini checklist */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {criteria.map(({ label, met }) => (
              <li key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                  {met ? (
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2E9E8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M2.5 2.5L6.5 6.5M6.5 2.5L2.5 6.5" stroke="#C04040" strokeWidth="1.3" strokeLinecap="round" />
                  )}
                </svg>
                <span
                  style={{
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 12,
                    color: met ? "#1A1D1B" : "#8A8C8A",
                  }}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {/* Caret */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: -5,
              right: 24,
              width: 9,
              height: 9,
              background: "#FFFFFF",
              border: "1px solid #E5E5E2",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main export: MatchScore ──────────────────────────────────────────────────
export default function MatchScore({
  score,
  size = "large",
  criteria = DEFAULT_CRITERIA,
  animated = true,
}: MatchScoreProps) {
  // Intersection Observer — start animation when card enters viewport
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!animated) { setInView(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animated]);

  // ── Small ring: just the ring with hover-tooltip ─────────────────────────
  if (size === "small") {
    return <SmallTooltip score={score} criteria={criteria} />;
  }

  // ── Large: ring + checklist side-by-side ─────────────────────────────────
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 32,
      }}
    >
      {inView && <Ring score={score} size="large" animated={animated} />}

      {/* Checklist panel */}
      <div style={{ paddingTop: 8, flex: 1 }}>
        <div
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#8A8C8A",
            marginBottom: 14,
          }}
        >
          Criteria match
        </div>
        <Checklist criteria={criteria} />
      </div>
    </div>
  );
}

// ─── Standalone card wrapper — for the "match detail view" ───────────────────
export function MatchScoreCard({
  score,
  criteria,
  supplierName,
  buyerName,
}: {
  score: number;
  criteria?: MatchCriteria[];
  supplierName?: string;
  buyerName?: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E2",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        padding: "32px",
        maxWidth: 520,
      }}
    >
      {/* Card header */}
      {(supplierName || buyerName) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: "1px solid #F1F1EF",
          }}
        >
          {supplierName && (
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "#1A1D1B",
                background: "#F1F1EF",
                border: "1px solid #E5E5E2",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              {supplierName}
            </span>
          )}
          {supplierName && buyerName && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8H13M10 5l3 3-3 3" stroke="#8A8C8A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {buyerName && (
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "#1A1D1B",
                background: "#F1F1EF",
                border: "1px solid #E5E5E2",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              {buyerName}
            </span>
          )}
        </div>
      )}

      <MatchScore score={score} size="large" criteria={criteria} animated />
    </div>
  );
}
