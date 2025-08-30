/**
 * ICR API Repository - COMPLETE Individual Endpoint Implementation
 * Handles ALL ICR (Image Character Recognition) individual processing API calls
 * SOLID: Single Responsibility for ICR API communication
 * DRY: Centralized API logic with proper error handling
 */

import { ApiClient, ApiResponse } from './ApiClient';
import { imageUrlService } from '@/shared/services/ImageUrlService';
import { extractResponseData } from '@/shared/services/utils/responseUtils';

// ================================
// SCAN-BASED INTERFACE DEFINITIONS
// ================================

export interface IcrUploadResponse {
  scanIds: string[];
  successful: number;
  failed: number;
  duplicateCount: number;
  errors: Array<{
    filename: string;
    error: string;
  }>;
  duplicates: Array<{
    filename: string;
    existingId: string;
    message: string;
  }>;
}

export interface IcrScan {
  id: string;
  originalFileName: string;
  fullImageUrl: string;
  labelImageUrl: string | null;
  processingStatus: 'uploaded' | 'extracted' | 'ocr_completed' | 'matched' | 'failed';
  imageHash: string;
  createdAt: string;
  ocrText?: string;
  ocrConfidence?: number;
  matchedCard?: {
    cardName: string;
    cardNumber: string;
  };
  matchConfidence?: number;
}

