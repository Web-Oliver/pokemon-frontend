/**
 * Export API Integration Tests
 * Phase 10.1 & 10.2 - Test suite for export functionality
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as exportApi from './exportApi';
import apiClient from './apiClient';

// Mock the apiClient
vi.mock('./apiClient');

describe('Export API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Facebook Post Generation', () => {
    test('should generate Facebook post for auction', async () => {
      const mockPostText =
        'Check out this amazing Pokemon auction! 🎯\n\nItems include:\n- Charizard PSA 10\n- Blastoise PSA 9\n\nStarting soon!';

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          success: true,
          data: mockPostText,
        },
      });

      const result = await exportApi.generateAuctionFacebookPost('auction123');

      expect(apiClient.post).toHaveBeenCalledWith('/auctions/auction123/generate-facebook-post');
      expect(result).toBe(mockPostText);
    });

    test('should handle different response formats', async () => {
      const mockPostText = 'Another auction post format';

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          post: mockPostText,
        },
      });

      const result = await exportApi.generateAuctionFacebookPost('auction456');
      expect(result).toBe(mockPostText);
    });

    test('should handle direct string response', async () => {
      const mockPostText = 'Direct string response';

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockPostText,
      });

      const result = await exportApi.generateAuctionFacebookPost('auction789');
      expect(result).toBe(mockPostText);
    });
  });

  describe('File Downloads', () => {
    test('should get auction Facebook text file', async () => {
      const mockBlob = new Blob(['Facebook post content'], { type: 'text/plain' });

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBlob,
      });

      const result = await exportApi.getAuctionFacebookTextFile('auction123');

      expect(apiClient.get).toHaveBeenCalledWith('/auctions/auction123/facebook-text-file', {
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    test('should zip auction images', async () => {
      const mockZipBlob = new Blob(['zip file content'], { type: 'application/zip' });

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockZipBlob,
      });

      const result = await exportApi.zipAuctionImages('auction123');

      expect(apiClient.get).toHaveBeenCalledWith('/auctions/auction123/zip-images', {
        responseType: 'blob',
      });
      expect(result).toBe(mockZipBlob);
    });

    test('should get collection Facebook text file', async () => {
      const mockBlob = new Blob(['Collection post content'], { type: 'text/plain' });
      const selectedItemIds = ['item1', 'item2', 'item3'];

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBlob,
      });

      const result = await exportApi.getCollectionFacebookTextFile(selectedItemIds);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/collection/facebook-text-file',
        {
          itemIds: selectedItemIds,
        },
        {
          responseType: 'blob',
        }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe('Download Utility', () => {
    test('should trigger file download', () => {
      // Mock DOM APIs
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      // Setup global mocks
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock createElement to return our mock link
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';

      exportApi.downloadBlob(mockBlob, filename);

      // Verify the download process
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe(filename);
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors for Facebook post generation', async () => {
      const mockError = new Error('API Error');
      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(exportApi.generateAuctionFacebookPost('auction123')).rejects.toThrow(
        'API Error'
      );
    });

    test('should handle API errors for file downloads', async () => {
      const mockError = new Error('Download Error');
      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(exportApi.getAuctionFacebookTextFile('auction123')).rejects.toThrow(
        'Download Error'
      );
      await expect(exportApi.zipAuctionImages('auction123')).rejects.toThrow('Download Error');
    });

    test('should handle API errors for collection text file', async () => {
      const mockError = new Error('Collection Error');
      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(exportApi.getCollectionFacebookTextFile(['item1'])).rejects.toThrow(
        'Collection Error'
      );
    });
  });
});
