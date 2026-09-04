'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Globe, Star } from 'lucide-react';
import { apiData } from '@/lib/api';

interface Contact {
  type: string;
  value: string;
}

interface Location {
  city: string;
  country: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  locations?: Location[];
  employeeRange?: string;
  contacts?: Contact[];
  websites?: { url: string }[];
  tags?: { tagId: string; tag: { name: string } }[];
}

interface SavedLead {
  id: string;
  status: string;
  business: Business;
}

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads, isLoading } = useQuery<SavedLead[]>({
    queryKey: ['saved-leads'],
    queryFn: () => apiData<SavedLead[]>('/api/leads/saved')
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Star className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No saved leads</h3>
        <p className="text-sm text-muted-foreground">
          Search for businesses and save the best opportunities
        </p>
        <Button className="mt-4" onClick={() => router.push('/search')}>
          Search Businesses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Leads</h1>
        <p className="text-muted-foreground">{leads.length} leads saved</p>
      </div>

      <div className="grid gap-4">
        {leads.map((item: SavedLead) => {
          const business = item.business;
          return (
            <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">{business.category}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {business.locations?.[0] && (
                    <span>{business.locations[0].city}, {business.locations[0].country}</span>
                  )}
                  {business.employeeRange && (
                    <span>{business.employeeRange} employees</span>
                  )}
                  {business.contacts?.some((c: Contact) => c.type === 'phone') && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </span>
                  )}
                  {business.contacts?.some((c: Contact) => c.type === 'email') && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                  )}
                  {business.websites && business.websites.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Website
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {business.tags?.map((tag: any) => (
                      <Badge key={tag.tagId} variant="secondary" className="text-xs">
                        {tag.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/leads/${business.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}