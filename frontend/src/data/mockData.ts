import { 
  SupplyListing, 
  BuyerRequirement, 
  MatchResult, 
  BidOrRequest, 
  Transaction 
} from '../types';

export const mockSupplyListings: SupplyListing[] = [
  {
    id: 'SUP-001',
    companyName: 'ABC Cement',
    facilityName: 'Ahmedabad Kiln-4 Capture Facility',
    facilityType: 'Cement Plant',
    location: 'Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    volumeTonnes: 500,
    volumeFrequency: 'Monthly',
    composition: {
      co2Purity: 96.0,
      nitrogenPpm: 28000,
      moisturePpm: 120,
      soxPpm: 15,
      noxPpm: 35,
      particulatesMgM3: 2.1
    },
    physicalState: 'Liquefied',
    pressureBar: 18.5,
    temperatureC: -22.0,
    pricePerTonneUSD: 42,
    availableFrom: '2026-10-01',
    deliveryTerms: 'Ex-Works',
    status: 'active',
    verificationLevel: 'Third-Party Verified',
    description: 'Post-combustion amine capture slipstream from precalciner kiln with continuous dehydration and liquefaction. Reliable baseline continuous output.',
    contactPerson: 'Rajesh Varma, VP Decarbonization'
  },
  {
    id: 'SUP-002',
    companyName: 'Gujarat Bio-Refinery Ltd',
    facilityName: 'Dahej Bio-Ethanol Fermentation Unit',
    facilityType: 'Bio-Refinery',
    location: 'Dahej PCPIR, Gujarat',
    city: 'Dahej',
    state: 'Gujarat',
    coordinates: { lat: 21.7125, lng: 72.5855 },
    volumeTonnes: 1200,
    volumeFrequency: 'Monthly',
    composition: {
      co2Purity: 99.2,
      nitrogenPpm: 4500,
      moisturePpm: 40,
      soxPpm: 0.5,
      noxPpm: 1.2,
      particulatesMgM3: 0.1
    },
    physicalState: 'Liquefied',
    pressureBar: 20.0,
    temperatureC: -25.0,
    pricePerTonneUSD: 55,
    availableFrom: '2026-09-20',
    deliveryTerms: 'Delivered by Seller',
    status: 'active',
    verificationLevel: 'Third-Party Verified',
    description: 'Biogenic fermentation off-gas with exceptionally high baseline purity (>99%). Certified food and chemical grade compatibility.',
    contactPerson: 'Dr. Ananya Patel, CTO'
  },
  {
    id: 'SUP-003',
    companyName: 'Surat Coastal Power & Gas',
    facilityName: 'Hazira Combined Cycle Plant',
    facilityType: 'Power Plant',
    location: 'Hazira, Surat, Gujarat',
    city: 'Surat',
    state: 'Gujarat',
    coordinates: { lat: 21.1166, lng: 72.6508 },
    volumeTonnes: 3500,
    volumeFrequency: 'Monthly',
    composition: {
      co2Purity: 91.5,
      nitrogenPpm: 68000,
      moisturePpm: 450,
      soxPpm: 45,
      noxPpm: 80,
      particulatesMgM3: 8.5
    },
    physicalState: 'Gas',
    pressureBar: 4.2,
    temperatureC: 45.0,
    pricePerTonneUSD: 28,
    availableFrom: '2026-11-01',
    deliveryTerms: 'FOB Pipeline',
    status: 'in-negotiation',
    verificationLevel: 'Self-Certified',
    description: 'High-volume gaseous flue capture stream ideally configured for adjacent industrial mineralization or pipeline off-take corridors.',
    contactPerson: 'Vikram Mehta, Operations Director'
  },
  {
    id: 'SUP-004',
    companyName: 'Jamnagar Direct Air Hub',
    facilityName: 'Saurashtra DAC Alpha 1',
    facilityType: 'Direct Air Capture',
    location: 'Jamnagar, Gujarat',
    city: 'Jamnagar',
    state: 'Gujarat',
    coordinates: { lat: 22.4707, lng: 70.0577 },
    volumeTonnes: 250,
    volumeFrequency: 'Monthly',
    composition: {
      co2Purity: 99.8,
      nitrogenPpm: 1200,
      moisturePpm: 15,
      soxPpm: 0,
      noxPpm: 0.1,
      particulatesMgM3: 0.05
    },
    physicalState: 'Supercritical',
    pressureBar: 85.0,
    temperatureC: 38.0,
    pricePerTonneUSD: 210,
    availableFrom: '2026-10-15',
    deliveryTerms: 'Ex-Works',
    status: 'active',
    verificationLevel: 'Third-Party Verified',
    description: 'Ultra-pure atmospheric carbon capture with net-negative life-cycle credits (Article 6 compliant). Premium feedstock for SAF synthesis.',
    contactPerson: 'Sunil Rao, Commercial Head'
  }
];

