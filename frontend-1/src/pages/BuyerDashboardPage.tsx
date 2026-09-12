import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  Badge, 
  Button, 
  Card, 
  CardHeader, 
  StatTile,
  EmptyState,
  SkeletonCard
} from '../components/common/UIComponents';
import { mockBuyerRequirements, mockMatchResults } from '../mockData';
import { Sparkles, Plus, RotateCcw } from 'lucide-react';

export const BuyerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requirements' | 'bids' | 'matches'>('requirements');
  const [simLoading, setSimLoading] = useState(false);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);

  const greenFuel = mockBuyerRequirements[0];
  const bestMatch = mockMatchResults[0]; // ABC Cement

  const toggleLoadingDemo = () => {
    setSimLoading(true);
    setTimeout(() => setSimLoading(false), 900);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      
      <PageHeader
        badge="Off-taker Procurement Console • Gujarat Node"
        title="Buyer Utilization Hub"
        subtitle="Manage feedstock procurement tenders, verify gaseous/liquefied contaminant tolerances, and review off-take clearing status."
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={toggleLoadingDemo}
            >
              Simulate Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmptyDemo(!showEmptyDemo)}
            >
              {showEmptyDemo ? 'Show Real Data' : 'Preview Empty State'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Sparkles size={13} color="#2E9E8A" />}
              onClick={() => navigate('/matches')}
            >
              Compatible Streams (96%)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => navigate('/buyer/create-requirement')}
            >
              Post Feedstock Requirement
            </Button>
          </div>
        }
      />

      {/* Buyer Entity Profile Banner */}
      <Card style={{ padding: '20px 24px', marginBottom: 28, background: '#FFFFFF' }} accentColor="#2E9E8A">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1D1B', margin: 0 }}>
                GreenFuel SynTech Ltd
              </h2>
              <Badge variant="teal" dot pulse>Anchor Off-Taker</Badge>
              <Badge variant="neutral">CORSIA Compliant</Badge>
            </div>
            <div style={{ fontSize: 13, color: '#5A5C5A' }}>
              {greenFuel.facilityName} · {greenFuel.location} · Power-to-Liquid e-SAF Synthesis
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monthly Requirement</div>
              <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B', marginTop: 2 }}>300 tonnes / mo</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Intake Purity Floor</div>
              <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#2E9E8A', marginTop: 2 }}>&ge; 95.0% CO₂</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Macro Stats Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatTile
          label="Contracted Volume"
          value="300"
          unit="t/mo"
          delta="100% Secured"
        />
        <StatTile
          label="Target Budget"
          value="$45"
          unit="/ tonne max"
        />
        <StatTile
          label="Secured Supply Rate"
          value="$42"
          unit="/ tonne"
          delta="-$3/t savings"
        />
        <StatTile
          label="Active Corridor Matches"
          value="2"
          unit="viable emitters"
        />
      </div>

      {/* Tabs with Count Badges */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E5E5E2', marginBottom: 20 }}>
        {[
          { key: 'requirements', label: 'Active Sourcing Requirements', count: 1 },
          { key: 'bids', label: 'Outbound RFP Proposals', count: 1 },
          { key: 'matches', label: 'Algorithmic Emitter Matches', count: 2 },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0F3D2E' : '#5A5C5A',
                borderBottom: isActive ? '2px solid #0F3D2E' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                className="tabular-nums"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: isActive ? '#0F3D2E' : '#F1F1EF',
                  color: isActive ? '#FAFAF9' : '#8A8C8A',
                  padding: '1px 6px',
                  borderRadius: 9999
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton State */}
      {simLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : showEmptyDemo ? (
        <EmptyState
          title="No Requirements Registered"
          description="You do not have any active CO₂ sourcing requirements in the exchange registry."
          actionLabel="Post First Feedstock Tender"
          onAction={() => navigate('/buyer/create-requirement')}
        />
      ) : (
        <>
          {/* Tab 1: Requirements */}
          {activeTab === 'requirements' && (
            <Card>
              <CardHeader
                title="Active Procurement Tenders"
                subtitle="Monitored off-take criteria for chemical synthesis and biogenic conversion."
                action={
                  <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={() => navigate('/buyer/create-requirement')}>
                    New Requirement
                  </Button>
                }
              />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#FAFAF9', borderBottom: '1px solid #E5E5E2', color: '#8A8C8A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      <th style={{ padding: '12px 20px' }}>Tender ID</th>
                      <th style={{ padding: '12px 20px' }}>Destination Hub</th>
                      <th style={{ padding: '12px 20px' }}>Volume Needed</th>
                      <th style={{ padding: '12px 20px' }}>Purity Floor</th>
                      <th style={{ padding: '12px 20px' }}>Target Ceiling</th>
                      <th style={{ padding: '12px 20px' }}>Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                      <td className="tabular-nums" style={{ padding: '16px 20px', fontWeight: 700 }}>
                        {greenFuel.id}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#1A1D1B' }}>{greenFuel.facilityName}</div>
                        <div style={{ fontSize: 12, color: '#8A8C8A' }}>{greenFuel.location}</div>
                      </td>
                      <td className="tabular-nums" style={{ padding: '16px 20px' }}>
                        {greenFuel.volumeNeededTonnes} t/mo
                      </td>
                      <td className="tabular-nums" style={{ padding: '16px 20px', color: '#1A6158', fontWeight: 700 }}>
                        &ge; {greenFuel.minPurityPercentage.toFixed(1)}%
                      </td>
                      <td className="tabular-nums" style={{ padding: '16px 20px' }}>
                        ${greenFuel.targetPricePerTonneUSD} / t
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <Badge variant="teal" dot>Open Tender</Badge>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <Button size="sm" variant="outline" onClick={() => navigate('/matches')}>
                          View Matches (96%) →
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: Outbound Bids */}
          {activeTab === 'bids' && (
            <Card>
              <CardHeader
                title="Outbound Bilateral Proposals"
                subtitle="Commercial bids submitted to point-source capture emitters."
              />
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    border: '1px solid #E5E5E2',
                    borderRadius: 8,
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    background: '#FAFAF9'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B' }}>
                        Proposal to: ABC Cement Ltd (Ahmedabad Kiln-4)
                      </span>
                      <Badge variant="green">Accepted by Seller</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: '#5A5C5A' }}>
                      Offered Rate: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>$42 / tonne</strong> · Volume: <strong className="tabular-nums">300 tonnes/month</strong>
                    </div>
                    <div className="tabular-nums" style={{ fontSize: 12, color: '#8A8C8A', marginTop: 4 }}>
                      Contract Total: $151,200/yr · Modality: Cryogenic Road Tanker · Deal Ref: TXN-8801
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="primary" onClick={() => navigate('/transactions/TXN-8801')}>
                      Track Delivery & Custody
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/matches')}>
                      View Match Score
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 3: Algorithmic Matches */}
          {activeTab === 'matches' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Badge variant="teal" dot>Match 96%</Badge>
                  <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>MATCH-101</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B', marginBottom: 2 }}>
                  ABC Cement (Ahmedabad Kiln-4)
                </div>
                <div style={{ fontSize: 12, color: '#5A5C5A', marginBottom: 16 }}>
                  Precalciner Flue Capture · 112 km via NH-48
                </div>
                <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 6, padding: 12, fontSize: 12, marginBottom: 16 }}>
                  <div>Supply capacity: <strong className="tabular-nums">500 tonnes / mo</strong></div>
                  <div style={{ marginTop: 2 }}>Purity: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>96.0%</strong> (Req &ge; 95.0%)</div>
                  <div style={{ marginTop: 2 }}>Asking price: <strong className="tabular-nums">$42 / t</strong> (Budget: $45/t)</div>
                </div>
                <Button fullWidth size="sm" variant="primary" onClick={() => navigate('/listings/SUP-001/bid')}>
                  Submit Off-Take Proposal →
                </Button>
              </Card>

              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Badge variant="neutral">Match 88%</Badge>
                  <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>MATCH-104</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B', marginBottom: 2 }}>
                  Gujarat Bio-Refinery (Dahej)
                </div>
                <div style={{ fontSize: 12, color: '#5A5C5A', marginBottom: 16 }}>
                  Biogenic Fermentation · 135 km corridor
                </div>
                <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 6, padding: 12, fontSize: 12, marginBottom: 16 }}>
                  <div>Available: <strong className="tabular-nums">1,200 tonnes / mo</strong></div>
                  <div style={{ marginTop: 2 }}>Purity: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>99.2%</strong> (Ultra-Pure)</div>
                  <div style={{ marginTop: 2 }}>Asking price: <strong className="tabular-nums">$55 / t</strong></div>
                </div>
                <Button fullWidth size="sm" variant="outline" onClick={() => navigate('/listings/SUP-002')}>
                  Inspect Stream Specs →
                </Button>
              </Card>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default BuyerDashboardPage;
