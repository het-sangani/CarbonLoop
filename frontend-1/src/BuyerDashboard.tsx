import { useState } from "react";
import SupplierCard from "./SupplierCard";

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

function Mono({ children, size = 13 }: { children: React.ReactNode; size?: number }) {
  return <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size, color: "#1A1D1B", letterSpacing: "-0.02em" }}>{children}</span>;
}

// ─── Step tracker (reused from seller pattern) ─────────────────────────────────
const PROC_STEPS = ["Requested", "Accepted", "Contracted", "In Transit", "Delivered"] as const;
type ProcStep = typeof PROC_STEPS[number];

function StepTracker({ currentStep }: { currentStep: ProcStep }) {
  const idx = PROC_STEPS.indexOf(currentStep);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
      {PROC_STEPS.map((s, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < PROC_STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: done ? "#0F3D2E" : active ? "#2E9E8A" : "#F1F1EF",
                border: done ? "none" : active ? "2px solid #2E9E8A" : "1.5px solid #D0D0CC",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 300ms ease",
              }}>
                {done && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#FAFAF9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E9E8A" }} />}
              </div>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9, fontWeight: active ? 600 : 400, color: done ? "#0F3D2E" : active ? "#2E9E8A" : "#8A8C8A", whiteSpace: "nowrap" as const, letterSpacing: "0.01em" }}>
                {s}
              </span>
            </div>
            {i < PROC_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, marginBottom: 18, background: done ? "#0F3D2E" : "#E5E5E2", transition: "background 300ms ease" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Request status pill ───────────────────────────────────────────────────────
function ReqPill({ status }: { status: "Pending" | "Accepted" | "Declined" }) {
  const map = {
    Pending:  { bg: "rgba(90,92,90,0.07)",   color: "#5A5C5A",  border: "rgba(90,92,90,0.18)"    },
    Accepted: { bg: "rgba(46,158,138,0.09)", color: "#2E9E8A",  border: "rgba(46,158,138,0.25)"  },
    Declined: { bg: "rgba(192,64,64,0.08)",  color: "#C04040",  border: "rgba(192,64,64,0.20)"   },
  };
  const s = map[status];
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "3px 9px", borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" as const }}>
      {status}
    </span>
  );
}

// ─── 1. Active Requirements ────────────────────────────────────────────────────
const REQUIREMENTS = [
  {
    id: "REQ-2201",
    type: "Industrial CO₂ — food grade",
    quantity: "25,000 t/yr",
    purity: "≥ 99.5%",
    maxPrice: "€48 / t",
    location: "Central Europe",
    notes: "Concrete curing process, continuous supply preferred.",
  },
  {
    id: "REQ-2198",
    type: "Biogenic CO₂ — beverage grade",
    quantity: "4,000 t/yr",
    purity: "≥ 99.9%",
    maxPrice: "€62 / t",
    location: "Nordics",
    notes: "Fermentation capture preferred.",
  },
];

function ActiveRequirements({ onEdit }: { onEdit: () => void }) {
  return (
    <Card>
      <CardHeader
        title="Active Requirements"
        action={<span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{REQUIREMENTS.length} posted</span>}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {REQUIREMENTS.map((req, i) => (
          <div
            key={req.id}
            style={{ padding: "18px 20px", borderBottom: i < REQUIREMENTS.length - 1 ? "1px solid #F1F1EF" : "none", display: "flex", gap: 20, alignItems: "flex-start" }}
          >
            {/* Left: ID + type */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Mono size={11}>{req.id}</Mono>
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1D1B" }}>{req.type}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "8px 24px", justifyContent: "start", marginBottom: 10 }}>
                {[
                  { l: "Quantity",   v: req.quantity  },
                  { l: "Purity",     v: req.purity    },
                  { l: "Max price",  v: req.maxPrice  },
                  { l: "Region",     v: req.location  },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 3 }}>{l}</div>
                    <Mono size={12}>{v}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A", fontStyle: "italic" }}>
                {req.notes}
              </div>
            </div>
            {/* Action */}
            <button
              onClick={onEdit}
              style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 6, border: "1px solid #E5E5E2", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#5A5C5A", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E5E2"; e.currentTarget.style.color = "#5A5C5A"; }}
            >
              Edit requirement
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 2. Recommended Matches ────────────────────────────────────────────────────
const RECOMMENDED = [
  { company: "Linde Carbon GmbH",      industry: "Chemical Industry",   quantity: "18,000 t", purity: "99.5%", location: "Leuna, Germany",   available: true,  pricePerTonne: "€38 / t", distance: "~220 km",   matchScore: 94 },
  { company: "Carbon Clean Solutions", industry: "Cement Industry",      quantity: "8,500 t",  purity: "99.9%", location: "Teesside, UK",    available: true,  pricePerTonne: "€41 / t", distance: "~510 km",   matchScore: 87 },
  { company: "Orion Energy CCUS",      industry: "Steel & Metallurgy",   quantity: "32,000 t", purity: "99.2%", location: "Rotterdam, NL",   available: true,  pricePerTonne: "€35 / t", distance: "~390 km",   matchScore: 79 },
];

function RecommendedMatches() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.01em" }}>Recommended Matches</div>
        <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#2E9E8A", cursor: "pointer", fontWeight: 500 }}>View all →</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {RECOMMENDED.map((s, i) => (
          <SupplierCard key={i} {...s} verified />
        ))}
      </div>
    </div>
  );
}

// ─── 3. Marketplace Listings with glassmorphic filter panel ───────────────────
const ALL_LISTINGS = [
  { company: "Linde Carbon GmbH",      industry: "Chemical",  quantity: "18,000 t/yr", purity: "99.5%", price: "€38 / t", location: "Germany", match: 94, available: true  },
  { company: "Carbon Clean Solutions", industry: "Cement",    quantity: "8,500 t/yr",  purity: "99.9%", price: "€41 / t", location: "UK",      match: 87, available: true  },
  { company: "Orion Energy CCUS",      industry: "Steel",     quantity: "32,000 t/yr", purity: "99.2%", price: "€35 / t", location: "NL",      match: 79, available: true  },
  { company: "Aker Carbon Capture",    industry: "Waste",     quantity: "5,200 t/yr",  purity: "98.7%", price: "€47 / t", location: "Norway",  match: 72, available: false },
  { company: "Svante Technologies",    industry: "Pulp",      quantity: "11,000 t/yr", purity: "97.4%", price: "€44 / t", location: "Canada",  match: 68, available: true  },
  { company: "Climeworks AG",          industry: "DAC",       quantity: "2,400 t/yr",  purity: "99.9%", price: "€89 / t", location: "Iceland", match: 61, available: true  },
];

type Industry = "All" | "Chemical" | "Cement" | "Steel" | "Waste" | "Pulp" | "DAC";

function MarketplaceListingsPanel() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [industry, setIndustry] = useState<Industry>("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100);
  const [search, setSearch] = useState("");

  const filtered = ALL_LISTINGS.filter((l) => {
    if (industry !== "All" && l.industry !== industry) return false;
    if (onlyAvailable && !l.available) return false;
    if (parseInt(l.price.replace(/[^0-9]/g, "")) > maxPrice) return false;
    if (search && !l.company.toLowerCase().includes(search.toLowerCase()) && !l.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.01em" }}>
          Marketplace Listings
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 400, color: "#8A8C8A", marginLeft: 10 }}>{filtered.length} results</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Inline search */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#F7F7F6", border: "1px solid #EBEBEA", borderRadius: 7, padding: "6px 10px" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="#8A8C8A" strokeWidth="1.1" /><path d="M7.5 7.5L10 10" stroke="#8A8C8A" strokeWidth="1.1" strokeLinecap="round" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…" style={{ border: "none", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#1A1D1B", outline: "none", width: 150 }} />
          </div>
          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: filterOpen ? "1px solid #2E9E8A" : "1px solid #E5E5E2", background: filterOpen ? "rgba(46,158,138,0.06)" : "#FFFFFF", color: filterOpen ? "#2E9E8A" : "#5A5C5A", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 150ms ease" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M4 6.5h5M5.5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Filters
            {(industry !== "All" || onlyAvailable || maxPrice < 100) && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E9E8A", marginLeft: 2 }} />
            )}
          </button>
        </div>
      </div>

      {/* Glassmorphic filter panel */}
      {filterOpen && (
        <div style={{
          position: "absolute", top: 44, right: 0, zIndex: 30,
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(229,229,226,0.85)", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)", padding: "20px", width: 280,
        }}>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1D1B", marginBottom: 16 }}>Filter listings</div>

          {/* Industry */}
          <div style={{ marginBottom: 16 }}>
            <Label>Industry</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {(["All", "Chemical", "Cement", "Steel", "Waste", "Pulp", "DAC"] as Industry[]).map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  style={{ padding: "4px 10px", borderRadius: 9999, border: industry === ind ? "1px solid rgba(46,158,138,0.40)" : "1px solid #E5E5E2", background: industry === ind ? "rgba(46,158,138,0.10)" : "transparent", color: industry === ind ? "#2E9E8A" : "#5A5C5A", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 130ms ease" }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Max price slider */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Label>Max price</Label>
              <Mono size={12}>≤ €{maxPrice} / t</Mono>
            </div>
            <input
              type="range" min={30} max={100} value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#2E9E8A", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A" }}>€30</span>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A" }}>€100+</span>
            </div>
          </div>

          {/* Availability toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#1A1D1B" }}>Available now only</span>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              style={{ width: 38, height: 22, borderRadius: 9999, border: "none", background: onlyAvailable ? "#2E9E8A" : "#D0D0CC", cursor: "pointer", position: "relative", transition: "background 200ms ease", flexShrink: 0 }}
            >
              <div style={{ position: "absolute", top: 3, left: onlyAvailable ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.20)", transition: "left 200ms ease" }} />
            </button>
          </div>

          <button
            onClick={() => { setIndustry("All"); setOnlyAvailable(false); setMaxPrice(100); }}
            style={{ marginTop: 16, width: "100%", padding: "7px", borderRadius: 6, border: "1px solid #E5E5E2", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A", cursor: "pointer" }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results table */}
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAF9" }}>
              {["Supplier", "Industry", "Quantity", "Purity", "Price", "Match", ""].map((h) => (
                <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", borderBottom: "1px solid #E5E5E2", whiteSpace: "nowrap" as const }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr
                key={l.company}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>{l.company}</div>
                  <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", marginTop: 1 }}>{l.location} · {l.available ? <span style={{ color: "#2E9E8A" }}>Available</span> : <span style={{ color: "#8A8C8A" }}>Contracted</span>}</div>
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#8A8C8A" }}>{l.industry}</td>
                <td style={{ padding: "12px 16px" }}><Mono size={12}>{l.quantity}</Mono></td>
                <td style={{ padding: "12px 16px" }}><Mono size={12}>{l.purity}</Mono></td>
                <td style={{ padding: "12px 16px" }}><Mono size={12}>{l.price}</Mono></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 44, height: 3.5, borderRadius: 9999, background: "#F1F1EF", overflow: "hidden" }}>
                      <div style={{ width: `${l.match}%`, height: "100%", background: l.match >= 85 ? "#2E9E8A" : l.match >= 65 ? "#4DAA82" : "#A09060", borderRadius: 9999 }} />
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: l.match >= 85 ? "#2E9E8A" : l.match >= 65 ? "#4DAA82" : "#A09060", fontWeight: 500 }}>{l.match}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "rgba(46,158,138,0.09)", color: "#2E9E8A", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "background 140ms ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(46,158,138,0.18)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(46,158,138,0.09)"}>
                    Request
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "36px", textAlign: "center", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#8A8C8A" }}>
                  No listings match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── 4. Sent Requests status list ─────────────────────────────────────────────
const SENT_REQUESTS = [
  { supplier: "Linde Carbon GmbH",      qty: "18,000 t/yr", price: "€38 / t", status: "Accepted" as const, sent: "Sep 3"   },
  { supplier: "Carbon Clean Solutions", qty: "8,500 t/yr",  price: "€41 / t", status: "Pending"  as const, sent: "Sep 8"   },
  { supplier: "Orion Energy CCUS",      qty: "5,000 t/yr",  price: "€35 / t", status: "Declined" as const, sent: "Aug 28"  },
  { supplier: "Svante Technologies",    qty: "11,000 t/yr", price: "€44 / t", status: "Pending"  as const, sent: "Sep 10"  },
];

function SentRequests() {
  return (
    <Card>
      <CardHeader title="Sent Requests" action={<span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{SENT_REQUESTS.length} total</span>} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAFAF9" }}>
            {["Supplier", "Quantity", "Offered Price", "Sent", "Status"].map((h) => (
              <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8A8C8A", borderBottom: "1px solid #E5E5E2" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SENT_REQUESTS.map((r, i) => (
            <tr
              key={r.supplier}
              style={{ borderBottom: i < SENT_REQUESTS.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "12px 16px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, color: "#1A1D1B" }}>{r.supplier}</td>
              <td style={{ padding: "12px 16px" }}><Mono size={12}>{r.qty}</Mono></td>
              <td style={{ padding: "12px 16px" }}><Mono size={12}>{r.price}</Mono></td>
              <td style={{ padding: "12px 16px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>{r.sent}</td>
              <td style={{ padding: "12px 16px" }}><ReqPill status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── 5. Procurement tracker ────────────────────────────────────────────────────
const PROCUREMENTS = [
  { id: "PO-0091", supplier: "Linde Carbon GmbH",  qty: "18,000 t/yr", step: "In Transit"  as ProcStep, date: "Started Sep 5"    },
  { id: "PO-0078", supplier: "Carbon Clean Solutions", qty: "8,500 t/yr", step: "Contracted" as ProcStep, date: "Started Aug 30"  },
];

function ProcurementTracker() {
  return (
    <Card>
      <CardHeader title="Procurement Status" action={<Label>{PROCUREMENTS.length} active</Label>} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PROCUREMENTS.map((p, i) => (
          <div
            key={p.id}
            style={{ padding: "16px 20px", borderBottom: i < PROCUREMENTS.length - 1 ? "1px solid #F1F1EF" : "none", display: "flex", alignItems: "center", gap: 20 }}
          >
            <div style={{ minWidth: 180, flexShrink: 0 }}>
              <Mono size={11}>{p.id}</Mono>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B", marginTop: 3 }}>{p.supplier}</div>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", marginTop: 1 }}><Mono size={11}>{p.qty}</Mono> · {p.date}</div>
            </div>
            <div style={{ flex: 1 }}>
              <StepTracker currentStep={p.step} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── "Post New Requirement" modal ─────────────────────────────────────────────
function NewRequirementModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(26,29,27,0.45)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#FFFFFF", border: "1px solid #E5E5E2", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.14)", padding: "32px", width: 460, fontFamily: "IBM Plex Sans, sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.015em" }}>Post New Requirement</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8C8A", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {[
          { label: "CO₂ type / source preference",  placeholder: "e.g. Industrial capture, food grade" },
          { label: "Required quantity (t/yr)",        placeholder: "e.g. 25,000"                        },
          { label: "Minimum purity (%)",              placeholder: "e.g. 99.5"                          },
          { label: "Maximum price (€/t)",             placeholder: "e.g. 48"                            },
          { label: "Preferred region",                placeholder: "e.g. Central Europe"                },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 14 }}>
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
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1px solid #E5E5E2", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: "#5A5C5A", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onClose} style={{ flex: 2, padding: "10px", borderRadius: 7, border: "none", background: "#2E9E8A", color: "#FAFAF9", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Post Requirement
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Root: BuyerDashboard ─────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 4 }}>
            Buyer · HeidelbergMaterials
          </div>
          <h2 style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.02em", margin: 0 }}>
            Buyer Dashboard
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#2E9E8A", color: "#FAFAF9", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", boxShadow: "0 2px 8px rgba(46,158,138,0.22)", transition: "background 180ms ease, transform 150ms ease, box-shadow 180ms ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#3BB8A2"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(46,158,138,0.30)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#2E9E8A"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(46,158,138,0.22)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          Post New Requirement
        </button>
      </div>

      {/* Row 1: Requirements */}
      <ActiveRequirements onEdit={() => {}} />

      {/* Row 2: Recommended matches */}
      <RecommendedMatches />

      {/* Row 3: Marketplace listings with filter */}
      <MarketplaceListingsPanel />

      {/* Row 4: Sent requests + Procurement side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <SentRequests />
        <ProcurementTracker />
      </div>

      {showModal && <NewRequirementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
