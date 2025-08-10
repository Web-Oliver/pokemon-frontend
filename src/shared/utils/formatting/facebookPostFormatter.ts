/**
 * Facebook Post Formatter Utility
 * Layer 1: Core/Foundation (Application-agnostic utilities)
 * Following CLAUDE.md SOLID principles:
 * - SRP: Single responsibility for Facebook post formatting
 * - OCP: Open for extension with new item types
 * - DIP: No dependencies on higher-level modules
 */

import { IAuction } from '../../domain/models/auction';

interface AuctionItem {
  itemCategory: string;
  itemData: any;
}

interface FacebookPostSections {
  sealedProducts: string[];
  psaGradedCards: string[];
  rawCards: string[];
}

/**
 * Format card name with variety
 */
function formatCardName(cardName?: string, cardNumber?: string, variety?: string): string {
  let formatted = cardName || 'Unknown Card';
  if (variety && variety.toLowerCase() !== 'none' && variety.toLowerCase() !== '') {
    formatted += ` ${variety}`;
  }
  return formatted;
}

/**
 * Get shortened set name using common abbreviations
 */
function getShortenedSetName(setName?: string): string {
  if (!setName) return 'Unknown Set';
  
  const shortenings: Record<string, string> = {
    'Pokemon Base Set': 'Base',
    'Pokemon Jungle': 'Jungle',
    'Pokemon Fossil': 'Fossil',
    'Pokemon Team Rocket': 'Rocket',
    'Pokemon Gym Heroes': 'Gym Heroes',
    'Pokemon Gym Challenge': 'Gym Challenge',
    'Pokemon Neo Genesis': 'Neo Genesis',
    'Pokemon Neo Discovery': 'Neo Discovery',
    'Pokemon Neo Destiny': 'Neo Destiny',
    'Pokemon Neo Revelation': 'Neo Revelation',
    'Pokemon Game': 'Base',
    'Pokemon Game Base Ii': 'Base Set 2',
  };
  
  return shortenings[setName] || setName;
}

/**
 * Check if set is Japanese
 */
function isJapaneseSet(setName?: string): boolean {
  if (!setName) return false;
  const lowerName = setName.toLowerCase();
  return lowerName.includes('japanese') || 
         lowerName.includes('japan') || 
         lowerName.includes('jpn');
}

/**
 * Format price in Norwegian Kroner
 */
function formatPrice(price?: number): string {
  return price ? `${Math.round(Number(price))} Kr.` : 'N/A';
}

/**
 * Format sealed product item
 */
function formatSealedProduct(itemData: any): string {
  const productName = itemData.name || itemData.productId?.name || 'Unknown Product';
  const setName = getShortenedSetName(itemData.setName || 'Unknown Set');
  const isJapanese = isJapaneseSet(itemData.setName);
  const price = formatPrice(itemData.myPrice);
  
  return `* ${isJapanese ? 'Japanese ' : ''}${setName} ${productName} Sealed - ${price}`;
}

/**
 * Format PSA graded card item
 */
function formatPsaGradedCard(itemData: any): string {
  const cardName = formatCardName(
    itemData.cardId?.cardName,
    itemData.cardId?.cardNumber,
    itemData.cardId?.variety
  );
  const setName = getShortenedSetName(itemData.cardId?.setId?.setName);
  const isJapanese = isJapaneseSet(itemData.cardId?.setId?.setName);
  const grade = itemData.grade || 'Unknown';
  const price = formatPrice(itemData.myPrice);
  
  return `* ${isJapanese ? 'Japanese ' : ''}${setName} ${cardName} PSA ${grade} - ${price}`;
}

/**
 * Format raw card item
 */
function formatRawCard(itemData: any): string {
  const cardName = formatCardName(
    itemData.cardId?.cardName,
    itemData.cardId?.cardNumber,
    itemData.cardId?.variety
  );
  const setName = getShortenedSetName(itemData.cardId?.setId?.setName);
  const isJapanese = isJapaneseSet(itemData.cardId?.setId?.setName);
  const price = formatPrice(itemData.myPrice);
  
  return `* ${isJapanese ? 'Japanese ' : ''}${setName} ${cardName} - ${price}`;
}

/**
 * Process auction items and categorize them
 */
function processAuctionItems(items: AuctionItem[]): FacebookPostSections {
  const sections: FacebookPostSections = {
    sealedProducts: [],
    psaGradedCards: [],
    rawCards: []
  };

  items.forEach(item => {
    const { itemCategory, itemData } = item;
    if (!itemData) return;

    switch (itemCategory) {
      case 'SealedProduct':
        sections.sealedProducts.push(formatSealedProduct(itemData));
        break;
      case 'PsaGradedCard':
        sections.psaGradedCards.push(formatPsaGradedCard(itemData));
        break;
      case 'RawCard':
        sections.rawCards.push(formatRawCard(itemData));
        break;
    }
  });

  return sections;
}

/**
 * Build final Facebook post from sections
 */
function buildFacebookPost(auction: IAuction, sections: FacebookPostSections): string {
  const postLines: string[] = [];

  // Add header
  if (auction.topText) {
    postLines.push(auction.topText);
    postLines.push('');
  }

  // Add sections in order
  if (sections.sealedProducts.length > 0) {
    postLines.push('🎁 SEALED PRODUCTS:');
    postLines.push(...sections.sealedProducts);
    postLines.push('');
  }

  if (sections.psaGradedCards.length > 0) {
    postLines.push('🏆 PSA CARDS:');
    postLines.push(...sections.psaGradedCards);
    postLines.push('');
  }

  if (sections.rawCards.length > 0) {
    postLines.push('🃏 RAW CARDS:');
    postLines.push(...sections.rawCards);
    postLines.push('');
  }

  // Add footer
  if (auction.bottomText) {
    postLines.push(auction.bottomText);
  }

  return postLines.join('\n');
}

/**
 * Main function to generate Facebook post from auction data
 * Following SRP: Single responsibility for complete Facebook post generation
 */
export function generateFacebookPostFromAuction(auction: IAuction): string {
  const sections = processAuctionItems(auction.items);
  return buildFacebookPost(auction, sections);
}

/**
 * Export individual utility functions for testing and reusability
 */
export {
  formatCardName,
  getShortenedSetName,
  isJapaneseSet,
  formatPrice,
  formatSealedProduct,
  formatPsaGradedCard,
  formatRawCard,
  processAuctionItems,
  buildFacebookPost
};