export const mockBuyerRequirements: BuyerRequirement[] = [
  {
    id: 'BUY-001',
    buyerName: 'GreenFuel',
    facilityName: 'Vadodara Power-to-X Synthesis Hub',
    industry: 'Synthetic Fuels',
    location: 'Vadodara, Gujarat',
    city: 'Vadodara',
    state: 'Gujarat',
    coordinates: { lat: 22.3072, lng: 73.1812 },
    volumeNeededTonnes: 300,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 95.0,
    maxMoisturePpm: 200,
    maxSoxNoxPpm: 80,
    acceptableStates: ['Liquefied', 'Gas'],
    maxDistanceKm: 180,
    targetPricePerTonneUSD: 45,
    requiredBy: '2026-10-15',
    status: 'active',
    description: 'Seeking consistent CO₂ supply to blend with electrolytic green hydrogen for synthetic aviation kerosene (e-SAF) pilot line.'
  },
  {
    id: 'BUY-002',
    buyerName: 'Ultratech Eco-Concrete',
    facilityName: 'Bharuch Mineralization Precast Works',
    industry: 'Concrete Mineralization',
    location: 'Bharuch, Gujarat',
    city: 'Bharuch',
    state: 'Gujarat',
    coordinates: { lat: 21.7051, lng: 72.9959 },
    volumeNeededTonnes: 600,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 90.0,
    maxMoisturePpm: 600,
    maxSoxNoxPpm: 150,
    acceptableStates: ['Gas', 'Liquefied'],
    maxDistanceKm: 120,
    targetPricePerTonneUSD: 35,
    requiredBy: '2026-11-01',
    status: 'active',
    description: 'CO₂ injection during concrete mixing and autoclaved block curing for permanent mineralization and cement clinker displacement.'
  },
  {
    id: 'BUY-003',
    buyerName: 'SynPolymer Advanced Materials',
    facilityName: 'Ankleshwar Specialty Resins Complex',
    industry: 'Polymers & Chemicals',
    location: 'Ankleshwar, Gujarat',
    city: 'Ankleshwar',
    state: 'Gujarat',
    coordinates: { lat: 21.6264, lng: 73.0152 },
    volumeNeededTonnes: 450,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 98.0,
    maxMoisturePpm: 80,
    maxSoxNoxPpm: 20,
    acceptableStates: ['Liquefied', 'Supercritical'],
    maxDistanceKm: 250,
    targetPricePerTonneUSD: 52,
    requiredBy: '2026-10-01',
    status: 'active',
    description: 'Polycarbonate polyol synthesis replacing 20% fossil raw material with CO₂ feedstock.'
  },
  {
    id: 'BUY-004',
    buyerName: 'AgriGreen AgroTech',
    facilityName: 'Anand High-Tech Protected Greenhouses',
    industry: 'Controlled Agriculture',
    location: 'Anand, Gujarat',
    city: 'Anand',
    state: 'Gujarat',
    coordinates: { lat: 22.5645, lng: 72.9289 },
    volumeNeededTonnes: 80,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 99.0,
    maxMoisturePpm: 50,
    maxSoxNoxPpm: 5,
    acceptableStates: ['Liquefied'],
    maxDistanceKm: 100,
    targetPricePerTonneUSD: 60,
    requiredBy: '2026-09-30',
    status: 'active',
    description: 'Enrichment of hydroponic tomato and bell pepper crop canopies to achieve 35% accelerated biomass yield.'
  }
];

