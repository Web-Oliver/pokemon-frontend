/**
 * Test data factory for consistent test data across migration tests
 * Ensures both old and new frontends are tested with identical data
 */

export interface TestPsaCard {
  cardName: string;
  setName: string;
  grade: number;
  price: number;
}

export interface TestRawCard {
  cardName: string;
  setName: string;
  condition: string;
  price: number;
}

export interface TestSealedProduct {
  productName: string;
  setName: string;
  category: string;
  price: number;
}

export interface TestAuction {
  title: string;
  description: string;
  endDate: string;
  items: Array<{
    type: 'psa' | 'raw' | 'sealed';
    id: string;
  }>;
}

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export class TestDataFactory {
  static createTestPsaCard(overrides: Partial<TestPsaCard> = {}): TestPsaCard {
    return {
      cardName: 'Charizard',
      setName: 'Base Set',
      grade: 9,
      price: 500.0,
      ...overrides,
    };
  }

  static createTestRawCard(overrides: Partial<TestRawCard> = {}): TestRawCard {
    return {
      cardName: 'Pikachu',
      setName: 'Base Set',
      condition: 'Near Mint',
      price: 50.0,
      ...overrides,
    };
  }

  static createTestSealedProduct(
    overrides: Partial<TestSealedProduct> = {}
  ): TestSealedProduct {
    return {
      productName: 'Booster Box',
      setName: 'Base Set',
      category: 'Sealed Product',
      price: 1200.0,
      ...overrides,
    };
  }

  static createTestAuction(overrides: Partial<TestAuction> = {}): TestAuction {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    return {
      title: 'Pokemon Collection Auction #1',
      description: 'High-grade Pokemon cards and sealed products',
      endDate: futureDate.toISOString(),
      items: [],
      ...overrides,
    };
  }

  static createTestUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      email: 'test@pokemon.com',
      password: 'TestPassword123!',
      role: 'admin',
      ...overrides,
    };
  }

  // Batch test data for comprehensive testing
  static createCollectionTestData() {
    return {
      psaCards: [
        this.createTestPsaCard({ cardName: 'Charizard', grade: 10 }),
        this.createTestPsaCard({ cardName: 'Blastoise', grade: 9 }),
        this.createTestPsaCard({ cardName: 'Venusaur', grade: 8 }),
      ],
      rawCards: [
        this.createTestRawCard({ cardName: 'Pikachu', condition: 'Mint' }),
        this.createTestRawCard({ cardName: 'Raichu', condition: 'Near Mint' }),
      ],
      sealedProducts: [
        this.createTestSealedProduct({ productName: 'Booster Box' }),
        this.createTestSealedProduct({ productName: 'Elite Trainer Box' }),
      ],
    };
  }

  static createSearchTestData() {
    return {
      sets: [
        { name: 'Base Set', year: 1998 },
        { name: 'Jungle', year: 1999 },
        { name: 'Fossil', year: 1999 },
      ],
      cards: [
        { name: 'Charizard', set: 'Base Set' },
        { name: 'Pikachu', set: 'Base Set' },
        { name: 'Scyther', set: 'Jungle' },
      ],
      products: [
        { name: 'Booster Pack', set: 'Base Set' },
        { name: 'Theme Deck', set: 'Base Set' },
      ],
    };
  }
}

// Helper for generating unique test IDs
export const generateTestId = (prefix = 'test'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper for consistent test timing
export const TestTiming = {
  SHORT_WAIT: 1000, // 1 second
  MEDIUM_WAIT: 3000, // 3 seconds
  LONG_WAIT: 5000, // 5 seconds
  API_TIMEOUT: 10000, // 10 seconds
} as const;
