/**
 * Thin Collection Item Service Layer
 * 
 * Following CLAUDE.md principles:
 * - Thin layer for UI-specific data mapping
 * - Uses UnifiedApiService for actual API calls
 * - Single Responsibility: Simplify collection item operations for UI
 */

import { IPsaGradedCard, IRawCard } from '../../../shared/domain/models/card';
import { ISealedProduct } from '../../../shared/domain/models/sealedProduct';
import { unifiedApiService } from '../../../shared/services/UnifiedApiService';
import { log } from '../../../shared/utils/performance/logger';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;
export type ItemType = 'psa-graded' | 'raw-card' | 'sealed-product';

export interface ItemEditData {
  item: CollectionItem;
  itemType: ItemType;
}

export class CollectionItemService {
  /**
   * Fetch item for editing by URL type and ID
   */
  static async fetchItemForEdit(urlType: string, id: string): Promise<ItemEditData> {
    log(`Fetching ${urlType} item with ID: ${id} for editing`);

    let fetchedItem: CollectionItem;
    let itemType: ItemType;

    switch (urlType) {
      case 'psa':
        fetchedItem = await unifiedApiService.collection.getPsaGradedCardById(id);
        itemType = 'psa-graded';
        break;
      case 'raw':
        fetchedItem = await unifiedApiService.collection.getRawCardById(id);
        itemType = 'raw-card';
        break;
      case 'sealed':
        fetchedItem = await unifiedApiService.collection.getSealedProductById(id);
        itemType = 'sealed-product';
        break;
      default:
        throw new Error(`Unknown item type: ${urlType}`);
    }

    log(`Successfully fetched ${itemType} item:`, fetchedItem);

    return {
      item: fetchedItem,
      itemType,
    };
  }

  /**
   * Parse edit URL to extract item type and ID
   */
  static parseEditUrl(pathname: string): { type: string; id: string } | null {
    if (pathname.startsWith('/collection/edit/')) {
      const pathParts = pathname.split('/');
      if (pathParts.length === 5) {
        const [, , , type, id] = pathParts;
        return { type, id };
      }
    }
    return null;
  }

  /**
   * Determine if current path is in edit mode
   */
  static isEditMode(pathname: string): boolean {
    return pathname.startsWith('/collection/edit/');
  }
}