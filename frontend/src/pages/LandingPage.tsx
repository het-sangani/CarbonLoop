import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Factory, 
  Building, 
  Sliders, 
  MapPin, 
  ArrowUpRight,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [selectedPathway, setSelectedPathway] = useState<number>(0);

  const pathways = [
    {
      name: 'Concrete Mineralization',
      tag: 'Permanent Sequestration',
      co2Needs: '90 - 99% Purity',
      volumeRange: '20k - 150k t/yr',
      description: 'CO₂ permanently trapped as calcium carbonate within precast and ready-mix concrete, increasing compressive strength while locking carbon indefinitely.',
      purityScore: 98,
      status: 'High Demand'
    },
    {
      name: 'Synthetic Aviation Fuels (SAF)',
      tag: 'Power-to-Liquids',
      co2Needs: '99.5%+ Purity',
      volumeRange: '100k - 500k t/yr',
      description: 'Catalytic conversion of concentrated CO₂ combined with green electrolytic hydrogen to formulate drop-in jet fuels compliant with CORSIA and EU mandates.',
      purityScore: 94,
      status: 'Active Bidding'
    },
    {
      name: 'Specialty Polymers & Chemicals',
      tag: 'Petrochem Replacement',
      co2Needs: '98.5%+ Purity',
      volumeRange: '10k - 80k t/yr',
      description: 'Replacing fossil naphtha and polyols with biogenic or captured carbon streams for polyurethane foams, coatings, and durable plastics.',
      purityScore: 91,
      status: 'Verified Sinks'
    },
    {
      name: 'Controlled Environment Agriculture',
      tag: 'AgTech Enrichment',
      co2Needs: '99.9% Food-Grade',
      volumeRange: '5k - 40k t/yr',
      description: 'Ultra-pure certified CO₂ feeds injected into industrial greenhouses to accelerate photosynthesis and increase agricultural harvest yields.',
      purityScore: 89,
      status: 'Regional Delivery'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      
      {/* Background radial glows and grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-emerald-500/15 blur-[128px]" />
      <div className="pointer-events-none absolute top-96 -right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />

      {/* 1. HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Intelligent B2B Carbon Capture-to-Product Exchange</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Turn Captured <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Carbon Streams
              </span> <br />
              Into Commercial Value.
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
              CarbonLoop bridges point-source emitters with industrial utilization off-takers. 
              Our rule-based weighted matching engine eliminates friction in CO₂ purity tolerances, 
              volumetric commitments, and transport corridor logistics.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow-emerald transition-all hover:bg-emerald-450 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Live Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/matches/MATCH-101"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:border-slate-700"
              >
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Test Matching Engine (96% Fit)</span>
              </Link>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-medium">Quick Demo:</span>
              <Link
                to="/dashboard/supplier"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Factory className="h-3.5 w-3.5" />
                ABC Cement (Supplier)
              </Link>
              <Link
                to="/dashboard/buyer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
              >
                <Building className="h-3.5 w-3.5" />
                GreenFuel (Buyer)
              </Link>
              <Link
                to="/transactions/TXN-8801"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
              >
                <span>Live Transaction</span>
              </Link>
            </div>

            {/* Trust checkmarks */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Purity & Contaminant Validation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Geospatial Distance Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>ISO Carbon Accounting</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Real-Time Match Simulation Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel glass-card-glow rounded-2xl p-6 shadow-2xl relative">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Live Match Algorithm Preview
                  </span>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  96% Match
                </span>
              </div>

              {/* Source vs Sink comparison */}
              <div className="mt-5 space-y-4">
                
                {/* Emitter Profile */}
                <div className="rounded-xl border border-white/5 bg-slate-900/80 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Factory className="h-3.5 w-3.5" />
                      Emitter Source (Point-Source)
                    </span>
                    <span className="text-[10px] text-slate-400">ID: EMS-2094</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    Bio-Ethanol Fermentation Plant
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">Purity</span>
                      <strong className="text-emerald-300">98.8% CO₂</strong>
                    </div>
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">Volume</span>
                      <strong>140k t/yr</strong>
                    </div>
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">State</span>
                      <strong>Liquefied</strong>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector with algorithm badge */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#080d16] px-3 py-1 text-xs text-emerald-400 shadow-sm">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    <span>Weighted Match Score: <strong>96 / 100</strong></span>
                  </div>
                </div>

                {/* Off-taker Profile */}
                <div className="rounded-xl border border-white/5 bg-slate-900/80 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      Industrial Off-taker (Sink)
                    </span>
                    <span className="text-[10px] text-slate-400">ID: OFT-8411</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    Precast Concrete Mineralization Facility
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">Min Purity</span>
                      <strong className="text-cyan-300">&gt; 95.0%</strong>
                    </div>
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">Intake</span>
                      <strong>120k t/yr</strong>
                    </div>
                    <div className="rounded bg-black/40 p-1.5">
                      <span className="text-slate-400 block text-[9px]">Distance</span>
                      <strong>42 km (Rail)</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Scoring breakdown bars */}
              <div className="mt-5 space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Purity & Contaminant Fit (40%)</span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Logistics & Distance Index (30%)</span>
                  <span className="text-teal-400 font-semibold">92%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: '92%' }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Volume Capacity Alignment (30%)</span>
                  <span className="text-cyan-400 font-semibold">95%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Pair: ABC Cement ⟷ GreenFuel</span>
                <Link
                  to="/matches/MATCH-101"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Inspect Full Algorithm Diagnostics</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="border-y border-white/10 bg-[#070a10]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            
            <div className="border-r border-white/5 pr-4 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">1.42M+</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Metric Tons CO₂/yr Indexed</div>
            </div>

            <div className="border-r border-white/5 pr-4 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">38</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Capture Facilities Ready</div>
            </div>

            <div className="border-r border-white/5 pr-4 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">64</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Industrial Off-takers Listed</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono tabular-nums">94.8%</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Average Algorithmic Compatibility</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THREE-PILLAR WORKFLOW */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            End-to-End Market Architecture
          </h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How CarbonLoop Closes the CCUS Loop
          </p>
          <p className="text-slate-400 text-sm sm:text-base">
            Bridging the gap between carbon capture engineering and downstream product manufacturing.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Step 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
              <Factory className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-400">STAGE 01</div>
            <h3 className="mt-2 text-xl font-bold text-white">Stream Characterization</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Capture operators list flue composition, CO₂ percentage (85-99.9%), trace contaminants (SOx, NOx, moisture), flow consistency, and supply pressure.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-5">
              <Sliders className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-cyan-400">STAGE 02</div>
            <h3 className="mt-2 text-xl font-bold text-white">Rule-Based Weighted Match</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Our deterministic scoring engine computes multi-attribute compatibility curves for each pairing, factoring in physical constraints, geographical distance, and off-take volume.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-5">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-teal-400">STAGE 03</div>
            <h3 className="mt-2 text-xl font-bold text-white">Logistics & Corridor Planning</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Visualizes pipeline networks, cryogenic road transit, and rail nodes on interactive OpenStreetMap overlays to minimize transport cost and lifecycle transit emissions.
            </p>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE UTILIZATION PATHWAYS */}
      <section className="border-t border-white/10 bg-[#070b12] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Commercial Pathways
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                Compatible Industrial Off-takers
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Select a utilization pathway to inspect purity standards, volumetric demand, and typical off-take criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Pathway Selector Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {pathways.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPathway(idx)}
                  className={`w-full text-left rounded-xl p-4 transition-all border ${
                    selectedPathway === idx
                      ? 'border-emerald-500/40 bg-emerald-500/10 shadow-glow-emerald'
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm sm:text-base">{p.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedPathway === idx 
                        ? 'bg-emerald-400 text-slate-950' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{p.co2Needs}</span>
                    <span>•</span>
                    <span>{p.volumeRange}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pathway Detail Card */}
            <div className="lg:col-span-7">
              <div className="glass-panel h-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      {pathways[selectedPathway].status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Target Compatibility: {pathways[selectedPathway].purityScore}%
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {pathways[selectedPathway].name}
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {pathways[selectedPathway].description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Purity Threshold</span>
                      <strong className="text-sm sm:text-base text-emerald-400">{pathways[selectedPathway].co2Needs}</strong>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Off-take Capacity</span>
                      <strong className="text-sm sm:text-base text-white">{pathways[selectedPathway].volumeRange}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-white/5 bg-black/40 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Verification</span>
                      <strong className="text-sm sm:text-base text-cyan-400">Permanent Sink</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Interested in sourcing or listing for this pathway?</span>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View Matching Listings
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Connect Your Carbon Capture or Offtake Operation?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Explore available point-source listings or test the rule-based weighted matchmaking engine.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow-emerald hover:bg-emerald-450 transition-all"
              >
                <span>Browse Live Listings</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/matching"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-all"
              >
                <span>Test Algorithm Rules</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
