import { queryClient } from "./queryClient";

// Temporarily use mock data for production until API is fixed
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'MOCK' // Use mock data in production temporarily
  : "http://localhost:8000"; // Use localhost in development

// Mock bond data for production deployment
const MOCK_BONDS = [
  {
    id: "US037833100",
    isin: "US037833100", 
    issuer: "Apple Inc",
    description: "Apple Inc 2.400% 16-Jan-2030",
    bondType: "corporate",
    sector: "TECHNOLOGY",
    rating: "AA+",
    coupon: "2.400",
    maturityDate: new Date("2030-01-16"),
    currency: "USD",
    parValue: "1000",
    lastPrice: "98.50",
    ytm: "2.65",
    ytw: "2.65"
  },
  {
    id: "US594918104",
    isin: "US594918104",
    issuer: "Microsoft Corporation", 
    description: "Microsoft Corporation 2.921% 11-Mar-2052",
    bondType: "corporate",
    sector: "TECHNOLOGY",
    rating: "AAA",
    coupon: "2.921",
    maturityDate: new Date("2052-03-11"),
    currency: "USD", 
    parValue: "1000",
    lastPrice: "89.75",
    ytm: "3.45",
    ytw: "3.45"
  },
  {
    id: "US02079K107",
    isin: "US02079K107",
    issuer: "Alphabet Inc",
    description: "Alphabet Inc 1.900% 15-Aug-2040", 
    bondType: "corporate",
    sector: "TECHNOLOGY",
    rating: "AA+",
    coupon: "1.900",
    maturityDate: new Date("2040-08-15"),
    currency: "USD",
    parValue: "1000", 
    lastPrice: "82.30",
    ytm: "2.85",
    ytw: "2.85"
  },
  {
    id: "US46625H100",
    isin: "US46625H100",
    issuer: "JPMorgan Chase & Co",
    description: "JPMorgan Chase & Co 3.220% 01-Mar-2025",
    bondType: "corporate", 
    sector: "FINANCIAL SERVICES",
    rating: "A+",
    coupon: "3.220",
    maturityDate: new Date("2025-03-01"),
    currency: "USD",
    parValue: "1000",
    lastPrice: "101.25",
    ytm: "2.15",
    ytw: "2.15"
  },
  {
    id: "US06051GHE45",
    isin: "US06051GHE45", 
    issuer: "Bank of America Corp",
    description: "Bank of America Corp 2.592% 15-Apr-2031",
    bondType: "corporate",
    sector: "FINANCIAL SERVICES", 
    rating: "A-",
    coupon: "2.592",
    maturityDate: new Date("2031-04-15"),
    currency: "USD",
    parValue: "1000",
    lastPrice: "95.80",
    ytm: "3.25",
    ytw: "3.25"
  }
];


export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  // Add base URL if it's a relative path
  const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest("POST", url, data);
  return response.json();
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest("PUT", url, data);
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiRequest("DELETE", url);
  return response.json();
}

// Moment API specific helpers
export const momentApi = {
  // Bond operations
  async searchBonds(filters: {
    bondType?: string;
    rating?: string;
    sector?: string;
    currency?: string;
    minYield?: number;
    maxYield?: number;
    minMaturity?: number;
    maxMaturity?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== 0) {
        params.append(key, value.toString());
      }
    });
    return apiGet(`/api/bonds?${params.toString()}`);
  },

  async getBond(id: string) {
    return apiGet(`/api/bonds/${id}`);
  },

  async getBondQuote(id: string, quantity?: number) {
    const params = quantity ? `?quantity=${quantity}` : '';
    return apiGet(`/api/bonds/${id}/quote${params}`);
  },

  async getBondHistoricalPrices(id: string, startDate: string, endDate: string, frequency: string = '1day') {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      frequency: frequency
    });
    return apiGet(`/api/bonds/${id}/prices?${params.toString()}`);
  },

  async getBondOrderBook(id: string) {
    return apiGet(`/api/bonds/${id}/order-book`);
  },



  // Order operations
  async getOrders(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiGet(`/api/orders${params}`);
  },

  async submitOrder(order: {
    bondId: string;
    side: 'buy' | 'sell';
    orderType: 'market' | 'limit';
    quantity: string;
    limitPrice?: string;
  }) {
    // Transform frontend data to match Python backend schema
    const backendOrder = {
      instrument_id: order.bondId,
      side: order.side,
      order_type: order.orderType,
      quantity: parseInt(order.quantity) || 1000,
      price: order.limitPrice ? parseFloat(order.limitPrice) : null,
      client_order_id: `client_${Date.now()}`
    };

    const response = await apiPost('/api/orders', backendOrder);
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    return response;
  },


  // System operations
  async syncBonds() {
    const response = await apiPost('/api/sync-bonds');
    queryClient.invalidateQueries({ queryKey: ['/api/bonds'] });
    return response;
  }
};
