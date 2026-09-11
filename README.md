# CarbonLoop

> **Carbon Capture-to-Product Matchmaking Marketplace**

CarbonLoop is a B2B circular economy platform connecting carbon capture point sources (industrial emitters, direct air capture facilities, bioenergy plants) with carbon utilization off-takers (concrete and mineralization producers, synthetic fuel developers, chemical manufacturers, and agricultural greenhouses).

---

## The Carbon Capture-to-Product Matchmaking Problem

While carbon capture, utilization, and storage (CCUS) is critical for meeting global net-zero targets, the market connecting carbon emitters with potential commercial off-takers remains highly fragmented, manual, and opaque:

1. **Specification Mismatches**: Carbon utilization processes require specific input parameters—such as CO₂ purity (e.g., food/beverage-grade vs. industrial-grade), phase/state (gas, liquid, supercritical), continuous flow rate vs. batch delivery, and strict contaminant tolerances (sulfur, moisture, particulates). Emitters often lack clarity on which utilization pathways are compatible with their capture stream.
2. **Geographical & Transport Logistics**: Transporting CO₂ (via pipeline, cryogenic tanker truck, rail, or maritime barge) incurs significant logistical costs and transit emissions. Efficient matchmaking demands proximity and transport corridor evaluation.
3. **Information Asymmetry**: Both emitters seeking disposition pathways and utilization enterprises needing reliable feedstock lack a unified discovery mechanism to evaluate supply-demand dynamics, verifiable emissions profiles, and economic feasibility.

---

## The B2B Marketplace Concept

CarbonLoop operates as a specialized B2B marketplace engineered to bridge the gap between CO₂ supply and industrial demand:

- **Structured Listings & Discovery**: Capture facilities list available CO₂ volume, output composition, purity grades, and delivery terms. Utilization off-takers publish input specifications and volume demands.
- **Intelligent Matchmaking**: A rule-based weighted scoring engine evaluates technical compatibility (purity, volume, state), geographical proximity, and commercial tolerances.
- **Geospatial Visualization**: Interactive maps display supply clusters, off-taker locations, and transport corridors to minimize logistics overhead and lifecycle emissions.
- **Commercial Coordination**: Fosters transaction transparency, streamlined RFP/negotiation workflows, and verified compliance tracking.

---

## Planned Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI
- **Database**: Supabase PostgreSQL
- **Matching Engine**: Python rule-based weighted scoring
- **Maps**: Leaflet, OpenStreetMap
- **Deployment**: Vercel (Frontend), Render (Backend), Supabase (Database)

For a detailed overview of the system design, see [docs/architecture.md](docs/architecture.md).