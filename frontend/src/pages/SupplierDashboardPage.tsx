import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  mockSupplyListings, 
  mockBids, 
  mockMatchResults 
} from '../data/mockData';
import { 
  Factory, 
  Plus, 
  Zap, 
  DollarSign, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  FileText,
  ChevronRight
} from 'lucide-react';

export const SupplierDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'bids' | 'matches'>('listings');

  // ABC Cement listings
  const abcListings = mockSupplyListings.filter(l => l.companyName === 'ABC Cement');
  const abcBids = mockBids.filter(b => b.sellerFacility.includes('Ahmedabad'));
  const abcMatches = mockMatchResults.filter(m => m.supplier.companyName === 'ABC Cement');

  return (
    <PageContainer
      title="Supplier Decarbonization Hub"
      subtitle="Manage industrial CO₂ capture streams, review off-take bids, and inspect weighted compatibility matches."
      badge="Enterprise Emitter Console"
      action={
        <Link
          to="/supplier/create-listing"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-glow-emerald hover:bg-emerald-450 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Supply Listing</span>
        </Link>
      }
    >
      <div className="space-y-8">
        
        {/* Company profile banner */}
        <div className="glass-panel rounded-2xl p-6 border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-slate-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">ABC Cement Ltd</h2>
                  <Badge variant="emerald">Verified Point-Source</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Ahmedabad Kiln-4 Capture Facility • Gujarat, India • Post-Combustion Amine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/matches"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl px-3 py-2 bg-emerald-500/10"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>View Engine Matches (96% Peak)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Output"
            value="500 t/mo"
            subtext="Baseline liquefied continuous supply"
            icon={Factory}
            color="emerald"
          />
          <StatCard
            label="Avg Output Purity"
            value="96.0%"
            change="+1.0% vs spec"
            isPositive={true}
            subtext="Dehydrated & cryo-compressed"
            icon={CheckCircle2}
            color="cyan"
          />
          <StatCard
            label="Inbound Bids"
            value={abcBids.length}
            subtext="1 Accepted, 1 Under review"
            icon={FileText}
            color="teal"
          />
          <StatCard
            label="Offtake Run-Rate"
            value="$21,000"
            subtext="Monthly contracted value @ $42/t"
            icon={DollarSign}
            color="amber"
          />
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="space-y-4">
          
          <div className="flex border-b border-white/10 gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'listings'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Stream Listings ({abcListings.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'bids'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inbound Procurement Bids ({abcBids.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'matches'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Algorithmic Off-taker Matches ({abcMatches.length})
            </button>
          </div>

          {/* TAB 1: LISTINGS */}
          {activeTab === 'listings' && (
            abcListings.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
                <Factory className="h-8 w-8 text-slate-500 mx-auto" />
                <h4 className="text-base font-semibold text-white">No active listings yet</h4>
                <p className="text-xs text-slate-400">Create your first point-source CO₂ capture listing to begin receiving off-take proposals.</p>
                <Link to="/supplier/create-listing" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950">
                  + Create Supply Listing
                </Link>
              </div>
            ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Listing & Facility</th>
                      <th className="px-6 py-4">Purity</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">State & Pressure</th>
                      <th className="px-6 py-4">Floor Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {abcListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{listing.facilityName}</div>
                          <div className="text-xs text-slate-400">{listing.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-emerald-400 font-bold">{listing.composition.co2Purity}%</div>
                          <div className="text-[11px] text-slate-400">H₂O: {listing.composition.moisturePpm} ppm</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{listing.volumeTonnes} tonnes</div>
                          <div className="text-xs text-slate-400">{listing.volumeFrequency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-300">{listing.physicalState}</span>
                          <div className="text-[11px] text-slate-400">{listing.pressureBar} bar</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-300">
                          ${listing.pricePerTonneUSD} / t
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="emerald">Active</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/listings/${listing.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                          >
                            <span>Inspect Specs</span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )
          )}

          {/* TAB 2: BIDS */}
          {activeTab === 'bids' && (
            abcBids.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
                <FileText className="h-8 w-8 text-slate-500 mx-auto" />
                <h4 className="text-base font-semibold text-white">No bids received yet</h4>
                <p className="text-xs text-slate-400">Inbound off-take bids from buyers will appear here when submitted.</p>
              </div>
            ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Buyer Organization</th>
                      <th className="px-6 py-4">Requested Volume</th>
                      <th className="px-6 py-4">Offered Price</th>
                      <th className="px-6 py-4">Total Value</th>
                      <th className="px-6 py-4">Transit Modality</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {abcBids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-cyan-400" />
                            {bid.senderName}
                          </div>
                          <div className="text-xs text-slate-400">{bid.buyerFacility}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {bid.requestedVolumeTonnes} t/mo
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                          ${bid.offeredPriceUSD}/t
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          ${bid.totalOfferValueUSD.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300">
                          {bid.deliveryModality}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="emerald">Accepted</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/transactions/TXN-8801"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <span>View Live Transit</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )
          )}

          {/* TAB 3: MATCHES */}
          {activeTab === 'matches' && (
            abcMatches.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
                <Zap className="h-8 w-8 text-slate-500 mx-auto" />
                <h4 className="text-base font-semibold text-white">No active matches</h4>
                <p className="text-xs text-slate-400">Algorithmic off-taker matches will be computed as new buyer requirements enter the exchange.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {abcMatches.map((match) => (
                <div key={match.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400">Target Sink</span>
                      <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-cyan-400" />
                        {match.buyer.buyerName}
                      </h4>
                      <p className="text-xs text-slate-400">{match.buyer.facilityName} ({match.breakdown.distanceKm} km away)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-emerald-400">{match.breakdown.overallScore}%</div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Match Score</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <ProgressBar label="Purity Alignment (40%)" value={match.breakdown.purityScore} color="emerald" height="sm" />
                    <ProgressBar label="Logistics Proximity (30%)" value={match.breakdown.distanceScore} color="teal" height="sm" />
                    <ProgressBar label="Volume Fit (30%)" value={match.breakdown.volumeScore} color="cyan" height="sm" />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-xs text-slate-400">Demand: {match.buyer.volumeNeededTonnes} tonnes/mo</span>
                    <Link
                      to={`/matches/${match.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      <span>Full Match Report</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            )
          )}

        </div>

      </div>
    </PageContainer>
  );
};
