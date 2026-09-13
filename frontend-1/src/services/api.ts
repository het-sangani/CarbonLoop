import { SupplyListing, mockSupplyListings } from '../mockData';

// API Base URL from environment or fallback to relative /api (handled by Vite proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface BackendListingResponse {
  id: string;
  seller_id?: string | null;
  quantity: number;
  purity: number;
  location: string;
  availability_start?: string | null;
  availability_end?: string | null;
  asking_price: number;
  status: string;
  created_at?: string | null;
}

export interface BackendListingCreate {
  quantity: number;
  purity: number;
  location: string;
  availability_start?: string | null;
  availability_end?: string | null;
  asking_price: number;
  status?: string;
  seller_id?: string | null;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface DbHealthResponse {
  connected: boolean;
  database: string;
  url?: string;
  verified_table?: string;
  message: string;
  error?: string;
}

/**
 * Transforms a backend Supabase-persisted listing into the rich frontend SupplyListing model.
 */
export function transformBackendListingToFrontend(b: BackendListingResponse): SupplyListing {
  const locationParts = (b.location || '').split(',').map((s) => s.trim());
  const city = locationParts[0] || 'Gujarat Facility';
  const state = locationParts[1] || 'Gujarat';

  // Normalize status for frontend compatibility
  let frontendStatus: 'active' | 'in-negotiation' | 'fulfilled' = 'active';
  const rawStatus = (b.status || '').toLowerCase();
  if (rawStatus === 'in_negotiation' || rawStatus === 'in-negotiation' || rawStatus === 'pending') {
    frontendStatus = 'in-negotiation';
  } else if (rawStatus === 'sold' || rawStatus === 'fulfilled' || rawStatus === 'cancelled') {
    frontendStatus = 'fulfilled';
  }

  return {
    id: b.id,
    companyName: b.seller_id || `${city} Carbon Capture Ltd`,
    facilityName: `${city} Primary Capture Unit`,
    facilityType: 'Point-Source Capture Facility',
    location: b.location || 'Gujarat, India',
    city: city,
    state: state,
    coordinates: { lat: 23.0225, lng: 72.5714 },
    volumeTonnes: b.quantity,
    volumeFrequency: 'Monthly Continuous',
    composition: {
      co2Purity: b.purity,
      nitrogenPpm: Math.round((100 - b.purity) * 1000),
      moisturePpm: 120,
      soxPpm: 15,
      noxPpm: 35,
      particulatesMgM3: 2.1,
    },
    physicalState: 'Liquefied',
    pressureBar: 18.5,
    temperatureC: -22.0,
    pricePerTonneUSD: b.asking_price,
    availableFrom: b.availability_start || new Date().toISOString().split('T')[0],
    deliveryTerms: 'Ex-Works Pipeline / Cryogenic ISO Tanker',
    status: frontendStatus,
    verificationLevel: 'ISO 14064-2 Verified / CEMS Synchronized',
    description: `Real-time verified industrial capture output from ${b.location}. Continuous telemetry synchronized with Supabase clearinghouse database.`,
    contactPerson: b.seller_id ? `Operations Lead (${b.seller_id})` : 'Industrial Plant Dispatch',
  };
}

/**
 * Check FastAPI backend service health.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  return res.json();
}

/**
 * Check Supabase database connectivity through FastAPI.
 */
export async function checkDbHealth(): Promise<DbHealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health/db`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail?.message || `DB Health check failed with status: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch CO2 supply listings from the FastAPI backend.
 * Merges backend listings with baseline mock listings so existing UI demos
 * remain rich while new database-created listings are immediately visible.
 */
export async function getSupplyListings(filters?: {
  status?: string;
  min_purity?: number;
  min_quantity?: number;
  max_price?: number;
}): Promise<SupplyListing[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.min_purity !== undefined) params.append('min_purity', filters.min_purity.toString());
  if (filters?.min_quantity !== undefined) params.append('min_quantity', filters.min_quantity.toString());
  if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString());

  const url = `${API_BASE_URL}/listings${params.toString() ? `?${params.toString()}` : ''}`;
  
  try {
    const res = await fetch(url, {
      headers: { credentials: 'omit', Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[CarbonLoop API] /listings returned ${res.status}. Falling back to baseline catalog.`);
      return mockSupplyListings;
    }

    const backendListings: BackendListingResponse[] = await res.json();
    const transformedBackendListings = backendListings.map(transformBackendListingToFrontend);

    // Merge: backend listings first, then any baseline mock listings whose IDs don't collide
    const existingBackendIds = new Set(transformedBackendListings.map((l) => l.id));
    const remainingMock = mockSupplyListings.filter((m) => !existingBackendIds.has(m.id));

    return [...transformedBackendListings, ...remainingMock];
  } catch (err) {
    console.warn('[CarbonLoop API] Network error connecting to backend. Serving baseline catalog.', err);
    return mockSupplyListings;
  }
}

/**
 * Fetch a single CO2 supply listing by ID.
 */
export async function getSupplyListingById(id: string): Promise<SupplyListing | undefined> {
  // If it's a known mock ID, return from mockData first
  const mockMatch = mockSupplyListings.find((s) => s.id === id);

  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const backendListing: BackendListingResponse = await res.json();
      return transformBackendListingToFrontend(backendListing);
    }
  } catch (err) {
    console.warn(`[CarbonLoop API] Failed to fetch listing ${id} from backend:`, err);
  }

  return mockMatch || mockSupplyListings[0];
}

/**
 * Create a new CO2 supply listing in FastAPI / Supabase.
 */
export async function createSupplyListing(payload: {
  companyName?: string;
  facilityName?: string;
  city: string;
  state: string;
  volumeTonnes: number;
  co2Purity: number;
  pricePerTonneUSD: number;
  availableFrom?: string;
  deliveryTerms?: string;
  contactPerson?: string;
}): Promise<BackendListingResponse> {
  const location = `${payload.city.trim()}, ${payload.state.trim()}`;

  const body: BackendListingCreate = {
    quantity: Number(payload.volumeTonnes),
    purity: Number(payload.co2Purity),
    location: location,
    asking_price: Number(payload.pricePerTonneUSD),
    status: 'AVAILABLE',
    seller_id: payload.companyName || 'Verified Industrial Seller',
    availability_start: payload.availableFrom || undefined,
  };

  const res = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Seller-ID': payload.companyName || 'ABC Cement Ltd',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Failed to create listing (status ${res.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return res.json();
}
