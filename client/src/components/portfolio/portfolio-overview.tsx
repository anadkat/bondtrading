import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolio, useAddToPortfolio } from "@/hooks/use-moment-api";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  Plus,
  Minus,
  Calendar,
  Target
} from "lucide-react";

export function PortfolioOverview() {
  const { data: portfolio, isLoading } = usePortfolio();
  const addToPortfolio = useAddToPortfolio();

  const summary = portfolio?.summary;
  const holdings = portfolio?.holdings || [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyber-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-custom space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Portfolio Management</h2>
          <p className="text-gray-400">Monitor your bond holdings and performance</p>
        </div>
        <Button className="bg-cyber-blue hover:bg-cyber-blue/80">
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyber-blue" />
              </div>
              <div className="text-right">
                <div className={`flex items-center text-sm ${
                  (summary?.totalReturnPercent || 0) >= 0 ? 'text-cyber-green' : 'text-cyber-red'
                }`}>
                  {(summary?.totalReturnPercent || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {summary?.totalReturnPercent ? `${summary.totalReturnPercent.toFixed(2)}%` : '0.00%'}
                </div>
                <span className="text-xs text-gray-400">
                  ${summary?.totalReturn?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-2">Total Portfolio Value</h3>
            <p className="text-3xl font-bold font-mono text-cyber-blue">
              ${summary?.totalValue?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-cyber-green" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-cyber-green">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +0.12%
                </div>
                <span className="text-xs text-gray-400">vs benchmark</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-2">Annual Yield</h3>
            <p className="text-3xl font-bold font-mono text-cyber-green">
              {summary?.averageYield?.toFixed(2) || '0.00'}%
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-cyber-amber" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-400">
                  <Minus className="h-4 w-4 mr-1" />
                  Stable
                </div>
                <span className="text-xs text-gray-400">risk level</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-2">Modified Duration</h3>
            <p className="text-3xl font-bold font-mono text-cyber-amber">
              {summary?.modifiedDuration?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="cyber-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Holdings</span>
            <Badge variant="outline" className="border-cyber-blue text-cyber-blue">
              {holdings.length} positions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {holdings.length === 0 ? (
            <div className="text-center py-16">
              <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Holdings</h3>
              <p className="text-gray-400 mb-6">Start building your bond portfolio</p>
              <Button className="bg-cyber-blue hover:bg-cyber-blue/80">
                <Plus className="h-4 w-4 mr-2" />
                Add First Position
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-custom">
              <table className="w-full">
                <thead className="bg-dark-elevated border-b border-dark-border">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cost Basis
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {holdings.map((holding: any, index: number) => {
                    const currentValue = parseFloat(holding.currentValue || '0');
                    const costBasis = parseFloat(holding.costBasis || '0');
                    const pnl = currentValue - costBasis;
                    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                    const weight = summary?.totalValue ? (currentValue / summary.totalValue) * 100 : 0;

                    return (
                      <tr key={holding.id} className="hover:bg-dark-elevated transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm font-medium text-white">
                              Bond {index + 1}
                            </div>
                            <div className="text-sm text-gray-400">
                              Portfolio Position
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-mono text-gray-300">
                            ${parseFloat(holding.quantity || '0').toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-mono text-white">
                            ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-mono text-gray-300">
                            ${costBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`text-sm font-mono ${pnl >= 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className={`text-xs ${pnl >= 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-mono text-gray-300">
                            {weight.toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
                            >
                              Manage
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      {holdings.length > 0 && (
        <Card className="cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-dark-elevated rounded-lg flex items-center justify-center grid-pattern">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-cyber-blue mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Portfolio performance chart</p>
                <p className="text-xs text-gray-500">Historical value and return visualization</p>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">1 Month</p>
                <p className="text-sm font-mono text-cyber-green">+2.34%</p>
              </div>
              <div className="text-center p-3 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">3 Months</p>
                <p className="text-sm font-mono text-cyber-green">+7.12%</p>
              </div>
              <div className="text-center p-3 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">YTD</p>
                <p className="text-sm font-mono text-cyber-green">
                  +{summary?.totalReturnPercent?.toFixed(2) || '0.00'}%
                </p>
              </div>
              <div className="text-center p-3 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">1 Year</p>
                <p className="text-sm font-mono text-cyber-blue">+12.89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
