import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BondCard } from "./bond-card";
import { OrderModal } from "./order-modal";
import { useBonds } from "@/hooks/use-moment-api";
import { Search, Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import type { BondWithMarketData } from "@shared/schema";

export function BondScreener() {
  const [filters, setFilters] = useState({
    bondType: "all",
    rating: "all",
    sector: "all",
    currency: "USD",
    minYield: 0,
    maxYield: 0,
    minMaturity: 0,
    maxMaturity: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBond, setSelectedBond] = useState<BondWithMarketData | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderAction, setOrderAction] = useState<'buy' | 'sell'>('buy');

  const { data: bonds = [], isLoading, error } = useBonds(filters);

  const handleFilterChange = (key: string, value: string | number) => {
    if (key === 'minYield' || key === 'maxYield' || key === 'minMaturity' || key === 'maxMaturity') {
      setFilters(prev => ({ ...prev, [key]: typeof value === 'string' ? parseFloat(value) || 0 : value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const clearFilters = () => {
    setFilters({
      bondType: "all",
      rating: "all",
      sector: "all",
      currency: "USD",
      minYield: 0,
      maxYield: 0,
      minMaturity: 0,
      maxMaturity: 0,
    });
  };

  const openOrderModal = (bond: BondWithMarketData, action: 'buy' | 'sell') => {
    setSelectedBond(bond);
    setOrderAction(action);
    setOrderModalOpen(true);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">Failed to load bonds</p>
            <p className="text-sm text-gray-400">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Bond Screener</h2>
        <p className="text-gray-400">Advanced filtering and search for fixed income securities</p>
      </div>

      {/* Filters */}
      <Card className="cyber-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bondType">Bond Type</Label>
              <Select value={filters.bondType} onValueChange={(value) => handleFilterChange('bondType', value)}>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="treasury">Treasury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rating">Credit Rating</Label>
              <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="AAA">AAA</SelectItem>
                  <SelectItem value="AA">AA</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="BBB">BBB</SelectItem>
                  <SelectItem value="BB">BB</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maturity">Maturity (Years)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minMaturity}
                  onChange={(e) => handleFilterChange('minMaturity', e.target.value)}
                  className="bg-dark-elevated border-dark-border"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMaturity}
                  onChange={(e) => handleFilterChange('maxMaturity', e.target.value)}
                  className="bg-dark-elevated border-dark-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="yield">Yield to Maturity (%)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Min"
                  value={filters.minYield}
                  onChange={(e) => handleFilterChange('minYield', e.target.value)}
                  className="bg-dark-elevated border-dark-border"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Max"
                  value={filters.maxYield}
                  onChange={(e) => handleFilterChange('maxYield', e.target.value)}
                  className="bg-dark-elevated border-dark-border"
                />
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Select value={filters.sector} onValueChange={(value) => handleFilterChange('sector', value)}>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button 
                onClick={clearFilters}
                variant="outline" 
                className="flex-1 border-gray-600"
              >
                Clear Filters
              </Button>
              <Button 
                className="flex-1 bg-cyber-blue hover:bg-cyber-blue/80"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="cyber-glow flex-1 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search Results</CardTitle>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {isLoading ? 'Loading...' : `Showing ${Array.isArray(bonds) ? bonds.length : 0} bonds`}
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading bonds...</p>
              </div>
            </div>
          ) : !Array.isArray(bonds) || bonds.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No bonds found</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-custom p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.isArray(bonds) && bonds.map((bond: BondWithMarketData) => (
                  <BondCard
                    key={bond.id}
                    bond={bond}
                    onBuy={() => openOrderModal(bond, 'buy')}
                    onSell={() => openOrderModal(bond, 'sell')}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modal */}
      {selectedBond && (
        <OrderModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          bond={selectedBond}
          action={orderAction}
        />
      )}
    </div>
  );
}
