/**
 * useActivity Hook - Context7 Premium Activity Management
 *
 * React hook for managing activities following Context7 patterns.
 * Provides state management, caching, and real-time updates.
 *
 * Features:
 * - Real-time activity updates
 * - Advanced filtering and search
 * - Optimistic updates
 * - Context7 error handling
 * - Premium caching strategies
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import activityApi, {
  Activity,
  ACTIVITY_PRIORITIES,
  ACTIVITY_TYPES,
  ActivityFilters,
  ActivityStats,
} from '../api/activityApi';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';

// Context7 Hook State Interface
interface UseActivityState {
  activities: Activity[];
  stats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  filters: ActivityFilters;
  hasMore: boolean;
  total: number;
  page: number;
  searchTerm: string;
}

// Context7 Hook Return Type
interface UseActivityReturn {
  // State
  activities: Activity[];
  stats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  filters: ActivityFilters;
  hasMore: boolean;
  total: number;
  page: number;
  searchTerm: string;

  // Actions
  fetchActivities: (newFilters?: Partial<ActivityFilters>) => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<Activity[]>;
  fetchActivityStats: () => Promise<void>;
  searchActivities: (term: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (newFilters: Partial<ActivityFilters>) => void;
  clearSearch: () => void;
  markAsRead: (id: string) => Promise<void>;
  archiveActivity: (id: string) => Promise<void>;

  // Utilities
  getActivitiesForEntity: (
    entityType: string,
    entityId: string
  ) => Promise<Activity[]>;
  getActivityById: (id: string) => Promise<Activity | null>;
}

// Context7 Premium Activity Hook
export const useActivity = (
  initialFilters: ActivityFilters = {}
): UseActivityReturn => {
  // Context7 State Management
  const [state, setState] = useState<UseActivityState>({
    activities: [],
    stats: null,
    loading: false,
    error: null,
    filters: { limit: 50, offset: 0, ...initialFilters },
    hasMore: false,
    total: 0,
    page: 1,
    searchTerm: '',
  });

  // Context7 Refs for Performance
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<string>('');

  // Context7 Fetch Activities with Caching
  const fetchActivities = useCallback(
    async (newFilters?: Partial<ActivityFilters>) => {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const filters = { ...state.filters, ...newFilters };
        const filterKey = JSON.stringify(filters);

        // Prevent duplicate requests
        if (lastFetchRef.current === filterKey && !newFilters) {
          return;
        }
        lastFetchRef.current = filterKey;

        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          filters,
          ...(newFilters?.offset === 0 && { activities: [] }), // Reset activities if starting fresh
        }));

        log('[USE ACTIVITY] Fetching activities with filters:', filters);

        const response = await activityApi.getActivities(filters);

        // Standard null safety: Ensure we always have valid arrays and metadata
        const safeData = Array.isArray(response?.data) ? response.data : [];
        const safeMeta = response?.meta || {
          hasMore: false,
          total: 0,
          page: 1,
        };

        // Validate activity objects
        const validatedActivities = safeData.filter(
          (activity): activity is Activity =>
            activity &&
            typeof activity === 'object' &&
            ('_id' in activity || 'id' in activity) &&
            'title' in activity &&
            'description' in activity
        );

        // FIXED: Always replace activities when filters change (not append)
        // Only append when doing pagination (offset > 0 AND no filter changes)
        const isFilterChange =
          newFilters && Object.keys(newFilters).some((key) => key !== 'offset');
        const isPagination =
          newFilters?.offset && newFilters.offset > 0 && !isFilterChange;

        setState((prev) => ({
          ...prev,
          activities: isPagination
            ? [...(prev.activities || []), ...validatedActivities]
            : validatedActivities, // Always replace for filter changes or initial load
          hasMore: safeMeta.hasMore || false,
          total: validatedActivities.length, // FIXED: Use actual result count for filtering
          page: safeMeta.page || 1,
          loading: false,
        }));

        log('[USE ACTIVITY] Activities fetched successfully:', response.meta);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch activities',
          }));
          handleApiError(error, 'Failed to fetch activities');
        }
      }
    },
    [state.filters]
  );

  // Context7 Recent Activities Fetch
  const fetchRecentActivities = useCallback(
    async (limit: number = 10): Promise<Activity[]> => {
      try {
        log('[USE ACTIVITY] Fetching recent activities, limit:', limit);

        const response = await activityApi.getRecentActivities(limit);

        // Standard null safety: Ensure we always return a valid array
        const safeActivities = response?.data ?? [];

        // Additional validation: Ensure each item is a valid activity object
        const validatedActivities = Array.isArray(safeActivities)
          ? safeActivities.filter(
              (activity): activity is Activity =>
                activity &&
                typeof activity === 'object' &&
                ('_id' in activity || 'id' in activity) &&
                'title' in activity &&
                'description' in activity
            )
          : [];

        log('[USE ACTIVITY] Validated activities:', {
          original: safeActivities.length,
          validated: validatedActivities.length,
        });

        return validatedActivities;
      } catch (error) {
        log('[USE ACTIVITY] Error in fetchRecentActivities:', error);
        handleApiError(error, 'Failed to fetch recent activities');
        return [];
      }
    },
    []
  );

  // Context7 Stats Fetch
  const fetchActivityStats = useCallback(async () => {
    try {
      log('[USE ACTIVITY] Fetching activity statistics');

      const response = await activityApi.getActivityStats();

      setState((prev) => ({
        ...prev,
        stats: response.data,
      }));
    } catch (error) {
      handleApiError(error, 'Failed to fetch activity statistics');
    }
  }, []);

  // Context7 Search Activities
  const searchActivities = useCallback(
    async (term: string) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          searchTerm: term,
          activities: [],
        }));

        if (!term.trim()) {
          // If search term is empty, fetch regular activities
          await fetchActivities({ offset: 0 });
          return;
        }

        log('[USE ACTIVITY] Searching activities:', term);

        const response = await activityApi.searchActivities(term, {
          type: state.filters.type,
          priority: state.filters.priority,
          entityType: state.filters.entityType,
        });

        // Standard null safety for search results
        const safeData = Array.isArray(response?.data) ? response.data : [];

        // Validate search result activity objects
        const validatedActivities = safeData.filter(
          (activity): activity is Activity =>
            activity &&
            typeof activity === 'object' &&
            ('_id' in activity || 'id' in activity) &&
            'title' in activity &&
            'description' in activity
        );

        setState((prev) => ({
          ...prev,
          activities: validatedActivities,
          hasMore: false, // Search results don't support pagination
          total: validatedActivities.length,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to search activities',
        }));
        handleApiError(error, 'Failed to search activities');
      }
    },
    [state.filters, fetchActivities]
  );

  // Context7 Load More (Pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) {
      return;
    }

    const nextOffset = state.filters.offset! + state.filters.limit!;
    await fetchActivities({ offset: nextOffset });
  }, [state.hasMore, state.loading, state.filters, fetchActivities]);

  // Context7 Refresh
  const refresh = useCallback(async () => {
    await fetchActivities({ offset: 0 });
    await fetchActivityStats();
  }, [fetchActivities, fetchActivityStats]);

  // Context7 Filter Management
  const setFilters = useCallback((newFilters: Partial<ActivityFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters, offset: 0 }, // Reset offset
      searchTerm: '', // Clear search when filtering
    }));
  }, []);

  // Context7 Clear Search
  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchTerm: '' }));
    fetchActivities({ offset: 0 });
  }, [fetchActivities]);

  // Context7 Mark as Read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await activityApi.markActivityAsRead(id);

      // Optimistic update with safety checks
      setState((prev) => ({
        ...prev,
        activities: Array.isArray(prev.activities)
          ? prev.activities.map((activity) =>
              activity && (activity._id === id || activity.id === id)
                ? {
                    ...activity,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : activity
            )
          : [],
      }));

      showSuccessToast('Activity marked as read');
    } catch (error) {
      handleApiError(error, 'Failed to mark activity as read');
    }
  }, []);

  // Context7 Archive Activity
  const archiveActivity = useCallback(async (id: string) => {
    try {
      await activityApi.archiveActivity(id);

      // Remove from list with safety checks
      setState((prev) => ({
        ...prev,
        activities: Array.isArray(prev.activities)
          ? prev.activities.filter(
              (activity) =>
                activity && activity._id !== id && activity.id !== id
            )
          : [],
        total: Math.max((prev.total || 0) - 1, 0),
      }));

      showSuccessToast('Activity archived');
    } catch (error) {
      handleApiError(error, 'Failed to archive activity');
    }
  }, []);

  // Context7 Entity Activities
  const getActivitiesForEntity = useCallback(
    async (entityType: string, entityId: string): Promise<Activity[]> => {
      try {
        const response = await activityApi.getActivitiesForEntity(
          entityType,
          entityId
        );

        // Standard null safety for entity activities
        const safeData = Array.isArray(response?.data) ? response.data : [];

        // Validate entity activity objects
        const validatedActivities = safeData.filter(
          (activity): activity is Activity =>
            activity &&
            typeof activity === 'object' &&
            ('_id' in activity || 'id' in activity) &&
            'title' in activity &&
            'description' in activity
        );

        return validatedActivities;
      } catch (error) {
        log('[USE ACTIVITY] Error in getActivitiesForEntity:', error);
        handleApiError(error, 'Failed to fetch entity activities');
        return [];
      }
    },
    []
  );

  // Context7 Get Activity by ID
  const getActivityById = useCallback(
    async (id: string): Promise<Activity | null> => {
      try {
        const response = await activityApi.getActivityById(id);

        // Standard null safety for single activity
        const activity = response?.data;

        // Validate activity object
        if (
          activity &&
          typeof activity === 'object' &&
          ('_id' in activity || 'id' in activity) &&
          'title' in activity &&
          'description' in activity
        ) {
          return activity as Activity;
        }

        return null;
      } catch (error) {
        log('[USE ACTIVITY] Error in getActivityById:', error);
        handleApiError(error, 'Failed to fetch activity');
        return null;
      }
    },
    []
  );

  // Context7 Initial Load Effect
  useEffect(() => {
    fetchActivities();
    fetchActivityStats();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount

  // Context7 Filter Change Effect
  useEffect(() => {
    if (state.searchTerm) {
      searchActivities(state.searchTerm);
    } else {
      fetchActivities();
    }
  }, [state.filters, state.searchTerm, searchActivities, fetchActivities]);

  return {
    // State
    activities: state.activities,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    hasMore: state.hasMore,
    total: state.total,
    page: state.page,
    searchTerm: state.searchTerm,

    // Actions
    fetchActivities,
    fetchRecentActivities,
    fetchActivityStats,
    searchActivities,
    loadMore,
    refresh,
    setFilters,
    clearSearch,
    markAsRead,
    archiveActivity,

    // Utilities
    getActivitiesForEntity,
    getActivityById,
  };
};

// Context7 Typed Hook Variants
export const useRecentActivities = (limit: number = 10) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activityApi.getRecentActivities(limit);

      // Standard null safety: Ensure we always have a valid array
      const safeActivities = response?.data ?? [];

      // Additional validation: Ensure each item is a valid activity object
      const validatedActivities = Array.isArray(safeActivities)
        ? safeActivities.filter(
            (activity): activity is Activity =>
              activity &&
              typeof activity === 'object' &&
              ('_id' in activity || 'id' in activity) &&
              'title' in activity &&
              'description' in activity
          )
        : [];

      log('[USE RECENT ACTIVITIES] Setting activities:', {
        total: validatedActivities.length,
        hasData: validatedActivities.length > 0,
      });

      setActivities(validatedActivities);
    } catch (error) {
      log('[USE RECENT ACTIVITIES] Error fetching activities:', error);
      handleApiError(error, 'Failed to fetch recent activities');
      // Ensure activities is always an empty array on error
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { activities, loading, refresh: fetchRecent };
};

export const useActivityStats = () => {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activityApi.getActivityStats();
      setStats(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch activity stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};

// Export types and constants
export { ACTIVITY_TYPES, ACTIVITY_PRIORITIES };
export type { Activity, ActivityFilters, ActivityStats };
