/**
 * Activity API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for activity-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains Activity interface compatibility
 * - ISP: Provides specific activity operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 * Context7 Premium Activity Management with advanced filtering and search
 */

import {
  ACTIVITY_CONFIG,
  createResourceOperations,
  idMapper,
} from './genericApiOperations';
import { unifiedApiClient } from './unifiedApiClient';

// ========== INTERFACES (ISP Compliance) ==========

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
  _id?: string;
  id?: string;
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

// ActivityTypesResponse removed - getActivityTypes function not used by any frontend components

/**
 * Activity creation payload interface
 */
type IActivityCreatePayload = Omit<
  Activity,
  'id' | '_id' | 'createdAt' | 'updatedAt'
>;

/**
 * Activity update payload interface
 */
type IActivityUpdatePayload = Partial<IActivityCreatePayload>;

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for activities using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const activityOperations = createResourceOperations<
  Activity,
  IActivityCreatePayload,
  IActivityUpdatePayload
>(ACTIVITY_CONFIG, {
  includeExportOperations: true,
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all activities with optional filtering
 * @param params - Optional filter parameters
 * @returns Promise<Activity[]> - Array of activities
 */
export const getAllActivities = async (
  params?: Record<string, unknown>
): Promise<Activity[]> => {
  return activityOperations.getAll(params, {
    transform: idMapper,
  });
};

/**
 * Get activity by ID
 * @param id - Activity ID
 * @returns Promise<Activity> - Single activity
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await activityOperations.getById(id, {
    transform: idMapper,
  });
  return response;
};

/**
 * Create a new activity
 * @param activityData - Activity creation data
 * @returns Promise<Activity> - Created activity
 */
export const createActivity = async (
  activityData: Partial<Activity>
): Promise<Activity> => {
  const response = await activityOperations.create(
    activityData as IActivityCreatePayload,
    {
      transform: idMapper,
    }
  );
  return response;
};

/**
 * Update existing activity
 * @param id - Activity ID
 * @param activityData - Activity update data
 * @returns Promise<Activity> - Updated activity
 */
export const updateActivity = activityOperations.update;

/**
 * Delete activity
 * @param id - Activity ID
 * @returns Promise<void>
 */
export const removeActivity = activityOperations.remove;

/**
 * Search activities with parameters
 * @param searchParams - Activity search parameters
 * @returns Promise<Activity[]> - Search results
 */
export const searchActivitiesGeneric = activityOperations.search;

// BULK/BATCH CREATE OPERATIONS REMOVED - Not used by any frontend components

/**
 * Export activities data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportActivities = activityOperations.export;

// ========== SPECIALIZED ACTIVITY OPERATIONS ==========

/**
 * Get activities with advanced filtering and pagination
 * @param filters - Activity filter parameters
 * @returns Promise<ActivityResponse> - Paginated activity response
 */
export const getActivities = async (
  filters: ActivityFilters = {}
): Promise<ActivityResponse> => {
  const queryParams = {
    ...(filters.limit && { limit: filters.limit.toString() }),
    ...(filters.offset && { offset: filters.offset.toString() }),
    ...(filters.type && { type: filters.type }),
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.entityId && { entityId: filters.entityId }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.dateRange && { dateRange: filters.dateRange }),
    ...(filters.search && { search: filters.search }),
  };

  // The unifiedApiClient.apiGet returns the transformed data, but we need the full ActivityResponse structure
  // Since this is a paginated endpoint, we need to check what the backend actually returns
  const response = await unifiedApiClient.apiGet<any>(
    '/activities',
    'activities with filters',
    { params: queryParams }
  );

  // Handle the transformed response - the backend should return {success, data: Activity[], meta: {...}}
  // But unifiedApiClient transforms it to just the data portion
  if (Array.isArray(response)) {
    // If we get an array directly, it means the transformation extracted the data array
    // We need to create the expected ActivityResponse structure
    return {
      success: true,
      data: response,
      meta: {
        total: response.length,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        hasMore: false, // We don't have this info from the transformed response
        page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
        totalPages: 1, // We don't have this info from the transformed response
      },
    };
  }

  // If response has the expected structure, return it as is
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'meta' in response
  ) {
    return response as ActivityResponse;
  }

  // Fallback for unexpected response format
  return {
    success: true,
    data: Array.isArray(response) ? response : [],
    meta: {
      total: 0,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      hasMore: false,
      page: 1,
      totalPages: 1,
    },
  };
};

/**
 * Get recent activities (last 10 by default)
 * @param limit - Number of recent activities to fetch
 * @returns Promise<{success: boolean; data: Activity[]}> - Recent activities
 */
export const getRecentActivities = async (
  limit: number = 10
): Promise<{ success: boolean; data: Activity[] }> => {
  const response = await unifiedApiClient.apiGet<Activity[]>(
    `/activities/recent?limit=${limit}`,
    'recent activities'
  );

  // The unifiedApiClient.apiGet returns the transformed data (just the activities array)
  // We need to wrap it in the expected format for backward compatibility
  return {
    success: true,
    data: Array.isArray(response) ? response : [],
  };
};

/**
 * Get activity statistics and analytics
 * @returns Promise<ActivityStatsResponse> - Activity statistics
 */
