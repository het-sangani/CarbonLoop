import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  StatTile,
  EmptyState
} from '../components/common/UIComponents';
import { mockSupplyListings, mockBuyerRequirements, SupplyListing, BuyerRequirement } from '../mockData';
import {
  Search,
  Droplets,
  Gauge,
  Sparkles,
  Building2,
  Factory,
  MapPin,
  Filter,
  Plus,
  RotateCcw
} from 'lucide-react';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'supply' | 'demand'>('supply');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurity, setSelectedPurity] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('all');

  // Filter supply listings
  const filteredSupplies = useMemo(() => {
    return mockSupplyListings.filter((item: SupplyListing) => {
      const matchesSearch =
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facilityType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPurity = item.composition.co2Purity >= selectedPurity;
      const matchesState = selectedState === 'all' || item.physicalState === selectedState;
      const matchesDelivery = selectedDelivery === 'all' || item.deliveryTerms.toLowerCase().includes(selectedDelivery.toLowerCase());

      return matchesSearch && matchesPurity && matchesState && matchesDelivery;
    });
  }, [searchQuery, selectedPurity, selectedState, selectedDelivery]);

  // Filter buyer demands
  const filteredBuyers = useMemo(() => {
    return mockBuyerRequirements.filter((item: BuyerRequirement) => {
      const matchesSearch =
        item.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPurity = item.minPurityPercentage >= selectedPurity;
      const matchesState = selectedState === 'all' || item.acceptableStates.includes(selectedState as any);

      return matchesSearch && matchesPurity && matchesState;
    });
  }, [searchQuery, selectedPurity, selectedState]);

  const totalMonthlySupply = mockSupplyListings.reduce((sum, s) => sum + s.volumeTonnes, 0);
  const totalMonthlyDemand = mockBuyerRequirements.reduce((sum, b) => sum + b.volumeNeededTonnes, 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <PageHeader
        badge="CarbonLoop Industrial Feedstock Exchange"
        title="Industrial CO₂ Marketplace"
        subtitle="Real-time regional spot & off-take clearinghouse for verified carbon dioxide capture streams and utilization off-takers across Western India."
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate('/buyer/create-requirement')}
            >
              Post Requirement
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate('/supplier/create-listing')}
            >
              List Supply Stream
            </Button>
          </div>
        }
      />

      {/* Top Stat Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        <StatTile
          label="Active Monthly Supply"
          value={totalMonthlySupply.toLocaleString()}
          unit="tonnes/mo"
          delta="+18%"
        />
        <StatTile
          label="Registered Buyer Demand"
          value={totalMonthlyDemand.toLocaleString()}
          unit="tonnes/mo"
          delta="+24%"
        />
        <StatTile
          label="Weighted Avg Spot Price"
          value="$44.50"
          unit="/ tonne CO₂"
          delta="-4%"
        />
        <StatTile
          label="Active Gujarat Hub Nodes"
          value="8"
          unit="industrial clusters"
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E5E2',
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16
          }}
        >
          {/* Dual View Tabs */}
          <div
            style={{
              display: 'inline-flex',
              background: '#F1F1EF',
              padding: 4,
              borderRadius: 6,
              gap: 4
            }}
          >
            <button
              onClick={() => setActiveTab('supply')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 5,
                border: 'none',
                background: activeTab === 'supply' ? '#0F3D2E' : 'transparent',
                color: activeTab === 'supply' ? '#FAFAF9' : '#5A5C5A',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: "'IBM Plex Sans', sans-serif"
              }}
            >
              <Factory size={16} />
              Supply Streams ({mockSupplyListings.length})
            </button>
            <button
              onClick={() => setActiveTab('demand')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 5,
                border: 'none',
                background: activeTab === 'demand' ? '#0F3D2E' : 'transparent',
                color: activeTab === 'demand' ? '#FAFAF9' : '#5A5C5A',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: "'IBM Plex Sans', sans-serif"
              }}
            >
              <Building2 size={16} />
              Buyer Off-Take Demands ({mockBuyerRequirements.length})
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 420 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8A8C8A'
              }}
            />
            <input
              type="text"
              placeholder="Filter by company, city (e.g. Ahmedabad, Dahej), sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            paddingTop: 12,
            borderTop: '1px solid #F1F1EF',
            fontSize: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', fontWeight: 600 }}>
            <Filter size={14} />
            <LabelCaps style={{ fontSize: 10 }}>Purity Floor:</LabelCaps>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'All Grades', min: 0 },
              { label: '≥ 90% (Mineralization)', min: 90 },
              { label: '≥ 95% (Synthetic Fuel)', min: 95 },
              { label: '≥ 98% (High Chemical)', min: 98 },
            ].map((p) => (
              <button
                key={p.min}
                onClick={() => setSelectedPurity(p.min)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  border: selectedPurity === p.min ? '1px solid #2E9E8A' : '1px solid #E5E5E2',
                  background: selectedPurity === p.min ? 'rgba(46,158,138,0.12)' : '#FFFFFF',
                  color: selectedPurity === p.min ? '#2E9E8A' : '#5A5C5A',
                  cursor: 'pointer',
                  fontWeight: selectedPurity === p.min ? 700 : 400,
                  transition: 'all 120ms ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#8A8C8A', fontSize: 11 }}>Physical Phase:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 5,
                border: '1px solid #E5E5E2',
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: '#FAFAF9',
                color: '#1A1D1B'
              }}
            >
              <option value="all">All Phases</option>
              <option value="Liquefied">Liquefied (Cryo)</option>
              <option value="Gas">Pressurized Gas</option>
              <option value="Supercritical">Supercritical</option>
            </select>

            {(searchQuery || selectedPurity > 0 || selectedState !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPurity(0);
                  setSelectedState('all');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'supply' ? (
        /* SUPPLY LISTINGS GRID */
        filteredSupplies.length === 0 ? (
          <EmptyState
            title="No Supply Streams Found"
            description="No active capture listings match your selected purity floor or search filters."
            actionLabel="Reset Filter Criteria"
            onAction={() => {
              setSearchQuery('');
              setSelectedPurity(0);
              setSelectedState('all');
            }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {filteredSupplies.map((supply) => (
              <Card
                key={supply.id}
                accentColor={supply.id === 'SUP-001' ? '#2E9E8A' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ padding: '20px' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                          {supply.companyName}
                        </span>
                        {supply.id === 'SUP-001' && (
                          <Badge variant="teal" dot pulse>Verified Benchmark</Badge>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A8C8A', marginTop: 3 }}>
                        <MapPin size={13} />
                        <span>{supply.location}</span>
                        <span>•</span>
                        <span>{supply.facilityType}</span>
                      </div>
                    </div>

                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 11,
                        color: '#8A8C8A',
                        background: '#F1F1EF',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}
                    >
                      {supply.id}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: '#5A5C5A',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {supply.description}
                  </p>

                  {/* Key Metrics Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      background: '#FAFAF9',
                      padding: '12px',
                      borderRadius: 6,
                      border: '1px solid #E5E5E2',
                      marginBottom: 16
                    }}
                  >
                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>Available Vol</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#1A1D1B',
                          marginTop: 2
                        }}
                      >
                        {supply.volumeTonnes}
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#8A8C8A', marginLeft: 2 }}>t/mo</span>
                      </div>
                    </div>

                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>CO₂ Purity</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#2E9E8A',
                          marginTop: 2
                        }}
                      >
                        {supply.composition.co2Purity.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>Spot Asking</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#0F3D2E',
                          marginTop: 2
                        }}
                      >
                        ${supply.pricePerTonneUSD}
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#8A8C8A', marginLeft: 2 }}>/t</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Badge variant="neutral">
                      <Droplets size={12} /> {supply.physicalState} ({supply.pressureBar} bar)
                    </Badge>
                    <Badge variant="neutral">
                      <Gauge size={12} /> {supply.composition.moisturePpm} ppm H₂O
                    </Badge>
                    <Badge variant="neutral">
                      {supply.deliveryTerms}
                    </Badge>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    padding: '14px 20px',
                    background: '#FAFAF9',
                    borderTop: '1px solid #E5E5E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <button
                    onClick={() => navigate(`/matches?supplierId=${supply.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'none',
                      border: 'none',
                      color: '#2E9E8A',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <Sparkles size={14} />
                    Run AI Match
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/listings/${supply.id}`)}
                    >
                      Specifications
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/listings/${supply.id}/bid`)}
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* BUYER DEMAND GRID */
        filteredBuyers.length === 0 ? (
          <EmptyState
            title="No Buyer Demands Found"
            description="No active industrial buyer tenders match your selected filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedPurity(0);
              setSelectedState('all');
            }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {filteredBuyers.map((buyer) => (
              <Card
                key={buyer.id}
                accentColor={buyer.id === 'BUY-001' ? '#0F3D2E' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                          {buyer.buyerName}
                        </span>
                        {buyer.id === 'BUY-001' && (
                          <Badge variant="teal" dot pulse>Anchor Off-Taker</Badge>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A8C8A', marginTop: 3 }}>
                        <MapPin size={13} />
                        <span>{buyer.location}</span>
                        <span>•</span>
                        <span>{buyer.industry}</span>
                      </div>
                    </div>

                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 11,
                        color: '#8A8C8A',
                        background: '#F1F1EF',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}
                    >
                      {buyer.id}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: '#5A5C5A',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {buyer.description}
                  </p>

                  {/* Key Metrics Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      background: '#FAFAF9',
                      padding: '12px',
                      borderRadius: 6,
                      border: '1px solid #E5E5E2',
                      marginBottom: 16
                    }}
                  >
                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>Required Off-Take</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#1A1D1B',
                          marginTop: 2
                        }}
                      >
                        {buyer.volumeNeededTonnes}
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#8A8C8A', marginLeft: 2 }}>t/mo</span>
                      </div>
                    </div>

                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>Min Purity Floor</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#2E9E8A',
                          marginTop: 2
                        }}
                      >
                        &ge; {buyer.minPurityPercentage}%
                      </div>
                    </div>

                    <div>
                      <LabelCaps style={{ fontSize: 9 }}>Target Bid Price</LabelCaps>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#0F3D2E',
                          marginTop: 2
                        }}
                      >
                        ${buyer.targetPricePerTonneUSD}
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#8A8C8A', marginLeft: 2 }}>/t</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Badge variant="neutral">Max Range: {buyer.maxDistanceKm} km</Badge>
                    <Badge variant="neutral">Target Date: {buyer.requiredBy}</Badge>
                    {buyer.acceptableStates.map((st) => (
                      <Badge key={st} variant="neutral">{st}</Badge>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 20px',
                    background: '#FAFAF9',
                    borderTop: '1px solid #E5E5E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 12, color: '#8A8C8A' }}>
                    Contact: <strong style={{ color: '#1A1D1B' }}>{buyer.contactPerson}</strong>
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sparkles size={14} />}
                    onClick={() => navigate(`/matches?buyerId=${buyer.id}`)}
                  >
                    Find Compatible Supplies
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
