import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AlertBanner } from '../components/common/AlertBanner';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';

export const CreateSupplyListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: 'ABC Cement',
    facilityName: 'Ahmedabad Kiln-4 Capture Facility',
    facilityType: 'Cement Plant',
    city: 'Ahmedabad',
    state: 'Gujarat',
    volumeTonnes: 500,
    volumeFrequency: 'Monthly',
    co2Purity: 96.0,
    physicalState: 'Liquefied',
    pressureBar: 18.5,
    temperatureC: -22.0,
    moisturePpm: 120,
    soxPpm: 15,
    noxPpm: 35,
    pricePerTonneUSD: 42,
    deliveryTerms: 'Ex-Works',
    availableFrom: '2026-10-01',
    description: 'Post-combustion amine capture slipstream from precalciner kiln with continuous dehydration and liquefaction. Reliable baseline continuous output.'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const loadAbcTemplate = () => {
    setFormData({
      companyName: 'ABC Cement',
      facilityName: 'Ahmedabad Kiln-4 Capture Facility',
      facilityType: 'Cement Plant',
      city: 'Ahmedabad',
      state: 'Gujarat',
      volumeTonnes: 500,
      volumeFrequency: 'Monthly',
      co2Purity: 96.0,
      physicalState: 'Liquefied',
      pressureBar: 18.5,
      temperatureC: -22.0,
      moisturePpm: 120,
      soxPpm: 15,
      noxPpm: 35,
      pricePerTonneUSD: 42,
      deliveryTerms: 'Ex-Works',
      availableFrom: '2026-10-01',
      description: 'Post-combustion amine capture slipstream from precalciner kiln with continuous dehydration and liquefaction. Reliable baseline continuous output.'
    });
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.companyName.trim() || !formData.facilityName.trim() || !formData.city.trim()) {
      setErrorMessage('Please provide valid company, facility, and city details.');
      return;
    }

    if (formData.co2Purity < 80 || formData.co2Purity > 99.9) {
      setErrorMessage('CO₂ purity must be calibrated between 80.0% and 99.9% for industrial off-take standards.');
      return;
    }

    if (formData.volumeTonnes <= 0) {
      setErrorMessage('Supply volume must be greater than 0 tonnes.');
      return;
    }

    if (formData.pricePerTonneUSD <= 0) {
      setErrorMessage('Off-take unit price must be greater than $0/tonne.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 600);
  };

  return (
    <PageContainer
      title="Create CO₂ Supply Stream Listing"
      subtitle="Publish capture specifications, volumetric commitments, and physical delivery conditions to the marketplace."
      badge="Point-Source Emitter Hub"
      maxWidth="7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 cols: Interactive Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Template Preloader */}
          <div className="flex items-center justify-between glass-panel rounded-xl p-3 border-emerald-500/20 bg-slate-900/60">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Want to test quickly?
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadAbcTemplate}
              className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
            >
              Load ABC Cement Template (500t)
            </Button>
          </div>

          {errorMessage && (
            <AlertBanner
              variant="error"
              title="Listing Submission Error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}

          {success && (
            <AlertBanner
              variant="success"
              title="Stream Listing Published"
              message="Your CO₂ supply stream is now indexed in the algorithmic matching engine."
              actionLabel="View Matches"
              onAction={() => navigate('/matches')}
              onClose={() => setSuccess(false)}
            />
          )}

          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-6 border-white/10">
            
            {/* Section 1: Facility & Entity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">
                1. Facility & Enterprise Profile
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Company / Emitter Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange('facilityName', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Facility Category</label>
                  <select
                    value={formData.facilityType}
                    onChange={(e) => handleInputChange('facilityType', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Cement Plant">Cement Plant</option>
                    <option value="Bio-Refinery">Bio-Refinery</option>
                    <option value="Chemical Complex">Chemical Complex</option>
                    <option value="Power Plant">Power Plant</option>
                    <option value="Direct Air Capture">Direct Air Capture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Purity & Composition */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">
                2. Gas Composition & Physical State
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">CO₂ Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="80"
                    max="99.9"
                    required
                    value={formData.co2Purity}
                    onChange={(e) => handleInputChange('co2Purity', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Physical State</label>
                  <select
                    value={formData.physicalState}
                    onChange={(e) => handleInputChange('physicalState', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Liquefied">Liquefied Cryogenic</option>
                    <option value="Gas">Gas (Pipeline feed)</option>
                    <option value="Supercritical">Supercritical Fluid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Delivery Pressure (Bar)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.pressureBar}
                    onChange={(e) => handleInputChange('pressureBar', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Moisture (ppm)</label>
                  <input
                    type="number"
                    value={formData.moisturePpm}
                    onChange={(e) => handleInputChange('moisturePpm', Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">SOx (ppm)</label>
                  <input
                    type="number"
                    value={formData.soxPpm}
                    onChange={(e) => handleInputChange('soxPpm', Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">NOx (ppm)</label>
                  <input
                    type="number"
                    value={formData.noxPpm}
                    onChange={(e) => handleInputChange('noxPpm', Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Commercial & Volumetric Terms */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">
                3. Volumetric Capacity & Commercial Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Volume (Tonnes)</label>
                  <input
                    type="number"
                    required
                    value={formData.volumeTonnes}
                    onChange={(e) => handleInputChange('volumeTonnes', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Frequency</label>
                  <select
                    value={formData.volumeFrequency}
                    onChange={(e) => handleInputChange('volumeFrequency', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Monthly">Monthly Continuous</option>
                    <option value="Annual">Annual Commitment</option>
                    <option value="One-Time Batch">One-Time Batch</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Asking Price ($/t)</label>
                  <input
                    type="number"
                    required
                    value={formData.pricePerTonneUSD}
                    onChange={(e) => handleInputChange('pricePerTonneUSD', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Technical Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Broadcasting Stream to Marketplace..."
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Publish CO₂ Supply Listing
              </Button>
            </div>

          </form>

        </div>

        {/* Right 5 cols: Live Real-Time Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Marketplace Card Preview</span>
            </div>

            <div className="glass-panel rounded-2xl p-6 relative border-emerald-500/30 bg-slate-900/90 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">
                      {formData.companyName || 'Company Name'}
                    </h4>
                    <Badge variant="emerald" withDot>Live Preview</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formData.facilityName || 'Facility'} • {formData.facilityType}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                    ${formData.pricePerTonneUSD}
                  </span>
                  <span className="text-[11px] text-slate-400 block">/ tonne</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {formData.description || 'No description provided.'}
              </p>

              {/* Quick specs pill */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs bg-black/40 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">CO₂ Purity</span>
                  <strong className="text-emerald-400 font-mono text-sm tabular-nums">{formData.co2Purity}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                  <strong className="text-white text-sm tabular-nums">{formData.volumeTonnes.toLocaleString()} t</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">State</span>
                  <strong className="text-slate-200 text-xs">{formData.physicalState}</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{formData.city}, {formData.state}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {formData.deliveryTerms}
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 text-xs text-slate-400 space-y-2 border-white/5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Info className="h-4 w-4 text-emerald-400" />
                <span>Engine Validation Rule</span>
              </div>
              <p>
                CarbonLoop algorithms automatically compute proximity curves to nearby industrial hubs (such as Vadodara, Bharuch, and Dahej) upon stream creation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
