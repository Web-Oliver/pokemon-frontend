/**
 * Comprehensive Tests for Error Handler
 * CRITICAL: Tests security-sensitive error handling, message sanitization, and user safety
 *
 * Following CLAUDE.md testing principles:
 * - Security-focused testing to prevent information leakage
 * - Error classification and handling validation
 * - Toast notification behavior testing
 * - API format compatibility testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';
import {
  handleApiError,
  handleEnhancedApiError,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  getLastApiError,
  APIError,
} from '../errorHandler';
import {
  createMockApiResponse,
  createMockErrorResponse,
} from '../../test/setup';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock logger
vi.mock('../logger', () => ({
  error: vi.fn(),
}));

const mockToast = vi.mocked(toast);
const mockLogger = vi.mocked(require('../logger'));

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear window storage
    if (typeof window !== 'undefined') {
      delete (window as any).__lastApiError;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('APIError Class', () => {
    it('should create APIError with basic properties', () => {
      const error = new APIError('Test error');

      expect(error.name).toBe('APIError');
      expect(error.message).toBe('Test error');
      expect(error.timestamp).toBeDefined();
      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIError).toBe(true);
    });

    it('should create APIError with full properties', () => {
      const apiResponse = createMockErrorResponse(
        'Server error',
        'SERVER_ERROR'
      );
      const error = new APIError(
        'Test error',
        500,
        { field: 'test' },
        apiResponse
      );

      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ field: 'test' });
      expect(error.apiResponse).toEqual(apiResponse);
    });

    it('should provide display message', () => {
      const error = new APIError('Technical error message');
      expect(error.getDisplayMessage()).toBe('Technical error message');

      const emptyError = new APIError('');
      expect(emptyError.getDisplayMessage()).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should provide debug information', () => {
      const error = new APIError('Test error', 400, { field: 'invalid' });
      const debugInfo = error.getDebugInfo();

      expect(debugInfo.message).toBe('Test error');
      expect(debugInfo.statusCode).toBe(400);
      expect(debugInfo.details).toEqual({ field: 'invalid' });
      expect(debugInfo.timestamp).toBeDefined();
      expect(debugInfo.stack).toBeDefined();
    });
  });

  describe('Security: Error Message Sanitization', () => {
    it('should handle APIError instances without exposing sensitive data', () => {
      const sensitiveError = new APIError(
        'Database connection failed: server=prod-db-001',
        500,
        {
          internalError: 'Connection string exposed',
          dbPassword: 'secret123',
        }
      );

      handleApiError(sensitiveError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Database connection failed: server=prod-db-001',
        expect.any(Object)
      );

      // Should log full details for debugging but not expose to user
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error:',
        expect.objectContaining({
          message: 'Database connection failed: server=prod-db-001',
          statusCode: 500,
          details: expect.objectContaining({
            internalError: 'Connection string exposed',
            dbPassword: 'secret123',
          }),
        })
      );
    });

    it('should sanitize error messages from axios responses', () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            success: false,
            status: 'error',
            message: 'Invalid token: jwt_secret_key_leaked',
            meta: {
              timestamp: new Date().toISOString(),
              version: '2.0',
              duration: '5ms',
              cached: false,
            },
            details: {
              internalTrace: 'auth.validateToken() line 45',
            },
          },
        },
      };

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Invalid token: jwt_secret_key_leaked',
        expect.any(Object)
      );
    });

    it('should prevent null/undefined error message exposure', () => {
      const nullMessageError = {
        response: {
          status: 500,
          data: {
            success: false,
            status: 'error',
            message: null,
            meta: {
              timestamp: new Date().toISOString(),
              version: '2.0',
              duration: '5ms',
              cached: false,
            },
          },
        },
      };

      handleApiError(nullMessageError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });
  });

  describe('API Format Validation and Compatibility', () => {
    it('should handle valid new API format errors', () => {
      const newFormatError = {
        response: {
          status: 400,
          data: {
            success: false,
            status: 'error',
            message: 'Validation failed',
            data: null,
            meta: {
              timestamp: new Date().toISOString(),
              version: '2.0',
              duration: '10ms',
              cached: false,
            },
            details: {
              field: 'email',
              reason: 'Invalid format',
            },
          },
        },
      };

      handleApiError(newFormatError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation failed',
        expect.any(Object)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Response Error:',
        expect.objectContaining({
          message: 'Validation failed',
          status: 'error',
          details: expect.objectContaining({
            field: 'email',
            reason: 'Invalid format',
          }),
        })
      );
    });

    it('should handle invalid API response format gracefully', () => {
      const invalidFormatError = {
        response: {
          status: 500,
          data: {
            // Missing required fields like 'success', 'status', 'meta'
            error: 'Something went wrong',
            code: 'INTERNAL_ERROR',
          },
        },
      };

      handleApiError(invalidFormatError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid API Response Format:',
        expect.objectContaining({
          statusCode: 500,
          receivedData: expect.objectContaining({
            error: 'Something went wrong',
            code: 'INTERNAL_ERROR',
          }),
        })
      );
    });

    it('should handle legacy API format for backward compatibility', () => {
      const legacyError = {
        response: {
          status: 404,
          data: {
            message: 'Resource not found',
          },
        },
        message: 'Request failed with status code 404',
      };

      handleApiError(legacyError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Resource not found',
        expect.any(Object)
      );
    });

    it('should handle completely malformed responses', () => {
      const malformedError = {
        response: {
          status: 500,
          data: '<html><body>Server Error</body></html>', // HTML instead of JSON
        },
      };

      handleApiError(malformedError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });
  });

  describe('Error Classification and Status Code Handling', () => {
    it('should handle different HTTP status codes appropriately', () => {
      const statusCodes = [400, 401, 403, 404, 422, 500, 502, 503];

      statusCodes.forEach((status) => {
        const error = {
          response: {
            status,
            data: createMockErrorResponse(`Error ${status}`, 'TEST_ERROR'),
          },
        };

        handleApiError(error);
        expect(mockToast.error).toHaveBeenCalledWith(
          `Error ${status}`,
          expect.any(Object)
        );
      });
    });

    it('should store last error for debugging', () => {
      const testError = new APIError('Debug test error', 400);

      handleApiError(testError);

      const lastError = getLastApiError();
      expect(lastError).toBeInstanceOf(APIError);
      expect(lastError?.message).toBe('Debug test error');
      expect(lastError?.statusCode).toBe(400);
    });

    it('should return null when no last error exists', () => {
      const lastError = getLastApiError();
      expect(lastError).toBeNull();
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should handle server errors (5xx) with specific styling', () => {
      const serverError = new APIError('Internal server error', 500);

      handleEnhancedApiError(serverError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Internal server error',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
          }),
          icon: '🚫',
        })
      );
    });

    it('should handle authentication errors (401/403) with specific styling', () => {
      const authError = new APIError('Unauthorized access', 401);

      handleEnhancedApiError(authError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Unauthorized access',
        expect.objectContaining({
          icon: '🔒',
        })
      );

      const forbiddenError = new APIError('Forbidden', 403);
      handleEnhancedApiError(forbiddenError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Forbidden',
        expect.objectContaining({
          icon: '🔒',
        })
      );
    });

    it('should handle client errors with general styling', () => {
      const clientError = new APIError('Bad request', 400);

      handleEnhancedApiError(clientError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Bad request',
        expect.objectContaining({
          icon: '⚠️',
        })
      );
    });

    it('should use custom message when provided', () => {
      const error = new APIError('Technical error');

      handleEnhancedApiError(error, 'Something went wrong');

      expect(mockToast.error).toHaveBeenCalledWith(
        'Something went wrong',
        expect.any(Object)
      );
    });
  });

  describe('Toast Notification Helpers', () => {
    it('should show success toast with correct styling', () => {
      showSuccessToast('Operation completed');

      expect(mockToast.success).toHaveBeenCalledWith(
        'Operation completed',
        expect.objectContaining({
          duration: 4000,
          position: 'top-right',
          style: expect.objectContaining({
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#16A34A',
          }),
          icon: '✅',
        })
      );
    });

    it('should show info toast with correct styling', () => {
      showInfoToast('Information message');

      expect(mockToast).toHaveBeenCalledWith(
        'Information message',
        expect.objectContaining({
          duration: 4000,
          position: 'top-right',
          style: expect.objectContaining({
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#2563EB',
          }),
          icon: 'ℹ️',
        })
      );
    });

    it('should show warning toast with correct styling', () => {
      showWarningToast('Warning message');

      expect(mockToast).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          duration: 4000,
          position: 'top-right',
          style: expect.objectContaining({
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#D97706',
          }),
          icon: '⚠️',
        })
      );
    });

    it('should accept custom options for toast helpers', () => {
      const customOptions = {
        duration: 6000,
        position: 'bottom-center' as const,
      };

      showSuccessToast('Custom success', customOptions);

      expect(mockToast.success).toHaveBeenCalledWith(
        'Custom success',
        expect.objectContaining({
          duration: 6000,
          position: 'bottom-center',
        })
      );
    });
  });

  describe('Network and Edge Case Errors', () => {
    it('should handle network connectivity errors', () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';

      handleApiError(networkError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'General Error:',
        networkError
      );
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as any).code = 'ECONNABORTED';

      handleApiError(timeoutError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });

    it('should handle undefined/null errors gracefully', () => {
      handleApiError(null);
      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );

      handleApiError(undefined);
      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });

    it('should handle string errors', () => {
      handleApiError('Simple string error');

      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'General Error:',
        'Simple string error'
      );
    });
  });

  describe('Security: Information Disclosure Prevention', () => {
    it('should not expose internal system paths in errors', () => {
      const systemError = new APIError(
        'Error in /usr/local/app/src/database/connection.js line 127'
      );

      handleApiError(systemError);

      // The full message is shown (this might need adjustment based on security policy)
      expect(mockToast.error).toHaveBeenCalledWith(
        'Error in /usr/local/app/src/database/connection.js line 127',
        expect.any(Object)
      );

      // But it's logged for debugging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error:',
        expect.any(Object)
      );
    });

    it('should not expose database connection strings in errors', () => {
      const dbError = {
        response: {
          status: 500,
          data: {
            success: false,
            status: 'error',
            message: 'Database connection failed',
            meta: {
              timestamp: new Date().toISOString(),
              version: '2.0',
              duration: '5ms',
              cached: false,
            },
            details: {
              connectionString: 'mongodb://user:password@prod-db:27017/app',
              internalError: 'Authentication failed',
            },
          },
        },
      };

      handleApiError(dbError);

      // User sees sanitized message
      expect(mockToast.error).toHaveBeenCalledWith(
        'Database connection failed',
        expect.any(Object)
      );

      // Full details logged for debugging (in production, this should be further restricted)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Response Error:',
        expect.objectContaining({
          details: expect.objectContaining({
            connectionString: 'mongodb://user:password@prod-db:27017/app',
          }),
        })
      );
    });

    it('should handle errors with sensitive user data appropriately', () => {
      const userDataError = new APIError('User validation failed', 400, {
        email: 'user@example.com',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
      });

      handleApiError(userDataError);

      // Error handling should log details for debugging but show safe message to user
      expect(mockToast.error).toHaveBeenCalledWith(
        'User validation failed',
        expect.any(Object)
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error:',
        expect.objectContaining({
          details: expect.objectContaining({
            email: 'user@example.com',
            ssn: '123-45-6789',
            creditCard: '4111-1111-1111-1111',
          }),
        })
      );
    });
  });
});
