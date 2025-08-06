/**
 * Storage Utilities for State Persistence
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles storage operations
 * - Open/Closed: Extensible for different storage needs
 * - DRY: Centralized storage logic with error handling
 * - Layer 1: Core/Foundation - provides storage capabilities
 */

import { ItemOrderingState, SortMethod } from '../domain/models/ordering';

// Storage keys for different data types
export const STORAGE_KEYS = {
  ORDERING_STATE: 'pokemon-collection-ordering-state',
  EXPORT_PREFERENCES: 'pokemon-collection-export-preferences',
  SESSION_DATA: 'pokemon-collection-session-data',
} as const;

// Interface for export session data
export interface ExportSessionData {
  sessionId: string;
  startTime: number;
  selectedItemIds: string[];
  itemOrder: string[];
  lastSortMethod: SortMethod;
  exportCount: number;
  lastActivity: number;
}

// Interface for export preferences
export interface ExportPreferences {
  defaultSortMethod: SortMethod;
  rememberOrderPerCategory: boolean;
  autoSaveInterval: number;
  clearOnExport: boolean;
  maxStoredSessions: number;
}

/**
 * Generic storage operations with error handling
 */
class StorageManager {
  private isAvailable: boolean;

  constructor(private storage: Storage) {
    this.isAvailable = this.checkStorageAvailability();
  }

  /**
   * Check if storage is available
   */
  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      this.storage.setItem(test, test);
      this.storage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('Storage not available:', error);
      return false;
    }
  }

  /**
   * Store data with error handling
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot save:', key);
      return false;
    }

    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0.0',
      });
      this.storage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', key, error);
      return false;
    }
  }

  /**
   * Retrieve data with error handling
   */
  getItem<T>(key: string): T | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const item = this.storage.getItem(key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);

      // Version compatibility check
      if (!parsed.version || !parsed.data) {
        console.warn('Invalid storage format for key:', key);
        this.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to read from storage:', key, error);
      this.removeItem(key); // Clean up corrupted data
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable) {
      return false;
    }

    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from storage:', key, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  clear(): boolean {
    if (!this.isAvailable) {
      return false;
    }

    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: boolean } {
    return {
      used: this.isAvailable ? JSON.stringify(this.storage).length : 0,
      available: this.isAvailable,
    };
  }
}

// Create storage managers
export const localStorage = new StorageManager(window.localStorage);
export const sessionStorage = new StorageManager(window.sessionStorage);

/**
 * Ordering State Persistence Manager
 */
export class OrderingStatePersistence {
  private static instance: OrderingStatePersistence;
  private currentSessionId: string | null = null;
  private autoSaveTimer: number | null = null;

  private constructor() {
    this.initSession();
  }

  static getInstance(): OrderingStatePersistence {
    if (!OrderingStatePersistence.instance) {
      OrderingStatePersistence.instance = new OrderingStatePersistence();
    }
    return OrderingStatePersistence.instance;
  }

  /**
   * Initialize a new ordering session
   */
  private initSession(): void {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save ordering state to localStorage
   */
  saveOrderingState(state: ItemOrderingState): boolean {
    const success = localStorage.setItem(STORAGE_KEYS.ORDERING_STATE, state);

    if (success) {
      this.updateSessionActivity();
    }

    return success;
  }

  /**
   * Load ordering state from localStorage
   */
  loadOrderingState(): ItemOrderingState | null {
    return localStorage.getItem<ItemOrderingState>(STORAGE_KEYS.ORDERING_STATE);
  }

  /**
   * Save export session data
   */
  saveSessionData(data: Partial<ExportSessionData>): boolean {
    if (!this.currentSessionId) {
      this.initSession();
    }

    const existingData = this.getSessionData();
    const sessionData: ExportSessionData = {
      sessionId: this.currentSessionId!,
      startTime: existingData?.startTime || Date.now(),
      selectedItemIds:
        data.selectedItemIds || existingData?.selectedItemIds || [],
      itemOrder: data.itemOrder || existingData?.itemOrder || [],
      lastSortMethod:
        data.lastSortMethod || existingData?.lastSortMethod || null,
      exportCount:
        data.exportCount !== undefined
          ? data.exportCount
          : existingData?.exportCount || 0,
      lastActivity: Date.now(),
    };

    return sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, sessionData);
  }

  /**
   * Get current session data
   */
  getSessionData(): ExportSessionData | null {
    return sessionStorage.getItem<ExportSessionData>(STORAGE_KEYS.SESSION_DATA);
  }

