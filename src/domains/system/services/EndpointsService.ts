/**
 * Status Service - SOLID/DRY Implementation
 * Service for fetching API status and endpoint documentation from the backend
 * Following CLAUDE.md principles for unified service architecture
 */

import { BaseCrudService } from '@/shared/services/crud/BaseCrudService';
import { extractResponseData } from '@/shared/services/utils/responseUtils';

export interface SystemInfo {
  name: string;
  version: string;
  description: string;
  features: string[];
  architecture: {
    framework: string;
    database: string;
    search: string;
    ocr: string;
    caching: string;
    patterns: string[];
  };
}

export interface EndpointCategory {
  [endpoint: string]: string;
}

export interface StatusResponse {
  system: SystemInfo;
  endpoints: Record<string, EndpointCategory>;
  categories: Record<string, string[]>;
  summary: {
    totalEndpoints: number;
    totalCategories: number;
    totalFeatures: number;
  };
  timestamp: string;
}

/**
 * StatusService - Extends BaseCrudService following SOLID principles
 * Single Responsibility: Handle API status and endpoint documentation
 * Open/Closed: Extensible through BaseCrudService patterns
 * DRY: Leverages existing service infrastructure
 */
class StatusService extends BaseCrudService<StatusResponse> {
  protected endpoint = '/api/status';

  /**
   * Get complete API status and endpoints documentation
   * Uses centralized response handling from responseUtils
   */
  async getApiStatus(): Promise<StatusResponse> {
    try {
      const response = await this.apiService.get<StatusResponse>(this.endpoint);
      return extractResponseData(response);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
      throw error;
    }
  }

  /**
   * Get endpoints documentation (alternative endpoint)
   * Fallback method for comprehensive endpoint docs
   */
  async getEndpointsDocumentation(): Promise<any> {
    try {
      const response = await this.apiService.get<any>('/api/endpoints');
      return extractResponseData(response);
    } catch (error) {
      console.error('Failed to fetch endpoints documentation:', error);
      throw error;
    }
  }

  /**
   * Get endpoints by category
   */
  async getEndpointsByCategory(category: string): Promise<any> {
    try {
      const response = await this.apiService.get<any>(`/api/endpoints/category/${category}`);
      return extractResponseData(response);
    } catch (error) {
      console.error(`Failed to fetch endpoints for category ${category}:`, error);
      throw error;
    }
  }
}

export const statusService = new StatusService();