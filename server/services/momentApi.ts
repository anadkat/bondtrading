import { parse } from 'csv-parse/sync';
import * as yauzl from 'yauzl';
import { promisify } from 'util';

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
    // Remove trailing slash if present
    let baseUrl = process.env.MOMENT_API_BASE_URL || 'https://paper.moment-api.com';
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    this.config = {
      baseUrl,
      apiKey: process.env.MOMENT_API_KEY || process.env.API_KEY || 'msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0'
    };
    console.log('MomentApiService initialized with:', {
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey.substring(0, 20) + '...',
      fullEndpoint: `${this.config.baseUrl}/v1/data/instrument/bulk-download/`
    });
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

    // Check if response is CSV/ZIP (for bulk download)
    const contentType = response.headers.get('content-type') || '';
    console.log('Response content type:', contentType);
    if (contentType.includes('text/csv') || contentType.includes('application/octet-stream') || contentType.includes('application/zip') || endpoint.includes('bulk-download')) {
      const buffer = await response.arrayBuffer();
      return buffer as unknown as T;
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
      const buffer = await this.makeRequest<ArrayBuffer>(endpoint);
      console.log('Bulk download response type:', typeof buffer);
      console.log('Buffer length:', buffer.byteLength);

      // Convert ArrayBuffer to Buffer for yauzl
      const zipBuffer = Buffer.from(buffer);
      
      // Extract CSV from ZIP
      const csvData = await this.extractCSVFromZip(zipBuffer);
      console.log('CSV data length:', csvData.length);
      console.log('CSV data preview:', csvData.substring(0, 500));

      // Parse CSV data
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      console.log('Parsed records count:', records.length);
      if (records.length > 0) {
        console.log('First record keys:', Object.keys(records[0]));
        console.log('First record:', records[0]);
      }

      // Map CSV records to MomentBond format
      const bonds: MomentBond[] = records.map((record: any) => ({
        instrument_id: record.instrument_id || record.isin || record.ISIN,
        isin: record.isin || record.ISIN,
        cusip: record.cusip || record.CUSIP,
        issuer: record.issuer || record.issuer_name,
        description: record.description || record.bond_description,
        bond_type: record.bond_type || record.asset_type || 'corporate',
        sector: record.sector || record.industry_sector,
        rating: record.rating || record.credit_rating,
        coupon: record.coupon ? parseFloat(record.coupon) : undefined,
        maturity_date: record.maturity_date || record.maturity,
        currency: record.currency || 'USD',
        par_value: record.par_value ? parseFloat(record.par_value) : 1000,
        status: record.status || 'outstanding',
      }));

      console.log('Mapped bonds count:', bonds.length);
      return bonds.filter(bond => bond.instrument_id && bond.isin);
    } catch (error) {
      console.error('Bulk download failed:', error);
      return [];
    }
  }

  private async extractCSVFromZip(zipBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);
        if (!zipfile) return reject(new Error('No zipfile'));

        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          if (entry.fileName.endsWith('.csv')) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);
              if (!readStream) return reject(new Error('No readStream'));

              let csvData = '';
              readStream.on('data', (chunk) => {
                csvData += chunk.toString();
              });
              readStream.on('end', () => {
                resolve(csvData);
              });
              readStream.on('error', reject);
            });
          } else {
            zipfile.readEntry();
          }
        });
        zipfile.on('error', reject);
      });
    });
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
