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
import { Calendar, DollarSign, Package, Camera, Search, Star } from 'lucide-react';
import { IRawCard } from '../../domain/models/card';
import { useCollection } from '../../hooks/useCollection';
import { useSearch } from '../../hooks/useSearch';
import { uploadMultipleImages } from '../../api/uploadApi';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import ImageUploader from '../ImageUploader';
import { PriceHistoryDisplay } from '../PriceHistoryDisplay';
import SearchDropdown from '../search/SearchDropdown';

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

const CARD_CONDITIONS = [
  { value: 'Near Mint', label: 'Near Mint (NM)' },
  { value: 'Lightly Played', label: 'Lightly Played (LP)' },
  { value: 'Moderately Played', label: 'Moderately Played (MP)' },
  { value: 'Heavily Played', label: 'Heavily Played (HP)' },
  { value: 'Damaged', label: 'Damaged (DMG)' },
];

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

  // Sync search state with form values
  useEffect(() => {
    if (setName) {
      setValue('setName', setName);
    }
  }, [setName, setValue]);

  useEffect(() => {
    if (cardProductName) {
      setValue('cardName', cardProductName);
    }
  }, [cardProductName, setValue]);

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

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('cardName', value);
    updateCardProductName(value);
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
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadMultipleImages(selectedImages);
      }

      // Prepare card data
      const cardData: Partial<IRawCard> = {
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

      if (isEditing && initialData?.id) {
        await updateRawCard(initialData.id, cardData);
      } else {
        await addRawCard(cardData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save raw card:', error);
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

      {/* Context7 Premium Card Information Section */}
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center justify-between relative z-10'>
          <div className='flex items-center'>
            <Calendar className='w-6 h-6 mr-3 text-slate-600' />
            Card Information
          </div>
          {setName && (
            <div className='flex items-center text-sm text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-full backdrop-blur-sm'>
              <Search className='w-4 h-4 mr-1' />
              Filtering by: {setName}
            </div>
          )}
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10'>
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
                className='w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium'
                placeholder='e.g., Base Set, Jungle, Fossil'
              />
              <Search className='absolute right-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300' />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
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
            />
          </div>

          {/* Card Name with Context7 Premium Search */}
          <div className='relative'>
            <label
              htmlFor='cardName'
              className='block text-sm font-bold text-slate-700 mb-2 tracking-wide'
            >
              Card Name
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='relative group'>
              <input
                id='cardName'
                type='text'
                {...register('cardName', {
                  required: 'Card name is required',
                  minLength: { value: 2, message: 'Card name must be at least 2 characters' },
                })}
                onChange={handleCardNameChange}
                onFocus={() => handleInputFocus('cardProduct')}
                onBlur={handleInputBlur}
                className='w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium'
                placeholder='e.g., Charizard, Pikachu'
              />
              <Search className='absolute right-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300' />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
            </div>
            {errors.cardName && (
              <p className='mt-2 text-sm text-red-600 font-medium'>{errors.cardName.message}</p>
            )}

            {/* Context7 Premium Card Suggestions Dropdown */}
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
              searchTerm={cardProductName}
            />
          </div>

          <div>
            <Input
              label='Card Number (Optional)'
              {...register('pokemonNumber')}
              error={errors.pokemonNumber?.message}
              placeholder='e.g., 4, BW29, SL1, 50a, or leave empty'
            />
          </div>

          <div>
            <Input
              label='Base Name'
              {...register('baseName', {
                required: 'Base name is required',
              })}
              error={errors.baseName?.message}
              placeholder='e.g., Charizard, Pikachu'
            />
          </div>

          <div className='md:col-span-2'>
            <Input
              label='Variety (Optional)'
              {...register('variety')}
              error={errors.variety?.message}
              placeholder='e.g., Holo, Shadowless, 1st Edition'
            />
          </div>
        </div>
      </div>

      {/* Context7 Premium Condition & Pricing Section */}
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10'>
          <DollarSign className='w-6 h-6 mr-3 text-slate-600' />
          Condition & Pricing
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10'>
          <div>
            <Select
              label='Card Condition'
              {...register('condition', {
                required: 'Card condition is required',
              })}
              error={errors.condition?.message}
              options={CARD_CONDITIONS}
            />
            {watchedCondition && (
              <div className='mt-3 p-3 bg-emerald-50/80 border border-emerald-200/50 rounded-xl backdrop-blur-sm'>
                <div className='flex items-center'>
                  <Star className='w-4 h-4 text-emerald-600 mr-2' />
                  <span className='text-sm text-emerald-800 font-bold'>
                    Selected: {CARD_CONDITIONS.find(c => c.value === watchedCondition)?.label}
                  </span>
                </div>
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
              <div className='mt-2 text-sm text-emerald-600 font-semibold'>
                {parseFloat(watchedPrice || '0')} kr.
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
          </div>
        </div>

        {/* Price History Section (for editing existing cards) */}
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
      <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>

        <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10'>
          <Camera className='w-6 h-6 mr-3 text-slate-600' />
          Card Images
        </h4>

        <div className='relative z-10'>
          <ImageUploader
            onImagesChange={handleImagesChange}
            existingImageUrls={initialData?.images || []}
            multiple={true}
            maxFiles={8}
            maxFileSize={5}
          />

          <div className='mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-emerald-50/80 rounded-xl border border-slate-200/50 backdrop-blur-sm'>
            <div className='text-sm text-slate-600 space-y-1'>
              <p className='font-semibold'>• Upload up to 8 images (max 5MB each)</p>
              <p>• Supported formats: JPG, PNG, WebP</p>
              <p>• Include front, back, and detail shots for best results</p>
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
