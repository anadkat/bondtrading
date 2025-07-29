import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBonds, useBondQuote } from "@/hooks/use-moment-api";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
  Signal
} from "lucide-react";

export function MarketData() {
  const [selectedBond, setSelectedBond] = useState<string>('');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [marketDataUpdates, setMarketDataUpdates] = useState<{ [key: string]: any }>({});

  const { data: bonds = [] } = useBonds();
  const { data: quote, refetch: refetchQuote } = useBondQuote(selectedBond);

  // WebSocket for real-time updates
  const { isConnected, lastMessage, subscribeToQuotes } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'quote_update') {
        setMarketDataUpdates(prev => ({
          ...prev,
          [message.bondId]: message.quote
        }));
      }
    }
  });

  // Subscribe to quotes for all bonds when connected
  useEffect(() => {
    if (isConnected && bonds.length > 0) {
      const bondIds = bonds.slice(0, 10).map(bond => bond.id); // Limit to prevent spam
      subscribeToQuotes(bondIds);
    }
  }, [isConnected, bonds.length]);

  // Mock market movers data
  const marketMovers = [
    {
      id: '1',
      issuer: 'Netflix Inc',
      bondType: '4.875% 2030',
      change: 2.34,
      price: 105.67,
      isPositive: true
    },
    {
      id: '2',
      issuer: 'General Motors',
      bondType: '5.25% 2026',
      change: -1.87,
      price: 97.23,
      isPositive: false
    },
    {
      id: '3',
      issuer: 'Bank of America',
      bondType: '3.499% 2028',
      change: 1.45,
      price: 99.87,
      isPositive: true
    },
    {
      id: '4',
      issuer: 'Walmart Inc',
      bondType: '2.55% 2026',
      change: 0.92,
      price: 96.45,
      isPositive: true
    }
  ];

  // Mock yield curve data
  const yieldCurveData = [
    { maturity: '3M', yield: 1.89 },
    { maturity: '6M', yield: 2.12 },
    { maturity: '1Y', yield: 2.45 },
    { maturity: '2Y', yield: 2.78 },
    { maturity: '5Y', yield: 3.23 },
    { maturity: '10Y', yield: 3.67 },
    { maturity: '20Y', yield: 4.01 },
    { maturity: '30Y', yield: 4.15 }
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-custom space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Market Data Center</h2>
          <p className="text-gray-400">Real-time bond market information and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Signal className={`h-4 w-4 ${isConnected ? 'text-cyber-green' : 'text-cyber-red'}`} />
            <span className={`text-sm ${isConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={liveUpdates ? 'border-cyber-green text-cyber-green' : 'border-gray-600'}
          >
            <Zap className="h-4 w-4 mr-2" />
            {liveUpdates ? 'Live Updates ON' : 'Live Updates OFF'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Book */}
        <Card className="cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Book</span>
              <div className="flex items-center space-x-2">
                <Select value={selectedBond} onValueChange={setSelectedBond}>
                  <SelectTrigger className="w-48 bg-dark-elevated border-dark-border">
                    <SelectValue placeholder="Select Bond" />
                  </SelectTrigger>
                  <SelectContent>
                    {bonds.slice(0, 10).map(bond => (
                      <SelectItem key={bond.id} value={bond.id}>
                        {bond.issuer} {bond.coupon ? `${parseFloat(bond.coupon).toFixed(2)}%` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => refetchQuote()}
                  className="border-cyber-blue/50 text-cyber-blue"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBond && quote ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Bids */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyber-green mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      BIDS
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-cyber-green">
                          {quote.bid_price?.toFixed(2) || 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">
                          {quote.bid_size ? `${(quote.bid_size / 1000).toFixed(0)}K` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm opacity-75">
                        <span className="font-mono text-cyber-green">
                          {quote.bid_price ? (quote.bid_price - 0.02).toFixed(2) : 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">500K</span>
                      </div>
                      <div className="flex justify-between text-sm opacity-50">
                        <span className="font-mono text-cyber-green">
                          {quote.bid_price ? (quote.bid_price - 0.04).toFixed(2) : 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">1M</span>
                      </div>
                    </div>
                  </div>

                  {/* Asks */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyber-red mb-3 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      ASKS
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-cyber-red">
                          {quote.ask_price?.toFixed(2) || 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">
                          {quote.ask_size ? `${(quote.ask_size / 1000).toFixed(0)}K` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm opacity-75">
                        <span className="font-mono text-cyber-red">
                          {quote.ask_price ? (quote.ask_price + 0.02).toFixed(2) : 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">600K</span>
                      </div>
                      <div className="flex justify-between text-sm opacity-50">
                        <span className="font-mono text-cyber-red">
                          {quote.ask_price ? (quote.ask_price + 0.04).toFixed(2) : 'N/A'}
                        </span>
                        <span className="font-mono text-gray-300">1.2M</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spread Info */}
                <div className="mt-6 p-4 bg-dark-elevated rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Bid-Ask Spread:</span>
                    <span className="text-sm font-mono text-cyber-amber">
                      {quote.bid_price && quote.ask_price 
                        ? `${(quote.ask_price - quote.bid_price).toFixed(4)} (${((quote.ask_price - quote.bid_price) / quote.ask_price * 100).toFixed(3)}%)`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {quote.ytm && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-400">YTM:</span>
                      <span className="text-sm font-mono text-cyber-blue">
                        {quote.ytm.toFixed(3)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Select a bond to view order book</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Movers */}
        <Card className="cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Top Movers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketMovers.map((mover) => (
                <div key={mover.id} className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg hover:bg-dark-border transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{mover.issuer}</p>
                    <p className="text-xs text-gray-400">{mover.bondType}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center text-sm ${mover.isPositive ? 'text-cyber-green' : 'text-cyber-red'}`}>
                      {mover.isPositive ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {mover.isPositive ? '+' : ''}{mover.change.toFixed(2)}%
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      {mover.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yield Curve */}
        <Card className="cyber-glow lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Treasury Yield Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart Placeholder */}
            <div className="h-64 bg-dark-elevated rounded-lg flex items-center justify-center grid-pattern mb-6">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-cyber-blue mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Yield curve visualization</p>
                <p className="text-xs text-gray-500">Real-time treasury yield data</p>
              </div>
            </div>

            {/* Yield Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {yieldCurveData.map((data) => (
                <div key={data.maturity} className="text-center p-3 bg-dark-elevated rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{data.maturity}</p>
                  <p className="text-sm font-mono text-cyber-blue">{data.yield.toFixed(2)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Feed */}
      {liveUpdates && (
        <Card className="cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Signal className="h-5 w-5 mr-2 text-cyber-green" />
              Live Market Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-custom">
              {Object.entries(marketDataUpdates).slice(-5).reverse().map(([bondId, data], index) => (
                <div key={`${bondId}-${index}`} className="flex items-center justify-between p-2 bg-dark-elevated rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Bond Update</span>
                  </div>
                  <div className="flex items-center space-x-4 font-mono">
                    <span className="text-cyber-green">
                      Bid: {data.bid_price?.toFixed(2) || 'N/A'}
                    </span>
                    <span className="text-cyber-red">
                      Ask: {data.ask_price?.toFixed(2) || 'N/A'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {Object.keys(marketDataUpdates).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Waiting for market data updates...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
