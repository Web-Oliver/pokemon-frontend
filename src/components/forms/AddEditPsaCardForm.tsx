/**
 * Add/Edit PSA Graded Card Form Component
 * Phase 4.6: Initial PSA card form with API integration
 *
 * Following CLAUDE.md principles:
 * - Beautiful, award-winning design with modern aesthetics
 * - Single Responsibility: PSA card form management
 * - React Hook Form integration for state management
 * - Real backend API integration (no mocking)
 * - Responsive layout for all device sizes
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Award } from 'lucide-react';
import { IPsaGradedCard } from '../../domain/models/card';
import { useCollection } from '../../hooks/useCollection';
import { useSearch } from '../../hooks/useSearch';
import { uploadMultipleImages } from '../../api/uploadApi';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import CardInformationSection from './sections/CardInformationSection';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';
import SaleDetailsSection from './sections/SaleDetailsSection';

interface AddEditPsaCardFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<IPsaGradedCard>;
  isEditing?: boolean;
}

interface FormData {
  setName: string;
  cardName: string;
  pokemonNumber: string;
  baseName: string;
  variety: string;
  grade: string;
  myPrice: string;
  dateAdded: string;
  // Sale details fields (for sold items)
  paymentMethod?: string;
  actualSoldPrice?: string;
  deliveryMethod?: string;
  source?: string;
  dateSold?: string;
  buyerFullName?: string;
  buyerPhoneNumber?: string;
  buyerEmail?: string;
  trackingNumber?: string;
  // Buyer address fields
  streetName?: string;
  postnr?: string;
  city?: string;
}


const AddEditPsaCardForm: React.FC<AddEditPsaCardFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addPsaCard, updatePsaCard, loading } = useCollection();
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
      grade: initialData?.grade || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded: initialData?.dateAdded || new Date().toISOString().split('T')[0],
      // Sale details for sold items
      paymentMethod: initialData?.saleDetails?.paymentMethod || '',
      actualSoldPrice: initialData?.saleDetails?.actualSoldPrice?.toString() || '',
      deliveryMethod: initialData?.saleDetails?.deliveryMethod || '',
      source: initialData?.saleDetails?.source || '',
      dateSold: initialData?.saleDetails?.dateSold?.split('T')[0] || '', // Convert to date format
      buyerFullName: initialData?.saleDetails?.buyerFullName || '',
      buyerPhoneNumber: initialData?.saleDetails?.buyerPhoneNumber || '',
      buyerEmail: initialData?.saleDetails?.buyerEmail || '',
      trackingNumber: initialData?.saleDetails?.trackingNumber || '',
      // Buyer address fields
      streetName: initialData?.saleDetails?.buyerAddress?.streetName || '',
      postnr: initialData?.saleDetails?.buyerAddress?.postnr || '',
      city: initialData?.saleDetails?.buyerAddress?.city || '',
    },
    mode: 'onChange',
  });

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('[PSA FORM] Updating form with initialData:', initialData);
      
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
      setValue('grade', initialData.grade || '');
      setValue('myPrice', initialData.myPrice?.toString() || '');
      setValue('dateAdded', initialData.dateAdded ? new Date(initialData.dateAdded).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      
      // Update search state to match the loaded data
      updateSetName(setName);
      updateCardProductName(cardName);
      
      console.log('[PSA FORM] Form values updated with:', {
        setName,
        cardName,
        pokemonNumber,
        baseName,
        variety,
        grade: initialData.grade,
        myPrice: initialData.myPrice
      });
    }
  }, [isEditing, initialData, setValue, updateSetName, updateCardProductName]);

  // Sync search state with form values
  useEffect(() => {
    if (setName && !isEditing) {
      setValue('setName', setName, { shouldValidate: true });
      clearErrors('setName');
    }
  }, [setName, setValue, clearErrors, isEditing]);

  useEffect(() => {
    if (cardProductName && !isEditing) {
      setValue('cardName', cardProductName, { shouldValidate: true });
      clearErrors('cardName');
    }
  }, [cardProductName, setValue, clearErrors, isEditing]);

  // Auto-fill logic when card is selected
  useEffect(() => {
    const handleCardAutoFill = () => {
      // Use selectedCardData from search hook instead of making API call
      if (selectedCardData && activeField === null) {
        console.log('[PSA FORM AUTOFILL] Using selectedCardData:', selectedCardData);

        // Autofill all available card fields
        setValue('pokemonNumber', selectedCardData.pokemonNumber || '', { shouldValidate: true });
        setValue('baseName', selectedCardData.baseName || '', { shouldValidate: true });
        setValue('variety', selectedCardData.variety || '', { shouldValidate: true });
        
        // Clear any validation errors for autofilled fields
        clearErrors('pokemonNumber');
        clearErrors('baseName');

        console.log('[PSA FORM AUTOFILL] Fields updated:', {
          pokemonNumber: selectedCardData.pokemonNumber,
          baseName: selectedCardData.baseName,
          variety: selectedCardData.variety,
        });

        // Note: myPrice and grade remain user-editable as specified
      }
    };

    handleCardAutoFill();
  }, [selectedCardData, activeField, setValue]);

  // Watch form fields for validation
  const watchedGrade = watch('grade');
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
    // Add new price to history
    const newEntry = { price: newPrice, dateUpdated: date };
    setPriceHistory(prev => [...prev, newEntry]);

    // Update current price and form field
    setCurrentPrice(newPrice);
    setValue('myPrice', newPrice.toString());
  };

  // Autocomplete event handlers
  const handleSetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('setName', value, { shouldValidate: true });
    updateSetName(value);
    setShowSuggestions(true);
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('cardName', value, { shouldValidate: true });
    updateCardProductName(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: any, fieldType: 'set' | 'cardProduct') => {
    handleSuggestionSelect(suggestion, fieldType);
    setShowSuggestions(false);
    
    // Clear validation errors when suggestion is selected
    if (fieldType === 'set') {
      clearErrors('setName');
    } else if (fieldType === 'cardProduct') {
      clearErrors('cardName');
    }
  };

  const handleInputFocus = (fieldType: 'set' | 'cardProduct') => {
    setActiveField(fieldType);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveField(null);
    }, 200);
  };

  const onSubmit = async (data: FormData) => {
    console.log('[PSA FORM SUBMIT] ===== SUBMIT STARTED =====');
    console.log('[PSA FORM SUBMIT] isEditing:', isEditing);
    console.log('[PSA FORM SUBMIT] initialData?.sold:', initialData?.sold);
    console.log('[PSA FORM SUBMIT] Form data received:', data);
    console.log('[PSA FORM SUBMIT] selectedImages count:', selectedImages.length);
    console.log('[PSA FORM SUBMIT] priceHistory:', priceHistory);
    
    setIsSubmitting(true);

    try {
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        console.log('[PSA FORM SUBMIT] Uploading images:', selectedImages.length);
        imageUrls = await uploadMultipleImages(selectedImages);
        console.log('[PSA FORM SUBMIT] Images uploaded successfully:', imageUrls);
      } else {
        console.log('[PSA FORM SUBMIT] No new images to upload');
      }

      // Prepare card data based on item status
      let cardData: Partial<IPsaGradedCard>;
      
      if (isEditing && initialData?.sold) {
        console.log('[PSA FORM SUBMIT] Processing sold item - updating sale details only');
        // For sold items, only update sale details
        cardData = {
          saleDetails: {
            ...initialData.saleDetails,
            paymentMethod: data.paymentMethod as 'CASH' | 'Mobilepay' | 'BankTransfer' | undefined,
            actualSoldPrice: data.actualSoldPrice ? parseFloat(data.actualSoldPrice) : undefined,
            deliveryMethod: data.deliveryMethod as 'Sent' | 'Local Meetup' | undefined,
            source: data.source as 'Facebook' | 'DBA' | undefined,
            dateSold: data.dateSold ? new Date(data.dateSold).toISOString() : undefined,
            buyerFullName: data.buyerFullName?.trim() || '',
            buyerPhoneNumber: data.buyerPhoneNumber?.trim() || '',
            buyerEmail: data.buyerEmail?.trim() || '',
            trackingNumber: data.trackingNumber?.trim() || '',
            buyerAddress: {
              streetName: data.streetName?.trim() || '',
              postnr: data.postnr?.trim() || '',
              city: data.city?.trim() || '',
            },
          },
        };
      } else if (isEditing) {
        console.log('[PSA FORM SUBMIT] Processing unsold item edit - updating price and images only');
        // For editing unsold items, only update price and images (preserve card info)
        // Use currentPrice from price history updates, not the disabled form field
        const priceToUse = currentPrice > 0 ? currentPrice : parseFloat(data.myPrice);
        // Combine new uploaded images with remaining existing images
        const finalImages = [...remainingExistingImages, ...imageUrls];
        cardData = {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory: priceHistory.length > 0 ? priceHistory : initialData?.priceHistory,
        };
        console.log('[PSA FORM SUBMIT] Edit data prepared:', {
          myPrice: priceToUse,
          originalFormPrice: parseFloat(data.myPrice),
          currentPriceFromHistory: currentPrice,
          finalImageCount: finalImages.length,
          remainingExistingImages: remainingExistingImages.length,
          newUploadedImages: imageUrls.length,
          priceHistoryCount: cardData.priceHistory?.length || 0
        });
      } else {
        console.log('[PSA FORM SUBMIT] Processing new item creation');
        // For new items, include all card data
        cardData = {
          setName: data.setName.trim(),
          cardName: data.cardName.trim(),
          pokemonNumber: data.pokemonNumber.trim(),
          baseName: data.baseName.trim(),
          variety: data.variety.trim() || '',
          grade: data.grade,
          myPrice: parseFloat(data.myPrice),
          dateAdded: new Date(data.dateAdded).toISOString(),
          images: imageUrls.length > 0 ? imageUrls : [],
          // Use the updated price history, or create initial entry for new cards
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

      console.log('[PSA FORM SUBMIT] Final card data to submit:', cardData);
      console.log('[PSA FORM SUBMIT] API call parameters:', {
        isEditing,
        itemId: initialData?.id,
        updateFunction: isEditing ? 'updatePsaCard' : 'addPsaCard'
      });

      if (isEditing && initialData?.id) {
        console.log('[PSA FORM SUBMIT] Calling updatePsaCard with ID:', initialData.id);
        const result = await updatePsaCard(initialData.id, cardData);
        console.log('[PSA FORM SUBMIT] Update successful, result:', result);
      } else {
        console.log('[PSA FORM SUBMIT] Calling addPsaCard');
        const result = await addPsaCard(cardData);
        console.log('[PSA FORM SUBMIT] Creation successful, result:', result);
      }

      console.log('[PSA FORM SUBMIT] ===== SUBMIT COMPLETED SUCCESSFULLY =====');
      onSuccess();
    } catch (error) {
      console.error('[PSA FORM SUBMIT] ===== SUBMIT FAILED =====');
      console.error('[PSA FORM SUBMIT] Error details:', error);
      console.error('[PSA FORM SUBMIT] Error message:', error?.message);
      console.error('[PSA FORM SUBMIT] Error stack:', error?.stack);
      // Error handling is done by useCollection hook
    } finally {
      setIsSubmitting(false);
      console.log('[PSA FORM SUBMIT] Submit process finished, isSubmitting set to false');
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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Form Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex items-center'>
          <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Award className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <h3 className='text-lg font-semibold text-blue-900'>
              {isEditing ? 'Edit PSA Graded Card' : 'Add PSA Graded Card'}
            </h3>
            <p className='text-blue-700 text-sm'>
              {isEditing
                ? initialData?.sold 
                  ? 'Update buyer information and tracking details'
                  : 'Update price and images (card info is locked after adding)'
                : 'Add a new PSA graded card to your collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Information Section - Disabled when editing, hidden for sold items */}
      <CardInformationSection
        register={register}
        errors={errors}
        setValue={setValue}
        clearErrors={clearErrors}
        setName={setName}
        suggestions={suggestions}
        showSuggestions={showSuggestions && !(isEditing && initialData?.sold)}
        activeField={activeField}
        onSetNameChange={handleSetNameChange}
        onCardNameChange={handleCardNameChange}
        onInputFocus={handleInputFocus}
        onInputBlur={handleInputBlur}
        onSuggestionClick={handleSuggestionClick}
        isVisible={!(isEditing && initialData?.sold)}
        disabled={isEditing}
      />

      {/* Grading & Pricing Section - Hidden for sold items */}
      <GradingPricingSection
        register={register}
        errors={errors}
        cardType="psa"
        currentGradeOrCondition={watchedGrade}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory}
        currentPriceNumber={currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={isEditing}
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Image Upload Section - Available for unsold items only */}
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        existingImageUrls={initialData?.images || []}
        maxFiles={8}
        maxFileSize={5}
        title="Card Images"
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Sold Item Edit Section - Only for sold items */}
      <SaleDetailsSection
        register={register}
        errors={errors}
        watch={watch}
        isVisible={isEditing && initialData?.sold}
        itemName="card"
      />

      {/* Action Buttons */}
      <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
        <Button type='button' variant='secondary' onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button type='submit' variant='primary' disabled={isSubmitting} className='min-w-[120px]'>
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

export default AddEditPsaCardForm;
