/**
 * Add/Edit Sealed Product Form Component - Context7 Award-Winning Design
 *
 * Ultra-premium form for adding/editing sealed products with stunning visual hierarchy.
 * Features glass-morphism, premium gradients, and award-winning Context7 design patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating elements
 * - Premium color palettes and gradients
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Archive, Camera, Search, TrendingUp, Package } from 'lucide-react';
import { ISealedProduct } from '../../domain/models/card';
import { useCollection } from '../../hooks/useCollection';
import { useSearch } from '../../hooks/useSearch';
import { uploadMultipleImages } from '../../api/uploadApi';
import { getProductCategories } from '../../api/searchApi';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import ImageUploader from '../ImageUploader';
import { PriceHistoryDisplay } from '../PriceHistoryDisplay';
import SearchDropdown from '../search/SearchDropdown';

interface AddEditSealedProductFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<ISealedProduct>;
  isEditing?: boolean;
}

interface FormData {
  setName: string;
  productName: string;
  category: string;
  availability: number;
  cardMarketPrice: string;
  myPrice: string;
  dateAdded: string;
}


const AddEditSealedProductForm: React.FC<AddEditSealedProductFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addSealedProduct, updateSealedProduct, loading } = useCollection();
  const {
    setName,
    cardProductName: productName,
    suggestions,
    activeField,
    selectedCardData: selectedProductData,
    updateSetName,
    updateCardProductName: updateProductName,
    handleSuggestionSelect,
    setActiveField,
    getBestMatch,
    setSearchMode,
  } = useSearch();
  
  // Set search mode to 'products' for sealed product form
  useEffect(() => {
    setSearchMode('products');
  }, [setSearchMode]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceHistory, setPriceHistory] = useState(initialData?.priceHistory || []);
  const [currentPrice, setCurrentPrice] = useState(initialData?.myPrice || 0);
  const [productCategories, setProductCategories] = useState<Array<{value: string, label: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      productName: initialData?.name || '',
      category: initialData?.category || '',
      availability: initialData?.availability || 0,
      cardMarketPrice: initialData?.cardMarketPrice?.toString() || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded: initialData?.dateAdded || new Date().toISOString().split('T')[0],
    },
  });

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      setValue('setName', initialData.setName || '');
      setValue('productName', initialData.name || '');
      setValue('category', initialData.category || '');
      setValue('availability', initialData.availability || 0);
      setValue('cardMarketPrice', initialData.cardMarketPrice?.toString() || '');
      setValue('myPrice', initialData.myPrice?.toString() || '');
      setValue('dateAdded', initialData.dateAdded || new Date().toISOString().split('T')[0]);
      
      // Update search state to match the loaded data
      updateSetName(initialData.setName || '');
      updateProductName(initialData.name || '');
    }
  }, [isEditing, initialData, setValue, updateSetName, updateProductName]);

  // Sync search state with form values
  useEffect(() => {
    if (setName && !isEditing) {
      setValue('setName', setName);
    }
  }, [setName, setValue, isEditing]);

  useEffect(() => {
    if (productName && !isEditing) {
      setValue('productName', productName);
    }
  }, [productName, setValue, isEditing]);

  // Auto-fill logic when product is selected from search suggestions
  useEffect(() => {
    // Use selectedProductData from useSearch hook which contains the complete product data
    if (selectedProductData && productName && activeField === null) {
      console.log('[SEALED PRODUCT] Auto-filling from selected product:', selectedProductData);
      
      // Auto-fill set name if available
      if (selectedProductData.setName) {
        setValue('setName', selectedProductData.setName);
      }
      
      // Auto-fill category if available
      if (selectedProductData.category) {
        setValue('category', selectedProductData.category);
      }
      
      // Auto-fill availability from CardMarket reference data (actual scraped availability number)
      if (selectedProductData.available !== undefined) {
        setValue('availability', Number(selectedProductData.available));
      }
      
      // Auto-fill CardMarket price if available (convert from EUR to DKK)
      if (selectedProductData.price) {
        const euroPrice = parseFloat(selectedProductData.price);
        if (!isNaN(euroPrice)) {
          // Convert EUR to DKK: 1 EUR = 7.46 DKK, rounded to whole number
          const dkkPrice = Math.round(euroPrice * 7.46);
          setValue('cardMarketPrice', dkkPrice.toString());
        }
      }
    }
  }, [selectedProductData, productName, activeField, setValue]);

  // Watch form fields for validation
  const watchedCategory = watch('category');
  const watchedPrice = watch('myPrice');
  const watchedCardMarketPrice = watch('cardMarketPrice');

  // Load dynamic options from backend
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const categories = await getProductCategories();
        setProductCategories(categories);
      } catch (error) {
        console.error('Failed to load form options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Update current price when form price changes
  useEffect(() => {
    if (watchedPrice) {
      const price = parseFloat(watchedPrice);
      if (!isNaN(price)) {
        setCurrentPrice(price);
      }
    }
  }, [watchedPrice]);

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files);
  };

  const handlePriceUpdate = (newPrice: number, date: string) => {
    const newEntry = { price: newPrice, dateUpdated: date };
    setPriceHistory(prev => [...prev, newEntry]);
    setCurrentPrice(newPrice);
    setValue('myPrice', newPrice.toString());
  };

  // Autocomplete event handlers
  const handleSetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('setName', value);
    updateSetName(value);
    setShowSuggestions(true);
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('productName', value);
    updateProductName(value); // This will search for products, not cards
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: unknown, fieldType: 'set' | 'cardProduct') => {
    handleSuggestionSelect(suggestion, fieldType);
    setShowSuggestions(false);
  };

  const handleInputFocus = (fieldType: 'set' | 'cardProduct') => {
    setActiveField(fieldType);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveField(null);
    }, 200);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Ensure a product is selected from CardMarket reference data
      if (!selectedProductData?._id) {
        throw new Error('Please select a product from the suggestions to ensure reference data link');
      }

      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadMultipleImages(selectedImages);
      }

      // Prepare product data - must include productId reference to CardMarketReferenceProduct
      const productData: Partial<ISealedProduct> = {
        productId: selectedProductData?._id, // Required: Reference to CardMarketReferenceProduct
        setName: data.setName.trim(),
        name: data.productName.trim(),
        category: data.category,
        availability: Number(data.availability), // Convert to number as required by backend
        cardMarketPrice: data.cardMarketPrice ? parseFloat(data.cardMarketPrice) : undefined,
        myPrice: parseFloat(data.myPrice),
        dateAdded: data.dateAdded,
        images: imageUrls,
        priceHistory:
          priceHistory.length > 0
            ? priceHistory
            : [
                {
                  price: parseFloat(data.myPrice),
                  dateUpdated: new Date().toISOString(),
                },
              ],
      };

      if (isEditing && initialData?.id) {
        await updateSealedProduct(initialData.id, productData);
      } else {
        await addSealedProduct(productData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save sealed product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Calculate potential profit margin
  const calculateProfitMargin = () => {
    const myPrice = parseFloat(watchedPrice || '0');
    const marketPrice = parseFloat(watchedCardMarketPrice || '0');
    if (myPrice > 0 && marketPrice > 0) {
      const margin = ((marketPrice - myPrice) / myPrice) * 100;
      return margin.toFixed(1);
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Context7 Premium Form Header */}
      <div className='bg-gradient-to-r from-purple-50/80 to-violet-50/80 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-8 relative'>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500'></div>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5'></div>

        <div className='flex items-center relative z-10'>
          <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center'>
            <Archive className='w-7 h-7 text-white' />
          </div>
          <div className='ml-6'>
            <h3 className='text-2xl font-bold bg-gradient-to-r from-purple-800 to-violet-800 bg-clip-text text-transparent mb-2'>
              {isEditing ? 'Edit Sealed Product' : 'Add Sealed Product'}
            </h3>
            <p className='text-purple-700 font-medium'>
              {isEditing
                ? 'Update your sealed product information'
                : 'Add a new sealed product to your premium collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Context7 Premium Product Information Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center justify-between'>
          <div className='flex items-center'>
            <Package className='w-6 h-6 mr-3 text-slate-600' />
            Product Information
          </div>
          {setName && (
            <div className='flex items-center text-sm text-purple-600 bg-purple-50/80 px-3 py-1 rounded-full backdrop-blur-sm'>
              <Search className='w-4 h-4 mr-1' />
              Filtering by: {setName}
            </div>
          )}
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Set Name with Context7 Premium Search */}
          <div className='relative'>
            <label
              htmlFor='setName'
              className='block text-sm font-bold text-slate-700 mb-2 tracking-wide'
            >
              Set Name
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='relative group'>
              <input
                id='setName'
                type='text'
                {...register('setName', {
                  required: 'Set name is required',
                  minLength: { value: 2, message: 'Set name must be at least 2 characters' },
                })}
                onChange={handleSetNameChange}
                onFocus={() => handleInputFocus('set')}
                onBlur={handleInputBlur}
                disabled={isEditing}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                placeholder='e.g., Sword & Shield, Battle Styles'
              />
              <Search className='absolute right-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-300' />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
            </div>
            {errors.setName && (
              <p className='mt-2 text-sm text-red-600 font-medium'>{errors.setName.message}</p>
            )}

            {/* Context7 Premium Set Suggestions Dropdown */}
            <SearchDropdown
              suggestions={suggestions}
              isVisible={showSuggestions && activeField === 'set'}
              activeField={activeField}
              onSuggestionSelect={(suggestion, fieldType) =>
                handleSuggestionClick(suggestion, fieldType)
              }
              onClose={() => {
                setShowSuggestions(false);
                setActiveField(null);
              }}
              searchTerm={setName}
              loading={false}
            />
          </div>

          {/* Product Name with Context7 Premium Search */}
          <div className='relative'>
            <label
              htmlFor='productName'
              className='block text-sm font-bold text-slate-700 mb-2 tracking-wide'
            >
              Product Name
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='relative group'>
              <input
                id='productName'
                type='text'
                {...register('productName', {
                  required: 'Product name is required',
                  minLength: { value: 2, message: 'Product name must be at least 2 characters' },
                })}
                onChange={handleProductNameChange}
                onFocus={() => handleInputFocus('cardProduct')}
                onBlur={handleInputBlur}
                className='w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium'
                placeholder='e.g., Booster Box, Elite Trainer Box'
              />
              <Search className='absolute right-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-300' />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
            </div>
            {errors.productName && (
              <p className='mt-2 text-sm text-red-600 font-medium'>{errors.productName.message}</p>
            )}

            {/* Context7 Premium Product Suggestions Dropdown */}
            <SearchDropdown
              suggestions={suggestions}
              isVisible={showSuggestions && activeField === 'cardProduct'}
              activeField={activeField}
              onSuggestionSelect={(suggestion, fieldType) =>
                handleSuggestionClick(suggestion, fieldType)
              }
              onClose={() => {
                setShowSuggestions(false);
                setActiveField(null);
              }}
              searchTerm={productName}
              loading={false}
            />
          </div>

          <div>
            <Select
              label='Product Category'
              {...register('category', {
                required: 'Product category is required',
              })}
              error={errors.category?.message}
              options={productCategories}
              disabled={loadingOptions}
            />
            {watchedCategory && (
              <div className='mt-3 p-3 bg-purple-50/80 border border-purple-200/50 rounded-xl backdrop-blur-sm'>
                <div className='flex items-center'>
                  <Archive className='w-4 h-4 text-purple-600 mr-2' />
                  <span className='text-sm text-purple-800 font-bold'>
                    Category: {productCategories.find(c => c.value === watchedCategory)?.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Input
              label='Availability (from CardMarket)'
              type='number'
              min='0'
              {...register('availability', {
                required: 'Availability is required',
                min: { value: 0, message: 'Availability must be non-negative' },
              })}
              error={errors.availability?.message}
              placeholder='0'
              disabled={!!selectedProductData} // Disable if auto-filled from reference data
            />
            {selectedProductData && (
              <div className='mt-2 text-sm text-purple-600 font-semibold'>
                Auto-filled from CardMarket: {selectedProductData.available} available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context7 Premium Pricing & Investment Section */}
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-purple-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10'>
          <TrendingUp className='w-6 h-6 mr-3 text-slate-600' />
          Pricing & Investment Metrics
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10'>
          <div>
            <Input
              label='CardMarket Price (kr.)'
              type='number'
              step='1'
              min='0'
              {...register('cardMarketPrice', {
                min: { value: 0, message: 'Price must be non-negative' },
                pattern: {
                  value: /^\d+$/,
                  message: 'Price must be a whole number',
                },
              })}
              error={errors.cardMarketPrice?.message}
              placeholder='0'
            />
            {watchedCardMarketPrice && (
              <div className='mt-2 text-sm text-purple-600 font-semibold'>
                Market: {parseFloat(watchedCardMarketPrice || '0')} kr.
              </div>
            )}
            {selectedProductData && selectedProductData.price && (
              <div className='mt-2 text-sm text-green-600 font-semibold'>
                Converted from €{selectedProductData.price} EUR → {Math.round(parseFloat(selectedProductData.price) * 7.46)} kr.
              </div>
            )}
          </div>

          <div>
            <Input
              label='My Price (kr.)'
              type='number'
              step='0.01'
              min='0'
              {...register('myPrice', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be non-negative' },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Invalid price format',
                },
              })}
              error={errors.myPrice?.message}
              placeholder='0.00'
            />
            {watchedPrice && (
              <div className='mt-2 text-sm text-slate-600 font-semibold'>
                Paid: {parseFloat(watchedPrice || '0')} kr.
              </div>
            )}
          </div>

          <div>
            <Input
              label='Date Added'
              type='date'
              {...register('dateAdded', {
                required: 'Date added is required',
              })}
              error={errors.dateAdded?.message}
            />

            {/* Investment Analysis */}
            {calculateProfitMargin() && (
              <div className='mt-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-bold text-green-800'>Potential Margin:</span>
                  <span
                    className={`text-sm font-bold ${
                      parseFloat(calculateProfitMargin()!) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {calculateProfitMargin()}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price History Section (for editing existing products) */}
        {isEditing && priceHistory.length > 0 && (
          <div className='mt-8 pt-8 border-t border-slate-200/50'>
            <PriceHistoryDisplay
              priceHistory={priceHistory}
              currentPrice={currentPrice}
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        )}
      </div>

      {/* Context7 Premium Image Upload Section */}
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10'>
          <Camera className='w-6 h-6 mr-3 text-slate-600' />
          Product Images
        </h4>

        <div className='relative z-10'>
          <ImageUploader
            onImagesChange={handleImagesChange}
            existingImageUrls={initialData?.images || []}
            multiple={true}
            maxFiles={8}
            maxFileSize={5}
          />

          <div className='mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-purple-50/80 rounded-xl border border-slate-200/50 backdrop-blur-sm'>
            <div className='text-sm text-slate-600 space-y-1'>
              <p className='font-semibold'>• Upload up to 8 images (max 5MB each)</p>
              <p>• Supported formats: JPG, PNG, WebP</p>
              <p>• Include package front, back, and seal shots for authenticity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Premium Action Buttons */}
      <div className='flex justify-end space-x-6 pt-8 border-t border-slate-200/50'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={isSubmitting}
          className='px-8 py-3'
        >
          Cancel
        </Button>

        <Button
          type='submit'
          variant='primary'
          disabled={isSubmitting}
          className='min-w-[140px] px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
        >
          {isSubmitting ? (
            <div className='flex items-center'>
              <LoadingSpinner size='sm' className='mr-2' />
              {isEditing ? 'Updating...' : 'Adding...'}
            </div>
          ) : isEditing ? (
            'Update Product'
          ) : (
            'Add Product'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddEditSealedProductForm;
