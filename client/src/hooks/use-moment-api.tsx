import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Bond hooks
export function useBonds(filters?: {
  bondType?: string;
  rating?: string;
  sector?: string;
  currency?: string;
  minYield?: number;
  maxYield?: number;
  minMaturity?: number;
  maxMaturity?: number;
}) {
  return useQuery({
    queryKey: ['/api/bonds', filters],
    queryFn: () => momentApi.searchBonds(filters || {}),
    staleTime: 30000, // 30 seconds
  });
}

export function useBond(id: string) {
  return useQuery({
    queryKey: ['/api/bonds', id],
    queryFn: () => momentApi.getBond(id),
    enabled: !!id,
  });
}

export function useBondQuote(id: string, quantity?: number) {
  return useQuery({
    queryKey: ['/api/bonds', id, 'quote', quantity],
    queryFn: () => momentApi.getBondQuote(id, quantity),
    enabled: !!id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useBondOrderBook(id: string) {
  return useQuery({
    queryKey: ['/api/bonds', id, 'order-book'],
    queryFn: () => momentApi.getBondOrderBook(id),
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds for order book updates
  });
}



// Order hooks
export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['/api/orders', status],
    queryFn: () => momentApi.getOrders(status),
    refetchInterval: 5000, // Refresh every 5 seconds for active orders
  });
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.submitOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({
        title: "Success",
        description: "Order submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}



