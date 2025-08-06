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

export interface DateRange {
  startDate?: string;
  endDate?: string;
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
 */
export const useSalesAnalytics = (): UseSalesAnalyticsResult => {
  // Core Data State
  const [sales, setSales] = useState<ISale[]>([]);
  const [summary, setSummary] = useState<ISalesSummary | null>(null);
  const [graphData, setGraphData] = useState<ISalesGraphData[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [dateRange, setDateRange] = useState<DateRange>({});

  /**
   * Fetch sales data from multiple endpoints
   */
  const fetchSalesData = useCallback(async (params?: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      log('Fetching sales analytics data', params);

      // Fetch all sales analytics data in parallel
      const [salesData, summaryData, graphDataRaw] = await Promise.all([
        getSalesData(params).catch(() => []),
        getSalesSummary(params).catch(() => null),
        getSalesGraphData(params).catch(() => []),
      ]);

      // Process and set the data
      setSales(Array.isArray(salesData) ? salesData : []);
      setSummary(summaryData);
      setGraphData(
        processGraphData(Array.isArray(graphDataRaw) ? graphDataRaw : [])
      );

      log('Sales analytics data loaded successfully', {
        salesCount: salesData.length,
        summaryData,
        graphDataCount: graphDataRaw.length,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch sales data';
      setError(errorMessage);
      log('Error fetching sales analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh all data using current date range
   */
  const refreshData = useCallback(async () => {
    await fetchSalesData(dateRange);
  }, [fetchSalesData, dateRange]);

  /**
   * Export sales data to CSV file
   * Following Context7 best practices for file download
   */
  const exportSalesCSV = useCallback(() => {
    try {
      // Ensure sales is an array before mapping
      const safeSales = Array.isArray(sales) ? sales : [];

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
  }, [sales, dateRange]);

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

  // Computed values based on current data
  const kpis = calculateKPIs(Array.isArray(sales) ? sales : []);
  const categoryBreakdown = aggregateByCategory(
    Array.isArray(sales) ? sales : []
  );
  const trendAnalysis = calculateTrendAnalysis(
    Array.isArray(graphData) ? graphData : []
  );

  return {
    // Data State
    sales,
    summary,
    graphData,

    // Loading & Error State
    loading,
    error,

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
