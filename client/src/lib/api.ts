import { queryClient } from "./queryClient";

// Use serverless API endpoints
const API_BASE_URL = '';


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
    const response = await apiPost('/api/orders', order);
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
