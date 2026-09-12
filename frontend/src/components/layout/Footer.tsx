import React from 'react';
import { Activity, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#06090f] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand & summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-glow-emerald">
                <Activity className="h-4 w-4 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Carbon<span className="text-emerald-400">Loop</span>
              </span>
            </div>
            <p className="max-w-md text-sm text-slate-400 leading-relaxed">
              Industrial B2B Carbon Capture-to-Product matchmaking exchange. Connecting point-source emitters with commercial utilization off-takers through automated rule-based compatibility scoring and logistics optimization.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Verified Industrial Sinks
              </span>
              <span>•</span>
              <span>Geospatial Optimization</span>
            </div>
          </div>

          {/* Technology Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Stack & Architecture</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>React 18 & TypeScript</li>
              <li>Tailwind CSS Design System</li>
              <li>FastAPI Python Matching Engine</li>
              <li>Supabase PostgreSQL</li>
              <li>Leaflet / OpenStreetMap</li>
            </ul>
          </div>

          {/* CCUS Pathways */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Utilization Pathways</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>CO₂ Mineralization & Concrete</li>
              <li>Synthetic E-Fuels & SAF</li>
              <li>Polymers & Specialty Chemicals</li>
              <li>Controlled Agriculture / Greenhouses</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CarbonLoop. Decarbonization Marketplace Infrastructure.</p>
          <div className="flex items-center gap-4">
            <span>Built with React + Vite</span>
            <span>•</span>
            <span>Rule-Based Weighted Scoring</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
