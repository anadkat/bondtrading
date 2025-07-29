import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { momentApi } from "./services/momentApi";
import { storage } from "./storage";
import type { Bond } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Add sample bond data for development while testing API endpoints
    try {
      log("Initializing sample bond data...");
      
      const sampleBonds: Bond[] = [
        {
          id: "AAPL_2030_4875",
          isin: "US037833100",
          cusip: "037833AL0",
          issuer: "Apple Inc",
          description: "Apple Inc 4.875% 15-Feb-2030",
          bondType: "corporate",
          sector: "technology",
          rating: "AA+",
          coupon: "4.875",
          maturityDate: new Date("2030-02-15"),
          currency: "USD",
          parValue: "1000",
          lastPrice: "105.67",
          ytm: "3.45",
          ytw: "3.45",
          duration: "7.2",
          convexity: "0.84",
          liquidityScore: "85",
          status: "outstanding",
          updatedAt: new Date(),
        },
        {
          id: "MSFT_2028_3125",
          isin: "US594918104",
          cusip: "594918BF4",
          issuer: "Microsoft Corp",
          description: "Microsoft Corp 3.125% 17-Nov-2028",
          bondType: "corporate",
          sector: "technology",
          rating: "AAA",
          coupon: "3.125",
          maturityDate: new Date("2028-11-17"),
          currency: "USD",
          parValue: "1000",
          lastPrice: "98.45",
          ytm: "3.78",
          ytw: "3.78",
          duration: "6.1",
          convexity: "0.72",
          liquidityScore: "92",
          status: "outstanding",
          updatedAt: new Date(),
        },
        {
          id: "GOOGL_2032_2875",
          isin: "US02079K107",
          cusip: "02079K305",
          issuer: "Alphabet Inc",
          description: "Alphabet Inc 2.875% 15-May-2032",
          bondType: "corporate",
          sector: "technology",
          rating: "AA+",
          coupon: "2.875",
          maturityDate: new Date("2032-05-15"),
          currency: "USD",
          parValue: "1000",
          lastPrice: "92.33",
          ytm: "4.12",
          ytw: "4.12",
          duration: "8.9",
          convexity: "1.15",
          liquidityScore: "78",
          status: "outstanding",
          updatedAt: new Date(),
        },
        {
          id: "JPM_2027_425",
          isin: "US46625HJL6",
          cusip: "46625HJL6",
          issuer: "JPMorgan Chase & Co",
          description: "JPMorgan Chase & Co 4.25% 01-Oct-2027",
          bondType: "corporate",
          sector: "financial",
          rating: "A",
          coupon: "4.25",
          maturityDate: new Date("2027-10-01"),
          currency: "USD",
          parValue: "1000",
          lastPrice: "101.22",
          ytm: "3.89",
          ytw: "3.89",
          duration: "4.8",
          convexity: "0.45",
          liquidityScore: "89",
          status: "outstanding",
          updatedAt: new Date(),
        },
        {
          id: "BAC_2026_375",
          isin: "US06051GHE4",
          cusip: "06051GHE4",
          issuer: "Bank of America Corp",
          description: "Bank of America Corp 3.75% 24-Apr-2026",
          bondType: "corporate",
          sector: "financial",
          rating: "A-",
          coupon: "3.75",
          maturityDate: new Date("2026-04-24"),
          currency: "USD",
          parValue: "1000",
          lastPrice: "99.87",
          ytm: "3.95",
          ytw: "3.95",
          duration: "3.2",
          convexity: "0.28",
          liquidityScore: "91",
          status: "outstanding",
          updatedAt: new Date(),
        }
      ];

      let addedCount = 0;
      for (const sampleBond of sampleBonds) {
        const existingBond = await storage.getBond(sampleBond.id);
        if (!existingBond) {
          await storage.createBond(sampleBond);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        log(`Added ${addedCount} sample bonds for development`);
      } else {
        log("Sample bond data already exists");
      }

      // Try to sync from Moment API (will fail gracefully if API endpoints are incorrect)
      try {
        log("Attempting to sync from Moment API...");
        const momentBonds = await momentApi.getInstruments({ status: "outstanding" });
        log(`Found ${momentBonds.length} bonds from Moment API`);
      } catch (error) {
        log(`Moment API sync failed - using sample data: ${error}`);
      }
      
    } catch (error) {
      log(`Failed to initialize bond data: ${error}`);
    }
  });
})();
