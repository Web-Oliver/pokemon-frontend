/**
 * Unit Tests for ExportApiService with Ordering
 *
 * Following CLAUDE.md testing principles:
 * - Tests the enhanced export service with ordering capabilities
 * - Tests error handling and recovery scenarios
 * - Tests integration with ordering utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportApiService } from '../ExportApiService';
import {
  OrderedExportRequest,
  ExportRequest,
} from '../../interfaces/api/IExportApiService';
import { CollectionItem } from '../../domain/models/ordering';

// Mock the export API
vi.mock('../../api/exportApi', () => ({
  zipPsaCardImages: vi.fn(),
  zipRawCardImages: vi.fn(),
  zipSealedProductImages: vi.fn(),
  zipAuctionImages: vi.fn(),
  getCollectionFacebookTextFile: vi.fn(),
  exportToDba: vi.fn(),
  downloadBlob: vi.fn(),
}));

// Mock export utilities - Fixed for new API format testing
vi.mock('../../utils/exportUtils', () => ({
  generateExportFilename: vi.fn((config, count) => {
    const ext = config?.extension || 'zip';
    const itemCount = count || 0;
    return `export_${itemCount}_items.${ext}`;
  }),
  generateOrderedExportFilename: vi.fn(
    (config, count, customName, orderInfo) => {
      const ext = config?.extension || 'zip';
      const itemCount = count || 0;
      const name = customName || 'export';
      const sorted = orderInfo?.sorted ? '_ordered' : '';
      return `ordered_${name}_${itemCount}_items${sorted}.${ext}`;
    }
  ),
  getExportConfig: vi.fn((key) => ({
    extension:
      key && key.includes('zip')
        ? 'zip'
        : key && key.includes('json')
          ? 'json'
          : 'txt',
    mimeType:
      key && key.includes('zip')
        ? 'application/zip'
        : key && key.includes('json')
          ? 'application/json'
          : 'text/plain',
  })),
  getExportConfigKey: vi.fn(
    (itemType, format) => `${itemType || 'unknown'}-${format || 'unknown'}`
  ),
  validateExportRequest: vi.fn(() => true), // Default to valid
  prepareItemsForOrderedExport: vi.fn((items, request) => ({
    orderedItems: items || [],
    validation: { exportValid: true, exportError: null },
  })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

import * as exportApi from '../../api/exportApi';
import * as exportUtils from '../../utils/exportUtils';

const mockItems: CollectionItem[] = [
  {
    id: 'psa-1',
    grade: 9,
    myPrice: 500,
    cardId: { cardName: 'Charizard' },
  },
  {
    id: 'psa-2',
    grade: 8,
    myPrice: 300,
    cardId: { cardName: 'Blastoise' },
  },
  {
    id: 'raw-1',
    condition: 'NM',
    myPrice: 200,
    cardId: { cardName: 'Venusaur' },
  },
];

describe('ExportApiService', () => {
  let exportService: ExportApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    exportService = new ExportApiService();
  });

  describe('exportOrdered method', () => {
    const mockOrderedRequest: OrderedExportRequest = {
      itemType: 'psa-card',
      format: 'facebook-text',
      itemIds: ['psa-1', 'psa-2'],
      itemOrder: ['psa-2', 'psa-1'],
      sortByPrice: true,
      sortAscending: false,
    };

    beforeEach(() => {
      (exportUtils.prepareItemsForOrderedExport as any).mockReturnValue({
        orderedItems: mockItems.slice(0, 2).reverse(),
        validation: { exportValid: true },
        orderingApplied: true,
      });
    });

    it('should export items with custom ordering', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const result = await exportService.exportOrdered(
        mockOrderedRequest,
        mockItems
      );

      expect(exportUtils.prepareItemsForOrderedExport).toHaveBeenCalledWith(
        mockItems,
        mockOrderedRequest
      );
      expect(exportApi.getCollectionFacebookTextFile).toHaveBeenCalledWith([
        'psa-2',
        'psa-1',
      ]);
      expect(result.blob).toBe(mockBlob);
      expect(result.metadata.orderingApplied).toBe(true);
      expect(result.metadata.itemOrder).toEqual(['psa-2', 'psa-1']);
    });

    it('should generate ordered filename when ordering is applied', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const expectedFilename = 'ordered_export_2_items_ordered.txt';
      (exportUtils.generateOrderedExportFilename as any).mockReturnValue(
        expectedFilename
      );

      const result = await exportService.exportOrdered(
        mockOrderedRequest,
        mockItems
      );

      expect(exportUtils.generateOrderedExportFilename).toHaveBeenCalledWith(
        expect.any(Object),
        2,
        undefined,
        {
          sorted: true,
          sortByPrice: true,
          ascending: false,
        }
      );
      expect(result.filename).toBe(expectedFilename);
    });

    it('should handle ZIP export with ordering', async () => {
      const zipRequest = { ...mockOrderedRequest, format: 'zip' as const };
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipPsaCardImages as any).mockResolvedValue(mockBlob);

      const result = await exportService.exportOrdered(zipRequest, mockItems);

      expect(exportApi.zipPsaCardImages).toHaveBeenCalledWith([
        'psa-2',
        'psa-1',
      ]);
      expect(result.blob).toBe(mockBlob);
      expect(result.metadata.format).toBe('zip');
    });

    it('should handle DBA export with ordering', async () => {
      const dbaRequest = { ...mockOrderedRequest, format: 'dba' as const };
      const mockDbaResponse = { data: { itemCount: 2 }, success: true };
      (exportApi.exportToDba as any).mockResolvedValue(mockDbaResponse);

      const result = await exportService.exportOrdered(dbaRequest, mockItems);

      expect(exportApi.exportToDba).toHaveBeenCalledWith({
        items: [
          { id: 'psa-2', type: 'mixed' },
          { id: 'psa-1', type: 'mixed' },
        ],
        customDescription: undefined,
        includeMetadata: undefined,
      });
      expect(result.itemCount).toBe(2);
    });

    it('should throw error when validation fails', async () => {
      (exportUtils.prepareItemsForOrderedExport as any).mockReturnValue({
        orderedItems: [],
        validation: {
          exportValid: false,
          exportError: 'Invalid item order',
        },
        orderingApplied: false,
      });

      await expect(
        exportService.exportOrdered(mockOrderedRequest, mockItems)
      ).rejects.toThrow('Invalid item order');
    });

    it('should handle unsupported export format', async () => {
      const invalidRequest = {
        ...mockOrderedRequest,
        format: 'unsupported' as any,
      };

      await expect(
        exportService.exportOrdered(invalidRequest, mockItems)
      ).rejects.toThrow('Unsupported export format: unsupported');
    });

    it('should include metadata about ordering', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const result = await exportService.exportOrdered(
        mockOrderedRequest,
        mockItems
      );

      expect(result.metadata).toMatchObject({
        orderingApplied: true,
        itemOrder: ['psa-2', 'psa-1'],
        sortByPrice: true,
        sortAscending: false,
        orderingValidation: { exportValid: true },
      });
    });

    it('should handle ordering without custom item order', async () => {
      const requestWithoutOrder = {
        ...mockOrderedRequest,
        itemOrder: undefined,
      };

      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const result = await exportService.exportOrdered(
        requestWithoutOrder,
        mockItems
      );

      expect(result.metadata.itemOrder).toBeUndefined();
    });
  });

  describe('regular export method', () => {
    const mockExportRequest: ExportRequest = {
      itemType: 'psa-card',
      format: 'facebook-text',
      itemIds: ['psa-1', 'psa-2'],
    };

    it('should perform regular export without ordering', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const result = await exportService.export(mockExportRequest);

      expect(exportUtils.validateExportRequest).toHaveBeenCalledWith(
        'psa-card',
        'facebook-text',
        ['psa-1', 'psa-2']
      );
      expect(exportApi.getCollectionFacebookTextFile).toHaveBeenCalledWith([
        'psa-1',
        'psa-2',
      ]);
      expect(result.blob).toBe(mockBlob);
    });

    it('should handle ZIP export', async () => {
      const zipRequest = { ...mockExportRequest, format: 'zip' as const };
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipPsaCardImages as any).mockResolvedValue(mockBlob);

      const result = await exportService.export(zipRequest);

      expect(exportApi.zipPsaCardImages).toHaveBeenCalledWith([
        'psa-1',
        'psa-2',
      ]);
      expect(result.blob).toBe(mockBlob);
    });

    it('should handle different item types for ZIP export', async () => {
      const rawCardRequest = {
        ...mockExportRequest,
        format: 'zip' as const,
        itemType: 'raw-card' as const,
      };
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipRawCardImages as any).mockResolvedValue(mockBlob);

      await exportService.export(rawCardRequest);

      expect(exportApi.zipRawCardImages).toHaveBeenCalledWith([
        'psa-1',
        'psa-2',
      ]);
    });

    it('should handle sealed product ZIP export', async () => {
      const sealedRequest = {
        ...mockExportRequest,
        format: 'zip' as const,
        itemType: 'sealed-product' as const,
      };
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipSealedProductImages as any).mockResolvedValue(mockBlob);

      await exportService.export(sealedRequest);

      expect(exportApi.zipSealedProductImages).toHaveBeenCalledWith([
        'psa-1',
        'psa-2',
      ]);
    });

    it('should handle auction ZIP export', async () => {
      const auctionRequest = {
        ...mockExportRequest,
        format: 'zip' as const,
        itemType: 'auction' as const,
      };
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipAuctionImages as any).mockResolvedValue(mockBlob);

      await exportService.export(auctionRequest);

      expect(exportApi.zipAuctionImages).toHaveBeenCalledWith(
        ['psa-1', 'psa-2'][0]
      );
    });
  });

  describe('legacy method support', () => {
    it('should support legacy zipPsaCardImages method', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipPsaCardImages as any).mockResolvedValue(mockBlob);

      const result = await exportService.zipPsaCardImages(['psa-1', 'psa-2']);

      expect(result).toBe(mockBlob);
      expect(exportApi.zipPsaCardImages).toHaveBeenCalledWith([
        'psa-1',
        'psa-2',
      ]);
    });

    it('should support legacy zipRawCardImages method', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipRawCardImages as any).mockResolvedValue(mockBlob);

      const result = await exportService.zipRawCardImages(['raw-1']);

      expect(result).toBe(mockBlob);
      expect(exportApi.zipRawCardImages).toHaveBeenCalledWith(['raw-1']);
    });

    it('should support legacy zipSealedProductImages method', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      (exportApi.zipSealedProductImages as any).mockResolvedValue(mockBlob);

      const result = await exportService.zipSealedProductImages(['sealed-1']);

      expect(result).toBe(mockBlob);
      expect(exportApi.zipSealedProductImages).toHaveBeenCalledWith([
        'sealed-1',
      ]);
    });

    it('should support legacy getCollectionFacebookTextFile method', async () => {
      const mockBlob = new Blob(['text content'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const result = await exportService.getCollectionFacebookTextFile([
        'psa-1',
      ]);

      expect(result).toBe(mockBlob);
      expect(exportApi.getCollectionFacebookTextFile).toHaveBeenCalledWith([
        'psa-1',
      ]);
    });

    it('should support downloadBlob method', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });

      exportService.downloadBlob(mockBlob, 'test.txt');

      expect(exportApi.downloadBlob).toHaveBeenCalledWith(mockBlob, 'test.txt');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      (exportApi.getCollectionFacebookTextFile as any).mockRejectedValue(
        mockError
      );

      const request: ExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1'],
      };

      await expect(exportService.export(request)).rejects.toThrow('API Error');
    });

    it('should handle validation errors in ordered export', async () => {
      (exportUtils.prepareItemsForOrderedExport as any).mockReturnValue({
        orderedItems: [],
        validation: {
          exportValid: false,
          exportError: 'Validation failed',
        },
        orderingApplied: false,
      });

      const request: OrderedExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1'],
      };

      await expect(
        exportService.exportOrdered(request, mockItems)
      ).rejects.toThrow('Validation failed');
    });

    it('should handle unsupported item types in image export', async () => {
      const request: ExportRequest = {
        itemType: 'unsupported' as any,
        format: 'zip',
        itemIds: ['item-1'],
      };

      await expect(exportService.export(request)).rejects.toThrow(
        'Unsupported item type for image export: unsupported'
      );
    });

    it('should handle missing export configuration', async () => {
      (exportUtils.getExportConfig as any).mockReturnValue(null);

      const request: ExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1'],
      };

      // Should not throw, but handle gracefully
      await expect(exportService.export(request)).rejects.toThrow();
    });
  });

  describe('filename generation', () => {
    it('should use custom filename when provided', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const request: ExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1'],
        options: {
          filename: 'custom-export.txt',
        },
      };

      const result = await exportService.export(request);

      expect(result.filename).toBe('custom-export.txt');
    });

    it('should generate default filename when not provided', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      (exportUtils.generateExportFilename as any).mockReturnValue(
        'generated_export_1_items.txt'
      );

      const request: ExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1'],
      };

      const result = await exportService.export(request);

      expect(exportUtils.generateExportFilename).toHaveBeenCalled();
      expect(result.filename).toBe('generated_export_1_items.txt');
    });
  });

  describe('metadata handling', () => {
    it('should include proper metadata in export results', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      const request: ExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1', 'psa-2'],
        options: {
          customDescription: 'Test export',
        },
      };

      const result = await exportService.export(request);

      expect(result.metadata).toMatchObject({
        format: 'facebook-text',
        exportedAt: expect.any(String),
        options: {
          customDescription: 'Test export',
        },
      });
    });

    it('should include ordering metadata in ordered exports', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      (exportApi.getCollectionFacebookTextFile as any).mockResolvedValue(
        mockBlob
      );

      (exportUtils.prepareItemsForOrderedExport as any).mockReturnValue({
        orderedItems: mockItems,
        validation: { exportValid: true },
        orderingApplied: true,
      });

      const request: OrderedExportRequest = {
        itemType: 'psa-card',
        format: 'facebook-text',
        itemIds: ['psa-1', 'psa-2'],
        itemOrder: ['psa-2, psa-1'],
        sortByPrice: true,
      };

      const result = await exportService.exportOrdered(request, mockItems);

      expect(result.metadata).toHaveProperty('orderingApplied', true);
      expect(result.metadata).toHaveProperty('orderingValidation');
      expect(result.metadata).toHaveProperty('sortByPrice', true);
    });
  });
});
