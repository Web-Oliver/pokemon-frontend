/**
 * Export API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for export-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains export interface compatibility
 * - ISP: Provides specific export operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations for basic CRUD, specialized for export functionality
 * Phase 10: Auction Management - Export Features
 */

import {
  createResourceOperations,
  EXPORT_CONFIG,
} from './genericApiOperations';
import { unifiedApiClient } from './unifiedApiClient';

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Export job interface
 */
interface IExport {
  id?: string;
  _id?: string;
  type: 'facebook' | 'dba' | 'zip' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Export creation payload interface
 */
type IExportCreatePayload = Omit<
  IExport,
  'id' | '_id' | 'createdAt' | 'updatedAt'
>;

/**
 * Export update payload interface
 */
type IExportUpdatePayload = Partial<IExportCreatePayload>;

/**
 * Export collection items to DBA.dk format
 */
export interface DbaExportItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
}

export interface DbaExportRequest {
  items: DbaExportItem[];
  customDescription?: string;
  includeMetadata?: boolean;
}

export interface DbaExportResponse {
  success: boolean;
  message: string;
  data: {
    itemCount: number;
    jsonFilePath: string;
    dataFolder: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      imagePaths: string[];
      itemType: string;
      metadata?: any;
    }>;
  };
}

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for exports using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const exportOperations = createResourceOperations<
  IExport,
  IExportCreatePayload,
  IExportUpdatePayload
