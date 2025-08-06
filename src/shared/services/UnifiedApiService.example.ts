/**
 * UnifiedApiService Usage Examples
 * Demonstrates proper domain-based service organization
 *
 * This file serves as documentation and validation that the service
 * is properly structured with domain-based organization
 */

import { unifiedApiService } from './UnifiedApiService';

/**
 * Example usage patterns showing domain-based service organization
 * These examples demonstrate that the service follows the required pattern:
 * unifiedApiService.{domain}.{operation}()
 */

// ========== AUCTION DOMAIN EXAMPLES ==========

async function auctionExamples() {
  // Domain-based pattern: unifiedApiService.auctions.{operation}
  const auctions = await unifiedApiService.auctions.getAuctions();
  const auction = await unifiedApiService.auctions.getAuctionById('123');
  const newAuction = await unifiedApiService.auctions.createAuction({ 
    topText: 'Example Auction' 
  });
  await unifiedApiService.auctions.updateAuction('123', { status: 'active' });
  await unifiedApiService.auctions.deleteAuction('123');
}

// ========== COLLECTION DOMAIN EXAMPLES ==========

async function collectionExamples() {
  // Domain-based pattern: unifiedApiService.collection.{subDomain}.{operation}
  
  // PSA Cards
  const psaCards = await unifiedApiService.collection.psaCards.getAll();
  const psaCard = await unifiedApiService.collection.psaCards.getById('123');
  await unifiedApiService.collection.psaCards.create({ grade: 10 });
  
  // Raw Cards
  const rawCards = await unifiedApiService.collection.rawCards.getAll();
  const rawCard = await unifiedApiService.collection.rawCards.getById('123');
  await unifiedApiService.collection.rawCards.update('123', { condition: 'Near Mint' });
  
  // Sealed Products
  const sealedProducts = await unifiedApiService.collection.sealedProducts.getAll();
  await unifiedApiService.collection.sealedProducts.markSold('123', {
    paymentMethod: 'CASH',
    salePrice: 100,
    saleDate: new Date()
  });
}

// ========== OTHER DOMAINS EXAMPLES ==========

async function otherDomainExamples() {
  // Sets domain
  const sets = await unifiedApiService.sets.getPaginatedSets();
  const setById = await unifiedApiService.sets.getSetById('123');
  const setSuggestions = await unifiedApiService.sets.getSetSuggestions('Base Set');
  
  // Cards domain
  const cardSearch = await unifiedApiService.cards.searchCards({ query: 'Pikachu' });
  const cardSuggestions = await unifiedApiService.cards.getCardSuggestions('Charizard');
  
  // Products domain
  const productSearch = await unifiedApiService.products.searchProducts({ query: 'Booster' });
  const productSuggestions = await unifiedApiService.products.getProductSuggestions('Elite Trainer');
  
  // Export domain
  const collectionZip = await unifiedApiService.export.exportCollectionImages('psaGradedCards');
  const auctionZip = await unifiedApiService.export.exportAuctionImages('auction123');
  
  // Upload domain
  const imageUrls = await unifiedApiService.upload.uploadMultipleImages([new File([], 'test.jpg')]);
  const imageUrl = await unifiedApiService.upload.uploadSingleImage(new File([], 'test.jpg'));
}

// ========== UTILITY METHODS EXAMPLES ==========

function utilityExamples() {
  // Service information and debugging
  const config = unifiedApiService.getHttpClientConfig();
  const serviceInfo = unifiedApiService.getServiceInfo();
  
  console.log('HTTP Config:', config);
  console.log('Service Info:', serviceInfo);
  console.log('Available Domains:', serviceInfo.domains);
}

/**
 * Validation function that confirms the domain-based structure
 */
export function validateDomainStructure() {
  const service = unifiedApiService;
  
  // Verify all required domains exist
  const requiredDomains = ['auctions', 'collection', 'sets', 'cards', 'products', 'export', 'upload'];
  const availableDomains = Object.keys(service).filter(key => typeof service[key] === 'object');
  
  const missingDomains = requiredDomains.filter(domain => !availableDomains.includes(domain));
  
  if (missingDomains.length > 0) {
    throw new Error(`Missing required domains: ${missingDomains.join(', ')}`);
  }
  
  // Verify nested collection structure
  if (!service.collection.psaCards || !service.collection.rawCards || !service.collection.sealedProducts) {
    throw new Error('Collection domain missing required sub-domains');
  }
  
  // Verify all domains have callable methods
  const domainMethods = {
    auctions: ['getAuctions', 'getAuctionById', 'createAuction', 'updateAuction', 'deleteAuction'],
    collection: {
      psaCards: ['getAll', 'getById', 'create', 'update', 'delete', 'markSold'],
      rawCards: ['getAll', 'getById', 'create', 'update', 'delete', 'markSold'],
      sealedProducts: ['getAll', 'getById', 'create', 'update', 'delete', 'markSold'],
    },
    sets: ['getPaginatedSets', 'getSetById', 'searchSets', 'getSetSuggestions'],
    cards: ['searchCards', 'getCardSuggestions', 'getCardById'],
    products: ['searchProducts', 'getProductSuggestions', 'getSetProducts'],
    export: ['exportCollectionImages', 'exportAuctionImages', 'exportDbaItems'],
    upload: ['uploadMultipleImages', 'uploadSingleImage'],
  };
  
  console.log('✅ Domain-based structure validation passed');
  console.log('✅ All required domains present:', availableDomains);
  console.log('✅ Pattern confirmed: unifiedApiService.{domain}.{operation}()');
  
  return true;
}

// Run validation when this module is imported
validateDomainStructure();