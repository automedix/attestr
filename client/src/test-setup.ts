/**
 * Vitest setup: ensure localStorage works correctly in the test environment.
 *
 * Some versions of happy-dom + Node's --localstorage-file flag produce a
 * Proxy-backed localStorage missing removeItem. Replace it with a simple
 * Map-based implementation for tests.
 */
const store = new Map<string, string>();

const testStorage: Storage = {
  get length() {
    return store.size;
  },
  key(index: number) {
    return [...store.keys()][index] ?? null;
  },
  getItem(key: string) {
    return store.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    store.set(key, String(value));
  },
  removeItem(key: string) {
    store.delete(key);
  },
  clear() {
    store.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: testStorage,
  writable: true,
  configurable: true,
});
