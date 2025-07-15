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
import { Calendar, DollarSign, Award, Camera, Search } from 'lucide-react';
import { IPsaGradedCard } from '../../domain/models/card';
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
}

const PSA_GRADES = [
  { value: '1', label: 'PSA 1 - Poor' },
  { value: '2', label: 'PSA 2 - Good' },
  { value: '3', label: 'PSA 3 - Very Good' },
  { value: '4', label: 'PSA 4 - Very Good-Excellent' },
  { value: '5', label: 'PSA 5 - Excellent' },
  { value: '6', label: 'PSA 6 - Excellent-Mint' },
  { value: '7', label: 'PSA 7 - Near Mint' },
  { value: '8', label: 'PSA 8 - Near Mint-Mint' },
  { value: '9', label: 'PSA 9 - Mint' },
  { value: '10', label: 'PSA 10 - Gem Mint' },
];

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
      grade: initialData?.grade || '',
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
        console.log('[PSA FORM AUTOFILL] Using selectedCardData:', selectedCardData);

        // Autofill all available card fields
        setValue('pokemonNumber', selectedCardData.pokemonNumber || '');
        setValue('baseName', selectedCardData.baseName || '');
        setValue('variety', selectedCardData.variety || '');

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

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files);
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
    // Delay hiding suggestions to allow for clicks
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
      const cardData: Partial<IPsaGradedCard> = {
        setName: data.setName.trim(),
        cardName: data.cardName.trim(),
        pokemonNumber: data.pokemonNumber.trim(),
        baseName: data.baseName.trim(),
        variety: data.variety.trim() || undefined,
        grade: data.grade,
        myPrice: parseFloat(data.myPrice),
        dateAdded: data.dateAdded,
        images: imageUrls,
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

      if (isEditing && initialData?.id) {
        await updatePsaCard(initialData.id, cardData);
      } else {
        await addPsaCard(cardData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save PSA graded card:', error);
      // Error handling is done by useCollection hook
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
                ? 'Update your PSA graded card information'
                : 'Add a new PSA graded card to your collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Information Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <Calendar className='w-5 h-5 mr-2 text-gray-600' />
            Card Information
          </div>
          {setName && (
            <div className='flex items-center text-sm text-blue-600'>
              <Search className='w-4 h-4 mr-1' />
              Filtering by: {setName}
            </div>
          )}
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Set Name with Smart Search */}
          <div className='relative'>
            <label htmlFor='setName' className='block text-sm font-medium text-gray-700 mb-1'>
              Set Name
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='relative'>
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='e.g., Base Set, Jungle, Fossil'
              />
              <Search className='absolute right-3 top-2.5 w-4 h-4 text-gray-400' />
            </div>
            {errors.setName && (
              <p className='mt-1 text-sm text-red-600'>{errors.setName.message}</p>
            )}

            {/* Context7 Award-Winning Set Suggestions Dropdown */}
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

          {/* Card Name with Smart Search */}
          <div className='relative'>
            <label htmlFor='cardName' className='block text-sm font-medium text-gray-700 mb-1'>
              Card Name
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='relative'>
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='e.g., Charizard, Pikachu'
              />
              <Search className='absolute right-3 top-2.5 w-4 h-4 text-gray-400' />
            </div>
            {errors.cardName && (
              <p className='mt-1 text-sm text-red-600'>{errors.cardName.message}</p>
            )}

            {/* Context7 Award-Winning Card/Product Suggestions Dropdown */}
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
              label='Pokémon Number'
              {...register('pokemonNumber', {
                required: 'Pokémon number is required',
              })}
              error={errors.pokemonNumber?.message}
              placeholder='e.g., 4/102, 25/102'
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

      {/* Grading & Pricing Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <DollarSign className='w-5 h-5 mr-2 text-gray-600' />
          Grading & Pricing
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <Select
              label='PSA Grade'
              {...register('grade', {
                required: 'PSA grade is required',
              })}
              error={errors.grade?.message}
              options={PSA_GRADES}
            />
            {watchedGrade && (
              <div className='mt-2 p-2 bg-blue-50 border border-blue-200 rounded'>
                <span className='text-sm text-blue-800 font-medium'>
                  Selected: {PSA_GRADES.find(g => g.value === watchedGrade)?.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <Input
              label='My Price ($)'
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
              <div className='mt-2 text-sm text-gray-600'>
                ${parseFloat(watchedPrice || '0').toFixed(2)}
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
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <PriceHistoryDisplay
              priceHistory={priceHistory}
              currentPrice={currentPrice}
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <Camera className='w-5 h-5 mr-2 text-gray-600' />
          Card Images
        </h4>

        <ImageUploader
          onImagesChange={handleImagesChange}
          existingImageUrls={initialData?.images || []}
          multiple={true}
          maxFiles={8}
          maxFileSize={5}
        />

        <div className='mt-3 text-sm text-gray-600'>
          <p>• Upload up to 8 images (max 5MB each)</p>
          <p>• Supported formats: JPG, PNG, WebP</p>
          <p>• Include front, back, and detail shots for best results</p>
        </div>
      </div>

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
