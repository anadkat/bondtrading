import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Info,
  Calendar,
  DollarSign
} from "lucide-react";
import type { BondWithMarketData } from "@/types/bond";

interface BondCardProps {
  bond: BondWithMarketData;
  onBuy: () => void;
  onSell: () => void;
  onViewDetails: () => void;
}

export function BondCard({ bond, onBuy, onSell, onViewDetails }: BondCardProps) {

  const getRatingColor = (rating?: string | null) => {
    if (!rating) return "bg-gray-500";
    if (rating.startsWith('AAA') || rating.startsWith('AA')) return "bg-cyber-green";
    if (rating.startsWith('A')) return "bg-cyber-blue";
    if (rating.startsWith('BBB')) return "bg-cyber-amber";
    return "bg-cyber-red";
  };

  const formatCurrency = (amount?: string | null) => {
    if (!amount) return "N/A";
    return `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value?: string | null) => {
    if (!value) return "N/A";
    return `${parseFloat(value).toFixed(3)}%`;
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };


  const lastPrice = parseFloat(bond.lastPrice || "0");
  const priceChange = 0; // Would calculate from historical data
  const isPositiveChange = priceChange >= 0;

  return (
    <Card className="cyber-glow hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white group-hover:text-cyber-blue transition-colors">
                {bond.issuer}
              </h3>
            </div>
            <p className="text-sm text-gray-400 mb-2">{bond.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRatingColor(bond.rating)} text-white border-none`}
              >
                {bond.rating || "NR"}
              </Badge>
              <Badge variant="outline" className="text-xs border-gray-600 capitalize">
                {bond.bondType}
              </Badge>
              {bond.sector && (
                <Badge variant="outline" className="text-xs border-cyber-blue/30 text-cyber-blue">
                  {bond.sector.toLowerCase().replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Coupon</p>
            <p className="text-sm font-mono text-white">
              {formatPercentage(bond.coupon)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Maturity</p>
            <p className="text-sm font-mono text-white">
              {formatDate(bond.maturityDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">YTM</p>
            <p className="text-sm font-mono text-cyber-blue">
              {bond.ytm ? formatPercentage(bond.ytm) : (
                <span className="text-gray-400 text-xs">View Details</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-mono text-white">
                {lastPrice > 0 ? lastPrice.toFixed(2) : (
                  <span className="text-gray-400 text-xs">View Details</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Market Data */}
        {bond.marketData && (
          <div className="pt-2 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Bid: </span>
                <span className="text-cyber-green font-mono">
                  {bond.marketData.bidPrice ? parseFloat(bond.marketData.bidPrice).toFixed(2) : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Ask: </span>
                <span className="text-cyber-red font-mono">
                  {bond.marketData.askPrice ? parseFloat(bond.marketData.askPrice).toFixed(2) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ISIN/CUSIP */}
        <div className="text-xs text-gray-400 font-mono bg-dark-elevated rounded px-2 py-1">
          {bond.isin} {bond.cusip && `• ${bond.cusip}`}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={onBuy}
            className="flex-1 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green/50"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            BUY
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSell}
            className="flex-1 border-cyber-red/50 text-cyber-red hover:bg-cyber-red/10"
          >
            <TrendingDown className="h-4 w-4 mr-1" />
            SELL
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
            title="View live pricing, yields, and historical data"
          >
            <Info className="h-4 w-4 mr-1" />
            <span className="text-xs">Details</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
