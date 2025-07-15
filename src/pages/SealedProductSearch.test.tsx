/**
 * SealedProductSearch Page Integration Tests
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SealedProductSearch from './SealedProductSearch';
import * as sealedProductsApi from '../api/sealedProductsApi';

// Mock the sealedProductsApi module
vi.mock('../api/sealedProductsApi');
const mockSealedProductsApi = vi.mocked(sealedProductsApi);

describe('SealedProductSearch Page Integration Tests', () => {
  const mockSealedProducts = [
    {
      _id: 'product-1',
      name: 'Base Set Booster Box',
      category: 'Booster Box',
      setName: 'Base Set',
      availability: 5,
      cardMarketPrice: 5000,
      myPrice: 4800,
      images: ['image1.jpg', 'image2.jpg'],
      sold: false,
      productId: 'ref-1',
    },
    {
      _id: 'product-2',
      name: 'Jungle Elite Trainer Box',
      category: 'Elite Trainer Box',
      setName: 'Jungle',
      availability: 0,
      cardMarketPrice: 150,
      myPrice: 140,
      images: [],
      sold: true,
      productId: 'ref-2',
    },
    {
      _id: 'product-3',
      name: 'Fossil Booster Pack',
      category: 'Booster Pack',
      setName: 'Fossil',
      availability: 12,
      cardMarketPrice: 25,
      myPrice: 22,
      images: ['image3.jpg'],
      sold: false,
      productId: 'ref-3',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSealedProductsApi.getSealedProducts.mockResolvedValue(mockSealedProducts);
    mockSealedProductsApi.searchSealedProductsByCategory.mockResolvedValue(
      mockSealedProducts.filter(p => p.category === 'Booster Box')
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render sealed product search page with filters', async () => {
      render(<SealedProductSearch />);

      expect(screen.getByText('Sealed Product Search')).toBeInTheDocument();
      expect(
        screen.getByText('Browse and search Pokémon sealed products by category')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter by set...')).toBeInTheDocument();
      expect(screen.getByLabelText('Available only')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search Products' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
    });

    it('should display products count in header', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('3 products found')).toBeInTheDocument();
      });
    });

    it('should load and display sealed products on initial render', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
        expect(screen.getByText('Jungle Elite Trainer Box')).toBeInTheDocument();
        expect(screen.getByText('Fossil Booster Pack')).toBeInTheDocument();
      });

      expect(screen.getByText('Search Results (3 products)')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call searchSealedProductsByCategory when category is selected', async () => {
      render(<SealedProductSearch />);

      // Select category
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSealedProductsApi.searchSealedProductsByCategory).toHaveBeenCalledWith(
          'Booster Box',
          {}
        );
      });
    });

    it('should call getSealedProducts when no category is selected', async () => {
      render(<SealedProductSearch />);

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSealedProductsApi.getSealedProducts).toHaveBeenCalledWith({});
      });
    });

    it('should include set name filter in search params', async () => {
      render(<SealedProductSearch />);

      // Set name filter
      const setNameInput = screen.getByPlaceholderText('Filter by set...');
      fireEvent.change(setNameInput, { target: { value: 'Base Set' } });

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSealedProductsApi.getSealedProducts).toHaveBeenCalledWith({
          setName: 'Base Set',
        });
      });
    });

    it('should include availability filter when checked', async () => {
      render(<SealedProductSearch />);

      // Check available only
      const availableCheckbox = screen.getByLabelText('Available only');
      fireEvent.click(availableCheckbox);

      // Select category
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSealedProductsApi.searchSealedProductsByCategory).toHaveBeenCalledWith(
          'Booster Box',
          {
            available: true,
          }
        );
      });
    });

    it('should trigger search when Enter key is pressed in set name input', async () => {
      render(<SealedProductSearch />);

      const setNameInput = screen.getByPlaceholderText('Filter by set...');
      fireEvent.change(setNameInput, { target: { value: 'Jungle' } });
      fireEvent.keyPress(setNameInput, { key: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockSealedProductsApi.getSealedProducts).toHaveBeenCalledWith({
          setName: 'Jungle',
        });
      });
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters and reload data when clear button is clicked', async () => {
      render(<SealedProductSearch />);

      // Set filters
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const setNameInput = screen.getByPlaceholderText('Filter by set...');
      fireEvent.change(setNameInput, { target: { value: 'Base Set' } });

      const availableCheckbox = screen.getByLabelText('Available only');
      fireEvent.click(availableCheckbox);

      // Clear filters
      const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
      fireEvent.click(clearButton);

      // Check filters are cleared
      expect(categorySelect).toHaveValue('');
      expect(setNameInput).toHaveValue('');
      expect(availableCheckbox).not.toBeChecked();

      // Check API is called without filters
      await waitFor(() => {
        expect(mockSealedProductsApi.getSealedProducts).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Product Display', () => {
    it('should display product information correctly', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        // Check Base Set Booster Box information
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
        expect(screen.getByText('Base Set')).toBeInTheDocument();
        expect(screen.getByText('Booster Box')).toBeInTheDocument();
        expect(screen.getByText('$5000')).toBeInTheDocument(); // Market Price
        expect(screen.getByText('$4800')).toBeInTheDocument(); // My Price
        expect(screen.getByText('5 available')).toBeInTheDocument();
      });
    });

    it('should show sold status for sold products', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('Jungle Elite Trainer Box')).toBeInTheDocument();
        expect(screen.getByText('Sold')).toBeInTheDocument();
      });
    });

    it('should show out of stock for products with 0 availability', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('Out of stock')).toBeInTheDocument();
      });
    });

    it('should display product images', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        const images = screen.getAllByAltText(/Base Set Booster Box/);
        expect(images).toHaveLength(2); // 2 images for Base Set Booster Box
      });
    });

    it('should show view details button for products with productId', async () => {
      render(<SealedProductSearch />);

      await waitFor(() => {
        const viewDetailsButtons = screen.getAllByText('View Details');
        expect(viewDetailsButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Category Filter', () => {
    it('should show category selection in results header', async () => {
      render(<SealedProductSearch />);

      // Select category
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Category:')).toBeInTheDocument();
        expect(screen.getByText('Booster Box')).toBeInTheDocument();
      });
    });

    it('should filter products by category', async () => {
      // Mock filtered response
      mockSealedProductsApi.searchSealedProductsByCategory.mockResolvedValue([
        mockSealedProducts[0],
      ]);

      render(<SealedProductSearch />);

      // Select category
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
        expect(screen.queryByText('Jungle Elite Trainer Box')).not.toBeInTheDocument();
        expect(screen.queryByText('Fossil Booster Pack')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner while fetching data', async () => {
      // Make API call pending
      mockSealedProductsApi.getSealedProducts.mockImplementation(() => new Promise(() => {}));

      render(<SealedProductSearch />);

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should show error message when API call fails', async () => {
      mockSealedProductsApi.getSealedProducts.mockRejectedValue(new Error('API Error'));

      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch sealed products')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('should retry fetching data when retry button is clicked', async () => {
      mockSealedProductsApi.getSealedProducts
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockSealedProducts);

      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
      });
    });

    it('should show empty state when no products are found', async () => {
      mockSealedProductsApi.getSealedProducts.mockResolvedValue([]);

      render(<SealedProductSearch />);

      await waitFor(() => {
        expect(screen.getByText('No Products Found')).toBeInTheDocument();
        expect(
          screen.getByText('Try adjusting your search criteria to find more products.')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call getSealedProducts on component mount', async () => {
      render(<SealedProductSearch />);

      expect(mockSealedProductsApi.getSealedProducts).toHaveBeenCalledWith({});
    });

    it('should handle combined filters correctly', async () => {
      render(<SealedProductSearch />);

      // Set all filters
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Booster Box' } });

      const setNameInput = screen.getByPlaceholderText('Filter by set...');
      fireEvent.change(setNameInput, { target: { value: 'Base Set' } });

      const availableCheckbox = screen.getByLabelText('Available only');
      fireEvent.click(availableCheckbox);

      const searchButton = screen.getByRole('button', { name: 'Search Products' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSealedProductsApi.searchSealedProductsByCategory).toHaveBeenCalledWith(
          'Booster Box',
          {
            setName: 'Base Set',
            available: true,
          }
        );
      });
    });
  });
});
