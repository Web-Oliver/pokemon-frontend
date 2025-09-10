/**
 * DBA Selection Service - Domain service for DBA selection operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { extractResponseData } from '../utils/responseUtils';

export interface IDbaSelectionService {
  getDbaSelections(params?: {
    active?: boolean;
    expiring?: boolean;
    days?: number;
  }): Promise<any[]>;

  addToDbaSelection(
    items: Array<{
      itemId: string;
      itemType: 'psa' | 'raw' | 'sealed';
      notes?: string;
    }>
  ): Promise<any>;

  removeFromDbaSelection(
    items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>
  ): Promise<any>;
}

export class DbaSelectionService extends BaseApiService implements IDbaSelectionService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'DBA SELECTION SERVICE');
  }

  async getDbaSelections(params?: {
    active?: boolean;
    expiring?: boolean;
    days?: number;
  }): Promise<any[]> {
    const response = await this.httpClient.get<any[]>('/api/dba-selection', { params });
    return extractResponseData(response);
  }

  async addToDbaSelection(
    items: Array<{
      itemId: string;
      itemType: 'psa' | 'raw' | 'sealed';
      notes?: string;
    }>
  ): Promise<any> {
    const response = await this.httpClient.post<any>('/api/dba-selection', { items });
    return extractResponseData(response);
  }

  async removeFromDbaSelection(
    items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>
  ): Promise<any> {
    const response = await this.httpClient.delete<any>('/api/dba-selection', { data: { items } });
    return extractResponseData(response);
  }
}