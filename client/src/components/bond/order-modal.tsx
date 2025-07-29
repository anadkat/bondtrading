import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubmitOrder, useBondQuote } from "@/hooks/use-moment-api";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  AlertTriangle,
  DollarSign,
  Clock
} from "lucide-react";
import type { BondWithMarketData } from "@shared/schema";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bond: BondWithMarketData;
  action: 'buy' | 'sell';
}

export function OrderModal({ isOpen, onClose, bond, action }: OrderModalProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const submitOrder = useSubmitOrder();
  const { data: quote } = useBondQuote(bond.id, parseInt(quantity) || 1000000);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderType('market');
      setQuantity('');
      setLimitPrice('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitOrder.mutateAsync({
        bondId: bond.id,
        side: action,
        orderType,
        quantity,
        ...(orderType === 'limit' && { limitPrice }),
      });

      toast({
        title: "Order Submitted",
        description: `${action.toUpperCase()} order for ${bond.issuer} submitted successfully`,
      });

      onClose();
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedPrice = orderType === 'market' 
    ? (action === 'buy' ? quote?.ask_price : quote?.bid_price) || parseFloat(bond.lastPrice || '0')
    : parseFloat(limitPrice || '0');

  const estimatedValue = estimatedPrice * parseFloat(quantity || '0');
  const accruedInterest = estimatedValue * 0.002; // Simplified calculation
  const commission = Math.max(25, estimatedValue * 0.0001);
  const totalAmount = action === 'buy' 
    ? estimatedValue + accruedInterest + commission
    : estimatedValue - accruedInterest - commission;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-dark-card border-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg">
            {action === 'buy' ? (
              <TrendingUp className="h-5 w-5 text-cyber-green mr-2" />
            ) : (
              <TrendingDown className="h-5 w-5 text-cyber-red mr-2" />
            )}
            {action.toUpperCase()} Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bond Information */}
          <Card className="bg-dark-elevated border-dark-border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{bond.issuer}</h3>
                  <Badge 
                    variant="secondary" 
                    className="bg-cyber-blue/20 text-cyber-blue border-none"
                  >
                    {bond.rating || "NR"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{bond.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>ISIN: {bond.isin}</span>
                  <span>Coupon: {bond.coupon ? `${parseFloat(bond.coupon).toFixed(3)}%` : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity (Par Value)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1,000,000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-dark-elevated border-dark-border"
                min="1000"
                step="1000"
              />
            </div>
          </div>

          {orderType === 'limit' && (
            <div>
              <Label htmlFor="limitPrice">Limit Price</Label>
              <Input
                id="limitPrice"
                type="number"
                placeholder="100.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-dark-elevated border-dark-border"
                step="0.01"
              />
            </div>
          )}

          {/* Market Data */}
          {quote && (
            <Card className="bg-dark-elevated border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Clock className="h-4 w-4 text-cyber-blue mr-2" />
                  <span className="text-sm font-medium">Current Market</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Bid: </span>
                    <span className="text-cyber-green font-mono">
                      {quote.bid_price?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ask: </span>
                    <span className="text-cyber-red font-mono">
                      {quote.ask_price?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">YTM: </span>
                    <span className="text-cyber-blue font-mono">
                      {quote.ytm?.toFixed(3)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">YTW: </span>
                    <span className="text-cyber-amber font-mono">
                      {quote.ytw?.toFixed(3)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          {quantity && estimatedPrice > 0 && (
            <Card className="bg-dark-elevated border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Calculator className="h-4 w-4 text-cyber-amber mr-2" />
                  <span className="text-sm font-medium">Order Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Par Value:</span>
                    <span className="font-mono text-white">
                      ${parseFloat(quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-mono text-white">
                      {estimatedPrice.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Value:</span>
                    <span className="font-mono text-white">
                      ${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accrued Interest:</span>
                    <span className="font-mono text-white">
                      ${accruedInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission:</span>
                    <span className="font-mono text-white">
                      ${commission.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-dark-border pt-2 flex justify-between font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="font-mono text-cyber-blue">
                      ${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Warning */}
          <div className="flex items-start space-x-2 p-3 bg-cyber-amber/10 border border-cyber-amber/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-cyber-amber mt-0.5 flex-shrink-0" />
            <div className="text-xs text-cyber-amber">
              <p className="font-medium mb-1">Trading Risk Notice</p>
              <p>Bond trading involves risk. Past performance is not indicative of future results. This is a paper trading environment.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${action === 'buy' 
                ? 'bg-cyber-green hover:bg-cyber-green/80' 
                : 'bg-cyber-red hover:bg-cyber-red/80'
              } text-white`}
              disabled={isSubmitting || !quantity}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  {action === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
