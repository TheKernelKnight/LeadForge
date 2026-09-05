const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Public endpoints that don't need authentication
const PUBLIC_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/health'];

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isPublic = PUBLIC_ENDPOINTS.some(path => endpoint.startsWith(path));
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: isPublic ? 'omit' : 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    // Only handle 401 for protected endpoints
    if (res.status === 401 && !isPublic) {
      // Clear the token cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login';
      }
      throw new Error('Session expired. Please login again.');
    }
    
    let errorMessage = 'API request failed';
    try {
      const error = await res.json();
      errorMessage = error?.message || error?.error?.message || res.statusText || `HTTP ${res.status}`;
    } catch {
      errorMessage = res.statusText || `HTTP ${res.status}`;
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function apiData<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await apiRequest<{ data: T }>(endpoint, options);
  return response.data;
}