import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/shared/components/organisms/ui/toastNotifications';
import { showErrorToast } from '@/shared/components/organisms/ui/toastNotifications';

/**
 * React Error Boundary Component
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Catches and handles React component errors
 * - DRY: Centralizes error boundary logic across the application
 * - Open/Closed: Extensible with custom error UI and recovery strategies
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Context name for logging */
  context?: string;
  /** Custom fallback UI component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Whether to show toast notification on error */
  showToast?: boolean;
  /** Custom error message for toast */
  toastMessage?: string;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to enable error recovery */
  enableRecovery?: boolean;
  /** Auto-recovery timeout in ms */
  recoveryTimeout?: number;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  context: string;
  onRetry: () => void;
  onReset: () => void;
}

/**
 * Default Error Fallback UI
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  context,
  onRetry,
  onReset,
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-red-300 mb-3">
          Something went wrong
        </h2>

        {/* Error Message */}
        <p className="text-red-200/80 mb-6 leading-relaxed">
          An unexpected error occurred in the {context.toLowerCase()} component. 
          We've logged this issue for investigation.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-red-300/80 text-sm cursor-pointer hover:text-red-300 transition-colors">
              Show Error Details
            </summary>
            <div className="mt-3 p-4 bg-black/40 rounded-lg border border-red-500/20">
              <p className="text-xs text-red-200/70 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-red-200/50 mt-2 overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * React Error Boundary Class Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private recoveryTimer?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || 'COMPONENT';
    
    // Log error with context
    logError(
      `${context.toUpperCase()}_ERROR_BOUNDARY`,
      `React component error: ${error.message}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundaryContext: context,
        errorId: this.state.errorId,
      }
    );

    // Show toast notification if enabled
    if (this.props.showToast !== false) {
      const toastMessage = this.props.toastMessage || 
        `An error occurred in the ${context.toLowerCase()} component. Please try again.`;
      showErrorToast(toastMessage);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Set up auto-recovery if enabled
    if (this.props.enableRecovery && this.props.recoveryTimeout) {
      this.recoveryTimer = setTimeout(() => {
        this.handleRetry();
      }, this.props.recoveryTimeout);
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  componentWillUnmount() {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  handleRetry = () => {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = undefined;
    }
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  handleReset = () => {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = undefined;
    }

    // Force full component remount by updating key
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          context={this.props.context || 'Component'}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for error boundary context (for functional components)
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setError(errorObj);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

/**
 * Error Boundary for specific contexts
 */
export const FormErrorBoundary: React.FC<{ children: ReactNode; formName: string }> = ({
  children,
  formName,
}) => (
  <ErrorBoundary
    context={`${formName}_FORM`}
    showToast={true}
    toastMessage={`An error occurred in the ${formName} form. Please try again.`}
    enableRecovery={true}
    recoveryTimeout={3000}
  >
    {children}
  </ErrorBoundary>
);

export const PageErrorBoundary: React.FC<{ children: ReactNode; pageName: string }> = ({
  children,
  pageName,
}) => (
  <ErrorBoundary
    context={`${pageName}_PAGE`}
    showToast={true}
    toastMessage={`An error occurred on the ${pageName} page. Refreshing may help.`}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; componentName: string }> = ({
  children,
  componentName,
}) => (
  <ErrorBoundary
    context={componentName}
    showToast={false} // Usually too noisy for individual components
    enableRecovery={true}
    recoveryTimeout={1000}
  >
    {children}
  </ErrorBoundary>
);