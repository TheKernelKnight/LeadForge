'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Globe, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { useSavedLeads } from '@/hooks/useSavedLeads';

export function SearchResults({ results, page, onPageChange }: any) {
  const router = useRouter();
  const { saveLead, unsaveLead, isSaved } = useSavedLeads();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleSave = async (businessId: string) => {
    if (isSaved(businessId)) await unsaveLead(businessId);
    else await saveLead(businessId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!results?.items?.length) return <div className="text-center py-12"><p className="text-muted-foreground">No businesses found</p><p className="text-sm text-muted-foreground">Try adjusting your filters</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{results.pagination.total} businesses found</p>
        <div className="flex gap-2"><Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}>Cards</Button><Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>Table</Button></div>
      </div>
      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {results.items.map((business: any) => (
            <Card key={business.id} className="cursor-pointer hover:shadow-lg transition-shadow"><CardContent className="p-4">
              <div className="flex items-start justify-between"><div><h3 className="font-semibold">{business.name}</h3><p className="text-sm text-muted-foreground">{business.category}</p></div><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSave(business.id); }}><Star className={`h-4 w-4 ${isSaved(business.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} /></Button></div>
              <div className="mt-2 space-y-1 text-sm">{business.locations?.[0] && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3 w-3" /><span>{business.locations[0].city}, {business.locations[0].country}</span></div>}{business.contacts?.some((c: any) => c.type === 'phone') && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /><span>Phone available</span></div>}{business.contacts?.some((c: any) => c.type === 'email') && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /><span>Email available</span></div>}</div>
              <div className="mt-3 flex flex-wrap gap-1">{business.websites?.map((w: any) => <Badge key={w.url} variant="outline" className="text-xs"><Globe className="mr-1 h-3 w-3" />{w.url.replace('https://', '').replace('http://', '')}</Badge>)}{business.employeeRange && <Badge variant="outline" className="text-xs"><Building2 className="mr-1 h-3 w-3" />{business.employeeRange}</Badge>}</div>
              <div className="mt-3 flex items-center justify-between"><div><span className="text-sm font-medium">Opportunity</span><span className={`ml-2 text-lg font-bold ${getScoreColor(business.opportunityScore?.score || 0)}`}>{business.opportunityScore?.score || 0}/100</span></div><Button size="sm" onClick={() => router.push(`/leads/${business.id}`)}>View Lead</Button></div>
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead>Employees</TableHead><TableHead>Contact</TableHead><TableHead>Score</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{results.items.map((business: any) => (<TableRow key={business.id}><TableCell className="font-medium">{business.name}</TableCell><TableCell>{business.category}</TableCell><TableCell>{business.locations?.[0]?.city}, {business.locations?.[0]?.country}</TableCell><TableCell>{business.employeeRange || '-'}</TableCell><TableCell>{business.contacts?.some((c: any) => c.type === 'phone') && <Phone className="inline h-4 w-4 mr-1" />}{business.contacts?.some((c: any) => c.type === 'email') && <Mail className="inline h-4 w-4" />}</TableCell><TableCell><span className={`font-bold ${getScoreColor(business.opportunityScore?.score || 0)}`}>{business.opportunityScore?.score || 0}</span></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => router.push(`/leads/${business.id}`)}>View</Button></TableCell></TableRow>))}</TableBody></Table></div>
      )}
      {results.pagination.totalPages > 1 && <div className="flex justify-center gap-2 mt-4"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span className="flex items-center px-4 text-sm">Page {page} of {results.pagination.totalPages}</span><Button variant="outline" size="sm" disabled={page === results.pagination.totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></div>}
    </div>
  );
}
