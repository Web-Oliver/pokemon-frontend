/**
 * CollectionItemDetail Page Unit Tests
 *
 * Tests CollectionItemDetail page functionality including:
 * - Item display and details rendering
 * - Image gallery and download functionality
 * - Price management and history
 * - Mark as sold workflow
 * - Item-specific sections (PSA, Raw, Sealed)
 * - Navigation and modal interactions
 * - Loading and error states
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CollectionItemDetail from '../CollectionItemDetail';
// Import mocked hooks
import { useCollectionItemFromUrl } from '../../../../shared/hooks/collection/useCollectionItem';
import { useItemOperations } from '../../../../shared/hooks/collection/useItemOperations';
import { usePriceManagement } from '../../../../shared/hooks/collection/usePriceManagement';
import { useImageDownload } from '../../../../shared/hooks/collection/useImageDownload';
import { useModal } from '../../../../shared/hooks/useModal';

// Mock dependencies
vi.mock('../../../../shared/hooks/useModal', () => ({
  useModal: vi.fn(() => ({
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  })),
}));

vi.mock('../../../../shared/hooks/collection/useCollectionItem', () => ({
  useCollectionItemFromUrl: vi.fn(),
}));

vi.mock('../../../../shared/hooks/collection/useItemOperations', () => ({
  useItemOperations: vi.fn(),
}));

vi.mock('../../../../shared/hooks/collection/usePriceManagement', () => ({
  usePriceManagement: vi.fn(),
}));

vi.mock('../../../../shared/hooks/collection/useImageDownload', () => ({
  useImageDownload: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateTo: vi.fn(),
    getItemIdFromUrl: vi.fn(() => 'test-item-id'),
    getItemTypeFromUrl: vi.fn(() => 'psa'),
  },
}));

vi.mock('../../../../shared/utils/helpers/itemDisplayHelpers', () => ({
  getItemDisplayData: vi.fn((item) => ({
    itemName:
      item?.cardId?.cardName || item?.productId?.productName || 'Test Item',
    setName: 'Test Set',
    price: item?.myPrice || 100,
  })),
}));

// Mock component sections
vi.mock('../components/collection', () => ({
  CollectionItemHeader: ({ item, onEdit, onMarkSold, onDelete }: any) => (
    <div data-testid="collection-item-header">
      <h1>
        {item?.cardId?.cardName || item?.productId?.productName || 'Test Item'}
      </h1>
      <button onClick={onEdit}>Edit Item</button>
      <button onClick={onMarkSold}>Mark as Sold</button>
      <button onClick={onDelete}>Delete Item</button>
    </div>
  ),
  ItemEssentialDetails: ({ item }: any) => (
    <div data-testid="item-essential-details">
      <div>Price: ${item?.myPrice || 100}</div>
      <div>Grade: {item?.grade || 'N/A'}</div>
      <div>Condition: {item?.condition || 'N/A'}</div>
    </div>
  ),
  ItemImageGallery: ({ images, onImageDownload }: any) => (
    <div data-testid="item-image-gallery">
      {images?.map((image: string, index: number) => (
        <div key={index} data-testid="gallery-image">
          <img src={image} alt={`Gallery ${index + 1}`} />
          <button onClick={() => onImageDownload(image)}>Download Image</button>
        </div>
      ))}
      {(!images || images.length === 0) && (
        <div data-testid="no-images">No images available</div>
      )}
    </div>
  ),
  ItemPriceHistory: ({ priceHistory, onPriceUpdate }: any) => (
    <div data-testid="item-price-history">
      <h3>Price History</h3>
      {priceHistory?.map((entry: any, index: number) => (
        <div key={index} data-testid="price-entry">
          <span>${entry.price}</span>
          <span>{entry.date}</span>
        </div>
      ))}
      <button onClick={() => onPriceUpdate(150)}>Update Price</button>
    </div>
  ),
  ItemSaleDetails: ({ saleDetails }: any) =>
    saleDetails ? (
      <div data-testid="item-sale-details">
        <h3>Sale Details</h3>
        <div>Sold Price: ${saleDetails.actualSoldPrice}</div>
        <div>Buyer: {saleDetails.buyer}</div>
        <div>Date: {saleDetails.saleDate}</div>
      </div>
    ) : null,
  PsaCardDetailSection: ({ item }: any) => (
    <div data-testid="psa-card-section">
      <h3>PSA Card Details</h3>
      <div>Grade: {item?.grade}</div>
      <div>Cert Number: {item?.certNumber}</div>
    </div>
  ),
  RawCardDetailSection: ({ item }: any) => (
    <div data-testid="raw-card-section">
      <h3>Raw Card Details</h3>
      <div>Condition: {item?.condition}</div>
    </div>
  ),
  SealedProductDetailSection: ({ item }: any) => (
    <div data-testid="sealed-product-section">
      <h3>Sealed Product Details</h3>
      <div>Category: {item?.productId?.category}</div>
      <div>Availability: {item?.availability}</div>
    </div>
  ),
}));

vi.mock(
  '../../../../shared/components/molecules/common/GenericLoadingState',
  () => ({
    default: ({ text }: any) => <div data-testid="loading-state">{text}</div>,
  })
);

vi.mock('../../../../shared/components/forms/MarkSoldForm', () => ({
  MarkSoldForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="mark-sold-form">
      <h3>Mark Item as Sold</h3>
      <button onClick={onCancel}>Cancel</button>
      <button
        onClick={() => onSubmit({ actualSoldPrice: 200, buyer: 'Test Buyer' })}
      >
        Submit Sale
      </button>
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

const mockPsaCard = {
  _id: 'psa-card-1',
  cardId: {
    cardName: 'Charizard',
    setId: { setName: 'Base Set' },
  },
  grade: 10,
  certNumber: 'PSA123456',
  myPrice: 500,
  images: ['image1.jpg', 'image2.jpg'],
  priceHistory: [
    { price: 400, date: '2024-01-01', reason: 'Initial' },
    { price: 500, date: '2024-01-15', reason: 'Market Update' },
  ],
  sold: false,
  saleDetails: null,
};

const mockSoldCard = {
  ...mockPsaCard,
  sold: true,
  saleDetails: {
    actualSoldPrice: 550,
    buyer: 'John Doe',
    saleDate: '2024-01-20',
    platform: 'eBay',
  },
};

describe('CollectionItemDetail Page', () => {
  const mockUseCollectionItem = {
    item: mockPsaCard,
    loading: false,
    error: null,
    refetchItem: vi.fn(),
  };

  const mockUseItemOperations = {
    deleteItem: vi.fn(),
    editItem: vi.fn(),
    markAsSold: vi.fn(),
    loading: false,
  };

  const mockUsePriceManagement = {
    updatePrice: vi.fn(),
    priceHistory: mockPsaCard.priceHistory,
    loading: false,
  };

  const mockUseImageDownload = {
    downloadImage: vi.fn(),
    downloadAllImages: vi.fn(),
    loading: false,
  };

  const mockModal = {
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useCollectionItemFromUrl).mockReturnValue(mockUseCollectionItem);
    vi.mocked(useItemOperations).mockReturnValue(mockUseItemOperations);
    vi.mocked(usePriceManagement).mockReturnValue(mockUsePriceManagement);
    vi.mocked(useImageDownload).mockReturnValue(mockUseImageDownload);
    vi.mocked(useModal).mockReturnValue(mockModal);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders collection item detail page with item information', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.getByTestId('collection-item-header')).toBeInTheDocument();
    expect(screen.getByTestId('item-essential-details')).toBeInTheDocument();
  });

  it('displays PSA card specific section', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('psa-card-section')).toBeInTheDocument();
    expect(screen.getByText('Grade: 10')).toBeInTheDocument();
    expect(screen.getByText('Cert Number: PSA123456')).toBeInTheDocument();
  });

  it('displays raw card section for raw cards', () => {
    const rawCard = {
      _id: 'raw-card-1',
      cardId: { cardName: 'Blastoise' },
      condition: 'Near Mint',
      myPrice: 150,
      images: [],
    };

    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: rawCard,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('raw-card-section')).toBeInTheDocument();
    expect(screen.getByText('Condition: Near Mint')).toBeInTheDocument();
  });

  it('displays sealed product section for sealed products', () => {
    const sealedProduct = {
      _id: 'sealed-1',
      productId: {
        productName: 'Booster Box',
        category: 'booster-box',
      },
      availability: 'In Stock',
      myPrice: 300,
      images: [],
    };

    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: sealedProduct,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('sealed-product-section')).toBeInTheDocument();
    expect(screen.getByText('Category: booster-box')).toBeInTheDocument();
    expect(screen.getByText('Availability: In Stock')).toBeInTheDocument();
  });

  it('displays item essential details', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('item-essential-details')).toBeInTheDocument();
    expect(screen.getByText('Price: $500')).toBeInTheDocument();
    expect(screen.getByText('Grade: 10')).toBeInTheDocument();
  });

  it('displays image gallery with images', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('item-image-gallery')).toBeInTheDocument();

    const galleryImages = screen.getAllByTestId('gallery-image');
    expect(galleryImages).toHaveLength(2);
  });

  it('handles image download', async () => {
    const user = userEvent.setup();

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const downloadButtons = screen.getAllByText('Download Image');
    await user.click(downloadButtons[0]);

    expect(mockUseImageDownload.downloadImage).toHaveBeenCalledWith(
      'image1.jpg'
    );
  });

  it('displays no images message when no images available', () => {
    const itemWithoutImages = {
      ...mockPsaCard,
      images: [],
    };

    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: itemWithoutImages,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('no-images')).toBeInTheDocument();
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('displays price history section', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('item-price-history')).toBeInTheDocument();
    expect(screen.getByText('Price History')).toBeInTheDocument();

    const priceEntries = screen.getAllByTestId('price-entry');
    expect(priceEntries).toHaveLength(2);
    expect(screen.getByText('$400')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('handles price update', async () => {
    const user = userEvent.setup();

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const updatePriceButton = screen.getByText('Update Price');
    await user.click(updatePriceButton);

    expect(mockUsePriceManagement.updatePrice).toHaveBeenCalledWith(150);
  });

  it('handles edit item action', async () => {
    const user = userEvent.setup();

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const editButton = screen.getByText('Edit Item');
    await user.click(editButton);

    expect(mockUseItemOperations.editItem).toHaveBeenCalled();
  });

  it('handles mark as sold action', async () => {
    const user = userEvent.setup();

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const markSoldButton = screen.getByText('Mark as Sold');
    await user.click(markSoldButton);

    expect(mockModal.openModal).toHaveBeenCalled();
  });

  it('handles mark sold form submission', async () => {
    const user = userEvent.setup();

    // Mock modal as open
    vi.mocked(useModal).mockReturnValue({
      ...mockModal,
      isOpen: true,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('mark-sold-form')).toBeInTheDocument();

    const submitButton = screen.getByText('Submit Sale');
    await user.click(submitButton);

    expect(mockUseItemOperations.markAsSold).toHaveBeenCalledWith({
      actualSoldPrice: 200,
      buyer: 'Test Buyer',
    });
  });

  it('handles mark sold form cancellation', async () => {
    const user = userEvent.setup();

    vi.mocked(useModal).mockReturnValue({
      ...mockModal,
      isOpen: true,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockModal.closeModal).toHaveBeenCalled();
  });

  it('handles delete item action', async () => {
    const user = userEvent.setup();

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const deleteButton = screen.getByText('Delete Item');
    await user.click(deleteButton);

    expect(mockUseItemOperations.deleteItem).toHaveBeenCalled();
  });

  it('displays sale details for sold items', () => {
    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: mockSoldCard,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('item-sale-details')).toBeInTheDocument();
    expect(screen.getByText('Sale Details')).toBeInTheDocument();
    expect(screen.getByText('Sold Price: $550')).toBeInTheDocument();
    expect(screen.getByText('Buyer: John Doe')).toBeInTheDocument();
  });

  it('does not display sale details for unsold items', () => {
    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.queryByTestId('item-sale-details')).not.toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      loading: true,
      item: null,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      error: 'Failed to load item',
      item: null,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    // PageLayout should handle the error
    expect(screen.getByText('Collection Item Detail')).toBeInTheDocument();
  });

  it('displays item not found when no item', () => {
    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      loading: false,
      item: null,
    });

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    expect(screen.getByText('Item Not Found')).toBeInTheDocument();
  });

  it('refreshes item data after successful sale', async () => {
    const user = userEvent.setup();

    vi.mocked(useModal).mockReturnValue({
      ...mockModal,
      isOpen: true,
    });

    // Mock successful mark as sold
    mockUseItemOperations.markAsSold.mockResolvedValue(undefined);

    render(<CollectionItemDetail />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Submit Sale');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUseCollectionItem.refetchItem).toHaveBeenCalled();
    });
  });

  it('handles item title display for different item types', () => {
    // Test sealed product title
    const sealedProduct = {
      _id: 'sealed-1',
      productId: {
        productName: 'Elite Trainer Box',
      },
    };

    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: sealedProduct,
    });

    const { rerender } = render(<CollectionItemDetail />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Elite Trainer Box')).toBeInTheDocument();

    // Test unknown item
    vi.mocked(useCollectionItemFromUrl).mockReturnValue({
      ...mockUseCollectionItem,
      item: { _id: 'unknown-1' },
    });

    rerender(<CollectionItemDetail />);

    expect(screen.getByText('Unknown Item')).toBeInTheDocument();
  });
});
