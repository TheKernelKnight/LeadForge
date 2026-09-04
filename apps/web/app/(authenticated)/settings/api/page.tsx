'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function APISettingsPage() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground">Manage your API keys and integrations</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input 
                  value="sk_test_placeholder_remove_this" 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline"
                  onClick={() => handleCopy('sk_test_placeholder_remove_this')}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your API key secure. Do not share it publicly.
              </p>
            </div>
            <Button variant="outline">Regenerate API Key</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Base URL</p>
              <code className="text-xs bg-muted p-1 rounded">
                {apiUrl}/api
              </code>
            </div>
            <div>
              <p className="text-sm font-medium">Health Check</p>
              <code className="text-xs bg-muted p-1 rounded">
                GET /health
              </code>
            </div>
            <div>
              <p className="text-sm font-medium">Search</p>
              <code className="text-xs bg-muted p-1 rounded">
                POST /search
              </code>
            </div>
            <div>
              <p className="text-sm font-medium">Leads</p>
              <code className="text-xs bg-muted p-1 rounded">
                GET /leads/saved
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}