import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { BondScreener } from "@/components/bond/bond-screener";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { OrderManagement } from "@/components/orders/order-management";
import { MarketData } from "@/components/market/market-data";
import { PortfolioAnalytics } from "@/components/analytics/portfolio-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolio, useOrders, useSyncBonds } from "@/hooks/use-moment-api";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Clock,
  BarChart3
} from "lucide-react";

type Section = 'dashboard' | 'screener' | 'portfolio' | 'orders' | 'market' | 'analytics';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: portfolio } = usePortfolio();
  const { data: orders } = useOrders();
  const syncBonds = useSyncBonds();

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      console.log('Real-time update:', message);
      // Handle real-time market data updates
    },
    onOpen: () => {
      console.log('Connected to real-time data feed');
    }
  });

  const sectionTitles = {
    dashboard: 'Command Center',
    screener: 'Bond Screener',
    portfolio: 'Portfolio Management',
    orders: 'Order Management',
    market: 'Market Data Center',
    analytics: 'Portfolio Analytics'
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'screener':
        return <BondScreener />;
      case 'portfolio':
        return <PortfolioOverview />;
      case 'orders':
        return <OrderManagement />;
      case 'market':
        return <MarketData />;
      case 'analytics':
        return <PortfolioAnalytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={sectionTitles[activeSection]}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSyncBonds={() => syncBonds.mutate()}
          isSyncing={syncBonds.isPending}
        />
        
        <main className="flex-1 overflow-hidden p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { data: portfolio } = usePortfolio();
  const { data: activeOrders } = useOrders('pending');

  const summary = portfolio?.summary;
  const holdings = portfolio?.holdings || [];

  return (
    <div className="h-full overflow-y-auto scrollbar-custom space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyber-blue" />
              </div>
              <span className="text-cyber-green text-sm">
                {summary?.totalReturnPercent && summary.totalReturnPercent > 0 ? '+' : ''}
                {summary?.totalReturnPercent?.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Portfolio Value</h3>
            <p className="text-2xl font-bold font-mono text-white">
              ${summary?.totalValue?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-cyber-green" />
              </div>
              <span className="text-cyber-green text-sm">ACTIVE</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Active Bonds</h3>
            <p className="text-2xl font-bold font-mono text-white">
              {summary?.activeBonds || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-cyber-amber" />
              </div>
              <span className="text-cyber-amber text-sm">PENDING</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Open Orders</h3>
            <p className="text-2xl font-bold font-mono text-white">
              {activeOrders?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyber-red/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-cyber-red" />
              </div>
              <span className="text-cyber-green text-sm">STABLE</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Avg Yield</h3>
            <p className="text-2xl font-bold font-mono text-white">
              {summary?.averageYield?.toFixed(2) || '0.00'}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* Market Activity */}
        <div className="lg:col-span-2">
          <Card className="cyber-glow h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Market Activity</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-cyber-blue/20 text-cyber-blue rounded-lg text-sm">1D</button>
                  <button className="px-3 py-1 text-gray-400 hover:text-white rounded-lg text-sm">1W</button>
                  <button className="px-3 py-1 text-gray-400 hover:text-white rounded-lg text-sm">1M</button>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="flex-1 bg-dark-elevated rounded-lg flex items-center justify-center mb-6 grid-pattern min-h-64">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-cyber-blue mx-auto mb-4" />
                  <p className="text-gray-400">Portfolio performance chart</p>
                  <p className="text-xs text-gray-500 mt-2">Real-time market data visualization</p>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Holdings</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-custom">
                  {holdings.slice(0, 3).map((holding: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyber-green rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-white">Bond {index + 1}</p>
                          <p className="text-xs text-gray-400">Portfolio Holding</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-cyber-green">
                          ${parseFloat(holding.currentValue || '0').toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {((parseFloat(holding.currentValue || '0') - parseFloat(holding.costBasis)) / parseFloat(holding.costBasis) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {holdings.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>No portfolio holdings</p>
                      <p className="text-sm mt-2">Start by purchasing some bonds</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio Summary & Quick Actions */}
        <div className="space-y-6">
          {/* Portfolio Allocation */}
          <Card className="cyber-glow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Return</span>
                  <span className="text-sm font-mono text-cyber-green">
                    {summary?.totalReturnPercent ? `+${summary.totalReturnPercent.toFixed(2)}%` : '0.00%'}
                  </span>
                </div>
                <div className="w-full bg-dark-elevated rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyber-blue to-cyber-green h-2 rounded-full" 
                    style={{ width: `${Math.max(0, Math.min(100, (summary?.totalReturnPercent || 0) * 2))}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Duration</span>
                  <span className="text-sm font-mono text-cyber-amber">
                    {summary?.modifiedDuration?.toFixed(2) || '0.00'} yrs
                  </span>
                </div>
                <div className="w-full bg-dark-elevated rounded-full h-2">
                  <div 
                    className="bg-cyber-amber h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (summary?.modifiedDuration || 0) * 20)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Diversification</span>
                  <span className="text-sm font-mono text-cyber-green">Good</span>
                </div>
                <div className="w-full bg-dark-elevated rounded-full h-2">
                  <div className="bg-cyber-green h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="cyber-glow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-blue font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Search Bonds
                </button>
                <button className="w-full bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Quick Buy
                </button>
                <button className="w-full bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Portfolio Review
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
