import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { mockTransactions } from '../data/mockData';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Factory, 
  Building2, 
  Download,
  PhoneCall,
  Activity
} from 'lucide-react';

export const TransactionStatusPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const txn = mockTransactions.find(t => t.id === id) || mockTransactions[0];

  const stages = [
    { title: 'Term Sheet Executed', status: 'completed', date: '2026-09-11 15:40' },
    { title: 'Gas Purity Verified (GC-TCD)', status: 'completed', date: '2026-09-12 02:15' },
    { title: 'Cryo-Tanker In Transit (NH-48)', status: 'active', date: 'Estimated: 2026-09-12 18:30' },
    { title: 'Custody Transfer & Off-take', status: 'pending', date: 'Scheduled: Vadodara Hub' },
  ];

  return (
    <PageContainer
      title="Transaction Lifecycle & Chain of Custody"
      subtitle={`End-to-end audit tracking for bilateral off-take deal ${txn.id}.`}
      badge={`Contract Status • ${txn.lifecycleStage}`}
      action={
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Custody Transfer Certificate ISO-14064 generated and verified!')}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export ISO Audit Cert</span>
          </button>
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-glow-emerald transition-all"
          >
            <span>Marketplace</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        
        {/* Top Deal Summary Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-cyan-950/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Origin Seller */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Factory className="h-3 w-3" />
                Capture Supplier
              </span>
              <h3 className="text-lg font-bold text-white">{txn.sellerName}</h3>
              <p className="text-xs text-slate-400">{txn.originLocation}</p>
              <div className="pt-1 text-xs text-slate-300 font-mono">96.0% Purity Verified</div>
            </div>

            {/* Transit Corridor Indicator */}
            <div className="flex flex-col justify-center items-center text-center space-y-2 border-y md:border-y-0 md:border-x border-white/10 py-3 md:py-0">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Truck className="h-4 w-4 animate-bounce" />
                {txn.transitModality}
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {txn.distanceKm} km
              </div>
              <span className="text-[11px] text-slate-400">Via NH-48 Express Corridor</span>
            </div>

            {/* Destination Buyer */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Utilization Off-taker
              </span>
              <h3 className="text-lg font-bold text-white">{txn.buyerName}</h3>
              <p className="text-xs text-slate-400">{txn.destinationLocation}</p>
              <div className="pt-1 text-xs text-slate-300 font-mono">Power-to-X Synthesis Hub</div>
            </div>

            {/* Commercial Terms */}
            <div className="space-y-1 md:text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Settled Value
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                ${txn.totalValueUSD.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">
                {txn.volumeTonnes} tonnes @ ${txn.pricePerTonneUSD}/t
              </p>
              <Badge variant="emerald" className="mt-1">In Transit</Badge>
            </div>

          </div>
        </div>

        {/* 4-Stage Lifecycle Stepper */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Delivery Stage Progress (65% Completed)
            </h3>
            <span className="text-xs font-mono text-slate-400">Estimated Arrival: 18:30 IST</span>
          </div>

          <ProgressBar value={txn.stageProgressPercentage} color="emerald" height="md" />

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {stages.map((st, idx) => {
              const isCompleted = st.status === 'completed';
              const isActive = st.status === 'active';
              return (
                <div 
                  key={idx}
                  className={`rounded-xl p-4 border transition-all ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-glow-emerald' 
                      : isCompleted 
                        ? 'border-emerald-500/30 bg-black/40 text-slate-300' 
                        : 'border-white/5 bg-slate-900/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Stage 0{idx + 1}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    ) : (
                      <Clock className="h-4 w-4 text-slate-600" />
                    )}
                  </div>
                  <h4 className={`text-sm font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {st.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {st.date}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environmental & Carbon Accounting Audit Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Verified Carbon Ledger & Custody Lineage
            </h3>

            <div className="rounded-xl bg-black/40 p-4 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Carbon Certificate Reference:</span>
                <span className="font-mono text-emerald-400 font-semibold">{txn.carbonAccountingCertId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Gross Point-Source Abatement:</span>
                <strong className="text-white font-mono">{txn.grossEmissionsAvoidedTonnes.toFixed(2)} tCO₂</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Logistics Transport Deductions (Road Cryo):</span>
                <span className="text-rose-400 font-mono">-{txn.logisticsTransitEmissionsTonnes.toFixed(2)} tCO₂</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-white">Net Credited Circular CO₂:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {txn.netCarbonImpactTonnes.toFixed(2)} tCO₂e
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Upon final delivery at the Vadodara Power-to-X synthesis tank farm, electronic cryptographic custody tokens are stamped to prevent double-counting under Article 6 and ISO 14064 guidelines.
            </p>
          </div>

          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Logistics Dispatch Coordination
              </h3>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                <div><strong>Carrier:</strong> Gujarat Cryo-Logistics Fleet #24</div>
                <div><strong>Driver / Telemetry:</strong> Ramesh Solanki (GPS Active)</div>
                <div><strong>Tank Pressure:</strong> 18.2 bar (Stable)</div>
                <div><strong>Boil-off Vapor Rate:</strong> 0.04% / hr (Optimal)</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <button 
                onClick={() => alert('Logistics dispatcher hotline: +91 79 2658 9000')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>Contact Logistics Hotline</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};
