import React, { useState, useEffect } from 'react';
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
import { mockSupplyListings, mockMatchResults } from '../mockData';
import { Sparkles, Eye, Plus, CheckCircle2, RotateCcw, Check, X, AlertCircle } from 'lucide-react';
import { carbonLoopApi } from '../services/api';

export const SupplierDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'listings' | 'bids' | 'matches'>('listings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Real API state
  const [realListings, setRealListings] = useState<any[]>([]);
  const [realRequests, setRealRequests] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingsRes, requestsRes] = await Promise.allSettled([
        carbonLoopApi.getListings(),
        carbonLoopApi.getRequests()
      ]);

      if (listingsRes.status === 'fulfilled') {
        setRealListings(listingsRes.value || []);
      }
      if (requestsRes.status === 'fulfilled') {
        setRealRequests(requestsRes.value || []);
      }
    } catch (err: any) {
      console.error('Failed to load supplier data', err);
      setError(err.message || 'Error connecting to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(requestId);
    setError(null);
    setActionSuccess(null);
    try {
      await carbonLoopApi.updateRequestStatus(requestId, newStatus);
      setActionSuccess(`Request ${requestId.slice(0, 8)}... successfully marked as ${newStatus}!`);
      // Update local state immediately
      setRealRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      console.error('Failed to update request', err);
      setError(`Failed to update request: ${err.message || 'API error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const abcListing = realListings.length > 0 
    ? {
        facilityName: realListings[0].location ? `${realListings[0].location} Facility` : 'ABC Cement Ltd',
        location: realListings[0].location,
        purity: realListings[0].purity,
        quantity: realListings[0].quantity,
        price: realListings[0].asking_price
      }
    : mockSupplyListings[0];


  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      
      <PageHeader
        badge="Enterprise Emitter Console • Gujarat Node"
        title="Supplier Decarbonization Hub"
        subtitle="Manage point-source carbon capture streams, monitor continuous flow assay telemetry, and review inbound off-take bids."
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
              View Matches (96% Fit)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => navigate('/supplier/create-listing')}
            >
              Create Supply Listing
            </Button>
          </div>
        }
      />

      {/* Status Alerts */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchDashboardData}>Retry</Button>
        </div>
      )}

      {actionSuccess && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#166534" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{actionSuccess}</span>
        </div>
      )}

      {/* Facility Profile Overview Banner */}
      <Card style={{ padding: '20px 24px', marginBottom: 28, background: '#FFFFFF' }} accentColor="#0F3D2E">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1D1B', margin: 0 }}>
                {realListings.length > 0 ? (realListings[0].location ? `${realListings[0].location} Capture Terminal` : 'ABC Cement Ltd') : 'ABC Cement Ltd'}
              </h2>
              <Badge variant="green" dot pulse>Verified Point-Source</Badge>
              <Badge variant="neutral">ISO 14064 Compliant</Badge>
            </div>
            <div style={{ fontSize: 13, color: '#5A5C5A' }}>
              {realListings.length > 0 ? `${realListings[0].location} · Post-Combustion Point-Source Capture` : `${abcListing.facilityName} · ${abcListing.location} · Post-Combustion Precalciner Amine`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Baseline Capacity</div>
              <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B', marginTop: 2 }}>
                {realListings.length > 0 ? `${realListings[0].quantity} tonnes / mo` : '500 tonnes / mo'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivery Condition</div>
              <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#0F3D2E', marginTop: 2 }}>Liquefied (18.5 bar)</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Macro Stats Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatTile
          label="Active Monthly Output"
          value={realListings.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || '500'}
          unit="t/mo"
          delta={realListings.length > 0 ? `${realListings.length} stream(s)` : '+50t'}
        />
        <StatTile
          label="Assayed CO₂ Purity"
          value={realListings.length > 0 ? `${realListings[0].purity}%` : '96.0%'}
          unit=""
          delta="Assay Verified"
        />
        <StatTile
          label="Inbound Bilateral Bids"
          value={realRequests.length || '1'}
          unit={realRequests.length === 1 ? 'active tender' : 'active tenders'}
        />
        <StatTile
          label="Monthly Off-Take Value"
          value={`$${((realListings.length > 0 ? realListings[0].quantity * realListings[0].asking_price : 21000)).toLocaleString()}`}
          unit={realListings.length > 0 ? `@ $${realListings[0].asking_price}/t` : '@ $42/t'}
        />
      </div>

      {/* Interactive Tabs with Count Badges */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E5E5E2', marginBottom: 20 }}>
        {[
          { key: 'listings', label: 'Active Stream Listings', count: realListings.length || 1 },
          { key: 'bids', label: 'Inbound Procurement Bids', count: realRequests.length || 1 },
          { key: 'matches', label: 'Algorithmic Off-taker Matches', count: 2 },
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
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : (
        <>
          {/* Tab 1: Listings */}
          {activeTab === 'listings' && (
            <Card>
              <CardHeader
                title="Registered Point-Source Carbon Streams"
                subtitle="Continuous monitoring feeds calibrated with ISO 14064-2 compliance standards."
                action={
                  <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={() => navigate('/supplier/create-listing')}>
                    Add Stream
                  </Button>
                }
              />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#FAFAF9', borderBottom: '1px solid #E5E5E2', color: '#8A8C8A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      <th style={{ padding: '12px 20px' }}>Facility / Stream</th>
                      <th style={{ padding: '12px 20px' }}>Purity</th>
                      <th style={{ padding: '12px 20px' }}>Volume</th>
                      <th style={{ padding: '12px 20px' }}>Physical Phase</th>
                      <th style={{ padding: '12px 20px' }}>Floor Asking</th>
                      <th style={{ padding: '12px 20px' }}>Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realListings.length > 0 ? (
                      realListings.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#1A1D1B' }}>{item.location || 'Terminal Point'}</div>
                            <div style={{ fontSize: 12, color: '#8A8C8A' }}>ID: {item.id ? item.id.slice(0, 8) : 'N/A'}...</div>
                          </td>
                          <td className="tabular-nums" style={{ padding: '16px 20px', fontWeight: 700, color: '#0F3D2E' }}>
                            {Number(item.purity).toFixed(1)}%
                          </td>
                          <td className="tabular-nums" style={{ padding: '16px 20px' }}>
                            {item.quantity} tonnes
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.delivery_terms || 'Liquefied (18.5 bar)'}
                          </td>
                          <td className="tabular-nums" style={{ padding: '16px 20px', fontWeight: 600 }}>
                            ${item.asking_price} / t
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <Badge variant="teal" dot>{item.status || 'Active'}</Badge>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
                              Marketplace →
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#1A1D1B' }}>ABC Cement Ltd</div>
                          <div style={{ fontSize: 12, color: '#8A8C8A' }}>Ahmedabad, Gujarat</div>
                        </td>
                        <td className="tabular-nums" style={{ padding: '16px 20px', fontWeight: 700, color: '#0F3D2E' }}>
                          96.0%
                        </td>
                        <td className="tabular-nums" style={{ padding: '16px 20px' }}>
                          500 t/mo
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          Liquefied (18.5 bar)
                        </td>
                        <td className="tabular-nums" style={{ padding: '16px 20px', fontWeight: 600 }}>
                          $42 / t
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <Badge variant="teal" dot>Active Stream</Badge>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
                            Marketplace →
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: Inbound Bids */}
          {activeTab === 'bids' && (
            <Card>
              <CardHeader
                title="Inbound Commercial Off-Take Proposals"
                subtitle="Review binding bilateral off-take offers from qualified industrial buyers. Accept to commission a transport job."
              />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {realRequests.length > 0 ? (
                  realRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        border: '1px solid #E5E5E2',
                        borderRadius: 8,
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                        background: req.status === 'ACCEPTED' ? '#F0FDF4' : '#FAFAF9'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B' }}>
                            Inbound Offer #{req.id ? req.id.slice(0, 8) : 'REQ'}
                          </span>
                          <Badge 
                            variant={req.status === 'ACCEPTED' ? 'green' : req.status === 'REJECTED' ? 'neutral' : 'teal'}
                            dot={req.status === 'PENDING'}
                          >
                            {req.status === 'ACCEPTED' ? 'Accepted by You' : req.status === 'REJECTED' ? 'Declined' : 'Pending Review'}
                          </Badge>
                          <span style={{ fontSize: 12, color: '#8A8C8A' }}>
                            Buyer ID: {req.buyer_id ? req.buyer_id.slice(0, 8) : 'buyer'}...
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#5A5C5A' }}>
                          Requested Volume: <strong className="tabular-nums" style={{ color: '#1A1D1B' }}>{req.quantity} tonnes</strong> · Offered Price: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>${req.offered_price} / tonne</strong>
                        </div>
                        <div className="tabular-nums" style={{ fontSize: 12, color: '#8A8C8A', marginTop: 4 }}>
                          Total Settlement: ${(req.quantity * req.offered_price).toLocaleString()} · Match Ref: {req.match_id ? req.match_id.slice(0, 8) : 'M-DIRECT'}...
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {req.status === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                              icon={<X size={13} />}
                              disabled={updatingId === req.id}
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<Check size={13} />}
                              disabled={updatingId === req.id}
                              onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                            >
                              {updatingId === req.id ? 'Processing...' : 'Accept Offer'}
                            </Button>
                          </>
                        ) : req.status === 'ACCEPTED' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate(`/transactions/${req.id}`)}
                          >
                            Track Transport & Logistics →
                          </Button>
                        ) : (
                          <Badge variant="neutral">Declined</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
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
                          GreenFuel SynTech Ltd
                        </span>
                        <Badge variant="teal">e-SAF Pilot Line</Badge>
                        <Badge variant="neutral">Vadodara Hub (112 km)</Badge>
                      </div>
                      <div style={{ fontSize: 13, color: '#5A5C5A' }}>
                        Requested Volume: <strong className="tabular-nums" style={{ color: '#1A1D1B' }}>300 tonnes/month</strong> · Offered Price: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>$42 / tonne</strong>
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 12, color: '#8A8C8A', marginTop: 4 }}>
                        Monthly Settlement: $12,600 · Cryogenic Road Transport via NH-48 Corridor
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="sm" variant="outline" onClick={() => navigate('/transactions/TXN-8801')}>
                        View Active Deal
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => navigate('/matches')}>
                        Review 96% Match
                      </Button>
                    </div>
                  </div>
                )}
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
                  GreenFuel SynTech (Vadodara)
                </div>
                <div style={{ fontSize: 12, color: '#5A5C5A', marginBottom: 16 }}>
                  Power-to-Liquids e-SAF · 112 km corridor
                </div>
                <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 6, padding: 12, fontSize: 12, marginBottom: 16 }}>
                  <div>Demand: <strong className="tabular-nums">300 tonnes / mo</strong></div>
                  <div style={{ marginTop: 2 }}>Min purity req: <strong className="tabular-nums">&gt; 95.0%</strong> (Supplying 96.0%)</div>
                  <div style={{ marginTop: 2 }}>Ceiling budget: <strong className="tabular-nums">$45 / t</strong> (Listing at $42/t)</div>
                </div>
                <Button fullWidth size="sm" variant="secondary" onClick={() => navigate('/matches')}>
                  Inspect Match & Scoring Breakdown →
                </Button>
              </Card>

              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Badge variant="neutral">Match 91%</Badge>
                  <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>MATCH-103</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B', marginBottom: 2 }}>
                  Ultratech Eco-Concrete (Bharuch)
                </div>
                <div style={{ fontSize: 12, color: '#5A5C5A', marginBottom: 16 }}>
                  Concrete Mineralization · 188 km corridor
                </div>
                <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 6, padding: 12, fontSize: 12, marginBottom: 16 }}>
                  <div>Demand: <strong className="tabular-nums">450 tonnes / mo</strong></div>
                  <div style={{ marginTop: 2 }}>Min purity req: <strong className="tabular-nums">&gt; 90.0%</strong> (Supplying 96.0%)</div>
                  <div style={{ marginTop: 2 }}>Ceiling budget: <strong className="tabular-nums">$35 / t</strong></div>
                </div>
                <Button fullWidth size="sm" variant="outline" onClick={() => navigate('/matches')}>
                  Inspect Match & Scoring Breakdown →
                </Button>
              </Card>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default SupplierDashboardPage;
