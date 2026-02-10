const DB_NAME = "CryptoPulseCache";
const DB_VERSION = 1;
const STORE_NAME = "api_responses";
const DEFAULT_TTL = 3600 * 1000; // 1 hour in ms

export interface CacheEntry<T = any> {
    url: string;
    data: T;
    expiry: number;
    timestamp: number;
}

class CacheManager {
    private db: IDBDatabase | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "url" });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async get<T>(url: string): Promise<T | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readonly");
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(url);

                request.onsuccess = () => {
                    const entry = request.result as CacheEntry<T>;
                    if (entry && entry.expiry > Date.now()) {
                        resolve(entry.data);
                    } else {
                        if (entry) this.delete(url); // Cleanup expired
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error("Cache Get Error:", err);
            return null;
        }
    }

    async set<T>(url: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
        try {
            const db = await this.getDB();
            const entry: CacheEntry<T> = {
                url,
                data,
                timestamp: Date.now(),
                expiry: Date.now() + ttl,
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(entry);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error("Cache Set Error:", err);
        }
    }

    async delete(url: string): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            store.delete(url);
        } catch (err) {
            console.error("Cache Delete Error:", err);
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            store.clear();
        } catch (err) {
            console.error("Cache Clear Error:", err);
        }
    }
}

export const cacheManager = new CacheManager();
