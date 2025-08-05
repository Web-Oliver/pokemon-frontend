/**
 * Data Table Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Provides consistent data display, filtering, and pagination
 * Follows DRY principle - eliminates duplicate table/grid patterns
 */

import { useCallback, useMemo, useState } from 'react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T, value: any) => React.ReactNode;
  width?: string;
}

export interface DataTableFilter {
  field: string;
  value: string;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

export interface DataTableSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UseDataTableConfig<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  initialSort?: DataTableSort;
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
}

export interface UseDataTableReturn<T> {
  // Display data
  displayData: T[];
  totalItems: number;

  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;

  // Filtering
  filters: DataTableFilter[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addFilter: (filter: DataTableFilter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;

  // Sorting
  sort: DataTableSort | null;
  setSortField: (field: string) => void;
  toggleSort: (field: string) => void;

  // Selection (for exports, bulk operations)
  selectedItems: T[];
  selectItem: (item: T) => void;
  deselectItem: (item: T) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isItemSelected: (item: T) => boolean;

  // Utility
  isEmpty: boolean;
  hasFilters: boolean;
}

/**
 * Hook for consistent data table/grid functionality
 * Used by Collection, SetSearch, SealedProductSearch, and other list pages
 */
export const useDataTable = <T extends { id: string }>(
  config: UseDataTableConfig<T>
): UseDataTableReturn<T> => {
  const {
    data,
    initialSort,
    itemsPerPage: initialItemsPerPage = 20,
    searchFields = [],
  } = config;

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [filters, setFilters] = useState<DataTableFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<DataTableSort | null>(initialSort || null);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search query
    if (searchQuery.trim() && searchFields.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      result = result.filter((item) => {
        const value = (item as any)[filter.field];
        if (!value) {
          return false;
        }

        const stringValue = value.toString().toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator || 'contains') {
          case 'equals':
            return stringValue === filterValue;
          case 'startsWith':
            return stringValue.startsWith(filterValue);
          case 'endsWith':
            return stringValue.endsWith(filterValue);
          case 'contains':
          default:
            return stringValue.includes(filterValue);
        }
      });
    });

    // Apply sorting
    if (sort) {
      result.sort((a, b) => {
        const aValue = (a as any)[sort.field];
        const bValue = (b as any)[sort.field];

        if (aValue < bValue) {
          return sort.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, filters, sort]);

  // Paginated data
  const displayData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, itemsPerPage]);

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Filter operations
  const addFilter = useCallback((filter: DataTableFilter) => {
    setFilters((prev) => {
      const existing = prev.findIndex((f) => f.field === filter.field);
      if (existing >= 0) {
        // Replace existing filter
        const newFilters = [...prev];
        newFilters[existing] = filter;
        return newFilters;
      } else {
        // Add new filter
        return [...prev, filter];
      }
    });
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Sort operations
  const setSortField = useCallback((field: string) => {
    setSort({ field, direction: 'asc' });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (!prev || prev.field !== field) {
        return { field, direction: 'asc' };
      } else if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      } else {
        return null; // Remove sort
      }
    });
  }, []);

  // Selection operations
  const selectItem = useCallback((item: T) => {
    setSelectedItems((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const deselectItem = useCallback((item: T) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems([...displayData]);
  }, [displayData]);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isItemSelected = useCallback(
    (item: T) => {
      return selectedItems.some((i) => i.id === item.id);
    },
    [selectedItems]
  );

  // Update current page when itemsPerPage changes
  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  }, []);

  // Update search query
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const isEmpty = data.length === 0;
  const hasFilters = filters.length > 0 || searchQuery.trim().length > 0;

  return {
    displayData,
    totalItems,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    filters,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    addFilter,
    removeFilter,
    clearFilters,
    sort,
    setSortField,
    toggleSort,
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    isItemSelected,
    isEmpty,
    hasFilters,
  };
};
