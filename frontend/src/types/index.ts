export type PhysicalState = 'Gas' | 'Liquefied' | 'Supercritical';

export type UtilizationPathway = 
  | 'Synthetic Fuels' 
  | 'Concrete Mineralization' 
  | 'Polymers & Chemicals' 
  | 'Controlled Agriculture';

export type DeliveryModality = 
  | 'Cryogenic Tanker Truck' 
  | 'Dedicated Pipeline' 
  | 'Rail Feeder Tanker' 
  | 'Barge / ISO Container';

export interface GasComposition {
  co2Purity: number; // e.g. 96.0%
  nitrogenPpm: number;
  moisturePpm: number;
  soxPpm: number;
  noxPpm: number;
  particulatesMgM3: number;
}

export interface SupplyListing {
  id: string;
  companyName: string;
  facilityName: string;
  facilityType: 'Cement Plant' | 'Bio-Refinery' | 'Chemical Complex' | 'Power Plant' | 'Direct Air Capture';
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  volumeTonnes: number;
  volumeFrequency: 'Monthly' | 'Annual' | 'One-Time Batch';
  composition: GasComposition;
  physicalState: PhysicalState;
  pressureBar: number;
  temperatureC: number;
  pricePerTonneUSD: number;
  availableFrom: string;
  deliveryTerms: 'Ex-Works' | 'FOB Pipeline' | 'Delivered by Seller';
  status: 'active' | 'in-negotiation' | 'matched' | 'fulfilled';
  verificationLevel: 'Third-Party Verified' | 'Self-Certified';
  description: string;
  contactPerson: string;
}

export interface BuyerRequirement {
  id: string;
  buyerName: string;
  facilityName: string;
  industry: UtilizationPathway;
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  volumeNeededTonnes: number;
  volumeFrequency: 'Monthly' | 'Annual' | 'One-Time Batch';
  minPurityPercentage: number;
  maxMoisturePpm: number;
  maxSoxNoxPpm: number;
  acceptableStates: PhysicalState[];
  maxDistanceKm: number;
  targetPricePerTonneUSD: number;
  requiredBy: string;
  status: 'active' | 'matched' | 'contract_pending' | 'closed';
  description: string;
}

export interface MatchBreakdown {
  purityScore: number;       // 0-100 (Weight: 40%)
  distanceScore: number;     // 0-100 (Weight: 30%)
  volumeScore: number;       // 0-100 (Weight: 30%)
  overallScore: number;      // Weighted composite score (0-100)
  distanceKm: number;
  estimatedTransitEmissionsKg: number;
  recommendedModality: DeliveryModality;
  economicRating: 'Optimal' | 'Favorable' | 'Marginal';
  compatibilityNotes: string[];
}

export interface MatchResult {
  id: string;
  supplyListingId: string;
  buyerRequirementId: string;
  supplier: SupplyListing;
  buyer: BuyerRequirement;
  breakdown: MatchBreakdown;
  status: 'new' | 'rfp_sent' | 'bid_placed' | 'deal_closed';
  createdAt: string;
}

export interface BidOrRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  senderName: string;
  senderRole: 'buyer' | 'supplier';
  buyerFacility: string;
  sellerFacility: string;
  offeredPriceUSD: number;
  requestedVolumeTonnes: number;
  totalOfferValueUSD: number;
  deliveryModality: DeliveryModality;
  proposedStartDate: string;
  contractDurationMonths: number;
  specialTerms: string;
  status: 'submitted' | 'under_review' | 'counter_offered' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface Transaction {
  id: string;
  matchId: string;
  bidId: string;
  sellerName: string;
  buyerName: string;
  sellerFacility: string;
  buyerFacility: string;
  volumeTonnes: number;
  pricePerTonneUSD: number;
  totalValueUSD: number;
  originLocation: string;
  destinationLocation: string;
  distanceKm: number;
  transitModality: DeliveryModality;
  lifecycleStage: 'Term Sheet Executed' | 'Sample Testing Approved' | 'In Transit' | 'Delivered & Sequestered';
  stageProgressPercentage: number;
  carbonAccountingCertId: string;
  grossEmissionsAvoidedTonnes: number;
  logisticsTransitEmissionsTonnes: number;
  netCarbonImpactTonnes: number;
  estimatedDeliveryDate: string;
  updatedAt: string;
}
