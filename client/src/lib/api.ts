import { queryClient } from "./queryClient";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
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
      if (value !== undefined && value !== null && value !== '') {
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

  async getPriceChart(id: string, params?: {
    start_date?: string;
    end_date?: string;
    granularity?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    return apiGet(`/api/bonds/${id}/price-chart?${searchParams.toString()}`);
  },

  // Portfolio operations
  async getPortfolio() {
    return apiGet('/api/portfolio');
  },

  async addToPortfolio(holding: {
    bondId: string;
    quantity: string;
    costBasis: string;
  }) {
    const response = await apiPost('/api/portfolio', holding);
    queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    return response;
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
    queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    return response;
  },

  async cancelOrder(orderId: string) {
    const response = await apiPost(`/api/orders/${orderId}/cancel`);
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    return response;
  },

  // Watchlist operations
  async getWatchlist() {
    return apiGet('/api/watchlist');
  },

  async addToWatchlist(bondId: string) {
    const response = await apiPost('/api/watchlist', { bondId });
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    return response;
  },

  async removeFromWatchlist(bondId: string) {
    const response = await apiDelete(`/api/watchlist/${bondId}`);
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    return response;
  },

  // System operations
  async syncBonds() {
    const response = await apiPost('/api/sync-bonds');
    queryClient.invalidateQueries({ queryKey: ['/api/bonds'] });
    return response;
  }
};
