import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  ApplicationError,
  clearLastError,
  type ErrorContext,
  ErrorSeverity,
  handleError,
} from '../../../utils/helpers/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: ApplicationError, errorInfo: ErrorInfo) => void;
  context?: ErrorContext;
  enableRecovery?: boolean;
  showDebugInfo?: boolean;
}

interface State {
  hasError: boolean;
  error?: ApplicationError;
  errorId?: string;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0,
  };
  private maxRetryCount = 3;

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.error('ErrorBoundary caught error:', error);
    return {
      hasError: true,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert to ApplicationError and process through our enhanced error handler
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      ...this.props.context,
      additionalInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount,
      },
    };

    const processedError = handleError(error, context);

    // Update state with processed error
    this.setState({
      error: processedError,
      hasError: true,
    });

    // Call user-provided error handler with enhanced error
    this.props.onError?.(processedError, errorInfo);

    console.error('ErrorBoundary componentDidCatch:', {
      error: processedError.getDebugInfo(),
      errorInfo,
      retryCount: this.state.retryCount,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, retryCount } = this.state;
      const { showDebugInfo = false } = this.props;
      const severityColor = this.getSeverityColor(error?.severity);
      const userMessage = this.getUserMessage(error);
      const canRetry = this.canRetry();

      return (
        <div className={`p-8 border rounded-lg ${severityColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            {errorId && (
              <span className="text-xs opacity-60 font-mono">
                ID: {errorId}
              </span>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm mb-2">{userMessage}</p>

            {error && (
              <div className="text-xs opacity-80">
                <span className="font-semibold">Category:</span>{' '}
                {error.category} |
                <span className="font-semibold ml-1">Severity:</span>{' '}
                {error.severity}
                {retryCount > 0 && (
                  <span className="ml-1">
                    | <span className="font-semibold">Retries:</span>{' '}
                    {retryCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {showDebugInfo && error && (
            <details className="mb-4 text-sm">
              <summary className="cursor-pointer font-semibold">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-black bg-opacity-10 rounded overflow-auto text-xs">
                {JSON.stringify(error.getDebugInfo(), null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  error?.severity === ErrorSeverity.CRITICAL
                    ? 'bg-red-700 text-red-100 hover:bg-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Try Again
              </button>
            )}

            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>

            {error?.severity === ErrorSeverity.CRITICAL && (
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 transition-colors"
              >
                Go to Home
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount > this.maxRetryCount) {
      console.warn('Max retry count reached, not retrying');
      return;
    }

    // Clear last error from global state
    clearLastError();

    // Reset error boundary state
    this.setState({
      hasError: false,
      error: undefined,
      errorId: undefined,
      retryCount: newRetryCount,
    });
  };

  private handleReload = () => {
    clearLastError();
    window.location.reload();
  };

  private getSeverityColor(severity?: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-900 border-red-800 text-red-100';
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  }

  private getUserMessage(error?: ApplicationError): string {
    if (error) {
      return error.getUserMessage();
    }
    return 'An unexpected error occurred. Please try refreshing the page.';
  }

  private canRetry(): boolean {
    const { enableRecovery = true } = this.props;
    const { error, retryCount } = this.state;

    return (
      enableRecovery &&
      retryCount < this.maxRetryCount &&
      error?.recoverable !== false
    );
  }
}

export default ErrorBoundary;
