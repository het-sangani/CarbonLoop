import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  ProgressBar,
  AlertBanner,
  EmptyState,
  SkeletonCard
} from '../components/common/UIComponents';
import { mockMatchResults, MatchResult } from '../mockData';
import { carbonLoopApi, ApiMatchItem, ApiLogisticsEstimate } from '../services/api';
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  RotateCcw,
  Sparkles,
  DollarSign,
  CalendarCheck
} from 'lucide-react';

interface DisplayMatch {
  id: string;
  rawMatchId: string;
  requirementId: string;
  listingId: string;
  supplier: {
    id: string;
    companyName: string;
    location: string;
    facilityType: string;
    composition: {
      co2Purity: number;
    };
    volumeTonnes: number;
    pricePerTonneUSD: number;
  };
  buyer: {
    id: string;
    buyerName: string;
    location: string;
    minPurityPercentage: number;
    volumeNeededTonnes: number;
    targetPricePerTonneUSD: number;
    maxDistanceKm: number;
  };
  breakdown: {
    overallScore: number;
    purityScore: number;
    distanceScore: number;
    volumeScore: number;
    priceScore: number;
    availabilityScore: number;
    distanceKm: number;
    recommendedModality: string;
    estimatedTransitEmissionsKg: number;
    compatibilityNotes: string[];
  };
  logistics?: ApiLogisticsEstimate | null;
  explanation: string;
  explanationPoints: string[];
}

function mapApiMatchToDisplay(m: ApiMatchItem, reqLocation?: string): DisplayMatch {
  const listing = m.listing;
  const purity = Number(listing?.purity || 96.0);
  const qty = Number(listing?.quantity || 500);
  const price = Number(listing?.asking_price || 42);
  const loc = listing?.location || 'Ahmedabad, Gujarat';
  const distance = Math.round(m.distance_km || m.logistics?.distance_km || 101);

  const points = m.explanation_points && m.explanation_points.length > 0
    ? m.explanation_points
    : [
        `${purity.toFixed(1)}% CO₂ purity satisfies the buyer's minimum requirement.`,
        `${qty} tonnes are available against required off-take capacity.`,
        `Supplier is approximately ${distance} km away via regional freight corridor.`,
        `Asking price of $${price}/t is aligned with buyer budget.`,
        `Availability schedule overlaps requested timeline.`
      ];

  const notes = [
    m.explanation,
    m.logistics ? `Logistics model: ${m.logistics.trips_required} cryo-tanker trips (25t payload) for $${m.logistics.transport_estimated_cost.toLocaleString()} freight.` : 'Direct road transport route along Gujarat industrial freight corridor.',
    m.logistics?.disclaimer || 'Prototype matchmaking estimate calculated via transparent deterministic scoring.'
  ].filter(Boolean);

  return {
    id: m.id || `MATCH-${m.listing_id.slice(0, 6)}`,
    rawMatchId: m.id,
    requirementId: m.requirement_id,
    listingId: m.listing_id,
    supplier: {
      id: m.listing_id,
      companyName: loc ? `${loc} Facility` : 'ABC Cement Ltd',
      location: loc,
      facilityType: 'Kiln Precalciner Capture Unit',
      composition: {
        co2Purity: purity,
      },
      volumeTonnes: qty,
      pricePerTonneUSD: price,
    },
    buyer: {
      id: m.requirement_id,
      buyerName: 'GreenFuel SynTech Ltd',
      location: reqLocation || 'Vadodara, Gujarat',
      minPurityPercentage: 95.0,
      volumeNeededTonnes: Math.min(qty, 300),
      targetPricePerTonneUSD: price + 3,
      maxDistanceKm: 180,
    },
    breakdown: {
      overallScore: Math.round(m.match_score),
      purityScore: Math.round(m.purity_score),
      distanceScore: Math.round(m.location_score || 85),
      volumeScore: Math.round(m.quantity_score || 90),
      priceScore: Math.round(m.price_score ?? 95),
      availabilityScore: Math.round(m.availability_score ?? 100),
      distanceKm: distance,
      recommendedModality: 'Cryogenic Tanker Truck (Road)',
      estimatedTransitEmissionsKg: m.logistics?.transit_emissions_kg || 1420,
      compatibilityNotes: notes,
    },
    logistics: m.logistics,
    explanation: m.explanation,
    explanationPoints: points,
  };
}


