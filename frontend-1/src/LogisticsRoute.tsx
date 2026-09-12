import { useEffect, useRef, useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────
export interface LogisticsRouteProps {
  supplierName: string;
  supplierCity: string;
  buyerName: string;
  buyerCity: string;
  distance: string;       // e.g. "342 km"
  travelTime: string;     // e.g. "~2h 15m"
  estimatedCost: string;  // e.g. "€4,800 est. transport"
}

// ─── SVG dimensions — compact, horizontal ─────────────────────────────────────
const W = 560;
const H = 148;
const PAD_X = 56;   // horizontal padding before/after endpoint icons
const MID_Y = 64;   // vertical centre of the curve
const CTRL_Y = 18;  // how high the bezier control point lifts

// Bezier path: straight S-curve so the dot moves smoothly
const P0 = { x: PAD_X,       y: MID_Y };
const P3 = { x: W - PAD_X,   y: MID_Y };
const CP1 = { x: P0.x + (P3.x - P0.x) * 0.35, y: MID_Y - CTRL_Y };
const CP2 = { x: P0.x + (P3.x - P0.x) * 0.65, y: MID_Y - CTRL_Y };

const PATH_D = `M ${P0.x} ${P0.y} C ${CP1.x} ${CP1.y}, ${CP2.x} ${CP2.y}, ${P3.x} ${P3.y}`;

// Evaluate cubic bezier at t ∈ [0,1]
function bezier(t: number) {
  const mt = 1 - t;
  return {
    x: mt ** 3 * P0.x + 3 * mt ** 2 * t * CP1.x + 3 * mt * t ** 2 * CP2.x + t ** 3 * P3.x,
    y: mt ** 3 * P0.y + 3 * mt ** 2 * t * CP1.y + 3 * mt * t ** 2 * CP2.y + t ** 3 * P3.y,
  };
}

// ─── Animated travelling dot ──────────────────────────────────────────────────
function TravelDot() {
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number | null>(null);
  const DURATION = 2600; // ms per loop

  useEffect(() => {
    function step(ts: number) {
      if (start.current === null) start.current = ts;
      const elapsed = (ts - start.current) % DURATION;
      setT(elapsed / DURATION);
      raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const pos = bezier(t);
  // Fade in near start, fade out near end — keeps edges clean
  const opacity = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Soft halo */}
      <circle cx={pos.x} cy={pos.y} r={7} fill="#2E9E8A" opacity={opacity * 0.12} />
      {/* Core dot */}
      <circle cx={pos.x} cy={pos.y} r={3.5} fill="#2E9E8A" opacity={opacity * 0.9} />
    </g>
  );
}

// ─── Factory icon (supplier endpoint) ────────────────────────────────────────
function FactoryIcon({ x, y }: { x: number; y: number }) {
  const S = 28; // icon box size
  return (
    <g transform={`translate(${x - S / 2}, ${y - S / 2})`}>
      <rect width={S} height={S} rx={6} fill="#1A1D1B" />
      {/* Simplified industrial/factory silhouette */}
      <g fill="#FAFAF9" opacity={0.85}>
        {/* Base building */}
        <rect x={4} y={14} width={20} height={10} rx={1} />
        {/* Left chimney */}
        <rect x={5} y={9} width={4} height={7} rx={0.5} />
        {/* Right chimney */}
        <rect x={10} y={11} width={4} height={5} rx={0.5} />
        {/* Roof sawtooth — three triangles hinting at industrial shed */}
        <path d="M14 14 L17 9 L20 14Z" />
        {/* Window row */}
        <rect x={6} y={16} width={3} height={4} rx={0.5} fill="#1A1D1B" opacity={0.5} />
        <rect x={11} y={16} width={3} height={4} rx={0.5} fill="#1A1D1B" opacity={0.5} />
        <rect x={16} y={16} width={3} height={4} rx={0.5} fill="#1A1D1B" opacity={0.5} />
      </g>
    </g>
  );
}

// ─── Building icon (buyer endpoint) ──────────────────────────────────────────
function BuildingIcon({ x, y }: { x: number; y: number }) {
  const S = 28;
  return (
    <g transform={`translate(${x - S / 2}, ${y - S / 2})`}>
      <rect width={S} height={S} rx={6} fill="#0F3D2E" />
      <g fill="#FAFAF9" opacity={0.85}>
        {/* Main body */}
        <rect x={5} y={8} width={18} height={16} rx={1} />
        {/* Door */}
        <rect x={11} y={18} width={6} height={6} rx={0.5} fill="#0F3D2E" opacity={0.6} />
        {/* Window grid — 2×3 */}
        {[7, 12, 17].map((cx) =>
          [10, 14].map((cy) => (
            <rect key={`${cx}-${cy}`} x={cx} y={cy} width={3} height={2.5} rx={0.3} fill="#0F3D2E" opacity={0.5} />
          ))
        )}
      </g>
    </g>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function Chip({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#F1F1EF",
        border: "1px solid #E5E5E2",
        borderRadius: 9999,
        padding: "5px 12px",
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        color: "#1A1D1B",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "#8A8C8A", display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </div>
  );
}

// ─── Icons for chips ──────────────────────────────────────────────────────────
const IconDistance = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 6h10M8 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);
const IconCost = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1.5" y="3" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path d="M4 6h4M6 4.5v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// ─── Main component ────────────────────────────────────────────────────────────
export default function LogisticsRoute({
  supplierName,
  supplierCity,
  buyerName,
  buyerCity,
  distance,
  travelTime,
  estimatedCost,
}: LogisticsRouteProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E2",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #F1F1EF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#8A8C8A",
          }}
        >
          Logistics Route
        </span>
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "#2E9E8A",
            background: "rgba(46,158,138,0.08)",
            border: "1px solid rgba(46,158,138,0.20)",
            borderRadius: 9999,
            padding: "2px 9px",
          }}
        >
          Rail + Road
        </span>
      </div>

      {/* Visualization */}
      <div style={{ position: "relative", userSelect: "none" }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block" }}
          aria-label={`Route from ${supplierCity} to ${buyerCity}`}
          role="img"
        >
          {/* ── Background dot-grid ──────────────────────────────────────── */}
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.9" fill="#1A1D1B" opacity="0.07" />
            </pattern>
            {/* Radial fade mask so grid bleeds off at edges */}
            <radialGradient id="grid-mask-grad" cx="50%" cy="50%" r="52%">
              <stop offset="30%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="grid-mask">
              <rect width={W} height={H} fill="url(#grid-mask-grad)" />
            </mask>
          </defs>

          <rect width={W} height={H} fill="url(#dot-grid)" mask="url(#grid-mask)" />

          {/* ── Route line — dashed, thin, low-key ────────────────────── */}
          <path
            d={PATH_D}
            fill="none"
            stroke="#D0D0CC"
            strokeWidth="1.4"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* ── Animated travelling dot ───────────────────────────────── */}
          <TravelDot />

          {/* ── Endpoint icons ────────────────────────────────────────── */}
          <FactoryIcon x={P0.x} y={P0.y} />
          <BuildingIcon x={P3.x} y={P3.y} />

          {/* ── Endpoint city labels ──────────────────────────────────── */}
          <text
            x={P0.x}
            y={P0.y + 24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, sans-serif"
            fontSize="11"
            fontWeight="600"
            fill="#1A1D1B"
            letterSpacing="0"
          >
            {supplierCity}
          </text>
          <text
            x={P3.x}
            y={P3.y + 24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, sans-serif"
            fontSize="11"
            fontWeight="600"
            fill="#1A1D1B"
          >
            {buyerCity}
          </text>

          {/* ── Company name labels (small, muted, above icon) ─────────── */}
          <text
            x={P0.x}
            y={P0.y - 22}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, sans-serif"
            fontSize="10"
            fill="#8A8C8A"
          >
            {supplierName}
          </text>
          <text
            x={P3.x}
            y={P3.y - 22}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, sans-serif"
            fontSize="10"
            fill="#8A8C8A"
          >
            {buyerName}
          </text>
        </svg>
      </div>

      {/* ── Stat chips row ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 20px 16px",
          borderTop: "1px solid #F1F1EF",
          flexWrap: "wrap",
        }}
      >
        <Chip label={distance}     icon={<IconDistance />} />
        <Chip label={travelTime}   icon={<IconClock />} />
        <Chip label={estimatedCost} icon={<IconCost />} />
      </div>
    </div>
  );
}
