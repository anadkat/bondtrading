import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  StarOff,
  Info,
  Calendar,
  DollarSign
} from "lucide-react";
import { useAddToWatchlist, useRemoveFromWatchlist } from "@/hooks/use-moment-api";
import type { BondWithMarketData } from "@shared/schema";

interface BondCardProps {
  bond: BondWithMarketData;
  onBuy: () => void;
  onSell: () => void;
}

export function BondCard({ bond, onBuy, onSell }: BondCardProps) {
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

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

  const handleWatchlistToggle = () => {
    if (bond.isWatched) {
      removeFromWatchlist.mutate(bond.id);
    } else {
      addToWatchlist.mutate(bond.id);
    }
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
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleWatchlistToggle}
              >
                {bond.isWatched ? (
                  <Star className="h-4 w-4 text-cyber-amber fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mb-2">{bond.description}</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRatingColor(bond.rating)} text-white border-none`}
              >
                {bond.rating || "NR"}
              </Badge>
              <Badge variant="outline" className="text-xs border-gray-600">
                {bond.bondType}
              </Badge>
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
              {formatPercentage(bond.ytm)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-mono text-white">
                {lastPrice > 0 ? lastPrice.toFixed(2) : "N/A"}
              </p>
              {priceChange !== 0 && (
                <div className={`flex items-center text-xs ${isPositiveChange ? 'text-cyber-green' : 'text-cyber-red'}`}>
                  {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(priceChange).toFixed(2)}
                </div>
              )}
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
            className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
