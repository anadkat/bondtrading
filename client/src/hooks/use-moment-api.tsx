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

export function usePriceChart(id: string, params?: {
  start_date?: string;
  end_date?: string;
  granularity?: string;
}) {
  return useQuery({
    queryKey: ['/api/bonds', id, 'price-chart', params],
    queryFn: () => momentApi.getPriceChart(id, params),
    enabled: !!id,
  });
}

// Portfolio hooks
export function usePortfolio() {
  return useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: () => momentApi.getPortfolio(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAddToPortfolio() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.addToPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({
        title: "Success",
        description: "Bond added to portfolio",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "Order canceled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Watchlist hooks
export function useWatchlist() {
  return useQuery({
    queryKey: ['/api/watchlist'],
    queryFn: () => momentApi.getWatchlist(),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Added to watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.removeFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Removed from watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// System operations
export function useSyncBonds() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: momentApi.syncBonds,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonds'] });
      toast({
        title: "Sync Complete",
        description: `Synced ${data.syncedCount} new bonds from Moment API`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
