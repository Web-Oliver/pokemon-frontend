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
import {
  CollectionItemType,
  CollectionItemUrlType,
  ItemEditData,
  urlTypeToInternalType,
} from '../../../shared/types/collectionDisplayTypes';

export class CollectionItemService {
  /**
   * Fetch item for editing by URL type and ID
   */
  static async fetchItemForEdit(
    urlType: CollectionItemUrlType,
    id: string
  ): Promise<ItemEditData> {
    log(`Fetching ${urlType} item with ID: ${id} for editing`);

    let fetchedItem: IPsaGradedCard | IRawCard | ISealedProduct;
    const itemType: CollectionItemType = urlTypeToInternalType(urlType);

    switch (urlType) {
      case 'psa':
        fetchedItem =
          await unifiedApiService.collection.getPsaGradedCardById(id);
        break;
      case 'raw':
        fetchedItem = await unifiedApiService.collection.getRawCardById(id);
        break;
      case 'sealed':
        fetchedItem =
          await unifiedApiService.collection.getSealedProductById(id);
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
  static parseEditUrl(
    pathname: string
  ): { type: CollectionItemUrlType; id: string } | null {
    if (pathname.startsWith('/collection/edit/')) {
      const pathParts = pathname.split('/');
      if (pathParts.length === 5) {
        const [, , , type, id] = pathParts;
        return { type: type as CollectionItemUrlType, id };
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
