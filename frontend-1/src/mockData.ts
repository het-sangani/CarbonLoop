export interface SupplyListing {
  id: string;
  companyName: string;
  facilityName: string;
  facilityType: string;
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  volumeTonnes: number;
  volumeFrequency: string;
  composition: {
    co2Purity: number;
    nitrogenPpm: number;
    moisturePpm: number;
    soxPpm: number;
    noxPpm: number;
    particulatesMgM3: number;
  };
  physicalState: 'Liquefied' | 'Gas' | 'Supercritical';
  pressureBar: number;
  temperatureC: number;
  pricePerTonneUSD: number;
  availableFrom: string;
  deliveryTerms: string;
  status: 'active' | 'in-negotiation' | 'fulfilled';
  verificationLevel: string;
  description: string;
  contactPerson: string;
}

export interface BuyerRequirement {
  id: string;
  buyerName: string;
  facilityName: string;
  industry: string;
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  volumeNeededTonnes: number;
  volumeFrequency: string;
  minPurityPercentage: number;
  maxMoisturePpm: number;
  maxSoxNoxPpm: number;
  acceptableStates: ('Liquefied' | 'Gas' | 'Supercritical')[];
  maxDistanceKm: number;
  targetPricePerTonneUSD: number;
  requiredBy: string;
  status: 'open' | 'evaluating' | 'contracted';
  description: string;
  contactPerson: string;
}

export interface MatchResult {
  id: string;
  supplyListingId: string;
  buyerRequirementId: string;
  supplier: SupplyListing;
  buyer: BuyerRequirement;
  breakdown: {
    overallScore: number;
    purityScore: number;
    distanceScore: number;
    volumeScore: number;
    economicRating: 'Optimal' | 'Favorable' | 'Moderate' | 'Challenging';
    distanceKm: number;
    estimatedTransitEmissionsKg: number;
    recommendedModality: string;
    compatibilityNotes: string[];
  };
}

export interface Transaction {
  id: string;
  matchId: string;
  supplierId: string;
  buyerId: string;
  sellerName: string;
  buyerName: string;
  volumeTonnes: number;
  pricePerTonneUSD: number;
  totalValueUSD: number;
  originLocation: string;
  destinationLocation: string;
  distanceKm: number;
  transitModality: string;
  lifecycleStage: 'Term Sheet Executed' | 'Purity Audit Passed' | 'In Transit (Cryo-Tanker)' | 'Custody Transferred';
  stageProgressPercentage: number;
  grossEmissionsAvoidedTonnes: number;
  logisticsTransitEmissionsTonnes: number;
  netCarbonImpactTonnes: number;
  carbonAccountingCertId: string;
  createdAt: string;
  expectedDeliveryDate: string;
}

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
    description: 'High-volume gaseous flue capture stream configured for industrial mineralization or pipeline off-take corridors.',
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
    pricePerTonneUSD: 110,
    availableFrom: '2026-12-01',
    deliveryTerms: 'Ex-Works Tanker',
    status: 'active',
    verificationLevel: 'Gold Standard DAC',
    description: 'Direct air capture atmospheric stream with ultra-high permanence and verified negative-carbon lifecycle stamp.',
    contactPerson: 'Siddharth Dave, Lead Engineer'
  }
];

export const mockBuyerRequirements: BuyerRequirement[] = [
  {
    id: 'BUY-001',
    buyerName: 'GreenFuel',
    facilityName: 'Vadodara Power-to-X Synthesis Hub',
    industry: 'Synthetic Fuels (e-SAF)',
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
    status: 'open',
    description: 'Seeking consistent CO₂ supply to blend with electrolytic green hydrogen for synthetic aviation kerosene (e-SAF) pilot line.',
    contactPerson: 'Meera Krishnan, Procurement Lead'
  },
  {
    id: 'BUY-002',
    buyerName: 'Ultratech Eco-Concrete',
    facilityName: 'Bharuch Precast Mineralization Yard',
    industry: 'Concrete Mineralization',
    location: 'Bharuch, Gujarat',
    city: 'Bharuch',
    state: 'Gujarat',
    coordinates: { lat: 21.7051, lng: 72.9959 },
    volumeNeededTonnes: 450,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 90.0,
    maxMoisturePpm: 500,
    maxSoxNoxPpm: 120,
    acceptableStates: ['Liquefied', 'Gas'],
    maxDistanceKm: 220,
    targetPricePerTonneUSD: 35,
    requiredBy: '2026-10-01',
    status: 'open',
    description: 'Direct injection into carbon curing autoclaves for low-carbon green slag cement blocks and precast railway sleepers.',
    contactPerson: 'Karan Singhal, VP Materials'
  },
  {
    id: 'BUY-003',
    buyerName: 'SynPolymer Advanced Materials',
    facilityName: 'Dahej Specialty Polyol Facility',
    industry: 'Polymers & Chemicals',
    location: 'Dahej PCPIR, Gujarat',
    city: 'Dahej',
    state: 'Gujarat',
    coordinates: { lat: 21.7125, lng: 72.5855 },
    volumeNeededTonnes: 800,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 98.5,
    maxMoisturePpm: 50,
    maxSoxNoxPpm: 10,
    acceptableStates: ['Liquefied', 'Supercritical'],
    maxDistanceKm: 150,
    targetPricePerTonneUSD: 60,
    requiredBy: '2026-11-15',
    status: 'evaluating',
    description: 'Catalytic incorporation of CO₂ into polyurethane polyols and polycarbonates. Demands low moisture and ultra-low sulfur levels.',
    contactPerson: 'Elena Rostova, Chief Chemical Architect'
  },
  {
    id: 'BUY-004',
    buyerName: 'Gujarat AgriBio Greenhouse Hub',
    facilityName: 'Kheda Controlled Environment Farm',
    industry: 'Controlled Agriculture',
    location: 'Kheda, Gujarat',
    city: 'Kheda',
    state: 'Gujarat',
    coordinates: { lat: 22.7533, lng: 72.6841 },
    volumeNeededTonnes: 120,
    volumeFrequency: 'Monthly',
    minPurityPercentage: 99.5,
    maxMoisturePpm: 50,
    maxSoxNoxPpm: 2,
    acceptableStates: ['Liquefied'],
    maxDistanceKm: 90,
    targetPricePerTonneUSD: 65,
    requiredBy: '2026-09-30',
    status: 'open',
    description: 'Food-grade certified CO₂ for closed-loop tomato and berry crop yield acceleration. Requires zero toxic combustion byproduct.',
    contactPerson: 'Nitin Shah, Agro-Tech Director'
  }
];

