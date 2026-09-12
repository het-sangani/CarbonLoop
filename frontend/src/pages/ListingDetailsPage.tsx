import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/common/Badge';
import { mockSupplyListings } from '../data/mockData';
import { 
  MapPin, 
  ArrowRight, 
  FileText, 
  Truck, 
  Thermometer, 
  Gauge, 
  ArrowLeft
} from 'lucide-react';

export const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const listing = mockSupplyListings.find(l => l.id === id) || mockSupplyListings[0];

  const [destinationCity, setDestinationCity] = useState('Vadodara');
  const [calcDistance, setCalcDistance] = useState(112);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setDestinationCity(city);
    if (city === 'Vadodara') setCalcDistance(112);
    else if (city === 'Bharuch') setCalcDistance(188);
    else if (city === 'Dahej') setCalcDistance(205);
    else if (city === 'Surat') setCalcDistance(265);
    else setCalcDistance(150);
  };

  return (
    <PageContainer
      title={listing.facilityName}
      subtitle={`Verified post-combustion capture stream operated by ${listing.companyName} in ${listing.location}.`}
      badge={`Stream Spec • ${listing.id}`}
      action={
        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Market</span>
          </Link>
          <Link
            to={`/listings/${listing.id}/bid`}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 px-4 py-2 text-xs font-semibold text-slate-950 shadow-glow-emerald transition-all"
          >
            <span>Submit Off-take Bid</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Primary Summary Box */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">{listing.companyName}</h3>
                  <Badge variant="emerald">{listing.verificationLevel}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {listing.location} (Lat: {listing.coordinates.lat}, Lng: {listing.coordinates.lng})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-mono font-bold text-emerald-400">
                  ${listing.pricePerTonneUSD}
                </span>
                <span className="text-xs text-slate-400 block">/ metric tonne ({listing.deliveryTerms})</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Process Overview & Capture Technology
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Chemical Composition Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Laboratory Gas Chromatography Breakdown
              </h4>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">Compound</th>
                      <th className="px-4 py-3">Concentration</th>
                      <th className="px-4 py-3">Test Method</th>
                      <th className="px-4 py-3 text-right">Standard Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-white">Carbon Dioxide (CO₂)</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-base">{listing.composition.co2Purity}%</td>
                      <td className="px-4 py-3 text-slate-400">GC-TCD</td>
                      <td className="px-4 py-3 text-right"><Badge variant="emerald">Compliant</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Moisture Content (H₂O)</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{listing.composition.moisturePpm} ppm</td>
                      <td className="px-4 py-3 text-slate-400">Chilled Mirror Hygrometry</td>
                      <td className="px-4 py-3 text-right"><Badge variant="cyan">&lt; 200 ppm</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Nitrogen (N₂)</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{listing.composition.nitrogenPpm} ppm</td>
                      <td className="px-4 py-3 text-slate-400">Gas Chromatography</td>
                      <td className="px-4 py-3 text-right"><Badge variant="slate">Inert</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Sulfur Oxides (SOx)</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{listing.composition.soxPpm} ppm</td>
                      <td className="px-4 py-3 text-slate-400">UV Fluorescence</td>
                      <td className="px-4 py-3 text-right"><Badge variant="emerald">Ultra-Low</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Nitrogen Oxides (NOx)</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{listing.composition.noxPpm} ppm</td>
                      <td className="px-4 py-3 text-slate-400">Chemiluminescence</td>
                      <td className="px-4 py-3 text-right"><Badge variant="emerald">Ultra-Low</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Physical Thermodynamic State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  Pressure
                </div>
                <div className="text-xl font-mono font-bold text-white">{listing.pressureBar} bar</div>
                <span className="text-[11px] text-slate-400">Continuous slipstream</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  Temperature
                </div>
                <div className="text-xl font-mono font-bold text-white">{listing.temperatureC} °C</div>
                <span className="text-[11px] text-slate-400">Cryogenic storage state</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
                  <Truck className="h-4 w-4 text-teal-400" />
                  Logistics Modality
                </div>
                <div className="text-base font-semibold text-white">Road & Rail Compatible</div>
                <span className="text-[11px] text-slate-400">Dual loading racks on-site</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar (4 cols): Interactive Distance Tool & Offtake Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Action Card */}
          <div className="glass-panel rounded-2xl p-6 border-emerald-500/30 bg-slate-900/90 shadow-xl space-y-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Procurement & Contracting
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Available Volume:</span>
                <strong className="text-white">{listing.volumeTonnes} tonnes / month</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Earliest Availability:</span>
                <strong className="text-white">{listing.availableFrom}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Delivery Baseline:</span>
                <strong className="text-white">{listing.deliveryTerms}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Verification Standard:</span>
                <span className="text-emerald-400 font-semibold">ISO 14064-2</span>
              </div>
            </div>

            <Link
              to={`/listings/${listing.id}/bid`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs sm:text-sm font-semibold text-slate-950 shadow-glow-emerald hover:bg-emerald-450 transition-all"
            >
              <span>Submit Formal Off-take Bid</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Interactive Distance & Transit Calculator */}
          <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cyan-400" />
              Proximity & Corridor Estimation
            </h4>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Select Your Destination Hub:</label>
              <select
                value={destinationCity}
                onChange={handleCityChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Vadodara">Vadodara (GreenFuel SynTech) • 112 km</option>
                <option value="Bharuch">Bharuch (Ultratech Concrete) • 188 km</option>
                <option value="Dahej">Dahej PCPIR Chemical Zone • 205 km</option>
                <option value="Surat">Surat Industrial District • 265 km</option>
              </select>
            </div>

            <div className="rounded-xl bg-black/40 p-3 text-xs space-y-2 border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">Corridor Transit:</span>
                <strong className="text-white font-mono">{calcDistance} km</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Road Transit Time:</span>
                <strong className="text-white font-mono">~{Math.round(calcDistance / 45)} hours</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Transit Footprint:</span>
                <strong className="text-emerald-400 font-mono">{(calcDistance * 12.8).toFixed(0)} kg CO₂</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Corridor qualifies for NH-48 cryogenic freight line with &lt; 0.2% boil-off loss per transit leg.
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};
