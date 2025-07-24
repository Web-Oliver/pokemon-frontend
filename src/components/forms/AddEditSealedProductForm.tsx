/**
 * Add/Edit Sealed Product Form Component
 * Refactored to follow SOLID principles
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Form orchestration only
 * - Dependency Inversion: Uses abstract hooks instead of concrete APIs
 * - Interface Segregation: Uses specialized hooks for specific concerns
 * - Open/Closed: Extensible through hook composition
 * - DRY: Reuses common form patterns
 */

import React, { useState, useEffect } from 'react';
import { Archive, Package, TrendingUp, Camera } from 'lucide-react';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { useBaseForm } from '../../hooks/useBaseForm';
import { commonValidationRules } from '../../hooks/useFormValidation';
import { AutocompleteField, createAutocompleteConfig } from '../../hooks/useEnhancedAutocomplete';
import { getSearchApiService } from '../../services/ServiceRegistry';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import FormHeader from '../common/FormHeader';
import FormActionButtons from '../common/FormActionButtons';
import CardProductInformationSection from './CardProductInformationSection';
import ImageUploader from '../ImageUploader';
import { PriceHistoryDisplay } from '../PriceHistoryDisplay';
import { EnhancedAutocomplete } from '../search/EnhancedAutocomplete';

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

// Helper function to convert ISO date to YYYY-MM-DD format
const formatDateForInput = (isoDate: string | undefined): string => {
  if (!isoDate) {
    return new Date().toISOString().split('T')[0];
  }
  // Handle both ISO string and already formatted date strings
  if (isoDate.includes('T')) {
    return isoDate.split('T')[0];
  }
  return isoDate;
};

