'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { apiData } from '@/lib/api';

interface LeadDetailData {
  id: string;
  name: string;
  category: string;
  // ... other fields
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: lead, isLoading, error } = useQuery<LeadDetailData>({
    queryKey: ['lead', id],
    queryFn: () => apiData<LeadDetailData>(`/api/leads/${id}`),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load lead details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <LeadDetail lead={lead} />
    </div>
  );
}