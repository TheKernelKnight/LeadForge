'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

interface SearchFiltersType {
  category: string;
  country: string;
  city: string;
  employeeRange: string;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  // ... other fields
}

interface SearchResponse {
  data: {
    items: SearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    category: '',
    country: '',
    city: '',
    employeeRange: '',
    hasWebsite: false,
    hasPhone: false,
    hasEmail: false
  });

  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);

  const searchMutation = useMutation({
    mutationFn: (params: SearchFiltersType) =>
      apiRequest<SearchResponse>('/api/search', {
        method: 'POST',
        body: JSON.stringify({ ...params, page, limit: 25 })
      }),
    onSuccess: (data) => {
      setResults(data.data);
      toast.success(`Found ${data.data.pagination.total} businesses`);
    },
    onError: (error: any) => {
      toast.error('Search failed: ' + error.message);
    }
  });

  const handleSearch = () => {
    searchMutation.mutate(filters);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Search Businesses</h1>
        <p className="text-muted-foreground">Find businesses that need your services</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
        />

        <div>
          {results ? (
            <SearchResults
              results={results}
              page={page}
              onPageChange={setPage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Start Searching</h3>
              <p className="text-sm text-muted-foreground">
                Apply filters and click search to find businesses
              </p>
              <Button className="mt-4" onClick={handleSearch} disabled={searchMutation.isPending}>
                {searchMutation.isPending ? 'Searching...' : 'Search Now'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}