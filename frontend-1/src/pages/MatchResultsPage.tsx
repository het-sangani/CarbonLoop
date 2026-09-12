import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  ProgressBar
} from '../components/common/UIComponents';
import { mockMatchResults, MatchResult } from '../mockData';
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Leaf
} from 'lucide-react';

export default function MatchResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  // Find match by route param or query param, default to MATCH-101 (ABC Cement <-> GreenFuel)
  const activeMatchId = id || searchParams.get('matchId') || 'MATCH-101';
  const currentMatch = mockMatchResults.find((m) => m.id === activeMatchId) || mockMatchResults[0];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <PageHeader
        badge="Autonomous Clearinghouse Engine • Rule-Based Scoring"
        title="Industrial Match Results"
        subtitle="Multi-variable evaluation balancing chemical purity thresholds, road/rail transit emissions, and volume batch compatibility across Gujarat."
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              Browse All Listings
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
              onClick={() => navigate(`/listings/${currentMatch.supplier.id}/bid`)}
            >
              Initiate Commercial Off-Take Bid
            </Button>
          </div>
        }
      />

      {/* TOP PAIRING SWITCHER BAR */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24
        }}
      >
        {mockMatchResults.map((match) => {
          const isSelected = match.id === currentMatch.id;
          return (
            <button
              key={match.id}
              onClick={() => navigate(`/matches/${match.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: isSelected ? '2px solid #2E9E8A' : '1px solid #E5E5E2',
                background: isSelected ? '#FFFFFF' : '#FAFAF9',
                boxShadow: isSelected ? '0 4px 12px rgba(46,158,138,0.12)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: 280,
                transition: 'all 150ms ease'
              }}
            >
              <div
                className="tabular-nums"
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: isSelected ? '#2E9E8A' : '#1A1D1B',
                  background: isSelected ? 'rgba(46,158,138,0.12)' : '#F1F1EF',
                  padding: '6px 10px',
                  borderRadius: 6
                }}
              >
                {match.breakdown.overallScore}%
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D1B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {match.supplier.companyName} ➔ {match.buyer.buyerName}
                </div>
                <div style={{ fontSize: 11, color: '#8A8C8A', marginTop: 2 }}>
                  <span className="tabular-nums">{match.breakdown.distanceKm}</span> km • {match.breakdown.recommendedModality.split('(')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FEATURED MATCH DETAILS HERO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* MATCH BREAKDOWN LEFT COLUMN */}
        <Card style={{ padding: '28px', flex: '1.8' }} accentColor="#2E9E8A">
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Badge variant="teal" dot pulse>Optimal Commercial Match</Badge>
                <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>
                  REF: {currentMatch.id}
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D1B', margin: 0 }}>
                {currentMatch.supplier.companyName} <span style={{ color: '#2E9E8A' }}>⟷</span> {currentMatch.buyer.buyerName}
              </h2>
              <div style={{ fontSize: 13, color: '#5A5C5A', marginTop: 4 }}>
                {currentMatch.supplier.location} to {currentMatch.buyer.location} • <span className="tabular-nums">{currentMatch.breakdown.distanceKm} km</span> via NH-48 Corridor
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                className="tabular-nums"
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color: '#2E9E8A',
                  lineHeight: 1
                }}
              >
                {currentMatch.breakdown.overallScore}%
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Compatibility Index
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: '#F1F1EF', marginBottom: 24 }} />

          {/* Three Evaluation Pillars */}
          <div style={{ marginBottom: 28 }}>
            <LabelCaps style={{ marginBottom: 14 }}>Weighted Scoring Architecture</LabelCaps>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {/* Pillar 1 */}
              <div style={{ background: '#FAFAF9', padding: '14px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={16} color="#2E9E8A" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                      Chemical Assay & Purity Fit (Weight: 40%)
                    </span>
                  </div>
                  <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                    {currentMatch.breakdown.purityScore}/100
                  </span>
                </div>
                <ProgressBar value={currentMatch.breakdown.purityScore} color="#2E9E8A" height={6} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                  <span>Supply: <strong className="tabular-nums">{currentMatch.supplier.composition.co2Purity}% CO₂</strong></span>
                  <span>Buyer Ceiling: <strong className="tabular-nums">&ge; {currentMatch.buyer.minPurityPercentage}% CO₂</strong> (Margin: +{(currentMatch.supplier.composition.co2Purity - currentMatch.buyer.minPurityPercentage).toFixed(1)}%)</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div style={{ background: '#FAFAF9', padding: '14px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={16} color="#2E9E8A" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                      Logistical Distance & Transit Modality (Weight: 30%)
                    </span>
                  </div>
                  <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                    {currentMatch.breakdown.distanceScore}/100
                  </span>
                </div>
                <ProgressBar value={currentMatch.breakdown.distanceScore} color="#2E9E8A" height={6} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                  <span>Actual Route: <strong className="tabular-nums">{currentMatch.breakdown.distanceKm} km</strong></span>
                  <span>Buyer Perimeter: <strong className="tabular-nums">Max {currentMatch.buyer.maxDistanceKm} km</strong> (Well within bounds)</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div style={{ background: '#FAFAF9', padding: '14px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} color="#2E9E8A" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                      Volume Off-Take & Capacity Fit (Weight: 30%)
                    </span>
                  </div>
                  <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                    {currentMatch.breakdown.volumeScore}/100
                  </span>
                </div>
                <ProgressBar value={currentMatch.breakdown.volumeScore} color="#2E9E8A" height={6} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                  <span>Supply Capacity: <strong className="tabular-nums">{currentMatch.supplier.volumeTonnes} tonnes/mo</strong></span>
                  <span>Buyer Requirement: <strong className="tabular-nums">{currentMatch.buyer.volumeNeededTonnes} tonnes/mo</strong> (60% utilization)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Verification Notes */}
          <div>
            <LabelCaps style={{ marginBottom: 12 }}>Algorithmic Verification Notes</LabelCaps>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentMatch.breakdown.compatibilityNotes.map((note, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 13,
                    color: '#1A1D1B',
                    lineHeight: 1.4
                  }}
                >
                  <CheckCircle2 size={16} color="#2E9E8A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* LOGISTICS & COMMERCIAL ACTION CARD (RIGHT) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: '1.1' }}>
          {/* Commercial Terms Summary */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Commercial Terms Summary"
              subtitle="Pre-negotiation pricing analysis"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Supplier Asking Price:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: '#1A1D1B' }}>
                  ${currentMatch.supplier.pricePerTonneUSD} / tonne
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Buyer Target Ceiling:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: '#1A1D1B' }}>
                  ${currentMatch.buyer.targetPricePerTonneUSD} / tonne
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Arbitrage Margin:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#2E9E8A' }}>
                  +${currentMatch.buyer.targetPricePerTonneUSD - currentMatch.supplier.pricePerTonneUSD} / tonne (Favorable)
                </span>
              </div>

              <div style={{ height: 1, background: '#F1F1EF' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: '#1A1D1B' }}>Monthly Contract Value:</span>
                <span className="tabular-nums" style={{ fontWeight: 800, color: '#0F3D2E', fontSize: 16 }}>
                  ${(currentMatch.buyer.volumeNeededTonnes * currentMatch.supplier.pricePerTonneUSD).toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              onClick={() => navigate(`/listings/${currentMatch.supplier.id}/bid`)}
            >
              Draft Official Off-Take Proposal
            </Button>
          </Card>

          {/* Transit Logistics & Carbon Footprint */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Corridor Logistics & ESG Stamp"
              subtitle="Transit footprint simulation"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <Truck size={16} color="#0F3D2E" />
                <span>Modality: <strong>{currentMatch.breakdown.recommendedModality}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <MapPin size={16} color="#0F3D2E" />
                <span>Corridor: <strong>NH-48 Express (112 km)</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <Leaf size={16} color="#2E9E8A" />
                <span>Transit Emissions: <strong className="tabular-nums">{(currentMatch.breakdown.estimatedTransitEmissionsKg / 1000).toFixed(2)} tonnes CO₂</strong></span>
              </div>

              <div
                style={{
                  background: 'rgba(46,158,138,0.08)',
                  border: '1px solid rgba(46,158,138,0.20)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#0F3D2E'
                }}
              >
                <strong className="tabular-nums">Net Climate Efficiency: 99.53%</strong>
                <div style={{ fontSize: 11, color: '#5A5C5A', marginTop: 2 }}>
                  300t CO₂ permanently utilized vs 1.42t consumed in transport.
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/transactions/TXN-8801')}
            >
              View Active Transaction Pipeline
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
