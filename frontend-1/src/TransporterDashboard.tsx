import { useState } from "react";
import LogisticsRoute from "./LogisticsRoute";

// ─── Shared primitives ─────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A" }}>
      {children}
    </span>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, meta, action }: { title: string; meta?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #F1F1EF" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.01em" }}>{title}</span>
        {meta && <Label>{meta}</Label>}
      </div>
      {action}
    </div>
  );
}

function Mono({ children, size = 12 }: { children: React.ReactNode; size?: number }) {
  return <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size, color: "#1A1D1B", letterSpacing: "-0.02em" }}>{children}</span>;
}

// ─── Stat chip (reused design-system pattern) ─────────────────────────────────
function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F1F1EF", border: "1px solid #E5E5E2", borderRadius: 9999, padding: "4px 10px" }}>
      <span style={{ color: "#8A8C8A", display: "flex", alignItems: "center" }}>{icon}</span>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: "#1A1D1B", whiteSpace: "nowrap" as const }}>{label}</span>
    </div>
  );
}

const IconDist = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M7 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconClock = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.05" /><path d="M5.5 3v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" /></svg>;
const IconCash = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="2.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.05" /><path d="M3.5 5.5h4M5.5 4v3" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" /></svg>;
const IconPin = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.05" /><path d="M5.5 1C3.3 1 1.5 2.8 1.5 4.5c0 2.5 4 6.5 4 6.5s4-4 4-6.5C9.5 2.8 7.7 1 5.5 1z" stroke="currentColor" strokeWidth="1.05" fill="none" /></svg>;

// ─── Delivery step pill ────────────────────────────────────────────────────────
type DeliveryStatus = "Assigned" | "Picked Up" | "In Transit" | "Delivered";

const DELIVERY_STEPS: DeliveryStatus[] = ["Assigned", "Picked Up", "In Transit", "Delivered"];

function DeliverySteps({ current }: { current: DeliveryStatus }) {
  const idx = DELIVERY_STEPS.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {DELIVERY_STEPS.map((s, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < DELIVERY_STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                background: done ? "#0F3D2E" : active ? "#2E9E8A" : "#F1F1EF",
                border: done ? "none" : active ? "2px solid #2E9E8A" : "1.5px solid #D0D0CC",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 250ms ease",
              }}>
                {done   && <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L2.8 5.5L6 2" stroke="#FAFAF9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2E9E8A" }} />}
              </div>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 8.5, fontWeight: active ? 600 : 400, color: done ? "#0F3D2E" : active ? "#2E9E8A" : "#8A8C8A", whiteSpace: "nowrap" as const }}>
                {s}
              </span>
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, marginBottom: 14, background: done ? "#0F3D2E" : "#E5E5E2", transition: "background 300ms ease", minWidth: 12 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Status pill for job state ─────────────────────────────────────────────────
function JobPill({ status }: { status: DeliveryStatus | "Open" }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Open:       { bg: "rgba(46,158,138,0.09)",  color: "#2E9E8A",  border: "rgba(46,158,138,0.25)"  },
    Assigned:   { bg: "rgba(42,63,92,0.08)",    color: "#2A3F5C",  border: "rgba(42,63,92,0.20)"    },
    "Picked Up":{ bg: "rgba(160,144,96,0.09)",  color: "#7A6A30",  border: "rgba(160,144,96,0.25)"  },
    "In Transit":{ bg: "rgba(15,61,46,0.10)",   color: "#0F3D2E",  border: "rgba(15,61,46,0.22)"    },
    Delivered:  { bg: "rgba(90,92,90,0.07)",    color: "#5A5C5A",  border: "rgba(90,92,90,0.18)"    },
  };
  const s = map[status] ?? map["Open"];
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "3px 9px", borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" as const }}>
      {status}
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  pickup: string;
  drop: string;
  pickupShort: string;
  dropShort: string;
  quantity: string;
  co2Type: string;
  distance: string;
  duration: string;
  payout: string;
  notes: string;
}

