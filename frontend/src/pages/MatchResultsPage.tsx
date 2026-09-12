import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { mockMatchResults } from '../data/mockData';
import { 
  Factory, 
  Building2, 
  ArrowRight, 
  SlidersHorizontal, 
  CheckCircle2, 
  Truck
} from 'lucide-react';

export const MatchResultsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState<string>(id || 'MATCH-101');

  React.useEffect(() => {
    if (id) {
      setSelectedMatchId(id);
    }
  }, [id]);

  const selectedMatch = mockMatchResults.find(m => m.id === selectedMatchId) || mockMatchResults[0];

  return (
    <PageContainer
      title="Rule-Based Weighted Match Results"
      subtitle="Deterministic multi-attribute decision scoring combining chemical purity, volumetric allocation, and transit corridors."
      badge="Algorithmic Decision Engine"
      maxWidth="7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 4 cols: Match List Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ranked Matches ({mockMatchResults.length})
            </span>
            <span className="text-xs text-emerald-400">Engine V1.0 Active</span>
          </div>

          <div className="space-y-2.5">
            {mockMatchResults.map((match) => {
              const isSelected = match.id === selectedMatch.id;
              return (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatchId(match.id)}
                  className={`w-full text-left rounded-2xl p-4 transition-all border ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-glow-emerald'
                      : 'border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{match.id}</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                      {match.breakdown.overallScore}% Score
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                      <Factory className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{match.supplier.companyName}</span>
                    </div>
                    <div className="text-xs text-slate-400 pl-5">
                      to {match.buyer.buyerName} (<span className="tabular-nums">{match.breakdown.distanceKm}</span> km)
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="tabular-nums">{match.supplier.composition.co2Purity}% CO₂ Stream</span>
                    <span className="text-emerald-400 font-semibold">{match.breakdown.economicRating}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Algorithm Rules Box */}
          <div className="glass-panel rounded-2xl p-4 text-xs text-slate-400 space-y-2 border-white/5 mt-4">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
              Scoring Weight Distribution
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Chemical Purity & Contaminants:</span>
                <strong className="text-emerald-400">40%</strong>
              </div>
              <div className="flex justify-between">
                <span>Geodesic Transit & Modality:</span>
                <strong className="text-teal-400">30%</strong>
              </div>
              <div className="flex justify-between">
                <span>Volume & Delivery Flow:</span>
                <strong className="text-cyan-400">30%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Detailed Match Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Hero Card for Selected Match */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl relative">
            
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Match Analysis
                  </span>
                  <Badge variant="emerald">{selectedMatch.breakdown.economicRating} Feasibility</Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {selectedMatch.supplier.companyName} ⟷ {selectedMatch.buyer.buyerName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {selectedMatch.supplier.location} to {selectedMatch.buyer.location} • Corridor: <span className="tabular-nums font-mono">{selectedMatch.breakdown.distanceKm}</span> km
                </p>
              </div>

              <div className="flex items-center gap-3 bg-black/40 border border-emerald-500/30 rounded-2xl px-5 py-3 text-right">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
                    {selectedMatch.breakdown.overallScore}%
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Composite Score
                  </span>
                </div>
              </div>
            </div>

            {/* Pair Comparison Box */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Supplier Box */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="h-3.5 w-3.5" />
                    Supplier (Point-Source)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedMatch.supplier.id}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{selectedMatch.supplier.companyName}</h4>
                  <p className="text-xs text-slate-400">{selectedMatch.supplier.facilityName}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Purity</span>
                    <strong className="text-emerald-400 font-mono text-sm tabular-nums">{selectedMatch.supplier.composition.co2Purity}%</strong>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                    <strong className="text-white text-sm tabular-nums">{selectedMatch.supplier.volumeTonnes.toLocaleString()} t</strong>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                    <strong className="text-emerald-300 font-mono text-sm tabular-nums">${selectedMatch.supplier.pricePerTonneUSD}/t</strong>
                  </div>
                </div>
              </div>

              {/* Buyer Box */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Buyer (Utilization Sink)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedMatch.buyer.id}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{selectedMatch.buyer.buyerName}</h4>
                  <p className="text-xs text-slate-400">{selectedMatch.buyer.facilityName}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Min Purity</span>
                    <strong className="text-cyan-400 font-mono text-sm tabular-nums">&gt; {selectedMatch.buyer.minPurityPercentage}%</strong>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Demand</span>
                    <strong className="text-white text-sm tabular-nums">{selectedMatch.buyer.volumeNeededTonnes.toLocaleString()} t</strong>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Ceiling</span>
                    <strong className="text-cyan-300 font-mono text-sm tabular-nums">${selectedMatch.buyer.targetPricePerTonneUSD}/t</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Score Breakdown Progress Bars */}
            <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mathematical Component Scoring
              </h4>

              <div className="space-y-3">
                <ProgressBar
                  label="1. Chemical Purity & Contaminant Fit (40% Weight)"
                  value={selectedMatch.breakdown.purityScore}
                  color="emerald"
                />
                <ProgressBar
                  label="2. Geographical Proximity & Modality (30% Weight)"
                  value={selectedMatch.breakdown.distanceScore}
                  color="teal"
                />
                <ProgressBar
                  label="3. Volumetric Allocation & Delivery Flow (30% Weight)"
                  value={selectedMatch.breakdown.volumeScore}
                  color="cyan"
                />
              </div>
            </div>

            {/* Compatibility Notes */}
            <div className="mt-6 rounded-xl bg-black/40 p-4 border border-white/5 space-y-2">
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Algorithm Diagnostics & Logistics Recommendation
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-5 list-disc marker:text-emerald-400">
                {selectedMatch.breakdown.compatibilityNotes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">{note}</li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-emerald-400" />
                  {selectedMatch.breakdown.recommendedModality}
                </span>
                <span>•</span>
                <span>Transit: ~<span className="tabular-nums font-mono">{selectedMatch.breakdown.estimatedTransitEmissionsKg}</span> kg CO₂</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/listings/${selectedMatch.supplyListingId}`)}
                >
                  Inspect Stream Specs
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/listings/${selectedMatch.supplyListingId}/bid`)}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Submit RFP / Bid
                </Button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};
