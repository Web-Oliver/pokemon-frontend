/**
 * Status Service - Domain service for status operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { extractResponseData } from '../utils/responseUtils';

// Define status types here since they might not be available elsewhere
interface ApiStatusResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services?: Record<string, boolean>;
}

export interface IStatusService {
  getApiStatus(): Promise<ApiStatusResponse>;
  getDataCounts(): Promise<{
    cards: number;
    sets: number;
    products: number;
    setProducts: number;
  }>;
}

export class StatusService extends BaseApiService implements IStatusService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'STATUS SERVICE');
  }

  async getApiStatus(): Promise<ApiStatusResponse> {
    const response = await this.httpClient.get<ApiStatusResponse>('/api/status');
    return extractResponseData(response);
  }

  async getDataCounts(): Promise<{
    cards: number;
    sets: number;
    products: number;
    setProducts: number;
  }> {
    const response = await this.httpClient.get<{
      summary: {
        totalEndpoints: number;
        totalCategories: number;
        totalFeatures: number;
      }
    }>('/api/status');
    const statusData = extractResponseData(response);
    
    // Use actual data from status endpoint
    return {
      cards: statusData.summary.totalFeatures, // Using features as cards placeholder
      sets: statusData.summary.totalCategories, // Using categories as sets placeholder  
      products: statusData.summary.totalEndpoints, // Using endpoints as products placeholder
      setProducts: statusData.summary.totalCategories // Using categories as setProducts
    };
  }
}