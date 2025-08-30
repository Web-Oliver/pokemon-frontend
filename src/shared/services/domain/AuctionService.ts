/**
 * Auction Service - Domain service for auction operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { IAuction } from '../../domain/models/auction';
import { extractResponseData } from '@/shared/utils/responseUtils';

// Import types from UnifiedApiService
export interface AuctionsParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
}

export interface AddItemToAuctionData {
  itemId: string;
  itemCategory: string;
  startingPrice?: number;
}

export interface IAuctionService {
  getAuctions(params?: AuctionsParams): Promise<IAuction[]>;
  getAuctionById(id: string): Promise<IAuction>;
  createAuction(auctionData: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction>;
  deleteAuction(id: string): Promise<void>;
  addItemToAuction(id: string, itemData: AddItemToAuctionData): Promise<IAuction>;
  removeItemFromAuction(id: string, itemId: string, body?: any): Promise<IAuction>;
  markAuctionItemSold(id: string, saleData: { itemId: string; itemCategory: string; soldPrice: number }): Promise<IAuction>;
}

export class AuctionService extends BaseApiService implements IAuctionService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'AUCTION SERVICE');
  }

  async getAuctions(params?: AuctionsParams): Promise<IAuction[]> {
    const queryParams = params || {};
    const response = await this.httpClient.get<IAuction[]>('/auctions', {
      params: queryParams,
    });
    return extractResponseData(response);
  }

  async getAuctionById(id: string): Promise<IAuction> {
    return await this.httpClient.getById<IAuction>('/auctions', id);
  }

  async createAuction(auctionData: Partial<IAuction>): Promise<IAuction> {
    const response = await this.httpClient.post<IAuction>('/auctions', auctionData);
    return extractResponseData(response);
  }

  async updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction> {
    const response = await this.httpClient.put<IAuction>(`/auctions/${id}`, auctionData);
    return extractResponseData(response);
  }

  async deleteAuction(id: string): Promise<void> {
    await this.httpClient.delete(`/auctions/${id}`);
  }

  async addItemToAuction(id: string, itemData: AddItemToAuctionData): Promise<IAuction> {
    const response = await this.httpClient.post<IAuction>(`/auctions/${id}/items`, itemData);
    return extractResponseData(response);
  }

  async removeItemFromAuction(id: string, itemId: string, body?: any): Promise<IAuction> {
    const response = await this.httpClient.delete<IAuction>(
      `/auctions/${id}/items/${itemId}`,
      { data: body }
    );
    return extractResponseData(response);
  }

  async markAuctionItemSold(id: string, saleData: { itemId: string; itemCategory: string; soldPrice: number }): Promise<IAuction> {
    const response = await this.httpClient.put<IAuction>(`/auctions/${id}/items/sold`, saleData);
    return extractResponseData(response);
  }
}