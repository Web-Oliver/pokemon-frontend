/**
 * Add/Edit Raw Card Form Component - Context7 Award-Winning Design
 *
 * Ultra-premium form for adding/editing raw (ungraded) cards with stunning visual hierarchy.
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
import { Package } from 'lucide-react';
import { IRawCard } from '../../domain/models/card';
import { useCollection } from '../../hooks/useCollection';
import { useSearch } from '../../hooks/useSearch';
import { uploadMultipleImages } from '../../api/uploadApi';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import CardInformationSection from './sections/CardInformationSection';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';

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
  const { addRawCard, updateRawCard, loading } = useCollection();
  const {
    setName,
    cardProductName,
    suggestions,
    activeField,
    selectedCardData,
    updateSetName,
    updateCardProductName,
    handleSuggestionSelect,
    setActiveField,
  } = useSearch();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [remainingExistingImages, setRemainingExistingImages] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceHistory, setPriceHistory] = useState(initialData?.priceHistory || []);
  const [currentPrice, setCurrentPrice] = useState(initialData?.myPrice || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<FormData>({
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
  });

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
      setValue('dateAdded', initialData.dateAdded ? new Date(initialData.dateAdded).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      
      // Update search state to match the loaded data
      updateSetName(setName);
      updateCardProductName(cardName);
      
      console.log('[RAW FORM] Form values updated with:', {
        setName,
        cardName,
        pokemonNumber,
        baseName,
        variety,
        condition: initialData.condition,
        myPrice: initialData.myPrice
      });
    }
  }, [isEditing, initialData, setValue, updateSetName, updateCardProductName]);

  // Sync search state with form values
  useEffect(() => {
    if (setName && !isEditing) {
      setValue('setName', setName);
    }
  }, [setName, setValue, isEditing]);

  useEffect(() => {
    if (cardProductName && !isEditing) {
      setValue('cardName', cardProductName);
    }
  }, [cardProductName, setValue, isEditing]);

  // Auto-fill logic when card is selected
  useEffect(() => {
    const handleCardAutoFill = () => {
      // Use selectedCardData from search hook instead of making API call
      if (selectedCardData && activeField === null) {
        console.log('[FORM AUTOFILL] Using selectedCardData:', selectedCardData);

        // Autofill all available card fields
        setValue('pokemonNumber', selectedCardData.pokemonNumber || '');
        setValue('baseName', selectedCardData.baseName || '');
        setValue('variety', selectedCardData.variety || '');

        console.log('[FORM AUTOFILL] Fields updated:', {
          pokemonNumber: selectedCardData.pokemonNumber,
          baseName: selectedCardData.baseName,
          variety: selectedCardData.variety,
        });
      }
    };

    handleCardAutoFill();
  }, [selectedCardData, activeField, setValue]);

  // Watch form fields for validation
  const watchedCondition = watch('condition');
  const watchedPrice = watch('myPrice');

  // Update current price when form price changes
  useEffect(() => {
    if (watchedPrice) {
      const price = parseFloat(watchedPrice);
      if (!isNaN(price)) {
        setCurrentPrice(price);
      }
    }
  }, [watchedPrice]);

  const handleImagesChange = (files: File[], remainingExistingUrls?: string[]) => {
    setSelectedImages(files);
    if (remainingExistingUrls !== undefined) {
      setRemainingExistingImages(remainingExistingUrls);
    }
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

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('cardName', value);
    updateCardProductName(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: any, fieldType: 'set' | 'cardProduct') => {
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
    console.log('[RAW FORM SUBMIT] ===== SUBMIT STARTED =====');
    console.log('[RAW FORM SUBMIT] isEditing:', isEditing);
    console.log('[RAW FORM SUBMIT] Form data received:', data);
    console.log('[RAW FORM SUBMIT] selectedImages count:', selectedImages.length);
    console.log('[RAW FORM SUBMIT] priceHistory:', priceHistory);
    
    setIsSubmitting(true);

    try {
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        console.log('[RAW FORM SUBMIT] Uploading images:', selectedImages.length);
        imageUrls = await uploadMultipleImages(selectedImages);
        console.log('[RAW FORM SUBMIT] Images uploaded successfully:', imageUrls);
      } else {
        console.log('[RAW FORM SUBMIT] No new images to upload');
      }

      // Prepare card data
      let cardData: Partial<IRawCard>;

      if (isEditing) {
        console.log('[RAW FORM SUBMIT] Processing edit - updating price and images only');
        // For editing, only update price and images (preserve card info)
        // Use currentPrice from price history updates, not the disabled form field
        const priceToUse = currentPrice > 0 ? currentPrice : parseFloat(data.myPrice);
        // Combine new uploaded images with remaining existing images
        const finalImages = [...remainingExistingImages, ...imageUrls];
        cardData = {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory: priceHistory.length > 0 ? priceHistory : initialData?.priceHistory,
        };
        console.log('[RAW FORM SUBMIT] Edit data prepared:', {
          myPrice: priceToUse,
          originalFormPrice: parseFloat(data.myPrice),
          currentPriceFromHistory: currentPrice,
          finalImageCount: finalImages.length,
          remainingExistingImages: remainingExistingImages.length,
          newUploadedImages: imageUrls.length,
          priceHistoryCount: cardData.priceHistory?.length || 0
        });
      } else {
        console.log('[RAW FORM SUBMIT] Processing new item creation');
        // For new items, include all card data
        cardData = {
          setName: data.setName.trim(),
          cardName: data.cardName.trim(),
          pokemonNumber: data.pokemonNumber.trim(),
          baseName: data.baseName.trim(),
          variety: data.variety.trim() || undefined,
          condition: data.condition,
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
      }

      console.log('[RAW FORM SUBMIT] Final card data to submit:', cardData);
      console.log('[RAW FORM SUBMIT] API call parameters:', {
        isEditing,
        itemId: initialData?.id,
        updateFunction: isEditing ? 'updateRawCard' : 'addRawCard'
      });

      if (isEditing && initialData?.id) {
        console.log('[RAW FORM SUBMIT] Calling updateRawCard with ID:', initialData.id);
        const result = await updateRawCard(initialData.id, cardData);
        console.log('[RAW FORM SUBMIT] Update successful, result:', result);
      } else {
        console.log('[RAW FORM SUBMIT] Calling addRawCard');
        const result = await addRawCard(cardData);
        console.log('[RAW FORM SUBMIT] Creation successful, result:', result);
      }

      console.log('[RAW FORM SUBMIT] ===== SUBMIT COMPLETED SUCCESSFULLY =====');
      onSuccess();
    } catch (error) {
      console.error('[RAW FORM SUBMIT] ===== SUBMIT FAILED =====');
      console.error('[RAW FORM SUBMIT] Error details:', error);
      console.error('[RAW FORM SUBMIT] Error message:', error?.message);
      console.error('[RAW FORM SUBMIT] Error stack:', error?.stack);
    } finally {
      setIsSubmitting(false);
      console.log('[RAW FORM SUBMIT] Submit process finished, isSubmitting set to false');
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

        <div className='flex items-center relative z-10'>
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

      {/* Card Information Section */}
      <CardInformationSection
        register={register}
        errors={errors}
        setValue={setValue}
        clearErrors={clearErrors}
        setName={setName}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        activeField={activeField}
        onSetNameChange={handleSetNameChange}
        onCardNameChange={handleCardNameChange}
        onInputFocus={handleInputFocus}
        onInputBlur={handleInputBlur}
        onSuggestionClick={handleSuggestionClick}
        disabled={isEditing}
      />

      {/* Condition & Pricing Section */}
      <GradingPricingSection
        register={register}
        errors={errors}
        cardType="raw"
        currentGradeOrCondition={watchedCondition}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory}
        currentPriceNumber={currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={false}
      />

      {/* Image Upload Section */}
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        existingImageUrls={initialData?.images || []}
        maxFiles={8}
        maxFileSize={5}
        title="Card Images"
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
