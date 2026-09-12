import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
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
        <Link to="/supplier/create-listing">
          <Button variant="primary" icon={Plus} size="md">
            New Supply Listing
          </Button>
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
          
          <div className="flex border-b border-white/10 gap-2 sm:gap-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'listings'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Active Stream Listings</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'listings' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {abcListings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'bids'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Inbound Off-take Bids</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'bids' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {abcBids.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Algorithmic Matches</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'matches' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {abcMatches.length}
              </span>
            </button>
          </div>

          {/* TAB 1: LISTINGS */}
          {activeTab === 'listings' && (
            abcListings.length === 0 ? (
              <EmptyState
                icon={Factory}
                title="No active listings published"
                description="Create and publish your industrial point-source CO₂ capture telemetry to receive off-take tenders."
                action={
                  <Link to="/supplier/create-listing">
                    <Button variant="primary" icon={Plus} size="sm">
                      Create Supply Listing
                    </Button>
                  </Link>
                }
              />
            ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Listing & Facility</th>
                      <th className="px-6 py-4">Purity Grade</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">State & Pressure</th>
                      <th className="px-6 py-4">Floor Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {abcListings.map((listing) => (
                      <tr key={listing.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{listing.facilityName}</div>
                          <div className="text-xs text-slate-400">{listing.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-emerald-400 font-bold tabular-nums">{listing.composition.co2Purity}%</div>
                          <div className="text-[11px] text-slate-400 tabular-nums">H₂O: {listing.composition.moisturePpm} ppm</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white tabular-nums">{listing.volumeTonnes.toLocaleString()} tonnes</div>
                          <div className="text-xs text-slate-400">{listing.volumeFrequency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-300 font-medium">{listing.physicalState}</span>
                          <div className="text-[11px] text-slate-400 tabular-nums">{listing.pressureBar} bar</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-300 tabular-nums">
                          ${listing.pricePerTonneUSD} / t
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="emerald" withDot={true}>Active Stream</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/listings/${listing.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
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
              <EmptyState
                icon={FileText}
                title="No procurement bids received"
                description="When buyers formulate bilateral off-take RFPs for your streams, proposals will appear here for review."
              />
            ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Buyer Organization</th>
                      <th className="px-6 py-4">Requested Volume</th>
                      <th className="px-6 py-4">Offered Price</th>
                      <th className="px-6 py-4">Monthly Value</th>
                      <th className="px-6 py-4">Transit Modality</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {abcBids.map((bid) => (
                      <tr key={bid.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-cyan-400" />
                            {bid.senderName}
                          </div>
                          <div className="text-xs text-slate-400">{bid.buyerFacility}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white tabular-nums">
                          {bid.requestedVolumeTonnes} t/mo
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400 font-semibold tabular-nums">
                          ${bid.offeredPriceUSD}/t
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white tabular-nums">
                          ${bid.totalOfferValueUSD.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300">
                          {bid.deliveryModality}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="emerald" withDot={true}>Accepted Term Sheet</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/transactions/TXN-8801"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            <span>Live Transit</span>
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
              <EmptyState
                icon={Zap}
                title="No active algorithmic matches"
                description="Matches are computed automatically as industrial off-takers publish technical feedstock requirements."
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {abcMatches.map((match) => (
                <div key={match.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target Off-taker Sink</span>
                      <h4 className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-4 w-4 text-cyan-400" />
                        {match.buyer.buyerName}
                      </h4>
                      <p className="text-xs text-slate-400">{match.buyer.facilityName} ({match.breakdown.distanceKm} km away)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{match.breakdown.overallScore}%</div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Match Score</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <ProgressBar label="Purity Alignment (40%)" value={match.breakdown.purityScore} color="emerald" height="sm" />
                    <ProgressBar label="Logistics Proximity (30%)" value={match.breakdown.distanceScore} color="teal" height="sm" />
                    <ProgressBar label="Volume Fit (30%)" value={match.breakdown.volumeScore} color="cyan" height="sm" />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <span className="text-slate-400 tabular-nums">Demand: {match.buyer.volumeNeededTonnes} tonnes/mo</span>
                    <Link
                      to={`/matches/${match.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
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
