/**
 * Sealed Product Search Page Component
 * Layer 4: Views/Pages (Application Screens)
 * Following CLAUDE.md principles: Beautiful design, SRP, and integration with domain layer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, Filter, ExternalLink } from 'lucide-react';
import { SealedProductCategory } from '../domain/models/sealedProduct';
import * as sealedProductsApi from '../api/sealedProductsApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const SealedProductSearch: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sealedProducts, setSealedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [setNameFilter, setSetNameFilter] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  // Get category options from enum
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.values(SealedProductCategory).map(category => ({
      value: category,
      label: category,
    })),
  ];

  // Fetch all sealed products (no category filter)
  const fetchAllSealedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(setNameFilter && { setName: setNameFilter }),
      };

      log('Fetching all sealed products with params:', params);

      const products = await sealedProductsApi.getSealedProducts(params);
      setSealedProducts(products);

      log('Sealed products fetched successfully:', products.length, 'products');
    } catch (error) {
      const errorMessage = 'Failed to fetch sealed products';
      setError(errorMessage);
      handleApiError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setNameFilter]);

  // Fetch sealed products by category
  const fetchSealedProductsByCategory = async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(setNameFilter && { setName: setNameFilter }),
        ...(availableOnly && { available: true }),
      };

      log('Fetching sealed products by category:', category, 'with params:', params);

      const products = await sealedProductsApi.searchSealedProductsByCategory(category, params);
      setSealedProducts(products);

      log('Sealed products fetched successfully:', products.length, 'products');
    } catch (error) {
      const errorMessage = 'Failed to fetch sealed products';
      setError(errorMessage);
      handleApiError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (selectedCategory) {
      fetchSealedProductsByCategory(selectedCategory);
    } else {
      fetchAllSealedProducts();
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSetNameFilter('');
    setAvailableOnly(false);
    fetchAllSealedProducts();
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Handle set name change
  const handleSetNameChange = (value: string) => {
    setSetNameFilter(value);
  };

  // Handle availability toggle
  const handleAvailabilityChange = (checked: boolean) => {
    setAvailableOnly(checked);
  };

  // Handle Enter key in search inputs
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllSealedProducts();
  }, [fetchAllSealedProducts]);

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Page Header */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Sealed Product Search</h1>
              <p className='mt-1 text-gray-600'>
                Browse and search Pokémon sealed products by category
              </p>
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              <Package className='w-4 h-4 mr-1' />
              {sealedProducts.length} products found
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            {/* Category Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
              <div className='relative'>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Select
                  value={selectedCategory}
                  onChange={e => handleCategoryChange(e.target.value)}
                  options={categoryOptions}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Set Name Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Set Name</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  type='text'
                  placeholder='Filter by set...'
                  value={setNameFilter}
                  onChange={e => handleSetNameChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Available Only Filter */}
            <div className='flex items-end'>
              <label className='flex items-center space-x-2 pb-2'>
                <input
                  type='checkbox'
                  checked={availableOnly}
                  onChange={e => handleAvailabilityChange(e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>Available only</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-2 md:col-span-2'>
              <button
                onClick={handleSearch}
                disabled={loading}
                className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Search Products
              </button>
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className='w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6'>
            {loading && (
              <div className='flex justify-center items-center py-12'>
                <LoadingSpinner size='lg' />
              </div>
            )}

            {error && (
              <div className='text-center py-12'>
                <div className='text-red-500 mb-4'>
                  <Package className='mx-auto w-12 h-12' />
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Error Loading Products</h3>
                <p className='text-gray-500 mb-4'>{error}</p>
                <button
                  onClick={() => handleSearch()}
                  className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && sealedProducts.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <Package className='mx-auto w-12 h-12' />
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No Products Found</h3>
                <p className='text-gray-500 mb-4'>
                  Try adjusting your search criteria to find more products.
                </p>
                <button
                  onClick={handleClearFilters}
                  className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && sealedProducts.length > 0 && (
              <>
                {/* Results Header */}
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Search Results ({sealedProducts.length} products)
                  </h2>
                  {selectedCategory && (
                    <div className='text-sm text-gray-500'>
                      Category: <span className='font-medium'>{selectedCategory}</span>
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {sealedProducts.map(product => (
                    <div
                      key={product._id}
                      className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='space-y-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900 truncate'>{product.name}</h3>
                          <p className='text-sm text-gray-500'>{product.setName}</p>
                          <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1'>
                            {product.category}
                          </span>
                        </div>

                        <div className='space-y-2'>
                          {product.cardMarketPrice && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>Market Price:</span>
                              <span className='font-medium'>${product.cardMarketPrice}</span>
                            </div>
                          )}
                          {product.myPrice && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>My Price:</span>
                              <span className='font-medium text-green-600'>${product.myPrice}</span>
                            </div>
                          )}
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Availability:</span>
                            <span
                              className={`font-medium ${product.availability > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {product.availability > 0
                                ? `${product.availability} available`
                                : 'Out of stock'}
                            </span>
                          </div>
                          {product.sold && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>Status:</span>
                              <span className='font-medium text-gray-500'>Sold</span>
                            </div>
                          )}
                        </div>

                        {/* Images */}
                        {product.images && product.images.length > 0 && (
                          <div className='pt-2 border-t border-gray-100'>
                            <div className='flex space-x-2 overflow-x-auto'>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {product.images.slice(0, 3).map((image: any, index: number) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`${product.name} ${index + 1}`}
                                  className='w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0'
                                />
                              ))}
                              {product.images.length > 3 && (
                                <div className='w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500'>
                                  +{product.images.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* External Link */}
                        {product.productId && (
                          <div className='pt-2 border-t border-gray-100'>
                            <button className='flex items-center text-blue-600 hover:text-blue-800 text-xs'>
                              <ExternalLink className='w-3 h-3 mr-1' />
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealedProductSearch;
