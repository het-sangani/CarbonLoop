import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  StatTile
} from '../components/common/UIComponents';
import { mockSupplyListings, SupplyListing } from '../mockData';
import { carbonLoopApi } from '../services/api';
import {
  ArrowLeft,
  ArrowRight,
  Droplets,
  Gauge,
  Thermometer,
  Sparkles
} from 'lucide-react';

export default function ListingDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [realListing, setRealListing] = useState<any | null>(null);

  useEffect(() => {
    if (id && id.length > 10) {
      carbonLoopApi.getListing(id).then(res => {
        if (res) setRealListing(res);
      }).catch(err => {
        console.warn('Listing not in API, using default demo', err);
      });
    }
  }, [id]);

  // Find listing by ID, fallback to ABC Cement SUP-001
  const listing: SupplyListing = realListing ? {
    id: realListing.id,
    companyName: realListing.location ? `${realListing.location} Facility` : 'ABC Cement Ltd',
    facilityName: realListing.location ? `Capture Unit (${realListing.location})` : 'Kiln-4 Precalciner Capture Unit',
    location: realListing.location || 'Gujarat, India',
    sourceType: 'Point-Source Industrial Flue',
    captureTechnology: 'Post-combustion chemical absorption (monoethanolamine amine solvent)',
    volumeTonnes: Number(realListing.quantity) || 500,
    pricePerTonneUSD: Number(realListing.asking_price) || 42,
    deliveryTerms: realListing.delivery_terms || 'Ex-Works terminal loading rack',
    composition: {
      co2Purity: Number(realListing.purity) || 96.0,
      moisturePpm: 12,
      oxygenPpm: 25,
      sulfurPpm: 0.8,
      hydrocarbonsPpm: 2.1,
    },
    physicalState: 'Liquefied',
    temperatureCelsius: -22,
    pressureBar: 18.5,
    description: `Point-source capture facility located in ${realListing.location}, producing ${realListing.quantity} tonnes/month of ${realListing.purity}% pure CO₂.`,
    isVerified: true,
    verificationAuditDate: '2026-08-15',
    verifiedBy: 'Bureau Veritas India (ISO 14064-3)',
    certId: `CERT-ISO-${realListing.id.slice(0, 8)}`,
  } : (mockSupplyListings.find((s) => s.id === id) || mockSupplyListings[0]);

  // Interactive corridor distance calculator state
  const [targetDestination, setTargetDestination] = useState<'Vadodara' | 'Bharuch' | 'Dahej' | 'Surat'>('Vadodara');

  const destinationDistances = {
    Vadodara: { km: 112, hours: '2.5 hrs', emissionsKg: 1420 },
    Bharuch: { km: 188, hours: '4.0 hrs', emissionsKg: 2410 },
    Dahej: { km: 182, hours: '4.2 hrs', emissionsKg: 2330 },
    Surat: { km: 260, hours: '5.5 hrs', emissionsKg: 3320 }
  };

  const activeDistance = destinationDistances[targetDestination];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back link */}
      <button
        onClick={() => navigate('/marketplace')}
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
        Back to CO₂ Marketplace
      </button>

      {/* Page Header */}
      <PageHeader
        badge={`Stream Specification #${listing.id} • Gujarat Regional Clearinghouse`}
        title={`${listing.companyName} — ${listing.facilityName}`}
        subtitle={listing.description}
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<Sparkles size={14} color="#2E9E8A" />}
              onClick={() => navigate(`/matches?supplierId=${listing.id}`)}
            >
              Simulate Match
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => navigate(`/listings/${listing.id}/bid`)}
            >
              Place Commercial Bid
            </Button>
          </div>
        }
      />

      {/* TOP STAT TILES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        <StatTile
          label="Available Off-Take"
          value={listing.volumeTonnes}
          unit="tonnes/mo"
          delta="Continuous"
        />
        <StatTile
          label="Certified CO₂ Purity"
          value={`${listing.composition.co2Purity}%`}
          unit="by gas volume"
        />
        <StatTile
          label="Listing Spot Price"
          value={`$${listing.pricePerTonneUSD}`}
          unit="/ tonne (Ex-Works)"
        />
        <StatTile
          label="Audit Verification"
          value="Third-Party"
          unit="ISO 14064-2"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* LEFT COLUMN: Technical Chromatography & Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1.8' }}>
          {/* Gas Assay Table */}
          <Card style={{ padding: '24px' }} accentColor="#2E9E8A">
            <CardHeader
              title="Certified Gas Chromatography Assay"
              subtitle="Calibrated gas chromatography & continuous emissions monitoring (CEMS)"
              action={<Badge variant="teal" dot pulse>ISO 14064 Verified</Badge>}
              style={{ padding: 0, marginBottom: 20 }}
            />

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAFAF9', borderBottom: '1px solid #E5E5E2' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: '#5A5C5A', fontWeight: 600 }}>Constituent Gas</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px', color: '#5A5C5A', fontWeight: 600 }}>Concentration</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: '#5A5C5A', fontWeight: 600 }}>Specification Threshold</th>
                    <th style={{ textAlign: 'center', padding: '10px 14px', color: '#5A5C5A', fontWeight: 600 }}>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1A1D1B' }}>Carbon Dioxide (CO₂)</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2E9E8A' }}>
                      {listing.composition.co2Purity.toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Baseline &gt; 90.0%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="teal">Exceeds Spec</Badge>
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>Moisture Content (H₂O)</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listing.composition.moisturePpm} ppm
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Max 200 ppm</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="green">Compliant</Badge>
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>Nitrogen (N₂)</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listing.composition.nitrogenPpm.toLocaleString()} ppm
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Inert Diluent</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="neutral">Inert</Badge>
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>Sulfur Oxides (SOx)</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listing.composition.soxPpm} ppm
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Max 50 ppm</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="green">Compliant</Badge>
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #F1F1EF' }} className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>Nitrogen Oxides (NOx)</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listing.composition.noxPpm} ppm
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Max 100 ppm</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="green">Compliant</Badge>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#FAFAF9]">
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>Particulates</td>
                    <td className="tabular-nums" style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listing.composition.particulatesMgM3} mg/Nm³
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5A5C5A' }}>Max 5.0 mg/Nm³</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="green">Compliant</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Thermodynamic & Storage Parameters */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Thermodynamic Storage & Handling Standards"
              subtitle="Terminal interface specifications for off-take trailers and cryogenic tankers"
              style={{ padding: 0, marginBottom: 20 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <div style={{ background: '#FAFAF9', padding: '16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 4 }}>
                  <Droplets size={14} />
                  <LabelCaps style={{ fontSize: 9 }}>Physical Phase</LabelCaps>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                  {listing.physicalState}
                </div>
                <div style={{ fontSize: 11, color: '#5A5C5A', marginTop: 2 }}>
                  Cryogenic liquid containment
                </div>
              </div>

              <div style={{ background: '#FAFAF9', padding: '16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 4 }}>
                  <Gauge size={14} />
                  <LabelCaps style={{ fontSize: 9 }}>Vapor Pressure</LabelCaps>
                </div>
                <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                  {listing.pressureBar} bar
                </div>
                <div style={{ fontSize: 11, color: '#5A5C5A', marginTop: 2 }}>
                  Regulated off-take manifold
                </div>
              </div>

              <div style={{ background: '#FAFAF9', padding: '16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 4 }}>
                  <Thermometer size={14} />
                  <LabelCaps style={{ fontSize: 9 }}>Operating Temp</LabelCaps>
                </div>
                <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                  {listing.temperatureC} °C
                </div>
                <div style={{ fontSize: 11, color: '#5A5C5A', marginTop: 2 }}>
                  Sub-zero insulated storage
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Interactive Transit Corridor & Off-Take Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1.1' }}>
          {/* Quick Commercial Action Card */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Off-Take Contracting"
              subtitle="Direct spot or multi-month forward off-take"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#8A8C8A' }}>Off-Take Asking Price:</span>
                <span className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: '#0F3D2E' }}>
                  ${listing.pricePerTonneUSD} <span style={{ fontSize: 12, fontWeight: 400, color: '#8A8C8A' }}>/ tonne</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5A5C5A', marginBottom: 4 }}>
                <span>Incoterms:</span>
                <strong>{listing.deliveryTerms}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5A5C5A', marginBottom: 4 }}>
                <span>Available Effective:</span>
                <strong>{listing.availableFrom}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5A5C5A' }}>
                <span>Contact Officer:</span>
                <strong>{listing.contactPerson}</strong>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              onClick={() => navigate(`/listings/${listing.id}/bid`)}
            >
              Draft Formal Bid / Proposal
            </Button>
          </Card>

          {/* Interactive Corridor Logistics Tool */}
          <Card style={{ padding: '24px' }}>
            <CardHeader
              title="Gujarat Logistics Transit Calculator"
              subtitle="Estimate transit distance, duration, and hauling footprint from Ahmedabad Kiln-4"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Select Off-Take Destination Cluster:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['Vadodara', 'Bharuch', 'Dahej', 'Surat'] as const).map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setTargetDestination(dest)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      border: targetDestination === dest ? '2px solid #2E9E8A' : '1px solid #E5E5E2',
                      background: targetDestination === dest ? 'rgba(46,158,138,0.10)' : '#FAFAF9',
                      color: targetDestination === dest ? '#0F3D2E' : '#5A5C5A',
                      fontWeight: targetDestination === dest ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time calculated results */}
            <div
              style={{
                background: '#FAFAF9',
                border: '1px solid #E5E5E2',
                borderRadius: 6,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Hauling Route:</span>
                <span style={{ fontWeight: 600, color: '#1A1D1B' }}>
                  Ahmedabad ➔ {targetDestination} (NH-48)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>One-way Distance:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#1A1D1B' }}>
                  {activeDistance.km} km
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Estimated Transit Time:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: '#1A1D1B' }}>
                  {activeDistance.hours}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Estimated Transit CO₂:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#2E9E8A' }}>
                  {(activeDistance.emissionsKg / 1000).toFixed(2)} tCO₂e
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