export const mockMatchResults: MatchResult[] = [
  {
    id: 'MATCH-101',
    supplyListingId: 'SUP-001',
    buyerRequirementId: 'BUY-001',
    supplier: mockSupplyListings[0], // ABC Cement (Ahmedabad, 500t, 96%)
    buyer: mockBuyerRequirements[0],  // GreenFuel (Vadodara, 300t, 95%)
    breakdown: {
      purityScore: 100, // 96.0% meets and exceeds 95.0% requirement
      distanceScore: 91, // 112 km between Ahmedabad & Vadodara (corridor within 180 km max)
      volumeScore: 96,   // 500t supply easily accommodates 300t requirement (60% allocation)
      overallScore: 96,  // (100*0.4) + (91*0.3) + (96*0.3) = 40 + 27.3 + 28.8 = 96.1
      distanceKm: 112,
      estimatedTransitEmissionsKg: 1420,
      recommendedModality: 'Cryogenic Tanker Truck',
      economicRating: 'Optimal',
      compatibilityNotes: [
        'Purity exceeds specification by +1.0% (96.0% vs min 95.0%).',
        'Physical state: Liquefied CO2 matches buyer cryogenic storage tank configuration.',
        'Transit corridor: NH-48 Expressway enables < 3 hours transit with minimal boil-off loss.',
        'Price point: $42/t is within buyer target ceiling of $45/t.'
      ]
    },
    status: 'rfp_sent',
    createdAt: '2026-09-10'
  },
  {
    id: 'MATCH-102',
    supplyListingId: 'SUP-002',
    buyerRequirementId: 'BUY-003',
    supplier: mockSupplyListings[1], // Gujarat Bio-Refinery (Dahej, 1200t, 99.2%)
    buyer: mockBuyerRequirements[2],  // SynPolymer (Ankleshwar, 450t, 98%)
    breakdown: {
      purityScore: 100,
      distanceScore: 95,
      volumeScore: 92,
      overallScore: 96,
      distanceKm: 64,
      estimatedTransitEmissionsKg: 780,
      recommendedModality: 'Cryogenic Tanker Truck',
      economicRating: 'Optimal',
      compatibilityNotes: [
        'Ultra-high biogenic purity (99.2%) well above resin synthesis threshold (98.0%).',
        'Very short proximity (64 km Dahej-to-Ankleshwar industrial corridor).',
        'Moisture level is 40 ppm (well below 80 ppm maximum).'
      ]
    },
    status: 'new',
    createdAt: '2026-09-11'
  },
  {
    id: 'MATCH-103',
    supplyListingId: 'SUP-001',
    buyerRequirementId: 'BUY-002',
    supplier: mockSupplyListings[0], // ABC Cement
    buyer: mockBuyerRequirements[1],  // Ultratech Concrete (Bharuch)
    breakdown: {
      purityScore: 100,
      distanceScore: 84,
      volumeScore: 90,
      overallScore: 91,
      distanceKm: 188,
      estimatedTransitEmissionsKg: 2400,
      recommendedModality: 'Rail Feeder Tanker',
      economicRating: 'Favorable',
      compatibilityNotes: [
        'CO2 purity is more than adequate for concrete mineralization (96% vs min 90%).',
        'Direct Western Railway freight link available between Ahmedabad and Bharuch.'
      ]
    },
    status: 'new',
    createdAt: '2026-09-08'
  }
];

export const mockBids: BidOrRequest[] = [
  {
    id: 'BID-901',
    listingId: 'SUP-001',
    listingTitle: 'ABC Cement Kiln-4 Liquefied CO2 Stream',
    senderName: 'GreenFuel SynTech',
    senderRole: 'buyer',
    buyerFacility: 'Vadodara Power-to-X Synthesis Hub',
    sellerFacility: 'Ahmedabad Kiln-4 Capture Facility',
    offeredPriceUSD: 42,
    requestedVolumeTonnes: 300,
    totalOfferValueUSD: 12600,
    deliveryModality: 'Cryogenic Tanker Truck',
    proposedStartDate: '2026-10-15',
    contractDurationMonths: 12,
    specialTerms: 'Quarterly purity audit certificates compliant with ASTM D7862 standards. Bi-weekly tanker deliveries.',
    status: 'accepted',
    submittedAt: '2026-09-11 14:30'
  },
  {
    id: 'BID-902',
    listingId: 'SUP-002',
    listingTitle: 'Dahej Bio-Ethanol Biogenic CO2 Feed',
    senderName: 'SynPolymer Advanced Materials',
    senderRole: 'buyer',
    buyerFacility: 'Ankleshwar Specialty Resins Complex',
    sellerFacility: 'Dahej Bio-Ethanol Fermentation Unit',
    offeredPriceUSD: 52,
    requestedVolumeTonnes: 450,
    totalOfferValueUSD: 23400,
    deliveryModality: 'Cryogenic Tanker Truck',
    proposedStartDate: '2026-10-01',
    contractDurationMonths: 24,
    specialTerms: 'Requires certification of biogenic origin (non-fossil) for EU ETS product carbon footprint reduction.',
    status: 'under_review',
    submittedAt: '2026-09-12 09:15'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-8801',
    matchId: 'MATCH-101',
    bidId: 'BID-901',
    sellerName: 'ABC Cement',
    buyerName: 'GreenFuel',
    sellerFacility: 'Ahmedabad Kiln-4 Capture Facility',
    buyerFacility: 'Vadodara Power-to-X Synthesis Hub',
    volumeTonnes: 300,
    pricePerTonneUSD: 42,
    totalValueUSD: 12600,
    originLocation: 'Ahmedabad, Gujarat',
    destinationLocation: 'Vadodara, Gujarat',
    distanceKm: 112,
    transitModality: 'Cryogenic Tanker Truck',
    lifecycleStage: 'In Transit',
    stageProgressPercentage: 65,
    carbonAccountingCertId: 'ISO-14064-GUJ-2026-0941',
    grossEmissionsAvoidedTonnes: 300.0,
    logisticsTransitEmissionsTonnes: 1.42,
    netCarbonImpactTonnes: 298.58,
    estimatedDeliveryDate: '2026-10-18',
    updatedAt: '2026-09-12 04:45'
  }
];
