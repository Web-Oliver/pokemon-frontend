/**
 * DBA Selection Service - Domain service for DBA selection operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';

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
    const response = await this.httpClient.get<any[]>('/dba-selections', { params });
    return response.data || response;
  }

  async addToDbaSelection(
    items: Array<{
      itemId: string;
      itemType: 'psa' | 'raw' | 'sealed';
      notes?: string;
    }>
  ): Promise<any> {
    const response = await this.httpClient.post<any>('/dba-selections', { items });
    return response.data || response;
  }

  async removeFromDbaSelection(
    items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>
  ): Promise<any> {
    const response = await this.httpClient.delete<any>('/dba-selections', { data: { items } });
    return response.data || response;
  }
}