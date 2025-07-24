/**
 * Export Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Consolidates export functionality across analytics and collection pages
 * Follows DRY principle - eliminates duplicate export patterns
 */

import { useCallback, useState } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { exportToCSV, exportToPDF, exportToJSON, ExportFormat } from '../utils/fileOperations';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';

export interface ExportConfig {
  filename?: string;
  format?: ExportFormat;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface UseExportOperationsReturn {
  // Export state
  isExporting: boolean;
  exportError: string | null;

  // Export operations
  exportData: <T>(data: T[], config?: ExportConfig) => Promise<void>;
  exportCSV: <T>(data: T[], filename?: string) => Promise<void>;
  exportPDF: <T>(data: T[], filename?: string) => Promise<void>;
  exportJSON: <T>(data: T[], filename?: string) => Promise<void>;

  // Specialized exports for different data types
  exportSalesData: (
    sales: any[],
    dateRange?: { startDate?: string; endDate?: string }
  ) => Promise<void>;
  exportCollectionData: (items: any[], type?: 'all' | 'psa' | 'raw' | 'sealed') => Promise<void>;
  exportAnalyticsData: (data: any[], reportType?: string) => Promise<void>;

  // Utility
  clearExportError: () => void;
}

/**
 * Consolidated export operations hook
 * Used by: SalesAnalytics, Analytics, Collection, DbaExport pages
 */
export const useExportOperations = (): UseExportOperationsReturn => {
  const {
    loading: isExporting,
    error: exportError,
    execute,
    clearError: clearExportError,
  } = useAsyncOperation();

  const exportData = useCallback(
    async <T>(data: T[], config: ExportConfig = {}): Promise<void> => {
      const {
        filename = 'export',
        format = 'csv',
        includeHeaders = true,
        dateFormat = 'YYYY-MM-DD',
      } = config;

      await execute(async () => {
        if (!data || data.length === 0) {
          throw new Error('No data available for export');
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = `${filename}_${timestamp}`;

        switch (format) {
          case 'csv':
            exportToCSV(data, {
              filename: finalFilename,
              columns: Object.keys(data[0] || {}).map(key => ({
                key,
                header:
                  key.charAt(0).toUpperCase() +
                  key
                    .slice(1)
                    .replace(/([A-Z])/g, ' $1')
                    .trim(),
              })),
              includeHeaders,
              delimiter: ',',
            });
            break;
          case 'pdf':
            await exportToPDF(data, finalFilename);
            break;
          case 'json':
            exportToJSON(data, finalFilename);
            break;
          default:
            throw new Error(`Unsupported export format: ${format}`);
        }

        showSuccessToast(`Data exported successfully as ${format.toUpperCase()}!`);
        return Promise.resolve();
      });
    },
    [execute]
  );

  const exportCSV = useCallback(
    async <T>(data: T[], filename: string = 'data'): Promise<void> => {
      await exportData(data, { filename, format: 'csv' });
    },
    [exportData]
  );

  const exportPDF = useCallback(
    async <T>(data: T[], filename: string = 'data'): Promise<void> => {
      await exportData(data, { filename, format: 'pdf' });
    },
    [exportData]
  );

  const exportJSON = useCallback(
    async <T>(data: T[], filename: string = 'data'): Promise<void> => {
      await exportData(data, { filename, format: 'json' });
    },
    [exportData]
  );

  // Specialized export for sales data
  const exportSalesData = useCallback(
    async (sales: any[], dateRange?: { startDate?: string; endDate?: string }): Promise<void> => {
      let filename = 'sales_data';

      if (dateRange?.startDate && dateRange?.endDate) {
        filename = `sales_data_${dateRange.startDate}_to_${dateRange.endDate}`;
      } else if (dateRange?.startDate) {
        filename = `sales_data_from_${dateRange.startDate}`;
      } else if (dateRange?.endDate) {
        filename = `sales_data_until_${dateRange.endDate}`;
      }

      await exportCSV(sales, filename);
    },
    [exportCSV]
  );

  // Specialized export for collection data
  const exportCollectionData = useCallback(
    async (items: any[], type: 'all' | 'psa' | 'raw' | 'sealed' = 'all'): Promise<void> => {
      const filename = type === 'all' ? 'collection_all_items' : `collection_${type}_cards`;
      await exportCSV(items, filename);
    },
    [exportCSV]
  );

  // Specialized export for analytics data
  const exportAnalyticsData = useCallback(
    async (data: any[], reportType: string = 'analytics'): Promise<void> => {
      const filename = `${reportType}_report`;
      await exportCSV(data, filename);
    },
    [exportCSV]
  );

  return {
    isExporting,
    exportError,
    exportData,
    exportCSV,
    exportPDF,
    exportJSON,
    exportSalesData,
    exportCollectionData,
    exportAnalyticsData,
    clearExportError,
  };
};
