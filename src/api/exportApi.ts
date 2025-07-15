/**
 * Export API Client
 * Handles export operations for auctions and collections
 * Phase 10: Auction Management - Export Features
 */

import apiClient from './apiClient';

/**
 * Generate Facebook post for auction
 * @param auctionId - Auction ID
 * @returns Promise<string> - Generated Facebook post text
 */
export const generateAuctionFacebookPost = async (auctionId: string): Promise<string> => {
  // First, get the auction data
  const auctionResponse = await apiClient.get(`/auctions/${auctionId}`);
  const auction = auctionResponse.data.data || auctionResponse.data;
  
  // Prepare the request body for the existing backend endpoint
  const requestData = {
    items: auction.items.map((item: any) => ({
      itemId: item.itemId || item.itemData?._id,
      itemCategory: item.itemCategory
    })),
    topText: auction.topText,
    bottomText: auction.bottomText
  };
  
  // Call the existing backend endpoint
  const response = await apiClient.post('/generate-facebook-post', requestData);
  return response.data.data?.facebookPost || response.data.facebookPost || response.data;
};

/**
 * Generate Facebook text file for auction
 * @param auctionId - Auction ID
 * @returns Promise<Blob> - Text file blob for download
 */
export const getAuctionFacebookTextFile = async (auctionId: string): Promise<Blob> => {
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
  // Get auction data to extract image URLs
  const auctionResponse = await apiClient.get(`/auctions/${auctionId}`);
  const auction = auctionResponse.data.data || auctionResponse.data;
  
  // Extract all image URLs from auction items
  const imageUrls: string[] = [];
  const itemNames: string[] = [];
  
  auction.items.forEach((item: any, index: number) => {
    if (item.itemData && item.itemData.images) {
      item.itemData.images.forEach((imagePath: string, imageIndex: number) => {
        if (imagePath) {
          // Convert relative path to full URL
          const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
          imageUrls.push(imageUrl);
          
          // Generate filename based on item name and category
          const itemName = item.itemData.cardId?.cardName || item.itemData.cardId?.baseName || item.itemData.name || `item-${index + 1}`;
          const extension = imagePath.split('.').pop() || 'jpg';
          itemNames.push(`${itemName}-${imageIndex + 1}.${extension}`);
        }
      });
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
 * Generate Facebook text file for collection items
 * @param selectedItemIds - Array of selected item IDs
 * @returns Promise<Blob> - Text file blob for download
 */
export const getCollectionFacebookTextFile = async (selectedItemIds: string[]): Promise<Blob> => {
  const response = await apiClient.post(
    '/collection/facebook-text-file',
    {
      itemIds: selectedItemIds,
    },
    {
      responseType: 'blob',
    }
  );
  return response.data;
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