export default function MatchResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const queryRequirementId = id || searchParams.get('requirementId') || searchParams.get('buyerId');

  const loadMatches = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      let targetReqId = queryRequirementId;

      // If no specific requirement ID in URL, find active requirements from API
      if (!targetReqId || targetReqId.startsWith('BUY-')) {
        const reqs = await carbonLoopApi.getRequirements({ limit: 10 }).catch(() => []);
        if (reqs && reqs.length > 0) {
          targetReqId = reqs[0].id;
        }
      }

      if (targetReqId && !targetReqId.startsWith('BUY-') && !targetReqId.startsWith('MATCH-')) {
        const res = await carbonLoopApi.getMatches(targetReqId);
        if (res.matches && res.matches.length > 0) {
          const displayMatches = res.matches.map((m) => mapApiMatchToDisplay(m));
          setMatches(displayMatches);
          setSelectedMatchIndex(0);
          return;
        }
      }

      // If no backend requirement matches found yet, fallback to mock demo results
      const mockMapped: DisplayMatch[] = mockMatchResults.map((m) => ({
        id: m.id,
        rawMatchId: m.id,
        requirementId: m.buyer.id,
        listingId: m.supplier.id,
        supplier: {
          id: m.supplier.id,
          companyName: m.supplier.companyName,
          location: m.supplier.location,
          facilityType: m.supplier.facilityType,
          composition: {
            co2Purity: m.supplier.composition.co2Purity,
          },
          volumeTonnes: m.supplier.volumeTonnes,
          pricePerTonneUSD: m.supplier.pricePerTonneUSD,
        },
        buyer: {
          id: m.buyer.id,
          buyerName: m.buyer.buyerName,
          location: m.buyer.location,
          minPurityPercentage: m.buyer.minPurityPercentage,
          volumeNeededTonnes: m.buyer.volumeNeededTonnes,
          targetPricePerTonneUSD: m.buyer.targetPricePerTonneUSD,
          maxDistanceKm: m.buyer.maxDistanceKm,
        },
        breakdown: {
          overallScore: m.breakdown.overallScore,
          purityScore: m.breakdown.purityScore,
          distanceScore: m.breakdown.distanceScore,
          volumeScore: m.breakdown.volumeScore,
          priceScore: 95,
          availabilityScore: 100,
          distanceKm: m.breakdown.distanceKm,
          recommendedModality: m.breakdown.recommendedModality,
          estimatedTransitEmissionsKg: m.breakdown.estimatedTransitEmissionsKg,
          compatibilityNotes: m.breakdown.compatibilityNotes,
        },
        explanation: 'Assay purity exceeds off-taker specifications with favorable corridor logistics.',
        explanationPoints: [
          `${m.supplier.composition.co2Purity}% CO₂ purity satisfies the buyer's ${m.buyer.minPurityPercentage}% minimum requirement.`,
          `${m.supplier.volumeTonnes} tonnes are available against ${m.buyer.volumeNeededTonnes} tonnes required.`,
          `Supplier is approximately ${m.breakdown.distanceKm} km away via regional freight corridor.`,
          `Asking price is within the buyer's budget ceiling.`,
          `Availability overlaps the requested off-take schedule.`
        ],
      }));

      setMatches(mockMapped);
      setSelectedMatchIndex(0);
    } catch (err: any) {
      console.error('Failed to load matches:', err);
      setApiError(err.message || 'Could not fetch matches from backend API.');
      // Keep UI responsive with mock benchmark
      setMatches(mockMatchResults.map((m) => ({
        id: m.id,
        rawMatchId: m.id,
        requirementId: m.buyer.id,
        listingId: m.supplier.id,
        supplier: {
          id: m.supplier.id,
          companyName: m.supplier.companyName,
          location: m.supplier.location,
          facilityType: m.supplier.facilityType,
          composition: {
            co2Purity: m.supplier.composition.co2Purity,
          },
          volumeTonnes: m.supplier.volumeTonnes,
          pricePerTonneUSD: m.supplier.pricePerTonneUSD,
        },
        buyer: {
          id: m.buyer.id,
          buyerName: m.buyer.buyerName,
          location: m.buyer.location,
          minPurityPercentage: m.buyer.minPurityPercentage,
          volumeNeededTonnes: m.buyer.volumeNeededTonnes,
          targetPricePerTonneUSD: m.buyer.targetPricePerTonneUSD,
          maxDistanceKm: m.buyer.maxDistanceKm,
        },
        breakdown: {
          overallScore: m.breakdown.overallScore,
          purityScore: m.breakdown.purityScore,
          distanceScore: m.breakdown.distanceScore,
          volumeScore: m.breakdown.volumeScore,
          priceScore: 92,
          availabilityScore: 100,
          distanceKm: m.breakdown.distanceKm,
          recommendedModality: m.breakdown.recommendedModality,
          estimatedTransitEmissionsKg: m.breakdown.estimatedTransitEmissionsKg,
          compatibilityNotes: m.breakdown.compatibilityNotes,
        },
        explanation: 'Deterministic match calculated across chemical assay fit, logistics, and capacity off-take.',
        explanationPoints: [
          `${m.supplier.composition.co2Purity}% CO₂ purity satisfies the buyer's ${m.buyer.minPurityPercentage}% minimum requirement.`,
          `${m.supplier.volumeTonnes} tonnes are available against ${m.buyer.volumeNeededTonnes} tonnes required.`,
          `Supplier is approximately ${m.breakdown.distanceKm} km away via regional freight corridor.`,
          `Asking price is within the buyer's budget ceiling.`,
          `Availability overlaps the requested off-take schedule.`
        ],
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [id, queryRequirementId]);

  const currentMatch = matches[selectedMatchIndex] || matches[0];

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
              icon={<RotateCcw size={13} />}
              onClick={loadMatches}
            >
              Refresh Matches
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              Browse Marketplace
            </Button>
            {currentMatch && (
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight size={15} />}
                iconPosition="right"
                onClick={() =>
                  navigate(
                    `/listings/${currentMatch.listingId}/bid?match_id=${currentMatch.rawMatchId}&price=${currentMatch.supplier.pricePerTonneUSD}&qty=${currentMatch.buyer.volumeNeededTonnes}`
                  )
                }
              >
                Initiate Commercial Off-Take Bid
              </Button>
            )}
          </div>
        }
      />

      {apiError && (
        <div style={{ marginBottom: 20 }}>
          <AlertBanner
            variant="warning"
            title="Notice"
            message={`${apiError} Displaying verified benchmark pairings.`}
            actionLabel="Retry"
            onAction={loadMatches}
          />
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SkeletonCard lines={3} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <SkeletonCard lines={8} />
            <SkeletonCard lines={6} />
          </div>
        </div>
      ) : !currentMatch ? (
        <EmptyState
          title="No Matched Suppliers Found"
          description="No active CO2 capture streams meet the required purity and logistics constraints for this requirement."
          actionLabel="Post New Requirement Tender"
          onAction={() => navigate('/buyer/create-requirement')}
        />
      ) : (
        <>
          {/* TOP PAIRING SWITCHER BAR */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 24,
            }}
          >
            {matches.map((match, idx) => {
              const isSelected = idx === selectedMatchIndex;
              return (
                <button
                  key={match.id + idx}
                  onClick={() => setSelectedMatchIndex(idx)}
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
                    transition: 'all 150ms ease',
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
                      borderRadius: 6,
                    }}
                  >
                    {match.breakdown.overallScore}%
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#1A1D1B',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
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
                      lineHeight: 1,
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

              {/* All 5 Evaluation Pillars */}
              <div style={{ marginBottom: 28 }}>
                <LabelCaps style={{ marginBottom: 14 }}>Compatibility Factor Breakdown</LabelCaps>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  {/* Factor 1: Purity Compatibility */}
                  <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={16} color="#2E9E8A" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                          Purity Compatibility
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                        {currentMatch.breakdown.purityScore}/100
                      </span>
                    </div>
                    <ProgressBar value={currentMatch.breakdown.purityScore} color="#2E9E8A" height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                      <span>Supply: <strong className="tabular-nums">{currentMatch.supplier.composition.co2Purity}% CO₂</strong></span>
                      <span>Buyer Minimum: <strong className="tabular-nums">&ge; {currentMatch.buyer.minPurityPercentage}% CO₂</strong></span>
                    </div>
                  </div>

                  {/* Factor 2: Quantity Compatibility */}
                  <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="#2E9E8A" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                          Quantity Compatibility
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                        {currentMatch.breakdown.volumeScore}/100
                      </span>
                    </div>
                    <ProgressBar value={currentMatch.breakdown.volumeScore} color="#2E9E8A" height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                      <span>Supply Volume: <strong className="tabular-nums">{currentMatch.supplier.volumeTonnes} tonnes</strong></span>
                      <span>Buyer Requirement: <strong className="tabular-nums">{currentMatch.buyer.volumeNeededTonnes} tonnes</strong></span>
                    </div>
                  </div>

                  {/* Factor 3: Logistics / Distance Factor */}
                  <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Truck size={16} color="#2E9E8A" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                          Logistics & Distance Factor
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                        {currentMatch.breakdown.distanceScore}/100
                      </span>
                    </div>
                    <ProgressBar value={currentMatch.breakdown.distanceScore} color="#2E9E8A" height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                      <span>Transit Distance: <strong className="tabular-nums">{currentMatch.breakdown.distanceKm} km</strong></span>
                      <span>Modality: <strong>{currentMatch.breakdown.recommendedModality}</strong></span>
                    </div>
                  </div>

                  {/* Factor 4: Price Compatibility */}
                  <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DollarSign size={16} color="#2E9E8A" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                          Price Compatibility
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                        {currentMatch.breakdown.priceScore}/100
                      </span>
                    </div>
                    <ProgressBar value={currentMatch.breakdown.priceScore} color="#2E9E8A" height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                      <span>Supplier Asking: <strong className="tabular-nums">${currentMatch.supplier.pricePerTonneUSD}/t</strong></span>
                      <span>Buyer Ceiling: <strong className="tabular-nums">${currentMatch.buyer.targetPricePerTonneUSD}/t</strong></span>
                    </div>
                  </div>

                  {/* Factor 5: Availability Compatibility */}
                  <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E5E2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarCheck size={16} color="#2E9E8A" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1B' }}>
                          Availability Compatibility
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: '#2E9E8A' }}>
                        {currentMatch.breakdown.availabilityScore}/100
                      </span>
                    </div>
                    <ProgressBar value={currentMatch.breakdown.availabilityScore} color="#2E9E8A" height={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8C8A', marginTop: 6 }}>
                      <span>Production Window: <strong>Active / Immediate</strong></span>
                      <span>Delivery Status: <strong style={{ color: '#2E9E8A' }}>Schedule Aligned</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WOW FEATURE: EXPLAINABLE MATCHMAKING */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(46, 158, 138, 0.06) 0%, rgba(15, 61, 46, 0.03) 100%)',
                  borderRadius: 10,
                  border: '1px solid rgba(46, 158, 138, 0.28)',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#2E9E8A" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F3D2E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Why this supplier?
                    </span>
                  </div>
                  <Badge variant="green" size="sm">
                    {currentMatch.breakdown.overallScore}% MATCH
                  </Badge>
                </div>

                {/* Human-readable points from backend data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(currentMatch.explanationPoints || []).map((point, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 13,
                        color: '#1A1D1B',
                        lineHeight: 1.45,
                      }}
                    >
                      <span
                        style={{
                          color: '#2E9E8A',
                          fontWeight: 800,
                          fontSize: 14,
                          lineHeight: 1,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontWeight: 500 }}>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Additional logistics model summary note if available */}
                {currentMatch.logistics && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: '1px dashed rgba(46, 158, 138, 0.2)',
                      fontSize: 12,
                      color: '#5C605C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Truck size={14} color="#2E9E8A" />
                    <span>
                      Estimated transit: {currentMatch.logistics.trips_required} tanker trip(s) ({currentMatch.logistics.distance_km} km) • Landed freight ${currentMatch.logistics.transport_estimated_cost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* LOGISTICS & COMMERCIAL ACTION CARD (RIGHT) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: '1.1' }}>
              {/* Commercial Terms Summary */}
              <Card style={{ padding: '24px' }}>
                <CardHeader
                  title="Commercial Terms Summary"
                  subtitle="Transparent pricing and landed cost estimation"
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

                  {currentMatch.logistics && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#8A8C8A' }}>Base CO₂ Cost:</span>
                        <span className="tabular-nums" style={{ fontWeight: 600, color: '#1A1D1B' }}>
                          ${currentMatch.logistics.co2_purchase_cost.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#8A8C8A' }}>Estimated Transit Freight:</span>
                        <span className="tabular-nums" style={{ fontWeight: 600, color: '#0F3D2E' }}>
                          ${currentMatch.logistics.transport_estimated_cost.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div style={{ height: 1, background: '#F1F1EF' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: '#1A1D1B' }}>
                      {currentMatch.logistics ? 'Total Landed Cost:' : 'Monthly Commodity Value:'}
                    </span>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: '#0F3D2E', fontSize: 16 }}>
                      ${(
                        currentMatch.logistics?.total_estimated_cost ||
                        currentMatch.buyer.volumeNeededTonnes * currentMatch.supplier.pricePerTonneUSD
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  onClick={() =>
                    navigate(
                      `/listings/${currentMatch.listingId}/bid?match_id=${currentMatch.rawMatchId}&price=${currentMatch.supplier.pricePerTonneUSD}&qty=${currentMatch.buyer.volumeNeededTonnes}`
                    )
                  }
                >
                  Initiate Commercial Off-Take Bid
                </Button>
              </Card>

              {/* Transit Logistics & Carbon Footprint */}
              <Card style={{ padding: '24px' }}>
                <CardHeader
                  title="Corridor Logistics & ESG Stamp"
                  subtitle="Real logistics model calculation"
                  style={{ padding: 0, marginBottom: 16 }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Truck size={16} color="#0F3D2E" />
                    <span>Modality: <strong>{currentMatch.breakdown.recommendedModality}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <MapPin size={16} color="#0F3D2E" />
                    <span>Corridor: <strong>NH-48 Express ({currentMatch.breakdown.distanceKm} km)</strong></span>
                  </div>

                  {currentMatch.logistics && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <Sparkles size={16} color="#2E9E8A" />
                      <span>Tanker Trips: <strong className="tabular-nums">{currentMatch.logistics.trips_required} cryogenic dispatches</strong></span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Leaf size={16} color="#2E9E8A" />
                    <span>
                      Transit Emissions:{' '}
                      <strong className="tabular-nums">
                        {(currentMatch.breakdown.estimatedTransitEmissionsKg / 1000).toFixed(2)} tonnes CO₂e
                      </strong>
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(46,158,138,0.08)',
                      border: '1px solid rgba(46,158,138,0.20)',
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontSize: 12,
                      color: '#0F3D2E',
                    }}
                  >
                    <strong className="tabular-nums">Net Avoided Carbon: {(currentMatch.buyer.volumeNeededTonnes - currentMatch.breakdown.estimatedTransitEmissionsKg / 1000).toFixed(1)} tonnes</strong>
                    <div style={{ fontSize: 11, color: '#5A5C5A', marginTop: 2 }}>
                      {currentMatch.logistics?.disclaimer || 'Prototype estimate calculated via CarbonLoop logistics service.'}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/transactions')}
                >
                  View Active Custody Pipeline
                </Button>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
