/**
 * Error Boundary Utility Functions
 * Layer 3: Components (UI Building Blocks) - Utilities
 *
 * Following Context7 + CLAUDE.md principles:
 * - Extracted from ErrorBoundary.tsx to satisfy react-refresh/only-export-components
 * - Single Responsibility: Provides utility functions for error tracking
 * - DRY: Centralized logic for accessing and clearing error metrics
 */

// Context7: Global error tracking for performance monitoring
const errorMetrics = {
  totalErrors: 0,
  errorsByComponent: new Map<string, number>(),
  errorHistory: [] as Array<{
    timestamp: number;
    component: string;
    error: string;
    errorId: string;
  }>,
};

// This function will be called from within ErrorBoundary.tsx to update the metrics
export const updateErrorMetrics = (metrics: typeof errorMetrics) => {
  errorMetrics.totalErrors = metrics.totalErrors;
  errorMetrics.errorsByComponent = metrics.errorsByComponent;
  errorMetrics.errorHistory = metrics.errorHistory;
};

// Context7: Export error metrics for performance monitoring integration
export const getErrorMetrics = () => ({
  ...errorMetrics,
  errorHistory: [...errorMetrics.errorHistory],
  errorsByComponent: new Map(errorMetrics.errorsByComponent),
});

export const clearErrorMetrics = () => {
  errorMetrics.totalErrors = 0;
  errorMetrics.errorsByComponent.clear();
  errorMetrics.errorHistory.length = 0;
};
