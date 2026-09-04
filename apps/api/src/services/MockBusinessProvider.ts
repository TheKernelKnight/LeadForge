export interface BusinessSearchParams {
  query?: string;
  category?: string;
  country?: string;
  region?: string;
  city?: string;
  employeeRange?: string;
  hasWebsite?: boolean;
  hasPhone?: boolean;
  hasEmail?: boolean;
  bookingProvider?: string;
  page?: number;
  limit?: number;
}

export interface BusinessResult {
  id: string;
  name: string;
  category?: string;
  description?: string;
  employeeCount?: number;
  employeeRange?: string;
  locations: { country?: string; region?: string; city?: string; postalCode?: string; }[];
  contacts: { type: string; value: string; source?: string; }[];
  websites: { url: string; bookingProvider?: string; }[];
  socials: { platform: string; url: string; }[];
  signals: { type: string; value?: string; confidence?: number; }[];
}

const mockBusinesses: BusinessResult[] = [
  {
    id: '1',
    name: 'Paris Hair Studio',
    category: 'Salon',
    description: 'Modern hair salon in central Paris',
    employeeCount: 5,
    employeeRange: '1-10',
    locations: [{ country: 'France', city: 'Paris' }],
    contacts: [
      { type: 'phone', value: '+33 1 23 45 67 89', source: 'mock' },
      { type: 'email', value: 'contact@parishairstudio.fr', source: 'mock' }
    ],
    websites: [{ url: 'https://parishairstudio.fr', bookingProvider: 'Treatwell' }],
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/parishairstudio' },
      { platform: 'facebook', url: 'https://facebook.com/parishairstudio' }
    ],
    signals: [
      { type: 'THIRD_PARTY_BOOKING', value: 'Treatwell', confidence: 0.9 },
      { type: 'HAS_PHONE', value: 'true', confidence: 1.0 },
      { type: 'HAS_EMAIL', value: 'true', confidence: 1.0 },
      { type: 'HAS_SOCIAL', value: 'true', confidence: 0.8 }
    ]
  },
  {
    id: '2',
    name: 'Lyon Beauty Salon',
    category: 'Salon',
    description: 'Beauty and hair salon in Lyon',
    employeeCount: 3,
    employeeRange: '1-10',
    locations: [{ country: 'France', city: 'Lyon' }],
    contacts: [
      { type: 'phone', value: '+33 4 56 78 90 12', source: 'mock' },
      { type: 'email', value: 'info@lyonbeauty.fr', source: 'mock' }
    ],
    websites: [{ url: 'https://lyonbeauty.fr' }],
    socials: [{ platform: 'instagram', url: 'https://instagram.com/lyonbeauty' }],
    signals: [
      { type: 'NO_BOOKING_SYSTEM', value: 'No booking system detected', confidence: 0.8 },
      { type: 'HAS_PHONE', value: 'true', confidence: 1.0 },
      { type: 'HAS_EMAIL', value: 'true', confidence: 1.0 }
    ]
  },
  {
    id: '3',
    name: 'Marseille Salon',
    category: 'Salon',
    description: 'Full-service salon in Marseille',
    employeeCount: 8,
    employeeRange: '1-10',
    locations: [{ country: 'France', city: 'Marseille' }],
    contacts: [{ type: 'phone', value: '+33 4 91 23 45 67', source: 'mock' }],
    websites: [{ url: 'https://marseillesalon.fr', bookingProvider: 'Fresha' }],
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/marseillesalon' },
      { platform: 'facebook', url: 'https://facebook.com/marseillesalon' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/marseillesalon' }
    ],
    signals: [
      { type: 'THIRD_PARTY_BOOKING', value: 'Fresha', confidence: 0.9 },
      { type: 'HAS_PHONE', value: 'true', confidence: 1.0 },
      { type: 'HAS_SOCIAL', value: 'true', confidence: 0.9 },
      { type: 'LINKTREE_DETECTED', value: 'linktr.ee/marseillesalon', confidence: 0.8 }
    ]
  }
];

export class MockBusinessProvider {
  async searchBusinesses(params: BusinessSearchParams) {
    let results = [...mockBusinesses];
    if (params.category) results = results.filter(b => b.category?.toLowerCase().includes(params.category!.toLowerCase()));
    if (params.country) results = results.filter(b => b.locations.some(l => l.country?.toLowerCase().includes(params.country!.toLowerCase())));
    if (params.city) results = results.filter(b => b.locations.some(l => l.city?.toLowerCase().includes(params.city!.toLowerCase())));
    if (params.employeeRange) results = results.filter(b => b.employeeRange === params.employeeRange);
    if (params.hasWebsite) results = results.filter(b => b.websites.length > 0);
    if (params.hasPhone) results = results.filter(b => b.contacts.some(c => c.type === 'phone'));
    if (params.hasEmail) results = results.filter(b => b.contacts.some(c => c.type === 'email'));
    if (params.bookingProvider) results = results.filter(b => b.websites.some(w => w.bookingProvider === params.bookingProvider));
    const page = params.page || 1;
    const limit = params.limit || 25;
    const start = (page - 1) * limit;
    return { items: results.slice(start, start + limit), total: results.length, page, limit };
  }
  async getBusiness(id: string) { return mockBusinesses.find(b => b.id === id) || null; }
  async enrichBusiness(id: string) {
    const business = await this.getBusiness(id);
    if (!business) return null;
    return { ...business, contacts: [...business.contacts, { type: 'phone', value: '+33 6 12 34 56 78', source: 'mock-enrichment' }, { type: 'email', value: `contact@${business.websites[0]?.url?.replace('https://', '') || 'business.fr'}`, source: 'mock-enrichment' }] };
  }
}
