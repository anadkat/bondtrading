import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBond, useBondQuote, useBondHistoricalPrices, useBondOrderBook } from "@/hooks/use-moment-api";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Percent, 
  Shield, 
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info,
  Star
} from "lucide-react";
import { OrderModal } from "./order-modal";

interface BondDetailsModalProps {
  bondId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BondDetailsModal({ bondId, isOpen, onClose }: BondDetailsModalProps) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderAction, setOrderAction] = useState<'buy' | 'sell'>('buy');

  const { data: bond, isLoading: bondLoading } = useBond(bondId || '');
  const { data: quote, isLoading: quoteLoading } = useBondQuote(bondId || '');
  const { data: orderBook, isLoading: orderBookLoading } = useBondOrderBook(bondId || '');
  
  // Historical pricing - last 30 days
  const endDate = new Date().toISOString().split('T')[0]; // Today
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
  const { data: historicalPrices, isLoading: pricesLoading } = useBondHistoricalPrices(
    bondId || '', 
    startDate, 
    endDate, 
    '1day'
  );

  if (!bondId) return null;

  const formatCurrency = (amount?: string | null) => {
    if (!amount) return "N/A";
    return `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value?: string | null) => {
    if (!value) return "N/A";
    return `${parseFloat(value).toFixed(3)}%`;
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getRatingColor = (rating?: string | null) => {
    if (!rating) return "bg-gray-500";
    if (rating.startsWith('AAA') || rating.startsWith('AA')) return "bg-cyber-green";
    if (rating.startsWith('A')) return "bg-cyber-blue";
    if (rating.startsWith('BBB')) return "bg-cyber-amber";
    return "bg-cyber-red";
  };

  const openOrderModal = (action: 'buy' | 'sell') => {
    setOrderAction(action);
    setOrderModalOpen(true);
  };

  if (bondLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] bg-dark-card border-dark-border">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyber-blue border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading bond details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!bond) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] bg-dark-card border-dark-border">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Bond details not found</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{bond.issuer}</h2>
                <p className="text-gray-400 text-sm">{bond.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-cyber-blue text-cyber-blue">
                  {bond.sector}
                </Badge>
                {bond.rating && (
                  <Badge className={`${getRatingColor(bond.rating)} text-white`}>
                    {bond.rating}
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-dark-elevated">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Market Data</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto scrollbar-custom mt-4">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Key Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="cyber-glow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                            <Percent className="h-5 w-5 text-cyber-blue" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Coupon Rate</p>
                            <p className="text-lg font-mono text-white">{formatPercentage(bond.coupon)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cyber-glow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-cyber-green" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Maturity Date</p>
                            <p className="text-lg font-mono text-white">{formatDate(bond.maturityDate)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cyber-glow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-cyber-amber" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Par Value</p>
                            <p className="text-lg font-mono text-white">{formatCurrency(bond.parValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cyber-glow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Currency</p>
                            <p className="text-lg font-mono text-white">{bond.currency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bond Details */}
                  <Card className="cyber-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Bond Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">ISIN:</span>
                            <span className="font-mono text-white">{bond.isin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">CUSIP:</span>
                            <span className="font-mono text-white">{bond.cusip || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bond Type:</span>
                            <span className="text-white capitalize">{bond.bondType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge variant="outline" className="border-cyber-green text-cyber-green">
                              {bond.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sector:</span>
                            <span className="text-white">{bond.sector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rating:</span>
                            <span className="text-white">{bond.rating || 'Not Rated'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Updated:</span>
                            <span className="text-white">{formatDate(bond.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => openOrderModal('buy')}
                      className="flex-1 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green/50"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy Order
                    </Button>
                    <Button
                      onClick={() => openOrderModal('sell')}
                      variant="outline"
                      className="flex-1 border-cyber-red/50 text-cyber-red hover:bg-cyber-red/10"
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Sell Order
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6 mt-0">
                  <Card className="cyber-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Order Book & Market Data
                        <Badge variant="outline" className="ml-2 text-xs">Paper API</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orderBookLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyber-blue border-t-transparent mx-auto mb-2"></div>
                          <p className="text-gray-400">Loading order book...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Current Market Data - Show first with real data */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Current Market Data
                              {historicalPrices?.data && historicalPrices.data.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs border-cyber-green text-cyber-green">Live Data</Badge>
                              )}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="p-3 bg-dark-elevated rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Latest Price</p>
                                <p className="text-xl font-mono text-cyber-green">
                                  {historicalPrices?.data && historicalPrices.data.length > 0 
                                    ? `$${historicalPrices.data[historicalPrices.data.length - 1]?.price.toFixed(4)}`
                                    : 'N/A'
                                  }
                                </p>
                                <p className="text-xs text-gray-400">
                                  {historicalPrices?.data && historicalPrices.data.length > 0 
                                    ? new Date(historicalPrices.data[historicalPrices.data.length - 1]?.timestamp).toLocaleDateString()
                                    : 'No data'
                                  }
                                </p>
                              </div>
                              <div className="p-3 bg-dark-elevated rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Current YTW</p>
                                <p className="text-xl font-mono text-cyber-blue">
                                  {historicalPrices?.data && historicalPrices.data.length > 0 && historicalPrices.data[historicalPrices.data.length - 1]?.yield_to_worst
                                    ? `${historicalPrices.data[historicalPrices.data.length - 1].yield_to_worst.toFixed(3)}%`
                                    : bond?.ytw ? formatPercentage(bond.ytw) : 'N/A'
                                  }
                                </p>
                                <p className="text-xs text-gray-400">Yield to Worst</p>
                              </div>
                            </div>

                            {/* Estimated Bid/Ask Spreads */}
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-300 mb-2">Market Spreads</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="p-3 bg-dark-elevated rounded-lg border border-cyber-green/20">
                                <p className="text-gray-400 text-sm mb-1">Est. Bid</p>
                                <p className="text-lg font-mono text-cyber-green">
                                  {historicalPrices?.data && historicalPrices.data.length > 0 
                                    ? `$${(historicalPrices.data[historicalPrices.data.length - 1].price * 0.9995).toFixed(4)}`
                                    : 'Loading...'
                                  }
                                </p>
                                <p className="text-xs text-gray-400">Estimated from latest price</p>
                              </div>
                              <div className="p-3 bg-dark-elevated rounded-lg border border-cyber-red/20">
                                <p className="text-gray-400 text-sm mb-1">Est. Ask</p>
                                <p className="text-lg font-mono text-cyber-red">
                                  {historicalPrices?.data && historicalPrices.data.length > 0 
                                    ? `$${(historicalPrices.data[historicalPrices.data.length - 1].price * 1.0005).toFixed(4)}`
                                    : 'Loading...'
                                  }
                                </p>
                                <p className="text-xs text-gray-400">Estimated from latest price</p>
                              </div>
                            </div>

                          </div>

                          {/* Order Book */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Live Order Book
                              <Badge variant="outline" className="ml-2 text-xs">Paper API</Badge>
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Bids */}
                              <div>
                                <h5 className="text-xs font-medium text-cyber-green mb-2 uppercase">Bids ({orderBook?.bids?.length || 0})</h5>
                                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-custom">
                                  {orderBook?.bids && orderBook.bids.length > 0 ? (
                                    orderBook.bids.slice(0, 10).map((bid, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 bg-dark-elevated rounded text-sm">
                                        <span className="font-mono text-cyber-green">${bid.price.toFixed(4)}</span>
                                        <span className="font-mono text-white">{bid.size.toLocaleString()}</span>
                                        {bid.yield_to_maturity && (
                                          <span className="font-mono text-cyber-blue text-xs">{bid.yield_to_maturity.toFixed(3)}%</span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-6 bg-dark-elevated rounded">
                                      <p className="text-gray-400 text-sm">No active bids</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Asks */}
                              <div>
                                <h5 className="text-xs font-medium text-cyber-red mb-2 uppercase">Asks ({orderBook?.asks?.length || 0})</h5>
                                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-custom">
                                  {orderBook?.asks && orderBook.asks.length > 0 ? (
                                    orderBook.asks.slice(0, 10).map((ask, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 bg-dark-elevated rounded text-sm">
                                        <span className="font-mono text-cyber-red">${ask.price.toFixed(4)}</span>
                                        <span className="font-mono text-white">{ask.size.toLocaleString()}</span>
                                        {ask.yield_to_maturity && (
                                          <span className="font-mono text-cyber-blue text-xs">{ask.yield_to_maturity.toFixed(3)}%</span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-6 bg-dark-elevated rounded">
                                      <p className="text-gray-400 text-sm">No active asks</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Order Book Status */}
                            <div className="mt-4 p-3 bg-dark-elevated rounded-lg">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-white">
                                  {orderBook?.bids?.length === 0 && orderBook?.asks?.length === 0 
                                    ? 'No active orders (Paper API)' 
                                    : `${orderBook?.bids?.length || 0} bids, ${orderBook?.asks?.length || 0} asks`
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-gray-400">Last Updated:</span>
                                <span className="text-gray-300">
                                  {orderBook?.timestamp ? new Date(orderBook.timestamp).toLocaleTimeString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Historical Pricing */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Historical Pricing (Last 30 Days)
                            </h4>
                            {pricesLoading ? (
                              <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyber-blue border-t-transparent mx-auto mb-2"></div>
                                <p className="text-gray-400 text-sm">Loading historical data...</p>
                              </div>
                            ) : historicalPrices?.data && historicalPrices.data.length > 0 ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-dark-elevated rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Latest Price</p>
                                    <p className="text-xl font-mono text-cyber-green">
                                      ${historicalPrices.data[historicalPrices.data.length - 1]?.price.toFixed(4)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(historicalPrices.data[historicalPrices.data.length - 1]?.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-dark-elevated rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">30-Day Range</p>
                                    <p className="text-sm font-mono text-white">
                                      ${Math.min(...historicalPrices.data.map(p => p.price)).toFixed(4)} - ${Math.max(...historicalPrices.data.map(p => p.price)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {historicalPrices.count} data points
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Recent Price Points */}
                                <div>
                                  <p className="text-gray-400 text-sm mb-2">Recent Prices</p>
                                  <div className="max-h-48 overflow-y-auto scrollbar-custom">
                                    <div className="space-y-2">
                                      {historicalPrices.data.slice(-10).reverse().map((point, index) => (
                                        <div key={point.timestamp} className="flex justify-between items-center p-2 bg-dark-elevated rounded">
                                          <div>
                                            <p className="text-white font-mono text-sm">${point.price.toFixed(4)}</p>
                                            <p className="text-xs text-gray-400">{new Date(point.timestamp).toLocaleDateString()}</p>
                                          </div>
                                          <div className="text-right">
                                            {point.yield_to_worst && (
                                              <p className="text-cyber-blue font-mono text-sm">{point.yield_to_worst.toFixed(3)}%</p>
                                            )}
                                            <p className="text-xs text-gray-400">YTW</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">No historical pricing data available</p>
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      {bond && (
        <OrderModal
          bond={bond}
          action={orderAction}
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
        />
      )}
    </>
  );
}