>(EXPORT_CONFIG, {
  includeExportOperations: false, // Prevent circular dependency
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all export jobs
 * @param params - Optional filter parameters
 * @returns Promise<IExport[]> - Array of export jobs
 */
export const getExports = exportOperations.getAll;

/**
 * Get export job by ID
 * @param id - Export job ID
 * @returns Promise<IExport> - Single export job
 */
export const getExportById = exportOperations.getById;

/**
 * Create a new export job
 * @param exportData - Export job creation data
 * @returns Promise<IExport> - Created export job
 */
export const createExport = exportOperations.create;

/**
 * Update existing export job
 * @param id - Export job ID
 * @param exportData - Export job update data
 * @returns Promise<IExport> - Updated export job
 */
export const updateExport = exportOperations.update;

/**
 * Delete export job
 * @param id - Export job ID
 * @returns Promise<void>
 */
export const removeExport = exportOperations.remove;

/**
 * Search export jobs with parameters
 * @param searchParams - Export job search parameters
 * @returns Promise<IExport[]> - Search results
 */
export const searchExports = exportOperations.search;

// BATCH EXPORT OPERATIONS REMOVED - Not used by any frontend components

// ========== SPECIALIZED EXPORT OPERATIONS ==========

/**
 * Generate Facebook post for auction
 * @param auctionId - Auction ID
 * @returns Promise<string> - Generated Facebook post text
 */
export const generateAuctionFacebookPost = async (
  auctionId: string
): Promise<string> => {
  // First, get the auction data using ID-validated method
  const auction = (await unifiedApiClient.getById(
    '/auctions',
    auctionId
  )) as any;
  const auctionData = (auction.data || auction) as any;

  // Prepare the request body for the existing backend endpoint
  const requestData = {
    items: auctionData.items.map((item: any) => ({
      itemId: item.itemId || (item.itemData as any)?._id,
      itemCategory: item.itemCategory,
    })),
    topText: auctionData.topText,
    bottomText: auctionData.bottomText,
  };

  // Call the existing backend endpoint
  const response = (await unifiedApiClient.post(
    '/generate-facebook-post',
    requestData
  )) as any;
  return response.data?.facebookPost || response.facebookPost || response;
};

/**
 * Generate Facebook text file for auction
 * @param auctionId - Auction ID
 * @returns Promise<Blob> - Text file blob for download
 */
export const getAuctionFacebookTextFile = async (
  auctionId: string
): Promise<Blob> => {
  // Generate the Facebook post content
  const facebookPost = await generateAuctionFacebookPost(auctionId);

  // Create a blob from the text content
  const blob = new Blob([facebookPost], { type: 'text/plain' });
  return blob;
};

/**
 * Zip all images for auction
 * @param auctionId - Auction ID
 * @returns Promise<Blob> - Zip file blob for download
 */
export const zipAuctionImages = async (auctionId: string): Promise<Blob> => {
  // Get auction data to extract image URLs using ID-validated method
  const auction = (await unifiedApiClient.getById(
    '/auctions',
    auctionId
  )) as any;

  // Extract all image URLs from auction items
  const imageUrls: string[] = [];
  const itemNames: string[] = [];

  auction.items.forEach((item: any) => {
    if ((item.itemData as any) && (item.itemData as any).images) {
      (item.itemData as any).images.forEach(
        (imagePath: string, imageIndex: number) => {
          if (imagePath) {
            // Convert relative path to full URL
            const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `http://localhost:3000${imagePath}`;
            imageUrls.push(imageUrl);

            // Generate improved filename based on best practices
            const category =
              item.itemCategory === 'PsaGradedCard'
                ? 'PSA'
                : item.itemCategory === 'RawCard'
                  ? 'RAW'
                  : 'SEALED';

            let itemName = '';

            if (
              item.itemCategory === 'PsaGradedCard' ||
              item.itemCategory === 'RawCard'
            ) {
              const cardName = (
                (item.itemData as any).cardId?.cardName ||
                (item.itemData as any).cardId?.baseName ||
                'Unknown'
              )
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase();
              const setName = (
                (item.itemData as any).cardId?.setId?.setName || 'Unknown'
              )
                .replace(/^(pokemon\s+)?(japanese\s+)?/i, '') // Remove prefixes
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase();
              const number =
                (item.itemData as any).cardId?.pokemonNumber || '000';

              if (item.itemCategory === 'PsaGradedCard') {
                const grade = (item.itemData as any).grade || '0';
                itemName = `${category}_${setName}_${cardName}_${number}_PSA${grade}`;
              } else {
                const condition = ((item.itemData as any).condition || 'NM')
                  .replace(/\s+/g, '')
                  .toUpperCase();
                itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
              }
            } else {
              // Sealed product
              const productName = ((item.itemData as any).name || 'Unknown')
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase();
              itemName = `${category}_${productName}`;
            }

            const extension = imagePath.split('.').pop() || 'jpg';
            const imageNumber = String(imageIndex + 1).padStart(2, '0');
            itemNames.push(`${itemName}_img${imageNumber}.${extension}`);
          }
        }
      );
    }
  });

  if (imageUrls.length === 0) {
    throw new Error('No images found in auction items');
  }

  // Import JSZip dynamically
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Fetch all images and add them to the zip
  const imagePromises = imageUrls.map(async (url, index) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      zip.file(itemNames[index], blob);
    } catch (error) {
      console.warn(`Failed to fetch image ${url}:`, error);
    }
  });

  await Promise.all(imagePromises);

  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

/**
 * Zip all images for Raw Cards
 * @param cardIds - Array of Raw Card IDs (optional, if empty - zip all raw cards)
 * @returns Promise<Blob> - Zip file blob for download
 */
export const zipRawCardImages = async (cardIds?: string[]): Promise<Blob> => {
  // Get raw cards data from export endpoint
  const endpoint =
    cardIds && cardIds.length > 0
      ? `/export/zip/raw-cards?ids=${cardIds.join(',')}`
      : '/export/zip/raw-cards';
  const rawCards = (await unifiedApiClient.get(endpoint)) as any;
  const cardsData = rawCards.data || rawCards;

  return createImageZip(cardsData, 'raw-card');
};

/**
 * Zip all images for PSA Cards
 * @param cardIds - Array of PSA Card IDs (optional, if empty - zip all PSA cards)
 * @returns Promise<Blob> - Zip file blob for download
 */
export const zipPsaCardImages = async (cardIds?: string[]): Promise<Blob> => {
  // Get PSA cards data from export endpoint
  const endpoint =
    cardIds && cardIds.length > 0
      ? `/export/zip/psa-cards?ids=${cardIds.join(',')}`
      : '/export/zip/psa-cards';
  const psaCards = (await unifiedApiClient.get(endpoint)) as any;
  const cardsData = psaCards.data || psaCards;

  return createImageZip(cardsData, 'psa-card');
};

/**
 * Zip all images for Sealed Products
 * @param productIds - Array of Sealed Product IDs (optional, if empty - zip all sealed products)
 * @returns Promise<Blob> - Zip file blob for download
 */
export const zipSealedProductImages = async (
  productIds?: string[]
): Promise<Blob> => {
  // Get sealed products data from export endpoint
  const endpoint =
    productIds && productIds.length > 0
      ? `/export/zip/sealed-products?ids=${productIds.join(',')}`
      : '/export/zip/sealed-products';
  const sealedProducts = (await unifiedApiClient.get(endpoint)) as any;
  const productsData = sealedProducts.data || sealedProducts;

  return createImageZip(productsData, 'sealed-product');
};

/**
 * Helper function to create image zip from collection items
 * @param items - Array of collection items
 * @param itemType - Type of item for filename prefix
 * @returns Promise<Blob> - Zip file blob
 */
const createImageZip = async (
  items: Record<string, unknown>[],
  itemType: string
): Promise<Blob> => {
  // Extract all image URLs from items
  const imageUrls: string[] = [];
  const itemNames: string[] = [];

  items.forEach((item: any, index: number) => {
    if (item.images && item.images.length > 0) {
      item.images.forEach((imagePath: string, imageIndex: number) => {
        if (imagePath) {
          // Convert relative path to full URL
          const imageUrl = imagePath.startsWith('http')
            ? imagePath
            : `http://localhost:3000${imagePath}`;
          imageUrls.push(imageUrl);

          // Generate improved filename based on best practices
          let itemName = '';
          const category =
            itemType === 'psa-card'
              ? 'PSA'
              : itemType === 'raw-card'
                ? 'RAW'
                : 'SEALED';

          if (itemType === 'psa-card' || itemType === 'raw-card') {
            const cardName = (
              item.cardId?.cardName ||
              item.cardId?.baseName ||
              'Unknown'
            )
              .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .toLowerCase();
            const setName = (item.cardId?.setId?.setName || 'Unknown')
              .replace(/^(pokemon\s+)?(japanese\s+)?/i, '') // Remove prefixes
              .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .toLowerCase();
            const number = item.cardId?.pokemonNumber || '000';

            if (itemType === 'psa-card' && item.grade) {
              itemName = `${category}_${setName}_${cardName}_${number}_PSA${item.grade}`;
            } else if (itemType === 'raw-card' && item.condition) {
              const condition = item.condition
                .replace(/\s+/g, '')
                .toUpperCase();
              itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
            } else {
              itemName = `${category}_${setName}_${cardName}_${number}`;
            }
          } else if (itemType === 'sealed-product') {
            const productName = (item.name || 'Unknown')
              .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .toLowerCase();
            itemName = `${category}_${productName}`;
          } else {
            itemName = `${category}_item_${String(index + 1).padStart(3, '0')}`;
          }

          const extension = imagePath.split('.').pop() || 'jpg';
          const imageNumber = String(imageIndex + 1).padStart(2, '0');
          itemNames.push(`${itemName}_img${imageNumber}.${extension}`);
        }
      });
    }
  });

  if (imageUrls.length === 0) {
    throw new Error(`No images found in ${itemType}s`);
  }

  // Import JSZip dynamically
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Fetch all images and add them to the zip
  const imagePromises = imageUrls.map(async (url, index) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      zip.file(itemNames[index], blob);
    } catch (error) {
      console.warn(`Failed to fetch image ${url}:`, error);
    }
  });

  await Promise.all(imagePromises);

  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

