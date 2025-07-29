import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { momentApi } from "./services/momentApi";
import { 
  insertOrderSchema, 
  insertPortfolioHoldingSchema, 
  insertWatchlistSchema,
  type Bond,
  type BondWithMarketData 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication middleware (simplified for demo)
  const requireAuth = (req: any, res: any, next: any) => {
    // In production, implement proper JWT authentication
    req.user = { id: "demo-user-id" };
    next();
  };

  // Bond endpoints
  app.get("/api/bonds", async (req, res) => {
    try {
      const filters = {
        bondType: req.query.bondType === 'all' ? undefined : req.query.bondType as string,
        rating: req.query.rating === 'all' ? undefined : req.query.rating as string,
        sector: req.query.sector === 'all' ? undefined : req.query.sector as string,
        currency: req.query.currency as string,
        minYield: req.query.minYield ? parseFloat(req.query.minYield as string) : undefined,
        maxYield: req.query.maxYield ? parseFloat(req.query.maxYield as string) : undefined,
        minMaturity: req.query.minMaturity ? parseInt(req.query.minMaturity as string) : undefined,
        maxMaturity: req.query.maxMaturity ? parseInt(req.query.maxMaturity as string) : undefined,
      };

      const bonds = await storage.searchBonds(filters);
      res.json(bonds);
    } catch (error) {
      console.error("Error fetching bonds:", error);
      res.status(500).json({ error: "Failed to fetch bonds" });
    }
  });

  app.get("/api/bonds/:id", async (req, res) => {
    try {
      const bond = await storage.getBond(req.params.id);
      if (!bond) {
        return res.status(404).json({ error: "Bond not found" });
      }

      const marketData = await storage.getMarketData(bond.id);
      res.json({ ...bond, marketData });
    } catch (error) {
      console.error("Error fetching bond:", error);
      res.status(500).json({ error: "Failed to fetch bond" });
    }
  });

  app.get("/api/bonds/:id/quote", async (req, res) => {
    try {
      const bond = await storage.getBond(req.params.id);
      if (!bond) {
        return res.status(404).json({ error: "Bond not found" });
      }

      const quantity = req.query.quantity ? parseInt(req.query.quantity as string) : undefined;
      const quote = await momentApi.getQuote(bond.isin, quantity);
      
      // Update local market data
      await storage.updateMarketData(bond.id, {
        bidPrice: quote.bid_price?.toString(),
        askPrice: quote.ask_price?.toString(),
        bidSize: quote.bid_size?.toString(),
        askSize: quote.ask_size?.toString(),
        lastTradePrice: quote.last_price?.toString(),
      });

      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.get("/api/bonds/:id/price-chart", async (req, res) => {
    try {
      const bond = await storage.getBond(req.params.id);
      if (!bond) {
        return res.status(404).json({ error: "Bond not found" });
      }

      const params = {
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        granularity: req.query.granularity as string,
      };

      const priceData = await momentApi.getPriceChart(bond.isin, params);
      res.json(priceData);
    } catch (error) {
      console.error("Error fetching price chart:", error);
      res.status(500).json({ error: "Failed to fetch price chart" });
    }
  });

  // Portfolio endpoints
  app.get("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const holdings = await storage.getPortfolioHoldings(req.user.id);
      const summary = await storage.getPortfolioSummary(req.user.id);
      
      res.json({ holdings, summary });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPortfolioHoldingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const holding = await storage.createPortfolioHolding(validatedData);
      res.json(holding);
    } catch (error) {
      console.error("Error creating portfolio holding:", error);
      res.status(500).json({ error: "Failed to create portfolio holding" });
    }
  });

  // Order endpoints
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const status = req.query.status as string;
      const orders = await storage.getUserOrders(req.user.id, status);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Create local order
      const order = await storage.createOrder(validatedData);

      // Submit to Moment API
      try {
        const bond = await storage.getBond(validatedData.bondId);
        if (!bond) {
          throw new Error("Bond not found");
        }

        const momentOrderRequest = {
          instrument_id: bond.isin,
          side: validatedData.side as 'buy' | 'sell',
          quantity: parseFloat(validatedData.quantity),
          order_type: validatedData.orderType as 'market' | 'limit',
          ...(validatedData.limitPrice && { price: parseFloat(validatedData.limitPrice) }),
        };

        const momentOrder = await momentApi.submitOrder(momentOrderRequest);
        
        // Update order with Moment order ID
        await storage.updateOrder(order.id, {
          momentOrderId: momentOrder.order_id,
          status: momentOrder.status,
        });

        res.json({ ...order, momentOrderId: momentOrder.order_id });
      } catch (momentError) {
        console.error("Failed to submit order to Moment API:", momentError);
        await storage.updateOrder(order.id, { status: "rejected" });
        res.status(400).json({ error: "Failed to submit order to market" });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders/:id/cancel", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Cancel with Moment API if order has Moment ID
      if (order.momentOrderId) {
        try {
          await momentApi.cancelOrder(order.momentOrderId);
        } catch (momentError) {
          console.error("Failed to cancel order with Moment API:", momentError);
        }
      }

      await storage.cancelOrder(order.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  // Watchlist endpoints
  app.get("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const watchlist = await storage.getWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const validatedData = insertWatchlistSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const item = await storage.addToWatchlist(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:bondId", requireAuth, async (req, res) => {
    try {
      await storage.removeFromWatchlist(req.user.id, req.params.bondId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  // Sync data from Moment API
  app.post("/api/sync-bonds", async (req, res) => {
    try {
      console.log("Syncing bonds from Moment API...");
      const momentBonds = await momentApi.getInstruments({ status: "outstanding" });
      
      let syncedCount = 0;
      for (const momentBond of momentBonds) {
        const existingBond = await storage.getBondByISIN(momentBond.isin);
        
        if (!existingBond) {
          const bond: Bond = {
            id: momentBond.instrument_id,
            isin: momentBond.isin,
            cusip: momentBond.cusip || null,
            issuer: momentBond.issuer,
            description: momentBond.description,
            bondType: momentBond.bond_type,
            sector: momentBond.sector || null,
            rating: momentBond.rating || null,
            coupon: momentBond.coupon?.toString() || null,
            maturityDate: momentBond.maturity_date ? new Date(momentBond.maturity_date) : null,
            currency: momentBond.currency,
            parValue: momentBond.par_value?.toString() || null,
            lastPrice: null,
            ytm: null,
            ytw: null,
            duration: null,
            convexity: null,
            liquidityScore: null,
            status: momentBond.status,
            updatedAt: new Date(),
          };

          await storage.createBond(bond);
          syncedCount++;
        }
      }

      console.log(`Synced ${syncedCount} new bonds from Moment API`);
      res.json({ syncedCount, totalBonds: momentBonds.length });
    } catch (error) {
      console.error("Error syncing bonds:", error);
      res.status(500).json({ error: "Failed to sync bonds from Moment API" });
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe_quotes') {
          // Subscribe to real-time quotes for specified bonds
          const bondIds = data.bondIds as string[];
          
          // In a real implementation, you would set up subscriptions
          // to Moment's WebSocket feeds or polling mechanisms
          console.log(`Subscribing to quotes for bonds: ${bondIds.join(', ')}`);
          
          // Send initial quote data
          for (const bondId of bondIds) {
            const bond = await storage.getBond(bondId);
            if (bond) {
              try {
                const quote = await momentApi.getQuote(bond.isin);
                
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'quote_update',
                    bondId: bond.id,
                    quote
                  }));
                }
              } catch (error) {
                console.error(`Error fetching quote for ${bond.isin}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Periodic market data updates
  setInterval(async () => {
    try {
      const bonds = await storage.getAllBonds();
      const instrumentIds = bonds.map(bond => bond.isin);
      
      if (instrumentIds.length > 0) {
        // Update quotes for all bonds (in batches to respect API limits)
        const batchSize = 10;
        for (let i = 0; i < instrumentIds.length; i += batchSize) {
          const batch = instrumentIds.slice(i, i + batchSize);
          
          try {
            const marks = await momentApi.getMarks(batch);
            
            for (const [isin, quote] of Object.entries(marks)) {
              const bond = await storage.getBondByISIN(isin);
              if (bond) {
                await storage.updateMarketData(bond.id, {
                  bidPrice: quote.bid_price?.toString(),
                  askPrice: quote.ask_price?.toString(),
                  lastTradePrice: quote.last_price?.toString(),
                });

                // Broadcast to WebSocket clients
                wss.clients.forEach(client => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: 'quote_update',
                      bondId: bond.id,
                      quote
                    }));
                  }
                });
              }
            }
          } catch (error) {
            console.error(`Error updating quotes for batch:`, error);
          }
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error in periodic market data update:', error);
    }
  }, 30000); // Update every 30 seconds

  return httpServer;
}
