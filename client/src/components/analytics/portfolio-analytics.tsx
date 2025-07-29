import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortfolio } from "@/hooks/use-moment-api";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Target,
  Calendar,
  AlertTriangle,
  Download,
  Calculator
} from "lucide-react";

export function PortfolioAnalytics() {
  const { data: portfolio } = usePortfolio();
  
  const summary = portfolio?.summary;
  const holdings = portfolio?.holdings || [];

  // Mock analytics data - in real app would be calculated from holdings
  const riskMetrics = {
    modifiedDuration: summary?.modifiedDuration || 3.67,
    effectiveDuration: 3.72,
    convexity: 14.23,
    portfolioPD: 0.045, // Probability of default
    expectedLoss: 1284,
    var95: 45000, // Value at Risk 95%
    creditRisk: 'Low'
  };

  const performanceMetrics = {
    totalReturn: summary?.totalReturnPercent || 8.24,
    incomeReturn: 4.83,
    priceReturn: 3.41,
    volatility30d: 2.14,
    sharpeRatio: 1.67,
    informationRatio: 0.89
  };

  const sectorAllocation = [
    { sector: 'Technology', percentage: 42, color: 'bg-cyber-blue' },
    { sector: 'Financial', percentage: 25, color: 'bg-cyber-green' },
    { sector: 'Government', percentage: 18, color: 'bg-cyber-amber' },
    { sector: 'Healthcare', percentage: 15, color: 'bg-cyber-red' }
  ];

  const ratingDistribution = [
    { rating: 'AAA', percentage: 30, color: 'text-cyber-green' },
    { rating: 'AA+', percentage: 45, color: 'text-cyber-blue' },
    { rating: 'A', percentage: 25, color: 'text-cyber-amber' }
  ];

  const maturityBuckets = [
    { bucket: '0-2 Years', percentage: 20 },
    { bucket: '2-5 Years', percentage: 35 },
    { bucket: '5-10 Years', percentage: 30 },
    { bucket: '10+ Years', percentage: 15 }
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-custom space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Portfolio Analytics</h2>
          <p className="text-gray-400">Advanced risk metrics and performance analysis</p>
        </div>
        <Button variant="outline" className="border-cyber-blue text-cyber-blue">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Duration & Convexity Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Duration & Convexity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Modified Duration</p>
                  <p className="text-3xl font-bold font-mono text-cyber-blue">
                    {riskMetrics.modifiedDuration.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Years</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Effective Duration</p>
                  <p className="text-3xl font-bold font-mono text-cyber-green">
                    {riskMetrics.effectiveDuration.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Years</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Convexity</p>
                  <p className="text-3xl font-bold font-mono text-cyber-amber">
                    {riskMetrics.convexity.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Positive</p>
                </div>
              </div>

              {/* Duration Breakdown by Holdings */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Duration by Holdings</h4>
                <div className="space-y-3">
                  {holdings.slice(0, 3).map((holding: any, index: number) => {
                    const duration = 4.12 - (index * 0.5); // Mock calculation
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Position {index + 1}</span>
                        <div className="flex items-center space-x-3">
                          <Progress 
                            value={duration * 20} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-mono text-cyber-blue w-12">
                            {duration.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {holdings.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <p>No holdings to analyze</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Risk Analysis */}
          <Card className="cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Credit Risk Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credit Rating Distribution */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4">Rating Distribution</h4>
                  <div className="space-y-3">
                    {ratingDistribution.map((item) => (
                      <div key={item.rating} className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${item.color}`}>
                          {item.rating}
                        </span>
                        <div className="flex items-center space-x-3">
                          <Progress 
                            value={item.percentage} 
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-mono text-gray-300 w-10">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Default Risk Metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4">Default Risk Metrics</h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-dark-elevated rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Portfolio PD (1Y)</p>
                      <p className="text-lg font-mono text-cyber-green">
                        {riskMetrics.portfolioPD.toFixed(3)}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-dark-elevated rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Expected Loss</p>
                      <p className="text-lg font-mono text-cyber-amber">
                        ${riskMetrics.expectedLoss.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-dark-elevated rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">VaR (95%)</p>
                      <p className="text-lg font-mono text-cyber-red">
                        ${riskMetrics.var95.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Allocation */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card className="cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Return (YTD)</p>
                <p className="text-xl font-mono text-cyber-green">
                  +{performanceMetrics.totalReturn.toFixed(2)}%
                </p>
              </div>
              
              <div className="text-center p-4 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Income Return</p>
                <p className="text-xl font-mono text-cyber-blue">
                  +{performanceMetrics.incomeReturn.toFixed(2)}%
                </p>
              </div>
              
              <div className="text-center p-4 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Price Return</p>
                <p className="text-xl font-mono text-cyber-green">
                  +{performanceMetrics.priceReturn.toFixed(2)}%
                </p>
              </div>
              
              <div className="text-center p-4 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Volatility (30D)</p>
                <p className="text-xl font-mono text-cyber-amber">
                  {performanceMetrics.volatility30d.toFixed(2)}%
                </p>
              </div>

              <div className="text-center p-4 bg-dark-elevated rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Sharpe Ratio</p>
                <p className="text-xl font-mono text-cyber-blue">
                  {performanceMetrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sector Allocation */}
          <Card className="cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorAllocation.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{sector.sector}</span>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={sector.percentage} 
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-mono text-gray-300 w-8">
                        {sector.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maturity Profile */}
          <Card className="cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Maturity Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maturityBuckets.map((bucket) => (
                  <div key={bucket.bucket} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{bucket.bucket}</span>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={bucket.percentage} 
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-mono text-gray-300 w-8">
                        {bucket.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Alerts */}
      <Card className="cyber-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-cyber-amber" />
            Risk Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="h-4 w-4 text-cyber-green mr-2" />
                <span className="text-sm font-medium text-cyber-green">Credit Quality</span>
              </div>
              <p className="text-xs text-gray-300">
                Portfolio maintains strong credit quality with 75% investment grade bonds.
              </p>
            </div>

            <div className="p-4 bg-cyber-amber/10 border border-cyber-amber/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="h-4 w-4 text-cyber-amber mr-2" />
                <span className="text-sm font-medium text-cyber-amber">Duration Risk</span>
              </div>
              <p className="text-xs text-gray-300">
                Moderate duration risk. Consider laddering for rate protection.
              </p>
            </div>

            <div className="p-4 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-4 w-4 text-cyber-blue mr-2" />
                <span className="text-sm font-medium text-cyber-blue">Diversification</span>
              </div>
              <p className="text-xs text-gray-300">
                Good sector diversification. Consider adding international exposure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
