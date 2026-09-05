'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Phone, Mail, MapPin, Building2, Instagram, Facebook, Linkedin, Twitter, Star, RefreshCw, ChevronLeft } from 'lucide-react';
import { useSavedLeads } from '@/hooks/useSavedLeads';
import { toast } from 'sonner';

export function LeadDetail({ lead }: { lead: any }) {
  const router = useRouter();
  const { saveLead, unsaveLead, isSaved } = useSavedLeads();
  const [enriching, setEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<any>(null);

  const handleSave = async () => {
    if (isSaved(lead.id)) await unsaveLead(lead.id);
    else await saveLead(lead.id);
  };

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${lead.id}/enrich`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setEnrichmentStatus({ status: 'PENDING', jobId: data.data.jobId });
        toast.success('Enrichment job started');
        pollEnrichmentStatus(data.data.jobId);
      }
    } catch (error) {
      toast.error('Failed to start enrichment');
      setEnriching(false);
    }
  };

  const pollEnrichmentStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${lead.id}/enrich/status`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          setEnrichmentStatus(data.data);
          if (data.data.status === 'COMPLETED' || data.data.status === 'FAILED') {
            clearInterval(interval);
            setEnriching(false);
            if (data.data.status === 'COMPLETED') {
              toast.success('Enrichment completed');
              router.refresh();
            } else toast.error('Enrichment failed');
          }
        }
      } catch (error) {
        clearInterval(interval);
        setEnriching(false);
      }
    }, 2000);
  };

  const score = lead.opportunityScore?.score || 0;
  const scoreReasons = lead.opportunityScore?.reasons || [];
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{lead.name}</h1>
          <Badge variant="outline">{lead.category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Star className={`h-4 w-4 mr-2 ${isSaved(lead.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            {isSaved(lead.id) ? 'Saved' : 'Save'}
          </Button>
          <Button onClick={handleEnrich} disabled={enriching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${enriching ? 'animate-spin' : ''}`} />
            {enriching ? 'Enriching...' : 'Enrich'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <p className="text-sm text-muted-foreground">/ 100</p>
              <p className="text-sm font-medium mt-1">
                {score >= 75 ? 'High' : score >= 60 ? 'Medium' : 'Low'} Opportunity
              </p>
            </div>
            <div className="flex-1">
              <div className="space-y-1">
                {scoreReasons.map((reason: string, i: number) => (
                  <div key={i} className="text-sm">{reason}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.description && <p>{lead.description}</p>}
              <div className="flex flex-wrap gap-4">
                {lead.employeeRange && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.employeeRange} employees</span>
                  </div>
                )}
                {lead.locations?.map((loc: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {loc.city}, {loc.country}
                      {loc.region && `, ${loc.region}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {lead.signals?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.signals.map((signal: any, i: number) => (
                    <Badge key={i} variant="secondary">
                      {signal.type.replace(/_/g, ' ')}
                      {signal.value && `: ${signal.value}`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.contacts?.filter((c: any) => c.type === 'phone').map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{c.value}</span>
                  {c.source && <Badge variant="outline" className="text-xs">{c.source}</Badge>}
                </div>
              ))}
              {lead.contacts?.filter((c: any) => c.type === 'email').map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{c.value}</span>
                  {c.source && <Badge variant="outline" className="text-xs">{c.source}</Badge>}
                </div>
              ))}
              {(!lead.contacts || lead.contacts.length === 0) && (
                <p className="text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>

          {enrichmentStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Enrichment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status: {enrichmentStatus.status}</span>
                    <Badge className={enrichmentStatus.status === 'COMPLETED' ? 'bg-green-500 text-white' : ''}>
                      {enrichmentStatus.status}
                    </Badge>
                  </div>
                  {enrichmentStatus.progress !== undefined && (
                    <Progress value={enrichmentStatus.progress} className="h-2" />
                  )}
                  {enrichmentStatus.error && (
                    <p className="text-sm text-red-500">{enrichmentStatus.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.websites?.map((w: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {w.url}
                    </a>
                  </div>
                  {w.bookingProvider && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Booking: {w.bookingProvider}</Badge>
                    </div>
                  )}
                  {w.status && (
                    <div className="flex items-center gap-2">
                      <Badge variant={w.status === 200 ? 'default' : 'destructive'}>
                        Status: {w.status}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
              {(!lead.websites || lead.websites.length === 0) && (
                <p className="text-muted-foreground">No website found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.socials?.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  {s.platform === 'instagram' && <Instagram className="h-4 w-4" />}
                  {s.platform === 'facebook' && <Facebook className="h-4 w-4" />}
                  {s.platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                  {s.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {s.url}
                  </a>
                </div>
              ))}
              {(!lead.socials || lead.socials.length === 0) && (
                <p className="text-muted-foreground">No social media found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}