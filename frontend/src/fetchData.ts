const cache = new Map<string, Promise<unknown>>();

export function fetchData<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(res => res.json()));
  }
  return cache.get(url) as Promise<T>;
}

export function invalidate(url: string) {
  cache.delete(url);
}

export function invalidateAll() {
  cache.clear();
}
