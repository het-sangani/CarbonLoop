import { useState } from "react";
import MatchScore from "./MatchScore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Deterministic hue from a string — keeps monograms visually distinct
function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

// Palette of muted, on-brand background tints for monogram avatars
const AVATAR_PALETTES: { bg: string; fg: string }[] = [
  { bg: "#E8F4F1", fg: "#1A6158" },  // teal tint
  { bg: "#EAF0EB", fg: "#2A5C3A" },  // green tint
  { bg: "#EDECEA", fg: "#3A3C3A" },  // warm charcoal
  { bg: "#E9EEF4", fg: "#2A3F5C" },  // slate blue
  { bg: "#F0EAEA", fg: "#5C2A2A" },  // warm terracotta
  { bg: "#EAE9F4", fg: "#3A2A5C" },  // muted indigo
];

function avatarPalette(name: string) {
  const hue = hueFromString(name);
  return AVATAR_PALETTES[hue % AVATAR_PALETTES.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Geometric monogram avatar ────────────────────────────────────────────────
function MonogramAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const { bg, fg } = avatarPalette(name);
  const letters = initials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        // Subtle inner border for the geometric effect
        boxShadow: `inset 0 0 0 1px ${fg}18`,
      }}
    >
      <span
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: size * 0.36,
          fontWeight: 600,
          color: fg,
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        {letters}
      </span>
    </div>
  );
}

// ─── Stat pair cell ───────────────────────────────────────────────────────────
function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 17,
          fontWeight: 500,
          color: "#1A1D1B",
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          color: "#8A8C8A",
          marginTop: 4,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SupplierCardProps {
  company: string;
  industry: string;
  quantity: string;           // e.g. "500 t"
  purity: string;             // e.g. "96%"
  location: string;
  available: boolean;
  availabilityLabel?: string; // e.g. "Available Now" | "Q2 2026"
  pricePerTonne: string;      // e.g. "€38 / t"
  distance?: string;          // e.g. "~340 km"
  matchScore: number;         // 0–100
  verified?: boolean;
  onView?: () => void;
}

// ─── SupplierCard ─────────────────────────────────────────────────────────────
export default function SupplierCard({
  company,
  industry,
  quantity,
  purity,
  location,
  available,
  availabilityLabel = available ? "Available Now" : "Contracted",
  pricePerTonne,
  distance,
  matchScore,
  verified = true,
  onView,
}: SupplierCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E2",
        borderRadius: 8,
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.10)"
          : "0 4px 16px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 200ms ease, transform 200ms ease",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 0", flex: 1 }}>

        {/* Row 1 — Avatar + company name + Verified badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <MonogramAvatar name={company} size={40} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1D1B",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {company}
            </div>
          </div>

          {verified && (
            <div
              style={{
                flexShrink: 0,
                border: "1px solid rgba(46,158,138,0.40)",
                borderRadius: 9999,
                padding: "3px 9px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
              }}
            >
              {/* Small checkmark icon */}
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2E9E8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  fontFamily: "IBM Plex Sans, sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#2E9E8A",
                }}
              >
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Row 2 — Industry label */}
        <div
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8A8C8A",
            marginBottom: 16,
          }}
        >
          {industry}
        </div>

        {/* Row 3 — Stat pair + match ring */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          {/* Left: two stat cells separated by a hairline */}
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ paddingRight: 20 }}>
              <StatCell value={quantity} label="Quantity" />
            </div>
            <div
              style={{
                width: 1,
                background: "#EBEBEA",
                alignSelf: "stretch",
                margin: "2px 0",
              }}
            />
            <div style={{ paddingLeft: 20 }}>
              <StatCell value={purity} label="Purity" />
            </div>
          </div>

          {/* Right: match ring — small variant with hover tooltip */}
          <MatchScore size="small" score={matchScore} animated={false} />
        </div>

        {/* Row 4 — Location + availability */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 12,
            borderBottom: "1px solid #F1F1EF",
            marginBottom: 10,
          }}
        >
          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="5" r="2" stroke="#8A8C8A" strokeWidth="1.1" />
              <path d="M6 1C3.79 1 2 2.79 2 5c0 2.76 4 7 4 7s4-4.24 4-7c0-2.21-1.79-4-4-4z" stroke="#8A8C8A" strokeWidth="1.1" fill="none" />
            </svg>
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 12,
                color: "#5A5C5A",
              }}
            >
              {location}
            </span>
          </div>

          {/* Availability */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: available ? "#2E9E8A" : "#C0B080",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: available ? "#2E9E8A" : "#8A6A30",
              }}
            >
              {availabilityLabel}
            </span>
          </div>
        </div>

        {/* Row 5 — Price + distance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              fontWeight: 500,
              color: "#1A1D1B",
              letterSpacing: "-0.01em",
            }}
          >
            {pricePerTonne}
          </span>
          {distance && (
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 12,
                color: "#8A8C8A",
              }}
            >
              {distance}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer — View Match button ────────────────────────────────────── */}
      <button
        onClick={onView}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 6,
          width: "100%",
          padding: "12px 20px",
          background: hovered ? "#FAFAF9" : "transparent",
          border: "none",
          borderTop: "1px solid #F1F1EF",
          cursor: "pointer",
          transition: "background 150ms ease",
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: hovered ? "#1A1D1B" : "#5A5C5A",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F7F7F6";
          e.currentTarget.style.color = "#1A1D1B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = hovered ? "#FAFAF9" : "transparent";
          e.currentTarget.style.color = hovered ? "#1A1D1B" : "#5A5C5A";
        }}
      >
        View Match
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </article>
  );
}
