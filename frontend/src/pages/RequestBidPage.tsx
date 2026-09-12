import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { mockSupplyListings } from '../data/mockData';
import { 
  Factory, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Calculator
} from 'lucide-react';

export const RequestBidPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const listing = mockSupplyListings.find(l => l.id === id) || mockSupplyListings[0];

  const [isLoading, setIsLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('GreenFuel SynTech Ltd');
  const [buyerFacility, setBuyerFacility] = useState('Vadodara Power-to-X Synthesis Hub');
  const [offeredPrice, setOfferedPrice] = useState(42);
  const [requestedVolume, setRequestedVolume] = useState(300);
  const [modality, setModality] = useState('Cryogenic Tanker Truck');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [durationMonths, setDurationMonths] = useState(12);
  const [specialTerms, setSpecialTerms] = useState(
    'Quarterly purity audit certificates compliant with ASTM D7862 standards. Bi-weekly cryogenic tanker deliveries to Vadodara tank farm.'
  );

  const totalMonthlyValue = offeredPrice * requestedVolume;
  const annualValue = totalMonthlyValue * (durationMonths || 12);
  const netAvoidedEmissions = requestedVolume - (requestedVolume * 0.0047); // ~99.5% net carbon efficiency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate directly to transaction status page!
      navigate('/transactions/TXN-8801');
    }, 800);
  };

  return (
    <PageContainer
      title="Submit Commercial Off-take Bid"
      subtitle={`Formulate formal bilateral procurement proposal for ${listing.companyName} (${listing.facilityName}).`}
      badge="Bilateral RFP Contracting"
      action={
        <Link
          to={`/listings/${listing.id}`}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Specs</span>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 cols: Interactive Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pairing summary header */}
          <div className="glass-panel rounded-2xl p-4 border-emerald-500/20 bg-slate-900/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Target Supplier Stream</span>
                <h4 className="text-sm font-bold text-white">{listing.companyName} ({listing.composition.co2Purity}% CO₂)</h4>
                <p className="text-xs text-slate-400">{listing.facilityName} • {listing.location}</p>
              </div>
            </div>
            <Badge variant="emerald">Listing Floor: ${listing.pricePerTonneUSD}/t</Badge>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-white/10">
            
            {/* Buyer Organization Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
                1. Buyer Entity & Intake Destination
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Buyer Organization</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Destination Facility</label>
                  <input
                    type="text"
                    required
                    value={buyerFacility}
                    onChange={(e) => setBuyerFacility(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Commercial Terms */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">
                2. Volume & Offered Commercial Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Offered Unit Price ($ / Tonne)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Requested Volume (Tonnes / Month)
                  </label>
                  <input
                    type="number"
                    required
                    value={requestedVolume}
                    onChange={(e) => setRequestedVolume(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Preferred Modality</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Cryogenic Tanker Truck">Cryogenic Tanker Truck (Road)</option>
                    <option value="Dedicated Pipeline">Dedicated Pipeline</option>
                    <option value="Rail Feeder Tanker">Rail Feeder Tanker</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Contract Duration</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={6}>6 Months Pilot</option>
                    <option value={12}>12 Months Annual Offtake</option>
                    <option value={24}>24 Months Long-Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Proposed Commencement Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Quality & Audit Provisions</label>
                <textarea
                  rows={3}
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-slate-950 shadow-glow-emerald hover:bg-emerald-450 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Executing Smart Term Sheet...</span>
                ) : (
                  <>
                    <span>Submit Binding Commercial Bid</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right 5 cols: Financial & Carbon Ledger Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            
            {/* Real-time financial calculator */}
            <div className="glass-panel rounded-2xl p-6 border-emerald-500/30 bg-slate-900/90 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>Commercial Ledger Simulation</span>
              </div>

              <div className="space-y-3 pt-2 text-xs border-b border-white/10 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Offered Unit Rate:</span>
                  <span className="font-mono text-white">${offeredPrice}.00 / tonne</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Volume:</span>
                  <span className="font-bold text-white">{requestedVolume} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Run-Rate:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${totalMonthlyValue.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract Total ({durationMonths} mo):</span>
                  <span className="font-mono font-bold text-white text-base">
                    ${annualValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Carbon Accounting Breakdown */}
              <div className="space-y-2 pt-2 text-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                  Net Climate Impact Index
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross CO₂ Sequestered:</span>
                  <strong className="text-white">{requestedVolume} tonnes / mo</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Logistics Transit Emissions:</span>
                  <span className="text-rose-400 font-mono">-1.42 tonnes</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-300 font-semibold">Net Avoided Footprint:</span>
                  <strong className="text-emerald-400 font-mono text-sm">
                    {netAvoidedEmissions.toFixed(2)} tCO₂e / mo
                  </strong>
                </div>
              </div>

              <div className="pt-2">
                <div className="rounded-xl bg-black/40 p-3 text-[11px] text-slate-400 flex items-center gap-2 border border-white/5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automatically registers ISO-14064 credit lineage upon supplier acceptance.</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </PageContainer>
  );
};
