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

import React, { useEffect, useState, useMemo } from 'react';
import { Archive, Camera, Package, TrendingUp } from 'lucide-react';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { useBaseForm } from '../../hooks/useBaseForm';
import { commonValidationRules } from '../../hooks/useFormValidation';
import {
  useFormSubmission,
  FormSubmissionPatterns,
} from './wrappers/FormSubmissionWrapper';
import { PokemonInput } from '../design-system/PokemonInput';
import LoadingSpinner from '../common/LoadingSpinner';
import FormHeader from '../common/FormHeader';
import FormActionButtons from '../common/FormActionButtons';
import { PokemonSearch } from '../design-system/PokemonSearch';
import ImageUploader from '../ImageUploader';
import { PriceHistoryDisplay } from '../PriceHistoryDisplay';
import ValidationField from './fields/ValidationField';
import HierarchicalProductSearch from './sections/HierarchicalProductSearch';
import { FormValidationService, VALIDATION_CONFIGS } from '../../services/forms/FormValidationService';
import {
  convertObjectIdToString,
  transformRequestData,
} from '../../utils/responseTransformer';

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
  const { addSealedProduct, updateSealedProduct, loading } =
    useCollectionOperations();

  // Check if item is sold - prevent editing of sold items
  const isSold = isEditing && initialData?.sold;

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

  // Memoize initialData to prevent infinite re-renders
  const memoizedInitialData = useMemo(() => {
    return initialData
      ? {
          setName: initialData.setName,
          productName: initialData.name, // Field mapping: name -> productName
          category: initialData.category,
          availability: initialData.availability,
          cardMarketPrice: initialData.cardMarketPrice?.toString(),
          myPrice: initialData.myPrice?.toString(),
          dateAdded: initialData.dateAdded,
        }
      : undefined;
  }, [initialData]);

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
    // Standardized initialData handling with memoization
    initialData: memoizedInitialData,
    isEditing,
    fieldMapping: {
      name: 'productName', // Map 'name' field to 'productName' form field
    },
  });

  const { form, isSubmitting, imageUpload, priceHistory, setSubmitting } =
    baseForm;
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
  const [selectedProductData, setSelectedProductData] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Form-specific useEffect for unique internal state only (following CLAUDE.md SRP)
  useEffect(() => {
    if (isEditing && initialData) {
      // Form fields are now handled by useBaseForm centrally

      // Set selectedProductData for existing products to maintain reference link
      // This is form-specific logic that cannot be centralized
      if (initialData.productId) {
        // Use centralized ObjectId conversion
        const transformedInitialData = transformRequestData(initialData);

        setSelectedProductData({
          _id: transformedInitialData.productId,
          setName: initialData.setName,
          name: initialData.name,
          category: initialData.category,
          available: initialData.availability,
          price: initialData.cardMarketPrice,
        });
      }
    }
  }, [isEditing, initialData]);

  // Watch form fields for validation
  const watchedPrice = watch('myPrice');
  const watchedCardMarketPrice = watch('cardMarketPrice');

  // Load dynamic options from backend
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        // Categories matching ACTUAL DATABASE VALUES
        const categories = [
          { value: 'Booster-Boxes', label: 'Booster Boxes' },
          { value: 'Elite-Trainer-Boxes', label: 'Elite Trainer Boxes' },
          { value: 'Box-Sets', label: 'Box Sets' },
          { value: 'Boosters', label: 'Boosters' },
        ];
        console.log(
          '[CATEGORIES DEBUG] Setting productCategories to:',
          categories
        );
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

  const handlePriceUpdate = (newPrice: number, _date: string) => {
    // Add new price to history using specialized hook
    priceHistory.addPriceEntry(newPrice, 'manual_update');

    // Update form field
    setValue('myPrice', newPrice.toString());
  };

  // Standardized submission handling using FormSubmissionWrapper
  const { handleSubmission } = useFormSubmission<
    FormData,
    Partial<ISealedProduct>
  >({
    setSubmitting,
    onSuccess,
    imageUpload,
    priceHistory,
    logContext: 'SEALED PRODUCT',
    validateBeforeSubmission: (_data) => {
      if (!selectedProductData?._id) {
        throw new Error(
          'Please select a product from the suggestions to ensure reference data link'
        );
      }
    },
    prepareSubmissionData: async ({ formData, imageUrls }) => {
      const allImageUrls = FormSubmissionPatterns.combineImages(
        imageUpload.remainingExistingImages,
        imageUrls
      );

      return {
        productId: selectedProductData?._id,
        setName: formData.setName.trim(),
        name: formData.productName.trim(),
        category: formData.category,
        availability: Number(formData.availability),
        cardMarketPrice: formData.cardMarketPrice
          ? parseFloat(formData.cardMarketPrice)
          : undefined,
        myPrice: parseFloat(formData.myPrice),
        dateAdded: formData.dateAdded,
        images: allImageUrls,
        priceHistory: FormSubmissionPatterns.transformPriceHistory(
          priceHistory.priceHistory,
          parseFloat(formData.myPrice)
        ),
      };
    },
    submitToApi: async (productData, isEditing) => {
      if (isEditing && initialData?.id) {
        const productId = convertObjectIdToString(initialData.id);
        await updateSealedProduct(productId, productData);
      } else {
        await addSealedProduct(productData);
      }
    },
  });

  // If trying to edit a sold item, show message and prevent editing
  if (isSold) {
    return (
      <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Archive className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-red-400 mb-4">
          Item Already Sold
        </h3>
        <p className="text-red-300/80 mb-6 text-lg">
          This sealed product has been sold and cannot be edited. Sold items are
          locked to preserve transaction history.
        </p>
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 mb-6">
          <p className="text-red-300 font-semibold">
            Sale Price: {initialData?.saleDetails?.actualSoldPrice || 'N/A'} kr
          </p>
          <p className="text-red-300/80 text-sm mt-1">
            Sold on:{' '}
            {initialData?.saleDetails?.dateSold
              ? new Date(initialData.saleDetails.dateSold).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-xl border border-red-500/20"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  const onSubmit = (data: FormData) =>
    handleSubmission(data, { isEditing, itemId: initialData?.id });

  if (loading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
        primaryColorClass="purple"
      />

      {/* Item Status Indicator for editing mode */}
      {isEditing && initialData && (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <Archive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-zinc-100">Item Status</h4>
                <p className="text-zinc-400 text-sm">
                  Current availability status
                </p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-xl backdrop-blur-xl border font-semibold ${
                initialData.sold
                  ? 'bg-red-500/20 border-red-500/30 text-red-300'
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {initialData.sold ? 'SOLD' : 'AVAILABLE'}
            </div>
          </div>

          {initialData.sold && initialData.saleDetails && (
            <div className="mt-4 pt-4 border-t border-zinc-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Sale Price:</span>
                  <span className="ml-2 font-semibold text-green-400">
                    {initialData.saleDetails.actualSoldPrice || 'N/A'} kr
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">Date Sold:</span>
                  <span className="ml-2 font-semibold text-zinc-300">
                    {initialData.saleDetails.dateSold
                      ? new Date(
                          initialData.saleDetails.dateSold
                        ).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hierarchical Product Search Section - Only for ADD pages */}
      {!isEditing && (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-purple-900/50 pointer-events-none"></div>

          <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center relative">
            <Package className="w-6 h-6 mr-3 text-zinc-300" />
            Product Information
          </h4>

          <div className="relative">
            <HierarchicalProductSearch
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              clearErrors={clearErrors}
              onSelectionChange={(selectedData) => {
                console.log('[SEALED PRODUCT] Product selection:', selectedData);
                // Store selected product data for form submission (CRITICAL - maintains existing behavior)
                setSelectedProductData(selectedData);
              }}
              isSubmitting={isSubmitting}
              isEditing={isEditing}
            />
          </div>
        </div>
      )}

      {/* Context7 Premium Pricing & Investment Section */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-purple-900/50 pointer-events-none"></div>

        <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center relative">
          <TrendingUp className="w-6 h-6 mr-3 text-zinc-300" />
          Pricing & Investment Metrics
        </h4>

        {/* Auto-filled fields: CardMarket Price (from product selection) */}
        {/* User-editable fields: My Price, Date Added */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div>
            <PokemonInput
              label="CardMarket Price (kr.)"
              type="number"
              step="1"
              min="0"
              {...register('cardMarketPrice', {
                min: { value: 0, message: 'Price must be non-negative' },
                pattern: {
                  value: /^\d+$/,
                  message: 'Price must be a whole number',
                },
              })}
              error={errors.cardMarketPrice?.message}
              placeholder="0"
              disabled={true} // Always disabled - autofilled from product selection
            />
            {watchedCardMarketPrice && (
              <div className="mt-2 text-sm text-purple-600 font-semibold">
                Market: {parseFloat(watchedCardMarketPrice || '0')} kr.
              </div>
            )}
            {selectedProductData && selectedProductData.price && (
              <div className="mt-2 text-sm text-green-600 font-semibold">
                CardMarket Price:{' '}
                {Math.round(parseFloat(selectedProductData.price))} kr.
              </div>
            )}
          </div>

          <div>
            <ValidationField
              name="myPrice"
              label="My Price (kr.)"
              type="price"
              placeholder="0"
              required={true}
              register={register}
              error={errors.myPrice}
            />
            {watchedPrice && (
              <div className="mt-2 text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300 font-semibold">
                Paid: {parseFloat(watchedPrice || '0')} kr.
              </div>
            )}
          </div>

          <div>
            <ValidationField
              name="dateAdded"
              label="Date Added"
              type="date"
              required={true}
              disabled={isEditing}
              register={register}
              error={errors.dateAdded}
            />

            {/* Investment Analysis */}
            {calculateProfitMargin() && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-800">
                    Potential Margin:
                  </span>
                  <span
                    className={`text-sm font-bold ${parseFloat(calculateProfitMargin()!) > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {calculateProfitMargin()}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price History Section (for editing existing products) */}
        {isEditing && priceHistory.priceHistory.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50">
            <PriceHistoryDisplay
              priceHistory={priceHistory.priceHistory}
              currentPrice={priceHistory.currentPrice}
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        )}
      </div>

      {/* Context7 Premium Image Upload Section */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 pointer-events-none"></div>

        <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center relative">
          <Camera className="w-6 h-6 mr-3 text-zinc-300" />
          Product Images
        </h4>

        <div className="relative">
          <ImageUploader
            onImagesChange={imageUpload.handleImagesChange}
            existingImageUrls={imageUpload.remainingExistingImages}
            multiple={true}
            maxFiles={8}
            maxFileSize={5}
          />

          <div className="mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-purple-50/80 rounded-xl border border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 backdrop-blur-sm">
            <div className="text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300 space-y-1">
              <p className="font-semibold">
                • Upload up to 8 images (max 5MB each)
              </p>
              <p>• Supported formats: JPG, PNG, WebP</p>
              <p>
                • Include package front, back, and seal shots for authenticity
              </p>
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
        primaryButtonColorClass="purple"
      />
    </form>
  );
};

export default AddEditSealedProductForm;
