import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSavedLeads() {
  const queryClient = useQueryClient();
  const { data: savedLeads } = useQuery({
    queryKey: ['saved-leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads/saved', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch saved leads');
      const data = await res.json();
      return data.data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await fetch(`/api/leads/${businessId}/save`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to save lead');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['saved-leads'] }); toast.success('Lead saved'); },
    onError: () => toast.error('Failed to save lead')
  });

  const unsaveMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await fetch(`/api/leads/${businessId}/save`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to unsave lead');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['saved-leads'] }); toast.success('Lead removed'); },
    onError: () => toast.error('Failed to remove lead')
  });

  const isSaved = (businessId: string) => savedLeads?.some((lead: any) => lead.businessId === businessId) || false;
  return { savedLeads, isSaved, saveLead: saveMutation.mutateAsync, unsaveLead: unsaveMutation.mutateAsync, isLoading: saveMutation.isPending || unsaveMutation.isPending };
}
