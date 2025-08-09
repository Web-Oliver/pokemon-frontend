/**
 * Sales Analytics Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Manages sales analytics data, API calls, and business logic
 * for the Sales Analytics page component.
 */

import { useCallback, useEffect, useState } from 'react';
import { ISale, ISalesGraphData, ISalesSummary } from '../domain/models/sale';
import {
  getSalesData,
  getSalesGraphData,
  getSalesSummary,
} from '../api/salesApi';
import {
  aggregateByCategory,
  calculateKPIs,
  calculateTrendAnalysis,
  processGraphData,
} from '../domain/services/SalesAnalyticsService';
import { commonCSVColumns, exportToCSV } from '../utils/helpers/fileOperations';
import { log } from '../utils/performance/logger';
import { useDataFetch } from './common/useDataFetch';

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface SalesAnalyticsData {
  sales: ISale[];
  summary: ISalesSummary | null;
  graphData: ISalesGraphData[];
}

export interface UseSalesAnalyticsResult {
  // Data State
  sales: ISale[];
  summary: ISalesSummary | null;
  graphData: ISalesGraphData[];

  // Loading & Error State
  loading: boolean;
  error: string | null;

  // Computed Data
  kpis: ReturnType<typeof calculateKPIs>;
  categoryBreakdown: ReturnType<typeof aggregateByCategory>;
  trendAnalysis: ReturnType<typeof calculateTrendAnalysis>;

  // Date Range Filter
  dateRange: DateRange;
  setDateRange: (_range: DateRange) => void;

  // Actions
  fetchSalesData: (_params?: DateRange) => Promise<void>;
  refreshData: () => Promise<void>;
  exportSalesCSV: () => void;
}

/**
 * Custom hook for managing sales analytics data and operations
 * REFACTORED: Using useDataFetch to eliminate repetitive useState patterns
 */
export const useSalesAnalytics = (): UseSalesAnalyticsResult => {
  // Filter State (kept as is since it's not loading/error/data pattern)
  const [dateRange, setDateRange] = useState<DateRange>({});

  // REFACTORED: Use useDataFetch to replace repetitive useState patterns
  // Eliminates: const [loading, setLoading], const [error, setError], and data states
  const salesDataFetch = useDataFetch<SalesAnalyticsData>(
    undefined,
    {
      initialData: {
        sales: [],
        summary: null,
        graphData: []
      },
      onError: (error) => log('Error in sales analytics:', error)
    }
  );

  /**
   * Fetch sales data from multiple endpoints
   * REFACTORED: Using useDataFetch.execute() - eliminates manual loading/error state management
   */
  const fetchSalesData = useCallback(async (params?: DateRange) => {
    await salesDataFetch.execute(async (): Promise<SalesAnalyticsData> => {
      log('Fetching sales analytics data', params);

      // Fetch all sales analytics data in parallel
      const [salesData, summaryData, graphDataRaw] = await Promise.all([
        getSalesData(params).catch(() => []),
        getSalesSummary(params).catch(() => null),
        getSalesGraphData(params).catch(() => []),
      ]);

      // Process the data
      const processedData: SalesAnalyticsData = {
        sales: Array.isArray(salesData) ? salesData : [],
        summary: summaryData,
        graphData: processGraphData(Array.isArray(graphDataRaw) ? graphDataRaw : [])
      };

      log('Sales analytics data loaded successfully', {
        salesCount: processedData.sales.length,
        summaryData: processedData.summary,
        graphDataCount: processedData.graphData.length,
      });

      return processedData;
    });
  }, [salesDataFetch]);

  /**
   * Refresh all data using current date range
   */
  const refreshData = useCallback(async () => {
    await fetchSalesData(dateRange);
  }, [fetchSalesData, dateRange]);

  /**
   * Export sales data to CSV file
   * Following Context7 best practices for file download
   * REFACTORED: Using salesDataFetch.data instead of separate sales state
   */
  const exportSalesCSV = useCallback(() => {
    try {
      // Get sales data from the consolidated data fetch hook
      const safeSales = Array.isArray(salesDataFetch.data?.sales) ? salesDataFetch.data.sales : [];

      // Prepare data with computed values for CSV export
      const exportData = safeSales.map((sale) => ({
        ...sale,
        profit: (sale.actualSoldPrice || 0) - (sale.myPrice || 0),
        profitMargin:
          sale.myPrice && sale.myPrice > 0
            ? (((sale.actualSoldPrice || 0) - sale.myPrice) / sale.myPrice) *
              100
            : 0,
      }));

      // Generate filename with current date and optional date range
      const dateStr = new Date().toISOString().split('T')[0];
      const rangeStr =
        dateRange.startDate && dateRange.endDate
          ? `_${dateRange.startDate}_to_${dateRange.endDate}`
          : '';
      const filename = `sales_export_${dateStr}${rangeStr}`;

      // Export using Context7 best practices
      exportToCSV(exportData, {
        filename,
        columns: commonCSVColumns.sales,
        includeHeaders: true,
      });

      log('CSV export successful', {
        recordCount: exportData.length,
        filename,
      });
    } catch (error) {
      log('CSV export failed:', error);
      throw new Error('Failed to export sales data to CSV');
    }
  }, [salesDataFetch.data?.sales, dateRange]);

  /**
   * Update date range and fetch new data
   */
  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
      fetchSalesData(range);
    },
    [fetchSalesData]
  );

  // Load initial data on component mount
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // REFACTORED: Computed values using salesDataFetch.data instead of separate state variables
  const kpis = calculateKPIs(Array.isArray(salesDataFetch.data?.sales) ? salesDataFetch.data.sales : []);
  const categoryBreakdown = aggregateByCategory(
    Array.isArray(salesDataFetch.data?.sales) ? salesDataFetch.data.sales : []
  );
  const trendAnalysis = calculateTrendAnalysis(
    Array.isArray(salesDataFetch.data?.graphData) ? salesDataFetch.data.graphData : []
  );

  return {
    // REFACTORED: Data State from consolidated useDataFetch hook
    sales: salesDataFetch.data?.sales || [],
    summary: salesDataFetch.data?.summary || null,
    graphData: salesDataFetch.data?.graphData || [],

    // REFACTORED: Loading & Error State from useDataFetch hook
    loading: salesDataFetch.loading,
    error: salesDataFetch.error,

    // Computed Data
    kpis,
    categoryBreakdown,
    trendAnalysis,

    // Date Range Filter
    dateRange,
    setDateRange: handleDateRangeChange,

    // Actions
    fetchSalesData,
    refreshData,
    exportSalesCSV,
  };
};

export default useSalesAnalytics;
