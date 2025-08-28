/**
 * AddEditItem Page Unit Tests
 *
 * Tests AddEditItem page functionality including:
 * - Component rendering and loading states
 * - Item type selection and form rendering
 * - Edit mode detection and item fetching
 * - Form submission and navigation
 * - Error handling and user interactions
 * - URL parsing and route handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddEditItem from '../AddEditItem';
import { CollectionItemService } from '../services/CollectionItemService';

// Mock dependencies
vi.mock('../../../shared/hooks/useCollectionOperations', () => ({
  useCollectionOperations: vi.fn(() => ({
    loading: false,
    error: null,
  })),
}));

vi.mock('../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateToCollection: vi.fn(),
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../shared/utils/storage', () => ({
  storageWrappers: {
    session: {
      setItem: vi.fn(),
    },
  },
}));

vi.mock('../../../shared/utils/ui/themeConfig', () => ({
  useCentralizedTheme: vi.fn(() => ({
    currentTheme: 'cosmic',
    animation: { enabled: true },
  })),
}));

vi.mock('../../../shared/utils/helpers/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('../../../shared/utils/performance/logger', () => ({
  log: vi.fn(),
}));

vi.mock('../services/CollectionItemService', () => ({
  CollectionItemService: {
    isEditMode: vi.fn(() => false),
    parseEditUrl: vi.fn(),
    fetchItemForEdit: vi.fn(),
  },
}));

// Mock lazy-loaded forms
vi.mock('../../../shared/components/forms/AddEditCardForm', () => ({
  default: ({ cardType, onCancel, onSuccess, isEditing, initialData }: any) => (
    <div data-testid="add-edit-card-form">
      <div>Card Type: {cardType}</div>
      <div>Editing: {isEditing ? 'Yes' : 'No'}</div>
      {initialData && <div>Has Initial Data</div>}
      <button onClick={onCancel}>Cancel Form</button>
      <button onClick={onSuccess}>Submit Form</button>
    </div>
  ),
}));

vi.mock('../../../shared/components/forms/AddEditSealedProductForm', () => ({
  default: ({ onCancel, onSuccess, isEditing, initialData }: any) => (
    <div data-testid="add-edit-sealed-form">
      <div>Editing: {isEditing ? 'Yes' : 'No'}</div>
      {initialData && <div>Has Initial Data</div>}
      <button onClick={onCancel}>Cancel Form</button>
      <button onClick={onSuccess}>Submit Form</button>
    </div>
  ),
}));

// Mock window.location and window.dispatchEvent
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/add-item',
  },
  writable: true,
});

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
});

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
  id: '1',
  cardId: { cardName: 'Pikachu' },
  grade: 10,
  images: [],
};

describe('AddEditItem Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders add item page with item type selection', () => {
    render(<AddEditItem />, { wrapper: createWrapper() });

    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Collection Type')).toBeInTheDocument();
    expect(screen.getByText('PSA Graded Card')).toBeInTheDocument();
    expect(screen.getByText('Raw Card')).toBeInTheDocument();
    expect(screen.getByText('Sealed Product')).toBeInTheDocument();
  });

  it('displays correct page title and subtitle for add mode', () => {
    render(<AddEditItem />, { wrapper: createWrapper() });

    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(
      screen.getByText('Expand your collection with a new treasure')
    ).toBeInTheDocument();
  });

  it('shows PSA graded card form when PSA option is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('PSA Graded Card'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
      expect(screen.getByText('Card Type: psa-graded')).toBeInTheDocument();
      expect(screen.getByText('Editing: No')).toBeInTheDocument();
    });
  });

  it('shows raw card form when raw card option is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Raw Card'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
      expect(screen.getByText('Card Type: raw-card')).toBeInTheDocument();
      expect(screen.getByText('Editing: No')).toBeInTheDocument();
    });
  });

  it('shows sealed product form when sealed product option is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Sealed Product'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-sealed-form')).toBeInTheDocument();
      expect(screen.getByText('Editing: No')).toBeInTheDocument();
    });
  });

  it('allows going back to item type selection from form', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    // Select PSA card
    await user.click(screen.getByText('PSA Graded Card'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByLabelText('Back to item type selection');
    await user.click(backButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId('add-edit-card-form')
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Choose Your Collection Type')
      ).toBeInTheDocument();
    });
  });

  it('handles form cancellation correctly', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('PSA Graded Card'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel Form'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('add-edit-card-form')
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Choose Your Collection Type')
      ).toBeInTheDocument();
    });
  });

  it('handles form submission successfully for new item', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../shared/utils/navigation'
    );
    const { storageWrappers } = await import('../../../shared/utils/storage');

    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('PSA Graded Card'));

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Submit Form'));

    expect(storageWrappers.session.setItem).toHaveBeenCalledWith(
      'collectionNeedsRefresh',
      'true'
    );
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      new CustomEvent('collectionUpdated')
    );
    expect(navigationHelper.navigateToCollection).toHaveBeenCalled();
  });

  it('detects edit mode and fetches item data', async () => {
    // Mock edit mode detection
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockResolvedValue({
      item: mockPsaCard,
      itemType: 'psa-graded',
    });

    // Mock edit URL
    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/psa-graded/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(CollectionItemService.isEditMode).toHaveBeenCalledWith(
        '/collection/edit/psa-graded/1'
      );
      expect(CollectionItemService.parseEditUrl).toHaveBeenCalledWith(
        '/collection/edit/psa-graded/1'
      );
      expect(CollectionItemService.fetchItemForEdit).toHaveBeenCalledWith(
        'psa-graded',
        '1'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Collection Item')).toBeInTheDocument();
      expect(
        screen.getByText('Update your precious collection item with care')
      ).toBeInTheDocument();
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
      expect(screen.getByText('Editing: Yes')).toBeInTheDocument();
      expect(screen.getByText('Has Initial Data')).toBeInTheDocument();
    });
  });

  it('handles edit mode form submission with navigation to item detail', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../shared/utils/navigation'
    );

    // Setup edit mode
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockResolvedValue({
      item: mockPsaCard,
      itemType: 'psa-graded',
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/psa-graded/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Submit Form'));

    expect(navigationHelper.navigateTo).toHaveBeenCalledWith(
      '/collection/psa-graded/1'
    );
  });

  it('shows loading state when fetching item for edit', () => {
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    // Don't resolve the promise to show loading state
    vi.mocked(CollectionItemService.fetchItemForEdit).mockImplementation(
      () => new Promise(() => {})
    );

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/psa-graded/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    // PageLayout should show loading state via the loading prop
    expect(screen.getByText('Edit Collection Item')).toBeInTheDocument();
  });

  it('shows error state when fetching item for edit fails', async () => {
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockRejectedValue(
      new Error('Failed to fetch')
    );

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/psa-graded/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      // PageLayout should show error state via the error prop
      expect(screen.getByText('Edit Collection Item')).toBeInTheDocument();
    });
  });

  it('handles edit mode with invalid URL gracefully', async () => {
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue(null);

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/invalid' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    // Should not crash and should show add mode
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Collection Type')).toBeInTheDocument();
  });

  it('displays collection active status in header', () => {
    render(<AddEditItem />, { wrapper: createWrapper() });

    expect(screen.getByText('Collection Active')).toBeInTheDocument();
  });

  it('shows step progress indicator when form is displayed', async () => {
    const user = userEvent.setup();
    render(<AddEditItem />, { wrapper: createWrapper() });

    await user.click(screen.getByText('PSA Graded Card'));

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });
  });

  it('does not show back button in edit mode', async () => {
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockResolvedValue({
      item: mockPsaCard,
      itemType: 'psa-graded',
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/psa-graded/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    expect(
      screen.queryByLabelText('Back to item type selection')
    ).not.toBeInTheDocument();
  });

  it('handles edit mode form submission with fallback navigation on path parsing failure', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../shared/utils/navigation'
    );

    // Setup edit mode
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'psa-graded',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockResolvedValue({
      item: mockPsaCard,
      itemType: 'psa-graded',
    });

    // Mock invalid path for fallback testing
    Object.defineProperty(window, 'location', {
      value: { pathname: '/invalid/path' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-card-form')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Submit Form'));

    // Should fallback to collection navigation
    expect(navigationHelper.navigateToCollection).toHaveBeenCalled();
  });

  it('displays correct form for each item type with initial data in edit mode', async () => {
    vi.mocked(CollectionItemService.isEditMode).mockReturnValue(true);
    vi.mocked(CollectionItemService.parseEditUrl).mockReturnValue({
      type: 'sealed-product',
      id: '1',
    });
    vi.mocked(CollectionItemService.fetchItemForEdit).mockResolvedValue({
      item: { id: '1', productName: 'Booster Box' },
      itemType: 'sealed-product',
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/collection/edit/sealed-product/1' },
      writable: true,
    });

    render(<AddEditItem />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('add-edit-sealed-form')).toBeInTheDocument();
      expect(screen.getByText('Editing: Yes')).toBeInTheDocument();
      expect(screen.getByText('Has Initial Data')).toBeInTheDocument();
    });
  });
});
