/**
 * Sales Analytics Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Manages sales analytics data, API calls, and business logic
 * for the Sales Analytics page component.
 */

import { useState, useEffect, useCallback } from 'react';
import { ISale, ISalesSummary, ISalesGraphData } from '../domain/models/sale';
import { getSalesData, getSalesSummary, getSalesGraphData } from '../api/salesApi';
import {
  calculateKPIs,
  processGraphData,
  aggregateByCategory,
  calculateTrendAnalysis,
} from '../domain/services/SalesAnalyticsService';
import { exportToCSV, commonCSVColumns } from '../utils/fileOperations';
import { log } from '../utils/logger';

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
        getSalesData(params),
        getSalesSummary(params),
        getSalesGraphData(params),
      ]);

      // Process and set the data
      setSales(salesData);
      setSummary(summaryData);
      setGraphData(processGraphData(graphDataRaw));

      log('Sales analytics data loaded successfully', {
        salesCount: salesData.length,
        summaryData,
        graphDataCount: graphDataRaw.length,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales data';
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
      // Prepare data with computed values for CSV export
      const exportData = sales.map(sale => ({
        ...sale,
        profit: (sale.actualSoldPrice || 0) - (sale.myPrice || 0),
        profitMargin:
          sale.myPrice && sale.myPrice > 0
            ? (((sale.actualSoldPrice || 0) - sale.myPrice) / sale.myPrice) * 100
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

      log('CSV export successful', { recordCount: exportData.length, filename });
    } catch (error) {
      log('CSV export failed:', error);
      throw new Error('Failed to export sales data to CSV');
    }
  }, [sales, dateRange]);

  /**
   * Update date range and fetch new data
   */
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    fetchSalesData(range);
  }, [fetchSalesData]);

  // Load initial data on component mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Computed values based on current data
  const kpis = calculateKPIs(sales);
  const categoryBreakdown = aggregateByCategory(sales);
  const trendAnalysis = calculateTrendAnalysis(graphData);

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
