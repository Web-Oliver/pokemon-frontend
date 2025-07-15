/**
 * Error Handler Tests
 * Tests the toast notification system and error handling utilities
 */

import { handleApiError, showSuccessToast, showInfoToast, showWarningToast } from '../errorHandler';

// Mock react-hot-toast
const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  default: vi.fn(),
};

vi.mock('react-hot-toast', () => ({
  default: mockToast.default,
  error: mockToast.error,
  success: mockToast.success,
}));

// Mock logger
const mockLogError = vi.fn();
vi.mock('../logger', () => ({
  error: mockLogError,
}));

describe('Error Handler & Toast Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should show error toast with default message', () => {
      const error = new Error('Test error');
      
      handleApiError(error);
      
      expect(mockLogError).toHaveBeenCalledWith('API Error:', error);
      expect(mockToast.error).toHaveBeenCalledWith(
        'Test error',
        expect.objectContaining({
          duration: 5000,
          position: 'top-right',
          style: expect.objectContaining({
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
          }),
          icon: '⚠️',
        })
      );
    });

    it('should show error toast with custom user message', () => {
      const error = new Error('API error');
      const userMessage = 'Custom error message';
      
      handleApiError(error, userMessage);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        userMessage,
        expect.objectContaining({
          duration: 5000,
          position: 'top-right',
        })
      );
    });

    it('should extract error message from response data', () => {
      const error = {
        response: {
          data: {
            message: 'Server error message'
          }
        }
      };
      
      handleApiError(error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'Server error message',
        expect.any(Object)
      );
    });

    it('should handle unknown error types gracefully', () => {
      const error = 'String error';
      
      handleApiError(error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });

    it('should handle null/undefined errors', () => {
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
  });

  describe('showSuccessToast', () => {
    it('should show success toast with default styling', () => {
      const message = 'Operation successful!';
      
      showSuccessToast(message);
      
      expect(mockToast.success).toHaveBeenCalledWith(
        message,
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

    it('should allow custom options to override defaults', () => {
      const message = 'Custom success!';
      const customOptions = { duration: 6000 };
      
      showSuccessToast(message, customOptions);
      
      expect(mockToast.success).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          duration: 6000, // Custom duration should override default
          position: 'top-right',
        })
      );
    });
  });

  describe('showInfoToast', () => {
    it('should show info toast with correct styling', () => {
      const message = 'Information message';
      
      showInfoToast(message);
      
      expect(mockToast.default).toHaveBeenCalledWith(
        message,
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
  });

  describe('showWarningToast', () => {
    it('should show warning toast with correct styling', () => {
      const message = 'Warning message';
      
      showWarningToast(message);
      
      expect(mockToast.default).toHaveBeenCalledWith(
        message,
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
  });

  describe('Error Message Extraction', () => {
    it('should prioritize response.data.message over error.message', () => {
      const error = {
        message: 'Generic error',
        response: {
          data: {
            message: 'Specific API error'
          }
        }
      };
      
      handleApiError(error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'Specific API error',
        expect.any(Object)
      );
    });

    it('should fall back to error.message if no response data', () => {
      const error = {
        message: 'Network error'
      };
      
      handleApiError(error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error',
        expect.any(Object)
      );
    });

    it('should use default message for objects without meaningful error info', () => {
      const error = {
        code: 500,
        status: 'Internal Server Error'
      };
      
      handleApiError(error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });
  });

  describe('Toast Configuration', () => {
    it('should use consistent styling across all toast types', () => {
      showSuccessToast('Success');
      showInfoToast('Info');
      showWarningToast('Warning');
      
      // All should have consistent position and basic styling
      expect(mockToast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          position: 'top-right',
          style: expect.any(Object),
          icon: expect.any(String),
        })
      );
      
      expect(mockToast.default).toHaveBeenCalledWith(
        'Info',
        expect.objectContaining({
          position: 'top-right',
          style: expect.any(Object),
          icon: expect.any(String),
        })
      );
      
      expect(mockToast.default).toHaveBeenCalledWith(
        'Warning',
        expect.objectContaining({
          position: 'top-right',
          style: expect.any(Object),
          icon: expect.any(String),
        })
      );
    });
  });
});