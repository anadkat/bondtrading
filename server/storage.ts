import { 
  type User, 
  type InsertUser,
  type Bond,
  type InsertBond,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type Order,
  type InsertOrder,
  type MarketData,
  type WatchlistItem,
  type InsertWatchlistItem,
  type BondWithMarketData,
  type OrderWithBond,
  type PortfolioSummary
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApiKey(userId: string, apiKey: string): Promise<void>;

  // Bond methods
  getBond(id: string): Promise<Bond | undefined>;
  getBondByISIN(isin: string): Promise<Bond | undefined>;
  createBond(bond: InsertBond): Promise<Bond>;
  updateBond(id: string, updates: Partial<Bond>): Promise<Bond | undefined>;
  searchBonds(filters: {
    bondType?: string;
    rating?: string;
    sector?: string;
    currency?: string;
    minYield?: number;
    maxYield?: number;
    minMaturity?: number;
    maxMaturity?: number;
  }): Promise<BondWithMarketData[]>;
  getAllBonds(): Promise<Bond[]>;

  // Portfolio methods
  getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]>;
  getPortfolioHolding(userId: string, bondId: string): Promise<PortfolioHolding | undefined>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined>;
  deletePortfolioHolding(id: string): Promise<void>;
  getPortfolioSummary(userId: string): Promise<PortfolioSummary>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string, status?: string): Promise<OrderWithBond[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  cancelOrder(id: string): Promise<void>;

  // Market data methods
  getMarketData(bondId: string): Promise<MarketData | undefined>;
  updateMarketData(bondId: string, data: Partial<MarketData>): Promise<MarketData>;

  // Watchlist methods
  getWatchlist(userId: string): Promise<BondWithMarketData[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, bondId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private bonds: Map<string, Bond> = new Map();
  private portfolioHoldings: Map<string, PortfolioHolding> = new Map();
  private orders: Map<string, Order> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private watchlist: Map<string, WatchlistItem> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "trader",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserApiKey(userId: string, apiKey: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.apiKey = apiKey;
      this.users.set(userId, user);
    }
  }

  // Bond methods
  async getBond(id: string): Promise<Bond | undefined> {
    return this.bonds.get(id);
  }

  async getBondByISIN(isin: string): Promise<Bond | undefined> {
    return Array.from(this.bonds.values()).find(bond => bond.isin === isin);
  }

  async createBond(insertBond: InsertBond): Promise<Bond> {
    const id = insertBond.id || randomUUID();
    const bond: Bond = { 
      ...insertBond, 
      id,
      updatedAt: new Date()
    };
    this.bonds.set(id, bond);
    return bond;
  }

  async updateBond(id: string, updates: Partial<Bond>): Promise<Bond | undefined> {
    const bond = this.bonds.get(id);
    if (bond) {
      const updatedBond = { ...bond, ...updates, updatedAt: new Date() };
      this.bonds.set(id, updatedBond);
      return updatedBond;
    }
    return undefined;
  }

  async searchBonds(filters: {
    bondType?: string;
    rating?: string;
    sector?: string;
    currency?: string;
    minYield?: number;
    maxYield?: number;
    minMaturity?: number;
    maxMaturity?: number;
  }): Promise<BondWithMarketData[]> {
    let bonds = Array.from(this.bonds.values());

    if (filters.bondType) {
      bonds = bonds.filter(bond => bond.bondType === filters.bondType);
    }
    if (filters.rating) {
      bonds = bonds.filter(bond => bond.rating === filters.rating);
    }
    if (filters.sector) {
      bonds = bonds.filter(bond => bond.sector === filters.sector);
    }
    if (filters.currency) {
      bonds = bonds.filter(bond => bond.currency === filters.currency);
    }
    if (filters.minYield !== undefined) {
      bonds = bonds.filter(bond => bond.ytm && parseFloat(bond.ytm) >= filters.minYield!);
    }
    if (filters.maxYield !== undefined) {
      bonds = bonds.filter(bond => bond.ytm && parseFloat(bond.ytm) <= filters.maxYield!);
    }

    return bonds.map(bond => ({
      ...bond,
      marketData: this.marketData.get(bond.id)
    }));
  }

  async getAllBonds(): Promise<Bond[]> {
    return Array.from(this.bonds.values());
  }

  // Portfolio methods
  async getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values())
      .filter(holding => holding.userId === userId);
  }

  async getPortfolioHolding(userId: string, bondId: string): Promise<PortfolioHolding | undefined> {
    return Array.from(this.portfolioHoldings.values())
      .find(holding => holding.userId === userId && holding.bondId === bondId);
  }

  async createPortfolioHolding(insertHolding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const id = randomUUID();
    const holding: PortfolioHolding = {
      ...insertHolding,
      id,
      purchaseDate: new Date(),
      updatedAt: new Date()
    };
    this.portfolioHoldings.set(id, holding);
    return holding;
  }

  async updatePortfolioHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const holding = this.portfolioHoldings.get(id);
    if (holding) {
      const updatedHolding = { ...holding, ...updates, updatedAt: new Date() };
      this.portfolioHoldings.set(id, updatedHolding);
      return updatedHolding;
    }
    return undefined;
  }

  async deletePortfolioHolding(id: string): Promise<void> {
    this.portfolioHoldings.delete(id);
  }

  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const holdings = await this.getPortfolioHoldings(userId);
    
    let totalValue = 0;
    let totalCost = 0;
    let totalYield = 0;
    let totalDuration = 0;
    let activeBonds = holdings.length;

    holdings.forEach(holding => {
      const value = parseFloat(holding.currentValue || "0");
      const cost = parseFloat(holding.costBasis);
      totalValue += value;
      totalCost += cost;
    });

    const totalReturn = totalValue - totalCost;
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      totalValue,
      totalReturn,
      totalReturnPercent,
      incomeReturn: 0, // Calculate based on coupon payments
      priceReturn: totalReturnPercent,
      averageYield: totalYield / Math.max(activeBonds, 1),
      modifiedDuration: totalDuration / Math.max(activeBonds, 1),
      effectiveDuration: totalDuration / Math.max(activeBonds, 1),
      convexity: 0, // Calculate weighted average
      activeBonds
    };
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: string, status?: string): Promise<OrderWithBond[]> {
    let orders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);

    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    return orders.map(order => {
      const bond = this.bonds.get(order.bondId);
      return {
        ...order,
        bond: bond!
      };
    }).filter(order => order.bond);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: "pending",
      filledQuantity: "0",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  async cancelOrder(id: string): Promise<void> {
    await this.updateOrder(id, { status: "canceled" });
  }

  // Market data methods
  async getMarketData(bondId: string): Promise<MarketData | undefined> {
    return this.marketData.get(bondId);
  }

  async updateMarketData(bondId: string, data: Partial<MarketData>): Promise<MarketData> {
    const existing = this.marketData.get(bondId);
    const marketData: MarketData = {
      id: existing?.id || randomUUID(),
      bondId,
      ...existing,
      ...data,
      timestamp: new Date()
    };
    this.marketData.set(bondId, marketData);
    return marketData;
  }

  // Watchlist methods
  async getWatchlist(userId: string): Promise<BondWithMarketData[]> {
    const watchlistItems = Array.from(this.watchlist.values())
      .filter(item => item.userId === userId);

    return watchlistItems.map(item => {
      const bond = this.bonds.get(item.bondId);
      const marketData = this.marketData.get(item.bondId);
      return {
        ...bond!,
        marketData,
        isWatched: true
      };
    }).filter(bond => bond.id);
  }

  async addToWatchlist(insertItem: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = randomUUID();
    const item: WatchlistItem = {
      ...insertItem,
      id,
      createdAt: new Date()
    };
    this.watchlist.set(id, item);
    return item;
  }

  async removeFromWatchlist(userId: string, bondId: string): Promise<void> {
    const item = Array.from(this.watchlist.entries())
      .find(([_, item]) => item.userId === userId && item.bondId === bondId);
    if (item) {
      this.watchlist.delete(item[0]);
    }
  }
}

export const storage = new MemStorage();