export interface IcrScansResponse {
  scans: IcrScan[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface IcrExtractLabelsResponse {
  successful: number;
  failed: number;
  skippedCount: number;
  results: Array<{
    scanId: string;
    originalFileName: string;
    labelPath: string;
    extractedDimensions: {
      width: number;
      height: number;
    };
  }>;
  errors: Array<{
    scanId: string;
    error: string;
  }>;
  skipped: Array<{
    scanId: string;
    reason: string;
  }>;
}

export interface IcrStitchResult {
  stitchedImagePath: string;
  stitchedImageUrl: string;
  totalLabels: number;
  imageWidth: number;
  imageHeight: number;
  isDuplicate: boolean;
  duplicateImagePath?: string;
}

export interface IcrOcrResult {
  ocrText: string;
  confidence: number;
  processingTime: number;
  extractedBlocks: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

export interface IcrDistributeResult {
  successfulDistributions: number;
  totalProcessed: number;
  distributions: Array<{
    imageHash: string;
    ocrText: string;
    extractedData: {
      certificationNumber?: string;
      grade?: number;
      year?: number;
      cardName?: string;
      setName?: string;
      language?: string;
      possibleCardNumbers?: string[];
      possiblePokemonNames?: string[];
      modifiers?: string[];
    };
    confidence: number;
  }>;
}

export interface IcrMatchResult {
  successfulMatches: number;
  totalProcessed: number;
  matches: Array<{
    imageHash: string;
    cardMatches: Array<{
      cardId: string;
      cardName: string;
      cardNumber: string;
      setName: string;
      year?: number;
      confidence: number;
      scores: {
        yearMatch: number;
        pokemonMatch: number;
        cardNumberMatch: number;
        modifierMatch: number;
        setVerification: number;
      };
    }>;
    bestMatch?: {
      cardId: string;
      cardName: string;
      cardNumber: string;
      setName: string;
      confidence: number;
    };
    matchingStatus: 'pending' | 'auto_matched' | 'manual_override' | 'no_match' | 'confirmed';
  }>;
}

export interface IcrProcessedImage {
  imageHash: string;
  originalFileName: string;
  fullImageUrl: string;
  labelImageUrl: string;
  ocrText: string;
  extractedData: {
    certificationNumber?: string;
    grade?: number;
    year?: number;
    cardName?: string;
    setName?: string;
    language?: string;
    possibleCardNumbers?: string[];
    possiblePokemonNames?: string[];
    modifiers?: string[];
  };
  cardMatches: Array<{
    cardId: string;
    cardName: string;
    cardNumber: string;
    setName: string;
    year?: number;
    confidence: number;
    scores: {
      yearMatch: number;
      pokemonMatch: number;
      cardNumberMatch: number;
      modifierMatch: number;
      setVerification: number;
    };
  }>;
  matchingStatus: 'pending' | 'auto_matched' | 'manual_override' | 'no_match' | 'confirmed' | 'psa_created';
  bestMatch?: {
    cardName: string;
    cardNumber: string;
    setName: string;
    confidence: number;
  };
  userSelectedMatch?: string;
  processingStatus: string;
}

export interface IcrResultsResponse {
  images: IcrProcessedImage[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface IcrStatusResponse {
  total: number;
  uploaded: number;
  extracted: number;
  ocrCompleted: number;
  matched: number;
  failed: number;
  completionRate: number;
}

export interface IcrSelectMatchRequest {
  cardId: string;
}

export interface IcrSelectMatchResponse {
  imageHash: string;
  selectedCardId: string;
  matchingStatus: 'manual_override';
}

export interface IcrCreatePsaRequest {
  myPrice: number;
  grade?: string;
  dateAdded?: Date;
}

export interface IcrCreatePsaResponse {
  psaCardId: string;
  imageHash: string;
  cardDetails: {
    cardName: string;
    setName: string;
    cardNumber: string;
    grade: string;
    myPrice: number;
    dateAdded: Date;
  };
}

export class OcrApiRepository {
  private static readonly API_BASE = '/icr';
  private readonly apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.apiClient = apiClient || new ApiClient('http://localhost:3000/api');
  }


  // ================================
  // STEP 1A: UPLOAD IMAGES WITH DUPLICATE DETECTION
  // ================================

  /**
   * Upload PSA card images and create GradedCardScan records
   * Backend: POST /api/icr/upload
   * Response: { success, message, data: IcrUploadResponse }
   */
  async uploadImages(imageFiles: File[]): Promise<IcrUploadResponse> {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response: ApiResponse<IcrUploadResponse> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/upload`, 
      formData
    );
    
    return extractResponseData<IcrUploadResponse>(response);
  }

  // ================================
  // STEP 2: EXTRACT PSA LABELS FROM UPLOADED SCANS
  // ================================

  /**
   * Extract PSA labels from uploaded scans
   * Backend: POST /api/icr/extract-labels
   * Body: { scanIds: string[] }
   * Response: { success, message, data: IcrExtractLabelsResponse }
   */
  async extractLabels(scanIds: string[]): Promise<IcrExtractLabelsResponse> {
    const response: ApiResponse<IcrExtractLabelsResponse> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/extract-labels`,
      { scanIds }
    );
    
    return extractResponseData<IcrLabelExtractionResponse>(response);
  }

  // ================================
  // STEP 2: CREATE STITCHED IMAGE
  // ================================

  /**
   * Create vertical stitched image from extracted labels
   * Backend: POST /api/icr/stitch
   * Body: { imageHashes: string[] }
   * Response: { success, message, data: IcrStitchResult }
   */
  async stitchImages(imageHashes: string[]): Promise<IcrStitchResult> {
    // PHASE 3 FIX: Log the exact request payload being sent
    const requestPayload = { imageHashes };
    console.log('🚀 DEBUG: Stitching API request payload:', {
      endpoint: `${OcrApiRepository.API_BASE}/stitch`,
      payload: requestPayload,
      imageHashesIsArray: Array.isArray(imageHashes),
      imageHashesType: typeof imageHashes,
      imageHashesLength: imageHashes?.length,
      firstFewHashes: imageHashes?.slice(0, 3),
      actualPayload: JSON.stringify(requestPayload)
    });
    
    const response: ApiResponse<IcrStitchResult> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/stitch`,
      requestPayload
    );
    
    // PHASE 3 FIX: Log the exact response
    console.log('🚀 DEBUG: Stitching API response:', {
      success: response.success,
      status: (response as any).status,
      error: response.error,
      data: response.data
    });
    
    return extractResponseData<IcrStitchingResponse>(response);
  }

  // ================================
  // STEP 3: PROCESS OCR ON STITCHED IMAGE
  // ================================

  /**
   * Process OCR on stitched image
   * Backend: POST /api/icr/ocr
   * Body: { stitchedImagePath?: string, imageHashes?: string[] }
   * Response: { success, message, data: IcrOcrResult }
   */
  async processOcr(imageHashes: string[], stitchedImagePath?: string): Promise<IcrOcrResult> {
    const requestBody = stitchedImagePath ? { stitchedImagePath, imageHashes } : { imageHashes };
    
    const response: ApiResponse<IcrOcrResult> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/ocr`,
      requestBody
    );
    
    return extractResponseData<IcrOcrResponse>(response);
  }

  // ================================
  // STEP 4: DISTRIBUTE OCR TEXT TO INDIVIDUAL SCANS
  // ================================

  /**
   * Distribute OCR text to individual images
   * Backend: POST /api/icr/distribute
   * Body: { imageHashes: string[], ocrResult?: IcrOcrResult }
   * Response: { success, message, data: IcrDistributeResult }
   */
  async distributeText(imageHashes: string[], ocrResult?: IcrOcrResult): Promise<IcrDistributeResult> {
    const requestBody = ocrResult ? { imageHashes, ocrResult } : { imageHashes };
    
    const response: ApiResponse<IcrDistributeResult> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/distribute`,
      requestBody
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Text distribution failed');
    }
    
    return response.data;
  }

  // ================================
  // STEP 5: PERFORM CARD MATCHING
  // ================================

  /**
   * Perform hierarchical card matching
   * Backend: POST /api/icr/match
   * Body: { imageHashes: string[] }
   * Response: { success, message, data: IcrMatchResult }
   */
  async matchCards(imageHashes: string[]): Promise<IcrMatchResult> {
    const response: ApiResponse<IcrMatchResult> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/match`,
      { imageHashes }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Card matching failed');
    }
    
    return response.data;
  }

  // ================================
  // RESULTS & STATUS ENDPOINTS
  // ================================

  /**
   * Get scans by processing status
   * Backend: GET /api/icr/scans
   * Query: { status?: string, page?: number, limit?: number }
   * Response: { success, message, data: IcrScansResponse }
   */
  async getScans(options: { status?: string; page?: number; limit?: number } = {}): Promise<IcrScansResponse> {
    const params = new URLSearchParams({
      status: options.status || 'uploaded',
      page: options.page?.toString() || '1',
      limit: options.limit?.toString() || '150',
      _t: Date.now().toString() // Cache busting timestamp
    });

    const response: ApiResponse<IcrScansResponse> = await this.apiClient.get(
      `${OcrApiRepository.API_BASE}/scans?${params}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get scans');
    }
    
    // Extract scans array from the response data structure
    const scansData = {
      scans: response.data.data?.scans || response.data.scans || [],
      pagination: response.data.data?.pagination || response.data.pagination || {}
    };
    
    // SOLID & DRY: Transform all image URLs using centralized service
    return imageUrlService.transformApiResponse(scansData);
  }

  /**
   * Get individual scan with complete details including OCR data and card matches
   * Backend: GET /api/icr/scans/:id  
   * Response: { success, data: { scan: DetailedScan } }
   */
  async getScanDetails(scanId: string): Promise<any> {
    const response: ApiResponse<{ scan: any }> = await this.apiClient.get(
      `${OcrApiRepository.API_BASE}/scans/${scanId}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get scan details');
    }
    
    const scan = response.data.scan;
    
    // SOLID & DRY: Transform image URLs using centralized service
    return imageUrlService.transformApiResponse(scan);
  }

  /**
   * Get processing status for specific images
   * Backend: POST /api/icr/status/check
   * Body: { imageHashes: string[] }
   * Response: { success, data: IcrProcessedImage[] }
   */
  async getImageStatuses(imageHashes: string[]): Promise<IcrProcessedImage[]> {
    const response: ApiResponse<IcrProcessedImage[]> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/status/check`,
      { imageHashes }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get image statuses');
    }
    
    // SOLID & DRY: Transform all image URLs using centralized service
    return imageUrlService.transformApiResponse(response.data);
  }

  /**
   * Get all stitched images
   * Backend: GET /api/icr/stitched
   * Query: { page?: number, limit?: number }
   * Response: { success, data: { stitchedImages: StitchedImage[], pagination: PaginationInfo } }
   */
  async getStitchedImages(options: { page?: number; limit?: number } = {}): Promise<{ stitchedImages: any[], pagination: any }> {
    const params = new URLSearchParams({
      page: options.page?.toString() || '1',
      limit: options.limit?.toString() || '150'
    });

    const response: ApiResponse<{ stitchedImages: any[], pagination: any }> = await this.apiClient.get(
      `${OcrApiRepository.API_BASE}/stitched?${params}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get stitched images');
    }
    
    // SOLID & DRY: Transform all image URLs using centralized service
    return imageUrlService.transformApiResponse(response.data);
  }

