/**
 * Query Error Boundary - React Query Error Handling
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles React Query-specific errors
 * - Open/Closed: Extensible for different query error types
 * - Dependency Inversion: Works with React Query's error system
 */

import React, { ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { PokemonButton } from '../atoms/design-system/PokemonButton';

interface ApiError {
  status?: number;
  statusText?: string;
  message?: string;
  endpoint?: string;
}

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  showRetryButton?: boolean;
  queryKey?: string[];
}

const getErrorDetails = (error: unknown): ApiError => {
  if (error && typeof error === 'object') {
    const apiError = error as any;
    return {
      status: apiError.status || apiError.response?.status,
      statusText: apiError.statusText || apiError.response?.statusText,
      message: apiError.message || 'An unexpected error occurred',
      endpoint: apiError.config?.url || apiError.url,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
  };
};

const getErrorIcon = (status?: number) => {
  if (!status) return AlertTriangle;
  if (status >= 500) return AlertTriangle;
  if (status === 404) return AlertTriangle;
  if (status >= 400) return AlertTriangle;
  return WifiOff;
};

const getErrorTitle = (status?: number) => {
  if (!status) return 'Connection Error';
  if (status >= 500) return 'Server Error';
  if (status === 404) return 'Not Found';
  if (status === 403) return 'Access Denied';
  if (status === 401) return 'Authentication Required';
  if (status >= 400) return 'Request Error';
  return 'Network Error';
};

const getErrorMessage = (error: ApiError) => {
  const { status, message } = error;
  
  if (!status) return 'Unable to connect to the server. Please check your internet connection.';
  
  switch (status) {
    case 404:
      return 'The requested resource was not found.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 401:
      return 'Please sign in to continue.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'A server error occurred. Our team has been notified.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return message || 'An unexpected error occurred.';
  }
};

const getSuggestions = (status?: number): string[] => {
  if (!status) return [
    'Check your internet connection',
    'Try refreshing the page',
    'Wait a moment and try again',
  ];
  
  switch (status) {
    case 404:
      return [
        'Check the URL is correct',
        'The resource may have been moved or deleted',
        'Try going back to the previous page',
      ];
    case 401:
      return [
        'Sign in to your account',
        'Check your session has not expired',
        'Clear your browser cache and cookies',
      ];
    case 403:
      return [
        'Contact support if you believe this is an error',
        'Check you have the correct permissions',
        'Try signing out and back in',
      ];
    case 429:
      return [
        'Wait a few minutes before trying again',
        'Reduce the frequency of your requests',
        'Try again during off-peak hours',
      ];
    case 500:
    case 502:
    case 503:
    case 504:
      return [
        'Try again in a few minutes',
        'Check our status page for updates',
        'The issue is likely temporary',
      ];
    default:
      return [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists',
      ];
  }
};

export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({
  children,
  fallback,
  onRetry,
  showRetryButton = true,
  queryKey = [],
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            const apiError = getErrorDetails(error);
            console.group('🔴 Query Error Boundary');
            console.error('Query Key:', queryKey);
            console.error('API Error:', apiError);
            console.error('Error Info:', errorInfo);
            console.groupEnd();

            // Report query errors with additional context
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'exception', {
                description: `Query error: ${apiError.message}`,
                fatal: false,
                custom_map: {
                  query_key: queryKey.join(','),
                  api_status: apiError.status?.toString() || 'unknown',
                  api_endpoint: apiError.endpoint || 'unknown',
                },
              });
            }
          }}
          fallback={
            fallback || (
              <QueryErrorFallback 
                onRetry={() => {
                  reset();
                  if (onRetry) onRetry();
                }}
                showRetryButton={showRetryButton}
                queryKey={queryKey}
              />
            )
          }
          componentName={`Query-${queryKey.join('-') || 'Unknown'}`}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

interface QueryErrorFallbackProps {
  onRetry: () => void;
  showRetryButton: boolean;
  queryKey: string[];
  error?: Error;
}

const QueryErrorFallback: React.FC<QueryErrorFallbackProps> = ({
  onRetry,
  showRetryButton,
  queryKey,
}) => {
  // Get error from React Query error boundary context if available
  const error = React.useContext(React.createContext<Error | null>(null));
  const apiError = getErrorDetails(error);
  const ErrorIcon = getErrorIcon(apiError.status);
  const title = getErrorTitle(apiError.status);
  const message = getErrorMessage(apiError);
  const suggestions = getSuggestions(apiError.status);
  const isOffline = !navigator.onLine;

  return (
    <div className="min-h-[300px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border-2 border-orange-200 dark:border-orange-800/50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Status Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
          {isOffline ? (
            <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          ) : (
            <ErrorIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          )}
        </div>

        {/* Error Title */}
        <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
          {isOffline ? 'No Internet Connection' : title}
        </h3>

        {/* Error Message */}
        <p className="text-orange-700 dark:text-orange-300 mb-4">
          {isOffline 
            ? 'Please check your internet connection and try again.'
            : message
          }
        </p>

        {/* API Details (Development) */}
        {process.env.NODE_ENV === 'development' && apiError.status && (
          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-mono text-orange-800 dark:text-orange-200">
              {apiError.status} {apiError.statusText}
              {apiError.endpoint && (
                <>
                  <br />
                  <span className="text-orange-600 dark:text-orange-400">
                    {apiError.endpoint}
                  </span>
                </>
              )}
              {queryKey.length > 0 && (
                <>
                  <br />
                  <span className="text-orange-600 dark:text-orange-400">
                    Query: [{queryKey.join(', ')}]
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {showRetryButton && (
          <div className="flex flex-col gap-3">
            <PokemonButton
              variant="primary"
              onClick={onRetry}
              className="min-w-[120px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </PokemonButton>

            {isOffline && (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <Wifi className="w-4 h-4" />
                <span>Waiting for connection...</span>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {!isOffline && suggestions.length > 0 && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100">
              Troubleshooting Tips
            </summary>
            <ul className="mt-2 space-y-1 text-xs text-orange-700 dark:text-orange-300">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
};

export default QueryErrorBoundary;