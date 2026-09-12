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

export const CreateBuyerRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    buyerName: 'GreenFuel',
    facilityName: 'Vadodara Power-to-X Synthesis Hub',
    industry: 'Synthetic Fuels',
    city: 'Vadodara',
    state: 'Gujarat',
    volumeNeededTonnes: 300,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 95.0,
    maxMoisturePpm: 200,
    maxSoxNoxPpm: 80,
    acceptableStates: ['Liquefied', 'Gas'],
    maxDistanceKm: 180,
    targetPricePerTonneUSD: 45,
    requiredBy: '2026-10-15',
    description: 'Seeking consistent CO₂ supply to blend with electrolytic green hydrogen for synthetic aviation kerosene (e-SAF) pilot line.'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleStateToggle = (stateVal: string) => {
    setFormData(prev => {
      const exists = prev.acceptableStates.includes(stateVal);
      const updated = exists 
        ? prev.acceptableStates.filter(s => s !== stateVal)
        : [...prev.acceptableStates, stateVal];
      return { ...prev, acceptableStates: updated };
    });
    if (errorMessage) setErrorMessage(null);
  };

  const loadGreenFuelTemplate = () => {
    setFormData({
      buyerName: 'GreenFuel',
      facilityName: 'Vadodara Power-to-X Synthesis Hub',
      industry: 'Synthetic Fuels',
      city: 'Vadodara',
      state: 'Gujarat',
      volumeNeededTonnes: 300,
      volumeFrequency: 'Monthly',
      minPurityPercentage: 95.0,
      maxMoisturePpm: 200,
      maxSoxNoxPpm: 80,
      acceptableStates: ['Liquefied', 'Gas'],
      maxDistanceKm: 180,
      targetPricePerTonneUSD: 45,
      requiredBy: '2026-10-15',
      description: 'Seeking consistent CO₂ supply to blend with electrolytic green hydrogen for synthetic aviation kerosene (e-SAF) pilot line.'
    });
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.buyerName.trim() || !formData.facilityName.trim() || !formData.city.trim()) {
      setErrorMessage('Please provide valid company, facility hub, and city information.');
      return;
    }

    if (formData.volumeNeededTonnes <= 0) {
      setErrorMessage('Off-take intake volume must be greater than 0 tonnes.');
      return;
    }

    if (formData.targetPricePerTonneUSD <= 0) {
      setErrorMessage('Target ceiling budget must be greater than $0/tonne.');
      return;
    }

    if (formData.minPurityPercentage < 85 || formData.minPurityPercentage > 99.9) {
      setErrorMessage('Minimum acceptable purity must be between 85.0% and 99.9%.');
      return;
    }

    if (formData.acceptableStates.length === 0) {
      setErrorMessage('Please select at least one acceptable physical delivery state.');
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
      title="Post Industrial CO₂ Feedstock Requirement"
      subtitle="Define quality tolerances, intake requirements, and transport limits to trigger automated emitter matchmaking."
      badge="Off-taker Procurement Hub"
      maxWidth="7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 cols: Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Template Preloader */}
          <div className="flex items-center justify-between glass-panel rounded-xl p-3 border-cyan-500/20 bg-slate-900/60">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Testing as GreenFuel buyer?
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadGreenFuelTemplate}
              className="text-xs text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
            >
              Load GreenFuel Template (300t)
            </Button>
          </div>

          {errorMessage && (
            <AlertBanner
              variant="error"
              title="Requirement Submission Error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}

          {success && (
            <AlertBanner
              variant="success"
              title="Requirement Registered Successfully"
              message="3 compatible industrial capture feeds discovered in Western industrial corridor."
              actionLabel="Review Matches"
              onAction={() => navigate('/matches')}
              onClose={() => setSuccess(false)}
            />
          )}

          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-6 border-white/10">
            
            {/* Section 1: Entity & Industry */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
                1. Off-taker Profile & Pathway
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Company / Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.buyerName}
                    onChange={(e) => handleInputChange('buyerName', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Synthesis / Processing Hub</label>
                  <input
                    type="text"
                    required
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange('facilityName', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Utilization Pathway</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Synthetic Fuels">Synthetic Fuels (e-SAF)</option>
                    <option value="Concrete Mineralization">Concrete Mineralization</option>
                    <option value="Polymers & Chemicals">Polymers & Chemicals</option>
                    <option value="Controlled Agriculture">Controlled Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">State / Region</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Purity & Tolerances */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
                2. Intake Purity & Physical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Min Acceptable Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="85"
                    max="99.9"
                    required
                    value={formData.minPurityPercentage}
                    onChange={(e) => handleInputChange('minPurityPercentage', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-cyan-400 font-bold font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Max Moisture (ppm)</label>
                  <input
                    type="number"
                    value={formData.maxMoisturePpm}
                    onChange={(e) => handleInputChange('maxMoisturePpm', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Max SOx/NOx (ppm)</label>
                  <input
                    type="number"
                    value={formData.maxSoxNoxPpm}
                    onChange={(e) => handleInputChange('maxSoxNoxPpm', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Acceptable Physical Delivery States</label>
                <div className="flex flex-wrap gap-2">
                  {['Liquefied', 'Gas', 'Supercritical'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStateToggle(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        formData.acceptableStates.includes(st)
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Commercial & Logistics Boundaries */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
                3. Volumetric Demand & Transit Constraints
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Volume Needed (Tonnes)</label>
                  <input
                    type="number"
                    required
                    value={formData.volumeNeededTonnes}
                    onChange={(e) => handleInputChange('volumeNeededTonnes', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Max Transit Radius (km)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxDistanceKm}
                    onChange={(e) => handleInputChange('maxDistanceKm', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Ceiling Price ($/t)</label>
                  <input
                    type="number"
                    required
                    value={formData.targetPricePerTonneUSD}
                    onChange={(e) => handleInputChange('targetPricePerTonneUSD', Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Demand Description & Quality Context</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Querying Emitter Match Engine..."
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
                className="bg-cyan-500 hover:bg-cyan-450 shadow-glow-cyan text-slate-950"
              >
                Post Requirement & Compute Matches
              </Button>
            </div>

          </form>

        </div>

        {/* Right 5 cols: Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Real-Time Buyer Demand Card Preview</span>
            </div>

            <div className="glass-panel rounded-2xl p-6 relative border-cyan-500/30 bg-slate-900/90 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">
                      {formData.buyerName || 'Buyer Enterprise'}
                    </h4>
                    <Badge variant="cyan" withDot>{formData.industry}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formData.facilityName || 'Facility Hub'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                    ${formData.targetPricePerTonneUSD}
                  </span>
                  <span className="text-[11px] text-slate-400 block">target budget</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {formData.description || 'No description provided.'}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs bg-black/40 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Min Purity</span>
                  <strong className="text-cyan-400 font-mono text-sm tabular-nums">&gt; {formData.minPurityPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Intake</span>
                  <strong className="text-white text-sm tabular-nums">{formData.volumeNeededTonnes.toLocaleString()} t</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Radius</span>
                  <strong className="text-slate-200 text-xs tabular-nums">&lt; {formData.maxDistanceKm} km</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{formData.city}, {formData.state}</span>
                </div>
                <span className="text-[11px] text-slate-300">
                  States: {formData.acceptableStates.join(', ')}
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 text-xs text-slate-400 space-y-2 border-white/5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Info className="h-4 w-4 text-cyan-400" />
                <span>Weighted Matching Insight</span>
              </div>
              <p>
                By setting minimum purity to 95.0%, your tender automatically qualifies for post-combustion capture streams such as ABC Cement in Ahmedabad (96.0% purity, 112 km away).
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
