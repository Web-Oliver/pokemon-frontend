/**
 * Enhanced Image Uploader with OCR Integration
 * 
 * Extends the existing ImageUploader with intelligent card detection capabilities
 * Maintains all existing functionality while adding OCR processing
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Eye, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { CardSuggestions } from '../shared/components/molecules/common/CardSuggestions';
import { useOcrDetection } from '../shared/hooks/useOcrDetection';
import { 
  CardType, 
  CardSuggestion, 
  EnhancedOcrResult,
  ComprehensiveOcrOptions 
} from '../shared/types/ocr';

interface EnhancedImageUploaderProps {
  onImagesChange: (files: File[], remainingExistingUrls?: string[]) => void;
  onCardDetected?: (card: CardSuggestion, ocrResult: EnhancedOcrResult) => void;
  onOcrComplete?: (results: EnhancedOcrResult[]) => void;
  existingImageUrls?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  enableAspectRatioDetection?: boolean;
  adaptiveLayout?: boolean;
  
  // OCR-specific props
  enableOcr?: boolean;
  cardType?: CardType;
  autoDetectCardType?: boolean;
  showOcrPreview?: boolean;
  enableBatchOcr?: boolean;
  ocrOptions?: Partial<ComprehensiveOcrOptions>;
}

export const EnhancedImageUploader: React.FC<EnhancedImageUploaderProps> = ({
  onImagesChange,
  onCardDetected,
  onOcrComplete,
  enableOcr = true,
  cardType = CardType.GENERIC,
  autoDetectCardType = true,
  showOcrPreview = true,
  enableBatchOcr = true,
  ocrOptions = {},
  ...imageUploaderProps
}) => {
  // OCR state
  const [ocrResults, setOcrResults] = useState<EnhancedOcrResult[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<CardSuggestion[]>([]);
  const [currentExtractedData, setCurrentExtractedData] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set());

  // OCR hook
  const {
    processImage,
    processBatch,
    isProcessing,
    error: ocrError,
    lastResult,
    lastBatchResults,
    progress,
    clearError
  } = useOcrDetection({
    enableBatch: enableBatchOcr,
    cardType,
    onSuccess: (result) => {
      console.log('[Enhanced ImageUploader] OCR Success:', result);
    },
    onError: (error) => {
      console.error('[Enhanced ImageUploader] OCR Error:', error);
    }
  });

  // Handle file upload with OCR processing
  const handleImagesChange = useCallback(async (
    files: File[], 
    remainingExistingUrls?: string[]
  ) => {
    // Call original handler
    onImagesChange(files, remainingExistingUrls);

    // Process with OCR if enabled and we have new files
    if (enableOcr && files.length > 0) {
      try {
        const newFiles = files.filter(file => !processedFiles.has(file.name));
        
        if (newFiles.length === 0) return;

        clearError();
        
        const options: ComprehensiveOcrOptions = {
          cardType: autoDetectCardType ? CardType.GENERIC : cardType,
          enableMultiCardDetection: autoDetectCardType,
          enableBatchProcessing: enableBatchOcr && newFiles.length > 1,
          ...ocrOptions
        };

        let results: EnhancedOcrResult[];

        if (newFiles.length === 1) {
          const result = await processImage(newFiles[0], options);
          results = [result];
        } else if (enableBatchOcr) {
          results = await processBatch(newFiles, options);
        } else {
          // Process individually
          results = await Promise.all(
            newFiles.map(file => processImage(file, options))
          );
        }

        setOcrResults(prevResults => [...prevResults, ...results]);
        
        // Mark files as processed
        setProcessedFiles(prev => {
          const newSet = new Set(prev);
          newFiles.forEach(file => newSet.add(file.name));
          return newSet;
        });

        // Handle suggestions from the first result with suggestions
        const resultWithSuggestions = results.find(
          result => result.cardDetection?.suggestions && result.cardDetection.suggestions.length > 0
        );

        if (resultWithSuggestions?.cardDetection) {
          setCurrentSuggestions(resultWithSuggestions.cardDetection.suggestions);
          setCurrentExtractedData(resultWithSuggestions.cardDetection.extracted);
          setShowSuggestions(true);
        }

        // Call completion callback
        if (onOcrComplete) {
          onOcrComplete(results);
        }

      } catch (error) {
        console.error('[Enhanced ImageUploader] OCR processing failed:', error);
      }
    }
  }, [
    onImagesChange,
    enableOcr,
    processedFiles,
    autoDetectCardType,
    cardType,
    enableBatchOcr,
    ocrOptions,
    processImage,
    processBatch,
    clearError,
    onOcrComplete
  ]);

  // Handle card selection from suggestions
  const handleCardSelected = useCallback((card: CardSuggestion) => {
    setShowSuggestions(false);
    
    if (onCardDetected && lastResult) {
      onCardDetected(card, lastResult);
    }
  }, [onCardDetected, lastResult]);

  // Handle dismissing suggestions
  const handleDismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Clear OCR data when files are removed
  useEffect(() => {
    // This could be enhanced to track which files were removed
    // and clear corresponding OCR results
  }, [imageUploaderProps.existingImageUrls]);

  return (
    <div className="space-y-4">
      {/* Enhanced Image Uploader */}
      <div className="relative">
        <ImageUploader
          {...imageUploaderProps}
          onImagesChange={handleImagesChange}
        />
        
        {/* OCR Processing Overlay */}
        {enableOcr && isProcessing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm font-medium text-gray-900">Processing with OCR</div>
              <div className="text-xs text-gray-600">
                {lastBatchResults && lastBatchResults.length > 1 && enableBatchOcr 
                  ? 'Stitching labels for batch processing...'
                  : 'Detecting cards...'
                }
              </div>
              {progress > 0 && (
                <div className="mt-2 w-32 mx-auto">
                  <div className="bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OCR Status Indicator */}
        {enableOcr && !isProcessing && (
          <div className="absolute top-2 right-2">
            {ocrError ? (
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>OCR Failed</span>
              </div>
            ) : ocrResults.length > 0 ? (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{ocrResults.length} Processed</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* OCR Error Display */}
      {enableOcr && ocrError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-800">OCR Processing Error</div>
              <div className="text-xs text-red-600 mt-1">{ocrError.message}</div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* OCR Results Preview */}
      {enableOcr && showOcrPreview && ocrResults.length > 0 && !showSuggestions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">OCR Results</span>
          </div>
          <div className="space-y-2">
            {ocrResults.slice(-3).map((result, index) => (
              <div key={index} className="text-xs bg-white rounded p-2">
                <div className="font-medium text-gray-900 mb-1">
                  Detected Text ({Math.round(result.confidence * 100)}% confidence)
                </div>
                <div className="text-gray-600 line-clamp-2">
                  {result.text.substring(0, 100)}
                  {result.text.length > 100 ? '...' : ''}
                </div>
                {result.cardDetection && (
                  <div className="mt-1 text-blue-600">
                    {result.cardDetection.suggestions.length} card suggestion(s) found
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <CardSuggestions
          suggestions={currentSuggestions}
          extractedData={currentExtractedData}
          onSelectCard={handleCardSelected}
          onDismiss={handleDismissSuggestions}
          isLoading={isProcessing}
          error={ocrError?.message}
        />
      )}

      {/* OCR Controls */}
      {enableOcr && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Smart Card Detection</span>
            </div>
            {autoDetectCardType && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Auto-detect
              </span>
            )}
          </div>
          
          {ocrResults.length > 0 && (
            <button
              onClick={() => {
                setOcrResults([]);
                setProcessedFiles(new Set());
                setShowSuggestions(false);
              }}
              className="text-gray-400 hover:text-gray-600 underline"
            >
              Clear OCR data
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedImageUploader;