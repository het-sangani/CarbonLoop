import { useState } from "react";

// ─── Role definitions ─────────────────────────────────────────────────────────
export type Role = "supplier" | "buyer" | "transporter" | "government";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface RoleConfig {
  role: Role;
  label: string;
  badgeColor: { bg: string; text: string; border: string };
  nav: NavItem[];
}

// ─── Role badge colours — muted, low-saturation, distinct per role ─────────────
export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  supplier: {
    role: "supplier",
    label: "Supplier",
    badgeColor: { bg: "#EAF0EB", text: "#2A5C3A", border: "rgba(42,92,58,0.22)" },
    nav: [
      { id: "overview",    label: "Overview",        icon: <IconGrid /> },
      { id: "listings",    label: "My Listings",     icon: <IconList /> },
      { id: "matches",     label: "Match Requests",  icon: <IconMatch /> },
      { id: "contracts",   label: "Contracts",       icon: <IconDoc /> },
      { id: "logistics",   label: "Logistics",       icon: <IconRoute /> },
      { id: "analytics",   label: "Analytics",       icon: <IconChart /> },
    ],
  },
  buyer: {
    role: "buyer",
    label: "Buyer",
    badgeColor: { bg: "#E8F4F1", text: "#1A6158", border: "rgba(26,97,88,0.22)" },
    nav: [
      { id: "overview",    label: "Overview",        icon: <IconGrid /> },
      { id: "marketplace", label: "Marketplace",     icon: <IconSearch /> },
      { id: "matches",     label: "My Matches",      icon: <IconMatch /> },
      { id: "contracts",   label: "Contracts",       icon: <IconDoc /> },
      { id: "impact",      label: "CO₂ Impact",      icon: <IconLeaf /> },
      { id: "analytics",   label: "Analytics",       icon: <IconChart /> },
    ],
  },
  transporter: {
    role: "transporter",
    label: "Transporter",
    badgeColor: { bg: "#EDECEA", text: "#3A3C3A", border: "rgba(58,60,58,0.18)" },
    nav: [
      { id: "overview",    label: "Overview",        icon: <IconGrid /> },
      { id: "routes",      label: "Active Routes",   icon: <IconRoute /> },
      { id: "requests",    label: "Job Requests",    icon: <IconBell /> },
      { id: "fleet",       label: "Fleet",           icon: <IconTruck /> },
      { id: "invoices",    label: "Invoices",        icon: <IconDoc /> },
      { id: "analytics",   label: "Analytics",       icon: <IconChart /> },
    ],
  },
  government: {
    role: "government",
    label: "Gov. Agent",
    badgeColor: { bg: "#E9EEF4", text: "#2A3F5C", border: "rgba(42,63,92,0.22)" },
    nav: [
      { id: "overview",    label: "Overview",        icon: <IconGrid /> },
      { id: "registry",    label: "CO₂ Registry",    icon: <IconShield /> },
      { id: "compliance",  label: "Compliance",      icon: <IconCheck /> },
      { id: "reporting",   label: "Reporting",       icon: <IconChart /> },
      { id: "operators",   label: "Operators",       icon: <IconList /> },
      { id: "audit",       label: "Audit Log",       icon: <IconDoc /> },
    ],
  },
};

// ─── Icon set — thin-stroke SVGs, 16×16 ───────────────────────────────────────
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4h8M6 8h8M6 12h8M3 4h.01M3 8h.01M3 12h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconMatch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5" cy="8" r="3" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.15" />
      <path d="M10 2v3h3M6 9h4M6 12h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function IconRoute() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="13" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 8 C7 4, 9 4, 11.5 8" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.15" />
      <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13c2-3 4-5 9-9C12 9 8 12 3 13z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
      <path d="M3 13c1-1 2-2 3-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 014 4v3l1 1.5H3L4 9V6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.15" />
      <path d="M6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="9" height="7" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 7h2.5L14 9.5V12h-4V7z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="3.5" cy="12.5" r="1.2" stroke="currentColor" strokeWidth="1.05" />
      <circle cx="11.5" cy="12.5" r="1.2" stroke="currentColor" strokeWidth="1.05" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L3 4.5v4C3 11 5.5 13.5 8 14c2.5-.5 5-3 5-5.5v-4L8 2z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
      <path d="M5.5 8l1.5 1.5L10 6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Orb logomark (inline, no external import needed) ────────────────────────
