import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Search, Filter, Building2, MapPin } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  return (
    <PageContainer
      title="CO₂ Marketplace & Stream Exchange"
      subtitle="Discover and filter active carbon capture streams and industrial utilization demand profiles."
      badge="Step 4 Preview"
    >
      <div className="space-y-6">
        
        {/* Search & Filter Mock Bar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by facility, location, or purity..."
              disabled
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
              <Filter className="h-3.5 w-3.5 text-emerald-400" />
              Purity: Any (&gt;90%)
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Radius: &lt; 250 km
            </span>
          </div>
        </div>

        {/* Informative placeholder state */}
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Marketplace Engine Foundation Ready</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Frontend routing and layout structure are operational. Full marketplace feed, Supabase integration, and live listings will be populated in subsequent development steps.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Frontend Scaffolding Active
            </span>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
