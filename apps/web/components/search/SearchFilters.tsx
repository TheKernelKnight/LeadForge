'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = ['Salon', 'Restaurant', 'Gym', 'Dentist', 'Hotel', 'Real estate', 'Law firm', 'Marketing agency', 'Software agency'];
const countries = ['France', 'United Kingdom', 'Germany', 'Spain', 'United States', 'Canada', 'Algeria'];
const employeeRanges = ['1-10', '11-25', '26-50', '51-100', '100-500', '500+'];

export function SearchFilters({ filters, onChange, onSearch, isLoading }: any) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <Label>Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onChange({ ...filters, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Country</Label>
        <Select
          value={filters.country}
          onValueChange={(value) => onChange({ ...filters, country: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>City</Label>
        <Input
          placeholder="Enter city"
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
        />
      </div>

      <div>
        <Label>Employee Range</Label>
        <Select
          value={filters.employeeRange}
          onValueChange={(value) => onChange({ ...filters, employeeRange: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {employeeRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Online Presence</Label>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.hasWebsite}
              onCheckedChange={(checked) => onChange({ ...filters, hasWebsite: !!checked })}
            />
            <Label className="text-sm">Has Website</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.hasPhone}
              onCheckedChange={(checked) => onChange({ ...filters, hasPhone: !!checked })}
            />
            <Label className="text-sm">Has Phone</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.hasEmail}
              onCheckedChange={(checked) => onChange({ ...filters, hasEmail: !!checked })}
            />
            <Label className="text-sm">Has Email</Label>
          </div>
        </div>
      </div>

      {/* REMOVED: Booking Provider section */}

      <Button className="w-full" onClick={onSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
}