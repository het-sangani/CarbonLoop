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
  Gauge,
  Compass
} from 'lucide-react';

import { carbonLoopApi } from '../services/api';

export default function CreateBuyerRequirementPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    buyerName: '',
    facilityName: '',
    industry: 'Synthetic Fuels (e-SAF)',
    city: '',
    state: 'Gujarat',
    volumeNeededTonnes: 300,
    volumeFrequency: 'Monthly Continuous',
    minPurityPercentage: 95.0,
    maxMoisturePpm: 200,
    maxSoxNoxPpm: 80,
    acceptableStates: ['Liquefied', 'Gas'],
    maxDistanceKm: 180,
    targetPricePerTonneUSD: 45,
    requiredBy: '2026-10-15',
    description: '',
    contactPerson: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [createdRequirementId, setCreatedRequirementId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Template: GreenFuel
  const loadGreenFuelTemplate = () => {
    setFormData({
      buyerName: 'GreenFuel',
      facilityName: 'Vadodara Power-to-X Synthesis Hub',
      industry: 'Synthetic Fuels (e-SAF)',
      city: 'Vadodara',
      state: 'Gujarat',
      volumeNeededTonnes: 300,
      volumeFrequency: 'Monthly Continuous',
      minPurityPercentage: 95.0,
      maxMoisturePpm: 200,
      maxSoxNoxPpm: 80,
      acceptableStates: ['Liquefied', 'Gas'],
      maxDistanceKm: 180,
      targetPricePerTonneUSD: 45,
      requiredBy: '2026-10-15',
      description: 'Catalytic synthesis of sustainable aviation fuels (e-SAF) combined with renewable hydrogen from 50MW alkaline electrolyzers.',
      contactPerson: 'Meera Krishnan, VP Carbon Sourcing'
    });
    setErrorMessage(null);
  };

  const handleStateToggle = (stateName: string) => {
    if (formData.acceptableStates.includes(stateName)) {
      if (formData.acceptableStates.length > 1) {
        setFormData({
          ...formData,
          acceptableStates: formData.acceptableStates.filter((s) => s !== stateName)
        });
      }
    } else {
      setFormData({
        ...formData,
        acceptableStates: [...formData.acceptableStates, stateName]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!formData.volumeNeededTonnes || formData.volumeNeededTonnes <= 0) {
      setErrorMessage('Please specify a valid monthly demand volume greater than 0 tonnes.');
      return;
    }
    if (formData.minPurityPercentage < 50 || formData.minPurityPercentage > 100) {
      setErrorMessage('Minimum chemical purity requirement must be between 50.0% and 100.0%.');
      return;
    }
    if (formData.targetPricePerTonneUSD < 0) {
      setErrorMessage('Target price per tonne cannot be negative.');
      return;
    }

    const cityLoc = formData.city.trim() || 'Vadodara';
    const loc = `${cityLoc}, ${formData.state || 'Gujarat'}`;

    setIsSubmitting(true);
    try {
      const res = await carbonLoopApi.createRequirement({
        min_purity: Number(formData.minPurityPercentage),
        required_quantity: Number(formData.volumeNeededTonnes),
        delivery_location: loc,
        max_budget: Number(formData.targetPricePerTonneUSD),
        required_date: formData.requiredBy ? `${formData.requiredBy}T00:00:00Z` : null,
      });

      setCreatedRequirementId(res.id);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to create buyer requirement:', err);
      setErrorMessage(err.message || 'Failed to register requirement with the backend API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <PageHeader
        badge="Off-Take Tender • Industrial Demand"
        title="Register Buyer CO₂ Requirement"
        subtitle="Specify required capture volume, minimum acceptable chemical purity, and logistical perimeter to trigger algorithmic supplier matching."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} color="#2E9E8A" />}
            onClick={loadGreenFuelTemplate}
          >
            ⚡ Load GreenFuel Benchmark Template
          </Button>
        }
      />

      {errorMessage && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="danger"
            title="Registration Error"
            message={errorMessage}
            actionLabel="Dismiss"
            onAction={() => setErrorMessage(null)}
          />
        </div>
      )}

      {submitted && (
        <div style={{ marginBottom: 24 }}>
          <AlertBanner
            variant="success"
            title="Tender Published Successfully!"
            message={`Your requirement #${createdRequirementId ? createdRequirementId.slice(0, 8) : ''} for ${formData.buyerName || 'GreenFuel'} (${formData.volumeNeededTonnes} tonnes/mo at min ${formData.minPurityPercentage}% purity in ${formData.city || 'Vadodara'}) is now registered.`}
            actionLabel="Run Live Match Engine"
            onAction={() => navigate(createdRequirementId ? `/matches/${createdRequirementId}` : '/matches')}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, alignItems: 'start' }}>
        {/* FORM CONTAINER */}
        <Card style={{ padding: '28px', flex: '1.4' }}>
          <form onSubmit={handleSubmit}>
            {/* SECTION 1: Buyer Profile */}
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
                  Buyer Off-Taker Profile
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Buyer Company / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GreenFuel"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Industry Sector
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="form-input"
                  >
                    <option value="Synthetic Fuels (e-SAF)">Synthetic Fuels (e-SAF / Power-to-X)</option>
                    <option value="Concrete Mineralization">Concrete & Slag Mineralization</option>
                    <option value="Polymers & Chemicals">Polymers & Fine Chemicals</option>
                    <option value="Controlled Agriculture">Controlled Greenhouses & AgriBio</option>
                    <option value="Industrial Gases">Industrial Merchant Liquefaction</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Off-take Hub / Plant Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vadodara Power-to-X Synthesis Hub"
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
                    placeholder="e.g. Vadodara"
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

            {/* SECTION 2: Off-take Volume & Purity Ceiling */}
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
                  Demand Volume & Minimum Chemical Specification
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Monthly Volume Required (Tonnes) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.volumeNeededTonnes}
                    onChange={(e) => setFormData({ ...formData, volumeNeededTonnes: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Minimum CO₂ Purity Floor (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={70}
                    max={99.9}
                    required
                    value={formData.minPurityPercentage}
                    onChange={(e) => setFormData({ ...formData, minPurityPercentage: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700, color: '#2E9E8A' }}
                  />
                </div>
              </div>

              {/* Contaminant Thresholds */}
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
                  <LabelCaps style={{ fontSize: 10 }}>Max Contaminant Tolerances</LabelCaps>
                  <span style={{ fontSize: 11, color: '#8A8C8A' }}>Strict catalyst guard conditions</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      Max H₂O Moisture (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.maxMoisturePpm}
                      onChange={(e) => setFormData({ ...formData, maxMoisturePpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#5A5C5A', display: 'block', marginBottom: 4 }}>
                      Max SOx + NOx combined (ppm)
                    </label>
                    <input
                      type="number"
                      value={formData.maxSoxNoxPpm}
                      onChange={(e) => setFormData({ ...formData, maxSoxNoxPpm: Number(e.target.value) })}
                      className="form-input tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Acceptable States */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Acceptable Feedstock Delivery Phases:
                </label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Liquefied', 'Gas', 'Supercritical'].map((phase) => {
                    const isChecked = formData.acceptableStates.includes(phase);
                    return (
                      <label
                        key={phase}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: isChecked ? '1px solid #2E9E8A' : '1px solid #E5E5E2',
                          background: isChecked ? 'rgba(46,158,138,0.10)' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: 12,
                          transition: 'all 120ms ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStateToggle(phase)}
                          style={{ accentColor: '#2E9E8A' }}
                        />
                        <span style={{ fontWeight: isChecked ? 700 : 400, color: isChecked ? '#0F3D2E' : '#5A5C5A' }}>{phase}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F1EF', marginBottom: 28 }} />

            {/* SECTION 3: Logistics & Commercial Ceiling */}
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
                  Logistical Radius & Target Budget
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Max Sourcing Distance (km) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={formData.maxDistanceKm}
                    onChange={(e) => setFormData({ ...formData, maxDistanceKm: Number(e.target.value) })}
                    className="form-input tabular-nums"
                  />
                  <span style={{ fontSize: 11, color: '#8A8C8A', marginTop: 4, display: 'block' }}>
                    Covers Ahmedabad, Dahej, Bharuch, and Vadodara corridors.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Target Ceiling Price ($/tonne) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={formData.targetPricePerTonneUSD}
                    onChange={(e) => setFormData({ ...formData, targetPricePerTonneUSD: Number(e.target.value) })}
                    className="form-input tabular-nums"
                    style={{ fontWeight: 700, color: '#0F3D2E' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Project Description & Off-Take Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail your utilization process, planned off-take schedule, and certifications..."
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
                loadingText="Registering tender..."
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Publish Tender to Exchange
              </Button>
            </div>
          </form>
        </Card>

        {/* LIVE BUYER DEMAND PREVIEW */}
        <div style={{ position: 'sticky', top: 24, flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <LabelCaps>Live Demand Card Preview</LabelCaps>
            <Badge variant="teal" dot pulse>Tender Simulation</Badge>
          </div>

          <Card accentColor="#0F3D2E">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B' }}>
                    {formData.buyerName || 'GreenFuel'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A8C8A', marginTop: 2 }}>
                    <span>{formData.city || 'Vadodara'}, {formData.state}</span>
                    <span>•</span>
                    <span>{formData.industry}</span>
                  </div>
                </div>
                <Badge variant="neutral">TENDER</Badge>
              </div>

              <p style={{ fontSize: 12, color: '#5A5C5A', lineHeight: 1.4, marginBottom: 14 }}>
                {formData.description || 'Power-to-X synthesis tender seeking low-impurity liquefied carbon stream.'}
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
                  <LabelCaps style={{ fontSize: 9 }}>Required</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                    {formData.volumeNeededTonnes} <span style={{ fontSize: 10, color: '#8A8C8A' }}>t/mo</span>
                  </div>
                </div>

                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Min Purity</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#2E9E8A', marginTop: 2 }}>
                    &ge; {formData.minPurityPercentage}%
                  </div>
                </div>

                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Ceiling Bid</LabelCaps>
                  <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#0F3D2E', marginTop: 2 }}>
                    ${formData.targetPricePerTonneUSD} <span style={{ fontSize: 10, color: '#8A8C8A' }}>/t</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                <Badge variant="neutral">
                  <Compass size={11} /> Max {formData.maxDistanceKm} km
                </Badge>
                <Badge variant="neutral">
                  <Gauge size={11} /> &lt;{formData.maxMoisturePpm} ppm H₂O
                </Badge>
                {formData.acceptableStates.map((st) => (
                  <Badge key={st} variant="neutral">{st}</Badge>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #F1F1EF', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8A8C8A' }}>
                  Monthly Budget Allocation:
                </span>
                <span className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#0F3D2E' }}>
                  ${(formData.volumeNeededTonnes * formData.targetPricePerTonneUSD).toLocaleString()} /mo
                </span>
              </div>
            </div>
          </Card>

          {/* Sourcing compatibility hint */}
          <Card style={{ marginTop: 16, padding: '16px' }}>
            <LabelCaps style={{ marginBottom: 8 }}>Estimated Match Availability</LabelCaps>
            <div style={{ fontSize: 12, color: '#5A5C5A', lineHeight: 1.5 }}>
              Based on Gujarat industrial registry, <strong>3 supplier nodes</strong> (including ABC Cement in Ahmedabad @ 112 km) satisfy your &ge;{formData.minPurityPercentage}% purity ceiling.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
