import type { QueuedOperation } from './types';

export interface OfflineQueueManager {
  enqueue(op: Omit<QueuedOperation, 'id' | 'enqueuedAt' | 'retryCount' | 'status'>): Promise<string>;
  getPending(): Promise<QueuedOperation[]>;
  markSyncing(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
  count(): Promise<number>;
}

const DB_NAME = 'spa-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'operations';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('enqueuedAt', 'enqueuedAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

class IndexedDBOfflineQueue implements OfflineQueueManager {
  private dbName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(dbName: string = DB_NAME) {
    this.dbName = dbName;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName);
    }
    return this.dbPromise;
  }

  async enqueue(op: Omit<QueuedOperation, 'id' | 'enqueuedAt' | 'retryCount' | 'status'>): Promise<string> {
    const db = await this.getDB();
    const id = generateUUID();
    const record: QueuedOperation = {
      ...op,
      id,
      enqueuedAt: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPending(): Promise<QueuedOperation[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('enqueuedAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const all = request.result as QueuedOperation[];
        const pending = all.filter((op) => op.status === 'pending' || op.status === 'syncing');
        // Already ordered by enqueuedAt ASC via the index
        resolve(pending.sort((a, b) => a.enqueuedAt - b.enqueuedAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markSyncing(id: string): Promise<void> {
    return this.updateStatus(id, 'syncing');
  }

  async remove(id: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async markFailed(id: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result as QueuedOperation | undefined;
        if (!record) {
          resolve();
          return;
        }
        const updated: QueuedOperation = {
          ...record,
          status: 'failed',
          retryCount: record.retryCount + 1,
        };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async count(): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async updateStatus(id: string, status: QueuedOperation['status']): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result as QueuedOperation | undefined;
        if (!record) {
          resolve();
          return;
        }
        const updated: QueuedOperation = { ...record, status };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

/**
 * Factory function for creating an OfflineQueueManager instance.
 * Accepts an optional db name parameter for testing.
 */
export function createOfflineQueue(dbName?: string): OfflineQueueManager {
  return new IndexedDBOfflineQueue(dbName ?? DB_NAME);
}

/**
 * Singleton instance for use in the app and service worker.
 */
export const offlineQueue: OfflineQueueManager = createOfflineQueue();

export default offlineQueue;
