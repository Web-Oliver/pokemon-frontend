/**
 * Upload Service - Domain service for upload operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';

export interface IUploadService {
  uploadMultipleImages(images: File[]): Promise<string[]>;
  uploadSingleImage(image: File): Promise<string>;
}

export class UploadService extends BaseApiService implements IUploadService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'UPLOAD SERVICE');
  }

  async uploadMultipleImages(images: File[]): Promise<string[]> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const response = await this.httpClient.post<{ urls: string[] }>('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data || response;
    return data.urls || [];
  }

  async uploadSingleImage(image: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await this.httpClient.post<{ url: string }>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data || response;
    return data.url || '';
  }
}