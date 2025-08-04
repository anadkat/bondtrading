import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders, useBond } from "@/hooks/use-moment-api";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Calendar,
  DollarSign
} from "lucide-react";

export function OrderManagement() {
  const { data: allOrders = [] } = useOrders();
  const { data: activeOrders = [] } = useOrders('pending');

  const [selectedTab, setSelectedTab] = useState('active');

  // Calculate order statistics
  const orderStats = {
    active: allOrders.filter(order => order.status === 'pending' || order.status === 'working').length,
    filled: allOrders.filter(order => order.status === 'filled').length,
    canceled: allOrders.filter(order => order.status === 'canceled').length,
    volume: allOrders
      .filter(order => order.status === 'filled')
      .reduce((sum, order) => sum + parseFloat(order.quantity || '0'), 0)
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'working':
        return <Badge className="bg-cyber-amber/20 text-cyber-amber border-cyber-amber/50">PENDING</Badge>;
      case 'filled':
        return <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/50">FILLED</Badge>;
      case 'canceled':
        return <Badge className="bg-cyber-red/20 text-cyber-red border-cyber-red/50">CANCELED</Badge>;
      case 'rejected':
        return <Badge className="bg-cyber-red/20 text-cyber-red border-cyber-red/50">REJECTED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const getSideIcon = (side: string) => {
    return side === 'buy' ? (
      <TrendingUp className="h-4 w-4 text-cyber-green" />
    ) : (
      <TrendingDown className="h-4 w-4 text-cyber-red" />
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-custom space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Order Management</h2>
          <p className="text-gray-400">Track and manage your bond trading orders</p>
        </div>
        <Button className="bg-cyber-blue hover:bg-cyber-blue/80">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Active Orders</h3>
                <p className="text-2xl font-bold font-mono text-cyber-amber">{orderStats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-cyber-amber" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Filled Today</h3>
                <p className="text-2xl font-bold font-mono text-cyber-green">{orderStats.filled}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-cyber-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Canceled</h3>
                <p className="text-2xl font-bold font-mono text-cyber-red">{orderStats.canceled}</p>
              </div>
              <XCircle className="h-8 w-8 text-cyber-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Volume Today</h3>
                <p className="text-xl font-bold font-mono text-cyber-blue">
                  ${(orderStats.volume / 1000000).toFixed(1)}M
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-cyber-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="cyber-glow">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 bg-dark-elevated">
              <TabsTrigger value="active" className="data-[state=active]:bg-cyber-blue">
                Active ({orderStats.active})
              </TabsTrigger>
              <TabsTrigger value="filled" className="data-[state=active]:bg-cyber-green">
                Filled ({orderStats.filled})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyber-amber">
                All History ({allOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-0">
              <OrderTable 
                orders={allOrders.filter(order => order.status === 'pending' || order.status === 'working')}
                getStatusBadge={getStatusBadge}
                getSideIcon={getSideIcon}
              />
            </TabsContent>

            <TabsContent value="filled" className="mt-0">
              <OrderTable 
                orders={allOrders.filter(order => order.status === 'filled')}
                getStatusBadge={getStatusBadge}
                getSideIcon={getSideIcon}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <OrderTable 
                orders={allOrders}
                getStatusBadge={getStatusBadge}
                getSideIcon={getSideIcon}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface OrderTableProps {
  orders: any[];
  getStatusBadge: (status: string) => JSX.Element;
  getSideIcon: (side: string) => JSX.Element;
}

function OrderTable({ orders, getStatusBadge, getSideIcon }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Orders</h3>
        <p className="text-gray-400">No orders found for this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-custom">
      <table className="w-full">
        <thead className="bg-dark-elevated border-b border-dark-border">
          <tr>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Order ID
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Security
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Side
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Quantity
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {orders.map((order, index) => (
            <tr key={order.id} className="hover:bg-dark-elevated transition-colors">
              <td className="py-4 px-6">
                <div className="text-sm font-mono text-cyber-blue">
                  #{order.id}
                </div>
              </td>
              <td className="py-4 px-6">
                <BondInfo bondId={order.bond_id} />
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  {getSideIcon(order.action)}
                  <span className={`text-sm font-medium ${
                    order.action === 'buy' ? 'text-cyber-green' : 'text-cyber-red'
                  }`}>
                    {order.action?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="text-sm font-mono text-gray-300">
                  ${parseFloat(order.quantity || '0').toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="text-sm font-mono text-gray-300">
                  {order.order_type === 'market' ? 'Market Price' : 
                   order.price ? `$${parseFloat(order.price).toFixed(2)}` : 'N/A'}
                </div>
              </td>
              <td className="py-4 px-6">
                {getStatusBadge(order.status)}
              </td>
              <td className="py-4 px-6">
                <div className="text-sm text-gray-300">
                  {new Date(order.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BondInfo({ bondId }: { bondId: string }) {
  const { data: bond, isLoading } = useBond(bondId);
  
  if (isLoading) {
    return (
      <div>
        <div className="text-sm font-medium text-white">Loading...</div>
        <div className="text-sm text-gray-400">{bondId}</div>
      </div>
    );
  }
  
  if (!bond) {
    return (
      <div>
        <div className="text-sm font-medium text-white">{bondId}</div>
        <div className="text-sm text-gray-400">Bond details unavailable</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="text-sm font-medium text-white">
        {bond.issuer}
      </div>
      <div className="text-sm text-gray-400">
        {bond.description || bond.isin}
      </div>
    </div>
  );
}
