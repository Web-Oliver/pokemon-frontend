/**
 * AuctionDetail Page Unit Tests
 *
 * Tests AuctionDetail page functionality including:
 * - Auction display and metadata
 * - Add/remove items from auction
 * - Mark items as sold workflow
 * - Export functionality (Facebook post, text file, images zip)
 * - Navigation between auction pages
 * - Modal interactions and confirmations
 * - Loading and error states
 * - Progress tracking and statistics
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuctionDetail from '../AuctionDetail';
// Import mocked hooks
import { useAuction } from '../../../../shared/hooks/useAuction';
import { useCollectionOperations } from '../../../../shared/hooks/useCollectionOperations';
import { useConfirmModal, useModal } from '../../../../shared/hooks/useModal';

// Mock dependencies
vi.mock('../../../../shared/hooks/useAuction', () => ({
  useAuction: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useCollectionOperations', () => ({
  useCollectionOperations: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useModal', () => ({
  useModal: vi.fn(() => ({
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  })),
  useConfirmModal: vi.fn(() => ({
    isOpen: false,
    isConfirming: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    confirmAction: vi.fn(),
  })),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    getAuctionIdFromUrl: vi.fn(() => 'test-auction-id'),
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils/helpers/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock(
  '../../../../shared/components/organisms/ui/toastNotifications',
  () => ({
    showSuccessToast: vi.fn(),
    showWarningToast: vi.fn(),
  })
);

vi.mock('../../../../shared/utils/helpers/itemDisplayHelpers', () => ({
  formatCurrency: vi.fn((amount) => `$${amount}`),
  formatDate: vi.fn((date) => '2024-01-15'),
  getItemDisplayData: vi.fn((item) => ({
    itemName: item.itemData?.cardId?.cardName || 'Test Item',
    itemImage: item.itemData?.images?.[0],
    price: item.itemData?.myPrice,
  })),
}));

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
      <button onClick={onAddItems}>Add Items</button>
      {children}
    </div>
  ),
}));

vi.mock('../components/auction/AuctionItemCard', () => ({
  AuctionItemCard: ({ item, onMarkSold, onRemoveItem, isItemSold }: any) => (
    <div data-testid="auction-item-card">
      <div>{item.itemData?.cardId?.cardName || 'Test Item'}</div>
      <div>Sold: {isItemSold(item) ? 'Yes' : 'No'}</div>
      <button onClick={() => onMarkSold(item)}>Mark Sold</button>
      <button onClick={() => onRemoveItem(item)}>Remove</button>
    </div>
  ),
}));

vi.mock('../../../components/modals/AddItemToAuctionModal', () => ({
  default: ({ isOpen, onClose, onAddItems }: any) =>
    isOpen ? (
      <div data-testid="add-item-modal">
        <button onClick={onClose}>Close</button>
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

vi.mock('../../../shared/components/forms/MarkSoldForm', () => ({
  MarkSoldForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="mark-sold-form">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => onSubmit({ actualSoldPrice: 100 })}>Submit</button>
    </div>
  ),
}));

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
  status: 'active',
  auctionDate: '2024-01-15T00:00:00Z',
  totalValue: 1000,
  soldValue: 200,
  isActive: true,
  generatedFacebookPost: 'Test Facebook post content',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-14T00:00:00Z',
  items: [
    {
      itemId: 'item-1',
      itemCategory: 'PsaGradedCard',
      sold: false,
      itemData: {
        _id: 'item-1',
        cardId: { cardName: 'Charizard' },
        grade: 10,
        myPrice: 500,
        images: ['image1.jpg'],
      },
    },
    {
      itemId: 'item-2',
      itemCategory: 'RawCard',
      sold: true,
      itemData: {
        _id: 'item-2',
        cardId: { cardName: 'Blastoise' },
        condition: 'Near Mint',
        myPrice: 200,
        images: ['image2.jpg'],
      },
    },
  ],
};

describe('AuctionDetail Page', () => {
  const mockUseAuction = {
    currentAuction: mockAuction,
    loading: false,
    error: null,
    fetchAuctionById: vi.fn(),
    deleteAuction: vi.fn(),
    addItemToAuction: vi.fn(),
    removeItemFromAuction: vi.fn(),
    markAuctionItemSold: vi.fn(),
    generateFacebookPost: vi.fn().mockResolvedValue('Generated Facebook post'),
    downloadAuctionTextFile: vi.fn(),
    downloadAuctionImagesZip: vi.fn(),
    clearError: vi.fn(),
    clearCurrentAuction: vi.fn(),
  };

  const mockUseCollectionOperations = {
    markPsaCardSold: vi.fn(),
    markRawCardSold: vi.fn(),
    markSealedProductSold: vi.fn(),
    loading: false,
  };

  const mockModals = {
    addItemModal: {
      isOpen: false,
      openModal: vi.fn(),
      closeModal: vi.fn(),
    },
    markSoldModal: {
      isOpen: false,
      openModal: vi.fn(),
      closeModal: vi.fn(),
    },
    deleteConfirmModal: {
      isOpen: false,
      isConfirming: false,
      openModal: vi.fn(),
      closeModal: vi.fn(),
      confirmAction: vi.fn(),
    },
    removeItemConfirmModal: {
      isOpen: false,
      isConfirming: false,
      openModal: vi.fn(),
      closeModal: vi.fn(),
      confirmAction: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.mocked(useAuction).mockReturnValue(mockUseAuction);
    vi.mocked(useCollectionOperations).mockReturnValue(
      mockUseCollectionOperations
    );
    vi.mocked(useModal)
      .mockReturnValueOnce(mockModals.addItemModal)
      .mockReturnValueOnce(mockModals.markSoldModal);
    vi.mocked(useConfirmModal)
      .mockReturnValueOnce(mockModals.deleteConfirmModal)
      .mockReturnValueOnce(mockModals.removeItemConfirmModal);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders auction detail page with auction information', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Test Auction')).toBeInTheDocument();
    expect(screen.getByText('Premium Pokemon Collection')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('Total Value: $1000')).toBeInTheDocument();
  });

  it('displays auction statistics correctly', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('1/2')).toBeInTheDocument(); // Sales progress
    expect(screen.getByText('50.0% of items sold')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument(); // Sold value
    expect(screen.getByText('$800')).toBeInTheDocument(); // Remaining value ($1000 - $200)
  });

  it('displays auction items with correct data', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    const itemCards = screen.getAllByTestId('auction-item-card');
    expect(itemCards).toHaveLength(2);

    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.getByText('Blastoise')).toBeInTheDocument();
  });

  it('handles navigation to auctions page', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const backButton = screen.getByText('Back to Auctions');
    await user.click(backButton);

    expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/auctions');
  });

  it('handles navigation to edit auction page', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const editButton = screen.getByText('Edit Auction');
    await user.click(editButton);

    expect(navigationHelper.navigateTo).toHaveBeenCalledWith(
      '/auctions/test-auction-id/edit'
    );
  });

  it('opens add item modal when clicking add items', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const addItemsButton = screen.getByText('Add Items');
    await user.click(addItemsButton);

    expect(mockModals.addItemModal.openModal).toHaveBeenCalled();
  });

  it('handles adding items to auction', async () => {
    const user = userEvent.setup();

    // Mock modal as open
    vi.mocked(useModal)
      .mockReturnValueOnce({ ...mockModals.addItemModal, isOpen: true })
      .mockReturnValueOnce(mockModals.markSoldModal);

    render(<AuctionDetail />, { wrapper: createWrapper() });

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

  it('handles mark item as sold workflow', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const markSoldButtons = screen.getAllByText('Mark Sold');
    await user.click(markSoldButtons[0]); // Click first item's mark sold button

    expect(mockModals.markSoldModal.openModal).toHaveBeenCalled();
  });

  it('prevents marking already sold items as sold', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    // Find the sold item (should be Blastoise which is marked as sold: true)
    const itemCards = screen.getAllByTestId('auction-item-card');
    const soldItemCard = itemCards.find((card) =>
      card.textContent?.includes('Sold: Yes')
    );

    if (soldItemCard) {
      const markSoldButton = soldItemCard.querySelector('button:first-of-type');
      if (markSoldButton) {
        await user.click(markSoldButton);
        // Modal should not open for already sold items
        expect(mockModals.markSoldModal.openModal).not.toHaveBeenCalled();
      }
    }
  });

  it('handles mark sold form submission', async () => {
    const user = userEvent.setup();

    // Mock mark sold modal as open with selected item
    vi.mocked(useModal)
      .mockReturnValueOnce(mockModals.addItemModal)
      .mockReturnValueOnce({ ...mockModals.markSoldModal, isOpen: true });

    render(<AuctionDetail auctionId="test-auction-id" />, {
      wrapper: createWrapper(),
    });

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    // Should call mark sold for collection item and auction item
    await waitFor(() => {
      expect(mockModals.markSoldModal.closeModal).toHaveBeenCalled();
    });
  });

  it('handles remove item from auction', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    expect(mockModals.removeItemConfirmModal.openModal).toHaveBeenCalled();
  });

  it('handles Facebook post generation', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const generatePostButton = screen.getByText('Generate Post');
    await user.click(generatePostButton);

    expect(mockUseAuction.generateFacebookPost).toHaveBeenCalledWith(
      'test-auction-id'
    );
  });

  it('handles copy to clipboard functionality', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    // First generate post, then copy
    const generatePostButton = screen.getByText('Generate Post');
    await user.click(generatePostButton);

    // Mock the Facebook post as generated
    render(<AuctionDetail />, { wrapper: createWrapper() });

    // Look for copy button in the Facebook post display section
    const copyButtons = screen.getAllByText(/Copy/i);
    if (copyButtons.length > 0) {
      await user.click(copyButtons[0]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });

  it('handles download text file', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const downloadTextButton = screen.getByText('Download Text File');
    await user.click(downloadTextButton);

    expect(mockUseAuction.downloadAuctionTextFile).toHaveBeenCalledWith(
      'test-auction-id'
    );
  });

  it('handles download images zip', async () => {
    const user = userEvent.setup();

    render(<AuctionDetail />, { wrapper: createWrapper() });

    const downloadImagesButton = screen.getByText('Download Images Zip');
    await user.click(downloadImagesButton);

    expect(mockUseAuction.downloadAuctionImagesZip).toHaveBeenCalledWith(
      'test-auction-id'
    );
  });

  it('displays loading state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      loading: true,
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    // PageLayout should handle loading state
    expect(screen.getByText('Test Auction')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Failed to load auction',
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load auction')).toBeInTheDocument();
  });

  it('handles error clearing', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Test error message',
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

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

  it('displays auction not found when no current auction', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: null,
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Auction Not Found')).toBeInTheDocument();
    expect(screen.getByText('Auction not found')).toBeInTheDocument();
    expect(
      screen.getByText(
        "The auction you're looking for doesn't exist or has been deleted."
      )
    ).toBeInTheDocument();
  });

  it('fetches auction by ID on mount', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(mockUseAuction.fetchAuctionById).toHaveBeenCalledWith(
      'test-auction-id'
    );
  });

  it('uses provided auction ID prop over URL', () => {
    render(<AuctionDetail auctionId="prop-auction-id" />, {
      wrapper: createWrapper(),
    });

    expect(mockUseAuction.fetchAuctionById).toHaveBeenCalledWith(
      'prop-auction-id'
    );
  });

  it('clears current auction on unmount', () => {
    const { unmount } = render(<AuctionDetail />, { wrapper: createWrapper() });

    unmount();

    expect(mockUseAuction.clearCurrentAuction).toHaveBeenCalled();
  });

  it('displays auction metadata section', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Auction Details')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Active Status')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument(); // isActive: true
  });

  it('displays generated Facebook post if available', () => {
    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Generated Facebook Post')).toBeInTheDocument();
    expect(screen.getByText('Test Facebook post content')).toBeInTheDocument();
  });

  it('calculates progress correctly with no items', () => {
    const auctionWithNoItems = { ...mockAuction, items: [] };

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: auctionWithNoItems,
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('0.0% of items sold')).toBeInTheDocument();
  });

  it('handles auction items with different categories correctly', () => {
    const auctionWithSealedProduct = {
      ...mockAuction,
      items: [
        ...mockAuction.items,
        {
          itemId: 'sealed-1',
          itemCategory: 'SealedProduct',
          sold: false,
          itemData: {
            _id: 'sealed-1',
            productName: 'Booster Box',
            myPrice: 300,
          },
        },
      ],
    };

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      currentAuction: auctionWithSealedProduct,
    });

    render(<AuctionDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('3 items')).toBeInTheDocument();
  });
});
