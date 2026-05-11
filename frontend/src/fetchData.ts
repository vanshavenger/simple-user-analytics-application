const cache = new Map<string, Promise<unknown>>();

const API_BASE = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL || '';

export function fetchData<T>(url: string): Promise<T> {
  const fullUrl = url.startsWith('/api') && API_BASE ? `${API_BASE}${url}` : url;
  if (!cache.has(fullUrl)) {
    cache.set(fullUrl, fetch(fullUrl).then(res => res.json()));
  }
  return cache.get(fullUrl) as Promise<T>;
}

export function invalidate(url: string) {
  const fullUrl = url.startsWith('/api') && API_BASE ? `${API_BASE}${url}` : url;
  cache.delete(fullUrl);
}

export function invalidateAll() {
  cache.clear();
}
