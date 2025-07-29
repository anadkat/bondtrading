import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  role: text("role").default("trader"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bonds = pgTable("bonds", {
  id: varchar("id").primaryKey(),
  isin: text("isin").notNull().unique(),
  cusip: text("cusip"),
  issuer: text("issuer").notNull(),
  description: text("description").notNull(),
  bondType: text("bond_type").notNull(),
  sector: text("sector"),
  rating: text("rating"),
  coupon: decimal("coupon", { precision: 5, scale: 3 }),
  maturityDate: timestamp("maturity_date"),
  currency: text("currency").default("USD"),
  parValue: decimal("par_value", { precision: 15, scale: 2 }),
  lastPrice: decimal("last_price", { precision: 8, scale: 4 }),
  ytm: decimal("ytm", { precision: 5, scale: 3 }),
  ytw: decimal("ytw", { precision: 5, scale: 3 }),
  duration: decimal("duration", { precision: 6, scale: 3 }),
  convexity: decimal("convexity", { precision: 8, scale: 3 }),
  liquidityScore: integer("liquidity_score"),
  status: text("status").default("outstanding"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  costBasis: decimal("cost_basis", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  accruedInterest: decimal("accrued_interest", { precision: 15, scale: 2 }),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  orderType: text("order_type").notNull(), // 'market' or 'limit'
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  price: decimal("price", { precision: 8, scale: 4 }),
  limitPrice: decimal("limit_price", { precision: 8, scale: 4 }),
  status: text("status").default("pending"), // 'pending', 'filled', 'canceled', 'rejected'
  filledQuantity: decimal("filled_quantity", { precision: 15, scale: 2 }).default("0"),
  averageFillPrice: decimal("average_fill_price", { precision: 8, scale: 4 }),
  commission: decimal("commission", { precision: 10, scale: 2 }),
  momentOrderId: text("moment_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  bidPrice: decimal("bid_price", { precision: 8, scale: 4 }),
  askPrice: decimal("ask_price", { precision: 8, scale: 4 }),
  bidSize: decimal("bid_size", { precision: 15, scale: 2 }),
  askSize: decimal("ask_size", { precision: 15, scale: 2 }),
  lastTradePrice: decimal("last_trade_price", { precision: 8, scale: 4 }),
  lastTradeSize: decimal("last_trade_size", { precision: 15, scale: 2 }),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBondSchema = createInsertSchema(bonds).omit({
  updatedAt: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
  currentValue: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
  filledQuantity: true,
  averageFillPrice: true,
  momentOrderId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Bond = typeof bonds.$inferSelect;
export type InsertBond = z.infer<typeof insertBondSchema>;

export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type MarketData = typeof marketData.$inferSelect;

export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistSchema>;

// Extended types for API responses
export type BondWithMarketData = Bond & {
  marketData?: MarketData;
  isWatched?: boolean;
};

export type OrderWithBond = Order & {
  bond: Bond;
};

export type PortfolioSummary = {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  incomeReturn: number;
  priceReturn: number;
  averageYield: number;
  modifiedDuration: number;
  effectiveDuration: number;
  convexity: number;
  activeBonds: number;
};
