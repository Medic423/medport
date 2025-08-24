// MedPort Offline Sync Service - Phase 6.3
import { offlineStorageService } from './offlineStorageService';

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
  timestamp: number;
}

export interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  currentItem?: string;
}

class OfflineSyncService {
  private isSyncing = false;
  private syncProgress: SyncProgress = {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle'
  };
  private progressCallbacks: ((progress: SyncProgress) => void)[] = [];

  // Subscribe to sync progress updates
  onProgress(callback: (progress: SyncProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  // Update progress and notify subscribers
  private updateProgress(progress: Partial<SyncProgress>): void {
    this.syncProgress = { ...this.syncProgress, ...progress };
    this.progressCallbacks.forEach(callback => callback(this.syncProgress));
  }

  // Get current sync progress
  getProgress(): SyncProgress {
    return { ...this.syncProgress };
  }

  // Check if sync is in progress
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  // Trigger manual sync
  async triggerSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    this.updateProgress({
      status: 'syncing',
      current: 0,
      total: 0,
      percentage: 0
    });

    try {
      const result = await this.performSync();
      this.updateProgress({
        status: 'completed',
        current: result.syncedItems,
        total: result.syncedItems + result.failedItems,
        percentage: 100
      });
      return result;
    } catch (error) {
      this.updateProgress({
        status: 'failed',
        current: 0,
        total: 0,
        percentage: 0
      });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  // Perform the actual sync operation
  private async performSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: [],
      timestamp: Date.now()
    };

    try {
      // Get all offline data that needs syncing
      const offlineData = await offlineStorageService.getOfflineData();
      const pendingData = offlineData.filter(item => item.syncStatus === 'pending');

      if (pendingData.length === 0) {
        this.updateProgress({
          status: 'completed',
          current: 0,
          total: 0,
          percentage: 100
        });
        return result;
      }

      this.updateProgress({
        total: pendingData.length,
        current: 0,
        percentage: 0
      });

      // Process each pending item
      for (let i = 0; i < pendingData.length; i++) {
        const item = pendingData[i];
        
        this.updateProgress({
          current: i + 1,
          percentage: Math.round(((i + 1) / pendingData.length) * 100),
          currentItem: `${item.type}: ${item.id}`
        });

        try {
          await this.syncItem(item);
          result.syncedItems++;
          
          // Update sync status to synced
          await offlineStorageService.updateOfflineData(item.id, { syncStatus: 'synced' });
        } catch (error) {
          result.failedItems++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`${item.type}: ${errorMessage}`);
          
          // Update sync status to failed
          await offlineStorageService.updateOfflineData(item.id, { syncStatus: 'failed' });
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      result.success = result.failedItems === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Sync failed');
    }

    return result;
  }

  // Sync individual item
  private async syncItem(item: any): Promise<void> {
    const { type, data, id } = item;

    switch (type) {
      case 'transport-request':
        await this.syncTransportRequest(data, id);
        break;
      case 'unit-assignment':
        await this.syncUnitAssignment(data, id);
        break;
      case 'analytics':
        await this.syncAnalytics(data, id);
        break;
      case 'gps-tracking':
        await this.syncGPSTracking(data, id);
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  // Sync transport request
  private async syncTransportRequest(data: any, id: string): Promise<void> {
    try {
      const response = await fetch('/api/transport-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[OfflineSync] Transport request synced:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to sync transport request:', id, error);
      throw error;
    }
  }

  // Sync unit assignment
  private async syncUnitAssignment(data: any, id: string): Promise<void> {
    try {
      const response = await fetch('/api/unit-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[OfflineSync] Unit assignment synced:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to sync unit assignment:', id, error);
      throw error;
    }
  }

  // Sync analytics data
  private async syncAnalytics(data: any, id: string): Promise<void> {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[OfflineSync] Analytics synced:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to sync analytics:', id, error);
      throw error;
    }
  }

  // Sync GPS tracking data
  private async syncGPSTracking(data: any, id: string): Promise<void> {
    try {
      const response = await fetch('/api/real-time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[OfflineSync] GPS tracking synced:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to sync GPS tracking:', id, error);
      throw error;
    }
  }

  // Get authentication token (demo mode support)
  private getAuthToken(): string {
    // Check for demo mode
    if (localStorage.getItem('demo-mode') === 'enabled') {
      return 'demo-token';
    }
    
    // Return actual auth token if available
    return localStorage.getItem('auth-token') || '';
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    totalItems: number;
    syncedItems: number;
    pendingItems: number;
    failedItems: number;
    lastSyncTime: number | null;
  }> {
    try {
      const offlineData = await offlineStorageService.getOfflineData();
      const syncedItems = offlineData.filter(item => item.syncStatus === 'synced').length;
      const pendingItems = offlineData.filter(item => item.syncStatus === 'pending').length;
      const failedItems = offlineData.filter(item => item.syncStatus === 'failed').length;
      
      const lastSyncTime = syncedItems > 0 
        ? Math.max(...offlineData.filter(item => item.syncStatus === 'synced').map(item => item.timestamp))
        : null;

      return {
        totalItems: offlineData.length,
        syncedItems,
        pendingItems,
        failedItems,
        lastSyncTime
      };
    } catch (error) {
      console.error('[OfflineSync] Failed to get sync stats:', error);
      return {
        totalItems: 0,
        syncedItems: 0,
        pendingItems: 0,
        failedItems: 0,
        lastSyncTime: null
      };
    }
  }

  // Clear all sync data
  async clearSyncData(): Promise<void> {
    try {
      await offlineStorageService.clearAllData();
      this.updateProgress({
        status: 'idle',
        current: 0,
        total: 0,
        percentage: 0
      });
      console.log('[OfflineSync] All sync data cleared');
    } catch (error) {
      console.error('[OfflineSync] Failed to clear sync data:', error);
      throw error;
    }
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<SyncResult> {
    try {
      const offlineData = await offlineStorageService.getOfflineData();
      const failedItems = offlineData.filter(item => item.syncStatus === 'failed');
      
      if (failedItems.length === 0) {
        return {
          success: true,
          syncedItems: 0,
          failedItems: 0,
          errors: [],
          timestamp: Date.now()
        };
      }

      // Reset failed items to pending
      for (const item of failedItems) {
        await offlineStorageService.updateOfflineData(item.id, { syncStatus: 'pending' });
      }

      // Trigger sync
      return await this.triggerSync();
    } catch (error) {
      console.error('[OfflineSync] Failed to retry failed syncs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
export default offlineSyncService;