  /**
   * Delete stitched image and reset scans to extracted status
   * Backend: DELETE /api/icr/stitched/:id
   * Response: { success, message, data: { deletedStitchedId, scansReset, resetHashes } }
   */
  async deleteStitchedImage(stitchedId: string): Promise<{ deletedStitchedId: string, scansReset: number, resetHashes: string[] }> {
    const response: ApiResponse<{ deletedStitchedId: string, scansReset: number, resetHashes: string[] }> = await this.apiClient.delete(
      `${OcrApiRepository.API_BASE}/stitched/${stitchedId}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to delete stitched image');
    }
    
    return response.data;
  }

  /**
   * Get overall processing status
   * Backend: GET /api/icr/status
   * Response: { success, data: IcrStatusResponse }
   */
  async getOverallStatus(): Promise<IcrStatusResponse> {
    const response: ApiResponse<IcrStatusResponse> = await this.apiClient.get(
      `${OcrApiRepository.API_BASE}/status?_t=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get status');
    }
    
    return response.data;
  }

  // ================================
  // CARD MATCHING MANAGEMENT ENDPOINTS
  // ================================

  /**
   * Manual card match selection override
   * Backend: PUT /api/icr/select-match
   * Body: { imageHash: string, cardId: string }
   * Response: { success, message, data: IcrSelectMatchResponse }
   */
  async selectCardMatch(imageHash: string, cardId: string): Promise<IcrSelectMatchResponse> {
    const requestBody = { imageHash, cardId };
    
    const response: ApiResponse<IcrSelectMatchResponse> = await this.apiClient.put(
      `${OcrApiRepository.API_BASE}/select-match`,
      requestBody
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to select card match');
    }
    
    return response.data;
  }

