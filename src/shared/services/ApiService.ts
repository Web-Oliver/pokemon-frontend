/**
 * SIMPLE API SERVICE - RADICAL SIMPLIFICATION
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: 15 API files, 3000+ lines, triple transformation layers
 * AFTER: 1 API file, 200 lines, direct response handling
 */

import { unifiedHttpClient } from './base/UnifiedHttpClient';

// Simple response transformer - single source of truth
const extractData = <T>(response: any): T => {
  if (response?.data) return response.data;
  return response;
};

// Search response format
export interface SearchResponse<T> {
  data: T[];
  count: number;
  success?: boolean;
  query?: string;
}

/**
 * SIMPLIFIED API SERVICE
 * All API operations in one clean service
 */
export class ApiService {
  // ========== SEARCH OPERATIONS ==========
  
  async searchSets(query: string): Promise<SearchResponse<any>> {
    const response = await unifiedHttpClient.get('/search/sets', {
      params: { query },
      skipTransform: true
    });
    return {
      data: response?.data?.sets || [],
      count: response?.data?.total || 0,
      success: true,
      query
    };
  }

  async searchCards(query: string, setId?: string): Promise<SearchResponse<any>> {
    const response = await unifiedHttpClient.get('/search/cards', {
      params: { query, setId },
      skipTransform: true
    });
    return {
      data: response?.data?.cards || [],
      count: response?.data?.total || 0,
      success: true,
      query
    };
  }

  async searchProducts(query: string): Promise<SearchResponse<any>> {
    const response = await unifiedHttpClient.get('/search/products', {
      params: { query },
      skipTransform: true
    });
    return {
      data: response?.data?.products || [],
      count: response?.data?.total || 0,
      success: true,
      query
    };
  }

  async searchSetProducts(query: string): Promise<SearchResponse<any>> {
    const response = await unifiedHttpClient.get('/set-products/search', {
      params: { query },
      skipTransform: true
    });
    return {
      data: response?.data?.setProducts || [],
      count: response?.data?.count || 0,
      success: true,
      query
    };
  }

  // ========== COLLECTION OPERATIONS ==========
  
  async getPsaCards(params?: any): Promise<any[]> {
    return extractData(await unifiedHttpClient.get('/psa-graded-cards', { params }));
  }

  async getRawCards(params?: any): Promise<any[]> {
    return extractData(await unifiedHttpClient.get('/raw-cards', { params }));
  }

  async getSealedProducts(params?: any): Promise<any[]> {
    return extractData(await unifiedHttpClient.get('/sealed-products', { params }));
  }

  async createPsaCard(data: any): Promise<any> {
    return extractData(await unifiedHttpClient.post('/psa-graded-cards', data));
  }

  async createRawCard(data: any): Promise<any> {
    return extractData(await unifiedHttpClient.post('/raw-cards', data));
  }

  async createSealedProduct(data: any): Promise<any> {
    return extractData(await unifiedHttpClient.post('/sealed-products', data));
  }

  async updatePsaCard(id: string, data: any): Promise<any> {
    return extractData(await unifiedHttpClient.put(`/psa-graded-cards/${id}`, data));
  }

  async updateRawCard(id: string, data: any): Promise<any> {
    return extractData(await unifiedHttpClient.put(`/raw-cards/${id}`, data));
  }

  async updateSealedProduct(id: string, data: any): Promise<any> {
    return extractData(await unifiedHttpClient.put(`/sealed-products/${id}`, data));
  }

  async deletePsaCard(id: string): Promise<void> {
    await unifiedHttpClient.delete(`/psa-graded-cards/${id}`);
  }

  async deleteRawCard(id: string): Promise<void> {
    await unifiedHttpClient.delete(`/raw-cards/${id}`);
  }

  async deleteSealedProduct(id: string): Promise<void> {
    await unifiedHttpClient.delete(`/sealed-products/${id}`);
  }

  // ========== AUCTION OPERATIONS ==========
  
  async getAuctions(params?: any): Promise<any[]> {
    return extractData(await unifiedHttpClient.get('/auctions', { params }));
  }

  async getAuctionById(id: string): Promise<any> {
    return extractData(await unifiedHttpClient.getById('/auctions', id));
  }

  async createAuction(data: any): Promise<any> {
    return extractData(await unifiedHttpClient.post('/auctions', data));
  }

  async updateAuction(id: string, data: any): Promise<any> {
    return extractData(await unifiedHttpClient.put(`/auctions/${id}`, data));
  }

  async deleteAuction(id: string): Promise<void> {
    await unifiedHttpClient.delete(`/auctions/${id}`);
  }

  // ========== EXPORT OPERATIONS ==========
  
  async exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob> {
    const endpoint = itemType === 'psaGradedCards' ? '/export/zip/psa-cards'
      : itemType === 'rawCards' ? '/export/zip/raw-cards'
      : '/export/zip/sealed-products';
    
    return await unifiedHttpClient.get(endpoint, { responseType: 'blob' });
  }

  async exportDbaItems(): Promise<Blob> {
    return await unifiedHttpClient.get('/export/dba/download', { responseType: 'blob' });
  }

  // ========== UPLOAD OPERATIONS ==========
  
  async uploadImages(images: File[]): Promise<string[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    
    const response = await unifiedHttpClient.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const uploadedFiles = extractData(response) || [];
    return Array.isArray(uploadedFiles) 
      ? uploadedFiles.map((file: any) => file.path || file.url)
      : [];
  }

  // ========== STATUS OPERATIONS ==========
  
  async getApiStatus(): Promise<any> {
    return extractData(await unifiedHttpClient.get('/status'));
  }
}

// Single instance export
export const apiService = new ApiService();
export default apiService;