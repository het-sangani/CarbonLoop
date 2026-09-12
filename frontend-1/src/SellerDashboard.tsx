import { useState } from "react";

// ─── Shared primitives ─────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A" }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #F1F1EF" }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.01em" }}>{title}</span>
      {action}
    </div>
  );
}

function StatusPill({ status }: { status: "Active" | "Paused" | "Pending" | "Expired" }) {
  const map = {
    Active:  { bg: "rgba(46,158,138,0.09)",  color: "#2E9E8A",  border: "rgba(46,158,138,0.25)"  },
    Paused:  { bg: "rgba(160,144,96,0.09)",  color: "#7A6A30",  border: "rgba(160,144,96,0.25)"  },
    Pending: { bg: "rgba(90,92,90,0.07)",    color: "#5A5C5A",  border: "rgba(90,92,90,0.18)"    },
    Expired: { bg: "rgba(192,64,64,0.08)",   color: "#C04040",  border: "rgba(192,64,64,0.20)"   },
  };
  const s = map[status];
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "3px 9px", borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" as const }}>
      {status}
    </span>
  );
}

function Mono({ children, size = 13 }: { children: React.ReactNode; size?: number }) {
  return <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size, color: "#1A1D1B", letterSpacing: "-0.02em" }}>{children}</span>;
}

function MonogramAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const palettes = [
    { bg: "#E8F4F1", fg: "#1A6158" },
    { bg: "#EAF0EB", fg: "#2A5C3A" },
    { bg: "#EDECEA", fg: "#3A3C3A" },
    { bg: "#E9EEF4", fg: "#2A3F5C" },
    { bg: "#F0EAEA", fg: "#5C2A2A" },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palettes.length;
  const p = palettes[h % palettes.length];
  const letters = name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: 7, background: p.bg, boxShadow: `inset 0 0 0 1px ${p.fg}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: size * 0.36, fontWeight: 600, color: p.fg, userSelect: "none" }}>{letters}</span>
    </div>
  );
}

// ─── 1. CO₂ Inventory ─────────────────────────────────────────────────────────
function InventoryCard() {
  const segments = [
    { label: "Contracted",  value: 14000, color: "#0F3D2E" },
    { label: "Available",   value: 10500, color: "#2E9E8A" },
    { label: "Reserved",    value: 4200,  color: "#D0D0CC" },
    { label: "In transit",  value: 3300,  color: "#8A8C8A" },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  return (
    <Card>
      <CardHeader title="CO₂ Inventory" action={<Label>Live · Updated now</Label>} />
      <div style={{ padding: "20px" }}>
        {/* Key figures row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Total captured",  value: "32,000", unit: "t/yr"  },
            { label: "Purity",          value: "99.2",   unit: "%"     },
            { label: "Source",          value: "Flue gas capture"      },
          ].map(({ label, value, unit }) => (
            <div key={label}>
              <Label>{label}</Label>
              <div style={{ marginTop: 5, display: "flex", alignItems: "baseline", gap: 4 }}>
                <Mono size={20}>{value}</Mono>
                {unit && <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Stacked bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 8 }}>
            {segments.map((seg) => (
              <div
                key={seg.label}
                style={{ width: `${(seg.value / total) * 100}%`, background: seg.color, transition: "width 600ms ease" }}
                title={`${seg.label}: ${seg.value.toLocaleString()} t`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {segments.map((seg) => (
            <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#5A5C5A" }}>
                {seg.label} <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8A8C8A" }}>({(seg.value / 1000).toFixed(1)}k t)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── 2. Active Listings ────────────────────────────────────────────────────────
const LISTINGS = [
  { id: "CL-0041", qty: "18,000 t/yr", purity: "99.5%", price: "€38 / t", status: "Active"  as const, updated: "Today"     },
  { id: "CL-0039", qty: "8,500 t/yr",  purity: "99.9%", price: "€41 / t", status: "Active"  as const, updated: "Yesterday" },
  { id: "CL-0036", qty: "5,200 t/yr",  purity: "98.7%", price: "€36 / t", status: "Paused"  as const, updated: "3 days ago"},
  { id: "CL-0031", qty: "2,800 t/yr",  purity: "97.4%", price: "€34 / t", status: "Expired" as const, updated: "12 days ago"},
];

function ActiveListings() {
  return (
    <Card>
      <CardHeader title="Active Listings" action={
        <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>
          {LISTINGS.filter(l => l.status === "Active").length} active
        </span>
      } />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAFAF9" }}>
            {["Listing ID", "Quantity", "Purity", "Price", "Status", "Updated", ""].map((h) => (
              <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", borderBottom: "1px solid #E5E5E2", whiteSpace: "nowrap" as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LISTINGS.map((l, i) => (
            <tr
              key={l.id}
              style={{ borderBottom: i < LISTINGS.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "13px 16px" }}><Mono size={12}>{l.id}</Mono></td>
              <td style={{ padding: "13px 16px" }}><Mono size={12}>{l.qty}</Mono></td>
              <td style={{ padding: "13px 16px" }}><Mono size={12}>{l.purity}</Mono></td>
              <td style={{ padding: "13px 16px" }}><Mono size={12}>{l.price}</Mono></td>
              <td style={{ padding: "13px 16px" }}><StatusPill status={l.status} /></td>
              <td style={{ padding: "13px 16px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{l.updated}</td>
              <td style={{ padding: "13px 16px" }}>
                <button style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#2E9E8A", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>
                  Edit →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── 3. Incoming Buyer Requests ───────────────────────────────────────────────
const REQUESTS = [
  { buyer: "HeidelbergMaterials",   city: "Ennigerloh, DE", qty: "25,000 t/yr", purity: "≥ 95%", price: "€44 / t", match: 91, received: "2h ago"   },
  { buyer: "Sundrop Fuels",         city: "Alexandria, LA", qty: "12,000 t/yr", purity: "≥ 98%", price: "€49 / t", match: 83, received: "5h ago"   },
  { buyer: "Gotland Greenhouse AB", city: "Visby, SE",      qty: "3,200 t/yr",  purity: "≥ 99%", price: "€55 / t", match: 76, received: "Yesterday" },
];

function BuyerRequests() {
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <Card>
      <CardHeader title="Incoming Buyer Requests" action={
        <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>
          {REQUESTS.length - dismissed.length} new
        </span>
      } />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {REQUESTS.filter((_, i) => !dismissed.includes(i)).map((req, i, arr) => (
          <div
            key={req.buyer}
            style={{ padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid #F1F1EF" : "none", display: "flex", alignItems: "center", gap: 14 }}
          >
            <MonogramAvatar name={req.buyer} size={38} />

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1D1B", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {req.buyer}
                </span>
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", flexShrink: 0 }}>
                  {req.city}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { l: "Qty",    v: req.qty    },
                  { l: "Purity", v: req.purity },
                  { l: "Offer",  v: req.price  },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#8A8C8A", marginRight: 4 }}>{l}</span>
                    <Mono size={12}>{v}</Mono>
                  </div>
                ))}
              </div>
            </div>

            {/* Match badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, background: "#F1F1EF", overflow: "hidden" }}>
                <div style={{ width: `${req.match}%`, height: "100%", background: "#2E9E8A", borderRadius: 9999 }} />
              </div>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#2E9E8A", fontWeight: 500 }}>{req.match}%</span>
            </div>

            {/* Timestamp */}
            <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", flexShrink: 0, minWidth: 64, textAlign: "right" as const }}>{req.received}</span>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: "#2E9E8A", color: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 150ms ease" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#3BB8A2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#2E9E8A"}
              >
                Accept
              </button>
              <button
                onClick={() => setDismissed([...dismissed, REQUESTS.indexOf(req)])}
                style={{ padding: "7px 14px", borderRadius: 6, border: "1px solid #E5E5E2", background: "transparent", color: "#5A5C5A", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, cursor: "pointer", transition: "border-color 150ms ease, color 150ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C04040"; e.currentTarget.style.color = "#C04040"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E5E2"; e.currentTarget.style.color = "#5A5C5A"; }}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
        {dismissed.length === REQUESTS.length && (
          <div style={{ padding: "32px", textAlign: "center", color: "#8A8C8A", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13 }}>
            No pending requests
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── 4. Accepted Deals — step tracker ────────────────────────────────────────
const STEPS = ["Accepted", "Contracted", "In Transit", "Delivered"] as const;
type Step = typeof STEPS[number];

const DEALS = [
  { id: "DL-0088", buyer: "HeidelbergMaterials", qty: "25,000 t", step: "In Transit"  as Step, date: "Started Sep 4" },
  { id: "DL-0074", buyer: "Carbon Cure Systems",  qty: "8,000 t",  step: "Contracted" as Step, date: "Started Aug 28" },
  { id: "DL-0061", buyer: "Norsk Greentech",      qty: "4,500 t",  step: "Delivered"  as Step, date: "Completed Sep 1" },
];

function StepTracker({ currentStep }: { currentStep: Step }) {
  const idx = STEPS.indexOf(currentStep);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
      {STEPS.map((s, i) => {
        const done    = i < idx;
        const active  = i === idx;
        const pending = i > idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            {/* Node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: done ? "#0F3D2E" : active ? "#2E9E8A" : "#F1F1EF",
                border: done ? "none" : active ? "2px solid #2E9E8A" : "1.5px solid #D0D0CC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 300ms ease",
              }}>
                {done && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#FAFAF9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E9E8A" }} />}
              </div>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9.5, fontWeight: active ? 600 : 400, color: done ? "#0F3D2E" : active ? "#2E9E8A" : "#8A8C8A", whiteSpace: "nowrap" as const, letterSpacing: "0.01em" }}>
                {s}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, marginBottom: 18, background: done ? "#0F3D2E" : "#E5E5E2", transition: "background 300ms ease" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AcceptedDeals() {
  return (
    <Card>
      <CardHeader title="Accepted Deals" action={<Label>{DEALS.length} deals</Label>} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {DEALS.map((deal, i) => (
          <div
            key={deal.id}
            style={{ padding: "16px 20px", borderBottom: i < DEALS.length - 1 ? "1px solid #F1F1EF" : "none", display: "flex", alignItems: "center", gap: 20 }}
          >
            {/* Deal ID + buyer */}
            <div style={{ minWidth: 160, flexShrink: 0 }}>
              <Mono size={11}>{deal.id}</Mono>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B", marginTop: 3 }}>{deal.buyer}</div>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", marginTop: 1 }}><Mono size={11}>{deal.qty}</Mono> · {deal.date}</div>
            </div>

            {/* Step tracker */}
            <div style={{ flex: 1 }}>
              <StepTracker currentStep={deal.step} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 5. Earnings strip ────────────────────────────────────────────────────────
function EarningsStrip() {
  const metrics = [
    { label: "Revenue this month",  value: "€124,600",  delta: "+18%", positive: true  },
    { label: "Tonnes sold YTD",     value: "27,100",    unit: "t",     positive: true  },
    { label: "Avg. deal value",     value: "€42,200",   delta: "+4%",  positive: true  },
    { label: "Outstanding invoices",value: "€18,400",   delta: "-2",   positive: false },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {metrics.map((m) => (
        <Card key={m.label} style={{ padding: "18px 20px" }}>
          <Label>{m.label}</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <Mono size={22}>{m.value}</Mono>
            {m.unit && <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{m.unit}</span>}
          </div>
          {m.delta && (
            <div style={{ marginTop: 5, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: m.positive ? "#2E9E8A" : "#C04040" }}>
              {m.delta} vs last month
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── Root: SellerDashboard ─────────────────────────────────────────────────────
export default function SellerDashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 4 }}>
            Supplier · Orion Energy CCUS
          </div>
          <h2 style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.02em", margin: 0 }}>
            Seller Dashboard
          </h2>
        </div>
        {/* Primary action */}
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#2E9E8A", color: "#FAFAF9", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", boxShadow: "0 2px 8px rgba(46,158,138,0.22)", transition: "background 180ms ease, transform 150ms ease, box-shadow 180ms ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#3BB8A2"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(46,158,138,0.30)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#2E9E8A"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(46,158,138,0.22)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          Create New Listing
        </button>
      </div>

      {/* Row 1: Inventory + Earnings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <InventoryCard />
      </div>

      {/* Earnings strip */}
      <EarningsStrip />

      {/* Row 2: Listings + Requests side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ActiveListings />
        <BuyerRequests />
      </div>

      {/* Row 3: Deals tracker — full width */}
      <AcceptedDeals />

      {/* "Create Listing" modal (lightweight) */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,29,27,0.45)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.14)", padding: "32px", width: 440, fontFamily: "IBM Plex Sans, sans-serif" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.015em" }}>Create New Listing</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8C8A", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            {[
              { label: "CO₂ Volume (t/yr)",     placeholder: "e.g. 18,000" },
              { label: "Purity (%)",             placeholder: "e.g. 99.5"  },
              { label: "Asking price (€/t)",     placeholder: "e.g. 38"    },
              { label: "Source / capture type",  placeholder: "e.g. Flue gas — cement plant" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 6 }}>{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #D0D0CC", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#1A1D1B", outline: "none", boxSizing: "border-box" as const, transition: "border-color 150ms ease" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#2E9E8A"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#D0D0CC"}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1px solid #E5E5E2", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#5A5C5A", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 2, padding: "10px", borderRadius: 7, border: "none", background: "#2E9E8A", color: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
