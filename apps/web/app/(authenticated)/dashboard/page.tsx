'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Target, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { apiData } from '@/lib/api';

// Define the shape of the stats data
interface StatsData {
  totalLeads: number;
  savedLeads: number;
  highOpportunity: number;
  activeCampaigns: number;
}

// Define the shape of search history items
interface SearchItem {
  id: string;
  query: {
    category?: string;
    country?: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiData<StatsData>('/api/user/stats')
  });

  const { data: searches } = useQuery<SearchItem[]>({
    queryKey: ['recent-searches'],
    queryFn: () => apiData<SearchItem[]>('/api/search/history')
  });

  // Default values if stats is undefined
  const totalLeads = stats?.totalLeads ?? 0;
  const savedLeads = stats?.savedLeads ?? 0;
  const highOpportunity = stats?.highOpportunity ?? 0;
  const activeCampaigns = stats?.activeCampaigns ?? 0;

  const statsData = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Saved Leads',
      value: savedLeads,
      icon: Target,
      color: 'text-purple-500'
    },
    {
      label: 'High Opportunity',
      value: highOpportunity,
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      label: 'Active Campaigns',
      value: activeCampaigns,
      icon: TrendingUp,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to LeadForge</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {searches && searches.length > 0 ? (
            <div className="space-y-2">
              {searches.slice(0, 5).map((search: SearchItem) => (
                <div key={search.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {search.query?.category || 'All'} • {search.query?.country || 'Anywhere'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent searches</p>
          )}
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={() => router.push('/search')}
          >
            Search Businesses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}