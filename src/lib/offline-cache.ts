// Cache offline léger : conserve les dernières données vues pour relecture hors ligne
// Pas de service worker ici (incompatible iframe Lovable) — on s'appuie sur localStorage
// + un indicateur de connexion. Les transactions créées hors ligne sont mises en file d'attente.

const PREFIX = "lokalpay:cache:";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export const cacheSet = <T>(key: string, data: T): void => {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch { /* quota exceeded — ignore */ }
};

export const cacheGet = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
};

export const cacheClear = (): void => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
};

export const isOnline = (): boolean => navigator.onLine;

// File d'attente pour transactions créées hors ligne
const QUEUE_KEY = "lokalpay:offline_queue";

export interface QueuedAction {
  id: string;
  type: "transaction" | "rating" | "meeting";
  payload: Record<string, unknown>;
  ts: number;
}

export const queueAction = (action: Omit<QueuedAction, "id" | "ts">): void => {
  try {
    const queue = getQueue();
    queue.push({ ...action, id: crypto.randomUUID(), ts: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
};

export const getQueue = (): QueuedAction[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearQueue = (): void => {
  localStorage.removeItem(QUEUE_KEY);
};
