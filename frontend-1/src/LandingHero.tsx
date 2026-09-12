import HeroOrb from "./HeroOrb";

// ─── Flow diagram node ────────────────────────────────────────────────────────
function FlowNode({
  label,
  sub,
  index,
}: {
  label: string;
  sub: string;
  index: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Node circle */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#FFFFFF",
          border: "1px solid #E5E5E2",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Inner teal ring accent */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(46,158,138,0.08)",
            border: "1px solid rgba(46,158,138,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              fontWeight: 500,
              color: "#2E9E8A",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1D1B",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 11,
            color: "#8A8C8A",
            marginTop: 3,
            maxWidth: 96,
            lineHeight: 1.45,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

// ─── Curved connector SVG between flow nodes ──────────────────────────────────
function FlowConnector() {
  return (
    <svg
      width={80}
      height={48}
      viewBox="0 0 80 48"
      style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 24 }}
      aria-hidden
    >
      {/* Gentle S-curve connecting two nodes */}
      <path
        d="M 0 24 C 20 24, 60 24, 80 24"
        fill="none"
        stroke="#D0D0CC"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Small terminal dot */}
      <circle cx="80" cy="24" r="2" fill="#E5E5E2" />
      <circle cx="0"  cy="24" r="2" fill="#E5E5E2" />
    </svg>
  );
}

// ─── Main landing hero ────────────────────────────────────────────────────────
export default function LandingHero({ onBrowse }: { onBrowse?: () => void }) {
  const nodes = [
    { label: "Capture",   sub: "Verified CO₂ at source" },
    { label: "Match",     sub: "Algorithmic buyer pairing" },
    { label: "Transport", sub: "Logistics & custody chain" },
    { label: "Reuse",     sub: "Materials, fuels, grow" },
  ];

  return (
    <div style={{ background: "#FAFAF9", position: "relative" }}>

      {/* ── Background grid — barely visible, fades at edges ────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(26,29,27,0.055) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(26,29,27,0.055) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          // Radial mask: grid fades at all four edges
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Hero section ────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "96px 48px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* ── LEFT: Copy ───────────────────────────────────────────────────── */}
        <div>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
              padding: "5px 12px 5px 8px",
              background: "rgba(46,158,138,0.07)",
              border: "1px solid rgba(46,158,138,0.18)",
              borderRadius: 9999,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#2E9E8A",
                opacity: 0.9,
              }}
            />
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#2E9E8A",
              }}
            >
              Industrial CO₂ Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: "clamp(30px, 3.6vw, 48px)",
              fontWeight: 300,
              color: "#1A1D1B",
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              margin: "0 0 20px",
            }}
          >
            Close the loop on{" "}
            <span
              style={{
                fontWeight: 600,
                // No gradient, no glow — just weight contrast
              }}
            >
              captured CO₂.
            </span>
          </h1>

          {/* Subhead */}
          <p
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 16,
              fontWeight: 400,
              color: "#5A5C5A",
              lineHeight: 1.65,
              margin: "0 0 36px",
              maxWidth: 420,
            }}
          >
            CarbonLoop connects industrial CO₂ suppliers with buyers in materials, synthetic fuels, and controlled-environment agriculture — with verified provenance and real-time match scoring.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Primary — teal solid */}
            <button
              onClick={onBrowse}
              style={{
                background: "#2E9E8A",
                color: "#FAFAF9",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "IBM Plex Sans, sans-serif",
                letterSpacing: "-0.01em",
                transition: "background 180ms ease, transform 150ms ease, box-shadow 180ms ease",
                boxShadow: "0 2px 8px rgba(46,158,138,0.22)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3BB8A2";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(46,158,138,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2E9E8A";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(46,158,138,0.22)";
              }}
            >
              Browse Listings
            </button>

            {/* Secondary — ghost */}
            <button
              style={{
                background: "transparent",
                color: "#1A1D1B",
                border: "1px solid #D0D0CC",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 400,
                cursor: "pointer",
                fontFamily: "IBM Plex Sans, sans-serif",
                letterSpacing: "-0.01em",
                transition: "border-color 180ms ease, color 180ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1A1D1B";
                e.currentTarget.style.color = "#1A1D1B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#D0D0CC";
                e.currentTarget.style.color = "#1A1D1B";
              }}
            >
              Request Demo
            </button>
          </div>

          {/* Social proof ticks */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 40,
              paddingTop: 32,
              borderTop: "1px solid #EBEBEA",
            }}
          >
            {[
              { v: "340+", l: "Verified suppliers" },
              { v: "2.4 Mt", l: "CO₂ matched" },
              { v: "97%",   l: "Settlement rate" },
            ].map(({ v, l }) => (
              <div key={l}>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 20,
                    fontWeight: 500,
                    color: "#1A1D1B",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {v}
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#8A8C8A",
                    marginTop: 4,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Orb + floating data card ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Orb — at least 30% clearance on each side */}
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5% 10%",  // ensures 30%+ whitespace around orb
            }}
          >
            <HeroOrb size={280} />
          </div>

          {/* Floating match card — glassmorphic, bottom-left of orb */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: "2%",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(229,229,226,0.85)",
              borderRadius: 10,
              padding: "14px 18px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.07)",
              minWidth: 164,
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A8C8A",
                marginBottom: 8,
              }}
            >
              Latest match
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1A1D1B",
                  }}
                >
                  Linde → HeidelbergMat.
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    color: "#8A8C8A",
                    marginTop: 2,
                  }}
                >
                  14,000 t/yr · €42/t
                </div>
              </div>
              {/* Score pill */}
              <div
                style={{
                  background: "rgba(46,158,138,0.10)",
                  border: "1px solid rgba(46,158,138,0.25)",
                  borderRadius: 9999,
                  padding: "4px 10px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2E9E8A",
                }}
              >
                91%
              </div>
            </div>
          </div>

          {/* Floating purity card — top-right of orb */}
          <div
            style={{
              position: "absolute",
              top: "8%",
              right: "0%",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(229,229,226,0.85)",
              borderRadius: 10,
              padding: "12px 16px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A8C8A",
                marginBottom: 6,
              }}
            >
              CO₂ purity
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 22,
                fontWeight: 500,
                color: "#1A1D1B",
                letterSpacing: "-0.03em",
              }}
            >
              99.5%
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 3 }}>
              {[100, 100, 100, 95, 40].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: 3,
                    borderRadius: 9999,
                    background: w === 100 ? "#2E9E8A" : w === 95 ? "#2E9E8A" : "#E5E5E2",
                    opacity: w === 40 ? 0.4 : 1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Flow diagram — below the hero ────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #EBEBEA",
          background: "#FFFFFF",
          padding: "52px 48px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Section label */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 40,
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
              How it works
            </span>
          </div>

          {/* Flow: nodes + curved connectors */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 0,
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            {nodes.map((node, i) => (
              <div
                key={node.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  flex: i < nodes.length - 1 ? "1" : "0 0 auto",
                }}
              >
                <FlowNode label={node.label} sub={node.sub} index={i} />
                {i < nodes.length - 1 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-start", paddingTop: 12 }}>
                    <FlowConnector />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