/**
 * Generate Facebook text file for collection items
 * @param selectedItemIds - Array of selected item IDs
 * @returns Promise<Blob> - Text file blob for download
 */
export const getCollectionFacebookTextFile = async (
  selectedItemIds: string[]
): Promise<Blob> => {
  const response = await unifiedApiClient.apiCreate<Blob>(
    '/collection/facebook-text-file',
    { itemIds: selectedItemIds },
    'collection Facebook text file',
    { responseType: 'blob' }
  );
  return response;
};

export const exportToDba = async (
  exportRequest: DbaExportRequest
): Promise<DbaExportResponse> => {
  const response = await unifiedApiClient.apiCreate<DbaExportResponse>(
    '/export/dba',
    exportRequest,
    'DBA export'
  );
  return response;
};

/**
 * Download DBA export as ZIP file
 */
export const downloadDbaZip = async (): Promise<void> => {
  try {
    // Use direct axios call for binary download instead of standardized API wrapper
    const response = await unifiedApiClient
      .getAxiosInstance()
      .get('/export/dba/download', {
        responseType: 'blob',
      });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `dba-export-${timestamp}.zip`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('[EXPORT API] Failed to download DBA ZIP:', error);
    throw error;
  }
};

/**
 * Utility function to trigger file download
 * @param blob - File blob to download
 * @param filename - Suggested filename
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ========== MISSING DBA INTEGRATION ENDPOINTS ==========

/**
 * DBA credentials interface
 */
export interface DbaCredentials {
  username: string;
  password: string;
}

/**
 * DBA posting request interface
 */
export interface DbaPostRequest {
  exportId: string;
  credentials: DbaCredentials;
}

/**
 * DBA posting response interface
 */