function SidebarOrb() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-label="CarbonLoop" role="img">
      <defs>
        <radialGradient id="sb-orb" cx="36%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#2E9E8A" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#2E9E8A" stopOpacity="0.44" />
        </radialGradient>
        <radialGradient id="sb-shine" cx="30%" cy="26%" r="48%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.24)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="14" rx="10" ry="3.1"
        fill="none" stroke="#2E9E8A" strokeWidth="0.8" strokeOpacity="0.45"
        strokeDasharray="4 2.5"
        style={{ animation: "orb-spin 8s linear infinite", transformOrigin: "14px 14px" }}
      />
      <circle cx="14" cy="14" r="6" fill="url(#sb-orb)" />
      <circle cx="14" cy="14" r="6" fill="url(#sb-shine)" />
      <ellipse cx="14" cy="14" rx="10" ry="3.1"
        fill="none" stroke="#2E9E8A" strokeWidth="0.8" strokeOpacity="0.65"
        strokeDasharray="4 2.5" strokeDashoffset="6.5"
        clipPath="inset(14px 0 0 0)"
        style={{ animation: "orb-spin 8s linear infinite", transformOrigin: "14px 14px" }}
      />
    </svg>
  );
}

// ─── Shell props ──────────────────────────────────────────────────────────────
export interface DashboardShellProps {
  role: Role;
  onRoleChange?: (r: Role) => void;
  activeNav: string;
  onNavChange: (id: string) => void;
  pageTitle: string;
  children: React.ReactNode;
}

