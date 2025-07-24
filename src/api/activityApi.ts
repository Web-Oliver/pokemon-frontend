/**
 * Activity API Client - Context7 Premium Activity Management
 *
 * Frontend API client for activity management following Context7 patterns.
 * Provides comprehensive activity fetching, filtering, and search capabilities.
 *
 * Features:
 * - Type-safe API calls
 * - Advanced filtering and pagination
 * - Real-time activity streaming
 * - Context7 error handling
 * - Premium search capabilities
 */

import unifiedApiClient from './unifiedApiClient';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

// Context7 Activity Types (matching backend)
export const ACTIVITY_TYPES = {
  CARD_ADDED: 'card_added',
  CARD_UPDATED: 'card_updated',
  CARD_DELETED: 'card_deleted',
  PRICE_UPDATE: 'price_update',
  AUCTION_CREATED: 'auction_created',
  AUCTION_UPDATED: 'auction_updated',
  AUCTION_DELETED: 'auction_deleted',
  AUCTION_ITEM_ADDED: 'auction_item_added',
  AUCTION_ITEM_REMOVED: 'auction_item_removed',
  SALE_COMPLETED: 'sale_completed',
  SALE_UPDATED: 'sale_updated',
  MILESTONE: 'milestone',
  COLLECTION_STATS: 'collection_stats',
  SYSTEM: 'system',
} as const;

export const ACTIVITY_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Context7 Activity Interfaces
export interface ActivityMetadata {
  cardName?: string;
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  previousPrice?: number;
  newPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
  auctionTitle?: string;
  itemCount?: number;
  estimatedValue?: number;
  salePrice?: number;
  paymentMethod?: string;
  source?: string;
  buyerName?: string;
  milestoneType?: string;
  milestoneValue?: number;
  milestoneUnit?: string;
  badges?: string[];
  tags?: string[];
  color?: string;
  icon?: string;
}

export interface Activity {
  _id: string;
  type: keyof typeof ACTIVITY_TYPES;
  title: string;
  description: string;
  details?: string;
  priority: keyof typeof ACTIVITY_PRIORITIES;
  status: 'active' | 'archived' | 'hidden';
  entityType?: string;
  entityId?: string;
  metadata?: ActivityMetadata;
  timestamp: string;
  relativeTime?: string;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  limit?: number;
  offset?: number;
  type?: keyof typeof ACTIVITY_TYPES;
  entityType?: string;
  entityId?: string;
  priority?: keyof typeof ACTIVITY_PRIORITIES;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'all';
  search?: string;
}

export interface ActivityResponse {
  success: boolean;
  data: Activity[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
}

export interface ActivityStats {
  total: number;
  today: number;
  week: number;
  month: number;
  lastActivity?: string;
}

export interface ActivityStatsResponse {
  success: boolean;
  data: ActivityStats;
}

export interface ActivityTypesResponse {
  success: boolean;
  data: {
    types: Array<{ key: string; value: string; label: string }>;
    priorities: Array<{ key: string; value: string; label: string }>;
    dateRanges: Array<{ value: string; label: string }>;
  };
}

// Context7 Activity API Client
class ActivityApiClient {
  private readonly baseUrl = '/activities';

  /**
   * Get activities with advanced filtering and pagination
   */
  async getActivities(filters: ActivityFilters = {}): Promise<ActivityResponse> {
    try {
      log('[ACTIVITY API] Fetching activities with filters:', filters);

      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.entityType) {
        params.append('entityType', filters.entityType);
      }
      if (filters.entityId) {
        params.append('entityId', filters.entityId);
      }
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      if (filters.dateRange) {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await unifiedApiClient.get(`${this.baseUrl}?${params.toString()}`);

      log('[ACTIVITY API] Activities fetched successfully:', response.meta);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch activities');
      throw error;
    }
  }

  /**
   * Get recent activities (last 10 by default)
   */
  async getRecentActivities(limit: number = 10): Promise<{ success: boolean; data: Activity[] }> {
    try {
      log('[ACTIVITY API] Fetching recent activities, limit:', limit);

      const response = await unifiedApiClient.get(`${this.baseUrl}/recent?limit=${limit}`);

      log('[ACTIVITY API] Recent activities fetched:', response.data.length);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch recent activities');
      throw error;
    }
  }