export interface DbaPostResponse {
  success: boolean;
  message: string;
  data: {
    itemsPosted: number;
    postsCreated: number;
    failedPosts: Array<{
      itemId: string;
      reason: string;
    }>;
    postUrls: string[];
  };
}

/**
 * DBA integration status interface
 */
export interface DbaIntegrationStatus {
  success: boolean;
  data: {
    serviceEnabled: boolean;
    lastPostDate?: string;
    totalItemsPosted: number;
    pendingItems: number;
    failedPosts: number;
    integrationHealth: 'healthy' | 'warning' | 'error';
    lastError?: string;
    apiLimits: {
      dailyLimit: number;
      dailyUsed: number;
      rateLimitRemaining: number;
    };
  };
}

/**
 * DBA test response interface
 */
export interface DbaTestResponse {
  success: boolean;
  message: string;
  data: {
    connectionTest: boolean;
    authenticationTest: boolean;
    apiLimitsCheck: boolean;
    testPosting: boolean;
    recommendations: string[];
    warnings: string[];
  };
}

/**
 * Post directly to DBA marketplace
 * Uses POST /api/export/dba/post endpoint as per API documentation
 * @param request - DBA posting request with export ID and credentials
 * @returns Promise<DbaPostResponse> - Posting results
 */
export const postToDbaMarketplace = async (
  request: DbaPostRequest
): Promise<DbaPostResponse> => {
  return unifiedApiClient.post<DbaPostResponse>('/export/dba/post', request);
};

/**
 * Get DBA integration status and statistics
 * Uses GET /api/export/dba/status endpoint as per API documentation
 * @returns Promise<DbaIntegrationStatus> - DBA integration status
 */
export const getDbaIntegrationStatus =
  async (): Promise<DbaIntegrationStatus> => {
    return unifiedApiClient.get<DbaIntegrationStatus>('/export/dba/status');
  };

/**
 * Test DBA integration without posting
 * Uses POST /api/export/dba/test endpoint as per API documentation
 * @returns Promise<DbaTestResponse> - Test results and recommendations
 */
export const testDbaIntegration = async (): Promise<DbaTestResponse> => {
  return unifiedApiClient.post<DbaTestResponse>('/export/dba/test');
};

// ========== DBA CONVENIENCE FUNCTIONS ==========

/**
 * Check if DBA integration is healthy and ready for posting
 * @returns Promise<boolean> - True if DBA integration is ready
 */
export const isDbaIntegrationHealthy = async (): Promise<boolean> => {
  try {
    const status = await getDbaIntegrationStatus();
    return (
      status.success &&
      status.data.serviceEnabled &&
      status.data.integrationHealth === 'healthy'
    );
  } catch (error) {
    console.error('DBA integration health check failed:', error);
    return false;
  }
};

/**
 * Get DBA posting limits and usage
 * @returns Promise<{dailyLimit: number, dailyUsed: number, remaining: number}> - API limits info
 */
export const getDbaApiLimits = async (): Promise<{
  dailyLimit: number;
  dailyUsed: number;
  remaining: number;
}> => {
  try {
    const status = await getDbaIntegrationStatus();
    const limits = status.data.apiLimits;
    return {
      dailyLimit: limits.dailyLimit,
      dailyUsed: limits.dailyUsed,
      remaining: limits.dailyLimit - limits.dailyUsed,
    };
  } catch (error) {
    console.error('Failed to get DBA API limits:', error);
    return {
      dailyLimit: 0,
      dailyUsed: 0,
      remaining: 0,
    };
  }
};

/**
 * Export and post to DBA in one operation
 * @param items - Items to export and post
 * @param credentials - DBA credentials
 * @param options - Export options
 * @returns Promise<{exportResponse: DbaExportResponse, postResponse: DbaPostResponse}> - Combined results
 */
export const exportAndPostToDba = async (
  items: DbaExportItem[],
  credentials: DbaCredentials,
  options: {
    customDescription?: string;
    includeMetadata?: boolean;
  } = {}
): Promise<{
  exportResponse: DbaExportResponse;
  postResponse: DbaPostResponse;
}> => {
  // First, export the items to DBA format
  const exportResponse = await exportToDba({
    items,
    customDescription: options.customDescription,
    includeMetadata: options.includeMetadata,
  });

  if (!exportResponse.success) {
    throw new Error(`Export failed: ${exportResponse.message}`);
  }

  // Then, post to DBA marketplace
  const postResponse = await postToDbaMarketplace({
    exportId: exportResponse.data.jsonFilePath, // Use the generated export path as ID
    credentials,
  });

  return {
    exportResponse,
    postResponse,
  };
};
