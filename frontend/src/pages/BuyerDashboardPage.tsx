import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { 
  mockBuyerRequirements, 
  mockBids, 
  mockMatchResults 
} from '../data/mockData';
import { 
  Building2, 
  Plus, 
  Zap, 
  TrendingDown, 
  ArrowUpRight, 
  Factory, 
  CheckCircle2, 
  FileCheck,
  ChevronRight
} from 'lucide-react';

export const BuyerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demands' | 'bids' | 'matches'>('demands');

  // GreenFuel requirements & bids
  const greenFuelDemands = mockBuyerRequirements.filter(b => b.buyerName === 'GreenFuel');
  const greenFuelBids = mockBids.filter(b => b.senderName.includes('GreenFuel'));
  const greenFuelMatches = mockMatchResults.filter(m => m.buyer.buyerName === 'GreenFuel');

  return (
    <PageContainer
      title="Buyer Utilization Console"
      subtitle="Source verified point-source CO₂ feedstocks, submit RFPs, and monitor circular supply contracts."
      badge="Commercial Off-taker Hub"
      action={
        <Link to="/buyer/create-requirement">
          <Button variant="primary" icon={Plus} size="md">
            New Feedstock Requirement
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        
        {/* Buyer profile banner */}
        <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">GreenFuel SynTech Ltd</h2>
                  <Badge variant="cyan">Synthetic Fuels (e-SAF)</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Vadodara Power-to-X Synthesis Hub • Gujarat, India • Power-to-Liquids
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/matches"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-xl px-3 py-2 bg-cyan-500/10"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>View Engine Recommendations (96% Fit)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Feedstock Demand"
            value="300 t/mo"
            subtext="Baseline requirement for e-SAF line"
            icon={Building2}
            color="cyan"
          />
          <StatCard
            label="Min Purity Req."
            value="95.0%"
            subtext="Accepts gas and liquefied feeds"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            label="Active Sourcing Bids"
            value={greenFuelBids.length}
            subtext="1 Contract Accepted (ABC Cement)"
            icon={FileCheck}
            color="teal"
          />
          <StatCard
            label="Procurement Cost"
            value="$42 / t"
            change="-$3/t vs budget"
            isPositive={true}
            subtext="Within $45 ceiling tolerance"
            icon={TrendingDown}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-white/10 gap-2 sm:gap-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('demands')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'demands'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Active Feedstock Demands</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'demands' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {greenFuelDemands.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'bids'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Outbound Sourcing Bids</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'bids' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {greenFuelBids.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Algorithmic Matches</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                activeTab === 'matches' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {greenFuelMatches.length}
              </span>
            </button>
          </div>

          {/* TAB 1: DEMANDS */}
          {activeTab === 'demands' && (
            greenFuelDemands.length === 0 ? (
              <EmptyState
                icon={Building2}
                variant="cyan"
                title="No active feedstock demands"
                description="Post chemical or industrial CO₂ utilization specifications to trigger automated emitter matchmaking."
                action={
                  <Link to="/buyer/create-requirement">
                    <Button variant="primary" icon={Plus} size="sm">
                      Post Feedstock Requirement
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
                      <th className="px-6 py-4">Requirement & Hub</th>
                      <th className="px-6 py-4">Min Purity</th>
                      <th className="px-6 py-4">Required Volume</th>
                      <th className="px-6 py-4">Max Radius</th>
                      <th className="px-6 py-4">Ceiling Budget</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {greenFuelDemands.map((demand) => (
                      <tr key={demand.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{demand.facilityName}</div>
                          <div className="text-xs text-slate-400">{demand.location} • {demand.industry}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-cyan-400 font-bold tabular-nums">&gt; {demand.minPurityPercentage}%</div>
                          <div className="text-[11px] text-slate-400 tabular-nums">Moisture: &lt; {demand.maxMoisturePpm} ppm</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white tabular-nums">
                          {demand.volumeNeededTonnes} tonnes/mo
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300 tabular-nums">
                          &lt; {demand.maxDistanceKm} km
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-cyan-300 tabular-nums">
                          ${demand.targetPricePerTonneUSD} / t
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="cyan" withDot={true}>Active Sourcing</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/matches"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <span>Find Feeds</span>
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
            greenFuelBids.length === 0 ? (
              <EmptyState
                icon={FileCheck}
                variant="cyan"
                title="No active procurement proposals"
                description="Explore verified point-source carbon feeds in the marketplace to formulate off-take contracts."
                action={
                  <Link to="/marketplace">
                    <Button variant="primary" size="sm">
                      Explore Marketplace
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
                      <th className="px-6 py-4">Target Supplier</th>
                      <th className="px-6 py-4">Committed Volume</th>
                      <th className="px-6 py-4">Agreed Price</th>
                      <th className="px-6 py-4">Monthly Value</th>
                      <th className="px-6 py-4">Logistics Modality</th>
                      <th className="px-6 py-4">Contract Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {greenFuelBids.map((bid) => (
                      <tr key={bid.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Factory className="h-4 w-4 text-emerald-400" />
                            ABC Cement
                          </div>
                          <div className="text-xs text-slate-400">{bid.sellerFacility}</div>
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
                          <Badge variant="emerald" withDot={true}>Accepted Contract</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/transactions/TXN-8801"
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
                          >
                            <span>Live Tracking</span>
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
            greenFuelMatches.length === 0 ? (
              <EmptyState
                icon={Zap}
                variant="cyan"
                title="No compatible emitters found"
                description="Adjust your maximum transit radius or minimum purity threshold to broaden algorithmic discovery."
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {greenFuelMatches.map((match) => (
                <div key={match.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recommended Emitter Source</span>
                      <h4 className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <Factory className="h-4 w-4 text-emerald-400" />
                        {match.supplier.companyName}
                      </h4>
                      <p className="text-xs text-slate-400">{match.supplier.facilityName} ({match.breakdown.distanceKm} km away)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{match.breakdown.overallScore}%</div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Match Score</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <ProgressBar label="Purity Alignment" value={match.breakdown.purityScore} color="emerald" height="sm" />
                    <ProgressBar label="Transit Feasibility" value={match.breakdown.distanceScore} color="teal" height="sm" />
                    <ProgressBar label="Capacity Fulfillment" value={match.breakdown.volumeScore} color="cyan" height="sm" />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <span className="text-slate-400 tabular-nums">Capacity: {match.supplier.volumeTonnes} tonnes/mo @ {match.supplier.composition.co2Purity}% CO₂</span>
                    <Link
                      to={`/matches/${match.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Review Details & Bid</span>
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
