/**
 * Bidirectional Search Hook - Hierarchical MongoDB ObjectId Relationships
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md architecture and API analysis recommendations:
 * - Supports Set → Cards and Card → Set + Related Cards
 * - Supports SetProduct → Products and Product → SetProduct + Related Products
 * - Uses MongoDB ObjectId relationships for efficient queries
 * - Auto-population and contextual display
 */

import { useQuery } from '@tanstack/react-query';
import { unifiedApiService } from '../services/UnifiedApiService';
import type { ICard, ISet } from '../domain/models/card';
import type { IProduct, ISetProduct } from '../domain/models/product';

// ========== INTERFACES ==========

interface CardWithContext {
  card: ICard;
  relatedCards: ICard[];
  setInfo: ISet;
}

interface ProductWithContext {
  product: IProduct;
  relatedProducts: IProduct[];
  setProductInfo: ISetProduct;
}

interface BidirectionalSearchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ========== BIDIRECTIONAL SEARCH HOOKS ==========

/**
 * Forward search: Get all cards in a specific set
 */
export const useCardsInSet = (setId: string, query?: string): BidirectionalSearchResult<ICard[]> => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cards-in-set', setId, query],
    queryFn: async () => {
      const response = await unifiedApiService.search.getCardsInSet(setId, query);
      return response.data;
    },
    enabled: !!setId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

/**
 * Reverse search: Get card with its set context and related cards
 */
export const useCardWithContext = (cardId: string): BidirectionalSearchResult<CardWithContext> => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['card-with-context', cardId],
    queryFn: async () => {
      return await unifiedApiService.search.getCardWithContext(cardId);
    },
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes - context doesn't change often
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

/**
 * Forward search: Get all products in a specific set product category
 */
export const useProductsInSetProduct = (setProductId: string, query?: string): BidirectionalSearchResult<IProduct[]> => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products-in-set-product', setProductId, query],
    queryFn: async () => {
      const response = await unifiedApiService.search.getProductsInSetProduct(setProductId, query);
      return response.data;
    },
    enabled: !!setProductId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

/**
 * Reverse search: Get product with its set product context and related products
 */
export const useProductWithContext = (productId: string): BidirectionalSearchResult<ProductWithContext> => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product-with-context', productId],
    queryFn: async () => {
      return await unifiedApiService.search.getProductWithContext(productId);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes - context doesn't change often
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

// ========== ENHANCED HIERARCHICAL SEARCH ==========

/**
 * Smart hierarchical search that handles both forward and reverse lookups
 * Based on the API analysis report recommendations
 */
export const useSmartHierarchicalSearch = () => {
  return {
    // Forward: Set → Cards
    getCardsInSet: (setId: string, query?: string) => 
      useCardsInSet(setId, query),
    
    // Reverse: Card → Set + Related Cards  
    getCardWithContext: (cardId: string) => 
      useCardWithContext(cardId),
    
    // Forward: SetProduct → Products
    getProductsInSetProduct: (setProductId: string, query?: string) => 
      useProductsInSetProduct(setProductId, query),
    
    // Reverse: Product → SetProduct + Related Products
    getProductWithContext: (productId: string) => 
      useProductWithContext(productId),
    
    // Utility: Find all cards in same set as selected card
    findRelatedCards: (cardId: string) => {
      const cardContext = useCardWithContext(cardId);
      return {
        ...cardContext,
        data: cardContext.data?.relatedCards || null,
      };
    },
    
    // Utility: Find all products in same set product as selected product
    findRelatedProducts: (productId: string) => {
      const productContext = useProductWithContext(productId);
      return {
        ...productContext,
        data: productContext.data?.relatedProducts || null,
      };
    },
  };
};

// ========== HELPER HOOKS FOR COMMON PATTERNS ==========

/**
 * Hook for breadcrumb navigation using hierarchical relationships
 */
export const useBreadcrumbNavigation = (itemType: 'card' | 'product', itemId: string) => {
  const cardContext = useCardWithContext(itemType === 'card' ? itemId : '');
  const productContext = useProductWithContext(itemType === 'product' ? itemId : '');
  
  const isCard = itemType === 'card';
  const context = isCard ? cardContext : productContext;
  
  const breadcrumbs = [];
  
  if (context.data && !context.loading && !context.error) {
    if (isCard && cardContext.data) {
      breadcrumbs.push(
        { label: 'Sets', href: '/sets' },
        { 
          label: cardContext.data.setInfo.setName, 
          href: `/sets/${cardContext.data.setInfo._id}` 
        },
        { 
          label: cardContext.data.card.cardName, 
          href: `/cards/${cardContext.data.card._id}`,
          active: true 
        }
      );
    } else if (!isCard && productContext.data) {
      breadcrumbs.push(
        { label: 'Products', href: '/products' },
        { 
          label: productContext.data.setProductInfo.setProductName, 
          href: `/set-products/${productContext.data.setProductInfo._id}` 
        },
        { 
          label: productContext.data.product.productName, 
          href: `/products/${productContext.data.product._id}`,
          active: true 
        }
      );
    }
  }
  
  return {
    breadcrumbs,
    loading: context.loading,
    error: context.error,
  };
};

export default useSmartHierarchicalSearch;