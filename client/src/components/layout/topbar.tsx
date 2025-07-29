import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  RefreshCw,
  Settings,
  User
} from "lucide-react";

interface TopBarProps {
  title: string;
  onToggleSidebar: () => void;
  onSyncBonds: () => void;
  isSyncing: boolean;
}

export function TopBar({ 
  title, 
  onToggleSidebar, 
  onSyncBonds, 
  isSyncing 
}: TopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd implement theme switching logic here
  };

  return (
    <header className="bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400">Real-time bond market overview</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search bonds, ISINs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-elevated border-dark-border w-80 pr-10 focus:border-cyber-blue"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        
        {/* Sync Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncBonds}
          disabled={isSyncing}
          className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </Button>
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-400 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-400 hover:text-white"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-dark-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Demo User</p>
            <p className="text-xs text-gray-400">Paper Trading</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-green rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
