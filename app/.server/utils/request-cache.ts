const requestDataCache = new WeakMap<Request, Record<string, any>>();

export function getRequestCache<T extends Record<string, unknown>>(request: Request): RequestCache<T> {
  const cache = requestDataCache.get(request) ?? {};

  // Persist cache between middlewares:
  requestDataCache.set(request, cache);

  return {
    get: (key) => cache[key as string],
    set: (key, value) => {
      cache[key as string] = value;
    },
    has: (key) => key in cache,
    remove: (key) => {
      if (key) {
        delete cache[key as string];
      }
    },
    clear: () => {
      // Clear all entries but keep the cache object
      for (const key in cache) {
        delete cache[key];
      }
    },
  };
}

interface RequestCache<T extends Record<string, any>> {
  get<K extends keyof T = keyof T, V extends T[K] = T[K]>(key: K): V | undefined; // returned value of `get` method can be inferred from outer call context
  set<K extends keyof T = keyof T>(key: K, value: T[K]): void; // `set` method should constrain type of cached value
  has(key: keyof T): boolean;
  remove(key: keyof T): void;
  clear(): void;
}
