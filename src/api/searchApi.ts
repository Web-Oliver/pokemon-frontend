import apiClient from './apiClient';

export interface SearchResult {
  success: boolean;
  type: 'sets' | 'cards' | 'products' | 'categories';
  query: string;
  setContext?: string;
  categoryContext?: string;
  results: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];
  count: number;
}

export interface SetResult {
  setName: string;
  year?: number;
  score: number;
  source: 'cards' | 'products';
  isExactMatch: boolean;
}

export interface CardResult {
  _id: string;
  cardName: string;
  baseName: string;
  variety?: string;
  pokemonNumber?: string;
  setInfo?: {
    setName: string;
    year?: number;
  };
}

export interface ProductResult {
  _id: string;
  name: string;
  setName?: string;
  category: string;
  available: boolean;
  price: number;
  setInfo?: {
    setName: string;
  };
  categoryInfo?: {
    category: string;
  };
}

export interface CategoryResult {
  category: string;
  productCount: number;
  isExactMatch: boolean;
}

export const searchApi = {
  /**
   * Unified hierarchical search endpoint
   */
  async search(params: {
    type: 'sets' | 'cards' | 'products' | 'categories';
    q: string;
    setContext?: string;
    categoryContext?: string;
    limit?: number;
  }): Promise<SearchResult> {
    const { type, q, setContext, categoryContext, limit = 10 } = params;

    console.log(`[SEARCH API DEBUG] search() called with params:`, params);

    const queryParams = new URLSearchParams({
      type,
      q,
      limit: limit.toString(),
    });

    if (setContext) {
      queryParams.append('setContext', setContext);
      console.log(`[SEARCH API DEBUG] Added setContext: ${setContext}`);
    }

    if (categoryContext) {
      queryParams.append('categoryContext', categoryContext);
      console.log(`[SEARCH API DEBUG] Added categoryContext: ${categoryContext}`);
    }

    const url = `/search?${queryParams.toString()}`;
    console.log(`[SEARCH API DEBUG] Making request to: ${url}`);

    try {
      const response = await apiClient.get(url);
      console.log(`[SEARCH API DEBUG] API response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[SEARCH API DEBUG] API error:`, error);
      throw error;
    }
  },

  /**
   * Search for sets (first step in hierarchical search)
   */
  async searchSets(query: string, limit: number = 10): Promise<SetResult[]> {
    console.log(`[SEARCH API DEBUG] searchSets() called:`, { query, limit });
    const result = await this.search({
      type: 'sets',
      q: query,
      limit,
    });
    console.log(`[SEARCH API DEBUG] searchSets() returning:`, result.results);
    return result.results;
  },

  /**
   * Search for cards (optionally filtered by set)
   */
  async searchCards(
    query: string,
    setContext?: string,
    categoryContext?: string,
    limit: number = 10
  ): Promise<CardResult[]> {
    console.log(`[SEARCH API DEBUG] searchCards() called:`, {
      query,
      setContext,
      categoryContext,
      limit,
    });
    const result = await this.search({
      type: 'cards',
      q: query,
      setContext,
      categoryContext,
      limit,
    });
    console.log(`[SEARCH API DEBUG] searchCards() returning:`, result.results);
    return result.results;
  },

  /**
   * Search for products (optionally filtered by set and/or category)
   */
  async searchProducts(
    query: string,
    setContext?: string,
    categoryContext?: string,
    limit: number = 10
  ): Promise<ProductResult[]> {
    console.log(`[SEARCH API DEBUG] searchProducts() called:`, {
      query,
      setContext,
      categoryContext,
      limit,
    });
    const result = await this.search({
      type: 'products',
      q: query,
      setContext,
      categoryContext,
      limit,
    });
    console.log(`[SEARCH API DEBUG] searchProducts() returning:`, result.results);
    return result.results;
  },

  /**
   * Search for product categories
   */
  async searchCategories(query: string, limit: number = 10): Promise<CategoryResult[]> {
    console.log(`[SEARCH API DEBUG] searchCategories() called:`, { query, limit });
    const result = await this.search({
      type: 'categories',
      q: query,
      limit,
    });
    console.log(`[SEARCH API DEBUG] searchCategories() returning:`, result.results);
    return result.results;
  },
};

/**
 * Get all available product categories from the backend (actual enum values)
 */
export const getProductCategories = async (): Promise<Array<{value: string, label: string}>> => {
  try {
    // Use the actual backend enum categories from SealedProduct model
    return [
      { value: 'Blisters', label: 'Blisters' },
      { value: 'Booster-Boxes', label: 'Booster Boxes' },
      { value: 'Boosters', label: 'Booster Packs' },
      { value: 'Box-Sets', label: 'Box Sets' },
      { value: 'Elite-Trainer-Boxes', label: 'Elite Trainer Boxes' },
      { value: 'Theme-Decks', label: 'Theme Decks' },
      { value: 'Tins', label: 'Tins' },
      { value: 'Trainer-Kits', label: 'Trainer Kits' },
    ];
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    // Fallback to the same categories if API fails
    return [
      { value: 'Blisters', label: 'Blisters' },
      { value: 'Booster-Boxes', label: 'Booster Boxes' },
      { value: 'Boosters', label: 'Booster Packs' },
      { value: 'Box-Sets', label: 'Box Sets' },
      { value: 'Elite-Trainer-Boxes', label: 'Elite Trainer Boxes' },
      { value: 'Theme-Decks', label: 'Theme Decks' },
      { value: 'Tins', label: 'Tins' },
      { value: 'Trainer-Kits', label: 'Trainer Kits' },
    ];
  }
};

/**
 * Get all available availability options (availability is a NUMBER in backend)
 */
export const getAvailabilityOptions = async (): Promise<Array<{value: number, label: string}>> => {
  try {
    // Availability is stored as a number in the backend
    return [
      { value: 0, label: 'Out of Stock' },
      { value: 1, label: 'Low Stock (1)' },
      { value: 5, label: 'Medium Stock (5)' },
      { value: 10, label: 'High Stock (10+)' },
    ];
  } catch (error) {
    console.error('Failed to fetch availability options:', error);
    return [
      { value: 0, label: 'Out of Stock' },
      { value: 1, label: 'Low Stock (1)' },
      { value: 5, label: 'Medium Stock (5)' },
      { value: 10, label: 'High Stock (10+)' },
    ];
  }
};