  /**
   * Update session activity timestamp
   */
  private updateSessionActivity(): void {
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, sessionData);
    }
  }

  /**
   * Save export preferences
   */
  saveExportPreferences(preferences: ExportPreferences): boolean {
    return localStorage.setItem(STORAGE_KEYS.EXPORT_PREFERENCES, preferences);
  }

  /**
   * Load export preferences with defaults
   */
  loadExportPreferences(): ExportPreferences {
    const saved = localStorage.getItem<ExportPreferences>(
      STORAGE_KEYS.EXPORT_PREFERENCES
    );

    return {
      defaultSortMethod: saved?.defaultSortMethod || null,
      rememberOrderPerCategory: saved?.rememberOrderPerCategory ?? true,
      autoSaveInterval: saved?.autoSaveInterval || 5000, // 5 seconds
      clearOnExport: saved?.clearOnExport ?? false,
      maxStoredSessions: saved?.maxStoredSessions || 10,
      ...saved,
    };
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(saveCallback: () => ItemOrderingState | null): void {
    this.stopAutoSave();

    const preferences = this.loadExportPreferences();

    this.autoSaveTimer = setInterval(() => {
      const state = saveCallback();
      if (state) {
        this.saveOrderingState(state);
      }
    }, preferences.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Clear ordering state after successful export
   */
  clearAfterExport(): boolean {
    const preferences = this.loadExportPreferences();

    if (preferences.clearOnExport) {
      const success = localStorage.removeItem(STORAGE_KEYS.ORDERING_STATE);

      // Update session export count
      const sessionData = this.getSessionData();
      if (sessionData) {
        sessionData.exportCount += 1;
        sessionData.lastActivity = Date.now();
        sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, sessionData);
      }

      return success;
    }

    return true;
  }

  /**
   * Clear all stored data
   */
  clearAllData(): boolean {
    this.stopAutoSave();

    const results = [
      localStorage.removeItem(STORAGE_KEYS.ORDERING_STATE),
      localStorage.removeItem(STORAGE_KEYS.EXPORT_PREFERENCES),
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_DATA),
    ];

    this.initSession();

    return results.every((result) => result);
  }

  /**
   * Check if session is expired (24 hours)
   */
  isSessionExpired(): boolean {
    const sessionData = this.getSessionData();
    if (!sessionData) {
      return true;
    }

    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - sessionData.lastActivity > maxAge;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    if (this.isSessionExpired()) {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
      this.initSession();
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    localStorage: { used: number; available: boolean };
    sessionStorage: { used: number; available: boolean };
    hasOrderingState: boolean;
    hasSessionData: boolean;
    sessionAge: number;
  } {
    const sessionData = this.getSessionData();

    return {
      localStorage: localStorage.getStorageInfo(),
      sessionStorage: sessionStorage.getStorageInfo(),
      hasOrderingState: !!this.loadOrderingState(),
      hasSessionData: !!sessionData,
      sessionAge: sessionData ? Date.now() - sessionData.startTime : 0,
    };
  }
}

// Export singleton instance
export const orderingPersistence = OrderingStatePersistence.getInstance();

/**
 * Helper functions for common operations
 */
export const storageHelpers = {
  /**
   * Save ordering state with error handling
   */
  saveOrdering: (state: ItemOrderingState): boolean => {
    try {
      return orderingPersistence.saveOrderingState(state);
    } catch (error) {
      console.error('Failed to save ordering state:', error);
      return false;
    }
  },

  /**
   * Load ordering state with fallback
   */
  loadOrdering: (): ItemOrderingState | null => {
    try {
      return orderingPersistence.loadOrderingState();
    } catch (error) {
      console.error('Failed to load ordering state:', error);
      return null;
    }
  },

  /**
   * Check storage health
   */
  checkStorageHealth: (): boolean => {
    const stats = orderingPersistence.getStorageStats();
    return stats.localStorage.available && stats.sessionStorage.available;
  },

  /**
   * Migrate old storage format (if needed)
   */
  migrateOldFormat: (): void => {
    // Check for old format data and migrate if necessary
    try {
      const oldData = window.localStorage.getItem('collectionOrdering');
      if (oldData) {
        const parsed = JSON.parse(oldData);
        // Convert to new format and save
        if (parsed.itemOrder) {
          const newState: ItemOrderingState = {
            globalOrder: parsed.itemOrder,
            categoryOrders: {
              PSA_CARD: [],
              RAW_CARD: [],
              SEALED_PRODUCT: [],
            },
            lastSortMethod: parsed.sortMethod || 'manual',
            lastSortTimestamp: new Date(),
          };
          orderingPersistence.saveOrderingState(newState);
        }
        // Remove old format
        window.localStorage.removeItem('collectionOrdering');
      }
    } catch (error) {
      console.warn('Failed to migrate old storage format:', error);
    }
  },
};

export default orderingPersistence;
