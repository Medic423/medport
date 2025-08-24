// MedPort Offline Storage Service - Phase 6.3
export interface OfflineData {
  id: string;
  type: 'transport-request' | 'unit-assignment' | 'analytics' | 'gps-tracking';
  data: any;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  version: number;
}

export interface SyncQueueItem {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingSyncs: number;
  storageUsage: number;
  cacheSize: number;
}

class OfflineStorageService {
  private dbName = 'MedPortOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initializeDatabase();
    this.setupOnlineStatusListeners();
    this.loadSyncQueue();
  }

  // Initialize IndexedDB for offline storage
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineStorage] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('retryCount', 'retryCount', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('[OfflineStorage] Database schema created');
      };
    });
  }

  // Setup online/offline status listeners
  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[OfflineStorage] Connection restored');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[OfflineStorage] Connection lost');
    });
  }

  // Store data offline
  async storeOfflineData(type: string, data: any): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type: type as any,
      data,
      timestamp: Date.now(),
      syncStatus: 'pending',
      version: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => {
        console.log('[OfflineStorage] Data stored offline:', id);
        this.addToSyncQueue(type, 'create', data, id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to store data:', request.error);
        reject(request.error);
      };
    });
  }

  // Retrieve offline data
  async getOfflineData(type?: string): Promise<OfflineData[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = type ? store.index('type').getAll(type) : store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to retrieve data:', request.error);
        reject(request.error);
      };
    });
  }

  // Update offline data
  async updateOfflineData(id: string, data: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        if (existingData) {
          const updatedData: OfflineData = {
            ...existingData,
            data: { ...existingData.data, ...data },
            timestamp: Date.now(),
            version: existingData.version + 1
          };

          const putRequest = store.put(updatedData);
          putRequest.onsuccess = () => {
            console.log('[OfflineStorage] Data updated offline:', id);
            this.addToSyncQueue(existingData.type, 'update', updatedData.data, id);
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Data not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete offline data
  async deleteOfflineData(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[OfflineStorage] Data deleted offline:', id);
        this.addToSyncQueue('unknown', 'delete', null, id);
        resolve();
      };

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to delete data:', request.error);
        reject(request.error);
      };
    });
  }

  // Add item to sync queue
  private async addToSyncQueue(type: string, action: string, data: any, id: string): Promise<void> {
    const queueItem: SyncQueueItem = {
      id,
      type,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();

    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // Save sync queue to IndexedDB
  private async saveSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      store.clear();

      const promises = this.syncQueue.map(item => {
        return new Promise<void>((res, rej) => {
          const request = store.add(item);
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  }

  // Load sync queue from IndexedDB
  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        this.syncQueue = request.result || [];
        console.log('[OfflineStorage] Sync queue loaded:', this.syncQueue.length, 'items');
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Process sync queue when online
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log('[OfflineStorage] Processing sync queue:', this.syncQueue.length, 'items');

    try {
      const itemsToProcess = [...this.syncQueue];
      
      for (const item of itemsToProcess) {
        try {
          await this.processSyncItem(item);
          this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('[OfflineStorage] Sync failed for item:', item.id, error);
          item.retryCount++;
          
          if (item.retryCount >= 3) {
            console.error('[OfflineStorage] Max retries reached for item:', item.id);
            this.removeFromSyncQueue(item.id);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
      await this.saveSyncQueue();
    }
  }

  // Process individual sync item
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    console.log('[OfflineStorage] Processing sync item:', item.id, item.action, item.type);
    
    // Simulate API call (replace with actual API calls)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update sync status in offline data
    if (item.action !== 'delete') {
      await this.updateSyncStatus(item.id, 'synced');
    }
    
    console.log('[OfflineStorage] Sync item processed successfully:', item.id);
  }

  // Remove item from sync queue
  private async removeFromSyncQueue(id: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
  }

  // Update sync status
  private async updateSyncStatus(id: string, status: 'pending' | 'synced' | 'failed'): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        if (existingData) {
          const updatedData: OfflineData = {
            ...existingData,
            syncStatus: status,
            timestamp: Date.now()
          };

          const putRequest = store.put(updatedData);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Cache API response
  async cacheResponse(url: string, response: Response): Promise<void> {
    if (!this.db) return;

    const cacheData = {
      url,
      response: await response.clone().text(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached response
  async getCachedResponse(url: string): Promise<Response | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(url);

      request.onsuccess = () => {
        const cachedData = request.result;
        if (cachedData) {
          const response = new Response(cachedData.response, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
          resolve(response);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get offline status
  async getOfflineStatus(): Promise<OfflineStatus> {
    const pendingSyncs = this.syncQueue.length;
    const storageUsage = await this.getStorageUsage();
    const cacheSize = await this.getCacheSize();

    return {
      isOnline: this.isOnline,
      lastSync: this.getLastSyncTime(),
      pendingSyncs,
      storageUsage,
      cacheSize
    };
  }

  // Get storage usage
  private async getStorageUsage(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result || [];
        const usage = data.reduce((total, item) => {
          return total + JSON.stringify(item).length;
        }, 0);
        resolve(usage);
      };

      request.onerror = () => resolve(0);
    });
  }

  // Get cache size
  private async getCacheSize(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result || [];
        const size = data.reduce((total, item) => {
          return total + JSON.stringify(item).length;
        }, 0);
        resolve(size);
      };

      request.onerror = () => resolve(0);
    });
  }

  // Get last sync time
  private getLastSyncTime(): number | null {
    if (this.syncQueue.length === 0) return null;
    
    const syncedItems = this.syncQueue.filter(item => item.syncStatus === 'synced');
    if (syncedItems.length === 0) return null;
    
    return Math.max(...syncedItems.map(item => item.timestamp));
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'syncQueue', 'cache'], 'readwrite');
      
      transaction.objectStore('offlineData').clear();
      transaction.objectStore('syncQueue').clear();
      transaction.objectStore('cache').clear();

      transaction.oncomplete = () => {
        this.syncQueue = [];
        console.log('[OfflineStorage] All offline data cleared');
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get sync queue status
  getSyncQueueStatus(): { total: number; pending: number; failed: number } {
    const total = this.syncQueue.length;
    const pending = this.syncQueue.filter(item => item.retryCount < 3).length;
    const failed = this.syncQueue.filter(item => item.retryCount >= 3).length;

    return { total, pending, failed };
  }
}

// Export singleton instance
export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;
