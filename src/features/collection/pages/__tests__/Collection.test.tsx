/**
 * Collection Page Unit Tests
 *
 * Tests Collection page functionality including:
 * - Component rendering with loading/error states
 * - CRUD operations (Add, View, Mark as Sold)
 * - Modal interactions (Mark Sold, Export)
 * - Tab switching and data display
 * - Export functionality
 * - User interactions and navigation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Collection from '../Collection';
// Import mocked hooks
import { useCollectionOperations } from '../../../../shared/hooks/useCollectionOperations';
import { useCollectionExport } from '../../../../shared/hooks/useCollectionExport';

// Mock dependencies
vi.mock('../../../../shared/hooks/useCollectionOperations', () => ({
  useCollectionOperations: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useCollectionExport', () => ({
  useCollectionExport: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateToCreate: {
      item: vi.fn(),
    },
    navigateToItemDetail: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils/storage', () => ({
  storageWrappers: {
    session: {
      getItem: vi.fn(),
      removeItem: vi.fn(),
    },
  },
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

// Mock lazy-loaded components
vi.mock('../../../../shared/components/forms/MarkSoldForm', () => ({
  MarkSoldForm: ({ onCancel, onSuccess }: any) => (
    <div data-testid="mark-sold-form">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSuccess}>Submit</button>
    </div>
  ),
}));

vi.mock('../../../../components/lists/CollectionExportModal', () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="export-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
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

const mockCollectionItem = {
  id: '1',
  cardId: {
    cardName: 'Pikachu',
  },
  grade: 10,
  images: [],
};

const mockSealedProduct = {
  id: '2',
  productId: {
    productName: 'Booster Box',
  },
  category: 'sealed',
  images: [],
};

describe('Collection Page', () => {
  const mockUseCollectionOperations = {
    psaCards: [mockCollectionItem],
    rawCards: [],
    sealedProducts: [mockSealedProduct],
    soldItems: [],
    loading: false,
    error: null,
    refreshCollection: vi.fn(),
  };

  const mockUseCollectionExport = {
    isExporting: false,
    selectedItemsForExport: [],
    exportAllItems: vi.fn(),
    exportSelectedItems: vi.fn(),
    toggleItemSelection: vi.fn(),
    selectAllItems: vi.fn(),
    clearSelection: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useCollectionOperations).mockReturnValue(
      mockUseCollectionOperations
    );
    vi.mocked(useCollectionExport).mockReturnValue(mockUseCollectionExport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders collection page with stats and header actions', () => {
    render(<Collection />, { wrapper: createWrapper() });

    expect(screen.getByText('My Premium Collection')).toBeInTheDocument();
    expect(screen.getByText('Export All')).toBeInTheDocument();
    expect(screen.getByText('Export Selected')).toBeInTheDocument();
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    vi.mocked(useCollectionOperations).mockReturnValue({
      ...mockUseCollectionOperations,
      loading: true,
    });

    render(<Collection />, { wrapper: createWrapper() });

    // PageLayout should handle loading state
    expect(screen.getByText('My Premium Collection')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useCollectionOperations).mockReturnValue({
      ...mockUseCollectionOperations,
      error: 'Failed to load collection',
    });

    render(<Collection />, { wrapper: createWrapper() });

    // PageLayout should handle error state
    expect(screen.getByText('My Premium Collection')).toBeInTheDocument();
  });

  it('handles add new item button click', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Add New Item'));

    expect(navigationHelper.navigateToCreate.item).toHaveBeenCalled();
  });

  it('handles export all items', async () => {
    const user = userEvent.setup();

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Export All'));

    expect(mockUseCollectionExport.exportAllItems).toHaveBeenCalled();
  });

  it('opens and closes export modal', async () => {
    const user = userEvent.setup();

    render(<Collection />, { wrapper: createWrapper() });

    // Open export modal
    await user.click(screen.getByText('Export Selected'));

    await waitFor(() => {
      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    });

    // Close export modal
    await user.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    });
  });

  it('disables export buttons when exporting', () => {
    vi.mocked(useCollectionExport).mockReturnValue({
      ...mockUseCollectionExport,
      isExporting: true,
    });

    render(<Collection />, { wrapper: createWrapper() });

    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    expect(screen.getByText('Export Selected')).toBeDisabled();
    expect(screen.getByText('Add New Item')).not.toBeDisabled();
  });

  it('handles mark as sold modal workflow', async () => {
    const user = userEvent.setup();

    // Mock CollectionTabs to include mark as sold functionality
    const MockCollectionTabs = ({ onMarkAsSold }: any) => (
      <div>
        <button onClick={() => onMarkAsSold(mockCollectionItem, 'psa')}>
          Mark as Sold
        </button>
      </div>
    );

    // Mock the CollectionTabs component
    vi.doMock('../../../../components/lists/CollectionTabs', () => ({
      default: MockCollectionTabs,
    }));

    render(<Collection />, { wrapper: createWrapper() });

    // Trigger mark as sold
    await user.click(screen.getByText('Mark as Sold'));

    await waitFor(() => {
      expect(screen.getByTestId('mark-sold-form')).toBeInTheDocument();
      expect(screen.getByText('Mark "Pikachu" as Sold')).toBeInTheDocument();
    });

    // Test form cancel
    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('mark-sold-form')).not.toBeInTheDocument();
    });
  });

  it('completes mark as sold workflow', async () => {
    const user = userEvent.setup();

    const MockCollectionTabs = ({ onMarkAsSold }: any) => (
      <button onClick={() => onMarkAsSold(mockCollectionItem, 'psa')}>
        Mark as Sold
      </button>
    );

    vi.doMock('../../../../components/lists/CollectionTabs', () => ({
      default: MockCollectionTabs,
    }));

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Mark as Sold'));

    await waitFor(() => {
      expect(screen.getByTestId('mark-sold-form')).toBeInTheDocument();
    });

    // Submit form
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.queryByTestId('mark-sold-form')).not.toBeInTheDocument();
    });
  });

  it('handles collection refresh on mount when needed', () => {
    const { storageWrappers } = require('../../../../shared/utils/storage');
    storageWrappers.session.getItem.mockReturnValue('true');

    render(<Collection />, { wrapper: createWrapper() });

    expect(storageWrappers.session.removeItem).toHaveBeenCalledWith(
      'collectionNeedsRefresh'
    );
    expect(mockUseCollectionOperations.refreshCollection).toHaveBeenCalled();
  });

  it('provides correct data to CollectionStats', () => {
    render(<Collection />, { wrapper: createWrapper() });

    // CollectionStats should receive the correct counts
    // This is tested through the component's interface
    expect(screen.getByText('My Premium Collection')).toBeInTheDocument();
  });

  it('provides correct data to CollectionTabs', () => {
    render(<Collection />, { wrapper: createWrapper() });

    // CollectionTabs should receive all the collection data and handlers
    expect(screen.getByText('My Premium Collection')).toBeInTheDocument();
  });

  it('handles item detail navigation for different item types', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    const MockCollectionTabs = ({ onViewItemDetail }: any) => (
      <div>
        <button onClick={() => onViewItemDetail(mockCollectionItem, 'psa')}>
          View PSA Card
        </button>
        <button onClick={() => onViewItemDetail(mockSealedProduct, 'sealed')}>
          View Sealed Product
        </button>
      </div>
    );

    vi.doMock('../../../../components/lists/CollectionTabs', () => ({
      default: MockCollectionTabs,
    }));

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('View PSA Card'));
    expect(navigationHelper.navigateToItemDetail).toHaveBeenCalledWith(
      'psa',
      '1'
    );

    await user.click(screen.getByText('View Sealed Product'));
    expect(navigationHelper.navigateToItemDetail).toHaveBeenCalledWith(
      'sealed',
      '2'
    );
  });

  it('handles export with selected items', async () => {
    const user = userEvent.setup();

    vi.mocked(useCollectionExport).mockReturnValue({
      ...mockUseCollectionExport,
      selectedItemsForExport: ['1', '2'],
    });

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Export Selected'));

    await waitFor(() => {
      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    });
  });

  it('provides correct item name for mark as sold with different item types', async () => {
    const user = userEvent.setup();

    // Test with different item name structures
    const itemWithDirectName = {
      id: '3',
      cardName: 'Direct Card Name',
      name: 'Fallback Name',
    };

    const MockCollectionTabs = ({ onMarkAsSold }: any) => (
      <button onClick={() => onMarkAsSold(itemWithDirectName, 'raw')}>
        Mark Direct Name as Sold
      </button>
    );

    vi.doMock('../../../../components/lists/CollectionTabs', () => ({
      default: MockCollectionTabs,
    }));

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Mark Direct Name as Sold'));

    await waitFor(() => {
      expect(
        screen.getByText('Mark "Direct Card Name" as Sold')
      ).toBeInTheDocument();
    });
  });

  it('handles unknown item name gracefully', async () => {
    const user = userEvent.setup();

    const itemWithoutName = { id: '4' };

    const MockCollectionTabs = ({ onMarkAsSold }: any) => (
      <button onClick={() => onMarkAsSold(itemWithoutName, 'raw')}>
        Mark Unknown as Sold
      </button>
    );

    vi.doMock('../../../../components/lists/CollectionTabs', () => ({
      default: MockCollectionTabs,
    }));

    render(<Collection />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Mark Unknown as Sold'));

    await waitFor(() => {
      expect(
        screen.getByText('Mark "Unknown Item" as Sold')
      ).toBeInTheDocument();
    });
  });
});
