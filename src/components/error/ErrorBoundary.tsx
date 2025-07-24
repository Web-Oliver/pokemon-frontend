/**
 * Error Boundary Component with Performance Monitoring
 * Layer 3: Components (UI Building Blocks)
 *
 * Following Context7 + CLAUDE.md principles:
 * - Comprehensive error catching with React Error Boundary
 * - Performance monitoring integration for error tracking
 * - Graceful fallback UI for different error types
 * - Development debugging with detailed error information
 */

import { Component, ReactNode, lazy, Suspense } from 'react';
import { AlertTriangle, RefreshCw, Home, Code, Activity } from 'lucide-react';

// Context7: Lazy load ReactProfiler for performance monitoring
const ReactProfiler = lazy(() => import('../debug/ReactProfiler'));

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  maxRetries?: number;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  componentName?: string;
}

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

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentName = 'Unknown' } = this.props;
    const { errorId } = this.state;

    // Context7: Track error metrics for performance monitoring
    errorMetrics.totalErrors++;
    const componentErrorCount =
      errorMetrics.errorsByComponent.get(componentName) || 0;
    errorMetrics.errorsByComponent.set(componentName, componentErrorCount + 1);

    // Add to error history
    errorMetrics.errorHistory.push({
      timestamp: Date.now(),
      component: componentName,
      error: error.message,
      errorId: errorId || 'unknown',
    });

    // Keep only last 100 errors
    if (errorMetrics.errorHistory.length > 100) {
      errorMetrics.errorHistory.shift();
    }

    // Context7: Enhanced error logging with performance context
    console.group(`🚨 [ERROR BOUNDARY] Error in ${componentName}`);
    console.error('Error:', error);
    console.error('Error ID:', errorId);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);

    // Log performance metrics at time of error
    if (typeof window !== 'undefined' && window.performance) {
      const memoryInfo = (performance as any).memory;
      const navigationTiming = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      console.group('📊 Performance Context at Error Time');
      if (memoryInfo) {
        console.log(
          `Memory Usage: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
        );
        console.log(
          `Memory Limit: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        );
      }
      if (navigationTiming) {
        console.log(
          `Page Load Time: ${(navigationTiming.loadEventEnd - navigationTiming.fetchStart).toFixed(2)}ms`
        );
      }
      console.log(`Errors This Session: ${errorMetrics.totalErrors}`);
      console.log(`Component Error Count: ${componentErrorCount + 1}`);
      console.groupEnd();
    }

    console.groupEnd();

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Context7: Report to performance monitoring if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          component: componentName,
          error_id: errorId,
        },
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.resetErrorBoundary();
    } else {
      // Too many retries, reload the page
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const {
      children,
      fallback,
      showErrorDetails = process.env.NODE_ENV === 'development',
      maxRetries = 3,
      componentName = 'Component',
    } = this.props;

    if (hasError && error) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI with performance monitoring
      return (
        <Suspense fallback={null}>
          <ReactProfiler
            id="ErrorBoundary"
            onRenderThreshold={10}
            aggregateMetrics={true}
          >
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-700/40 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-zinc-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        Something went wrong
                      </h1>
                      <p className="text-red-100">
                        An error occurred in {componentName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Content */}
                <div className="p-8 space-y-6">
                  {/* Error Summary */}
                  <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
                    <h3 className="font-semibold text-red-300 mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Error Details
                    </h3>
                    <p className="text-red-200 font-mono text-sm break-words">
                      {error.message}
                    </p>
                    {errorId && (
                      <p className="text-red-400 text-xs mt-2">
                        Error ID: {errorId}
                      </p>
                    )}
                  </div>

                  {/* Performance Context */}
                  <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-300 mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Performance Context
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-400 font-medium">
                          Total Errors:
                        </span>
                        <span className="ml-2 text-blue-200">
                          {errorMetrics.totalErrors}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">
                          Retry Count:
                        </span>
                        <span className="ml-2 text-blue-200">{retryCount}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">
                          Component:
                        </span>
                        <span className="ml-2 text-blue-800">
                          {componentName}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">
                          Timestamp:
                        </span>
                        <span className="ml-2 text-blue-800">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {retryCount < maxRetries ? (
                      <button
                        onClick={this.handleRetry}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again ({maxRetries - retryCount} attempts left)
                      </button>
                    ) : (
                      <button
                        onClick={() => window.location.reload()}
                        className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reload Page
                      </button>
                    )}

                    <button
                      onClick={this.handleGoHome}
                      className="flex items-center px-6 py-3 bg-gray-600 dark:bg-zinc-400 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-zinc-300 transition-colors font-medium"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Homepage
                    </button>
                  </div>

                  {/* Development Details */}
                  {showErrorDetails && errorInfo && (
                    <details className="bg-gray-50 dark:bg-zinc-900/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 dark:border-zinc-700 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-700 dark:text-zinc-300 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900">
                        <span className="flex items-center">
                          <Code className="w-4 h-4 mr-2" />
                          Developer Information
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200 dark:border-zinc-700 dark:border-zinc-700 space-y-4">
                        {/* Stack Trace */}
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-zinc-200 dark:text-zinc-100 mb-2">
                            Stack Trace:
                          </h4>
                          <pre className="bg-gray-800 dark:bg-zinc-200 text-green-400 p-3 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </div>

                        {/* Component Stack */}
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-zinc-200 dark:text-zinc-100 mb-2">
                            Component Stack:
                          </h4>
                          <pre className="bg-gray-800 dark:bg-zinc-200 text-blue-400 p-3 rounded text-xs overflow-x-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </div>

                        {/* Error History */}
                        {errorMetrics.errorHistory.length > 1 && (
                          <div>
                            <h4 className="font-semibold text-zinc-200 mb-2">
                              Recent Errors:
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {errorMetrics.errorHistory
                                .slice(-5)
                                .map((errorRecord) => (
                                  <div
                                    key={errorRecord.errorId}
                                    className="bg-zinc-800/60 p-2 rounded border border-zinc-700/40 text-xs"
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-mono text-zinc-200">
                                        {errorRecord.error}
                                      </span>
                                      <span className="text-zinc-400 ml-2">
                                        {new Date(
                                          errorRecord.timestamp
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="text-zinc-300 mt-1">
                                      Component: {errorRecord.component}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </ReactProfiler>
        </Suspense>
      );
    }

    // No error, render children normally
    return <>{children}</>;
  }
}

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

export default ErrorBoundary;