  /**
   * Get activity statistics and analytics
   */
  async getActivityStats(): Promise<ActivityStatsResponse> {
    try {
      log('[ACTIVITY API] Fetching activity statistics');

      const response = await unifiedApiClient.get(`${this.baseUrl}/stats`);

      log('[ACTIVITY API] Activity stats fetched:', response.data);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch activity statistics');
      throw error;
    }
  }

  /**
   * Get available activity types and metadata
   */
  async getActivityTypes(): Promise<ActivityTypesResponse> {
    try {
      log('[ACTIVITY API] Fetching activity types');

      const response = await unifiedApiClient.get(`${this.baseUrl}/types`);

      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch activity types');
      throw error;
    }
  }

  /**
   * Search activities with full-text search
   */
  async searchActivities(
    searchTerm: string,
    filters: Omit<ActivityFilters, 'search'> = {}
  ): Promise<{
    success: boolean;
    data: Activity[];
    meta: { searchTerm: string; resultCount: number };
  }> {
    try {
      log('[ACTIVITY API] Searching activities:', searchTerm);

      const params = new URLSearchParams();
      params.append('q', searchTerm);

      // Add additional filters
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      if (filters.entityType) {
        params.append('entityType', filters.entityType);
      }

      const response = await unifiedApiClient.get(`${this.baseUrl}/search?${params.toString()}`);

      log('[ACTIVITY API] Search results:', response.meta.resultCount);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to search activities');
      throw error;
    }
  }

  /**
   * Get activities for a specific entity (card, auction, etc.)
   */
  async getActivitiesForEntity(
    entityType: string,
    entityId: string
  ): Promise<{ success: boolean; data: Activity[] }> {
    try {
      log('[ACTIVITY API] Fetching activities for entity:', entityType, entityId);

      const response = await unifiedApiClient.get(`${this.baseUrl}/entity/${entityType}/${entityId}`);

      log('[ACTIVITY API] Entity activities fetched:', response.data.length);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch entity activities');
      throw error;
    }
  }

  /**
   * Get a specific activity by ID
   */
  async getActivityById(id: string): Promise<{ success: boolean; data: Activity }> {
    try {
      log('[ACTIVITY API] Fetching activity by ID:', id);

      const response = await unifiedApiClient.get(`${this.baseUrl}/${id}`);

      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch activity');
      throw error;
    }
  }

  /**
   * Mark an activity as read
   */
  async markActivityAsRead(id: string): Promise<{ success: boolean; data: Activity }> {
    try {
      log('[ACTIVITY API] Marking activity as read:', id);

      const response = await unifiedApiClient.put(`${this.baseUrl}/${id}/read`);

      log('[ACTIVITY API] Activity marked as read');
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to mark activity as read');
      throw error;
    }
  }

  /**
   * Archive an activity (soft delete)
   */
  async archiveActivity(id: string): Promise<{ success: boolean; message: string }> {
    try {
      log('[ACTIVITY API] Archiving activity:', id);

      const response = await unifiedApiClient.delete(`${this.baseUrl}/${id}`);

      log('[ACTIVITY API] Activity archived');
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to archive activity');
      throw error;
    }
  }

  /**
   * Create a manual activity (admin/system use)
   */
  async createActivity(
    activityData: Partial<Activity>
  ): Promise<{ success: boolean; data: Activity }> {
    try {
      log('[ACTIVITY API] Creating manual activity:', activityData.type);

      const response = await unifiedApiClient.post(this.baseUrl, activityData);

      log('[ACTIVITY API] Activity created:', response.data._id);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create activity');
      throw error;
    }
  }
}

// Export singleton instance
const activityApi = new ActivityApiClient();
export default activityApi;

// Named exports for convenience
export const {
  getActivities,
  getRecentActivities,
  getActivityStats,
  getActivityTypes,
  searchActivities,
  getActivitiesForEntity,
  getActivityById,
  markActivityAsRead,
  archiveActivity,
  createActivity,
} = activityApi;
