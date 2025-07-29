import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Search, 
  Briefcase, 
  ListChecks, 
  TrendingUp, 
  Calculator,
  Wifi,
  WifiOff
} from "lucide-react";

type Section = 'dashboard' | 'screener' | 'portfolio' | 'orders' | 'market' | 'analytics';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ 
  activeSection, 
  onSectionChange, 
  collapsed,
  onCollapsedChange 
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Section, label: 'Command Center', icon: BarChart3 },
    { id: 'screener' as Section, label: 'Bond Screener', icon: Search },
    { id: 'portfolio' as Section, label: 'Portfolio', icon: Briefcase },
    { id: 'orders' as Section, label: 'Order Management', icon: ListChecks },
    { id: 'market' as Section, label: 'Market Data', icon: TrendingUp },
    { id: 'analytics' as Section, label: 'Analytics', icon: Calculator },
  ];

  return (
    <div className={cn(
      "bg-dark-card border-r border-dark-border transition-all duration-300 overflow-hidden",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-green rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-cyber-blue">MOMENT</h1>
              <p className="text-xs text-gray-400">Bond Trading Platform</p>
            </div>
          )}
        </div>
        
        {/* System Status */}
        {!collapsed && (
          <div className="mt-4 p-3 bg-dark-elevated rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">SYSTEM STATUS</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-cyber-green rounded-full status-indicator mr-2"></div>
                <span className="text-xs text-cyber-green">ONLINE</span>
              </div>
            </div>
            <div className="text-xs text-gray-300">
              <div>Uptime: 99.97%</div>
              <div>Market Data: <span className="text-cyber-green">LIVE</span></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                  "hover:bg-dark-elevated",
                  isActive && "border-l-2 border-cyber-blue bg-dark-elevated"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "mr-3 flex-shrink-0",
                  isActive ? "text-cyber-blue" : "text-gray-400"
                )} size={20} />
                {!collapsed && (
                  <span className={cn(
                    isActive ? "text-white" : "text-gray-300"
                  )}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* API Status */}
        {!collapsed && (
          <div className="mt-8 p-4 bg-dark-elevated rounded-lg border border-dark-border">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">API Connection</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Environment:</span>
                <span className="text-cyber-amber">PAPER</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Endpoint:</span>
                <div className="flex items-center">
                  <Wifi className="h-3 w-3 text-cyber-green mr-1" />
                  <span className="text-cyber-green">CONNECTED</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latency:</span>
                <span className="text-cyber-green">12ms</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
