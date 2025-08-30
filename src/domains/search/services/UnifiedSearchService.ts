/**
 * Unified Search Service - Mirrors backend multi-engine search architecture
 * Implements parallel search execution and result combination matching backend patterns
 */

import { BaseCrudService } from '@/shared/services/BaseCrudService';
import { 
  UnifiedSearchParams, 
  UnifiedSearchResults, 
  SearchResponse,
  ApiResponse
} from '@/domains/system/types/ApiTypes';
import { ErrorFactory } from '@/domains/system/services/ErrorFactory';
import { extractFullApiResponse } from '@/shared/services/utils/responseUtils';

export class UnifiedSearchService extends BaseCrudService<any> {
  protected endpoint = '/api/search';

  /**
   * Unified search across multiple entity types - matches backend exactly
   * GET /api/search/?query=charizard&types=cards,products,sets&limit=20
   */
  async unifiedSearch(params: UnifiedSearchParams): Promise<UnifiedSearchResults> {
    try {
      const searchParams = this.buildSearchParams(params);
      const response = await this.client.get(this.endpoint, { params: searchParams });
      
      return this.processUnifiedSearchResponse(response, params);
    } catch (error) {
      throw ErrorFactory.createSearchError(params.query, 'unified', {
        searchTypes: params.types,
        filters: params.filters
      });
    }
  }

  /**
   * Entity-specific search with hierarchical filtering
   * Mirrors backend entity-specific endpoints
   */
  async searchCards(
    query: string, 
    filters: { setId?: string; minPrice?: number; maxPrice?: number } = {},
    options: { limit?: number; page?: number } = {}
  ): Promise<SearchResponse<any>> {
    try {
      const response = await this.client.get('/api/search/cards', {
        params: { query, ...filters, ...options }
      });
      
      return this.processSearchResponse(response, 'cards', query);
    } catch (error) {
      throw ErrorFactory.createSearchError(query, 'cards', { filters, options });
    }
  }

  async searchProducts(
    query: string,
    filters: { category?: string; minPrice?: number; maxPrice?: number } = {},
    options: { limit?: number; page?: number } = {}
  ): Promise<SearchResponse<any>> {
    try {
      const response = await this.client.get('/api/search/products', {
        params: { query, ...filters, ...options }
      });
      
      return this.processSearchResponse(response, 'products', query);
    } catch (error) {
      throw ErrorFactory.createSearchError(query, 'products', { filters, options });
    }
  }

  async searchSets(
    query: string,
    filters: { year?: number; minPsaPopulation?: number } = {},
    options: { limit?: number; page?: number } = {}
  ): Promise<SearchResponse<any>> {
    try {
      const response = await this.client.get('/api/search/sets', {
        params: { query, ...filters, ...options }
      });
      
      return this.processSearchResponse(response, 'sets', query);
    } catch (error) {
      throw ErrorFactory.createSearchError(query, 'sets', { filters, options });
    }
  }

  /**
   * Relationship-based search matching backend patterns
   */
  async findRelatedCards(cardId: string): Promise<SearchResponse<any>> {
    try {
      const response = await this.client.get(`/api/search/cards/${cardId}/related`);
      return this.processSearchResponse(response, 'related-cards', cardId);
    } catch (error) {
      throw ErrorFactory.createSearchError(cardId, 'related-cards');
    }
  }

  async findRelatedProducts(productId: string): Promise<SearchResponse<any>> {
    try {
      const response = await this.client.get(`/api/search/products/${productId}/related`);
      return this.processSearchResponse(response, 'related-products', productId);
    } catch (error) {
      throw ErrorFactory.createSearchError(productId, 'related-products');
    }
  }

  /**
   * Search utilities matching backend endpoints
   */
  async getSearchSuggestions(
    query: string, 
    limit: number = 10
  ): Promise<{ suggestions: string[]; meta: any }> {
    try {
      const response = await this.client.get('/api/search/suggest', {
        params: { query, limit }
      });
      
      const fullResponse = extractFullApiResponse(response);
      return {
        suggestions: fullResponse.data || [],
        meta: fullResponse.meta
      };
    } catch (error) {
      throw ErrorFactory.createSearchError(query, 'suggestions', { limit });
    }
  }

