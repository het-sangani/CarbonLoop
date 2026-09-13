import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  AlertBanner
} from '../components/common/UIComponents';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Gauge
} from 'lucide-react';

import { createSupplyListing } from '../services/api';

export default function CreateSupplyListingPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    facilityName: '',
    facilityType: 'Cement Plant',
    city: '',
    state: 'Gujarat',
    volumeTonnes: 500,
    volumeFrequency: 'Monthly Continuous',
    co2Purity: 96.0,
    nitrogenPpm: 28000,
    moisturePpm: 120,
    soxPpm: 15,
    noxPpm: 35,
    particulatesMgM3: 2.1,
    physicalState: 'Liquefied' as 'Liquefied' | 'Gas' | 'Supercritical',
    pressureBar: 18.5,
    temperatureC: -22.0,
    pricePerTonneUSD: 42,
    availableFrom: '2026-10-01',
    deliveryTerms: 'Ex-Works',
    description: '',
    contactPerson: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Template: ABC Cement
  const loadAbcCementTemplate = () => {
    setFormData({
      companyName: 'ABC Cement Ltd',
      facilityName: 'Ahmedabad Kiln-4 Precalciner Capture Unit',
      facilityType: 'Cement Plant',
      city: 'Ahmedabad',
      state: 'Gujarat',
      volumeTonnes: 500,
      volumeFrequency: 'Monthly Continuous',
      co2Purity: 96.0,
      nitrogenPpm: 28000,
      moisturePpm: 120,
      soxPpm: 15,
      noxPpm: 35,
      particulatesMgM3: 2.1,
      physicalState: 'Liquefied',
      pressureBar: 18.5,
      temperatureC: -22.0,
      pricePerTonneUSD: 42,
      availableFrom: '2026-10-01',
      deliveryTerms: 'Ex-Works',
      description: 'Post-combustion amine capture slipstream with integrated dehydration and liquefaction sub-station at Ahmedabad Kiln-4.',
      contactPerson: 'Rajesh Varma, VP Industrial Decarbonization'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await createSupplyListing(formData);
      setCreatedListingId(response.id);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to publish listing to the registry. Please ensure the backend server is running.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <PageHeader
        badge="Supply Onboarding • Gujarat Clearinghouse"
        title="Publish CO₂ Capture Supply Stream"
        subtitle="List verified industrial carbon capture output for algorithmic matching with synthetic fuel producers, concrete mineralization plants, and chemical synthesizers."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} color="#2E9E8A" />}
            onClick={loadAbcCementTemplate}
          >
            ⚡ Load ABC Cement Benchmark Template
          </Button>
        }
      />

      {errorMessage && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="error"
            title="Listing Creation Notice"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        </div>
      )}

      {submitted && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="success"
            title="Stream Published Successfully to Database!"
            message={`Your listing for ${formData.companyName || 'ABC Cement'} (${formData.volumeTonnes} tonnes/mo at ${formData.co2Purity}% purity) has been persisted to the Supabase clearinghouse database${createdListingId ? ` (ID: ${createdListingId})` : ''}.`}
            actionLabel="View in Marketplace"
            onAction={() => navigate('/marketplace')}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, alignItems: 'start' }}>
        {/* FORM CONTAINER */}
        <Card style={{ padding: '28px', flex: '1.4' }}>
          <form onSubmit={handleSubmit}>
            {/* SECTION 1: Facility Identification */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#0F3D2E',
                    color: '#FAFAF9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1A1D1B' }}>
                  Facility & Industrial Identity
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Company / Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Cement"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Facility Type / Sector
                  </label>
                  <select
                    value={formData.facilityType}
                    onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                    className="form-input"
                  >
                    <option value="Cement Plant">Cement Plant</option>
                    <option value="Bio-Refinery">Bio-Refinery & Fermentation</option>
                    <option value="Chemicals & Fertilizer">Chemicals & Fertilizer</option>
                    <option value="Power Plant">Gas / Thermal Power Plant</option>
                    <option value="Direct Air Capture">Direct Air Capture (DAC)</option>
                    <option value="Steel & Metallurgy">Steel & Metallurgy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Facility Sub-Station Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad Kiln-4 Capture Facility"
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    City / Cluster *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F1EF', marginBottom: 28 }} />

            {/* SECTION 2: Capacity & Gas Chromatography */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#0F3D2E',
                    color: '#FAFAF9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  2
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1A1D1B' }}>
                  Capacity & Certified Gas Composition
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Output Volume (Tonnes / Month) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.volumeTonnes}
                    onChange={(e) => setFormData({ ...formData, volumeTonnes: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    CO₂ Stream Purity (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={70}
                    max={99.9}
                    required
                    value={formData.co2Purity}
                    onChange={(e) => setFormData({ ...formData, co2Purity: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700, color: '#2E9E8A' }}
                  />
                </div>
              </div>

              {/* Composition parameters */}
              <div
                style={{
                  background: '#FAFAF9',
                  border: '1px solid #E5E5E2',
                  borderRadius: 6,
                  padding: '16px',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <LabelCaps style={{ fontSize: 10 }}>Laboratory Assay Impurity Levels</LabelCaps>
                  <span style={{ fontSize: 11, color: '#8A8C8A' }}>Calibrated via GC-MS ISO 14064</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      Moisture H₂O (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.moisturePpm}
                      onChange={(e) => setFormData({ ...formData, moisturePpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      Nitrogen N₂ (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.nitrogenPpm}
                      onChange={(e) => setFormData({ ...formData, nitrogenPpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      SOx (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.soxPpm}
                      onChange={(e) => setFormData({ ...formData, soxPpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      NOx (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.noxPpm}
                      onChange={(e) => setFormData({ ...formData, noxPpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F1EF', marginBottom: 28 }} />

            {/* SECTION 3: Logistics & Commercial Terms */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#0F3D2E',
                    color: '#FAFAF9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  3
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1A1D1B' }}>
                  Thermodynamic Phase & Commercial Pricing
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Physical State *
                  </label>
                  <select
                    value={formData.physicalState}
                    onChange={(e) => setFormData({ ...formData, physicalState: e.target.value as any })}
                    className="form-input"
                  >
                    <option value="Liquefied">Liquefied (Cryo Tanker)</option>
                    <option value="Gas">Pressurized Gas (Pipeline)</option>
                    <option value="Supercritical">Supercritical Fluid</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Storage Pressure (bar)
                  </label>
                  <input
                    type="number"
                    value={formData.pressureBar}
                    onChange={(e) => setFormData({ ...formData, pressureBar: Number(e.target.value) })}
                    className="form-input tabular-nums"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Spot Offer Price ($/tonne) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={formData.pricePerTonneUSD}
                    onChange={(e) => setFormData({ ...formData, pricePerTonneUSD: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700, color: '#0F3D2E' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Technical Stream Summary & Carbon Audit Baseline
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your capture system (e.g. amine solvent, direct kiln flue slipstream) and purity certification status..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/marketplace')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Publishing stream..."
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Publish Supply Stream to Exchange
              </Button>
            </div>
          </form>
        </Card>

        {/* LIVE CARD PREVIEW PANEL */}
        <div style={{ position: 'sticky', top: 24, flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <LabelCaps>Live Clearinghouse Card Preview</LabelCaps>
            <Badge variant="teal" dot pulse>Real-Time Sync</Badge>
          </div>

          <Card accentColor="#2E9E8A">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                    {formData.companyName || 'ABC Cement'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A8C8A', marginTop: 2 }}>
                    <span>{formData.city || 'Ahmedabad'}, {formData.state}</span>
                    <span>•</span>
                    <span>{formData.facilityType}</span>
                  </div>
                </div>
                <Badge variant="neutral">PREVIEW</Badge>
              </div>

              <p style={{ fontSize: 12, color: '#5A5C5A', lineHeight: 1.4, marginBottom: 14 }}>
                {formData.description || 'Post-combustion amine capture slipstream with continuous dehydration and liquefaction.'}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  background: '#FAFAF9',
                  padding: '12px',
                  borderRadius: 6,
                  border: '1px solid #E5E5E2',
                  marginBottom: 14
                }}
              >
                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Supply Vol</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                    {formData.volumeTonnes} <span style={{ fontSize: 10, color: '#8A8C8A' }}>t/mo</span>
                  </div>
                </div>

                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Purity</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#2E9E8A', marginTop: 2 }}>
                    {formData.co2Purity.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Spot Price</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#0F3D2E', marginTop: 2 }}>
                    ${formData.pricePerTonneUSD} <span style={{ fontSize: 10, color: '#8A8C8A' }}>/t</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                <Badge variant="neutral">
                  <Droplets size={11} /> {formData.physicalState} ({formData.pressureBar} bar)
                </Badge>
                <Badge variant="neutral">
                  <Gauge size={11} /> {formData.moisturePpm} ppm H₂O
                </Badge>
                <Badge variant="neutral">
                  {formData.deliveryTerms}
                </Badge>
              </div>

              <div style={{ borderTop: '1px solid #F1F1EF', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8A8C8A' }}>
                  Projected Monthly Revenue:
                </span>
                <span className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#0F3D2E' }}>
                  ${(formData.volumeTonnes * formData.pricePerTonneUSD).toLocaleString()} /mo
                </span>
              </div>
            </div>
          </Card>

          {/* Validation checklist card */}
          <Card style={{ marginTop: 16, padding: '16px' }}>
            <LabelCaps style={{ marginBottom: 10 }}>Exchange Listing Readiness</LabelCaps>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: formData.companyName ? '#0F3D2E' : '#8A8C8A' }}>
                <CheckCircle2 size={14} color={formData.companyName ? '#2E9E8A' : '#C0C0BE'} />
                <span>Entity identity & legal verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: formData.co2Purity >= 90 ? '#0F3D2E' : '#8A8C8A' }}>
                <CheckCircle2 size={14} color={formData.co2Purity >= 90 ? '#2E9E8A' : '#C0C0BE'} />
                <span>Purity satisfies minimum CCUS threshold (&gt;90.0%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: formData.volumeTonnes >= 50 ? '#0F3D2E' : '#8A8C8A' }}>
                <CheckCircle2 size={14} color={formData.volumeTonnes >= 50 ? '#2E9E8A' : '#C0C0BE'} />
                <span>Commercial batch scale (&gt;50 tonnes/month)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
