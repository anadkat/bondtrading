interface MomentApiConfig {
  baseUrl: string;
  apiKey: string;
}

interface MomentBond {
  instrument_id: string;
  isin: string;
  cusip?: string;
  issuer: string;
  description: string;
  bond_type: string;
  sector?: string;
  rating?: string;
  coupon?: number;
  maturity_date?: string;
  currency: string;
  par_value?: number;
  status: string;
}

interface MomentQuote {
  instrument_id: string;
  bid_price?: number;
  bid_yield?: number;
  bid_size?: number;
  ask_price?: number;
  ask_yield?: number;
  ask_size?: number;
  last_price?: number;
  ytm?: number;
  ytw?: number;
}

interface MomentOrderRequest {
  instrument_id: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit';
  price?: number;
}

interface MomentOrderResponse {
  order_id: string;
  status: string;
  instrument_id: string;
  side: string;
  quantity: number;
  filled_quantity?: number;
  avg_price?: number;
  created_at: string;
}

export class MomentApiService {
  private config: MomentApiConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.MOMENT_API_BASE_URL || 'https://paper.moment-api.com',
      apiKey: process.env.MOMENT_API_KEY || process.env.API_KEY || ''
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Moment API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // Reference Data Methods
  async getInstruments(params?: {
    status?: string;
    bond_type?: string;
    rating?: string;
    sector?: string;
    currency?: string;
  }): Promise<MomentBond[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const endpoint = `/v1/data/instrument/?${searchParams.toString()}`;
    try {
      const response = await this.makeRequest<MomentBond[]>(endpoint);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      // Try bulk download as fallback
      return this.bulkDownload();
    }
  }

  async getInstrument(instrumentId: string): Promise<MomentBond> {
    const endpoint = `/v1/data/instrument/${instrumentId}/`;
    return this.makeRequest<MomentBond>(endpoint);
  }

  async bulkDownload(): Promise<MomentBond[]> {
    const endpoint = '/v1/data/instrument/bulk-download/';
    try {
      const response = await this.makeRequest<MomentBond[]>(endpoint);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Bulk download failed:', error);
      return [];
    }
  }

  // Market Data Methods
  async getQuote(instrumentId: string, quantity?: number): Promise<MomentQuote> {
    let endpoint = `/v1/trading/quote/${instrumentId}/`;
    if (quantity) {
      endpoint += `?quantity=${quantity}`;
    }
    return this.makeRequest<MomentQuote>(endpoint);
  }

  async getMarks(instrumentIds: string[]): Promise<{ [key: string]: MomentQuote }> {
    const endpoint = '/v1/data/marks/';
    const response = await this.makeRequest<{ marks: { [key: string]: MomentQuote } }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ instrument_ids: instrumentIds }),
    });
    return response.marks || {};
  }

  async getPriceChart(instrumentId: string, params?: {
    start_date?: string;
    end_date?: string;
    granularity?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const endpoint = `/v1/data/instrument/${instrumentId}/price/?${searchParams.toString()}`;
    const response = await this.makeRequest<{ price_data: any[] }>(endpoint);
    return response.price_data || [];
  }

  // Trading Methods
  async submitOrder(orderRequest: MomentOrderRequest): Promise<MomentOrderResponse> {
    const endpoint = '/v1/trading/orders/';
    return this.makeRequest<MomentOrderResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(orderRequest),
    });
  }

  async getOrder(orderId: string): Promise<MomentOrderResponse> {
    const endpoint = `/v1/trading/orders/${orderId}/`;
    return this.makeRequest<MomentOrderResponse>(endpoint);
  }

  async cancelOrder(orderId: string): Promise<MomentOrderResponse> {
    const endpoint = `/v1/trading/orders/${orderId}/cancel/`;
    return this.makeRequest<MomentOrderResponse>(endpoint, {
      method: 'POST',
    });
  }

  async getOrders(status?: string): Promise<MomentOrderResponse[]> {
    let endpoint = '/v1/trading/orders/';
    if (status) {
      endpoint += `?status=${status}`;
    }
    const response = await this.makeRequest<{ orders: MomentOrderResponse[] }>(endpoint);
    return response.orders || [];
  }

  // Analytics Methods
  async priceToYield(instrumentId: string, price: number): Promise<{ yield_to_maturity: number; yield_to_worst: number }> {
    const endpoint = `/v1/analytics/${instrumentId}/price-to-yield/`;
    return this.makeRequest<{ yield_to_maturity: number; yield_to_worst: number }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ price }),
    });
  }

  async yieldToPrice(instrumentId: string, yield_to_maturity: number): Promise<{ clean_price: number; dirty_price: number }> {
    const endpoint = `/v1/analytics/${instrumentId}/yield-to-price/`;
    return this.makeRequest<{ clean_price: number; dirty_price: number }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ yield_to_maturity }),
    });
  }

  async getMarkupCalculator(instrumentId: string, params: {
    side: 'buy' | 'sell';
    quantity: number;
    markup_bps?: number;
  }): Promise<any> {
    const endpoint = `/v1/analytics/${instrumentId}/markup-calculator/`;
    return this.makeRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const momentApi = new MomentApiService();
