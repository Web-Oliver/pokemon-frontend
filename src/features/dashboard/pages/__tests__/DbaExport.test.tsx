/**
 * DbaExport Page Unit Tests
 *
 * Tests DbaExport page functionality including:
 * - Export configuration and settings
 * - Item selection for DBA export
 * - Custom description handling
 * - Export process workflow
 * - Success and error states
 * - Items with/without timers
 * - Loading states and error handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DbaExport from '../DbaExport';
// Import mocked hook
import { useDbaExport } from '../../../../shared/hooks/useDbaExport';

// Mock dependencies
vi.mock('../../../../shared/hooks/useDbaExport', () => ({
  useDbaExport: vi.fn(),
}));

vi.mock('../../../../shared/utils/ui/themeConfig', () => ({
  useCentralizedTheme: vi.fn(() => ({
    visualTheme: 'context7-premium',
    particleEffectsEnabled: true,
    glassmorphismIntensity: 0.8,
  })),
  themeUtils: {
    getThemeClasses: vi.fn(() => ({})),
    applyTheme: vi.fn(),
    shouldShowParticles: vi.fn(() => true),
  },
}));

// Mock lazy-loaded DBA components
vi.mock('../components/dba/DbaCosmicBackground', () => ({
  default: () => (
    <div data-testid="dba-cosmic-background">Cosmic Background</div>
  ),
}));

vi.mock('../components/dba/DbaHeaderActions', () => ({
  default: ({ onExport, isExporting, hasSelectedItems }: any) => (
    <div data-testid="dba-header-actions">
      <button
        onClick={onExport}
        disabled={isExporting || !hasSelectedItems}
        data-testid="export-button"
      >
        {isExporting ? 'Exporting...' : 'Export to DBA'}
      </button>
    </div>
  ),
}));

vi.mock('../components/dba/DbaExportConfiguration', () => ({
  default: ({
    customDescription,
    onDescriptionChange,
    selectedItemsCount,
    onSelectAll,
    onClearAll,
  }: any) => (
    <div data-testid="dba-export-configuration">
      <h3>Export Configuration</h3>
      <div data-testid="selected-count">
        Selected: {selectedItemsCount} items
      </div>
      <textarea
        data-testid="description-input"
        value={customDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Enter custom description"
      />
      <button onClick={onSelectAll}>Select All</button>
      <button onClick={onClearAll}>Clear All</button>
    </div>
  ),
}));

vi.mock('../components/dba/DbaExportSuccess', () => ({
  default: ({ exportResult, onNewExport }: any) => (
    <div data-testid="dba-export-success">
      <h3>Export Successful!</h3>
      <div>Exported {exportResult?.itemCount} items</div>
      <div>File: {exportResult?.fileName}</div>
      <button onClick={onNewExport}>Start New Export</button>
    </div>
  ),
}));

vi.mock('../components/dba/DbaItemsWithTimers', () => ({
  default: ({ items, selectedItems, onItemToggle, getDbaInfo }: any) => (
    <div data-testid="dba-items-with-timers">
      <h3>Items with Timers</h3>
      {items.map((item: any) => (
        <div key={item._id} data-testid="timer-item">
          <label>
            <input
              type="checkbox"
              checked={selectedItems.has(item._id)}
              onChange={() => onItemToggle(item._id)}
            />
            {getDbaInfo(item).displayName}
          </label>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../components/dba/DbaItemsWithoutTimers', () => ({
  default: ({ items, selectedItems, onItemToggle, getDbaInfo }: any) => (
    <div data-testid="dba-items-without-timers">
      <h3>Items without Timers</h3>
      {items.map((item: any) => (
        <div key={item._id} data-testid="no-timer-item">
          <label>
            <input
              type="checkbox"
              checked={selectedItems.has(item._id)}
              onChange={() => onItemToggle(item._id)}
            />
            {getDbaInfo(item).displayName}
          </label>
        </div>
      ))}
    </div>
  ),
}));

vi.mock(
  '../../../../shared/components/molecules/common/GenericLoadingState',
  () => ({
    default: ({ text }: any) => <div data-testid="loading-state">{text}</div>,
  })
);

vi.mock('../../../../shared/components/molecules/common/EmptyState', () => ({
  default: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
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

const mockPsaCards = [
  {
    _id: 'psa-1',
    cardId: { cardName: 'Charizard' },
    grade: 10,
    myPrice: 500,
    hasTimer: true,
  },
  {
    _id: 'psa-2',
    cardId: { cardName: 'Blastoise' },
    grade: 9,
    myPrice: 200,
    hasTimer: false,
  },
];

const mockRawCards = [
  {
    _id: 'raw-1',
    cardId: { cardName: 'Venusaur' },
    condition: 'Near Mint',
    myPrice: 100,
    hasTimer: false,
  },
];

const mockSealedProducts = [
  {
    _id: 'sealed-1',
    productId: { productName: 'Booster Box' },
    myPrice: 300,
    hasTimer: true,
  },
];

const mockExportResult = {
  success: true,
  itemCount: 3,
  fileName: 'dba_export_20240115.txt',
  timestamp: '2024-01-15T10:00:00Z',
};

describe('DbaExport Page', () => {
  // EXACT match for useDbaExport return type
  const mockUseDbaExport = {
    // Collection data
    psaCards: mockPsaCards,
    rawCards: mockRawCards,
    sealedProducts: mockSealedProducts,
    loading: false,

    // DBA state
    selectedItems: [],
    customDescription: '',
    setCustomDescription: vi.fn(),
    isExporting: false,
    exportResult: null,
    dbaSelections: [],
    error: null,
    loadingDbaSelections: false,

    // Utility functions
    getDbaInfo: vi.fn((itemId, itemType) => ({
      itemId,
      itemType,
      hasTimer: true,
      daysRemaining: 10,
    })),
    getItemDisplayName: vi.fn(
      (item, type) =>
        item.cardId?.cardName || item.productId?.productName || 'Unknown Item'
    ),
    generateDefaultTitle: vi.fn(() => 'Pokemon Collection Export'),
    generateDefaultDescription: vi.fn(() => 'Default description'),

    // Actions
    handleItemToggle: vi.fn(),
    updateItemCustomization: vi.fn(),
    handleExportToDba: vi.fn(),
    downloadZip: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useDbaExport).mockReturnValue(mockUseDbaExport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders DBA export page with header and configuration', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('DBA.dk Export')).toBeInTheDocument();
      expect(
        screen.getByText('Export your Pokemon collection to DBA.dk format')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('dba-export-configuration')
      ).toBeInTheDocument();
    });
  });

  it('displays cosmic background and header actions', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('dba-cosmic-background')).toBeInTheDocument();
      expect(screen.getByTestId('dba-header-actions')).toBeInTheDocument();
    });
  });

  it('displays items with timers section', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('dba-items-with-timers')).toBeInTheDocument();
      expect(screen.getByText('Items with Timers')).toBeInTheDocument();

      // Should show items that have timers
      const timerItems = screen.getAllByTestId('timer-item');
      expect(timerItems.length).toBeGreaterThan(0);
    });
  });

  it('displays items without timers section', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByTestId('dba-items-without-timers')
      ).toBeInTheDocument();
      expect(screen.getByText('Items without Timers')).toBeInTheDocument();

      // Should show items that don't have timers
      const noTimerItems = screen.getAllByTestId('no-timer-item');
      expect(noTimerItems.length).toBeGreaterThan(0);
    });
  });

  it('handles custom description input', async () => {
    const user = userEvent.setup();

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const descriptionInput = screen.getByTestId('description-input');
      expect(descriptionInput).toBeInTheDocument();
    });

    const descriptionInput = screen.getByTestId('description-input');
    await user.type(descriptionInput, 'Custom export description');

    expect(mockUseDbaExport.setCustomDescription).toHaveBeenCalledWith(
      'Custom export description'
    );
  });

  it('handles item selection toggle', async () => {
    const user = userEvent.setup();

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstCheckbox);

    expect(mockUseDbaExport.toggleItemSelection).toHaveBeenCalled();
  });

  it('handles select all items', async () => {
    const user = userEvent.setup();

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const selectAllButton = screen.getByText('Select All');
      expect(selectAllButton).toBeInTheDocument();
    });

    const selectAllButton = screen.getByText('Select All');
    await user.click(selectAllButton);

    expect(mockUseDbaExport.selectAllItems).toHaveBeenCalled();
  });

  it('handles clear all selections', async () => {
    const user = userEvent.setup();

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const clearAllButton = screen.getByText('Clear All');
      expect(clearAllButton).toBeInTheDocument();
    });

    const clearAllButton = screen.getByText('Clear All');
    await user.click(clearAllButton);

    expect(mockUseDbaExport.clearAllSelections).toHaveBeenCalled();
  });

  it('displays selected items count', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      selectedItems: new Set(['psa-1', 'sealed-1']),
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Selected: 2 items')).toBeInTheDocument();
    });
  });

  it('handles export to DBA action', async () => {
    const user = userEvent.setup();

    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      selectedItems: new Set(['psa-1']),
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).not.toBeDisabled();
    });

    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    expect(mockUseDbaExport.exportToDba).toHaveBeenCalled();
  });

  it('disables export button when no items selected', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
    });
  });

  it('shows exporting state during export', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      isExporting: true,
      selectedItems: new Set(['psa-1']),
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
    });
  });

  it('displays export success state', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      exportResult: mockExportResult,
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('dba-export-success')).toBeInTheDocument();
      expect(screen.getByText('Export Successful!')).toBeInTheDocument();
      expect(screen.getByText('Exported 3 items')).toBeInTheDocument();
      expect(
        screen.getByText('File: dba_export_20240115.txt')
      ).toBeInTheDocument();
    });
  });

  it('handles start new export action', async () => {
    const user = userEvent.setup();

    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      exportResult: mockExportResult,
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      const newExportButton = screen.getByText('Start New Export');
      expect(newExportButton).toBeInTheDocument();
    });

    const newExportButton = screen.getByText('Start New Export');
    await user.click(newExportButton);

    expect(mockUseDbaExport.resetExport).toHaveBeenCalled();
  });

  it('displays loading state correctly', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      loading: true,
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  it('displays error state correctly', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      error: 'Failed to load collection items',
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    // PageLayout should handle the error
    expect(screen.getByText('DBA.dk Export')).toBeInTheDocument();
  });

  it('displays empty state when no items available', async () => {
    vi.mocked(useDbaExport).mockReturnValue({
      ...mockUseDbaExport,
      psaCards: [],
      rawCards: [],
      sealedProducts: [],
    });

    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('categorizes items correctly by timer status', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show both sections
      expect(screen.getByTestId('dba-items-with-timers')).toBeInTheDocument();
      expect(
        screen.getByTestId('dba-items-without-timers')
      ).toBeInTheDocument();

      // Items with timers: psa-1 (Charizard), sealed-1 (Booster Box)
      const timerItems = screen.getAllByTestId('timer-item');
      expect(timerItems.length).toBeGreaterThanOrEqual(1);

      // Items without timers: psa-2 (Blastoise), raw-1 (Venusaur)
      const noTimerItems = screen.getAllByTestId('no-timer-item');
      expect(noTimerItems.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles item display name generation correctly', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockUseDbaExport.getDbaInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(String),
        })
      );
      expect(mockUseDbaExport.getItemDisplayName).toHaveBeenCalled();
    });
  });

  it('generates default export title', async () => {
    render(<DbaExport />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockUseDbaExport.generateDefaultTitle).toHaveBeenCalled();
    });
  });
});
