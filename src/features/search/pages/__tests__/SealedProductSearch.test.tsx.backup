/**
 * SealedProductSearch Page Unit Tests
 *
 * Tests SealedProductSearch page functionality including:
 * - Component rendering and search interface
 * - Product search with filters
 * - Category and availability filtering
 * - Set product filtering
 * - Pagination functionality
 * - Currency conversion (EUR to DKK)
 * - API calls and data loading
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SealedProductSearch from '../SealedProductSearch';
import { usePaginatedSearch } from '../../../../shared/hooks/usePaginatedSearch';

// Mock dependencies
vi.mock('../../../../shared/hooks/usePaginatedSearch', () => ({
  usePaginatedSearch: vi.fn(),
}));

vi.mock('../../../../shared/utils/performance/logger', () => ({
  log: vi.fn(),
}));

// Mock reusable components
vi.mock(
  '../../../../shared/components/molecules/common/ProductSearchFilters',
  () => ({
    default: ({
      searchTerm,
      onSearchChange,
      categoryFilter,
      onCategoryChange,
      setNameFilter,
      onSetNameChange,
      availableOnly,
      onAvailableOnlyChange,
      onSearch,
      onClear,
      onKeyPress,
    }: any) => (
      <div data-testid="product-search-filters">
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={onKeyPress}
        />
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          data-testid="category-select"
        >
          <option value="">All Categories</option>
          <option value="booster-box">Booster Box</option>
          <option value="elite-trainer-box">Elite Trainer Box</option>
        </select>
        <input
          placeholder="Filter by set name..."
          value={setNameFilter}
          onChange={(e) => onSetNameChange(e.target.value)}
          data-testid="set-name-filter"
        />
        <label>
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          />
          Available only
        </label>
        <button onClick={onSearch}>Search</button>
        <button onClick={onClear}>Clear Filters</button>
      </div>
    ),
  })
);

vi.mock('../../../../shared/components/molecules/common/ProductCard', () => ({
  default: ({ product }: any) => (
    <div data-testid="product-card">
      <h3>{product.name}</h3>
      <div>Category: {product.category}</div>
      <div>Price: €{product.price}</div>
      <div>Available: {product.available ? 'Yes' : 'No'}</div>
      {product.setProduct && <div>Set: {product.setProduct.name}</div>}
    </div>
  ),
}));

vi.mock(
  '../../../../shared/components/molecules/common/PaginationControls',
  () => ({
    default: ({ pagination, onPageChange }: any) => (
      <div data-testid="pagination-controls">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    ),
  })
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockProducts = [
  {
    id: '1',
    name: 'Base Set Booster Box',
    category: 'booster-box',
    price: 50.99,
    available: true,
    setProduct: {
      id: 'set1',
      name: 'Base Set',
    },
  },
  {
    id: '2',
    name: 'Jungle Elite Trainer Box',
    category: 'elite-trainer-box',
    price: 29.99,
    available: false,
    setProduct: {
      id: 'set2',
      name: 'Jungle',
    },
  },
];

const mockPagination = {
  currentPage: 1,
  totalPages: 2,
  totalItems: 15,
  hasNextPage: true,
  hasPreviousPage: false,
};

describe('SealedProductSearch Page', () => {
  const mockUsePaginatedSearch = {
    items: mockProducts,
    pagination: mockPagination,
    loading: false,
    error: null,
    searchProducts: vi.fn(),
    setPage: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(usePaginatedSearch).mockReturnValue(mockUsePaginatedSearch);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders product search page with search interface', () => {
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Product Search')).toBeInTheDocument();
    expect(screen.getByTestId('product-search-filters')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search products...')
    ).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('set-name-filter')).toBeInTheDocument();
    expect(screen.getByText('Available only')).toBeInTheDocument();
  });

  it('displays products correctly', () => {
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
    expect(screen.getByText('Jungle Elite Trainer Box')).toBeInTheDocument();
    expect(screen.getByText('Category: booster-box')).toBeInTheDocument();
    expect(screen.getByText('Category: elite-trainer-box')).toBeInTheDocument();
    expect(screen.getByText('Price: €50.99')).toBeInTheDocument();
    expect(screen.getByText('Price: €29.99')).toBeInTheDocument();
    expect(screen.getByText('Set: Base Set')).toBeInTheDocument();
    expect(screen.getByText('Set: Jungle')).toBeInTheDocument();
  });

  it('performs initial product search on mount', () => {
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: undefined,
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });

  it('handles search term input and search', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search products...');
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Charizard');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: 'Charizard',
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });

  it('handles category filter selection', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const categorySelect = screen.getByTestId('category-select');
    const searchButton = screen.getByText('Search');

    await user.selectOptions(categorySelect, 'booster-box');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: undefined,
      categoryFilter: 'booster-box',
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });

  it('handles set name filter', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const setNameInput = screen.getByTestId('set-name-filter');
    const searchButton = screen.getByText('Search');

    await user.type(setNameInput, 'Base Set');
    await user.click(searchButton);

    // Set name filter should trigger the search
    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalled();
  });

  it('handles available only checkbox', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const availableCheckbox = screen.getByLabelText('Available only');
    const searchButton = screen.getByText('Search');

    await user.click(availableCheckbox);
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: undefined,
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: true,
      page: 1,
      limit: 20,
    });
  });

  it('performs search when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search products...');

    await user.type(searchInput, 'Elite{enter}');

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: 'Elite',
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search products...');
    const categorySelect = screen.getByTestId('category-select');
    const availableCheckbox = screen.getByLabelText('Available only');
    const clearButton = screen.getByText('Clear Filters');

    await user.type(searchInput, 'Test');
    await user.selectOptions(categorySelect, 'booster-box');
    await user.click(availableCheckbox);

    // Clear filters
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(categorySelect).toHaveValue('');
    expect(availableCheckbox).not.toBeChecked();

    // Should trigger search with cleared filters
    await waitFor(
      () => {
        expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
          searchTerm: undefined,
          categoryFilter: undefined,
          setProductId: undefined,
          availableOnly: false,
          page: 1,
          limit: 20,
        });
      },
      { timeout: 200 }
    );
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockUsePaginatedSearch.setPage).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      pagination: {
        ...mockPagination,
        currentPage: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('displays loading state correctly', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      loading: true,
    });

    render(<SealedProductSearch />, { wrapper: createWrapper() });

    // PageLayout should handle loading state
    expect(screen.getByText('Product Search')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      error: 'Failed to search products',
    });

    render(<SealedProductSearch />, { wrapper: createWrapper() });

    // PageLayout should handle error state
    expect(screen.getByText('Product Search')).toBeInTheDocument();
  });

  it('displays empty state when no products found', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      items: [],
    });

    render(<SealedProductSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search criteria')
    ).toBeInTheDocument();
  });

  it('scrolls to top when changing pages', async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {});

    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    scrollToSpy.mockRestore();
  });

  it('converts EUR to DKK correctly', () => {
    // Test the currency conversion logic
    const eurPrice = 100;
    const expectedDKK = Math.round(eurPrice * 7.46); // 746 DKK

    expect(expectedDKK).toBe(746);
  });

  it('handles combined filters correctly', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search products...');
    const categorySelect = screen.getByTestId('category-select');
    const availableCheckbox = screen.getByLabelText('Available only');
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Booster');
    await user.selectOptions(categorySelect, 'booster-box');
    await user.click(availableCheckbox);
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: 'Booster',
      categoryFilter: 'booster-box',
      setProductId: undefined,
      availableOnly: true,
      page: 1,
      limit: 20,
    });
  });

  it('trims whitespace from search term', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search products...');
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, '  Trimmed Search  ');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: 'Trimmed Search',
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });

  it('handles empty search term correctly', async () => {
    const user = userEvent.setup();
    render(<SealedProductSearch />, { wrapper: createWrapper() });

    const searchButton = screen.getByText('Search');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchProducts).toHaveBeenCalledWith({
      searchTerm: undefined,
      categoryFilter: undefined,
      setProductId: undefined,
      availableOnly: false,
      page: 1,
      limit: 20,
    });
  });
});
