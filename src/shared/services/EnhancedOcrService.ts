import { 
  CardType, 
  ComprehensiveOcrOptions, 
  OcrResult, 
  EnhancedOcrResult, 
  CardDetectionResult,
  OcrApiResponse,
  DetectionApiData,
  BatchDetectionApiData,
  TextValidationResult,
  OcrError,
  CardDetectionError
} from '../types/ocr';
import { ImageStitchingService, type StitchedImageResult } from './ImageStitchingService';
import { Context7OcrPreprocessor } from './Context7OcrPreprocessor';

/**
 * Enhanced OCR Service with Backend Integration
 * 
 * Extends the existing OCR functionality with intelligent card detection
 * Follows frontend service patterns with proper error handling and caching
 */
export class EnhancedOcrService {
  private static readonly API_BASE = '/api/ocr';
  private static detectionCache = new Map<string, { result: CardDetectionResult; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_BATCH_SIZE = 50; // Backend limitation
  private static readonly CONCURRENT_THRESHOLD = 3; // Use concurrent processing for 3+ images

  /**
   * Process image with backend card detection
   * @param imageFile File to process
   * @param options OCR processing options
   * @returns Enhanced OCR result with card detection
   */
  static async processImageWithDetection(
    imageFile: File,
    options: ComprehensiveOcrOptions = {}
  ): Promise<EnhancedOcrResult> {
    try {
      // First perform OCR using existing service
      const ocrResult = await this.performOcr(imageFile, options);
      
      // Then detect card using backend
      const cardDetection = await this.detectCardFromOcr(ocrResult, options.cardType);
      
      return {
        ...ocrResult,
        cardDetection: cardDetection || undefined
      };
    } catch (error) {
      throw new OcrError(
        `Enhanced OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENHANCED_OCR_ERROR',
        { imageFile: imageFile.name, options }
      );
    }
  }

  /**
   * Batch processing with card detection and image stitching optimization
   * @param imageFiles Array of files to process
   * @param options Processing options
   * @returns Array of enhanced OCR results
   */
  static async processBatchWithDetection(
    imageFiles: File[],
    options: ComprehensiveOcrOptions = {}
  ): Promise<EnhancedOcrResult[]> {
    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      throw new OcrError('No image files provided for batch processing', 'INVALID_INPUT');
    }

    if (imageFiles.length > 20) {
      throw new OcrError('Batch size exceeds maximum limit of 20 images', 'BATCH_SIZE_EXCEEDED');
    }

    console.log(`[Enhanced OCR] Processing batch of ${imageFiles.length} images`);

    try {
      // Check if we should use image stitching for PSA labels
      const shouldStitch = this.shouldUseImageStitching(imageFiles, options);
      
      if (shouldStitch) {
        return await this.processBatchWithStitching(imageFiles, options);
      } else {
        return await this.processBatchIndividually(imageFiles, options);
      }
    } catch (error) {
      throw new OcrError(
        `Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BATCH_PROCESSING_ERROR',
        { fileCount: imageFiles.length }
      );
    }
  }

  /**
   * Process batch with image stitching for PSA labels
   * Provides up to 90% cost reduction for Google Vision API
   */
  private static async processBatchWithStitching(
    imageFiles: File[],
    options: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult[]> {
    console.log(`[Enhanced OCR] Using image stitching for ${imageFiles.length} PSA labels`);

    try {
      // Stitch images together
      const stitchResult = await ImageStitchingService.stitchPsaLabels(imageFiles, {
        maxWidth: 2048,
        maxHeight: 2048,
        cropToLabel: true,
        orientation: 'grid',
        compressionQuality: 0.9
      });

      console.log(`[Enhanced OCR] Stitched into ${stitchResult.gridDimensions.rows}x${stitchResult.gridDimensions.cols} grid`);
      console.log(`[Enhanced OCR] Compression ratio: ${stitchResult.compressionRatio.toFixed(2)}x`);

      // Process stitched image with OCR
      const stitchedOcrResult = await this.performOcr(stitchResult.stitchedFile, {
        ...options,
        cardType: CardType.PSA_LABEL
      });

      // Split OCR results back to individual labels
      const splitResults = ImageStitchingService.splitStitchedOcrResults(
        stitchedOcrResult.text,
        stitchResult
      );

      // Create individual OCR results
      const individualResults: EnhancedOcrResult[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const splitResult = splitResults[i];
        const originalFile = imageFiles[splitResult?.labelIndex || i];
        
        if (splitResult) {
          // Create OCR result for this label
          const ocrResult: OcrResult = {
            text: splitResult.text,
            confidence: splitResult.confidence,
            source: stitchedOcrResult.source,
            processingTime: stitchedOcrResult.processingTime / imageFiles.length,
            cardType: {
              type: CardType.PSA_LABEL,
              confidence: 0.9,
              features: ['batch-stitched', 'psa-label']
            }
          };

          // Detect card from this label's text
          const cardDetection = await this.detectCardFromOcr(ocrResult, CardType.PSA_LABEL);

          individualResults.push({
            ...ocrResult,
            cardDetection: cardDetection || undefined
          });
        } else {
          // Fallback for missing split result
          individualResults.push({
            text: '',
            confidence: 0,
            source: 'google-vision',
            processingTime: 0,
            cardDetection: undefined
          });
        }
      }

      console.log(`[Enhanced OCR] Stitching complete: ${individualResults.length} individual results generated`);
      return individualResults;

    } catch (error) {
      console.error('[Enhanced OCR] Stitching failed, falling back to individual processing:', error);
      // Fallback to individual processing if stitching fails
      return await this.processBatchIndividually(imageFiles, options);
    }
  }

  /**
   * Process batch individually using optimized backend batch endpoint
   */
  private static async processBatchIndividually(
    imageFiles: File[],
    options: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult[]> {
    console.log(`[Enhanced OCR] Processing ${imageFiles.length} images with optimized batch processing`);

    try {
      // Try optimized batch processing first
      if (imageFiles.length >= 2 && imageFiles.length <= 50) {
        const batchResult = await this.processWithBatchVision(imageFiles, options);
        if (batchResult.length > 0) {
          console.log(`[Enhanced OCR] Batch processing successful: ${batchResult.length} results`);
          return batchResult;
        }
      }
    } catch (error) {
      console.warn('[Enhanced OCR] Batch processing failed, falling back to individual processing:', error);
    }

    // Fallback to individual processing
    console.log(`[Enhanced OCR] Using individual processing for ${imageFiles.length} images`);
    
    // Determine processing strategy based on options
    let ocrResults: OcrResult[];
    
    if (options.enableConcurrentProcessing && imageFiles.length >= 3) {
      // Use concurrent processing for 3+ images
      console.log('[Enhanced OCR] Using concurrent processing for better performance');
      ocrResults = await this.processConcurrently(imageFiles, options);
    } else {
      // Standard individual processing
      ocrResults = await Promise.all(
        imageFiles.map(file => this.performOcr(file, options))
      );
    }
    
    // Batch detect cards
    const cardDetections = await this.batchDetectCards(ocrResults, options);
    
    // Merge OCR results with card detections
    return ocrResults.map((result, index) => ({
      ...result,
      cardDetection: cardDetections[index] || undefined
    }));
  }

  /**
   * Process multiple images using optimized backend batch endpoint
   */
  private static async processWithBatchVision(
    imageFiles: File[],
    options: ComprehensiveOcrOptions
  ): Promise<EnhancedOcrResult[]> {
    console.log(`[Enhanced OCR Batch] Processing ${imageFiles.length} images with batch Vision API`);
    
    // Convert all files to base64
    const base64Images = await Promise.all(
      imageFiles.map(file => this.fileToBase64(file))
    );
    
    const response = await fetch('/api/ocr/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: base64Images,
        options: {
          languageHints: options.language ? [options.language] : ['en', 'ja']
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Batch Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Enhanced OCR Batch] Batch response:', {
      success: data.success,
      resultsCount: data.data?.results?.length,
      summary: data.data?.summary
    });
    
    if (!data.success || !data.data?.results) {
      throw new Error('Invalid response from batch Vision API');
    }

    // Convert batch results to OCR results
    const ocrResults: OcrResult[] = data.data.results.map((result: any, index: number) => ({
      text: result.text || '',
      confidence: result.confidence || 0,
      source: 'google-vision-batch',
      processingTime: data.meta?.averageTimePerImage || 0,
      cardType: this.detectCardTypeFromText(result.text || '', options)
    }));

    // Batch detect cards
    const cardDetections = await this.batchDetectCards(ocrResults, options);
    
    // Return enhanced results
    return ocrResults.map((result, index) => ({
      ...result,
      cardDetection: cardDetections[index] || undefined
    }));
  }

  /**
   * Process images concurrently using async endpoint
   */
  private static async processConcurrently(
    imageFiles: File[],
    options: ComprehensiveOcrOptions
  ): Promise<OcrResult[]> {
    console.log(`[Enhanced OCR Concurrent] Processing ${imageFiles.length} images concurrently`);
    
    // Convert all files to base64 first
    const base64Images = await Promise.all(
      imageFiles.map(file => this.fileToBase64(file))
    );
    
    // Process all images concurrently with async endpoint
    const concurrentPromises = base64Images.map(async (base64Image, index) => {
      try {
        const result = await this.processWithAsyncVision(base64Image, {
          ...options,
          enableAsyncProcessing: true
        });
        return {
          ...result,
          source: 'google-vision-async',
          processingTime: 0 // Will be updated by the processing method
        };
      } catch (error) {
        console.error(`[Enhanced OCR Concurrent] Failed to process image ${index}:`, error);
        return {
          text: `OCR processing failed for image ${index + 1}`,
          confidence: 0,
          source: 'error',
          processingTime: 0,
          cardType: {
            type: options.cardType || CardType.GENERIC,
            confidence: 0,
            features: ['error']
          }
        };
      }
    });
    
    const results = await Promise.all(concurrentPromises);
    console.log(`[Enhanced OCR Concurrent] Concurrent processing complete: ${results.length} results`);
    
    return results;
  }

  /**
   * Determine if we should use image stitching for this batch
   */
  private static shouldUseImageStitching(
    imageFiles: File[],
    options: ComprehensiveOcrOptions
  ): boolean {
    // Use stitching if:
    // 1. Image stitching is enabled in options
    // 2. We have multiple files (2+)
    // 3. Card type is PSA_LABEL or auto-detect is enabled
    // 4. Files are reasonable size for stitching
    
    if (!options.enableImageStitching && options.enableImageStitching !== undefined) {
      return false;
    }

    if (imageFiles.length < 2) {
      return false;
    }

    // Check if this looks like PSA labels
    const isPsaBatch = options.cardType === CardType.PSA_LABEL || 
                      options.enableMultiCardDetection ||
                      this.detectPsaLikeImages(imageFiles);

    if (!isPsaBatch) {
      return false;
    }

    // Check file sizes (don't stitch very large images)
    const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    const avgSize = totalSize / imageFiles.length;
    
    // Don't stitch if average file size is > 5MB (likely full card images)
    if (avgSize > 5 * 1024 * 1024) {
      return false;
    }

    console.log(`[Enhanced OCR] Image stitching enabled for ${imageFiles.length} PSA labels`);
    return true;
  }

  /**
   * Detect if images look like PSA labels based on file characteristics
   */
  private static detectPsaLikeImages(imageFiles: File[]): boolean {
    // Heuristics to detect PSA label images:
    // 1. Smaller file sizes (labels are cropped)
    // 2. Consistent file sizes (labels are similar)
    // 3. Filenames might contain "label" or "psa"
    
    const avgSize = imageFiles.reduce((sum, file) => sum + file.size, 0) / imageFiles.length;
    
    // PSA labels are typically smaller (< 2MB) since they're cropped portions
    if (avgSize > 2 * 1024 * 1024) {
      return false;
    }

    // Check for PSA-related keywords in filenames
    const psaKeywords = /psa|label|grade|cert|slab/i;
    const hasKeywords = imageFiles.some(file => psaKeywords.test(file.name));
    
    return hasKeywords || avgSize < 500 * 1024; // Very small files are likely labels
  }

  /**
   * Detect card from OCR result using backend API
   * @param ocrResult OCR result to analyze
   * @param cardType Detected or specified card type
   * @returns Card detection result or null
   */
  private static async detectCardFromOcr(
    ocrResult: OcrResult, 
    cardType?: CardType
  ): Promise<CardDetectionResult | null> {
    console.log('[DEBUG] detectCardFromOcr called with:', {
      ocrResultText: ocrResult.text,
      ocrResultTextLength: ocrResult.text?.length,
      ocrResultConfidence: ocrResult.confidence,
      cardType: cardType || CardType.GENERIC,
      timestamp: new Date().toISOString()
    });

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(ocrResult.text, cardType);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('[DEBUG] Cache hit for card detection');
        return cached;
      }

      const requestPayload = {
        ocrResult: {
          text: ocrResult.text,
          confidence: ocrResult.confidence
        },
        cardType: cardType || CardType.GENERIC
      };

      console.log('[DEBUG] Sending request to /detect-card:', {
        url: `${this.API_BASE}/detect-card`,
        payload: requestPayload,
        payloadTextLength: requestPayload.ocrResult.text?.length,
        payloadTextPreview: requestPayload.ocrResult.text?.substring(0, 100) + '...'
      });

      const response = await fetch(`${this.API_BASE}/detect-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('[DEBUG] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[DEBUG] Card detection API error:', {
          status: response.status,
          errorData: errorData,
          originalText: ocrResult.text,
          textLength: ocrResult.text?.length
        });
        throw new CardDetectionError(
          errorData?.error || `Card detection failed: ${response.status}`,
          ocrResult.text,
          cardType || CardType.GENERIC
        );
      }

      const data: OcrApiResponse<DetectionApiData> = await response.json();
      
      if (!data.success || !data.data) {
        throw new CardDetectionError(
          'Invalid response from card detection API',
          ocrResult.text,
          cardType || CardType.GENERIC
        );
      }

      const detection = data.data.detection;
      
      // Cache the result
      this.setCache(cacheKey, detection);
      
      return detection;

    } catch (error) {
      console.error('[Enhanced OCR] Card detection error:', error);
      
      if (error instanceof CardDetectionError) {
        throw error;
      }
      
      // Don't throw for network errors - return null to allow graceful degradation
      return null;
    }
  }

  /**
   * Batch detect cards from multiple OCR results
   * @param ocrResults Array of OCR results
   * @param options Processing options
   * @returns Array of card detection results
   */
  private static async batchDetectCards(
    ocrResults: OcrResult[],
    options: ComprehensiveOcrOptions
  ): Promise<(CardDetectionResult | null)[]> {
    try {
      const response = await fetch(`${this.API_BASE}/batch-detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrResults: ocrResults.map(result => ({
            text: result.text,
            confidence: result.confidence,
            cardType: result.cardType?.type || options.cardType || CardType.GENERIC
          }))
        })
      });

      if (!response.ok) {
        console.error('Batch detection failed, falling back to individual detection');
        // Fallback to individual detection
        return Promise.all(
          ocrResults.map(async result => 
            await this.detectCardFromOcr(result, options.cardType)
          )
        );
      }

      const data: OcrApiResponse<BatchDetectionApiData> = await response.json();
      
      if (data.success && data.data?.detections) {
        // Cache all results
        data.data.detections.forEach((detection, index) => {
          if (detection) {
            const cacheKey = this.generateCacheKey(
              ocrResults[index].text, 
              options.cardType
            );
            this.setCache(cacheKey, detection);
          }
        });
        
        return data.data.detections;
      }

      // Fallback if API response is invalid
      return ocrResults.map(() => null as CardDetectionResult | null);

    } catch (error) {
      console.error('[Enhanced OCR] Batch detection error:', error);
      
      // Fallback to individual detection
      return Promise.all(
        ocrResults.map(async result => 
          await this.detectCardFromOcr(result, options.cardType)
        )
      );
    }
  }

  /**
   * Validate OCR text quality
   * @param text Text to validate
   * @returns Text validation result
   */
  static async validateText(text: string): Promise<TextValidationResult> {
    if (!text || typeof text !== 'string') {
      throw new OcrError('Text is required for validation', 'INVALID_INPUT');
    }

    try {
      const response = await fetch(`${this.API_BASE}/validate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new OcrError(`Text validation failed: ${response.status}`, 'VALIDATION_ERROR');
      }

      const data: OcrApiResponse<TextValidationResult> = await response.json();
      
      if (!data.success || !data.data) {
        throw new OcrError('Invalid response from text validation API', 'VALIDATION_ERROR');
      }

      return data.data;

    } catch (error) {
      if (error instanceof OcrError) {
        throw error;
      }
      
      throw new OcrError(
        `Text validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Get additional suggestions for a specific card
   * @param cardId Card ID to get suggestions for
   * @param limit Maximum number of suggestions
   * @returns Card suggestions
   */
  static async getCardSuggestions(cardId: string, limit: number = 10) {
    if (!cardId) {
      throw new OcrError('Card ID is required', 'INVALID_INPUT');
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/card-suggestions/${cardId}?limit=${limit}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new OcrError('Card not found', 'CARD_NOT_FOUND');
        }
        throw new OcrError(`Failed to get card suggestions: ${response.status}`, 'API_ERROR');
      }

      const data: OcrApiResponse = await response.json();
      
      if (!data.success) {
        throw new OcrError(data.error || 'Failed to get card suggestions', 'API_ERROR');
      }

      return data.data;

    } catch (error) {
      if (error instanceof OcrError) {
        throw error;
      }
      
      throw new OcrError(
        `Card suggestions failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SUGGESTIONS_ERROR'
      );
    }
  }

  /**
   * Perform OCR processing on image file
   * Integrates with Google Vision API or fallback OCR service
   */
  private static async performOcr(
    imageFile: File, 
    options: ComprehensiveOcrOptions
  ): Promise<OcrResult> {
    const startTime = Date.now();
    
    console.log('[DEBUG] performOcr called with:', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      options: options,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Context7 Optimized: Advanced PSA preprocessing
      let processedImageFile = imageFile;
      if (options.cardType === CardType.PSA_LABEL) {
        console.log('[DEBUG] Applying Context7 optimized PSA preprocessing...');
        try {
          // Use Context7 advanced preprocessing for better red label detection
          const preprocessResult = await Context7OcrPreprocessor.preprocessPsaLabel(imageFile, {
            targetRedHue: true,
            enhanceContrast: true,
            normalizeText: true,
            cropStrategy: 'color-based',
            morphologyOperations: true,
            edgeEnhancement: true
          });
          
          console.log('[DEBUG] Context7 preprocessing complete:', {
            confidence: preprocessResult.confidence,
            steps: preprocessResult.processingSteps,
            cropRegion: preprocessResult.cropRegion
          });
          
          // Convert preprocessed ImageData back to File
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = preprocessResult.processedImageData.width;
            canvas.height = preprocessResult.processedImageData.height;
            ctx.putImageData(preprocessResult.processedImageData, 0, 0);
            
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob(resolve as BlobCallback, 'image/png', 0.95);
            });
            
            if (blob) {
              processedImageFile = new File([blob], `context7-optimized-${imageFile.name}`, {
                type: 'image/png'
              });
            }
          }
          
        } catch (preprocessError) {
          console.warn('[DEBUG] Context7 preprocessing failed, falling back to basic preprocessing:', preprocessError);
          
          // Fallback to basic ImageStitchingService preprocessing
          try {
            const stitchResult = await ImageStitchingService.stitchPsaLabels([imageFile], {
              cropToLabel: true,
              labelHeight: 300,
              backgroundColor: '#ffffff',
              compressionQuality: 0.95
            });
            processedImageFile = stitchResult.stitchedFile;
            console.log('[DEBUG] Basic PSA preprocessing fallback complete');
          } catch (fallbackError) {
            console.warn('[DEBUG] All preprocessing failed, using original image:', fallbackError);
          }
        }
      }

      // Convert file to base64 for API processing
      console.log('[DEBUG] Converting file to base64...');
      const base64Image = await this.fileToBase64(processedImageFile);
      console.log('[DEBUG] Base64 conversion complete, length:', base64Image.length);
      
      // Try Google Vision API first
      try {
        console.log('[DEBUG] Attempting Google Vision API...');
        const visionResult = await this.processWithGoogleVision(base64Image, options);
        console.log('[DEBUG] Google Vision success:', {
          textLength: visionResult.text?.length,
          confidence: visionResult.confidence,
          textPreview: visionResult.text?.substring(0, 100) + '...'
        });
        return {
          ...visionResult,
          processingTime: Date.now() - startTime,
          source: 'google-vision'
        };
      } catch (visionError) {
        console.warn('[DEBUG] Google Vision failed, falling back to Tesseract:', visionError);
        
        // Fallback to Tesseract.js
        console.log('[DEBUG] Attempting Tesseract fallback...');
        const tesseractResult = await this.processWithTesseract(imageFile, options);
        console.log('[DEBUG] Tesseract success:', {
          textLength: tesseractResult.text?.length,
          confidence: tesseractResult.confidence,
          textPreview: tesseractResult.text?.substring(0, 100) + '...'
        });
        return {
          ...tesseractResult,
          processingTime: Date.now() - startTime,
          source: 'tesseract'
        };
      }
    } catch (error) {
      console.error('[DEBUG] All OCR methods failed:', error);
      
      // Return basic result with error indication
      const errorResult = {
        text: `OCR processing failed for ${imageFile.name}`,
        confidence: 0,
        source: 'hybrid',
        processingTime: Date.now() - startTime,
        cardType: {
          type: options.cardType || CardType.GENERIC,
          confidence: 0,
          features: ['error']
        }
      };
      console.log('[DEBUG] Returning error result:', errorResult);
      return errorResult;
    }
  }

  /**
   * Process image with Google Vision API using optimized endpoint selection
   */
  private static async processWithGoogleVision(
    base64Image: string,
    options: ComprehensiveOcrOptions
  ): Promise<Omit<OcrResult, 'processingTime' | 'source'>> {
    console.log('[DEBUG Vision Frontend] processWithGoogleVision called with options:', options);
    
    // Choose optimal endpoint based on options
    if (options.enableAdvancedOcr) {
      console.log('[DEBUG Vision Frontend] Using advanced OCR endpoint');
      return this.processWithAdvancedVision(base64Image, options);
    }
    
    if (options.enableAsyncProcessing) {
      console.log('[DEBUG Vision Frontend] Using async OCR endpoint');
      return this.processWithAsyncVision(base64Image, options);
    }
    
    // Default to standard vision endpoint
    console.log('[DEBUG Vision Frontend] Using standard vision endpoint');
    const response = await fetch('/api/ocr/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        features: ['TEXT_DETECTION'],
        imageContext: {
          languageHints: options.language ? [options.language] : ['en', 'ja']
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG Vision Frontend] Raw response data:', data);
    
    // Backend wraps response in { success: true, data: actualResponse }
    const actualData = data.success ? data.data : data;
    console.log('[DEBUG Vision Frontend] Actual data after unwrapping:', actualData);
    
    const text = actualData.responses?.[0]?.fullTextAnnotation?.text || '';
    const confidence = actualData.responses?.[0]?.fullTextAnnotation?.pages?.[0]?.confidence || 0.8;
    
    console.log('[DEBUG Vision Frontend] Extracted text details:', {
      textLength: text.length,
      confidence: confidence,
      textPreview: text.substring(0, 100) + '...'
    });

    return {
      text: text.trim(),
      confidence,
      cardType: this.detectCardTypeFromText(text, options)
    };
  }

  /**
   * Process image with advanced Google Vision options (Context7 optimization)
   */
  private static async processWithAdvancedVision(
    base64Image: string,
    options: ComprehensiveOcrOptions
  ): Promise<Omit<OcrResult, 'processingTime' | 'source'>> {
    console.log('[DEBUG Vision Advanced] Using advanced Vision API with enhanced options');
    
    const response = await fetch('/api/ocr/advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        options: {
          languageHints: options.language ? [options.language] : ['en', 'ja'],
          maxResults: options.maxResults || 50,
          computeStyleInfo: options.computeStyleInfo || false
        }
      })
    });

    if (!response.ok) {
      console.warn('[DEBUG Vision Advanced] Advanced processing failed, falling back to standard');
      throw new Error(`Advanced Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG Vision Advanced] Advanced response:', {
      hasData: !!data.data,
      textLength: data.data?.text?.length,
      confidence: data.data?.confidence,
      advanced: data.data?.advanced
    });
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response from advanced Vision API');
    }

    return {
      text: data.data.text.trim(),
      confidence: data.data.confidence,
      cardType: this.detectCardTypeFromText(data.data.text, options)
    };
  }

  /**
   * Process image with async Google Vision for concurrent operations
   */
  private static async processWithAsyncVision(
    base64Image: string,
    options: ComprehensiveOcrOptions
  ): Promise<Omit<OcrResult, 'processingTime' | 'source'>> {
    console.log('[DEBUG Vision Async] Using async Vision API for concurrent processing');
    
    const response = await fetch('/api/ocr/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        options: {
          languageHints: options.language ? [options.language] : ['en', 'ja']
        }
      })
    });

    if (!response.ok) {
      console.warn('[DEBUG Vision Async] Async processing failed, falling back to standard');
      throw new Error(`Async Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG Vision Async] Async response:', {
      hasData: !!data.data,
      textLength: data.data?.text?.length,
      confidence: data.data?.confidence,
      async: data.data?.async
    });
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response from async Vision API');
    }

    return {
      text: data.data.text.trim(),
      confidence: data.data.confidence,
      cardType: this.detectCardTypeFromText(data.data.text, options)
    };
  }

  /**
   * Process image with Tesseract.js (fallback)
   */
  private static async processWithTesseract(
    imageFile: File,
    options: ComprehensiveOcrOptions
  ): Promise<Omit<OcrResult, 'processingTime' | 'source'>> {
    // Import Tesseract dynamically to avoid bundle bloat
    const Tesseract = await import('tesseract.js');
    
    const { data } = await Tesseract.recognize(imageFile, 'eng+jpn', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    return {
      text: data.text.trim(),
      confidence: data.confidence / 100, // Convert to 0-1 range
      cardType: this.detectCardTypeFromText(data.text, options)
    };
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Detect card type from OCR text
   */
  private static detectCardTypeFromText(
    text: string,
    options: ComprehensiveOcrOptions
  ): CardTypeDetection {
    const lowerText = text.toLowerCase();
    const features: string[] = [];

    // PSA label detection
    if (lowerText.includes('psa') || lowerText.includes('grade') || /\b\d{8,10}\b/.test(text)) {
      features.push('psa-indicators');
      return {
        type: CardType.PSA_LABEL,
        confidence: 0.9,
        features
      };
    }

    // Japanese text detection
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      features.push('japanese-script');
      return {
        type: CardType.JAPANESE_POKEMON,
        confidence: 0.85,
        features
      };
    }

    // English Pokemon card detection
    if (lowerText.includes('pokemon') || lowerText.includes('hp') || /\b\d+\/\d+\b/.test(text)) {
      features.push('pokemon-indicators');
      return {
        type: CardType.ENGLISH_POKEMON,
        confidence: 0.8,
        features
      };
    }

    // Fallback to specified type or generic
    return {
      type: options.cardType || CardType.GENERIC,
      confidence: 0.6,
      features: ['text-based-detection']
    };
  }

  // Cache management methods
  private static generateCacheKey(text: string, cardType?: CardType): string {
    const hash = this.simpleHash(text);
    return `${hash}_${cardType ?? 'generic'}`;
  }

  private static getFromCache(key: string): CardDetectionResult | null {
    const cached = this.detectionCache.get(key);
    if (!cached) return null;

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.detectionCache.delete(key);
      return null;
    }

    return cached.result;
  }

  private static setCache(key: string, result: CardDetectionResult): void {
    // Limit cache size
    if (this.detectionCache.size >= 100) {
      const firstKey = this.detectionCache.keys().next().value;
      this.detectionCache.delete(firstKey);
    }

    this.detectionCache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear detection cache
   */
  static clearCache(): void {
    this.detectionCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.detectionCache.size,
      maxSize: 100,
      ttl: this.CACHE_TTL
    };
  }
}