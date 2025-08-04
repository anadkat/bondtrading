// Bond types for the frontend application

export interface Bond {
  id: string;
  isin: string;
  cusip?: string;
  issuer: string;
  description: string;
  bondType: string;
  sector?: string;
  rating?: string;
  coupon?: string;
  maturityDate?: Date;
  currency?: string;
  parValue?: string;
  lastPrice?: string;
  ytm?: string;
  ytw?: string;
  duration?: string;
  convexity?: string;
  liquidityScore?: number;
  status?: string;
  updatedAt?: Date;
}

export interface MarketData {
  id: string;
  bondId: string;
  bidPrice?: string;
  askPrice?: string;
  bidSize?: string;
  askSize?: string;
  lastTradePrice?: string;
  lastTradeSize?: string;
  volume?: string;
  timestamp?: Date;
}

export interface BondWithMarketData extends Bond {
  marketData?: MarketData;
  isWatched?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  bondId: string;
  side: string; // 'buy' or 'sell'
  orderType: string; // 'market' or 'limit'
  quantity: string;
  price?: string;
  limitPrice?: string;
  status?: string; // 'pending', 'filled', 'canceled', 'rejected'
  filledQuantity?: string;
  averageFillPrice?: string;
  commission?: string;
  momentOrderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  action?: string; // alias for side
  created_at?: Date; // alias for createdAt
}

export interface OrderWithBond extends Order {
  bond: Bond;
}