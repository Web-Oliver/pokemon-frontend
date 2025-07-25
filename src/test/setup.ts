/**
 * Test Setup Configuration
 * 
 * Following CLAUDE.md testing principles:
 * - Global test environment setup
 * - Mock configuration for external dependencies
 * - Testing utilities and custom matchers
 */

import { expect, afterEach, vi } from 'vitest';
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
  value: vi.fn().mockImplementation(query => ({
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
  
  get size() { return 1024; }
  get type() { return this.options.type || ''; }
  get lastModified() { return this.options.lastModified || Date.now(); }
  
  slice() { return new Blob(); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(''); }
} as any;

global.FileList = class FileList {
  constructor(private files: File[] = []) {}
  
  get length() { return this.files.length; }
  
  item(index: number) { return this.files[index] || null; }
  
  [Symbol.iterator]() { return this.files[Symbol.iterator](); }
} as any;

// Mock Blob for file testing
global.Blob = class Blob {
  constructor(
    public chunks: BlobPart[] = [],
    public options: BlobPropertyBag = {}
  ) {}
  
  get size() { return 1024; }
  get type() { return this.options.type || ''; }
  
  slice() { return new Blob(); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve('mock blob content'); }
} as any;

// Custom testing utilities
export const createMockCollectionItem = (overrides = {}) => ({
  id: 'mock-item-1',
  myPrice: 100,
  ...overrides,
});

export const createMockPsaCard = (overrides = {}) => ({
  id: 'psa-1',
  grade: 9,
  myPrice: 500,
  cardId: { cardName: 'Test PSA Card' },
  ...overrides,
});

export const createMockRawCard = (overrides = {}) => ({
  id: 'raw-1',
  condition: 'NM',
  myPrice: 200,
  cardId: { cardName: 'Test Raw Card' },
  ...overrides,
});

export const createMockSealedProduct = (overrides = {}) => ({
  id: 'sealed-1',
  name: 'Test Booster Box',
  myPrice: 800,
  category: 'booster-box',
  ...overrides,
});

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

// Mock Lucide React icons globally with simple div replacements
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    // Common icons used in tests
    Download: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'download-icon', className, ...props }),
    Upload: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'upload-icon', className, ...props }),
    X: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'x-icon', className, ...props }),
    Check: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'check-icon', className, ...props }),
    ChevronUp: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'chevron-up', className, ...props }),
    ChevronDown: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'chevron-down', className, ...props }),
    GripVertical: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'grip-icon', className, ...props }),
    ArrowUpDown: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'arrow-up-down', className, ...props }),
    Settings: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'settings-icon', className, ...props }),
    Eye: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'eye-icon', className, ...props }),
    EyeOff: ({ className, ...props }: any) => React.createElement('div', { 'data-testid': 'eye-off-icon', className, ...props }),
  };
});

console.log('Test setup completed successfully');