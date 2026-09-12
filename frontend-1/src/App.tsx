import { useState } from "react";
import LandingHero from "./LandingHero";
import SupplierCard from "./SupplierCard";
import { MatchScoreCard } from "./MatchScore";
import LogisticsRoute from "./LogisticsRoute";
import CO2Metric from "./CO2Metric";
import DashboardShell, { Role, ROLE_CONFIGS } from "./DashboardShell";
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";
import TransporterDashboard from "./TransporterDashboard";
import GovDashboard from "./GovDashboard";

// ─── CarbonLoop Orb — the one recurring brand element ───────────────────────
function CarbonLoopOrb({
  size = 32,
  variant = "teal-on-dark",
  animated = true,
  className = "",
}: {
  size?: number;
  variant?: "teal-on-dark" | "teal-on-white" | "teal-on-green";
  animated?: boolean;
  className?: string;
}) {
  const sphereColor =
    variant === "teal-on-dark"
      ? "#2E9E8A"
      : variant === "teal-on-green"
      ? "#2E9E8A"
      : "#2E9E8A";
  const ringColor =
    variant === "teal-on-dark"
      ? "#2E9E8A"
      : "#2E9E8A";
  const bgColor =
    variant === "teal-on-dark"
      ? "#1A1D1B"
      : variant === "teal-on-green"
      ? "#0F3D2E"
      : "#FAFAF9";
  const innerShade =
    variant === "teal-on-dark" || variant === "teal-on-green"
      ? "rgba(255,255,255,0.07)"
      : "rgba(26,29,27,0.06)";

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
      {/* Sphere */}
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

      {/* Orbit ring — back half (behind sphere) */}
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
        className={animated ? "orb-ring" : ""}
        style={{ transformOrigin: `${r}px ${r}px` }}
      />

      {/* Sphere body */}
      <circle
        cx={r}
        cy={r}
        r={sphereR}
        fill={`url(#orb-grad-${size}-${variant})`}
        className={animated ? "orb-pulse" : ""}
      />
      {/* Sphere highlight */}
      <circle
        cx={r}
        cy={r}
        r={sphereR}
        fill={`url(#orb-shine-${size}-${variant})`}
      />
      {/* Sphere inner texture ring */}
      <circle
        cx={r}
        cy={r}
        r={sphereR * 0.65}
        fill="none"
        stroke={innerShade}
        strokeWidth="0.6"
      />

      {/* Orbit ring — front half (in front of sphere) */}
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
        className={animated ? "orb-ring" : ""}
        style={{ transformOrigin: `${r}px ${r}px` }}
      />
    </svg>
  );
}

// ─── Eyebrow label ────────────────────────────────────────────────────────────
function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="label-caps"
      style={{ color: light ? "rgba(250,250,249,0.55)" : "#8A8C8A" }}
    >
      {children}
    </span>
  );
}

