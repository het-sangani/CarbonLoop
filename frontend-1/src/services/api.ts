import { getAuthBearerToken } from './supabase';

// FastAPI Base URL configured via environment variable (fallback to local dev port 8008)
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8008/api'
).replace(/\/+$/, '');

/**
 * Standard API error wrapper
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Low-level HTTP client with automatic Bearer token injection and error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject user Bearer token if not already explicitly provided
  if (!headers.has('Authorization')) {
    const token = await getAuthBearerToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new ApiError(
      `Network connection to backend server failed (${url}). Please ensure the FastAPI backend is running.`,
      0,
      err
    );
  }

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected API error occurred';
    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.detail === 'string') {
        errorMsg = responseData.detail;
      } else if (Array.isArray(responseData.detail)) {
        errorMsg = responseData.detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
      } else if (responseData.message) {
        errorMsg = responseData.message;
      }
    } else if (typeof responseData === 'string' && responseData.length < 200) {
      errorMsg = responseData;
    }
    throw new ApiError(errorMsg, response.status, responseData);
  }

  return responseData as T;
}

// ---------------------------------------------------------------------------
// DATA SCHEMAS & TYPES
// ---------------------------------------------------------------------------

export interface ApiListing {
  id: string;
  seller_id?: string;
  quantity: number;
  purity: number;
  location: string;
  availability_start?: string | null;
  availability_end?: string | null;
  asking_price: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiRequirement {
  id: string;
  buyer_id?: string;
  min_purity: number;
  required_quantity: number;
  delivery_location: string;
  max_budget?: number | null;
  required_date?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiLogisticsEstimate {
  distance_km: number;
  is_fallback_distance: boolean;
  quantity_tonnes: number;
  price_per_tonne: number;
  trips_required: number;
  co2_purchase_cost: number;
  transport_estimated_cost: number;
  total_estimated_cost: number;
  cost_per_tonne: number;
  transit_emissions_kg: number;
  disclaimer: string;
}

export interface ApiMatchItem {
  id: string;
  listing_id: string;
  requirement_id: string;
  listing: ApiListing;
  match_score: number;
  purity_score: number;
  quantity_score: number;
  location_score: number;
  availability_score: number;
  price_score: number;
  distance_km?: number | null;
  explanation: string;
  explanation_points?: string[];
  logistics?: ApiLogisticsEstimate | null;
  created_at?: string;
}

export interface ApiMatchList {
  requirement_id: string;
  total_matches: number;
  matches: ApiMatchItem[];
}

export interface ApiSupplyRequest {
  id: string;
  match_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  offered_price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at?: string;
}

export interface ApiTransportJob {
  id: string;
  request_id: string;
  transporter_id?: string | null;
  pickup_location: string;
  delivery_location: string;
  distance_km: number;
  estimated_cost: number;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
  created_at?: string;
}

export interface ApiProfile {
  id: string;
  full_name?: string;
  organization?: string;
  role: 'BUYER' | 'SELLER' | 'TRANSPORTER' | 'GOVERNMENT_AGENT';
  created_at?: string;
}

export interface ApiAuthenticatedUser {
  id: string;
  email?: string;
  profile?: ApiProfile;
  role?: 'BUYER' | 'SELLER' | 'TRANSPORTER' | 'GOVERNMENT_AGENT';
}

// ---------------------------------------------------------------------------
// API SERVICE METHODS
// ---------------------------------------------------------------------------

export const carbonLoopApi = {
  // Auth
  async getMe(): Promise<ApiAuthenticatedUser> {
    return request<ApiAuthenticatedUser>('/auth/me');
  },

  // Listings (Marketplace & Supplier)
  async getListings(params?: {
    status?: string;
    min_purity?: number;
    seller_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiListing[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.min_purity !== undefined) query.set('min_purity', String(params.min_purity));
    if (params?.seller_id) query.set('seller_id', params.seller_id);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return request<ApiListing[]>(`/listings${qs ? `?${qs}` : ''}`);
  },

  async getListingById(id: string): Promise<ApiListing> {
    return request<ApiListing>(`/listings/${encodeURIComponent(id)}`);
  },

  async createListing(data: {
    quantity: number;
    purity: number;
    location: string;
    asking_price: number;
    availability_start?: string | null;
    availability_end?: string | null;
  }): Promise<ApiListing> {
    return request<ApiListing>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Requirements (Buyer)
  async getRequirements(params?: {
    status?: string;
    min_purity?: number;
    buyer_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiRequirement[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.min_purity !== undefined) query.set('min_purity', String(params.min_purity));
    if (params?.buyer_id) query.set('buyer_id', params.buyer_id);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return request<ApiRequirement[]>(`/requirements${qs ? `?${qs}` : ''}`);
  },

  async getRequirementById(id: string): Promise<ApiRequirement> {
    return request<ApiRequirement>(`/requirements/${encodeURIComponent(id)}`);
  },

  async createRequirement(data: {
    min_purity: number;
    required_quantity: number;
    delivery_location: string;
    max_budget?: number | null;
    required_date?: string | null;
  }): Promise<ApiRequirement> {
    return request<ApiRequirement>('/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Matchmaking Engine
  async getMatches(requirementId: string): Promise<ApiMatchList> {
    return request<ApiMatchList>(`/matches/${encodeURIComponent(requirementId)}`);
  },

  // Logistics & Cost Estimate
  async estimateLogistics(data: {
    pickup_location: string;
    delivery_location: string;
    quantity_tonnes: number;
    price_per_tonne: number;
  }): Promise<ApiLogisticsEstimate> {
    return request<ApiLogisticsEstimate>('/logistics/estimate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Requests / Bidding
  async createRequest(data: {
    match_id: string;
    quantity: number;
    offered_price: number;
    seller_id?: string;
  }): Promise<ApiSupplyRequest> {
    return request<ApiSupplyRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getRequests(status?: string): Promise<ApiSupplyRequest[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<ApiSupplyRequest[]>(`/requests${qs}`);
  },

  async getRequestById(id: string): Promise<ApiSupplyRequest> {
    return request<ApiSupplyRequest>(`/requests/${encodeURIComponent(id)}`);
  },

  async updateRequestStatus(
    id: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<ApiSupplyRequest> {
    return request<ApiSupplyRequest>(`/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Transport Jobs
  async createTransportJob(data: {
    request_id: string;
    transporter_id?: string;
  }): Promise<ApiTransportJob> {
    return request<ApiTransportJob>('/transport/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTransportJobs(status?: string): Promise<ApiTransportJob[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<ApiTransportJob[]>(`/transport/jobs${qs}`);
  },

  async getTransportJobById(id: string): Promise<ApiTransportJob> {
    return request<ApiTransportJob>(`/transport/jobs/${encodeURIComponent(id)}`);
  },

  async updateTransportJobStatus(
    id: string,
    status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED'
  ): Promise<ApiTransportJob> {
    return request<ApiTransportJob>(`/transport/jobs/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