const OPEN_JOBS: Job[] = [
  { id: "JB-7712", pickup: "Leuna, Germany",        drop: "Ennigerloh, Germany",  pickupShort: "Leuna",     dropShort: "Ennigerloh", quantity: "18,000 t",  co2Type: "Industrial CO₂",    distance: "342 km",   duration: "~3h 50m",  payout: "€2,100", notes: "Cryogenic tanker required. Loading dock B." },
  { id: "JB-7698", pickup: "Teesside, UK",           drop: "Rotterdam, NL",        pickupShort: "Teesside",  dropShort: "Rotterdam",  quantity: "8,500 t",   co2Type: "Food-grade CO₂",    distance: "508 km",   duration: "~6h 10m",  payout: "€3,840", notes: "Port clearance needed. Ferry crossing Humber." },
  { id: "JB-7681", pickup: "Rotterdam, NL",          drop: "Visby, Sweden",        pickupShort: "Rotterdam", dropShort: "Visby",      quantity: "3,200 t",   co2Type: "Biogenic CO₂",      distance: "1,180 km", duration: "~14h 30m", payout: "€7,800", notes: "Cold chain — temperature ≤ −20 °C throughout." },
  { id: "JB-7660", pickup: "Porsgrunn, Norway",      drop: "Hamburg, Germany",     pickupShort: "Porsgrunn", dropShort: "Hamburg",    quantity: "5,200 t",   co2Type: "Industrial CO₂",    distance: "870 km",   duration: "~10h 45m", payout: "€5,300", notes: "Hazmat class 2.2. Driver cert required." },
];

interface ActiveJob extends Job {
  status: DeliveryStatus;
  eta: string;
}

const ACTIVE_JOBS: ActiveJob[] = [
  { ...OPEN_JOBS[0], id: "DL-0088", status: "In Transit",  eta: "ETA Sep 12, 17:30" },
  { ...OPEN_JOBS[1], id: "DL-0074", status: "Picked Up",   eta: "ETA Sep 13, 09:15" },
  { ...OPEN_JOBS[3], id: "DL-0061", status: "Assigned",    eta: "ETA Sep 14, 14:00" },
];