const AddEditSealedProductForm: React.FC<AddEditSealedProductFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addSealedProduct, updateSealedProduct, loading } = useCollectionOperations();

  // Validation rules for Sealed Product form
  const validationRules = {
    setName: { required: true },
    productName: { required: true },
    category: { required: true },
    availability: {
      required: true,
      min: 0,
      custom: (value: string) => {
        const num = parseInt(value);
        if (isNaN(num)) {
          return 'Must be a valid number';
        }
        return undefined;
      },
    },
    cardMarketPrice: commonValidationRules.price,
    myPrice: { ...commonValidationRules.price, required: true },
  };

  // Initialize base form with specialized hooks and standardized initialData handling
  const baseForm = useBaseForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      productName: initialData?.name || '',
      category: initialData?.category || '',
      availability: initialData?.availability || 0,
      cardMarketPrice: initialData?.cardMarketPrice?.toString() || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded: formatDateForInput(initialData?.dateAdded),
    },
    validationRules,
    initialImages: initialData?.images || [],
    initialPriceHistory: initialData?.priceHistory || [],
    initialPrice: initialData?.myPrice || 0,
    // Standardized initialData handling
    initialData: initialData
      ? {
          setName: initialData.setName,
          productName: initialData.name, // Field mapping: name -> productName
          category: initialData.category,
          availability: initialData.availability,
          cardMarketPrice: initialData.cardMarketPrice?.toString(),
          myPrice: initialData.myPrice?.toString(),
          dateAdded: initialData.dateAdded,
        }
      : undefined,
    isEditing,
    fieldMapping: {
      name: 'productName', // Map 'name' field to 'productName' form field
    },
  });

  const { form, isSubmitting, imageUpload, priceHistory, setSubmitting } = baseForm;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = form;

  // State for product categories and selection
  const [productCategories, setProductCategories] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [selectedProductData, setSelectedProductData] = useState<Record<string, unknown> | null>(
    null
  );

  // Configure autocomplete fields for reusable search (after useForm hook)
  const autocompleteFields: AutocompleteField[] = [
    {
      id: 'setName',
      value: watch('setName') || '',
      placeholder: 'Set Name',
      type: 'set',
      required: true,
    },
    {
      id: 'productName',
      value: watch('productName') || '',
      placeholder: 'Product Name',
      type: 'cardProduct',
      required: true,
    },
  ];

  // Create config for enhanced autocomplete
  const autocompleteConfig = createAutocompleteConfig('products');

  // Form-specific useEffect for unique internal state only (following CLAUDE.md SRP)
  useEffect(() => {
    if (isEditing && initialData) {
      // Form fields are now handled by useBaseForm centrally

      // Set selectedProductData for existing products to maintain reference link
      // This is form-specific logic that cannot be centralized
      if (initialData.productId) {
        setSelectedProductData({
          _id: initialData.productId,
          setName: initialData.setName,
          name: initialData.name,
          category: initialData.category,
          available: initialData.availability,
          price: initialData.cardMarketPrice,
        });
      }
    }
  }, [isEditing, initialData]);

  // Removed legacy search state sync - using enhanced autocomplete only

  // Watch form fields for validation
  const watchedCategory = watch('category');
  const watchedPrice = watch('myPrice');
  const watchedCardMarketPrice = watch('cardMarketPrice');

  // Load dynamic options from backend
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const searchApi = getSearchApiService();
        const categories = await searchApi.getProductCategories();
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
        priceHistory.updateCurrentPrice(price);
      }
    }
  }, [watchedPrice, priceHistory]);

  const handlePriceUpdate = (newPrice: number, date: string) => {
    // Add new price to history using specialized hook
    priceHistory.addPriceEntry(newPrice, 'manual_update');

    // Update form field
    setValue('myPrice', newPrice.toString());
  };

  // Removed legacy autocomplete event handlers - using enhanced autocomplete only

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      // Ensure a product is selected from CardMarket reference data
      if (!selectedProductData?._id) {
        throw new Error(
          'Please select a product from the suggestions to ensure reference data link'
        );
      }

      // Upload images using specialized hook
      const imageUrls = await imageUpload.uploadImages();

      // Combine existing images with new uploaded images
      const allImageUrls = [...imageUpload.remainingExistingImages, ...imageUrls];

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
        images: allImageUrls,
        priceHistory:
          priceHistory.priceHistory.length > 0
            ? priceHistory.priceHistory
            : [
                {
                  price: parseFloat(data.myPrice),
                  dateUpdated: new Date().toISOString(),
                },
              ],
      };

      // Submit using collection operations hook
      if (isEditing && initialData?.id) {
        await updateSealedProduct(initialData.id, productData);
      } else {
        await addSealedProduct(productData);
      }

      onSuccess();
    } catch (error) {
      // Error handling is done by specialized hooks
      console.error('Form submission failed:', error);
    } finally {
      setSubmitting(false);
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
      {/* Reusable Form Header */}
      <FormHeader
        icon={Archive}
        title={isEditing ? 'Edit Sealed Product' : 'Add Sealed Product'}
        description={
          isEditing
            ? 'Update your sealed product information'
            : 'Add a new sealed product to your premium collection'
        }
        isEditing={isEditing}
        primaryColorClass='purple'
      />

      {/* Reusable Product Information Section */}
      <CardProductInformationSection
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        clearErrors={clearErrors}
        control={form.control}
        autocompleteConfig={autocompleteConfig}
        autocompleteFields={autocompleteFields}
        onSelectionChange={selectedData => {
          console.log('[SEALED PRODUCT] Enhanced autocomplete selection:', selectedData);

          // Store selected product data for form submission
          setSelectedProductData(selectedData);

          // Auto-fill form fields based on selection
          if (selectedData) {
            // Auto-fill set name
            if (selectedData.setName) {
              setValue('setName', selectedData.setName, { shouldValidate: true });
              clearErrors('setName');
            }

            // Auto-fill product name
            if (selectedData.name) {
              setValue('productName', selectedData.name, { shouldValidate: true });
              clearErrors('productName');
            }

            // Auto-fill category
            if (selectedData.category) {
              setValue('category', selectedData.category, { shouldValidate: true });
              clearErrors('category');
            }

            // Auto-fill availability
            if (selectedData.available !== undefined) {
              setValue('availability', Number(selectedData.available), {
                shouldValidate: true,
              });
              clearErrors('availability');
            }

            // Auto-fill CardMarket price (already in correct currency)
            if (selectedData.price) {
              const price = parseFloat(selectedData.price);
              if (!isNaN(price)) {
                setValue('cardMarketPrice', Math.round(price).toString(), { shouldValidate: true });
                clearErrors('cardMarketPrice');
              }
            }

            console.log('[SEALED PRODUCT] Auto-filled fields:', {
              setName: selectedData.setName,
              productName: selectedData.name,
              category: selectedData.category,
              availability: selectedData.available,
              cardMarketPrice: selectedData.price
                ? Math.round(parseFloat(selectedData.price))
                : null,
            });
          }
        }}
        onError={error => {
          console.error('[SEALED PRODUCT] Enhanced autocomplete error:', error);
        }}
        sectionTitle='Product Information'
        sectionIcon={Package}
        isSealedProductForm={true}
        readOnlyFields={{
          category: true,
          availability: true,
        }}
        productCategories={productCategories}
        loadingOptions={loadingOptions}
      />

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
              disabled={isEditing}
            />
            {watchedCardMarketPrice && (
              <div className='mt-2 text-sm text-purple-600 font-semibold'>
                Market: {parseFloat(watchedCardMarketPrice || '0')} kr.
              </div>
            )}
            {selectedProductData && selectedProductData.price && (
              <div className='mt-2 text-sm text-green-600 font-semibold'>
                CardMarket Price: {Math.round(parseFloat(selectedProductData.price))} kr.
              </div>
            )}
          </div>

          <div>
            <Input
              label='My Price (kr.)'
              type='text'
              inputMode='numeric'
              {...register('myPrice', {
                required: 'Price is required',
                pattern: {
                  value: /^\d+$/,
                  message: 'Price must be a whole number only',
                },
                validate: value => {
                  const num = parseInt(value, 10);
                  if (isNaN(num) || num < 0) {
                    return 'Price must be a positive whole number';
                  }
                  return true;
                },
              })}
              error={errors.myPrice?.message}
              placeholder='0'
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
              disabled={isEditing}
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
              priceHistory={priceHistory.priceHistory}
              currentPrice={priceHistory.currentPrice}
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
            onImagesChange={imageUpload.handleImagesChange}
            existingImageUrls={imageUpload.remainingExistingImages}
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

      {/* Reusable Action Buttons */}
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        submitButtonText={isEditing ? 'Update Product' : 'Add Product'}
        loadingSubmitText={isEditing ? 'Updating...' : 'Adding...'}
        primaryButtonColorClass='purple'
      />
    </form>
  );
};

export default AddEditSealedProductForm;