// ─── DashboardShell ───────────────────────────────────────────────────────────
export default function DashboardShell({
  role,
  onRoleChange,
  activeNav,
  onNavChange,
  pageTitle,
  children,
}: DashboardShellProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const cfg = ROLE_CONFIGS[role];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif" }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "#FFFFFF",
          borderRight: "1px solid #E5E5E2",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Logo mark */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #F1F1EF",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <SidebarOrb />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#1A1D1B", letterSpacing: "-0.02em" }}>
            CarbonLoop
          </span>
        </div>

        {/* Nav section label */}
        <div style={{ padding: "16px 20px 6px", flexShrink: 0 }}>
          <span style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "#BABCBA",
          }}>
            Navigation
          </span>
        </div>

        {/* Nav list */}
        <nav style={{ flex: 1, padding: "4px 12px", overflowY: "auto" }}>
          {cfg.nav.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  marginBottom: 2,
                  borderRadius: 7,
                  border: "none",
                  background: active ? "#F1F1EF" : "transparent",
                  color: active ? "#1A1D1B" : "#5A5C5A",
                  cursor: "pointer",
                  fontFamily: "IBM Plex Sans, sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  textAlign: "left",
                  transition: "background 140ms ease, color 140ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#F7F7F6";
                    e.currentTarget.style.color = "#1A1D1B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#5A5C5A";
                  }
                }}
              >
                {/* Active indicator bar */}
                <span style={{
                  width: 2,
                  height: 16,
                  borderRadius: 9999,
                  background: active ? "#2E9E8A" : "transparent",
                  flexShrink: 0,
                  transition: "background 140ms ease",
                }} />
                <span style={{ color: active ? "#2E9E8A" : "inherit", display: "flex", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User profile — pinned bottom */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid #F1F1EF",
          flexShrink: 0,
        }}>
          {/* Role switcher (demo) */}
          {onRoleChange && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#BABCBA", marginBottom: 6 }}>
                Switch role
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(["supplier", "buyer", "transporter", "government"] as Role[]).map((r) => {
                  const rc = ROLE_CONFIGS[r];
                  const isActive = r === role;
                  return (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      style={{
                        fontFamily: "IBM Plex Sans, sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 9999,
                        border: `1px solid ${isActive ? rc.badgeColor.border : "#E5E5E2"}`,
                        background: isActive ? rc.badgeColor.bg : "transparent",
                        color: isActive ? rc.badgeColor.text : "#8A8C8A",
                        cursor: "pointer",
                        transition: "all 140ms ease",
                      }}
                    >
                      {rc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: cfg.badgeColor.bg,
              border: `1px solid ${cfg.badgeColor.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: cfg.badgeColor.text,
              flexShrink: 0,
            }}>
              ML
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1D1B", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Marcus Lee
              </div>
              <div style={{ fontSize: 11, color: "#8A8C8A", marginTop: 1 }}>
                marcus@acme-co.com
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area (offset by sidebar width) ───────────────────────────── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header style={{
          height: 56,
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E5E2",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 16,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}>
          {/* Page title */}
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#1A1D1B", letterSpacing: "-0.015em" }}>
              {pageTitle}
            </span>
          </div>

          {/* Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: searchFocused ? "#FFFFFF" : "#F7F7F6",
            border: `1px solid ${searchFocused ? "#D0D0CC" : "#EBEBEA"}`,
            borderRadius: 7,
            padding: "6px 12px",
            width: 220,
            transition: "border-color 150ms ease, background 150ms ease",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="5.5" cy="5.5" r="3.8" stroke="#8A8C8A" strokeWidth="1.1" />
              <path d="M8.5 8.5L11 11" stroke="#8A8C8A" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search listings…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                border: "none",
                background: "transparent",
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 13,
                color: "#1A1D1B",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 7,
                border: "1px solid #EBEBEA",
                background: notifOpen ? "#F1F1EF" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "background 140ms ease",
              }}
            >
              <IconBell />
              {/* Unread dot */}
              <span style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#2E9E8A",
                border: "1.5px solid #FFFFFF",
              }} />
            </button>

            {notifOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 280,
                background: "#FFFFFF",
                border: "1px solid #E5E5E2",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
                zIndex: 50,
                overflow: "hidden",
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F1EF", fontSize: 12, fontWeight: 600, color: "#1A1D1B" }}>
                  Notifications
                </div>
                {[
                  { text: "New match: Linde → HeidelbergMat.", time: "2m ago", unread: true },
                  { text: "Contract #1042 signed", time: "1h ago", unread: true },
                  { text: "Route update: Teesside route", time: "3h ago", unread: false },
                ].map((n, i) => (
                  <div key={i} style={{
                    padding: "11px 16px",
                    borderBottom: i < 2 ? "1px solid #F7F7F6" : "none",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    background: n.unread ? "#FAFFFE" : "transparent",
                    cursor: "pointer",
                  }}>
                    {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E9E8A", marginTop: 4, flexShrink: 0 }} />}
                    {!n.unread && <span style={{ width: 6, flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: 12, color: "#1A1D1B", lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: "#8A8C8A", marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role badge + profile */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: profileOpen ? "#F1F1EF" : "transparent",
                border: "1px solid #EBEBEA",
                borderRadius: 7,
                padding: "5px 10px 5px 6px",
                cursor: "pointer",
                transition: "background 140ms ease",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: cfg.badgeColor.bg,
                border: `1px solid ${cfg.badgeColor.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: cfg.badgeColor.text,
                flexShrink: 0,
              }}>
                ML
              </div>
              {/* Role pill */}
              <span style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: 9999,
                background: cfg.badgeColor.bg,
                color: cfg.badgeColor.text,
                border: `1px solid ${cfg.badgeColor.border}`,
              }}>
                {cfg.label}
              </span>
              {/* Chevron */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "#8A8C8A" }}>
                <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {profileOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 200,
                background: "#FFFFFF",
                border: "1px solid #E5E5E2",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
                zIndex: 50,
                overflow: "hidden",
                padding: "6px",
              }}>
                {[
                  { label: "Profile settings", icon: "👤" },
                  { label: "API access",       icon: "🔑" },
                  { label: "Help & docs",      icon: "📖" },
                ].map((item) => (
                  <button
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      fontFamily: "IBM Plex Sans, sans-serif",
                      fontSize: 13,
                      color: "#1A1D1B",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 120ms ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#F7F7F6"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid #F1F1EF", margin: "4px 0" }} />
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 13,
                    color: "#C04040",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#FFF5F5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span>🚪</span> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Scrollable content area ──────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#FAFAF9",
            padding: "28px 32px",
          }}
          onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
