import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SlidersHorizontal, Cpu, Sparkles } from 'lucide-react';

export const MatchingPage: React.FC = () => {
  return (
    <PageContainer
      title="Rule-Based Weighted Matching Engine"
      subtitle="Deterministic multi-attribute decision scoring combining purity tolerances, logistics distance, and volumetric commitments."
      badge="Algorithm Foundation"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Purity Scoring */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase">Weight: 40%</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Purity & Contaminants</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluates stream CO₂ percentage vs. buyer minimum threshold. Hard penalties apply if sulfur, moisture, or particulate limits exceed sink tolerance.
          </p>
          <div className="pt-2 text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
            Score = (Purity_actual / Purity_target) * 40
          </div>
        </div>

        {/* Card 2: Distance & Logistics */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-400 uppercase">Weight: 30%</span>
            <SlidersHorizontal className="h-4 w-4 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Geospatial Logistics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Haversine geodesic distance and transit modality (pipeline, rail, cryogenic truck) weighting to optimize lifecycle transit emissions and freight costs.
          </p>
          <div className="pt-2 text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
            Score = max(0, 1 - (dist / max_dist)) * 30
          </div>
        </div>

        {/* Card 3: Volumetric Alignment */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase">Weight: 30%</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Capacity & Delivery</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compares annualized metric tonnage supply vs. buyer processing capacity, penalizing extreme oversupply or capacity shortfalls.
          </p>
          <div className="pt-2 text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
            Score = min(Vol_sup, Vol_dem) / max(...) * 30
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
