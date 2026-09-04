'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Phone, Mail, Globe } from 'lucide-react';
import { apiData } from '@/lib/api';

interface CampaignLead {
  id: string;
  status: string;
  business: {
    id: string;
    name: string;
    category: string;
    locations?: { city: string; country: string }[];
    contacts?: { type: string; value: string }[];
    websites?: { url: string }[];
  };
}

interface CampaignDetail {
  id: string;
  name: string;
  description?: string;
  leads: CampaignLead[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: campaign, isLoading } = useQuery<CampaignDetail>({
    queryKey: ['campaign', id],
    queryFn: () => apiData<CampaignDetail>(`/api/campaigns/${id}`),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button className="mt-4" onClick={() => router.push('/campaigns')}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const leads = campaign.leads || [];
  const statusCounts = leads.reduce((acc: Record<string, number>, item: CampaignLead) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/campaigns')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        <Badge>{leads.length} leads</Badge>
      </div>

      {campaign.description && (
        <p className="text-muted-foreground">{campaign.description}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-center text-muted-foreground">No leads in this campaign</p>
          ) : (
            <div className="space-y-2">
              {leads.map((item: CampaignLead) => {
                const business = item.business;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{business.name}</span>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{business.category}</span>
                        {business.locations?.[0] && (
                          <span>{business.locations[0].city}, {business.locations[0].country}</span>
                        )}
                        {business.contacts?.some((c) => c.type === 'phone') && (
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
                        )}
                        {business.contacts?.some((c) => c.type === 'email') && (
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
                        )}
                        {business.websites && business.websites.length > 0 && (
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Website</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/leads/${business.id}`)}
                    >
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}