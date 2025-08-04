import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBond } from "@/hooks/use-moment-api";
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
              <TabsList className="grid w-full grid-cols-2 bg-dark-elevated">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Market Data</TabsTrigger>
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
                          Available Pricing Data
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Last Price</p>
                            <p className="text-xl font-mono text-cyber-green">
                              {bond?.lastPrice ? formatCurrency(bond.lastPrice) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">Last known price</p>
                          </div>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Yield to Worst</p>
                            <p className="text-xl font-mono text-cyber-blue">
                              {bond?.ytw ? formatPercentage(bond.ytw) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">YTW</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Yield to Maturity</p>
                            <p className="text-xl font-mono text-cyber-amber">
                              {bond?.ytm ? formatPercentage(bond.ytm) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">YTM</p>
                          </div>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Par Value</p>
                            <p className="text-xl font-mono text-white">
                              {bond?.parValue ? formatCurrency(bond.parValue) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">Face value</p>
                          </div>
                        </div>
                      </div>

                      {/* Paper API Notice */}
                      <div className="p-4 bg-dark-elevated rounded-lg border border-cyber-amber/20">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-cyber-amber mt-0.5" />
                          <div>
                            <h5 className="text-sm font-medium text-cyber-amber mb-1">Paper API Environment</h5>
                            <p className="text-xs text-gray-400">
                              Real-time quotes, order books, and historical pricing are not available in the paper environment. 
                              The data shown is static bond information from the Moment API.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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