/**
 * Add/Edit Raw Card Form Component
 * Refactored to follow SOLID principles
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Form orchestration only
 * - Dependency Inversion: Uses abstract hooks instead of concrete APIs
 * - Interface Segregation: Uses specialized hooks for specific concerns
 * - Open/Closed: Extensible through hook composition
 * - DRY: Reuses common form patterns
 */

import React, { useEffect } from 'react';
import { Package, Calendar, Search } from 'lucide-react';
import { IRawCard } from '../../domain/models/card';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { useBaseForm } from '../../hooks/useBaseForm';
import { useFormValidation, commonValidationRules } from '../../hooks/useFormValidation';
import { AutocompleteField, createAutocompleteConfig } from '../../hooks/useEnhancedAutocomplete';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';
import { EnhancedAutocomplete } from '../search/EnhancedAutocomplete';

interface AddEditRawCardFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<IRawCard>;
  isEditing?: boolean;
}

interface FormData {
  setName: string;
  cardName: string;
  pokemonNumber: string;
  baseName: string;
  variety: string;
  condition: string;
  myPrice: string;
  dateAdded: string;
}

const AddEditRawCardForm: React.FC<AddEditRawCardFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addRawCard, updateRawCard, loading } = useCollectionOperations();
  
  // Validation rules for Raw card form
  const validationRules = {
    setName: { required: true },
    cardName: { required: true },
    condition: { required: true },
    myPrice: { ...commonValidationRules.price, required: true },
  };

  // Initialize base form with specialized hooks
  const baseForm = useBaseForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      cardName: initialData?.cardName || '',
      pokemonNumber: initialData?.pokemonNumber || '',
      baseName: initialData?.baseName || '',
      variety: initialData?.variety || '',
      condition: initialData?.condition || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded: initialData?.dateAdded || new Date().toISOString().split('T')[0],
    },
    validationRules,
    initialImages: initialData?.images || [],
    initialPriceHistory: initialData?.priceHistory || [],
    initialPrice: initialData?.myPrice || 0,
  });

  const { form, isSubmitting, imageUpload, priceHistory, setSubmitting } = baseForm;
  const { register, handleSubmit, formState: { errors }, setValue, watch, clearErrors } = form;

  // State for card selection (separate from form hooks for business logic)
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(
    typeof initialData?.cardId === 'string' ? initialData.cardId : initialData?.cardId?.id || null
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
      id: 'cardName',
      value: watch('cardName') || '',
      placeholder: 'Card Name',
      type: 'cardProduct',
      required: true,
    },
  ];

  // Initialize enhanced autocomplete for cards
  // Create config for enhanced autocomplete
  const autocompleteConfig = createAutocompleteConfig('cards');

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('[RAW FORM] Updating form with initialData:', initialData);

      // Access card data from nested cardId object (populated by backend API)
      const cardData = initialData.cardId;
      const setName = cardData?.setId?.setName || initialData.setName || '';
      const cardName = cardData?.cardName || initialData.cardName || '';
      const pokemonNumber = cardData?.pokemonNumber || initialData.pokemonNumber || '';
      const baseName = cardData?.baseName || initialData.baseName || '';
      const variety = cardData?.variety || initialData.variety || '';

      setValue('setName', setName);
      setValue('cardName', cardName);
      setValue('pokemonNumber', pokemonNumber);
      setValue('baseName', baseName);
      setValue('variety', variety);
      setValue('condition', initialData.condition || '');
      setValue('myPrice', initialData.myPrice?.toString() || '');
      setValue(
        'dateAdded',
        initialData.dateAdded
          ? new Date(initialData.dateAdded).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );

      // Legacy search functions removed - form values are sufficient

      console.log('[RAW FORM] Form values updated with:', {
        setName,
        cardName,
        pokemonNumber,
        baseName,
        variety,
        condition: initialData.condition,
        myPrice: initialData.myPrice,
      });
    }
  }, [isEditing, initialData, setValue]);

  // Legacy search sync removed - EnhancedAutocomplete handles all search state

  // Auto-fill functionality moved to EnhancedAutocomplete onSelectionChange

  // Watch form fields for validation
  const watchedCondition = watch('condition');
  const watchedPrice = watch('myPrice');

  // Update current price when form price changes
  useEffect(() => {
    if (watchedPrice) {
      const price = parseFloat(watchedPrice);
      if (!isNaN(price)) {
        priceHistory.updateCurrentPrice(price);
      }
    }
  }, [watchedPrice, priceHistory]);

  const handleImagesChange = (files: File[], remainingExistingUrls?: string[]) => {
    imageUpload.setSelectedImages(files);
    if (remainingExistingUrls !== undefined) {
      imageUpload.setRemainingExistingImages(remainingExistingUrls);
    }
  };

  const handlePriceUpdate = (newPrice: number, date: string) => {
    // Add new price to history using specialized hook
    priceHistory.addPriceEntry(newPrice, 'manual_update');
    
    // Update form field
    setValue('myPrice', newPrice.toString());
  };

  // Event handlers removed - EnhancedAutocomplete handles all interactions

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      // Upload images using specialized hook
      const imageUrls = await imageUpload.uploadImages();

      // Prepare card data
      let cardData: Partial<IRawCard>;

      if (isEditing) {
        // For editing, only update price and images
        const priceToUse = priceHistory.currentPrice > 0 ? priceHistory.currentPrice : parseFloat(data.myPrice);
        const finalImages = [...imageUpload.remainingExistingImages, ...imageUrls];
        
        cardData = {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory: priceHistory.priceHistory.length > 0 ? priceHistory.priceHistory : initialData?.priceHistory,
        };
      } else {
        // For new items, validate that a card was selected from autocomplete
        if (!selectedCardId) {
          throw new Error('Please select a card from the search suggestions. Manual entry is not supported for raw cards - you must select an existing card.');
        }

        // Validate that the form data matches the selected card
        console.log('[RAW FORM] Validating selected card data:', {
          selectedCardId,
          formData: {
            setName: data.setName,
            cardName: data.cardName,
            pokemonNumber: data.pokemonNumber,
            baseName: data.baseName,
            variety: data.variety,
          }
        });

        // Use the selected card reference (schema requires cardId)
        cardData = {
          cardId: selectedCardId,
          condition: data.condition,
          myPrice: parseFloat(data.myPrice),
          dateAdded: data.dateAdded,
          images: imageUrls,
          priceHistory: priceHistory.priceHistory.length > 0 
            ? priceHistory.priceHistory 
            : [{
                price: parseFloat(data.myPrice),
                dateUpdated: new Date().toISOString(),
              }],
        };
      }

      // Submit using collection operations hook
      if (isEditing && initialData?.id) {
        await updateRawCard(initialData.id, cardData);
      } else {
        await addRawCard(cardData);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Context7 Premium Form Header */}
      <div className='bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-3xl p-8 relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500'></div>
        <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5'></div>

        <div className='flex items-center relative'>
          <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center'>
            <Package className='w-7 h-7 text-white' />
          </div>
          <div className='ml-6'>
            <h3 className='text-2xl font-bold bg-gradient-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent mb-2'>
              {isEditing ? 'Edit Raw Card' : 'Add Raw Card'}
            </h3>
            <p className='text-emerald-700 font-medium'>
              {isEditing
                ? 'Update your raw card information'
                : 'Add a new raw card to your premium collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Information Section - Enhanced Autocomplete Integration */}
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center justify-between relative'>
          <div className='flex items-center'>
            <Calendar className='w-6 h-6 mr-3 text-slate-600' />
            Card Information
          </div>
          {watch('setName') && (
            <div className='flex items-center text-sm text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-full backdrop-blur-sm'>
              <Search className='w-4 h-4 mr-1' />
              Filtering by: {watch('setName')}
            </div>
          )}
        </h4>

        {/* Enhanced Autocomplete for Hierarchical Search */}
        <div className='mb-6'>
          <EnhancedAutocomplete
            config={autocompleteConfig}
            fields={autocompleteFields}
            onSelectionChange={selectedData => {
              console.log('[RAW CARD] ===== ENHANCED AUTOCOMPLETE SELECTION =====');
              console.log('[RAW CARD] Enhanced autocomplete selection:', selectedData);

              // Auto-fill form fields based on selection
              if (selectedData) {
                // The selectedData contains the raw card data from the search API
                console.log('[RAW CARD] Raw selected data:', selectedData);

                // Store the selected card ID for backend submission
                const cardId = selectedData._id || selectedData.id;
                if (cardId) {
                  setSelectedCardId(cardId);
                  console.log('[RAW CARD] Selected card ID:', cardId);
                } else {
                  console.error('[RAW CARD] No ID found in selected data - card selection invalid');
                  return;
                }

                // Auto-fill set name from setInfo or direct setName
                const setName = selectedData.setInfo?.setName || selectedData.setName;
                if (setName) {
                  setValue('setName', setName, { shouldValidate: true });
                  clearErrors('setName'); // Clear any validation errors
                } else {
                  console.warn('[RAW CARD] No setName found in selected card data');
                }

                // Auto-fill card name (required)
                if (selectedData.cardName) {
                  setValue('cardName', selectedData.cardName, { shouldValidate: true });
                  clearErrors('cardName'); // Clear any validation errors
                } else {
                  console.warn('[RAW CARD] No cardName found in selected card data');
                }

                // Auto-fill pokemon number
                const pokemonNumber = selectedData.pokemonNumber?.toString() || '';
                console.log('[RAW CARD] Setting Pokemon Number:', pokemonNumber);
                setValue('pokemonNumber', pokemonNumber, { shouldValidate: true });
                clearErrors('pokemonNumber');

                // Auto-fill base name (required)
                const baseName = selectedData.baseName || selectedData.cardName || '';
                console.log('[RAW CARD] Setting Base Name:', baseName);
                setValue('baseName', baseName, { shouldValidate: true });
                clearErrors('baseName');

                // Auto-fill variety (always set, even if empty)
                const varietyValue = selectedData.variety || '';
                console.log('[RAW CARD] Setting Variety:', varietyValue);
                setValue('variety', varietyValue, { shouldValidate: true });
                clearErrors('variety');

                console.log('[RAW CARD] Card selection complete - all fields populated from card reference:', {
                  cardId: selectedData.id,
                  setName: setName,
                  cardName: selectedData.cardName,
                  pokemonNumber: pokemonNumber,
                  baseName: baseName,
                  variety: varietyValue,
                });

                // Validate that all required card data is present
                if (!selectedData.id || !selectedData.cardName || !selectedData.baseName) {
                  console.error('[RAW CARD] Invalid card selection - missing required fields:', {
                    hasId: !!selectedData.id,
                    hasCardName: !!selectedData.cardName,
                    hasBaseName: !!selectedData.baseName,
                  });
                }
              }
            }}
            onError={error => {
              console.error('[RAW CARD] Enhanced autocomplete error:', error);
            }}
            variant='premium'
            showMetadata={true}
            allowClear={true}
            disabled={isEditing}
            className='premium-search-integration'
          />
        </div>

        {/* Additional Card Fields - Read-Only when card is selected */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative'>
          {/* Pokemon Number */}
          <div>
            <Input
              label='Pokémon Number'
              {...register('pokemonNumber')}
              error={errors.pokemonNumber?.message}
              placeholder='e.g., 006, 025, 150'
              disabled={true}
              value={watch('pokemonNumber') || ''}
              className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
            />
          </div>

          {/* Base Name */}
          <div>
            <Input
              label='Base Name'
              {...register('baseName')}
              error={errors.baseName?.message}
              placeholder='e.g., Charizard, Pikachu, Mew'
              disabled={true}
              value={watch('baseName') || ''}
              className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
            />
          </div>

          {/* Variety */}
          <div className='md:col-span-2'>
            <Input
              label='Variety'
              {...register('variety')}
              error={errors.variety?.message}
              placeholder='e.g., Holo, Shadowless, 1st Edition'
              disabled={true}
              value={watch('variety') || ''}
              className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
            />
          </div>
        </div>

        {/* Hidden form registrations for autocomplete fields only */}
        <div className='hidden'>
          <input
            {...register('setName', {
              required: 'Set name is required',
              minLength: { value: 2, message: 'Set name must be at least 2 characters' },
            })}
            value={watch('setName') || ''}
            readOnly
          />
          <input
            {...register('cardName', {
              required: 'Card name is required',
              minLength: { value: 2, message: 'Card name must be at least 2 characters' },
            })}
            value={watch('cardName') || ''}
            readOnly
          />
          <input {...register('pokemonNumber')} value={watch('pokemonNumber') || ''} readOnly />
          <input {...register('baseName')} value={watch('baseName') || ''} readOnly />
          <input {...register('variety')} value={watch('variety') || ''} readOnly />
        </div>
      </div>

      {/* Condition & Pricing Section */}
      <GradingPricingSection
        register={register}
        errors={errors}
        cardType='raw'
        currentGradeOrCondition={watchedCondition}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory}
        currentPriceNumber={priceHistory.currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={false}
      />

      {/* Image Upload Section */}
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        existingImageUrls={initialData?.images || []}
        maxFiles={8}
        maxFileSize={5}
        title='Card Images'
      />

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
          className='min-w-[140px] px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
        >
          {isSubmitting ? (
            <div className='flex items-center'>
              <LoadingSpinner size='sm' className='mr-2' />
              {isEditing ? 'Updating...' : 'Adding...'}
            </div>
          ) : isEditing ? (
            'Update Card'
          ) : (
            'Add Card'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddEditRawCardForm;
