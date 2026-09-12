import { useState } from "react";
import CO2Metric from "./CO2Metric";

// ─── Primitives ───────────────────────────────────────────────────────────────
function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: light ? "rgba(250,250,249,0.45)" : "#8A8C8A" }}>
      {children}
    </span>
  );
}

function Card({ children, dark = false, style = {} }: { children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: dark ? "#1A1D1B" : "#FFFFFF",
      border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #E5E5E2",
      borderRadius: 8,
      boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.18)" : "0 4px 16px rgba(0,0,0,0.06)",
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, action, dark = false }: { title: string; action?: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#F1F1EF"}` }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: dark ? "#FAFAF9" : "#1A1D1B", letterSpacing: "-0.01em" }}>{title}</span>
      {action}
    </div>
  );
}

function Mono({ children, size = 12, light = false }: { children: React.ReactNode; size?: number; light?: boolean }) {
  return <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size, color: light ? "#FAFAF9" : "#1A1D1B", letterSpacing: "-0.02em" }}>{children}</span>;
}

function MonogramAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const palettes = [
    { bg: "#E8F4F1", fg: "#1A6158" }, { bg: "#EAF0EB", fg: "#2A5C3A" },
    { bg: "#EDECEA", fg: "#3A3C3A" }, { bg: "#E9EEF4", fg: "#2A3F5C" },
    { bg: "#F0EAEA", fg: "#5C2A2A" },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palettes.length;
  const p = palettes[h % palettes.length];
  const letters = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <div style={{ width: size, height: size, borderRadius: 6, background: p.bg, boxShadow: `inset 0 0 0 1px ${p.fg}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: size * 0.36, fontWeight: 600, color: p.fg, userSelect: "none" }}>{letters}</span>
    </div>
  );
}

// ─── 1. Ecosystem Overview — charcoal strip ───────────────────────────────────
interface MetricTile {
  label: string;
  value: string;
  unit: string;
  trend: string;
  positive: boolean;
  caption?: string;
}

const METRICS: MetricTile[] = [
  { label: "CO₂ Captured",  value: "3.82M",  unit: "tonnes",  trend: "+12%",  positive: true  },
  { label: "CO₂ Listed",    value: "2.94M",  unit: "tonnes",  trend: "+8%",   positive: true  },
  { label: "CO₂ Matched",   value: "2.41M",  unit: "tonnes",  trend: "+14%",  positive: true  },
  { label: "CO₂ Utilized",  value: "1.88M",  unit: "tonnes",  trend: "+19%",  positive: true,  caption: "Estimated" },
];

function EcosystemOverview() {
  return (
    <div style={{ background: "#1A1D1B", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", overflow: "hidden" }}>
      {/* Strip header */}
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Label light>Ecosystem Overview · FY 2025</Label>
        <Label light>Updated today</Label>
      </div>

      {/* Four metric cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {METRICS.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: "20px 20px 18px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <Label light>{m.label}</Label>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 500, color: "#FAFAF9", letterSpacing: "-0.03em" }}>
                {m.value}
              </span>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "rgba(250,250,249,0.45)" }}>{m.unit}</span>
            </div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: m.positive ? "#2E9E8A" : "#C04040" }}>
                {m.trend} vs last year
              </span>
              {m.caption && (
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "rgba(250,250,249,0.30)", letterSpacing: "0.04em" }}>
                  · {m.caption}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Utilization + Geographic Activity (side by side) ──────────────────────
function GeoActivityMap() {
  // Simulated regional activity nodes
  const regions = [
    { name: "Germany",     x: 0.52, y: 0.52, vol: 840000, operators: 82  },
    { name: "Netherlands", x: 0.46, y: 0.44, vol: 310000, operators: 34  },
    { name: "Norway",      x: 0.50, y: 0.24, vol: 220000, operators: 21  },
    { name: "UK",          x: 0.36, y: 0.38, vol: 190000, operators: 28  },
    { name: "Sweden",      x: 0.56, y: 0.27, vol: 155000, operators: 19  },
    { name: "France",      x: 0.43, y: 0.60, vol: 130000, operators: 17  },
    { name: "Poland",      x: 0.62, y: 0.49, vol: 98000,  operators: 14  },
    { name: "Iceland",     x: 0.18, y: 0.15, vol: 24000,  operators: 4   },
    { name: "Belgium",     x: 0.46, y: 0.51, vol: 72000,  operators: 9   },
    { name: "Denmark",     x: 0.51, y: 0.36, vol: 61000,  operators: 8   },
  ];

  const maxVol = Math.max(...regions.map((r) => r.vol));
  const W = 340, H = 200;

  return (
    <Card dark style={{ flex: 1 }}>
      <SectionHeader title="Geographic Activity" dark action={<Label light>10 regions</Label>} />
      <div style={{ padding: "12px 16px" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <pattern id="gov-grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="0.75" fill="#FAFAF9" opacity="0.06" />
            </pattern>
            <radialGradient id="gov-mask-g" cx="50%" cy="50%" r="52%">
              <stop offset="25%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="gov-mask">
              <rect width={W} height={H} fill="url(#gov-mask-g)" />
            </mask>
          </defs>
          <rect width={W} height={H} fill="url(#gov-grid)" mask="url(#gov-mask)" />

          {/* Region blobs — deep green halos scaled by volume */}
          {regions.map((r) => {
            const cx = r.x * W;
            const cy = r.y * H;
            const ratio = r.vol / maxVol;
            const halo  = 8 + ratio * 28;
            const core  = 3 + ratio * 7;
            return (
              <g key={r.name}>
                <circle cx={cx} cy={cy} r={halo}  fill="#2E9E8A" opacity={0.08 + ratio * 0.08} />
                <circle cx={cx} cy={cy} r={core}  fill="#2E9E8A" opacity={0.55 + ratio * 0.30} />
              </g>
            );
          })}

          {/* Labels for top regions */}
          {regions.filter((r) => r.vol > 150000).map((r) => (
            <text
              key={r.name}
              x={r.x * W}
              y={r.y * H - (10 + (r.vol / maxVol) * 14)}
              textAnchor="middle"
              fontFamily="IBM Plex Sans, sans-serif"
              fontSize="9"
              fill="rgba(250,250,249,0.55)"
              letterSpacing="0.04em"
            >
              {r.name}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[["Small (<100k t)", 0.2], ["Medium (100–400k t)", 0.5], ["High (>400k t)", 1.0]].map(([label, ratio]) => (
            <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6 + (ratio as number) * 8, height: 6 + (ratio as number) * 8, borderRadius: "50%", background: "#2E9E8A", opacity: 0.55 + (ratio as number) * 0.30, flexShrink: 0 }} />
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9.5, color: "rgba(250,250,249,0.40)" }}>{label as string}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── 3. Transaction Monitoring — sortable table ───────────────────────────────
type TxStatus = "Matched" | "Contracted" | "In Transit" | "Delivered" | "Flagged";
type SortKey = "date" | "quantity" | "value" | "status";

interface Tx {
  id: string;
  supplier: string;
  buyer: string;
  quantity: string;
  quantityN: number;
  value: string;
  valueN: number;
  status: TxStatus;
  date: string;
  dateN: number;
  region: string;
}

const TRANSACTIONS: Tx[] = [
  { id: "TX-8841", supplier: "Linde Carbon GmbH",      buyer: "HeidelbergMaterials",  quantity: "18,000 t", quantityN: 18000, value: "€684K",  valueN: 684000, status: "In Transit",  date: "Sep 10", dateN: 10, region: "DE" },
  { id: "TX-8829", supplier: "Carbon Clean Solutions", buyer: "Sundrop Fuels",         quantity: "8,500 t",  quantityN: 8500,  value: "€348K",  valueN: 348000, status: "Contracted",  date: "Sep 8",  dateN: 8,  region: "UK–US" },
  { id: "TX-8814", supplier: "Orion Energy CCUS",      buyer: "Gotland Greenhouse AB", quantity: "3,200 t",  quantityN: 3200,  value: "€186K",  valueN: 186000, status: "Delivered",   date: "Sep 6",  dateN: 6,  region: "NL–SE" },
  { id: "TX-8803", supplier: "Aker Carbon Capture",    buyer: "Norsk Greentech",       quantity: "5,200 t",  quantityN: 5200,  value: "€244K",  valueN: 244000, status: "Matched",     date: "Sep 5",  dateN: 5,  region: "NO" },
  { id: "TX-8791", supplier: "Svante Technologies",    buyer: "Carbon Cure Systems",   quantity: "11,000 t", quantityN: 11000, value: "€484K",  valueN: 484000, status: "Contracted",  date: "Sep 4",  dateN: 4,  region: "CA" },
  { id: "TX-8770", supplier: "Climeworks AG",          buyer: "Aggregate Industries",  quantity: "2,400 t",  quantityN: 2400,  value: "€214K",  valueN: 214000, status: "Flagged",     date: "Sep 2",  dateN: 2,  region: "IS–GB" },
  { id: "TX-8749", supplier: "Atlas CCS Ltd",          buyer: "Meridian Steel",        quantity: "29,000 t", quantityN: 29000, value: "€1.01M", valueN: 1010000, status: "Delivered",  date: "Aug 29", dateN: -2, region: "GB–DE" },
  { id: "TX-8731", supplier: "Linde Carbon GmbH",      buyer: "Vitens N.V.",           quantity: "6,800 t",  quantityN: 6800,  value: "€258K",  valueN: 258000, status: "Delivered",   date: "Aug 26", dateN: -5, region: "DE–NL" },
];

const TX_STATUS_STYLE: Record<TxStatus, { bg: string; color: string; border: string }> = {
  Matched:     { bg: "rgba(42,63,92,0.08)",    color: "#2A3F5C",  border: "rgba(42,63,92,0.20)"    },
  Contracted:  { bg: "rgba(160,144,96,0.09)",  color: "#7A6A30",  border: "rgba(160,144,96,0.25)"  },
  "In Transit":{ bg: "rgba(15,61,46,0.10)",    color: "#0F3D2E",  border: "rgba(15,61,46,0.22)"    },
  Delivered:   { bg: "rgba(90,92,90,0.07)",    color: "#5A5C5A",  border: "rgba(90,92,90,0.18)"    },
  Flagged:     { bg: "rgba(192,64,64,0.09)",   color: "#C04040",  border: "rgba(192,64,64,0.22)"   },
};

function TxPill({ status }: { status: TxStatus }) {
  const s = TX_STATUS_STYLE[status];
  return (
    <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "3px 8px", borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" as const }}>
      {status}
    </span>
  );
}

function TransactionTable() {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  function toggleSort(k: SortKey) {
    if (sortKey === k) setDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setDir("desc"); }
  }
  function setDir(d: "asc" | "desc") { setSortDir(d); }

  const sorted = [...TRANSACTIONS]
    .filter((t) => !search || t.supplier.toLowerCase().includes(search.toLowerCase()) || t.buyer.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search))
    .sort((a, b) => {
      const factor = sortDir === "asc" ? 1 : -1;
      if (sortKey === "date")     return factor * (a.dateN - b.dateN);
      if (sortKey === "quantity") return factor * (a.quantityN - b.quantityN);
      if (sortKey === "value")    return factor * (a.valueN - b.valueN);
      if (sortKey === "status")   return factor * a.status.localeCompare(b.status);
      return 0;
    });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ opacity: 0.25, fontSize: 9, marginLeft: 3 }}>↕</span>;
    return <span style={{ fontSize: 9, marginLeft: 3, color: "#2E9E8A" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const cols: { key?: SortKey; label: string }[] = [
    { key: undefined,   label: "ID"             },
    { key: undefined,   label: "Supplier"       },
    { key: undefined,   label: "Buyer"          },
    { key: "quantity",  label: "Quantity"       },
    { key: "value",     label: "Value"          },
    { key: "status",    label: "Status"         },
    { key: undefined,   label: "Region"         },
    { key: "date",      label: "Date"           },
  ];

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #F1F1EF" }}>
        <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.01em" }}>
          Transaction Monitoring
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 400, color: "#8A8C8A", marginLeft: 10 }}>{sorted.length} records</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F7F7F6", border: "1px solid #EBEBEA", borderRadius: 6, padding: "5px 10px" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="4.5" cy="4.5" r="3" stroke="#8A8C8A" strokeWidth="1.05" /><path d="M7 7l2.5 2.5" stroke="#8A8C8A" strokeWidth="1.05" strokeLinecap="round" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" style={{ border: "none", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#1A1D1B", outline: "none", width: 120 }} />
          </div>
          {/* Export — ghost, secondary */}
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, border: "1px solid #D0D0CC", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: "#5A5C5A", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0D0CC"; e.currentTarget.style.color = "#5A5C5A"; }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 8v1.5h8V8M5.5 1v6M3 5l2.5 2.5L8 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAFAF9" }}>
            {cols.map(({ key, label }) => (
              <th
                key={label}
                onClick={key ? () => toggleSort(key) : undefined}
                style={{ padding: "8px 14px", textAlign: "left", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: sortKey === key ? "#2E9E8A" : "#8A8C8A", borderBottom: "1px solid #E5E5E2", whiteSpace: "nowrap" as const, cursor: key ? "pointer" : "default", userSelect: "none" as const }}
              >
                {label}{key && <SortIcon col={key} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx, i) => (
            <tr
              key={tx.id}
              style={{ borderBottom: i < sorted.length - 1 ? "1px solid #F7F7F6" : "none", transition: "background 140ms ease", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "10px 14px" }}><Mono size={10}>{tx.id}</Mono></td>
              <td style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <MonogramAvatar name={tx.supplier} size={24} />
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#1A1D1B", fontWeight: 500, whiteSpace: "nowrap" as const }}>{tx.supplier.split(" ").slice(0, 2).join(" ")}</span>
                </div>
              </td>
              <td style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <MonogramAvatar name={tx.buyer} size={24} />
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#1A1D1B", fontWeight: 500, whiteSpace: "nowrap" as const }}>{tx.buyer.split(" ").slice(0, 2).join(" ")}</span>
                </div>
              </td>
              <td style={{ padding: "10px 14px" }}><Mono size={11}>{tx.quantity}</Mono></td>
              <td style={{ padding: "10px 14px" }}><Mono size={11}>{tx.value}</Mono></td>
              <td style={{ padding: "10px 14px" }}><TxPill status={tx.status} /></td>
              <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8A8C8A" }}>{tx.region}</td>
              <td style={{ padding: "10px 14px", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#8A8C8A", whiteSpace: "nowrap" as const }}>{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── 5. Verification Status ───────────────────────────────────────────────────
interface VerifRow {
  category: string;
  verified: number;
  pending: number;
  flagged: number;
}

const VERIF_DATA: VerifRow[] = [
  { category: "Suppliers",    verified: 312, pending: 24, flagged: 4  },
  { category: "Buyers",       verified: 198, pending: 31, flagged: 2  },
  { category: "Transporters", verified: 87,  pending: 9,  flagged: 1  },
];

function VerificationPanel() {
  return (
    <Card>
      <SectionHeader
        title="Verification Status"
        action={
          <button
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid #D0D0CC", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#5A5C5A", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0D0CC"; e.currentTarget.style.color = "#5A5C5A"; }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v4M5 5l2.5 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /><path d="M1.5 7.5h7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
            Review flagged
          </button>
        }
      />
      <div style={{ padding: "4px 0" }}>
        {VERIF_DATA.map((row, i) => {
          const total = row.verified + row.pending + row.flagged;
          return (
            <div key={row.category} style={{ padding: "14px 20px", borderBottom: i < VERIF_DATA.length - 1 ? "1px solid #F7F7F6" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B", minWidth: 90 }}>{row.category}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { label: `${row.verified} Verified`, bg: "rgba(46,158,138,0.09)",  color: "#2E9E8A",  border: "rgba(46,158,138,0.25)" },
                    { label: `${row.pending} Pending`,   bg: "rgba(90,92,90,0.07)",    color: "#5A5C5A",  border: "rgba(90,92,90,0.18)"   },
                    { label: `${row.flagged} Flagged`,   bg: "rgba(192,64,64,0.09)",   color: "#C04040",  border: "rgba(192,64,64,0.22)"  },
                  ].map(({ label, bg, color, border }) => (
                    <span key={label} style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", padding: "2px 8px", borderRadius: 9999, background: bg, color, border: `1px solid ${border}` }}>
                      {label}
                    </span>
                  ))}
                </div>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8A8C8A", marginLeft: "auto" }}>{total} total</span>
              </div>
              {/* Proportional bar */}
              <div style={{ display: "flex", height: 5, borderRadius: 9999, overflow: "hidden", background: "#F1F1EF" }}>
                <div style={{ width: `${(row.verified / total) * 100}%`, background: "#2E9E8A",  transition: "width 600ms ease" }} />
                <div style={{ width: `${(row.pending  / total) * 100}%`, background: "#D0D0CC",  transition: "width 600ms ease" }} />
                <div style={{ width: `${(row.flagged  / total) * 100}%`, background: "#C04040",  transition: "width 600ms ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── 6. Reporting panel ───────────────────────────────────────────────────────
const REPORTS = [
  { label: "Q3 2025 Ecosystem Report",     period: "Jul – Sep 2025", size: "2.4 MB", format: "PDF" },
  { label: "Transaction Audit Log",         period: "FY 2025 YTD",    size: "890 KB", format: "CSV" },
  { label: "Operator Compliance Summary",   period: "Sep 2025",       size: "1.1 MB", format: "XLSX" },
  { label: "CO₂ Utilization Breakdown",     period: "FY 2025 YTD",    size: "540 KB", format: "PDF" },
];

function ReportingPanel() {
  return (
    <Card>
      <SectionHeader
        title="Reporting"
        action={
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A", fontStyle: "italic" }}>
            Reports are read-only exports
          </span>
        }
      />
      <div>
        {REPORTS.map((r, i) => (
          <div
            key={r.label}
            style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: i < REPORTS.length - 1 ? "1px solid #F7F7F6" : "none", gap: 14, transition: "background 140ms ease", cursor: "default" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Format badge */}
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "#F1F1EF", border: "1px solid #E5E5E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, fontWeight: 500, color: "#5A5C5A", letterSpacing: "0.04em" }}>{r.format}</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#1A1D1B" }}>{r.label}</div>
              <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, color: "#8A8C8A", marginTop: 2 }}>{r.period} · {r.size}</div>
            </div>

            {/* Ghost export button */}
            <button
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: "1px solid #D0D0CC", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500, color: "#5A5C5A", cursor: "pointer", flexShrink: 0, transition: "border-color 150ms ease, color 150ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0D0CC"; e.currentTarget.style.color = "#5A5C5A"; }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 8v1.5h8V8M5.5 1v6M3 5l2.5 2.5L8 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Export Report
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function GovDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header — anchored in charcoal tone */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#8A8C8A", marginBottom: 4 }}>
            Government Agent · European CO₂ Registry
          </div>
          <h2 style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 600, color: "#1A1D1B", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            Oversight Console
          </h2>
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: "#8A8C8A" }}>
            Read-only · FY 2025 · Last sync 14 min ago
          </span>
        </div>
        {/* No primary CTA — secondary actions only */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, border: "1px solid #D0D0CC", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#5A5C5A", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0D0CC"; e.currentTarget.style.color = "#5A5C5A"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.5 1.5M8 8l1.5 1.5M2.5 9.5L4 8M8 4l1.5-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
            Refresh data
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, border: "1px solid #D0D0CC", background: "transparent", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500, color: "#5A5C5A", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1A1D1B"; e.currentTarget.style.color = "#1A1D1B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0D0CC"; e.currentTarget.style.color = "#5A5C5A"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10V8.5h8V10M6 1v6M4 5l2 2 2-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Export full dataset
          </button>
        </div>
      </div>

      {/* Row 1: Ecosystem overview — dark strip */}
      <EcosystemOverview />

      {/* Row 2: Utilization ring + Geo map */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "stretch" }}>
        <Card dark style={{ padding: "24px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <CO2Metric value={78} size="large" estimated />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "rgba(250,250,249,0.45)", letterSpacing: "0.04em" }}>
              of matched CO₂ reaches utilization
            </div>
          </div>
        </Card>
        <GeoActivityMap />
      </div>

      {/* Row 3: Transaction table */}
      <TransactionTable />

      {/* Row 4: Verification + Reporting side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <VerificationPanel />
        <ReportingPanel />
      </div>
    </div>
  );
}
