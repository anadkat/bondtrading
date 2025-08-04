import { Button } from "@/components/ui/button";
import { 
  Menu, 
  RefreshCw,
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
