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
  createResourceOperations,
  ACTIVITY_CONFIG,
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

export interface ActivityTypesResponse {
  success: boolean;
  data: {
    types: Array<{ key: string; value: string; label: string }>;
    priorities: Array<{ key: string; value: string; label: string }>;
    dateRanges: Array<{ value: string; label: string }>;
  };
}

/**
 * Activity creation payload interface
 */
interface IActivityCreatePayload
  extends Omit<Activity, 'id' | '_id' | 'createdAt' | 'updatedAt'> {}

/**
 * Activity update payload interface
 */
interface IActivityUpdatePayload extends Partial<IActivityCreatePayload> {}

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
  includeBatchOperations: true,
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

/**
 * Bulk create activities
 * @param activitiesData - Array of activity creation data
 * @returns Promise<Activity[]> - Created activities
 */
export const bulkCreateActivities = activityOperations.bulkCreate;

/**
 * Export activities data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportActivities = activityOperations.export;

/**
 * Batch operation on activities
 * @param operation - Operation name
 * @param ids - Activity IDs
 * @param operationData - Operation-specific data
 * @returns Promise<Activity[]> - Operation results
 */
export const batchActivityOperation = activityOperations.batchOperation;

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

  const response = await unifiedApiClient.apiGet<ActivityResponse>(
    '/activities',
    'activities with filters',
    { params: queryParams }
  );

  return response;
};

/**
 * Get recent activities (last 10 by default)
 * @param limit - Number of recent activities to fetch
 * @returns Promise<{success: boolean; data: Activity[]}> - Recent activities
 */
export const getRecentActivities = async (
  limit: number = 10
): Promise<{ success: boolean; data: Activity[] }> => {
  const response = await unifiedApiClient.apiGet<{
    success: boolean;
    data: Activity[];
  }>(`/activities/recent?limit=${limit}`, 'recent activities');

  return response;
};

/**
 * Get activity statistics and analytics
 * @returns Promise<ActivityStatsResponse> - Activity statistics
 */
export const getActivityStats = async (): Promise<ActivityStatsResponse> => {
  const response = await unifiedApiClient.apiGet<ActivityStatsResponse>(
    '/activities/stats',
    'activity statistics'
  );

  return response;
};

/**
 * Get available activity types and metadata
 * @returns Promise<ActivityTypesResponse> - Activity types and metadata
 */
export const getActivityTypes = async (): Promise<ActivityTypesResponse> => {
  const response = await unifiedApiClient.apiGet<ActivityTypesResponse>(
    '/activities/types',
    'activity types'
  );

  return response;
};

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

  const response = await unifiedApiClient.apiGet<{
    success: boolean;
    data: Activity[];
    meta: { searchTerm: string; resultCount: number };
  }>('/activities/search', 'activity search', { params: queryParams });

  return response;
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

  const response = await unifiedApiClient.apiGet<{
    success: boolean;
    data: Activity[];
  }>(
    `/activities/entity/${validEntityType}/${validEntityId}`,
    'activities for entity'
  );

  return response;
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

// Export all activity operations for convenience
export default {
  // Generic operations
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  removeActivity,
  searchActivitiesGeneric,
  bulkCreateActivities,
  exportActivities,
  batchActivityOperation,

  // Specialized operations
  getActivities,
  getRecentActivities,
  getActivityStats,
  getActivityTypes,
  searchActivities,
  getActivitiesForEntity,
  markActivityAsRead,
  archiveActivity,
};
