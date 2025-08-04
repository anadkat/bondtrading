import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBond, useBondQuote, useBondOrderBook, useBondHistoricalPrices } from "@/hooks/use-moment-api";
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
        <DialogContent className="max-w-4xl h-[80vh] bg-dark-card border-dark-border">
          <DialogHeader className="border-b border-dark-border pb-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building className="h-6 w-6 text-cyber-blue" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {bond.issuer}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono">
                    {bond.isin} | {bond.cusip || 'No CUSIP'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getRatingColor(bond.rating)} text-white border-0`}>
                  {bond.rating || 'NR'}
                </Badge>
                <Badge variant="outline" className="border-cyber-green text-cyber-green">
                  {bond.status}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="overview" className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-dark-elevated">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Market Data</TabsTrigger>
                <TabsTrigger value="historical">Historical</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Financial Details */}
                  <Card className="cyber-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Coupon Rate:</span>
                            <span className="font-mono text-cyber-green">{formatPercentage(bond.coupon)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Par Value:</span>
                            <span className="font-mono text-white">{formatCurrency(bond.parValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Currency:</span>
                            <span className="text-white">{bond.currency}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">YTM:</span>
                            <span className="font-mono text-cyber-blue">{formatPercentage(bond.ytm)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">YTW:</span>
                            <span className="font-mono text-cyber-amber">{formatPercentage(bond.ytw)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Price:</span>
                            <span className="font-mono text-white">{formatCurrency(bond.lastPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bond Information */}
                  <Card className="cyber-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Bond Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
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
                            <span className="text-gray-400">Maturity:</span>
                            <span className="text-white">{formatDate(bond.maturityDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Updated:</span>
                            <span className="text-white">{formatDate(bond.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                {bond.description && (
                  <Card className="cyber-glow">
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">
                        {bond.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

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

              <TabsContent value="pricing" className="space-y-6 mt-6">
                <Card className="cyber-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Market Data
                      <Badge variant="outline" className="ml-2 text-xs">Paper API</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Available Pricing Data */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Market Pricing Data
                          {quote?.status === 'estimated' && (
                            <Badge variant="outline" className="ml-2 text-xs border-cyber-amber text-cyber-amber">Estimated</Badge>
                          )}
                          {quote?.status === 'no_data_available' && (
                            <Badge variant="outline" className="ml-2 text-xs border-gray-500 text-gray-400">No Data</Badge>
                          )}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Best Bid</p>
                            <p className="text-xl font-mono text-cyber-green">
                              {quoteLoading ? (
                                <span className="text-sm">Loading...</span>
                              ) : quote?.bid_price ? (
                                formatCurrency(quote.bid_price.toString())
                              ) : (
                                bond?.lastPrice ? formatCurrency(bond.lastPrice) : 'N/A'
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {quote?.bid_size ? `Size: ${quote.bid_size.toLocaleString()}` : 
                               quote?.status === 'estimated' ? 'Estimated from bond data' :
                               quote?.status === 'no_data_available' ? 'No quote data' : 'Last known price'}
                            </p>
                          </div>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Best Ask</p>
                            <p className="text-xl font-mono text-cyber-red">
                              {quoteLoading ? (
                                <span className="text-sm">Loading...</span>
                              ) : quote?.ask_price ? (
                                formatCurrency(quote.ask_price.toString())
                              ) : (
                                'N/A'
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {quote?.ask_size ? `Size: ${quote.ask_size.toLocaleString()}` : 
                               quote?.status === 'estimated' ? 'Estimated from bond data' :
                               quote?.status === 'no_data_available' ? 'No quote data' : 'No quote available'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Bid Yield (YTM)</p>
                            <p className="text-xl font-mono text-cyber-blue">
                              {quote?.bid_yield_to_maturity ? 
                                formatPercentage(quote.bid_yield_to_maturity.toString()) : 
                                (bond?.ytm ? formatPercentage(bond.ytm) : 'N/A')
                              }
                            </p>
                            <p className="text-xs text-gray-400">Yield to Maturity</p>
                          </div>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Bid Yield (YTW)</p>
                            <p className="text-xl font-mono text-cyber-amber">
                              {quote?.bid_yield_to_worst ? 
                                formatPercentage(quote.bid_yield_to_worst.toString()) : 
                                (bond?.ytw ? formatPercentage(bond.ytw) : 'N/A')
                              }
                            </p>
                            <p className="text-xs text-gray-400">Yield to Worst</p>
                          </div>
                        </div>

                        {/* Order Book Summary */}
                        {orderBook && (orderBook.bids?.length > 0 || orderBook.asks?.length > 0) && (
                          <div className="mt-6">
                            <h5 className="text-sm font-semibold text-gray-300 mb-3">Order Book Activity</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-dark-elevated rounded-lg border border-cyber-green/20">
                                <p className="text-gray-400 text-sm mb-1">Total Bids</p>
                                <p className="text-lg font-mono text-cyber-green">
                                  {orderBook.bids?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400">Active buy orders</p>
                              </div>
                              <div className="p-3 bg-dark-elevated rounded-lg border border-cyber-red/20">
                                <p className="text-gray-400 text-sm mb-1">Total Asks</p>
                                <p className="text-lg font-mono text-cyber-red">
                                  {orderBook.asks?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400">Active sell orders</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Paper API Notice */}
                      <div className="p-4 bg-dark-elevated rounded-lg border border-cyber-amber/20">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-cyber-amber mt-0.5" />
                          <div>
                            <h5 className="text-sm font-medium text-cyber-amber mb-1">Paper API Environment</h5>
                            <p className="text-xs text-gray-400">
                              This demo uses Moment's Paper API environment. When live quotes aren't available, 
                              we generate estimated bid/ask spreads from bond data to demonstrate the interface. 
                              Production environments would show real-time market data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historical" className="space-y-6 mt-6">
                <Card className="cyber-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Historical Pricing (Last 30 Days)
                      <Badge variant="outline" className="ml-2 text-xs">Live Data</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pricesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyber-blue border-t-transparent mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading historical data...</p>
                      </div>
                    ) : historicalPrices?.data && historicalPrices.data.length > 0 ? (
                      <div className="space-y-6">
                        {/* Price Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Latest Price</p>
                            <p className="text-xl font-mono text-cyber-green">
                              ${historicalPrices.data[historicalPrices.data.length - 1]?.price?.toFixed(4) || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(historicalPrices.data[historicalPrices.data.length - 1]?.timestamp || '').toLocaleDateString()}
                            </p>
                          </div>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">30-Day Range</p>
                            <p className="text-sm font-mono text-white">
                              ${Math.min(...historicalPrices.data.map(p => p.price || 0)).toFixed(4)} - ${Math.max(...historicalPrices.data.map(p => p.price || 0)).toFixed(4)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {historicalPrices.count || historicalPrices.data.length} data points
                            </p>
                          </div>
                        </div>

                        {/* Recent Price Points */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Prices</h4>
                          <div className="max-h-64 overflow-y-auto scrollbar-custom">
                            <div className="space-y-2">
                              {historicalPrices.data.slice(-10).reverse().map((point, index) => (
                                <div key={point.timestamp || index} className="flex justify-between items-center p-3 bg-dark-elevated rounded">
                                  <div>
                                    <p className="text-white font-mono text-sm">${point.price?.toFixed(4) || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">{new Date(point.timestamp || '').toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    {point.yield_to_maturity && (
                                      <p className="text-cyber-blue font-mono text-sm">{point.yield_to_maturity.toFixed(3)}%</p>
                                    )}
                                    {point.yield_to_worst && (
                                      <p className="text-cyber-amber font-mono text-xs">{point.yield_to_worst.toFixed(3)}% YTW</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price Statistics */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-3">Price Statistics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-dark-elevated rounded-lg">
                              <p className="text-gray-400 text-sm mb-1">Average Price</p>
                              <p className="text-lg font-mono text-white">
                                ${(historicalPrices.data.reduce((sum, p) => sum + (p.price || 0), 0) / historicalPrices.data.length).toFixed(4)}
                              </p>
                              <p className="text-xs text-gray-400">30-day average</p>
                            </div>
                            <div className="p-3 bg-dark-elevated rounded-lg">
                              <p className="text-gray-400 text-sm mb-1">Price Volatility</p>
                              <p className="text-lg font-mono text-cyber-amber">
                                {(() => {
                                  const prices = historicalPrices.data.map(p => p.price || 0);
                                  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
                                  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
                                  return (Math.sqrt(variance) / avg * 100).toFixed(2);
                                })()}%
                              </p>
                              <p className="text-xs text-gray-400">Standard deviation</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No Historical Data</h3>
                        <p className="text-gray-400">Historical pricing data is not available for this bond in the paper environment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        bond={bond}
        action={orderAction}
      />
    </>
  );
}