// ─── Badge / pill ─────────────────────────────────────────────────────────────
function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "teal" | "green" | "warning";
}) {
  const styles = {
    neutral: { background: "#F1F1EF", color: "#5A5C5A", border: "1px solid #E5E5E2" },
    teal: { background: "rgba(46,158,138,0.10)", color: "#2E9E8A", border: "1px solid rgba(46,158,138,0.25)" },
    green: { background: "rgba(15,61,46,0.08)", color: "#0F3D2E", border: "1px solid rgba(15,61,46,0.20)" },
    warning: { background: "rgba(200,140,60,0.09)", color: "#A07020", border: "1px solid rgba(200,140,60,0.22)" },
  };
  return (
    <span
      className="label-caps"
      style={{
        ...styles[variant],
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 10,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

// ─── Match Score indicator ────────────────────────────────────────────────────
function MatchScore({ score }: { score: number }) {
  const pct = Math.round(score);
  const circumference = 2 * Math.PI * 16;
  const offset = circumference * (1 - pct / 100);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(46,158,138,0.25)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="16" fill="none" stroke="#E5E5E2" strokeWidth="2.5" />
          <circle
            cx="22"
            cy="22"
            r="16"
            fill="none"
            stroke="#2E9E8A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "22px 22px", transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            fontWeight: 500,
            color: "#2E9E8A",
          }}
        >
          {pct}%
        </span>
      </div>
      <div>
        <div className="label-caps" style={{ color: "#8A8C8A", marginBottom: 2 }}>Match Score</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>
          {pct >= 85 ? "Excellent fit" : pct >= 65 ? "Strong fit" : "Moderate fit"}
        </div>
      </div>
    </div>
  );
}

// ─── Supply/Demand card ───────────────────────────────────────────────────────
function ListingCard({
  type,
  company,
  location,
  volume,
  purity,
  industry,
  price,
  match,
}: {
  type: "supply" | "demand";
  company: string;
  location: string;
  volume: string;
  purity: string;
  industry: string;
  price: string;
  match?: number;
}) {
  return (
    <div
      className="card-lift"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E2",
        borderRadius: 8,
        padding: "24px",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Badge variant={type === "supply" ? "green" : "teal"}>
            {type === "supply" ? "Supplier" : "Buyer"}
          </Badge>
          <div style={{ marginTop: 10, fontWeight: 600, fontSize: 15, color: "#1A1D1B" }}>{company}</div>
          <div style={{ marginTop: 2, fontSize: 13, color: "#8A8C8A" }}>{location}</div>
        </div>
        {match !== undefined && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9999,
              background: "rgba(46,158,138,0.10)",
              border: "1px solid rgba(46,158,138,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              fontWeight: 500,
              color: "#2E9E8A",
              flexShrink: 0,
            }}
          >
            {match}%
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 16px",
          paddingTop: 16,
          borderTop: "1px solid #F1F1EF",
        }}
      >
        {[
          { label: "Volume", value: volume },
          { label: "Purity", value: purity },
          { label: "Industry", value: industry },
          { label: "Price", value: price },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="label-caps" style={{ color: "#8A8C8A", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, delta, unit }: { label: string; value: string; delta?: string; unit?: string }) {
  const positive = delta?.startsWith("+");
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E2",
        borderRadius: 8,
        padding: "20px 24px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div className="label-caps" style={{ color: "#8A8C8A", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 500, color: "#1A1D1B", letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: "#8A8C8A", marginLeft: 2 }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ marginTop: 6, fontSize: 12, color: positive ? "#2E9E8A" : "#C0604A", fontWeight: 500 }}>
          {delta} vs last month
        </div>
      )}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Nav({ activeTab, setActiveTab, onDashboard }: { activeTab: string; setActiveTab: (t: string) => void; onDashboard?: () => void }) {
  const tabs = ["Marketplace", "My Matches", "Portfolio", "Analytics"];
  return (
    <nav
      style={{
        background: "#0F3D2E",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 48, flexShrink: 0 }}>
          <CarbonLoopOrb size={28} variant="teal-on-green" />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#FAFAF9", letterSpacing: "-0.01em" }}>
            CarbonLoop
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "rgba(255,255,255,0.10)" : "transparent",
                color: activeTab === tab ? "#FAFAF9" : "rgba(250,250,249,0.55)",
                border: "none",
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: activeTab === tab ? 500 : 400,
                cursor: "pointer",
                transition: "background 150ms ease, color 150ms ease",
                fontFamily: "IBM Plex Sans, sans-serif",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onDashboard && (
            <button
              onClick={onDashboard}
              style={{
                background: "#2E9E8A",
                color: "#FAFAF9",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "IBM Plex Sans, sans-serif",
                letterSpacing: "-0.01em",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3BB8A2"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#2E9E8A"}
            >
              Dashboard →
            </button>
          )}
          <Badge variant="teal">Pro</Badge>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              background: "rgba(46,158,138,0.25)",
              border: "1px solid rgba(46,158,138,0.40)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#2E9E8A",
              cursor: "pointer",
            }}
          >
            ML
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Marketplace page ─────────────────────────────────────────────────────────
function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "supply" | "demand">("all");

  const suppliers = [
    { company: "Linde Carbon GmbH",     industry: "Chemical Industry",        quantity: "18,000 t",  purity: "99.5%", location: "Leuna, Germany",        available: true,  pricePerTonne: "€38 / t", distance: "~220 km",  matchScore: 94 },
    { company: "Carbon Clean Solutions", industry: "Cement Industry",           quantity: "8,500 t",   purity: "99.9%", location: "Teesside, UK",           available: true,  pricePerTonne: "€41 / t", distance: "~510 km",  matchScore: 87 },
    { company: "Orion Energy CCUS",      industry: "Steel & Metallurgy",        quantity: "32,000 t",  purity: "99.2%", location: "Rotterdam, NL",          available: true,  pricePerTonne: "€35 / t", distance: "~390 km",  matchScore: 79 },
    { company: "Aker Carbon Capture",    industry: "Waste-to-Energy",           quantity: "5,200 t",   purity: "98.7%", location: "Porsgrunn, Norway",      available: false, availabilityLabel: "Q3 2025", pricePerTonne: "€47 / t", distance: "~890 km", matchScore: 72 },
    { company: "Svante Technologies",    industry: "Pulp & Paper",              quantity: "11,000 t",  purity: "97.4%", location: "Vancouver, BC",          available: true,  pricePerTonne: "€44 / t", distance: "~7,800 km", matchScore: 68 },
    { company: "Climeworks AG",          industry: "Direct Air Capture",        quantity: "2,400 t",   purity: "99.9%", location: "Hellisheiði, Iceland",   available: true,  pricePerTonne: "€89 / t", distance: "~2,100 km", matchScore: 61 },
  ];

  const buyers = [
    { company: "HeidelbergMaterials",    industry: "Concrete Curing",           quantity: "25,000 t",  purity: "≥ 95%", location: "Ennigerloh, Germany",   available: true,  pricePerTonne: "€44 / t", distance: "~180 km",  matchScore: 91 },
    { company: "Sundrop Fuels",          industry: "Synthetic Fuels",           quantity: "12,000 t",  purity: "≥ 98%", location: "Alexandria, LA",         available: true,  pricePerTonne: "€52 / t", distance: "~8,200 km", matchScore: 83 },
    { company: "Gotland Greenhouse AB",  industry: "Controlled Horticulture",   quantity: "3,200 t",   purity: "≥ 99%", location: "Visby, Sweden",          available: true,  pricePerTonne: "€58 / t", distance: "~1,200 km", matchScore: 76 },
  ];

  const all = [
    ...suppliers.map((s) => ({ ...s, type: "supply" as const })),
    ...buyers.map((b) => ({ ...b, type: "demand" as const })),
  ].sort((a, b) => b.matchScore - a.matchScore);

  const filtered =
    activeFilter === "all"
      ? all
      : all.filter((l) => l.type === (activeFilter === "supply" ? "supply" : "demand"));

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <Label>Marketplace</Label>
          <h2 style={{ fontWeight: 600, fontSize: 22, color: "#1A1D1B", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
            Active Listings
          </h2>
          <div style={{ fontSize: 13, color: "#8A8C8A" }}>
            {filtered.length} listings · sorted by match score
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, background: "#F1F1EF", borderRadius: 8, padding: 4 }}>
          {(["all", "supply", "demand"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                background: activeFilter === f ? "#FFFFFF" : "transparent",
                color: activeFilter === f ? "#1A1D1B" : "#8A8C8A",
                border: activeFilter === f ? "1px solid #E5E5E2" : "1px solid transparent",
                borderRadius: 6,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: activeFilter === f ? 500 : 400,
                cursor: "pointer",
                fontFamily: "IBM Plex Sans, sans-serif",
                transition: "all 150ms ease",
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? "All" : f === "supply" ? "Suppliers" : "Buyers"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((listing, i) => (
          <SupplierCard
            key={i}
            company={listing.company}
            industry={listing.industry}
            quantity={listing.quantity}
            purity={listing.purity}
            location={listing.location}
            available={listing.available}
            availabilityLabel={"availabilityLabel" in listing ? listing.availabilityLabel : undefined}
            pricePerTonne={listing.pricePerTonne}
            distance={listing.distance}
            matchScore={listing.matchScore}
            verified
          />
        ))}
      </div>
    </div>
  );
}

// ─── Analytics page ────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const volumes = [12400, 15800, 13200, 18900, 21000, 19400, 24600, 27100];
  const maxVol = Math.max(...volumes);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <Label>Analytics</Label>
        <h2 style={{ fontWeight: 600, fontSize: 22, color: "#1A1D1B", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
          Portfolio Overview
        </h2>
        <div style={{ fontSize: 13, color: "#8A8C8A" }}>FY 2025 · Updated today</div>
      </div>

      {/* CO₂ Utilization + stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 32, alignItems: "stretch" }}>
        {/* Utilization metric */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E5E2",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}>
          <CO2Metric value={78} size="large" estimated />
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      <StatTile label="Total CO₂ Matched" value="27,100" unit="tonnes" delta="+14%" />
      <StatTile label="Active Contracts" value="23" delta="+3" />
      <StatTile label="Avg Match Score" value="87.4" unit="%" delta="+2.1%" />
      <StatTile label="Portfolio Value" value="€1.13M" delta="+18%" />
        </div>
      </div>

      {/* Stats row (hidden — merged above) */}
      <div style={{ display: "none" }}>
        <StatTile label="Total CO₂ Matched" value="27,100" unit="tonnes" delta="+14%" />
        <StatTile label="Active Contracts" value="23" delta="+3" />
        <StatTile label="Avg Match Score" value="87.4" unit="%" delta="+2.1%" />
        <StatTile label="Portfolio Value" value="€1.13M" delta="+18%" />
      </div>

      {/* Volume chart */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E5E2",
          borderRadius: 8,
          padding: "28px 32px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <Label>Volume Matched</Label>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1A1D1B", marginTop: 4 }}>
              Monthly CO₂ tonnes — 2025
            </div>
          </div>
          <Badge variant="teal">YTD +14%</Badge>
        </div>

        {/* Bar chart */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 140 }}>
          {volumes.map((vol, i) => {
            const h = (vol / maxVol) * 120;
            const isLast = i === volumes.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 10,
                    color: isLast ? "#2E9E8A" : "#8A8C8A",
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {(vol / 1000).toFixed(1)}k
                </div>
                <div
                  style={{
                    width: "100%",
                    height: h,
                    background: isLast ? "#2E9E8A" : "#F1F1EF",
                    border: isLast ? "none" : "1px solid #E5E5E2",
                    borderRadius: "4px 4px 0 0",
                    transition: "background 200ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLast) e.currentTarget.style.background = "#E5E5E2";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLast) e.currentTarget.style.background = "#F1F1EF";
                  }}
                />
                <div className="label-caps" style={{ color: "#8A8C8A", fontSize: 10 }}>{months[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active contracts table */}
      <div
        style={{
          marginTop: 20,
          background: "#FFFFFF",
          border: "1px solid #E5E5E2",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F1EF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1D1B" }}>Active Contracts</div>
          <Label>23 contracts</Label>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAF9" }}>
              {["Counterparty", "Type", "Volume", "Price", "Match", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 24px",
                    textAlign: "left",
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#8A8C8A",
                    borderBottom: "1px solid #E5E5E2",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "HeidelbergMaterials", type: "demand", vol: "25,000 t/yr", price: "€44", match: 91, status: "Active" },
              { name: "Linde Carbon GmbH", type: "supply", vol: "18,000 t/yr", price: "€38", match: 94, status: "Active" },
              { name: "Sundrop Fuels", type: "demand", vol: "12,000 t/yr", price: "€52", match: 83, status: "Pending" },
              { name: "Carbon Clean Solutions", type: "supply", vol: "8,500 t/yr", price: "€41", match: 87, status: "Active" },
            ].map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid #F1F1EF", transition: "background 150ms ease", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>{row.name}</td>
                <td style={{ padding: "14px 24px" }}>
                  <Badge variant={row.type === "supply" ? "green" : "teal"}>{row.type === "supply" ? "Supplier" : "Buyer"}</Badge>
                </td>
                <td style={{ padding: "14px 24px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#1A1D1B" }}>{row.vol}</td>
                <td style={{ padding: "14px 24px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#1A1D1B" }}>{row.price}/t</td>
                <td style={{ padding: "14px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 48, height: 4, background: "#F1F1EF", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ width: `${row.match}%`, height: "100%", background: "#2E9E8A", borderRadius: 9999 }} />
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#2E9E8A" }}>{row.match}%</span>
                  </div>
                </td>
                <td style={{ padding: "14px 24px" }}>
                  <Badge variant={row.status === "Active" ? "teal" : "warning"}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── My Matches page — showcases MatchScore in both sizes ────────────────────
function MyMatchesPage() {
  const [selected, setSelected] = useState(0);

  const matches = [
    {
      supplier: "Linde Carbon GmbH",
      supplierCity: "Leuna",
      buyer: "HeidelbergMaterials",
      buyerCity: "Ennigerloh",
      score: 94,
      distance: "342 km",
      travelTime: "~3h 50m",
      estimatedCost: "€2,100 est. transport",
      criteria: [
        { label: "Quantity",     met: true  },
        { label: "Purity",       met: true  },
        { label: "Location",     met: true  },
        { label: "Availability", met: true  },
        { label: "Price",        met: true  },
      ],
    },
    {
      supplier: "Carbon Clean Solutions",
      supplierCity: "Teesside",
      buyer: "Sundrop Fuels",
      buyerCity: "Alexandria, LA",
      score: 83,
      distance: "8,240 km",
      travelTime: "~18 days",
      estimatedCost: "€31,400 est. transport",
      criteria: [
        { label: "Quantity",     met: true  },
        { label: "Purity",       met: true  },
        { label: "Location",     met: false },
        { label: "Availability", met: true  },
        { label: "Price",        met: true  },
      ],
    },
    {
      supplier: "Orion Energy CCUS",
      supplierCity: "Rotterdam",
      buyer: "Gotland Greenhouse AB",
      buyerCity: "Visby",
      score: 67,
      distance: "1,180 km",
      travelTime: "~14h 30m",
      estimatedCost: "€7,800 est. transport",
      criteria: [
        { label: "Quantity",     met: true  },
        { label: "Purity",       met: false },
        { label: "Location",     met: false },
        { label: "Availability", met: true  },
        { label: "Price",        met: true  },
      ],
    },
  ];

  const active = matches[selected];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <Label>My Matches</Label>
        <h2 style={{ fontWeight: 600, fontSize: 22, color: "#1A1D1B", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
          Match Detail
        </h2>
        <div style={{ fontSize: 13, color: "#8A8C8A" }}>
          Algorithmic scoring across 5 criteria
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left: match list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {matches.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                background: selected === i ? "#FFFFFF" : "transparent",
                border: selected === i ? "1px solid #E5E5E2" : "1px solid transparent",
                borderRadius: 8,
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: selected === i ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                transition: "all 150ms ease",
                fontFamily: "IBM Plex Sans, sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>
                  {m.supplier.split(" ")[0]}
                </span>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  color: m.score >= 85 ? "#2E9E8A" : m.score >= 65 ? "#4DAA82" : "#A09060",
                }}>
                  {m.score}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#8A8C8A" }}>→ {m.buyer.split(" ")[0]}</div>
              {/* Mini progress bar */}
              <div style={{ marginTop: 8, height: 2, background: "#F1F1EF", borderRadius: 9999 }}>
                <div style={{
                  height: "100%",
                  width: `${m.score}%`,
                  background: m.score >= 85 ? "#2E9E8A" : m.score >= 65 ? "#4DAA82" : "#A09060",
                  borderRadius: 9999,
                  transition: "width 400ms ease",
                }} />
              </div>
            </button>
          ))}
        </div>

        {/* Right: match detail + logistics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MatchScoreCard
            key={selected}
            score={active.score}
            criteria={active.criteria}
            supplierName={active.supplier}
            buyerName={active.buyer}
          />
          <LogisticsRoute
            key={`route-${selected}`}
            supplierName={active.supplier}
            supplierCity={active.supplierCity}
            buyerName={active.buyer}
            buyerCity={active.buyerCity}
            distance={active.distance}
            travelTime={active.travelTime}
            estimatedCost={active.estimatedCost}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard overview placeholder content per role ─────────────────────────
function DashboardOverview({ role }: { role: Role }) {
  const labels: Record<Role, { title: string; stats: { label: string; value: string; delta?: string; unit?: string }[] }> = {
    supplier: {
      title: "Supplier Overview",
      stats: [
        { label: "Active Listings",    value: "6",         delta: "+2"   },
        { label: "Pending Matches",    value: "14",        delta: "+5"   },
        { label: "CO₂ Available",      value: "32,000",    unit: "t/yr"  },
        { label: "Avg. Price",         value: "€38",       unit: "/ t"   },
      ],
    },
    buyer: {
      title: "Buyer Overview",
      stats: [
        { label: "Active Contracts",   value: "4",         delta: "+1"   },
        { label: "CO₂ Secured",        value: "18,500",    unit: "t/yr"  },
        { label: "CO₂ Utilization",    value: "78",        unit: "%"     },
        { label: "Avg. Match Score",   value: "89",        unit: "%"     },
      ],
    },
    transporter: {
      title: "Transporter Overview",
      stats: [
        { label: "Active Routes",      value: "11",        delta: "+3"   },
        { label: "Pending Requests",   value: "7",                       },
        { label: "Fleet Utilization",  value: "82",        unit: "%"     },
        { label: "Monthly Revenue",    value: "€124K",     delta: "+9%"  },
      ],
    },
    government: {
      title: "Registry Overview",
      stats: [
        { label: "Registered Volumes", value: "2.4M",      unit: "t"     },
        { label: "Operators",          value: "340"                       },
        { label: "Compliance Rate",    value: "97.2",      unit: "%"     },
        { label: "Open Audits",        value: "3"                        },
      ],
    },
  };

  const { stats } = labels[role];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => <StatTile key={s.label} {...s} />)}
      </div>
      {role === "buyer" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 8, padding: "24px 32px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CO2Metric value={78} size="large" estimated />
          </div>
          <div style={{ flex: 1 }}>
            <MyMatchesPage />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState("Marketplace");
  const [showHero, setShowHero] = useState(true);

  // Dashboard state
  const [role, setRole] = useState<Role>("buyer");
  const [activeNav, setActiveNav] = useState("overview");

  const handleCTA = () => {
    setShowHero(false);
    setActiveTab("Marketplace");
  };

  // Derive page title from active nav
  const navLabel = ROLE_CONFIGS[role].nav.find((n) => n.id === activeNav)?.label ?? "Overview";

  // Dashboard view
  if (view === "dashboard") {
    return (
      <DashboardShell
        role={role}
        onRoleChange={(r) => { setRole(r); setActiveNav("overview"); }}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        pageTitle={navLabel}
      >
        {activeNav === "overview"   && role === "supplier"   && <SellerDashboard />}
        {activeNav === "overview"   && role === "buyer"      && <BuyerDashboard />}
        {activeNav === "overview"   && role === "transporter" && <TransporterDashboard />}
        {activeNav === "overview"   && role === "government" && <GovDashboard />}
        {activeNav === "overview"   && role !== "supplier" && role !== "buyer" && role !== "transporter" && role !== "government" && <DashboardOverview role={role} />}
        {activeNav === "matches"    && <MyMatchesPage />}
        {activeNav === "marketplace"&& <MarketplacePage />}
        {activeNav === "analytics"  && <AnalyticsPage />}
        {activeNav === "listings"   && <MarketplacePage />}
        {activeNav !== "overview" && activeNav !== "matches" && activeNav !== "marketplace" && activeNav !== "analytics" && activeNav !== "listings" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <CarbonLoopOrb size={56} variant="teal-on-white" />
            <div style={{ marginTop: 20, fontSize: 14, color: "#8A8C8A" }}>{navLabel} — coming soon</div>
          </div>
        )}
      </DashboardShell>
    );
  }

  // Landing / marketing view
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif" }}>
      <Nav
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === "Dashboard") { setView("dashboard"); return; }
          setActiveTab(t);
          setShowHero(false);
        }}
        onDashboard={() => setView("dashboard")}
      />

      {showHero && activeTab === "Marketplace" && <LandingHero onBrowse={handleCTA} />}

      {activeTab === "Marketplace" && <MarketplacePage />}
      {activeTab === "Analytics"   && <AnalyticsPage />}
      {activeTab === "My Matches"  && <MyMatchesPage />}
      {activeTab === "Portfolio"   && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
          <CarbonLoopOrb size={64} variant="teal-on-white" />
          <div style={{ marginTop: 24, fontSize: 15, color: "#8A8C8A" }}>Portfolio — coming soon</div>
        </div>
      )}
    </div>
  );
}
