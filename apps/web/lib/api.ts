const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }
  
  return res.json();
}

// Helper to get data from API response with proper typing
export async function apiData<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await apiRequest<{ data: T }>(endpoint, options);
  return response.data;
}