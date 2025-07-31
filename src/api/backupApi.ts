/**
 * Backup System API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for backup system operations
 * - OCP: Open for extension via backup configuration
 * - LSP: Maintains backup interface compatibility
 * - ISP: Provides specific backup operations interface
 * - DIP: Depends on unifiedApiClient abstraction
 *
 * DRY: Centralized backup operations with consistent patterns
 */

import { unifiedApiClient } from './unifiedApiClient';

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Backup configuration interface
 */
export interface BackupConfig {
  scheduleEnabled: boolean;
  interval: string; // cron expression
  retentionDays: number;
  compression: boolean;
  encryptionEnabled: boolean;
  backupLocation: string;
  maxBackups: number;
}

/**
 * Backup status interface
 */
export interface BackupStatus {
  isRunning: boolean;
  lastBackupDate?: string;
  nextScheduledBackup?: string;
  scheduleEnabled: boolean;
  totalBackups: number;
  diskSpaceUsed: string;
  serviceName: string;
  version: string;
}

/**
 * Backup health check interface
 */
export interface BackupHealth {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  issues: string[];
  recommendations: string[];
  serviceUptime: string;
  diskSpaceAvailable: string;
}

/**
 * Manual backup request interface
 */
export interface ManualBackupRequest {
  type: 'full' | 'incremental';
  compression?: boolean;
  description?: string;
  includeImages?: boolean;
}

/**
 * Backup entry interface
 */
export interface BackupEntry {
  _id: string;
  backupId: string;
  type: 'full' | 'incremental' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  fileSize?: string;
  filePath?: string;
  description?: string;
  error?: string;
  compression: boolean;
  recordsBackedUp?: number;
  imagesBackedUp?: number;
}

/**
 * Backup history response interface
 */
export interface BackupHistoryResponse {
  success: boolean;
  data: {
    backups: BackupEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    summary: {
      totalBackups: number;
      successfulBackups: number;
      failedBackups: number;
      totalSizeUsed: string;
    };
  };
}

/**
 * Backup history query parameters
 */
export interface BackupHistoryParams {
  page?: number;
  limit?: number;
  type?: 'full' | 'incremental' | 'manual';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
}

// ========== BACKUP SYSTEM API OPERATIONS ==========

/**
 * Get backup system health check
 * Uses GET /api/backup/health endpoint
 * @returns Promise<BackupHealth> - Backup system health status
 */
export const getBackupHealth = async (): Promise<BackupHealth> => {
  return unifiedApiClient.get<BackupHealth>('/backup/health');
};

/**
 * Get backup service status and configuration
 * Uses GET /api/backup/status endpoint
 * @returns Promise<BackupStatus> - Backup service status
 */
export const getBackupStatus = async (): Promise<BackupStatus> => {
  return unifiedApiClient.get<BackupStatus>('/backup/status');
};

/**
 * Get backup configuration
 * Uses GET /api/backup/config endpoint
 * @returns Promise<BackupConfig> - Backup configuration
 */
export const getBackupConfig = async (): Promise<BackupConfig> => {
  return unifiedApiClient.get<BackupConfig>('/backup/config');
};

/**
 * Initialize backup service
 * Uses POST /api/backup/initialize endpoint
 * @returns Promise<{success: boolean, message: string}> - Initialization result
 */
export const initializeBackupService = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  return unifiedApiClient.post<{success: boolean; message: string}>(
    '/backup/initialize'
  );
};

/**
 * Start scheduled backups
 * Uses POST /api/backup/start-scheduled endpoint
 * @returns Promise<{success: boolean, message: string}> - Start result
 */
export const startScheduledBackups = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  return unifiedApiClient.post<{success: boolean; message: string}>(
    '/backup/start-scheduled'
  );
};

/**
 * Stop scheduled backups
 * Uses POST /api/backup/stop-scheduled endpoint
 * @returns Promise<{success: boolean, message: string}> - Stop result
 */
