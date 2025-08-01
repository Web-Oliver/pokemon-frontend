/**
 * Test Setup Configuration
 *
 * Following CLAUDE.md testing principles:
 * - Global test environment setup
 * - Mock configuration for external dependencies
 * - Testing utilities and custom matchers
 */

import { afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver globally
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver globally
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock URL.createObjectURL and URL.revokeObjectURL for blob testing
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock performance.now for consistent timing in tests
global.performance.now = vi.fn(() => Date.now());

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9012'),
  },
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// Mock File and FileList for file upload testing
global.File = class File {
  constructor(
    public chunks: BlobPart[],
    public name: string,
    public options: FilePropertyBag = {}
  ) {}

  get size() {
    return 1024;
  }
  get type() {
    return this.options.type || '';
  }
  get lastModified() {
    return this.options.lastModified || Date.now();
  }

  slice() {
    return new Blob();
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  stream() {
    return new ReadableStream();
  }
  text() {
    return Promise.resolve('');
  }
} as any;

global.FileList = class FileList {
  constructor(private files: File[] = []) {}

  get length() {
    return this.files.length;
  }

  item(index: number) {
    return this.files[index] || null;
  }

  [Symbol.iterator]() {
    return this.files[Symbol.iterator]();
  }
} as any;

// Mock Blob for file testing
global.Blob = class Blob {
  constructor(
    public chunks: BlobPart[] = [],
    public options: BlobPropertyBag = {}
  ) {}

  get size() {
    return 1024;
  }
  get type() {
    return this.options.type || '';
  }

  slice() {
    return new Blob();
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  stream() {
    return new ReadableStream();
  }
  text() {
    return Promise.resolve('mock blob content');
  }
} as any;

// ========================================
// STANDARDIZED API MOCK FACTORY FOR NEW FORMAT ONLY
// ========================================

/**
 * Standard API Response structure for new format only
 * Removes hybrid format complexity - only supports new backend API format
 */
export interface MockApiResponse<T = any> {
  success: boolean;
  status: 'success' | 'error';
  data: T;
  count?: number;
  meta: {
    timestamp: string;
    version: string;
    duration: string;
    cached: boolean;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

/**
 * Create standardized mock API response for new format
 * Eliminates hybrid format testing complexity
 */
export const createMockApiResponse = <T>(
  data: T,
  overrides: Partial<MockApiResponse<T>> = {}
): MockApiResponse<T> => ({
  success: true,
  status: 'success',
  data,
  count: Array.isArray(data) ? data.length : 1,
  meta: {
    timestamp: new Date().toISOString(),
    version: '2.0',
    duration: '15ms',
    cached: false,
  },
  ...overrides,
});

/**
 * Create mock error response for new format
 */
export const createMockErrorResponse = (
  message: string = 'Test error',
  code: string = 'TEST_ERROR',
  details?: any
): MockApiResponse<null> => ({
  success: false,
  status: 'error',
  data: null,
  meta: {
    timestamp: new Date().toISOString(),
    version: '2.0',
    duration: '5ms',
    cached: false,
  },
  error: {
    message,
    code,
    details,
  },
});

// Custom testing utilities for collection items
export const createMockCollectionItem = (overrides = {}) => ({
  id: 'mock-item-1',
  myPrice: 100,
  dateAdded: new Date().toISOString(),
  sold: false,
  ...overrides,
});

export const createMockPsaCard = (overrides = {}) => ({
  id: 'psa-1',
  cardId: {
    id: 'card-1',
    cardName: 'Test PSA Card',
    setId: { id: 'set-1', setName: 'Test Set' },
  },
  grade: '9',
  myPrice: 500,
  images: ['test-image.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
  priceHistory: [],
  ...overrides,
});

export const createMockRawCard = (overrides = {}) => ({
  id: 'raw-1',
  cardId: {
    id: 'card-2',
    cardName: 'Test Raw Card',
    setId: { id: 'set-1', setName: 'Test Set' },
  },
  condition: 'NM',
  myPrice: 200,
  images: ['test-image.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
  priceHistory: [],
  ...overrides,
});

export const createMockSealedProduct = (overrides = {}) => ({
  id: 'sealed-1',
  productId: {
    id: 'product-1',
    name: 'Test Booster Box',
  },
  name: 'Test Booster Box',
  setName: 'Test Set',
  category: 'booster-box',
  myPrice: 800,
  cardMarketPrice: 750,
  images: ['test-sealed.jpg'],
  dateAdded: new Date().toISOString(),
  sold: false,
  priceHistory: [],
  ...overrides,
});

/**
 * Create mock collection data with proper new API format structure
 */
export const createMockCollectionData = (overrides = {}) => {
  const psaCards = [
    createMockPsaCard(),
    createMockPsaCard({ id: 'psa-2', grade: '10' }),
  ];
  const rawCards = [
    createMockRawCard(),
    createMockRawCard({ id: 'raw-2', condition: 'LP' }),
  ];
  const sealedProducts = [createMockSealedProduct()];

  return {
    psaCards,
    rawCards,
    sealedProducts,
    soldItems: [],
    ...overrides,
  };
};

// Custom render helper for components with providers
export { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock toast notifications globally
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock all Lucide React icons globally with simple div replacements
// Updated for new API format - includes all icons used in codebase
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');

  // Helper function to create mock icon component
  const createMockIcon = (iconName: string) => {
    const MockIcon = ({ className, ...props }: any) =>
      React.createElement('div', {
        'data-testid': `${iconName.toLowerCase()}-icon`,
        className,
        ...props,
      });
    MockIcon.displayName = `Mock${iconName}Icon`;
    return MockIcon;
  };

  return {
    ...actual,
    // All icons used in the codebase (alphabetically ordered)
    Activity: createMockIcon('Activity'),
    AlertCircle: createMockIcon('AlertCircle'),
    AlertTriangle: createMockIcon('AlertTriangle'),
    Archive: createMockIcon('Archive'),
    ArrowLeft: createMockIcon('ArrowLeft'),
    ArrowUpDown: createMockIcon('ArrowUpDown'),
    Award: createMockIcon('Award'),
    Banknote: createMockIcon('Banknote'),
    BarChart3: createMockIcon('BarChart3'),
    Calendar: createMockIcon('Calendar'),
    Camera: createMockIcon('Camera'),
    Check: createMockIcon('Check'),
    CheckCircle: createMockIcon('CheckCircle'),
    ChevronDown: createMockIcon('ChevronDown'),
    ChevronLeft: createMockIcon('ChevronLeft'),
    ChevronRight: createMockIcon('ChevronRight'),
    ChevronUp: createMockIcon('ChevronUp'),
    Circle: createMockIcon('Circle'),
    Clock: createMockIcon('Clock'),
    Code: createMockIcon('Code'),
    DollarSign: createMockIcon('DollarSign'),
    Download: createMockIcon('Download'),
    Eye: createMockIcon('Eye'),
    EyeOff: createMockIcon('EyeOff'),
    FileText: createMockIcon('FileText'),
    Filter: createMockIcon('Filter'),
    Grid3X3: createMockIcon('Grid3X3'),
    GripVertical: createMockIcon('GripVertical'),
    Hash: createMockIcon('Hash'),
    Home: createMockIcon('Home'),
    Image: createMockIcon('Image'),
    LucideIcon: createMockIcon('LucideIcon'),
    Monitor: createMockIcon('Monitor'),
    Moon: createMockIcon('Moon'),
    Package: createMockIcon('Package'),
    Plus: createMockIcon('Plus'),
    RefreshCw: createMockIcon('RefreshCw'),
    Search: createMockIcon('Search'),
    Settings: createMockIcon('Settings'),
    Sparkles: createMockIcon('Sparkles'),
    Star: createMockIcon('Star'),
    Sun: createMockIcon('Sun'),
    Trash2: createMockIcon('Trash2'),
    TrendingUp: createMockIcon('TrendingUp'),
    Upload: createMockIcon('Upload'),
    Users: createMockIcon('Users'),
    X: createMockIcon('X'),
    Zap: createMockIcon('Zap'),
  };
});

// Mock API fetch globally to return new format responses
const originalFetch = global.fetch;
global.fetch = vi
  .fn()
  .mockImplementation((_url: string, _options?: RequestInit) => {
    // Default mock response for API calls
    const mockResponse = createMockApiResponse({
      message: 'Mock API response',
    });

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(mockResponse)])),
      headers: new Headers({ 'content-type': 'application/json' }),
    } as Response);
  });

// Restore original fetch in cleanup if needed
export const restoreOriginalFetch = () => {
  global.fetch = originalFetch;
};

console.log('Test setup completed successfully - New API format only');