  /**
   * Create PSA card from matched image
   * Backend: POST /api/icr/create-psa
   * Body: { imageHash: string, myPrice: number, grade?: string, dateAdded?: Date }
   * Response: { success, message, data: IcrCreatePsaResponse }
   */
  async createPsaCard(imageHash: string, psaData: IcrCreatePsaRequest): Promise<IcrCreatePsaResponse> {
    const requestBody = { imageHash, ...psaData };
    
    const response: ApiResponse<IcrCreatePsaResponse> = await this.apiClient.post(
      `${OcrApiRepository.API_BASE}/create-psa`,
      requestBody
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create PSA card');
    }
    
    return response.data;
  }

  // ================================
  // BATCH MANAGEMENT ENDPOINTS
  // ================================

  /**
   * Delete multiple scans
   * Backend: DELETE /api/icr/scans
   * Body: { scanIds: string[] }
   * Response: { success, message, data: { deletedCount: number, requestedCount: number } }
   */
  async deleteScans(scanIds: string[]): Promise<{ deletedCount: number; requestedCount: number }> {
    const response: ApiResponse<{ deletedCount: number; requestedCount: number }> = await this.apiClient.delete(
      `${OcrApiRepository.API_BASE}/scans`,
      { scanIds }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to delete scans');
    }
    
    return response.data;
  }

  // ================================
  // IMAGE SERVING UTILITIES - DEPRECATED
  // ================================
  // 
  // These methods are deprecated in favor of the centralized ImageUrlService
  // All image URL transformation is now handled automatically in API responses
  // Use imageUrlService.getFullImageUrl(), etc. for manual URL construction

}