// ─── 1. Available Transport Jobs ───────────────────────────────────────────────
function AvailableJobs() {
  const [accepted, setAccepted] = useState<string[]>([]);
  const open = OPEN_JOBS.filter((j) => !accepted.includes(j.id));

  return (
    <Card>
      <SectionHeader
        title="Available Transport Jobs"
        meta={`${open.length} open`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#F7F7F6", border: "1px solid #EBEBEA", borderRadius: 7, padding: "5px 10px" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="4.5" cy="4.5" r="3.2" stroke="#8A8C8A" strokeWidth="1.05" /><path d="M7 7l2.5 2.5" stroke="#8A8C8A" strokeWidth="1.05" strokeLinecap="round" /></svg>
            <input placeholder="Filter jobs…" style={{ border: "none", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#1A1D1B", outline: "none", width: 110 }} />
          </div>
        }
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAFAF9" }}>
            {["Job ID", "Pickup", "Drop", "Quantity / Type", "Distance", "Duration", "Est. Payout", ""].map((h) => (
              <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", borderBottom: "1px solid #E5E5E2", whiteSpace: "nowrap" as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {open.map((job, i) => (
            <tr
              key={job.id}
              style={{ borderBottom: i < open.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "11px 14px" }}><Mono size={11}>{job.id}</Mono></td>

              {/* Pickup */}
              <td style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="2.5" stroke="#0F3D2E" strokeWidth="1" /><circle cx="4" cy="4" r="1" fill="#0F3D2E" /></svg>
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#1A1D1B" }}>{job.pickupShort}</span>
                </div>
              </td>

              {/* Drop */}
              <td style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="#2E9E8A" strokeWidth="1" /></svg>
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#1A1D1B" }}>{job.dropShort}</span>
                </div>
              </td>

              <td style={{ padding: "11px 14px" }}>
                <div><Mono size={11}>{job.quantity}</Mono></div>
                <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A", marginTop: 2 }}>{job.co2Type}</div>
              </td>

              <td style={{ padding: "11px 14px" }}><Mono size={11}>{job.distance}</Mono></td>
              <td style={{ padding: "11px 14px" }}><Mono size={11}>{job.duration}</Mono></td>

              <td style={{ padding: "11px 14px" }}>
                <Mono size={12}>{job.payout}</Mono>
              </td>

              <td style={{ padding: "11px 14px" }}>
                <button
                  onClick={() => setAccepted([...accepted, job.id])}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2E9E8A", color: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "background 150ms ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#3BB8A2"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#2E9E8A"}
                >
                  Accept Job
                </button>
              </td>
            </tr>
          ))}
          {open.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: "32px", textAlign: "center", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#8A8C8A" }}>
                No open jobs at this time.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

// ─── 2 + 3 + 4 + 5. Assigned Deliveries (combined panel) ──────────────────────
function AssignedDeliveries() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card>
      <SectionHeader title="Assigned Deliveries" meta={`${ACTIVE_JOBS.length} active`} />

      {ACTIVE_JOBS.map((job, i) => {
        const isExpanded = expanded === job.id;
        return (
          <div key={job.id} style={{ borderBottom: i < ACTIVE_JOBS.length - 1 ? "1px solid #F1F1EF" : "none" }}>
            {/* Summary row */}
            <div
              style={{ padding: "14px 18px", cursor: "pointer", transition: "background 140ms ease" }}
              onClick={() => setExpanded(isExpanded ? null : job.id)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isExpanded ? "#FAFAF9" : "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
                {/* Job ID */}
                <Mono size={11}>{job.id}</Mono>

                {/* Route shorthand */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="2.5" stroke="#0F3D2E" strokeWidth="1" /><circle cx="4" cy="4" r="1" fill="#0F3D2E" /></svg>
                    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B" }}>{job.pickupShort}</span>
                  </div>
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                    <path d="M2 5h16M14 2l4 3-4 3" stroke="#D0D0CC" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="#2E9E8A" strokeWidth="1" /></svg>
                    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B" }}>{job.dropShort}</span>
                  </div>
                </div>

                {/* Quantity + type */}
                <div style={{ minWidth: 110 }}>
                  <Mono size={11}>{job.quantity}</Mono>
                  <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A", marginTop: 1 }}>{job.co2Type}</div>
                </div>

                {/* Status pill */}
                <JobPill status={job.status} />

                {/* ETA */}
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", minWidth: 130, textAlign: "right" as const }}>{job.eta}</span>

                {/* Step steps — compact */}
                <div style={{ minWidth: 220 }}>
                  <DeliverySteps current={job.status} />
                </div>

                {/* Expand chevron */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transition: "transform 200ms ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", color: "#8A8C8A" }}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Expanded: route viz + chips + notes */}
            {isExpanded && (
              <div style={{ padding: "0 18px 18px", background: "#FAFAF9", borderTop: "1px solid #F1F1EF" }}>
                {/* Stat chips row */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, paddingTop: 14, marginBottom: 14 }}>
                  <Chip icon={<IconDist />}  label={job.distance} />
                  <Chip icon={<IconClock />} label={job.duration} />
                  <Chip icon={<IconCash />}  label={`${job.payout} payout`} />
                </div>

                {/* Route visualization — compact (560px wide, inside panel) */}
                <LogisticsRoute
                  supplierName={job.pickupShort}
                  supplierCity={job.pickup}
                  buyerName={job.dropShort}
                  buyerCity={job.drop}
                  distance={job.distance}
                  travelTime={job.duration}
                  estimatedCost={`${job.payout} payout`}
                />

                {/* Notes */}
                <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(26,29,27,0.03)", border: "1px solid #F1F1EF", borderRadius: 6 }}>
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", marginRight: 8 }}>Route notes</span>
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#5A5C5A" }}>{job.notes}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

// ─── Pickup / Drop Locations panel ────────────────────────────────────────────
function LocationsPanel() {
  // All unique locations across active jobs
  const locations = [
    { name: "Leuna, Germany",    role: "pickup" as const, jobs: ["DL-0088"], lat: 51.3, lng: 12.0 },
    { name: "Ennigerloh, Germany",role: "drop" as const,  jobs: ["DL-0088"], lat: 51.8, lng: 8.0  },
    { name: "Teesside, UK",      role: "pickup" as const, jobs: ["DL-0074"], lat: 54.6, lng: -1.2  },
    { name: "Rotterdam, NL",     role: "drop" as const,   jobs: ["DL-0074"], lat: 51.9, lng: 4.5  },
    { name: "Porsgrunn, Norway", role: "pickup" as const, jobs: ["DL-0061"], lat: 59.1, lng: 9.7  },
    { name: "Hamburg, Germany",  role: "drop" as const,   jobs: ["DL-0061"], lat: 53.6, lng: 10.0 },
  ];

  // Normalise lat/lng to a small canvas for the pseudo-map dots
  const latMin = 51, latMax = 60, lngMin = -2, lngMax = 12;
  const W = 340, H = 120;
  function toXY(lat: number, lng: number) {
    return {
      x: ((lng - lngMin) / (lngMax - lngMin)) * (W - 32) + 16,
      y: H - ((lat - latMin) / (latMax - latMin)) * (H - 20) - 10,
    };
  }

  return (
    <Card>
      <SectionHeader title="Pickup / Drop Locations" meta="Active deliveries" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 0 }}>
        {/* Location list */}
        <div>
          {locations.map((loc, i) => (
            <div
              key={loc.name}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: i < locations.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease", cursor: "default" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Icon */}
              {loc.role === "pickup"
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3" stroke="#0F3D2E" strokeWidth="1.1" /><circle cx="5" cy="5" r="1.2" fill="#0F3D2E" /></svg>
                : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1.5" y="1.5" width="7" height="7" rx="1.5" stroke="#2E9E8A" strokeWidth="1.1" /></svg>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B" }}>{loc.name}</div>
                <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A", marginTop: 1 }}>
                  {loc.role === "pickup" ? "Pickup" : "Drop"} · {loc.jobs.join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IconPin />
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#8A8C8A" }}>{loc.lat.toFixed(1)}°N {Math.abs(loc.lng).toFixed(1)}°{loc.lng >= 0 ? "E" : "W"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pseudo-map panel */}
        <div style={{ borderLeft: "1px solid #F1F1EF", padding: 12, background: "#FAFAF9", position: "relative" }}>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#BABCBA", marginBottom: 8 }}>
            Approx. locations
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", maxWidth: "100%" }}>
            <defs>
              <pattern id="tp-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.7" fill="#1A1D1B" opacity="0.06" />
              </pattern>
              <radialGradient id="tp-mask-g" cx="50%" cy="50%" r="52%">
                <stop offset="20%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="tp-mask">
                <rect width={W} height={H} fill="url(#tp-mask-g)" />
              </mask>
            </defs>
            <rect width={W} height={H} fill="url(#tp-grid)" mask="url(#tp-mask)" />

            {/* Route lines between pickup/drop pairs */}
            {[[0, 1], [2, 3], [4, 5]].map(([pi, di]) => {
              const p = toXY(locations[pi].lat, locations[pi].lng);
              const d = toXY(locations[di].lat, locations[di].lng);
              const mx = (p.x + d.x) / 2;
              const my = Math.min(p.y, d.y) - 14;
              return (
                <path
                  key={pi}
                  d={`M ${p.x} ${p.y} Q ${mx} ${my} ${d.x} ${d.y}`}
                  fill="none" stroke="#D0D0CC" strokeWidth="1" strokeDasharray="3 2"
                />
              );
            })}

            {/* Location dots */}
            {locations.map((loc) => {
              const pt = toXY(loc.lat, loc.lng);
              return (
                <g key={loc.name}>
                  <circle cx={pt.x} cy={pt.y} r={6} fill={loc.role === "pickup" ? "#0F3D2E" : "#2E9E8A"} opacity={0.12} />
                  <circle cx={pt.x} cy={pt.y} r={3} fill={loc.role === "pickup" ? "#0F3D2E" : "#2E9E8A"} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
}

// ─── Earnings summary strip ────────────────────────────────────────────────────
function EarningsStrip() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {[
        { label: "This month",        value: "€42,600",  delta: "+11% vs last month", positive: true  },
        { label: "Jobs completed",    value: "17",       delta: "+4 vs last month",   positive: true  },
        { label: "Km driven",         value: "14,820",   unit: "km"                                   },
        { label: "Fleet utilization", value: "82",       unit: "%",  delta: "+5%",    positive: true  },
      ].map((m) => (
        <div key={m.label} style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 8, padding: "16px 18px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 6 }}>{m.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 500, color: "#1A1D1B", letterSpacing: "-0.025em" }}>{m.value}</span>
            {m.unit && <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A" }}>{m.unit}</span>}
          </div>
          {m.delta && <div style={{ marginTop: 4, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: m.positive ? "#2E9E8A" : "#C04040" }}>{m.delta}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TransporterDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 4 }}>
            Transporter · Nordic CO₂ Logistics GmbH
          </div>
          <h2 style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.02em", margin: 0 }}>
            Transporter Dashboard
          </h2>
        </div>
        {/* Fleet status chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 7, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E9E8A" }} />
            <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B" }}>Fleet active</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8A8C8A" }}>9 / 11 vehicles</span>
          </div>
        </div>
      </div>

      {/* Earnings strip */}
      <EarningsStrip />

      {/* Available jobs */}
      <AvailableJobs />

      {/* Assigned deliveries — expandable rows with route viz */}
      <AssignedDeliveries />

      {/* Locations panel */}
      <LocationsPanel />
    </div>
  );
}
