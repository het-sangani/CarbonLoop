import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { mockSupplyListings, mockBuyerRequirements } from '../data/mockData';
import { 
  Search, 
  Filter, 
  Factory, 
  Building2, 
  MapPin, 
  ArrowUpRight, 
  RotateCcw,
  X,
  Plus
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [viewType, setViewType] = useState<'all' | 'suppliers' | 'buyers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPurity, setMinPurity] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('all');

  // Filter Supply Listings
  const filteredSupplies = useMemo(() => {
    return mockSupplyListings.filter((item) => {
      const matchesSearch = 
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPurity = item.composition.co2Purity >= minPurity;
      const matchesState = selectedState === 'all' || item.physicalState === selectedState;
      return matchesSearch && matchesPurity && matchesState;
    });
  }, [searchQuery, minPurity, selectedState]);

  // Filter Buyer Requirements
  const filteredBuyers = useMemo(() => {
    return mockBuyerRequirements.filter((item) => {
      const matchesSearch = 
        item.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPurity = item.minPurityPercentage >= minPurity;
      const matchesState = selectedState === 'all' || item.acceptableStates.includes(selectedState as any);
      return matchesSearch && matchesPurity && matchesState;
    });
  }, [searchQuery, minPurity, selectedState]);

  const totalResults = 
    (viewType === 'all' || viewType === 'suppliers' ? filteredSupplies.length : 0) +
    (viewType === 'all' || viewType === 'buyers' ? filteredBuyers.length : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setMinPurity(0);
    setSelectedState('all');
    setViewType('all');
  };

  const hasActiveFilters = searchQuery !== '' || minPurity > 0 || selectedState !== 'all';

  return (
    <PageContainer
      title="Industrial CO₂ Marketplace"
      subtitle="Discover verified point-source carbon capture feeds and off-taker procurement requests across the industrial corridor."
      badge="Active Marketplace"
      action={
        <div className="flex items-center gap-2">
          <Link to="/supplier/create-listing">
            <Button variant="primary" icon={Plus} size="sm">
              List Stream
            </Button>
          </Link>
          <Link to="/buyer/create-requirement">
            <Button variant="secondary" icon={Plus} size="sm">
              Post Demand
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Controls and Search Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
          
          {/* Top Row: Search & View Toggle */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city (Ahmedabad, Vadodara...), facility, or entity..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Selector Buttons */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/10 w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setViewType('all')}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  viewType === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Feeds ({filteredSupplies.length + filteredBuyers.length})
              </button>
              <button
                onClick={() => setViewType('suppliers')}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  viewType === 'suppliers'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Supply Streams ({filteredSupplies.length})
              </button>
              <button
                onClick={() => setViewType('buyers')}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  viewType === 'buyers'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buyer Demands ({filteredBuyers.length})
              </button>
            </div>

          </div>

          {/* Bottom Row: Filter Badges & Selects */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                Filter by:
              </span>

              {/* Purity selector */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1">
                <span className="text-slate-400">Min Purity:</span>
                <select 
                  value={minPurity}
                  onChange={(e) => setMinPurity(Number(e.target.value))}
                  className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={0} className="bg-slate-900 text-white">Any (&gt;85%)</option>
                  <option value={90} className="bg-slate-900 text-white">&gt; 90% (Concrete standard)</option>
                  <option value={95} className="bg-slate-900 text-white">&gt; 95% (Synthetic fuels)</option>
                  <option value={98} className="bg-slate-900 text-white">&gt; 98% (High purity)</option>
                </select>
              </div>

              {/* Physical State selector */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1">
                <span className="text-slate-400">Physical State:</span>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent text-cyan-400 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">All States</option>
                  <option value="Liquefied" className="bg-slate-900 text-white">Liquefied Cryogenic</option>
                  <option value="Gas" className="bg-slate-900 text-white">Gaseous Stream</option>
                  <option value="Supercritical" className="bg-slate-900 text-white">Supercritical CO₂</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400 text-[11px]">Active:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                  <span>Query: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
              {minPurity > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                  <span>Purity: &gt;{minPurity}%</span>
                  <button onClick={() => setMinPurity(0)} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedState !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                  <span>State: {selectedState}</span>
                  <button onClick={() => setSelectedState('all')} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

        </div>

        {/* Empty State */}
        {totalResults === 0 && (
          <EmptyState
            icon={Search}
            title="No streams match current filter criteria"
            description="Try loosening your minimum purity threshold, selecting 'All States', or clearing your location search term."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            }
          />
        )}

        {/* Supply Stream Cards */}
        {(viewType === 'all' || viewType === 'suppliers') && filteredSupplies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Carbon Capture Point Sources ({filteredSupplies.length})
              </h3>
              <span className="text-xs text-slate-400">Continuous & Batch Industrial Streams</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredSupplies.map((stream) => (
                <div key={stream.id} className="glass-panel glass-panel-hover rounded-2xl p-6 relative flex flex-col justify-between space-y-4 border-white/10">
                  
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">{stream.companyName}</h4>
                          <Badge variant="emerald">
                            {stream.verificationLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{stream.facilityName}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                          ${stream.pricePerTonneUSD}
                        </span>
                        <span className="text-[11px] text-slate-400 block">/ tonne</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {stream.description}
                    </p>
                  </div>

                  {/* Gas & Physical Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-black/40 rounded-xl p-3 border border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">CO₂ Purity</span>
                      <strong className="text-emerald-400 font-mono text-sm tabular-nums">{stream.composition.co2Purity}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Monthly Vol</span>
                      <strong className="text-white text-sm tabular-nums">{stream.volumeTonnes.toLocaleString()} t</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">State / Bar</span>
                      <strong className="text-slate-200 text-xs tabular-nums">{stream.physicalState} ({stream.pressureBar}b)</strong>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{stream.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/listings/${stream.id}`}
                        className="rounded-lg border border-white/10 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 font-medium text-slate-200 transition-colors"
                      >
                        Specs
                      </Link>
                      <Link
                        to={`/listings/${stream.id}/bid`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-450 px-3.5 py-1.5 font-semibold text-slate-950 transition-all shadow-glow-emerald"
                      >
                        <span>Make Bid</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Requirement Cards */}
        {(viewType === 'all' || viewType === 'buyers') && filteredBuyers.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Active Off-taker Demand Profiles ({filteredBuyers.length})
              </h3>
              <span className="text-xs text-slate-400">Procurement & Utilization Tenders</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredBuyers.map((demand) => (
                <div key={demand.id} className="glass-panel glass-panel-hover rounded-2xl p-6 relative flex flex-col justify-between space-y-4 border-white/10">
                  
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">{demand.buyerName}</h4>
                          <Badge variant="cyan">
                            {demand.industry}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{demand.facilityName}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                          ${demand.targetPricePerTonneUSD}
                        </span>
                        <span className="text-[11px] text-slate-400 block">target ceiling</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {demand.description}
                    </p>
                  </div>

                  {/* Requirements Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-black/40 rounded-xl p-3 border border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Min Purity</span>
                      <strong className="text-cyan-400 font-mono text-sm tabular-nums">&gt; {demand.minPurityPercentage}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Demand Vol</span>
                      <strong className="text-white text-sm tabular-nums">{demand.volumeNeededTonnes.toLocaleString()} t</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Max Radius</span>
                      <strong className="text-slate-200 text-xs tabular-nums">&lt; {demand.maxDistanceKm} km</strong>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{demand.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/matches"
                        className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 px-3.5 py-1.5 font-semibold text-cyan-400 transition-all"
                      >
                        <span>Find Emitter Match</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