export const stopScheduledBackups = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  return unifiedApiClient.post<{success: boolean; message: string}>(
    '/backup/stop-scheduled'
  );
};

/**
 * Trigger manual backup
 * Uses POST /api/backup/manual endpoint
 * @param request - Manual backup configuration
 * @returns Promise<BackupEntry> - Created backup entry
 */
export const triggerManualBackup = async (
  request: ManualBackupRequest
): Promise<BackupEntry> => {
  return unifiedApiClient.post<BackupEntry>('/backup/manual', request);
};

/**
 * Test backup system without creating actual backup
 * Uses POST /api/backup/test endpoint
 * @returns Promise<{success: boolean, message: string, testResults: any}> - Test results
 */
export const testBackupSystem = async (): Promise<{
  success: boolean;
  message: string;
  testResults: {
    databaseConnection: boolean;
    diskSpace: boolean;
    permissions: boolean;
    configuration: boolean;
    estimatedBackupSize: string;
    estimatedDuration: string;
  };
}> => {
  return unifiedApiClient.post<{
    success: boolean;
    message: string;
    testResults: {
      databaseConnection: boolean;
      diskSpace: boolean;
      permissions: boolean;
      configuration: boolean;
      estimatedBackupSize: string;
      estimatedDuration: string;
    };
  }>('/backup/test');
};

/**
 * Get backup history with filtering
 * Uses GET /api/backup/history endpoint
 * @param params - Query parameters for filtering
 * @returns Promise<BackupHistoryResponse> - Backup history with pagination
 */
export const getBackupHistory = async (
  params: BackupHistoryParams = {}
): Promise<BackupHistoryResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `/backup/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return unifiedApiClient.get<BackupHistoryResponse>(url);
};

/**
 * Get specific backup details
 * Uses GET /api/backup/:backupId endpoint
 * @param backupId - Backup ID
 * @returns Promise<BackupEntry> - Specific backup details
 */
export const getBackupById = async (backupId: string): Promise<BackupEntry> => {
  return unifiedApiClient.getById<BackupEntry>('/backup', backupId);
};

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * Check if backup system is healthy
 * @returns Promise<boolean> - True if system is healthy
 */
export const isBackupSystemHealthy = async (): Promise<boolean> => {
  try {
    const health = await getBackupHealth();
    return health.status === 'healthy';
  } catch (error) {
    console.error('Backup health check failed:', error);
    return false;
  }
};

/**
 * Get latest backup entry
 * @returns Promise<BackupEntry | null> - Latest backup or null if none found
 */
export const getLatestBackup = async (): Promise<BackupEntry | null> => {
  try {
    const history = await getBackupHistory({ limit: 1, page: 1 });
    return history.data.backups.length > 0 ? history.data.backups[0] : null;
  } catch (error) {
    console.error('Failed to get latest backup:', error);
    return null;
  }
};

/**
 * Get backup statistics summary
 * @returns Promise<{total: number, successful: number, failed: number, totalSize: string}> - Backup stats
 */
export const getBackupStats = async (): Promise<{
  total: number;
  successful: number;
  failed: number;
  totalSize: string;
}> => {
  try {
    const history = await getBackupHistory({ limit: 1 }); // Just get pagination info
    return history.data.summary;
  } catch (error) {
    console.error('Failed to get backup stats:', error);
    return {
      total: 0,
      successful: 0,
      failed: 0,
      totalSize: '0 MB',
    };
  }
};

export default {
  // Health and Status
  getBackupHealth,
  getBackupStatus,
  getBackupConfig,
  
  // Service Management
  initializeBackupService,
  startScheduledBackups,
  stopScheduledBackups,
  
  // Backup Operations
  triggerManualBackup,
  testBackupSystem,
  
  // History and Details
  getBackupHistory,
  getBackupById,
  
  // Convenience Functions
  isBackupSystemHealthy,
  getLatestBackup,
  getBackupStats,
};