  async getSearchTypes(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/search/types');
      const fullResponse = extractFullApiResponse<string[]>(response);
      return fullResponse.data;
    } catch (error) {
      throw ErrorFactory.createSearchError('', 'types');
    }
  }

  async getSearchStats(): Promise<any> {
    try {
      const response = await this.client.get('/api/search/stats');
      const fullResponse = extractFullApiResponse(response);
      return fullResponse.data;
    } catch (error) {
      throw ErrorFactory.createSearchError('', 'stats');
    }
  }

  /**
   * Advanced search with complex filters
   */
  async advancedSearch(searchConfig: {
    queries: { type: string; query: string; weight?: number }[];
    globalFilters?: Record<string, any>;
    sorting?: { field: string; direction: 'asc' | 'desc' }[];
    limit?: number;
    page?: number;
  }): Promise<UnifiedSearchResults> {
    try {
      const response = await this.client.post('/api/search/advanced', searchConfig);
      return this.processUnifiedSearchResponse(response, {
        query: searchConfig.queries.map(q => q.query).join(' '),
        types: searchConfig.queries.map(q => q.type) as any[]
      });
    } catch (error) {
      throw ErrorFactory.createSearchError(
        JSON.stringify(searchConfig.queries), 
        'advanced',
        { config: searchConfig }
      );
    }
  }

  /**
   * Build search parameters matching backend format
   */
  private buildSearchParams(params: UnifiedSearchParams): Record<string, any> {
    const searchParams: Record<string, any> = {
      query: params.query
    };

    if (params.types && params.types.length > 0) {
      searchParams.types = params.types.join(',');
    }

    if (params.limit) {
      searchParams.limit = params.limit;
    }

    if (params.page) {
      searchParams.page = params.page;
    }

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value;
        }
      });
    }

    return searchParams;
  }

  /**
   * Process unified search response matching backend format
   */
  private processUnifiedSearchResponse(
    response: any, 
    originalParams: Partial<UnifiedSearchParams>
  ): UnifiedSearchResults {
    const fullResponse = extractFullApiResponse(response);
    
    // Handle backend unified search response format
    const results = fullResponse.data?.results || {};
    
    return {
      results: {
        cards: results.cards ? this.formatSearchResponse(results.cards, 'cards', originalParams.query) : undefined,
        products: results.products ? this.formatSearchResponse(results.products, 'products', originalParams.query) : undefined,
        sets: results.sets ? this.formatSearchResponse(results.sets, 'sets', originalParams.query) : undefined
      },
      meta: {
        ...fullResponse.meta,
        totalResults: this.calculateTotalResults(results),
        searchTime: fullResponse.meta.processingTime || 0,
        engines: this.extractEngines(results)
      }
    };
  }

  /**
   * Process individual search response
   */
  private processSearchResponse(response: any, type: string, query: string): SearchResponse<any> {
    const fullResponse = extractFullApiResponse(response);
    return this.formatSearchResponse(fullResponse.data, type, query, fullResponse.meta, fullResponse.pagination);
  }

  /**
   * Format search response to match interface
   */
  private formatSearchResponse(
    data: any,
    type: string,
    query?: string,
    meta?: any,
    pagination?: any
  ): SearchResponse<any> {
    const results = Array.isArray(data) ? data : data?.data || [];
    
    return {
      data: results,
      count: data?.count || data?.total || results.length,
      success: data?.success !== false,
      query: query || '',
      meta,
      pagination,
      searchMetrics: meta?.metrics ? {
        searchTime: meta.processingTime || 0,
        totalResults: results.length,
        engines: [type],
        relevanceScores: results.map(() => Math.random() * 0.3 + 0.7) // Placeholder
      } : undefined
    };
  }

  /**
   * Helper methods for processing unified results
   */
  private calculateTotalResults(results: Record<string, any>): number {
    return Object.values(results).reduce((total, result: any) => {
      return total + (result?.count || result?.data?.length || 0);
    }, 0);
  }

  private extractEngines(results: Record<string, any>): string[] {
    return Object.keys(results).filter(key => results[key] && (results[key].count > 0 || results[key].data?.length > 0));
  }

  /**
   * Cache management for search results
   */
  async clearSearchCache(): Promise<void> {
    try {
      await this.client.post('/api/search/cache/clear');
    } catch (error) {
      console.warn('Failed to clear search cache:', error);
    }
  }

  /**
   * Search analytics and monitoring
   */
  async logSearchEvent(
    query: string, 
    type: string, 
    resultCount: number, 
    searchTime: number
  ): Promise<void> {
    try {
      await this.client.post('/api/search/analytics', {
        query,
        type,
        resultCount,
        searchTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log search event:', error);
    }
  }
}