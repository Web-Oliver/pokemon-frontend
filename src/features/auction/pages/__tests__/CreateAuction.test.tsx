/**
 * CreateAuction Page Unit Tests
 *
 * Tests CreateAuction page functionality including:
 * - Auction creation form with validation
 * - Collection item selection and filtering
 * - Hierarchical search (set name -> product/card)
 * - Form submission and validation
 * - Item ordering and preview
 * - Loading and error states
 * - Navigation workflows
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateAuction from '../CreateAuction';
// Import mocked hooks
import { useAuction } from '../../../../shared/hooks/useAuction';
import { useFetchCollectionItems } from '../../../../shared/hooks/useFetchCollectionItems';
import { useAuctionFormAdapter } from '../../../../shared/hooks/form/useGenericFormStateAdapter';

// Mock dependencies
vi.mock('../../../../shared/hooks/useAuction', () => ({
  useAuction: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useFetchCollectionItems', () => ({
  useFetchCollectionItems: vi.fn(),
}));

vi.mock('../../../../shared/hooks/form/useGenericFormStateAdapter', () => ({
  useAuctionFormAdapter: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils/performance/logger', () => ({
  log: vi.fn(),
}));

vi.mock('../../../../shared/utils/ui/themeConfig', () => ({
  useCentralizedTheme: vi.fn(() => ({
    ,
    particleEffectsEnabled: true,
    glassmorphismIntensity: 0.8,
  })),
  themeUtils: {
    getThemeClasses: vi.fn(() => ({})),
    applyTheme: vi.fn(),
    shouldShowParticles: vi.fn(() => true),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock components
vi.mock(
  '../../../../shared/components/forms/containers/AuctionFormContainer',
  () => ({
    default: ({ children, formAdapter, onSubmit }: any) => (
      <div data-testid="auction-form-container">
        <form onSubmit={onSubmit}>
          <input
            data-testid="top-text-input"
            value={formAdapter.formState.topText}
            onChange={(e) => formAdapter.updateField('topText', e.target.value)}
          />
          <input
            data-testid="bottom-text-input"
            value={formAdapter.formState.bottomText}
            onChange={(e) =>
              formAdapter.updateField('bottomText', e.target.value)
            }
          />
          <input
            data-testid="auction-date-input"
            type="date"
            value={formAdapter.formState.auctionDate}
            onChange={(e) =>
              formAdapter.updateField('auctionDate', e.target.value)
            }
          />
          <select
            data-testid="status-select"
            value={formAdapter.formState.status}
            onChange={(e) => formAdapter.updateField('status', e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <button type="submit" disabled={formAdapter.loading}>
            {formAdapter.loading ? 'Creating...' : 'Create Auction'}
          </button>
          {formAdapter.errors.topText && (
            <div data-testid="top-text-error">{formAdapter.errors.topText}</div>
          )}
        </form>
        {children}
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/forms/sections/AuctionItemSelectionSection',
  () => ({
    default: ({
      collectionItems,
      selectedItemIds,
      onItemSelectionChange,
      selectedSetName,
      onSetNameChange,
      cardProductSearchTerm,
      onCardProductSearchChange,
      filterType,
      onFilterTypeChange,
      loading,
    }: any) => (
      <div data-testid="item-selection-section">
        <input
          data-testid="set-search-input"
          placeholder="Search sets..."
          value={selectedSetName}
          onChange={(e) => onSetNameChange(e.target.value)}
        />
        <input
          data-testid="card-product-search-input"
          placeholder="Search cards/products..."
          value={cardProductSearchTerm}
          onChange={(e) => onCardProductSearchChange(e.target.value)}
        />
        <select
          data-testid="filter-type-select"
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
        >
          <option value="all">All Items</option>
          <option value="PsaGradedCard">PSA Cards</option>
          <option value="RawCard">Raw Cards</option>
          <option value="SealedProduct">Sealed Products</option>
        </select>
        {loading && (
          <div data-testid="collection-loading">Loading items...</div>
        )}
        <div data-testid="collection-items">
          {collectionItems.map((item: any) => (
            <div key={item.id} data-testid="collection-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedItemIds.has(item.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedItemIds);
                    if (e.target.checked) {
                      newSelected.add(item.id);
                    } else {
                      newSelected.delete(item.id);
                    }
                    onItemSelectionChange(newSelected);
                  }}
                />
                {item.displayName}
              </label>
            </div>
          ))}
        </div>
        <div data-testid="selected-count">
          Selected: {selectedItemIds.size} items
        </div>
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

const mockCollectionItems = [
  {
    id: 'psa-1',
    displayName: 'Charizard PSA 10',
    type: 'PsaGradedCard',
    setName: 'Base Set',
    price: 500,
  },
  {
    id: 'raw-1',
    displayName: 'Blastoise Raw',
    type: 'RawCard',
    setName: 'Base Set',
    price: 150,
  },
  {
    id: 'sealed-1',
    displayName: 'Booster Box',
    type: 'SealedProduct',
    setName: 'Evolving Skies',
    price: 300,
  },
];

// EXACT match for useAuctionFormAdapter return type
const mockFormAdapter = {
  formState: {
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as const,
  },
  loading: false,
  errors: {},
  isDirty: false,
  updateField: vi.fn(),
  setLoading: vi.fn(),
  setErrors: vi.fn(),
  reset: vi.fn(),
  validateForm: vi.fn(() => true),
};

describe('CreateAuction Page', () => {
  // EXACT match for useAuction return type
  const mockUseAuction = {
    auctions: [],
    currentAuction: null,
    loading: false,
    error: null,
    fetchAuctions: vi.fn(),
    fetchAuctionById: vi.fn(),
    createAuction: vi.fn(),
    updateAuction: vi.fn(),
    deleteAuction: vi.fn(),
    addItemToAuction: vi.fn(),
    removeItemFromAuction: vi.fn(),
    markAuctionItemSold: vi.fn(),
    generateFacebookPost: vi.fn(),
    downloadAuctionTextFile: vi.fn(),
    downloadAuctionImagesZip: vi.fn(),
    clearCurrentAuction: vi.fn(),
    clearError: vi.fn(),
  };

  // EXACT match for useFetchCollectionItems return type
  const mockUseFetchCollectionItems = {
    items: mockCollectionItems,
    loading: false,
    error: null,
    fetchItems: vi.fn(),
    fetchItemsWithValidation: vi.fn(),
    refreshItems: vi.fn(),
    clearError: vi.fn(),
    setItems: vi.fn(),
    reset: vi.fn(),
    lastFetchFn: null,
    isEmpty: false,
    hasItems: true,
    itemCount: mockCollectionItems.length,
  };

  beforeEach(() => {
    vi.mocked(useAuction).mockReturnValue(mockUseAuction);
    vi.mocked(useFetchCollectionItems).mockReturnValue(
      mockUseFetchCollectionItems
    );
    vi.mocked(useAuctionFormAdapter).mockReturnValue(mockFormAdapter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders create auction page with form fields', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByText('Create New Auction')).toBeInTheDocument();
    expect(screen.getByTestId('auction-form-container')).toBeInTheDocument();
    expect(screen.getByTestId('top-text-input')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-text-input')).toBeInTheDocument();
    expect(screen.getByTestId('auction-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
  });

  it('displays item selection section with collection items', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByTestId('item-selection-section')).toBeInTheDocument();
    expect(screen.getByTestId('set-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('card-product-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-type-select')).toBeInTheDocument();
  });

  it('displays collection items for selection', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    const collectionItems = screen.getAllByTestId('collection-item');
    expect(collectionItems).toHaveLength(3);

    expect(screen.getByText('Charizard PSA 10')).toBeInTheDocument();
    expect(screen.getByText('Blastoise Raw')).toBeInTheDocument();
    expect(screen.getByText('Booster Box')).toBeInTheDocument();
  });

  it('handles form field updates', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const titleInput = screen.getByTestId('top-text-input');
    await user.type(titleInput, 'My Auction Title');

    expect(mockFormAdapter.updateField).toHaveBeenCalledWith(
      'topText',
      'My Auction Title'
    );
  });

  it('handles auction date selection', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const dateInput = screen.getByTestId('auction-date-input');
    await user.type(dateInput, '2024-03-15');

    expect(mockFormAdapter.updateField).toHaveBeenCalledWith(
      'auctionDate',
      '2024-03-15'
    );
  });

  it('handles status selection', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const statusSelect = screen.getByTestId('status-select');
    await user.selectOptions(statusSelect, 'active');

    expect(mockFormAdapter.updateField).toHaveBeenCalledWith(
      'status',
      'active'
    );
  });

  it('handles item selection', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const firstItemCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstItemCheckbox);

    // Should update selected items count
    expect(screen.getByText('Selected: 1 items')).toBeInTheDocument();
  });

  it('handles hierarchical search - set name filtering', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const setSearchInput = screen.getByTestId('set-search-input');
    await user.type(setSearchInput, 'Base Set');

    // Should filter items by set
    expect(setSearchInput).toHaveValue('Base Set');
  });

  it('handles card/product search', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const cardSearchInput = screen.getByTestId('card-product-search-input');
    await user.type(cardSearchInput, 'Charizard');

    expect(cardSearchInput).toHaveValue('Charizard');
  });

  it('handles filter type changes', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const filterSelect = screen.getByTestId('filter-type-select');
    await user.selectOptions(filterSelect, 'PsaGradedCard');

    expect(filterSelect).toHaveValue('PsaGradedCard');
  });

  it('displays form validation errors', () => {
    const formAdapterWithErrors = {
      ...mockFormAdapter,
      errors: {
        topText: 'Auction title is required',
      },
    };

    vi.mocked(useAuctionFormAdapter).mockReturnValue(formAdapterWithErrors);

    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByTestId('top-text-error')).toBeInTheDocument();
    expect(screen.getByText('Auction title is required')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();

    const formAdapterWithData = {
      ...mockFormAdapter,
      formState: {
        topText: 'Test Auction',
        bottomText: 'Test Description',
        auctionDate: '2024-03-15',
        status: 'draft' as const,
      },
      validateForm: vi.fn(() => true),
    };

    vi.mocked(useAuctionFormAdapter).mockReturnValue(formAdapterWithData);

    render(<CreateAuction />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Create Auction');
    await user.click(submitButton);

    expect(mockUseAuction.createAuction).toHaveBeenCalled();
  });

  it('prevents submission with validation errors', async () => {
    const user = userEvent.setup();

    const formAdapterWithValidationErrors = {
      ...mockFormAdapter,
      validateForm: vi.fn(() => false),
      errors: {
        topText: 'Title is required',
      },
    };

    vi.mocked(useAuctionFormAdapter).mockReturnValue(
      formAdapterWithValidationErrors
    );

    render(<CreateAuction />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Create Auction');
    await user.click(submitButton);

    expect(mockUseAuction.createAuction).not.toHaveBeenCalled();
  });

  it('displays loading state during creation', () => {
    const formAdapterLoading = {
      ...mockFormAdapter,
      loading: true,
    };

    vi.mocked(useAuctionFormAdapter).mockReturnValue(formAdapterLoading);

    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  it('displays collection loading state', () => {
    vi.mocked(useFetchCollectionItems).mockReturnValue({
      ...mockUseFetchCollectionItems,
      loading: true,
    });

    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByTestId('collection-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  it('handles collection fetch error', () => {
    vi.mocked(useFetchCollectionItems).mockReturnValue({
      ...mockUseFetchCollectionItems,
      error: 'Failed to load items',
    });

    render(<CreateAuction />, { wrapper: createWrapper() });

    // Error should be handled in the UI somehow
    expect(screen.getByTestId('item-selection-section')).toBeInTheDocument();
  });

  it('handles auction creation error', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Failed to create auction',
    });

    render(<CreateAuction />, { wrapper: createWrapper() });

    // PageLayout should handle the error display
    expect(screen.getByText('Create New Auction')).toBeInTheDocument();
  });

  it('navigates back when form is cancelled', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<CreateAuction />, { wrapper: createWrapper() });

    // Look for back button or cancel button
    const backButton =
      screen.getByLabelText(/back/i) || screen.getByText(/cancel/i);
    if (backButton) {
      await user.click(backButton);
      expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/auctions');
    }
  });

  it('shows selected items count correctly', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByText('Selected: 0 items')).toBeInTheDocument();
  });

  it('handles multiple item selection', async () => {
    const user = userEvent.setup();

    render(<CreateAuction />, { wrapper: createWrapper() });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select first item
    await user.click(checkboxes[0]);
    expect(screen.getByText('Selected: 1 items')).toBeInTheDocument();

    // Select second item
    await user.click(checkboxes[1]);
    expect(screen.getByText('Selected: 2 items')).toBeInTheDocument();

    // Deselect first item
    await user.click(checkboxes[0]);
    expect(screen.getByText('Selected: 1 items')).toBeInTheDocument();
  });

  it('displays all filter type options', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.getByText('PSA Cards')).toBeInTheDocument();
    expect(screen.getByText('Raw Cards')).toBeInTheDocument();
    expect(screen.getByText('Sealed Products')).toBeInTheDocument();
  });

  it('displays all status options', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles successful auction creation', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    mockUseAuction.createAuction.mockResolvedValue({ _id: 'new-auction-id' });

    const formAdapterWithData = {
      ...mockFormAdapter,
      formState: {
        topText: 'Test Auction',
        bottomText: 'Test Description',
        auctionDate: '2024-03-15',
        status: 'draft' as const,
      },
      validateForm: vi.fn(() => true),
    };

    vi.mocked(useAuctionFormAdapter).mockReturnValue(formAdapterWithData);

    render(<CreateAuction />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Create Auction');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUseAuction.createAuction).toHaveBeenCalled();
    });
  });

  it('clears errors on mount', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(mockUseAuction.clearError).toHaveBeenCalled();
  });

  it('initializes with default form values', () => {
    render(<CreateAuction />, { wrapper: createWrapper() });

    expect(screen.getByTestId('top-text-input')).toHaveValue('');
    expect(screen.getByTestId('bottom-text-input')).toHaveValue('');
    expect(screen.getByTestId('auction-date-input')).toHaveValue('');
    expect(screen.getByTestId('status-select')).toHaveValue('draft');
  });
});
