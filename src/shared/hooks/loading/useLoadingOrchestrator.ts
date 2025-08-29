import { useCallback, useMemo, useState } from 'react';
import { logInfo, logError } from '@/shared/components/organisms/ui/toastNotifications';

/**
 * Loading Orchestrator Hook
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Manages complex loading states across operations
 * - DRY: Eliminates scattered loading state management patterns
 * - Open/Closed: Extensible for different loading scenarios
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type LoadingContext = string;

export interface LoadingOperation {
  id: string;
  context: LoadingContext;
  state: LoadingState;
  startTime: number;
  endTime?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

export interface LoadingOrchestratorConfig {
  /** Default context for logging */
  defaultContext?: LoadingContext;
  /** Whether to log loading operations */
  enableLogging?: boolean;
  /** Maximum concurrent operations */
  maxConcurrentOperations?: number;
  /** Global loading timeout in ms */
  globalTimeout?: number;
}

export interface UseLoadingOrchestratorReturn {
  /** All active loading operations */
  operations: LoadingOperation[];
  /** Whether any operation is loading */
  isAnyLoading: boolean;
  /** Whether all operations are loading */
  isAllLoading: boolean;
  /** Get loading state for specific operation */
  isLoading: (operationId: string) => boolean;
  /** Start a loading operation */
  startLoading: (operationId: string, context?: LoadingContext, metadata?: Record<string, any>) => void;
  /** End a loading operation (success) */
  endLoading: (operationId: string) => void;
  /** End a loading operation with error */
  endLoadingWithError: (operationId: string, error: Error) => void;
  /** Clear specific operation */
  clearOperation: (operationId: string) => void;
  /** Clear all operations */
  clearAllOperations: () => void;
  /** Create async operation wrapper */
  createAsyncOperation: <T>(
    operationId: string,
    operation: () => Promise<T>,
    context?: LoadingContext,
    metadata?: Record<string, any>
  ) => () => Promise<T | undefined>;
  /** Get operation by ID */
  getOperation: (operationId: string) => LoadingOperation | undefined;
  /** Get operations by context */
  getOperationsByContext: (context: LoadingContext) => LoadingOperation[];
}

/**
 * Advanced loading orchestrator for managing complex loading states
 */
