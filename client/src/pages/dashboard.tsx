import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { BondScreener } from "@/components/bond/bond-screener";
import { OrderManagement } from "@/components/orders/order-management";
import { useWebSocket } from "@/hooks/use-websocket";

type Section = 'screener' | 'orders';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('screener');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      // Handle real-time market data updates
    },
    onOpen: () => {
      // Connected to real-time data feed
    }
  });

  const sectionTitles = {
    screener: 'Bond Screener',
    orders: 'Order Management'
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'screener':
        return <BondScreener />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <BondScreener />;
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
          onSyncBonds={() => {}} 
          isSyncing={false}
        />
        
        <main className="flex-1 overflow-hidden p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}