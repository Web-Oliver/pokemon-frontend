import { useState, useCallback, useRef } from 'react';
import { 
  CardType, 
  ComprehensiveOcrOptions, 
  EnhancedOcrResult, 
  TextValidationResult,
  OcrError,
  CardDetectionError
} from '../types/ocr';
import { EnhancedOcrService } from '../services/EnhancedOcrService';

/**
 * OCR Detection Hook
 * 
 * Provides stateful OCR processing capabilities with error handling and caching
 * Follows existing hook patterns in the application
 */

interface UseOcrDetectionOptions {
  autoProcess?: boolean;
  enableBatch?: boolean;
  cardType?: CardType;
  onSuccess?: (result: EnhancedOcrResult) => void;
  onError?: (error: Error) => void;
  enableCache?: boolean;
  enableAdvancedOcr?: boolean;
  enableAsyncProcessing?: boolean;
  enableConcurrentProcessing?: boolean;
}

interface UseOcrDetectionReturn {
  // Processing methods
  processImage: (file: File, options?: ComprehensiveOcrOptions) => Promise<EnhancedOcrResult>;
  processBatch: (files: File[], options?: ComprehensiveOcrOptions) => Promise<EnhancedOcrResult[]>;
  validateText: (text: string) => Promise<TextValidationResult>;
  getCardSuggestions: (cardId: string, limit?: number) => Promise<any>;
  
  // State
  isProcessing: boolean;
  error: Error | null;
  lastResult: EnhancedOcrResult | null;
  lastBatchResults: EnhancedOcrResult[] | null;
  progress: number;
  
  // Utilities
  clearError: () => void;
  clearResults: () => void;
  clearCache: () => void;
  getCacheStats: () => any;
}

export const useOcrDetection = (options: UseOcrDetectionOptions = {}): UseOcrDetectionReturn => {
  const {
    autoProcess = false,
    enableBatch = true,
    cardType = CardType.GENERIC,
    onSuccess,
    onError,
    enableCache = true,
    enableAdvancedOcr = false,
    enableAsyncProcessing = false,
    enableConcurrentProcessing = true
  } = options;

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<EnhancedOcrResult | null>(null);
  const [lastBatchResults, setLastBatchResults] = useState<EnhancedOcrResult[] | null>(null);
  const [progress, setProgress] = useState(0);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setLastResult(null);
    setLastBatchResults(null);
    setProgress(0);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    if (enableCache) {
      EnhancedOcrService.clearCache();
    }
  }, [enableCache]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return enableCache ? EnhancedOcrService.getCacheStats() : null;
  }, [enableCache]);

  // Process single image
  const processImage = useCallback(async (
    file: File, 
    processOptions?: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult> => {
    if (!file) {
      throw new OcrError('File is required for processing', 'INVALID_INPUT');
    }

    if (!file.type.startsWith('image/')) {
      throw new OcrError('File must be an image', 'INVALID_FILE_TYPE');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new OcrError('File size exceeds 10MB limit', 'FILE_TOO_LARGE');
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const mergedOptions: ComprehensiveOcrOptions = {
        cardType,
        enableAdvancedOcr,
        enableAsyncProcessing,
        enableConcurrentProcessing,
        ...processOptions
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await EnhancedOcrService.processImageWithDetection(file, mergedOptions);

      clearInterval(progressInterval);

      if (!isMountedRef.current) return result;

      setProgress(100);
      setLastResult(result);

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (err) {
      if (!isMountedRef.current) throw err;

      const error = err instanceof Error ? err : new Error('Unknown processing error');
      setError(error);

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;

    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setProgress(0);
      }
    }
  }, [cardType, onSuccess, onError]);

  // Process batch of images
  const processBatch = useCallback(async (
    files: File[], 
    processOptions?: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult[]> => {
    if (!enableBatch) {
      throw new OcrError('Batch processing is not enabled', 'BATCH_DISABLED');
    }

    if (!Array.isArray(files) || files.length === 0) {
      throw new OcrError('Files array is required for batch processing', 'INVALID_INPUT');
    }

    if (files.length > 20) {
      throw new OcrError('Batch size exceeds maximum limit of 20 files', 'BATCH_SIZE_EXCEEDED');
    }

    // Validate all files
    const invalidFiles = files.filter(file => 
      !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      throw new OcrError(
        `${invalidFiles.length} invalid file(s): must be images under 10MB`,
        'INVALID_FILES'
      );
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const mergedOptions: ComprehensiveOcrOptions = {
        cardType,
        enableBatchProcessing: true,
        enableAdvancedOcr,
        enableAsyncProcessing,
        enableConcurrentProcessing,
        ...processOptions
      };

      // Progress tracking for batch
      const progressStep = 100 / files.length;
      let completedFiles = 0;

      const progressInterval = setInterval(() => {
        setProgress(Math.min((completedFiles * progressStep) + 10, 95));
      }, 500);

      const results = await EnhancedOcrService.processBatchWithDetection(files, mergedOptions);

      clearInterval(progressInterval);
      completedFiles = files.length;

      if (!isMountedRef.current) return results;

      setProgress(100);
      setLastBatchResults(results);

      // Call success callback for first result
      if (onSuccess && results.length > 0) {
        onSuccess(results[0]);
      }

      return results;

    } catch (err) {
      if (!isMountedRef.current) throw err;

      const error = err instanceof Error ? err : new Error('Unknown batch processing error');
      setError(error);

      if (onError) {
        onError(error);
      }

      throw error;

    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setProgress(0);
      }
    }
  }, [enableBatch, cardType, onSuccess, onError]);

  // Validate text quality
  const validateText = useCallback(async (text: string): Promise<TextValidationResult> => {
    if (!text || typeof text !== 'string') {
      throw new OcrError('Text is required for validation', 'INVALID_INPUT');
    }

    try {
      const result = await EnhancedOcrService.validateText(text);
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Text validation failed');
      setError(error);

      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [onError]);

  // Get card suggestions
  const getCardSuggestions = useCallback(async (cardId: string, limit: number = 10) => {
    if (!cardId) {
      throw new OcrError('Card ID is required', 'INVALID_INPUT');
    }

    try {
      const result = await EnhancedOcrService.getCardSuggestions(cardId, limit);
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get card suggestions');
      setError(error);

      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [onError]);

  // Cleanup effect would be handled by the component using this hook
  // useEffect(() => {
  //   return () => {
  //     isMountedRef.current = false;
  //   };
  // }, []);

  return {
    // Methods
    processImage,
    processBatch,
    validateText,
    getCardSuggestions,
    
    // State
    isProcessing,
    error,
    lastResult,
    lastBatchResults,
    progress,
    
    // Utilities
    clearError,
    clearResults,
    clearCache,
    getCacheStats
  };
};

/**
 * Hook for simple OCR processing without state management
 * Useful for one-off operations
 */
export const useOcrDetectionSimple = () => {
  const processImage = useCallback(async (
    file: File, 
    options?: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult> => {
    return EnhancedOcrService.processImageWithDetection(file, options);
  }, []);

  const processBatch = useCallback(async (
    files: File[], 
    options?: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult[]> => {
    return EnhancedOcrService.processBatchWithDetection(files, options);
  }, []);

  const validateText = useCallback(async (text: string): Promise<TextValidationResult> => {
    return EnhancedOcrService.validateText(text);
  }, []);

  return {
    processImage,
    processBatch,
    validateText
  };
};

export default useOcrDetection;