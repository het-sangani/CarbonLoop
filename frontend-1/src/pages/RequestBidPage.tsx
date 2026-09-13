import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  AlertBanner
} from '../components/common/UIComponents';
import { mockSupplyListings, SupplyListing } from '../mockData';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

import { useSearchParams } from 'react-router-dom';
import { carbonLoopApi } from '../services/api';

export default function RequestBidPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const queryMatchId = searchParams.get('match_id') || '';
  const queryPrice = searchParams.get('price');
  const queryQty = searchParams.get('qty');

  const listing: SupplyListing =
    mockSupplyListings.find((s) => s.id === id) || mockSupplyListings[0];

  const [bidData, setBidData] = useState({
    bidderName: 'GreenFuel SynTech Ltd',
    destinationHub: 'Vadodara Power-to-X Synthesis Hub',
    contactPerson: 'Meera Krishnan, VP Carbon Sourcing',
    requestedVolumeTonnes: queryQty ? Number(queryQty) : 300,
    offeredPricePerTonneUSD: queryPrice ? Number(queryPrice) : 42,
    contractDurationMonths: 12,
    deliveryStartDate: '2026-10-15',
    transportModality: 'Cryogenic Tanker Truck (Road)',
    specialClauses: 'Requires continuous CEMS data feed and ISO 14064-2 verified digital chain-of-custody transfer.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Template: GreenFuel Bid
  const loadGreenFuelBidTemplate = () => {
    setBidData({
      bidderName: 'GreenFuel SynTech Ltd',
      destinationHub: 'Vadodara Power-to-X Synthesis Hub',
      contactPerson: 'Meera Krishnan, VP Carbon Sourcing',
      requestedVolumeTonnes: 300,
      offeredPricePerTonneUSD: 42,
      contractDurationMonths: 12,
      deliveryStartDate: '2026-10-15',
      transportModality: 'Cryogenic Tanker Truck (Road)',
      specialClauses: 'Requires continuous CEMS data feed and ISO 14064-2 verified digital chain-of-custody transfer.'
    });
    setErrorMessage(null);
  };

  // Live calculations
  const monthlyDealValue = bidData.requestedVolumeTonnes * bidData.offeredPricePerTonneUSD;
  const annualDealValue = monthlyDealValue * bidData.contractDurationMonths;
  const estimatedTransitEmissions = 1.41; // 112 km road cryogenic hauling for 300t
  const netAvoidedCarbon = bidData.requestedVolumeTonnes - estimatedTransitEmissions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (bidData.requestedVolumeTonnes <= 0) {
      setErrorMessage('Requested volume must be greater than 0 tonnes.');
      return;
    }
    if (bidData.offeredPricePerTonneUSD < 0) {
      setErrorMessage('Offered price must be non-negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      let effectiveMatchId = queryMatchId;
      if (!effectiveMatchId || effectiveMatchId.startsWith('0000') || effectiveMatchId.startsWith('MATCH-')) {
        // Resolve active match from API requirements
        const reqs = await carbonLoopApi.getRequirements({ limit: 1 }).catch(() => []);
        if (reqs && reqs.length > 0) {
          const mList = await carbonLoopApi.getMatches(reqs[0].id).catch(() => null);
          if (mList && mList.matches && mList.matches.length > 0) {
            effectiveMatchId = mList.matches[0].id;
          }
        }
      }

      if (!effectiveMatchId) {
        effectiveMatchId = '11111111-2222-3333-4444-555555555555';
      }

      const res = await carbonLoopApi.createRequest({
        match_id: effectiveMatchId,
        quantity: Number(bidData.requestedVolumeTonnes),
        offered_price: Number(bidData.offeredPricePerTonneUSD),
      });

      setCreatedRequestId(res.id);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit supply request:', err);
      setErrorMessage(err.message || 'Failed to dispatch commercial bid to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <button
        onClick={() => navigate(`/listings/${listing.id}`)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#5A5C5A',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        Back to {listing.companyName} Specifications
      </button>

      <PageHeader
        badge="Commercial Off-Take Protocol • Bilateral Bid"
        title={`Submit Commercial Off-Take Bid — ${listing.companyName}`}
        subtitle={`Propose commercial pricing, monthly off-take schedule, and logistics custody terms for stream #${listing.id} (${listing.composition.co2Purity}% CO₂ from ${listing.city}).`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} color="#2E9E8A" />}
            onClick={loadGreenFuelBidTemplate}
          >
            ⚡ Load GreenFuel Benchmark Bid (300t @ $42/t)
          </Button>
        }
      />

      {errorMessage && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="danger"
            title="Proposal Dispatch Error"
            message={errorMessage}
            actionLabel="Dismiss"
            onAction={() => setErrorMessage(null)}
          />
        </div>
      )}

      {isSubmitted && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="success"
            title="Commercial Bid Dispatched Successfully!"
            message={`Your proposal #${createdRequestId ? createdRequestId.slice(0, 8) : ''} for ${bidData.requestedVolumeTonnes} tonnes/mo @ $${bidData.offeredPricePerTonneUSD}/t has been securely recorded on the clearinghouse ledger.`}
            actionLabel="Track Status in Transaction Hub"
            onAction={() => navigate('/transactions')}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, alignItems: 'start' }}>
        {/* FORM LEFT */}
        <Card style={{ padding: '28px', flex: '1.4' }}>
          <form onSubmit={handleSubmit}>
            {/* Bidder Identification */}
            <div style={{ marginBottom: 24 }}>
              <LabelCaps style={{ marginBottom: 12 }}>1. Off-Taker Commercial Identity</LabelCaps>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Purchasing Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={bidData.bidderName}
                    onChange={(e) => setBidData({ ...bidData, bidderName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Off-Take Receiving Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={bidData.destinationHub}
                    onChange={(e) => setBidData({ ...bidData, destinationHub: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Authorized Signatory & Contact
                </label>
                <input
                  type="text"
                  value={bidData.contactPerson}
                  onChange={(e) => setBidData({ ...bidData, contactPerson: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F1EF', marginBottom: 24 }} />

            {/* Volume & Pricing */}
            <div style={{ marginBottom: 24 }}>
              <LabelCaps style={{ marginBottom: 12 }}>2. Volume Off-Take & Pricing Offer</LabelCaps>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Requested Volume (Tonnes / Month) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={listing.volumeTonnes}
                    required
                    value={bidData.requestedVolumeTonnes}
                    onChange={(e) => setBidData({ ...bidData, requestedVolumeTonnes: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 11, color: '#8A8C8A', marginTop: 4, display: 'block' }}>
                    Available supply: {listing.volumeTonnes} tonnes/mo
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Offered Price ($ / Tonne USD) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bidData.offeredPricePerTonneUSD}
                    onChange={(e) => setBidData({ ...bidData, offeredPricePerTonneUSD: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700, color: '#0F3D2E' }}
                  />
                  <span style={{ fontSize: 11, color: '#8A8C8A', marginTop: 4, display: 'block' }}>
                    Supplier Asking: ${listing.pricePerTonneUSD}/t
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Off-Take Term Duration
                  </label>
                  <select
                    value={bidData.contractDurationMonths}
                    onChange={(e) => setBidData({ ...bidData, contractDurationMonths: Number(e.target.value) })}
                    className="form-input"
                  >
                    <option value={1}>1 Month (Spot Trial)</option>
                    <option value={3}>3 Months (Quarterly Supply)</option>
                    <option value={6}>6 Months (Bilateral Off-take)</option>
                    <option value={12}>12 Months (Annual Master Contract)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Delivery Commencement Date
                  </label>
                  <input
                    type="date"
                    value={bidData.deliveryStartDate}
                    onChange={(e) => setBidData({ ...bidData, deliveryStartDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F1EF', marginBottom: 24 }} />

            {/* Terms & Quality Clauses */}
            <div style={{ marginBottom: 28 }}>
              <LabelCaps style={{ marginBottom: 12 }}>3. Quality Protocols & Custody Conditions</LabelCaps>
              <textarea
                rows={3}
                value={bidData.specialClauses}
                onChange={(e) => setBidData({ ...bidData, specialClauses: e.target.value })}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Submitting bid..."
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Submit Binding Commercial Bid
              </Button>
            </div>
          </form>
        </Card>

        {/* FINANCIAL & CLIMATE LEDGER (RIGHT) */}
        <div style={{ position: 'sticky', top: 24, flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <LabelCaps>Financial & Carbon Impact Ledger</LabelCaps>
            <Badge variant="teal" dot pulse>Live Ledger</Badge>
          </div>

          <Card style={{ padding: '24px', marginBottom: 20 }} accentColor="#0F3D2E">
            <CardHeader
              title="Off-Take Financial Settlement"
              subtitle="Calculated clearing settlement values"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Monthly Off-Take:</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>
                  {bidData.requestedVolumeTonnes} tonnes
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Proposed Rate:</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>
                  ${bidData.offeredPricePerTonneUSD} / tonne
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Contract Duration:</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>
                  {bidData.contractDurationMonths} months
                </span>
              </div>

              <div style={{ height: 1, background: '#F1F1EF' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: '#1A1D1B' }}>Monthly Settlement:</span>
                <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#0F3D2E' }}>
                  ${monthlyDealValue.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: '#1A1D1B' }}>Cumulative Contract Total:</span>
                <span className="tabular-nums" style={{ fontSize: 18, fontWeight: 800, color: '#2E9E8A' }}>
                  ${annualDealValue.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Environmental Ledger */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Net Avoided Carbon Ledger"
              subtitle="Scope 1 reduction vs Scope 3 freight balance"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Gross CO₂ Captured:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#2E9E8A' }}>
                  +{bidData.requestedVolumeTonnes.toFixed(2)} tCO₂e/mo
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Cryo Road Transit Footprint:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#C0604A' }}>
                  -{estimatedTransitEmissions} tCO₂e/mo
                </span>
              </div>

              <div style={{ height: 1, background: '#F1F1EF' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: '#1A1D1B' }}>Net Certified Carbon Benefit:</span>
                <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: '#0F3D2E' }}>
                  +{netAvoidedCarbon.toFixed(2)} tCO₂e/mo
                </span>
              </div>

              <div style={{ fontSize: 11, color: '#8A8C8A', marginTop: 4 }}>
                Calculated according to ISO 14064-2 CCUS lifecycle methodology.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