export const mockMatchResults: MatchResult[] = [
  {
    id: 'MATCH-101',
    supplyListingId: 'SUP-001',
    buyerRequirementId: 'BUY-001',
    supplier: mockSupplyListings[0], // ABC Cement
    buyer: mockBuyerRequirements[0],  // GreenFuel
    breakdown: {
      overallScore: 96,
      purityScore: 100,
      distanceScore: 91,
      volumeScore: 96,
      economicRating: 'Optimal',
      distanceKm: 112,
      estimatedTransitEmissionsKg: 1420,
      recommendedModality: 'Cryogenic Tanker Truck (Road)',
      compatibilityNotes: [
        'ABC Cement 96.0% purity exceeds GreenFuel minimum requirement (95.0%).',
        'Direct 112 km route via NH-48 Express highway enables roundtrip delivery within 5 hours.',
        'ABC Cement 500t supply easily accommodates GreenFuel 300t off-take tender.',
        'Moisture content (120 ppm) is well within GreenFuel allowable ceiling (200 ppm).'
      ]
    }
  },
  {
    id: 'MATCH-102',
    supplyListingId: 'SUP-002',
    buyerRequirementId: 'BUY-003',
    supplier: mockSupplyListings[1],
    buyer: mockBuyerRequirements[2],
    breakdown: {
      overallScore: 96,
      purityScore: 99,
      distanceScore: 98,
      volumeScore: 92,
      economicRating: 'Optimal',
      distanceKm: 14,
      estimatedTransitEmissionsKg: 180,
      recommendedModality: 'Inter-complex Pipeline Feed',
      compatibilityNotes: [
        'Co-located in Dahej PCPIR industrial zone (14 km).',
        'Biogenic 99.2% purity meets polymer synthesis spec without additional polishing.',
        'High economic synergy with shared local corridor pipeline utility.'
      ]
    }
  },
  {
    id: 'MATCH-103',
    supplyListingId: 'SUP-001',
    buyerRequirementId: 'BUY-002',
    supplier: mockSupplyListings[0],
    buyer: mockBuyerRequirements[1],
    breakdown: {
      overallScore: 91,
      purityScore: 100,
      distanceScore: 82,
      volumeScore: 90,
      economicRating: 'Favorable',
      distanceKm: 188,
      estimatedTransitEmissionsKg: 2410,
      recommendedModality: 'Cryogenic Tanker Truck (Road)',
      compatibilityNotes: [
        'Flue capture purity (96.0%) easily satisfies concrete curing requirements (90.0%).',
        'Distance of 188 km remains within buyer maximum perimeter (220 km).',
        'Potential for long-term bilateral rail feeder tanker contract.'
      ]
    }
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-8801',
    matchId: 'MATCH-101',
    supplierId: 'SUP-001',
    buyerId: 'BUY-001',
    sellerName: 'ABC Cement Ltd',
    buyerName: 'GreenFuel SynTech Ltd',
    volumeTonnes: 300,
    pricePerTonneUSD: 42,
    totalValueUSD: 12600,
    originLocation: 'Ahmedabad Kiln-4, Gujarat',
    destinationLocation: 'Vadodara Hub, Gujarat',
    distanceKm: 112,
    transitModality: 'Cryogenic Tanker Truck',
    lifecycleStage: 'In Transit (Cryo-Tanker)',
    stageProgressPercentage: 65,
    grossEmissionsAvoidedTonnes: 300,
    logisticsTransitEmissionsTonnes: 1.42,
    netCarbonImpactTonnes: 298.58,
    carbonAccountingCertId: 'ISO-14064-GUJ-8801',
    createdAt: '2026-09-11 15:40',
    expectedDeliveryDate: '2026-09-12 18:30'
  }
];
