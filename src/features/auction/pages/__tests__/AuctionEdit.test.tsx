/**
 * AuctionEdit Page Unit Tests
 *
 * Tests AuctionEdit page functionality including:
 * - Auction editing form with validation
 * - Add/remove items from auction
 * - Form state management and validation
 * - Navigation and modal interactions
 * - Loading and error states
 * - Save auction updates
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuctionEdit from '../AuctionEdit';
// Import mocked hooks
import { useAuction } from '../../../../shared/hooks/useAuction';
import { useGenericFormState } from '../../../../shared/hooks/form/useGenericFormState';

// Mock dependencies
vi.mock('../../../../shared/hooks/useAuction', () => ({
  useAuction: vi.fn(),
}));

vi.mock('../../../../shared/hooks/form/useGenericFormState', () => ({
  useGenericFormState: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    getAuctionIdFromUrl: vi.fn(() => 'test-auction-id'),
    navigateTo: vi.fn(),
  },
}));

vi.mock(
  '../../../../shared/components/organisms/ui/toastNotifications',
  () => ({
    showSuccessToast: vi.fn(),
  })
);

vi.mock('../../../../shared/utils/helpers/auctionStatusUtils', () => ({
  getStatusColor: vi.fn((status) => 'bg-blue-500 text-white'),
}));

vi.mock('../../../../shared/hooks/theme/useTheme', () => ({
  useTheme: vi.fn(() => ({
    currentTheme: 'cosmic',
    setTheme: vi.fn(),
    accessibility: {},
    animation: { enabled: true },
    layout: {},
    toggleDarkMode: vi.fn(),
  })),
}));

// Mock components
vi.mock('../components/auction/sections/AuctionItemsSection', () => ({
  default: ({ children, onAddItems }: any) => (
    <div data-testid="auction-items-section">
      <button onClick={onAddItems}>Add Items to Auction</button>
      {children}
    </div>
  ),
}));

vi.mock('../../../components/lists/CollectionItemCard', () => ({
  default: ({ item, onRemove }: any) => (
    <div data-testid="collection-item-card">
      <div>{item.itemData?.cardId?.cardName || 'Test Item'}</div>
      <button onClick={() => onRemove(item)}>Remove from Auction</button>
    </div>
  ),
}));

vi.mock('../../../components/modals/AddItemToAuctionModal', () => ({
  default: ({ isOpen, onClose, onAddItems }: any) =>
    isOpen ? (
      <div data-testid="add-item-modal">
        <h3>Add Items to Auction</h3>
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={() =>
            onAddItems([{ itemId: 'new-item', itemCategory: 'PsaGradedCard' }])
          }
        >
          Add Selected Items
        </button>
      </div>
    ) : null,
}));

vi.mock(
  '../../../shared/components/molecules/common/GenericLoadingState',
  () => ({
    default: ({ text }: any) => <div data-testid="loading-state">{text}</div>,
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

const mockAuction = {
  _id: 'test-auction-id',
  topText: 'Test Auction',
  bottomText: 'Premium Pokemon Collection',
  status: 'draft' as const,
  auctionDate: '2024-02-15T00:00:00Z',
  totalValue: 1000,
  soldValue: 0,
  isActive: false,
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-14T00:00:00Z',
  items: [
    {
      itemId: 'item-1',
      itemCategory: 'PsaGradedCard',
      itemData: {
        _id: 'item-1',
        cardId: { cardName: 'Charizard' },
        grade: 10,
        myPrice: 500,
      },
    },
  ],
};

const mockFormState = {
  data: {
    topText: 'Test Auction',
    bottomText: 'Premium Pokemon Collection',
    auctionDate: '2024-02-15',
    status: 'draft' as const,
  },
  loading: false,
  errors: {},
  isDirty: false,
  updateField: vi.fn(),
  setLoading: vi.fn(),
  setErrors: vi.fn(),
  reset: vi.fn(),
  setData: vi.fn(),
};

describe('AuctionEdit Page', () => {
  const mockUseAuction = {
    currentAuction: mockAuction,
    loading: false,
    error: null,
    fetchAuctionById: vi.fn(),
    updateAuction: vi.fn(),
    addItemToAuction: vi.fn(),
    removeItemFromAuction: vi.fn(),
    clearError: vi.fn(),
    clearCurrentAuction: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useAuction).mockReturnValue(mockUseAuction);
    vi.mocked(useGenericFormState).mockReturnValue(mockFormState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders auction edit page with form fields', () => {
    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('Edit Auction')).toBeInTheDocument();
    expect(
      screen.getByText('Update auction details and manage items')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Auction')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Premium Pokemon Collection')
    ).toBeInTheDocument();
  });

  it('displays auction status and metadata', () => {
    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('fetches auction by ID on mount', () => {
    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(mockUseAuction.fetchAuctionById).toHaveBeenCalledWith(
      'test-auction-id'
    );
  });

  it('uses provided auction ID prop over URL', () => {
    render(<AuctionEdit auctionId="prop-auction-id" />, {
      wrapper: createWrapper(),
    });

    expect(mockUseAuction.fetchAuctionById).toHaveBeenCalledWith(
      'prop-auction-id'
    );
  });

  it('handles form field updates', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const titleInput = screen.getByDisplayValue('Test Auction');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Auction Title');

    expect(mockFormState.updateField).toHaveBeenCalledWith(
      'topText',
      'Updated Auction Title'
    );
  });

  it('handles form validation errors', () => {
    const formStateWithErrors = {
      ...mockFormState,
      errors: {
        topText: 'Auction title is required',
      },
    };

    vi.mocked(useGenericFormState).mockReturnValue(formStateWithErrors);

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('Auction title is required')).toBeInTheDocument();
  });

  it('handles auction status changes', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const statusSelect = screen.getByDisplayValue('draft');
    await user.selectOptions(statusSelect, 'active');

    expect(mockFormState.updateField).toHaveBeenCalledWith('status', 'active');
  });

  it('handles date field updates', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const dateInput = screen.getByDisplayValue('2024-02-15');
    await user.clear(dateInput);
    await user.type(dateInput, '2024-03-01');

    expect(mockFormState.updateField).toHaveBeenCalledWith(
      'auctionDate',
      '2024-03-01'
    );
  });

  it('displays loading state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      loading: true,
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Failed to load auction',
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load auction')).toBeInTheDocument();
  });

  it('handles auction not found state', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: null,
      loading: false,
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('Auction Not Found')).toBeInTheDocument();
  });

  it('displays auction items', () => {
    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByTestId('auction-items-section')).toBeInTheDocument();
    expect(screen.getByTestId('collection-item-card')).toBeInTheDocument();
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });

  it('opens add item modal when clicking add items', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const addItemsButton = screen.getByText('Add Items to Auction');
    await user.click(addItemsButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toBeInTheDocument();
      expect(screen.getByText('Add Items to Auction')).toBeInTheDocument();
    });
  });

  it('handles adding items to auction', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    // Open modal first
    const addItemsButton = screen.getByText('Add Items to Auction');
    await user.click(addItemsButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toBeInTheDocument();
    });

    // Add items
    const addSelectedButton = screen.getByText('Add Selected Items');
    await user.click(addSelectedButton);

    expect(mockUseAuction.addItemToAuction).toHaveBeenCalledWith(
      'test-auction-id',
      {
        itemId: 'new-item',
        itemCategory: 'PsaGradedCard',
      }
    );
  });

  it('handles removing items from auction', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const removeButton = screen.getByText('Remove from Auction');
    await user.click(removeButton);

    // Should open confirmation modal
    await waitFor(() => {
      expect(screen.getByText('Remove Item from Auction')).toBeInTheDocument();
    });
  });

  it('handles remove item confirmation', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const removeButton = screen.getByText('Remove from Auction');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Item from Auction')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Remove Item');
    await user.click(confirmButton);

    expect(mockUseAuction.removeItemFromAuction).toHaveBeenCalled();
  });

  it('handles save auction functionality', async () => {
    const user = userEvent.setup();

    // Mock form as dirty to enable save
    vi.mocked(useGenericFormState).mockReturnValue({
      ...mockFormState,
      isDirty: true,
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const saveButton = screen.getByText(/Save Changes/i);
    await user.click(saveButton);

    expect(mockUseAuction.updateAuction).toHaveBeenCalledWith(
      'test-auction-id',
      mockFormState.data
    );
  });

  it('disables save button when form is not dirty', () => {
    render(<AuctionEdit />, { wrapper: createWrapper() });

    const saveButton = screen.getByText(/Save Changes/i);
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form is dirty', () => {
    vi.mocked(useGenericFormState).mockReturnValue({
      ...mockFormState,
      isDirty: true,
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const saveButton = screen.getByText(/Save Changes/i);
    expect(saveButton).not.toBeDisabled();
  });

  it('handles navigation back to auction detail', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const backButton = screen.getByText(/Back to Auction/i);
    await user.click(backButton);

    expect(navigationHelper.navigateTo).toHaveBeenCalledWith(
      '/auctions/test-auction-id'
    );
  });

  it('displays validation error for past auction dates', () => {
    const formStateWithDateError = {
      ...mockFormState,
      errors: {
        auctionDate: 'Auction date cannot be in the past',
      },
    };

    vi.mocked(useGenericFormState).mockReturnValue(formStateWithDateError);

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Auction date cannot be in the past')
    ).toBeInTheDocument();
  });

  it('shows loading state when saving', () => {
    const formStateLoading = {
      ...mockFormState,
      loading: true,
      isDirty: true,
    };

    vi.mocked(useGenericFormState).mockReturnValue(formStateLoading);

    render(<AuctionEdit />, { wrapper: createWrapper() });

    const saveButton = screen.getByText(/Saving/i);
    expect(saveButton).toBeDisabled();
  });

  it('clears current auction on unmount', () => {
    const { unmount } = render(<AuctionEdit />, { wrapper: createWrapper() });

    unmount();

    expect(mockUseAuction.clearCurrentAuction).toHaveBeenCalled();
  });

  it('handles error clearing', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Test error message',
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Find and click error dismiss button
    const dismissButtons = screen.getAllByRole('button');
    const errorDismissButton = dismissButtons.find(
      (button) => button.querySelector('svg') // Look for X icon
    );

    if (errorDismissButton) {
      await user.click(errorDismissButton);
      expect(mockUseAuction.clearError).toHaveBeenCalled();
    }
  });

  it('updates form data when auction is loaded', () => {
    // Mock the auction loading after initial render
    const { rerender } = render(<AuctionEdit />, { wrapper: createWrapper() });

    // Simulate auction being loaded
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: mockAuction,
    });

    rerender(<AuctionEdit />);

    expect(mockFormState.setData).toHaveBeenCalled();
  });

  it('handles cancel in add item modal', async () => {
    const user = userEvent.setup();

    render(<AuctionEdit />, { wrapper: createWrapper() });

    // Open modal
    const addItemsButton = screen.getByText('Add Items to Auction');
    await user.click(addItemsButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toBeInTheDocument();
    });

    // Cancel modal
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('add-item-modal')).not.toBeInTheDocument();
    });
  });

  it('displays auction items count correctly', () => {
    const auctionWithMultipleItems = {
      ...mockAuction,
      items: [
        mockAuction.items[0],
        {
          itemId: 'item-2',
          itemCategory: 'RawCard',
          itemData: {
            _id: 'item-2',
            cardId: { cardName: 'Blastoise' },
          },
        },
      ],
    };

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: auctionWithMultipleItems,
    });

    render(<AuctionEdit />, { wrapper: createWrapper() });

    expect(screen.getByText('2 items')).toBeInTheDocument();
  });
});
