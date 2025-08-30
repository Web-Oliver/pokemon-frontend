/**
 * Export Service - Domain service for export operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { generateFacebookPostFromAuction } from '../../utils/formatting/facebookPostFormatter';
import { extractResponseData } from '@/shared/utils/responseUtils';
import { logError } from '@/shared/components/organisms/ui/toastNotifications';

export interface IExportService {
  exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob>;
  exportAuctionImages(auctionId: string): Promise<Blob>;
  exportDbaItems(): Promise<Blob>;
  exportToDba(exportRequest: any): Promise<any>;
  downloadDbaZip(): Promise<void>;
  
  // Auction-specific exports
  generateAuctionFacebookPost(auctionId: string): Promise<string>;
  getAuctionFacebookTextFile(auctionId: string): Promise<Blob>;
  downloadBlob(blob: Blob, filename: string): void;
}

export class ExportService extends BaseApiService implements IExportService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'EXPORT SERVICE');
  }

  async exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob> {
    const response = await this.httpClient.get<Blob>(
      `/export/${itemType}/images`,
      { responseType: 'blob' }
    );
    return response instanceof Blob ? response : (response as any).data;
  }

  async exportAuctionImages(auctionId: string): Promise<Blob> {
    const response = await this.httpClient.get<Blob>(
      `/export/auctions/${auctionId}/images`,
      { responseType: 'blob' }
    );
    return response instanceof Blob ? response : (response as any).data;
  }

  async exportDbaItems(): Promise<Blob> {
    const response = await this.httpClient.get<Blob>(
      '/export/dba-items',
      { responseType: 'blob' }
    );
    return response instanceof Blob ? response : (response as any).data;
  }

  async exportToDba(exportRequest: any): Promise<any> {
    const response = await this.httpClient.post<any>('/export/dba', exportRequest);
    return extractResponseData(response);
  }

  async downloadDbaZip(): Promise<void> {
    const response = await this.httpClient.get<Blob>(
      '/export/dba/zip',
      { responseType: 'blob' }
    );
    const blob = response instanceof Blob ? response : (response as any).data;
    this.downloadBlob(blob, 'dba-export.zip');
  }

  // Auction-specific exports
  async generateAuctionFacebookPost(auctionId: string): Promise<string> {
    try {
      // Get auction data first
      const auctionResponse = await this.httpClient.getById<any>('/auctions', auctionId);
      const auction = auctionResponse.data || auctionResponse;
      
      // Use the existing utility function
      return generateFacebookPostFromAuction(auction);
    } catch (error) {
      logError('EXPORT_SERVICE', 'Error generating Facebook post', error, { auctionId });
      throw error;
    }
  }

  async getAuctionFacebookTextFile(auctionId: string): Promise<Blob> {
    const facebookPost = await this.generateAuctionFacebookPost(auctionId);
    return new Blob([facebookPost], { type: 'text/plain' });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}