export const useLoadingOrchestrator = (
  config: LoadingOrchestratorConfig = {}
): UseLoadingOrchestratorReturn => {
  const {
    defaultContext = 'OPERATION',
    enableLogging = true,
    maxConcurrentOperations = 10,
    globalTimeout = 30000, // 30 seconds
  } = config;

  const [operations, setOperations] = useState<LoadingOperation[]>([]);

  /**
   * Start a loading operation
   */
  const startLoading = useCallback(
    (operationId: string, context?: LoadingContext, metadata?: Record<string, any>) => {
      setOperations(prev => {
        // Check max concurrent operations
        const activeOperations = prev.filter(op => op.state === 'loading');
        if (activeOperations.length >= maxConcurrentOperations) {
          if (enableLogging) {
            logError(
              'LOADING_ORCHESTRATOR',
              `Maximum concurrent operations (${maxConcurrentOperations}) reached. Operation ${operationId} not started.`,
              undefined,
              { operationId, context, metadata }
            );
          }
          return prev;
        }

        // Remove existing operation with same ID
        const filtered = prev.filter(op => op.id !== operationId);
        
        const newOperation: LoadingOperation = {
          id: operationId,
          context: context || defaultContext,
          state: 'loading',
          startTime: Date.now(),
          metadata,
        };

        if (enableLogging) {
          logInfo(
            'LOADING_ORCHESTRATOR',
            `Starting operation: ${operationId}`,
            { context: newOperation.context, metadata }
          );
        }

        return [...filtered, newOperation];
      });

      // Set up global timeout
      if (globalTimeout > 0) {
        setTimeout(() => {
          setOperations(prev => {
            const operation = prev.find(op => op.id === operationId && op.state === 'loading');
            if (operation) {
              if (enableLogging) {
                logError(
                  'LOADING_ORCHESTRATOR',
                  `Operation ${operationId} timed out after ${globalTimeout}ms`,
                  new Error('Operation timeout'),
                  { operationId, context, metadata }
                );
              }
              return prev.map(op =>
                op.id === operationId
                  ? { ...op, state: 'error' as LoadingState, endTime: Date.now(), error: new Error('Operation timeout') }
                  : op
              );
            }
            return prev;
          });
        }, globalTimeout);
      }
    },
    [defaultContext, enableLogging, maxConcurrentOperations, globalTimeout]
  );

  /**
   * End a loading operation successfully
   */
  const endLoading = useCallback(
    (operationId: string) => {
      setOperations(prev => {
        return prev.map(op => {
          if (op.id === operationId && op.state === 'loading') {
            const duration = Date.now() - op.startTime;
            
            if (enableLogging) {
              logInfo(
                'LOADING_ORCHESTRATOR',
                `Operation ${operationId} completed successfully in ${duration}ms`,
                { context: op.context, duration }
              );
            }

            return {
              ...op,
              state: 'success' as LoadingState,
              endTime: Date.now(),
            };
          }
          return op;
        });
      });
    },
    [enableLogging]
  );

  /**
   * End a loading operation with error
   */
  const endLoadingWithError = useCallback(
    (operationId: string, error: Error) => {
      setOperations(prev => {
        return prev.map(op => {
          if (op.id === operationId && op.state === 'loading') {
            const duration = Date.now() - op.startTime;
            
            if (enableLogging) {
              logError(
                'LOADING_ORCHESTRATOR',
                `Operation ${operationId} failed after ${duration}ms`,
                error,
                { context: op.context, duration }
              );
            }

            return {
              ...op,
              state: 'error' as LoadingState,
              endTime: Date.now(),
              error,
            };
          }
          return op;
        });
      });
    },
    [enableLoading]
  );

  /**
   * Clear specific operation
   */
  const clearOperation = useCallback((operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
  }, []);

  /**
   * Clear all operations
   */
  const clearAllOperations = useCallback(() => {
    setOperations([]);
  }, []);

  /**
   * Check if specific operation is loading
   */
  const isLoading = useCallback(
    (operationId: string) => {
      const operation = operations.find(op => op.id === operationId);
      return operation?.state === 'loading' || false;
    },
    [operations]
  );

  /**
   * Get operation by ID
   */
  const getOperation = useCallback(
    (operationId: string) => {
      return operations.find(op => op.id === operationId);
    },
    [operations]
  );

  /**
   * Get operations by context
   */
  const getOperationsByContext = useCallback(
    (context: LoadingContext) => {
      return operations.filter(op => op.context === context);
    },
    [operations]
  );

  /**
   * Create wrapped async operation with automatic loading state management
   */
  const createAsyncOperation = useCallback(
    <T>(
      operationId: string,
      operation: () => Promise<T>,
      context?: LoadingContext,
      metadata?: Record<string, any>
    ) => {
      return async (): Promise<T | undefined> => {
        startLoading(operationId, context, metadata);
        
        try {
          const result = await operation();
          endLoading(operationId);
          return result;
        } catch (error) {
          endLoadingWithError(operationId, error instanceof Error ? error : new Error(String(error)));
          return undefined;
        }
      };
    },
    [startLoading, endLoading, endLoadingWithError]
  );

  // Computed values
  const isAnyLoading = useMemo(
    () => operations.some(op => op.state === 'loading'),
    [operations]
  );

  const isAllLoading = useMemo(
    () => operations.length > 0 && operations.every(op => op.state === 'loading'),
    [operations]
  );

  return useMemo(
    () => ({
      operations,
      isAnyLoading,
      isAllLoading,
      isLoading,
      startLoading,
      endLoading,
      endLoadingWithError,
      clearOperation,
      clearAllOperations,
      createAsyncOperation,
      getOperation,
      getOperationsByContext,
    }),
    [
      operations,
      isAnyLoading,
      isAllLoading,
      isLoading,
      startLoading,
      endLoading,
      endLoadingWithError,
      clearOperation,
      clearAllOperations,
      createAsyncOperation,
      getOperation,
      getOperationsByContext,
    ]
  );
};

/**
 * Convenience hook for form loading operations
 */
export const useFormLoadingOrchestrator = (formContext: string) => {
  return useLoadingOrchestrator({
    defaultContext: `${formContext.toUpperCase()}_FORM`,
    enableLogging: true,
    maxConcurrentOperations: 5,
    globalTimeout: 15000, // Forms usually complete faster
  });
};

/**
 * Convenience hook for API loading operations
 */
export const useApiLoadingOrchestrator = (apiContext: string) => {
  return useLoadingOrchestrator({
    defaultContext: `${apiContext.toUpperCase()}_API`,
    enableLogging: true,
    maxConcurrentOperations: 8,
    globalTimeout: 30000,
  });
};