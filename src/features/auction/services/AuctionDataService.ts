/**
 * Thin Auction Data Service Layer
 * 
 * Following CLAUDE.md principles:
 * - Thin layer for UI-specific data mapping
 * - Uses UnifiedApiService for actual API calls
 * - Single Responsibility: Transform API data for auction UI needs
 */

import { IPsaGradedCard, IRawCard } from '../../../shared/domain/models/card';
import { ISealedProduct } from '../../../shared/domain/models/sealedProduct';
import { unifiedApiService } from '../../../shared/services/UnifiedApiService';
import { processImageUrl } from '../../../shared/utils/helpers/formatting';

// Unified collection item type for auction display
export interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  images?: string[];
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}

export class AuctionDataService {
  /**
   * Fetch all collection items for auction creation
   */
  static async fetchAllCollectionItems(): Promise<{
    psaCards: IPsaGradedCard[];
    rawCards: IRawCard[];
    sealedProducts: ISealedProduct[];
  }> {
    const [psaCards, rawCards, sealedProducts] = await Promise.all([
      unifiedApiService.collection.getPsaGradedCards(),
      unifiedApiService.collection.getRawCards(),
      unifiedApiService.collection.getSealedProducts(),
    ]);

    return { psaCards, rawCards, sealedProducts };
  }

  /**
   * Transform collection items into unified format for auction display
   */
  static transformToUnifiedItems(
    psaCards: IPsaGradedCard[],
    rawCards: IRawCard[],
    sealedProducts: ISealedProduct[]
  ): UnifiedCollectionItem[] {
    const items: UnifiedCollectionItem[] = [];

    // Transform PSA Graded Cards
    psaCards
      .filter((card) => !card.sold)
      .forEach((card) => {
        const transformedItem = this.transformPsaCard(card);
        items.push(transformedItem);
      });

    // Transform Raw Cards
    rawCards
      .filter((card) => !card.sold)
      .forEach((card) => {
        const transformedItem = this.transformRawCard(card);
        items.push(transformedItem);
      });

    // Transform Sealed Products
    sealedProducts
      .filter((product) => !product.sold)
      .forEach((product) => {
        const transformedItem = this.transformSealedProduct(product);
        items.push(transformedItem);
      });

    return items;
  }

  /**
   * Transform PSA Graded Card for display
   */
  private static transformPsaCard(card: IPsaGradedCard): UnifiedCollectionItem {
    // Access nested cardId object for card details (populated by backend)
    const cardData = (card as any).cardId || card;
    const setData = cardData?.setId || cardData?.set;

    const cardName = this.extractCardName(cardData);
    const setName = this.extractSetName(setData, cardData);
    const variety = cardData?.variety || '';
    const pokemonNumber = cardData?.pokemonNumber || '';

    // Build display name
    const displayName = this.buildDisplayName(cardName, variety, pokemonNumber, `PSA ${card.grade}`);

    // Process images
    const processedImages = (card.images || [])
      .map((img) => processImageUrl(img))
      .filter(Boolean) as string[];

    return {
      id: card.id,
      itemType: 'PsaGradedCard',
      displayName,
      displayPrice: Number(card.myPrice) || 0,
      displayImage: processedImages[0],
      images: processedImages,
      setName,
      grade: card.grade.toString(),
      originalItem: card,
    };
  }

  /**
   * Transform Raw Card for display
   */
  private static transformRawCard(card: IRawCard): UnifiedCollectionItem {
    const cardData = (card as any).cardId || card;
    const setData = cardData?.setId || cardData?.set;

    const cardName = this.extractCardName(cardData);
    const setName = this.extractSetName(setData, cardData);
    const variety = cardData?.variety || '';
    const pokemonNumber = cardData?.pokemonNumber || '';

    // Build display name
    const displayName = this.buildDisplayName(cardName, variety, pokemonNumber, card.condition);

    // Process images
    const processedImages = (card.images || [])
      .map((img) => processImageUrl(img))
      .filter(Boolean) as string[];

    return {
      id: card.id,
      itemType: 'RawCard',
      displayName,
      displayPrice: Number(card.myPrice) || 0,
      displayImage: processedImages[0],
      images: processedImages,
      setName,
      condition: card.condition,
      originalItem: card,
    };
  }

  /**
   * Transform Sealed Product for display
   */
  private static transformSealedProduct(product: ISealedProduct): UnifiedCollectionItem {
    const displayName = `${product.setName || 'Unknown Set'} - ${product.name || 'Unknown Product'}`;

    // Process images
    const processedImages = (product.images || [])
      .map((img) => processImageUrl(img))
      .filter(Boolean) as string[];

    return {
      id: product.id,
      itemType: 'SealedProduct',
      displayName,
      displayPrice: Number(product.myPrice) || 0,
      displayImage: processedImages[0],
      images: processedImages,
      setName: product.setName,
      category: product.category,
      originalItem: product,
    };
  }

  /**
   * Extract card name from card data
   */
  private static extractCardName(cardData: any): string {
    if (cardData?.cardName) {
      return cardData.cardName;
    } else if (cardData?.baseName) {
      return cardData.baseName;
    } else if (cardData?.pokemonNumber) {
      return `Card #${cardData.pokemonNumber}`;
    }
    return 'Unknown Card';
  }

  /**
   * Extract set name from set data or card data
   */
  private static extractSetName(setData: any, cardData: any): string {
    if (setData?.setName) {
      return setData.setName;
    } else if (cardData?.setName) {
      return cardData.setName;
    }
    return 'Unknown Set';
  }

  /**
   * Build clean display name
   */
  private static buildDisplayName(
    cardName: string,
    variety: string,
    pokemonNumber: string,
    suffix: string
  ): string {
    // Clean card name
    const cleanCardName = cardName
      .replace(/^2025\s+/gi, '')
      .replace(/Japanese Pokemon Japanese\s+/gi, 'Japanese ')
      .replace(/Pokemon Japanese\s+/gi, 'Japanese ')
      .replace(/Japanese\s+Japanese\s+/gi, 'Japanese ')
      .replace(/\s+/g, ' ')
      .trim();

    let displayName = cleanCardName;

    // Add variety if not already included
    if (variety && !displayName.includes(variety)) {
      displayName = `${displayName} (${variety})`;
    }

    // Handle unknown cards with pokemon number
    if (pokemonNumber && cleanCardName === 'Unknown Card') {
      displayName = `#${pokemonNumber}`;
    }

    // Add suffix (grade or condition)
    displayName = `${displayName} - ${suffix}`;

    return displayName;
  }
}