export const getActivityStats = async (): Promise<ActivityStatsResponse> => {
  const response = await unifiedApiClient.apiGet<any>(
    '/activities/stats',
    'activity statistics'
  );

  // Handle the transformed response - unifiedApiClient extracts the data field
  // If response is the stats object directly, wrap it in the expected format
  if (response && typeof response === 'object' && !('success' in response)) {
    return {
      success: true,
      data: response,
    };
  }

  // If response already has the expected structure, return it as is
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response
  ) {
    return response as ActivityStatsResponse;
  }

  // Fallback for unexpected response format
  return {
    success: true,
    data: {
      total: 0,
      today: 0,
      week: 0,
      month: 0,
      lastActivity: undefined,
    },
  };
};

// getActivityTypes removed - not used by any frontend components

/**
 * Search activities with full-text search
 * @param searchTerm - Search term
 * @param filters - Additional search filters
 * @returns Promise<{success: boolean; data: Activity[]; meta: {searchTerm: string; resultCount: number}}> - Search results
 */
export const searchActivities = async (
  searchTerm: string,
  filters: Omit<ActivityFilters, 'search'> = {}
): Promise<{
  success: boolean;
  data: Activity[];
  meta: { searchTerm: string; resultCount: number };
}> => {
  const queryParams = {
    q: searchTerm,
    ...(filters.type && { type: filters.type }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.entityType && { entityType: filters.entityType }),
  };

  const response = await unifiedApiClient.apiGet<any>(
    '/activities/search',
    'activity search',
    { params: queryParams }
  );

  // Handle the transformed response - unifiedApiClient extracts the data field
  if (Array.isArray(response)) {
    // If we get an array directly, it means the transformation extracted the data array
    return {
      success: true,
      data: response,
      meta: {
        searchTerm,
        resultCount: response.length,
      },
    };
  }

  // If response has the expected structure, return it as is
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'meta' in response
  ) {
    return response;
  }

  // Fallback for unexpected response format
  return {
    success: true,
    data: [],
    meta: {
      searchTerm,
      resultCount: 0,
    },
  };
};

/**
 * Get activities for a specific entity (card, auction, etc.)
 * @param entityType - Type of entity
 * @param entityId - Entity ID
 * @returns Promise<{success: boolean; data: Activity[]}> - Entity activities
 */
export const getActivitiesForEntity = async (
  entityType: string,
  entityId: string
): Promise<{ success: boolean; data: Activity[] }> => {
  // Validate both entityType and entityId to prevent [object Object] URLs
  const validEntityType = String(entityType).trim();
  const validEntityId = String(entityId).trim();

  if (
    !validEntityType ||
    !validEntityId ||
    validEntityType === '[object Object]' ||
    validEntityId === '[object Object]'
  ) {
    throw new Error('Invalid entityType or entityId provided');
  }

  const response = await unifiedApiClient.apiGet<any>(
    `/activities/entity/${validEntityType}/${validEntityId}`,
    'activities for entity'
  );

  // Handle the transformed response - unifiedApiClient extracts the data field
  if (Array.isArray(response)) {
    // If we get an array directly, it means the transformation extracted the data array
    return {
      success: true,
      data: response,
    };
  }

  // If response has the expected structure, return it as is
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response
  ) {
    return response;
  }

  // Fallback for unexpected response format
  return {
    success: true,
    data: [],
  };
};

/**
 * Mark an activity as read
 * @param id - Activity ID
 * @returns Promise<{success: boolean; data: Activity}> - Updated activity
 */
export const markActivityAsRead = async (
  id: string
): Promise<{ success: boolean; data: Activity }> => {
  return await unifiedApiClient.putById<{ success: boolean; data: Activity }>(
    '/activities',
    id,
    {},
    'read',
    {
      operation: 'mark activity as read',
      successMessage: 'Activity marked as read',
    }
  );
};

/**
 * Archive an activity (soft delete)
 * @param id - Activity ID
 * @returns Promise<{success: boolean; message: string}> - Archive result
 */
export const archiveActivity = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return await unifiedApiClient.deleteById<{
    success: boolean;
    message: string;
  }>('/activities', id, undefined, {
    operation: 'archive activity',
    successMessage: 'Activity archived successfully',
  });
};

// ========== MISSING ACTIVITY ARCHIVE FUNCTIONALITY ==========

/**
 * Archive old activities request interface
 */
// UNUSED INTERFACES REMOVED - Archive functions not used by any frontend components

// archiveOldActivities removed - not used by any frontend components

// getArchivePreview removed - not used by any frontend components

// archiveOldActivitiesWithConfirmation removed - not used by any frontend components

// Export all activity operations for convenience
export default {
  // Generic operations
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  removeActivity,
  searchActivitiesGeneric,
  // bulkCreateActivities removed - not used by any frontend components
  exportActivities,
  // batchActivityOperation removed - not used by any frontend components

  // Specialized operations
  getActivities,
  getRecentActivities,
  getActivityStats,
  // getActivityTypes removed - not used by any frontend components
  searchActivities,
  getActivitiesForEntity,
  markActivityAsRead,
  archiveActivity,

  // Archive functionality removed - not used by any frontend components
};
