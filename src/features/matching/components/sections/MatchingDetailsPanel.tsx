import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Edit3, Save, Calendar, DollarSign, Award, Image as ImageIcon, Zap } from 'lucide-react';
import { PokemonCard } from '@/shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '@/shared/components/atoms/design-system/PokemonButton';
import { PokemonInput } from '@/shared/components/atoms/design-system/PokemonInput';
import { PokemonSelect } from '@/shared/components/atoms/design-system/PokemonSelect';
import { PokemonModal } from '@/shared/components/atoms/design-system/PokemonModal';
import HierarchicalSearch from '@/shared/components/forms/sections/HierarchicalSearch';
import { ImageProductView } from '@/shared/components/molecules/common/ImageProductView';
import { handleError } from '@/shared/utils/helpers/errorHandler';

interface MatchingDetailsPanelProps {
  scan: any;
  matchResults?: any;
  onClose: () => void;
  onCreatePsaCard: (cardData: any) => Promise<void>;
  isCreating: boolean;
}

interface PsaCardFormData {
  cardId: string;
  setName: string;
  cardName: string;
  cardNumber: string;
  variety: string;
  grade: string;
  certNumber: string;
  myPrice: string;
  dateAdded: string;
}

const PSA_GRADES = [
  { value: '10', label: 'PSA 10 - Gem Mint' },
  { value: '9', label: 'PSA 9 - Mint' },
  { value: '8', label: 'PSA 8 - Near Mint-Mint' },
  { value: '7', label: 'PSA 7 - Near Mint' },
  { value: '6', label: 'PSA 6 - Excellent-Mint' },
  { value: '5', label: 'PSA 5 - Excellent' },
  { value: '4', label: 'PSA 4 - Very Good-Excellent' },
  { value: '3', label: 'PSA 3 - Very Good' },
  { value: '2', label: 'PSA 2 - Good' },
  { value: '1', label: 'PSA 1 - Poor' },
];

export const MatchingDetailsPanel: React.FC<MatchingDetailsPanelProps> = ({
  scan,
  matchResults,
  onClose,
  onCreatePsaCard,
  isCreating
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(scan?.selectedMatch || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    reset
  } = useForm<PsaCardFormData>({
    defaultValues: {
      dateAdded: new Date().toISOString().split('T')[0], // Today's date
      grade: scan?.extractedData?.grade?.toString() || '10', // Auto-fill from OCR or default to PSA 10
      certNumber: scan?.extractedData?.certificationNumber || '', // Auto-fill certification number from OCR
    }
  });

  // Auto-fill form when a match is selected
  const handleMatchSelect = (match: any) => {
    console.log('🎯 SELECTED MATCH:', match);
    setSelectedMatch(match);
    
    // Auto-fill form data from the selected match - use direct match properties
    setValue('cardId', match.cardId || match._id || '');
    setValue('cardName', match.cardName || '');
    setValue('cardNumber', match.cardNumber || '');
    setValue('variety', match.variety || '');
    setValue('setName', match.setName || '');
    clearErrors();
    
    console.log('✅ FORM AUTO-FILLED:', {
      cardId: match.cardId || match._id || '',
      cardName: match.cardName || '',
      cardNumber: match.cardNumber || '',
      setName: match.setName || ''
    });
  };

  const onSubmit = async (data: PsaCardFormData) => {
    try {
      const cardData = {
        ...data,
        matchConfidence: selectedMatch?.confidence || 0,
        extractedData: scan.extractedData || {},
      };
      
      await onCreatePsaCard(cardData);
      reset();
      setSelectedMatch(null);
    } catch (error) {
      handleError(error, {
        component: 'MatchingDetailsPanel',
        action: 'createPsaCard'
      });
    }
  };

  const handleEditCard = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  // Auto-fill form when component loads with pre-selected match
  useEffect(() => {
    if (scan?.selectedMatch && !selectedMatch) {
      handleMatchSelect(scan.selectedMatch);
    }
  }, [scan?.selectedMatch]);

  // Auto-fill OCR extracted data when scan changes
  useEffect(() => {
    if (scan?.extractedData) {
      console.log('🤖 AUTO-FILLING OCR DATA:', scan.extractedData);
      
      // Auto-fill grade from OCR
      if (scan.extractedData.grade) {
        setValue('grade', scan.extractedData.grade.toString());
        console.log('✅ Auto-filled grade:', scan.extractedData.grade);
      }
      
      // Auto-fill certification number from OCR
      if (scan.extractedData.certificationNumber) {
        setValue('certNumber', scan.extractedData.certificationNumber);
        console.log('✅ Auto-filled cert number:', scan.extractedData.certificationNumber);
      }
    }
  }, [scan?.extractedData, setValue]);

  return (
    <>
      <PokemonCard className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-cyan-400" />
            Card Details
          </h3>
          <PokemonButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </PokemonButton>
        </div>

        {/* Compact Image Display */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Scan Preview
          </h4>
          <div className="aspect-[3/4] w-48 mx-auto bg-gray-800/30 rounded-xl overflow-hidden border border-white/10">
            <ImageProductView
              images={[scan.fullImageUrl].filter(Boolean)}
              title={scan.originalFileName}
              subtitle="Preview"
              imageSource="psa-label"
              variant="compact"
              size="sm"
              showBadge={false}
              showPrice={false}
              enableInteractions={false}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {scan.originalFileName}
          </p>
        </div>

        {/* OCR Extracted Data Display */}
        {scan?.extractedData && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              OCR Extracted Data
            </h4>
            <div className="bg-gray-800/30 rounded-xl p-4 border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {scan.extractedData.certificationNumber && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-green-400 font-medium">Cert Number</div>
                    <div className="text-white">{scan.extractedData.certificationNumber}</div>
                  </div>
                )}
                {scan.extractedData.grade && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-green-400 font-medium">Grade</div>
                    <div className="text-white">PSA {scan.extractedData.grade}</div>
                  </div>
                )}
                {scan.extractedData.year && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-blue-400 font-medium">Year</div>
                    <div className="text-white">{scan.extractedData.year}</div>
                  </div>
                )}
                {scan.extractedData.cardName && (
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-purple-400 font-medium">Card Name</div>
                    <div className="text-white">{scan.extractedData.cardName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OCR Text Display */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Raw OCR Text</h4>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-white/10 max-h-32 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {scan.ocrText || 'No OCR text available'}
            </pre>
          </div>
          {scan.ocrConfidence && (
            <p className="text-xs text-gray-400 mt-2">
              OCR Confidence: {(scan.ocrConfidence * 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* Match Results */}
        {matchResults && matchResults.cardMatches && matchResults.cardMatches.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Match Suggestions</h4>
            <div className="space-y-2">
              {matchResults.cardMatches.map((match: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMatch === match
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
                      : 'bg-gray-800/30 border-white/10 text-gray-300 hover:bg-gray-700/30'
                  }`}
                  onClick={() => handleMatchSelect(match)}
                >
                  <div className="font-medium">{match.cardName}</div>
                  <div className="text-sm opacity-80">
                    {match.setName} #{match.cardNumber}
                  </div>
                  <div className="text-xs opacity-60">
                    Confidence: {(match.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PSA Card Creation Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Create PSA Card
          </h4>

          {/* Card Selection Display */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <PokemonInput
                  label="Selected Card"
                  value={watch('cardName') || 'No card selected'}
                  readOnly
                  className="bg-gray-800/50"
                />
              </div>
              <PokemonButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditCard}
                className="mt-6"
              >
                <Edit3 className="w-4 h-4" />
              </PokemonButton>
            </div>
            
            <PokemonInput
              label="Selected Set"
              value={watch('setName') || 'No set selected'}
              readOnly
              className="bg-gray-800/50"
            />
            
            {watch('cardNumber') && (
              <PokemonInput
                label="Card Number"
                value={watch('cardNumber')}
                readOnly
                className="bg-gray-800/50"
              />
            )}
          </div>

          {/* PSA Grade */}
          <div className="relative">
            <PokemonSelect
              label="PSA Grade *"
              {...register('grade', { required: 'PSA Grade is required' })}
              error={errors.grade?.message}
              options={PSA_GRADES}
            />
            {scan?.extractedData?.grade && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
                  <Zap className="w-3 h-3" />
                  OCR
                </div>
              </div>
            )}
            {scan?.extractedData?.grade && (
              <p className="text-xs text-green-400 mt-1">
                ✨ Auto-filled from OCR: PSA {scan.extractedData.grade}
              </p>
            )}
          </div>

          {/* Cert Number */}
          <div className="relative">
            <PokemonInput
              label="PSA Cert Number"
              {...register('certNumber')}
              placeholder="e.g., 12345678"
            />
            {scan?.extractedData?.certificationNumber && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
                  <Zap className="w-3 h-3" />
                  OCR
                </div>
              </div>
            )}
            {scan?.extractedData?.certificationNumber && (
              <p className="text-xs text-green-400 mt-1">
                ✨ Auto-filled from OCR: {scan.extractedData.certificationNumber}
              </p>
            )}
          </div>

          {/* Price */}
          <PokemonInput
            label="My Price *"
            type="number"
            step="0.01"
            min="0"
            {...register('myPrice', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            error={errors.myPrice?.message}
            icon={<DollarSign className="w-4 h-4" />}
            placeholder="0.00"
          />

          {/* Date Added */}
          <PokemonInput
            label="Date Added"
            type="date"
            {...register('dateAdded', { required: 'Date is required' })}
            error={errors.dateAdded?.message}
            icon={<Calendar className="w-4 h-4" />}
          />

          {/* Hidden fields for form validation */}
          <input type="hidden" {...register('cardId', { required: 'Card selection is required' })} />
          <input type="hidden" {...register('setName')} />
          <input type="hidden" {...register('cardNumber')} />
          <input type="hidden" {...register('variety')} />

          {errors.cardId && (
            <p className="text-red-400 text-sm">Please select a card first</p>
          )}

          {/* Submit Button */}
          <PokemonButton
            type="submit"
            className="w-full"
            disabled={isCreating || !selectedMatch}
            loading={isCreating}
          >
            <Save className="w-4 h-4 mr-2" />
            {isCreating ? 'Creating PSA Card...' : 'Create PSA Graded Card'}
          </PokemonButton>
        </form>
      </PokemonCard>

      {/* Edit Card Modal */}
      <PokemonModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        title="Edit Card Selection"
        size="lg"
      >
        <div className="p-6">
          <HierarchicalSearch
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            clearErrors={clearErrors}
            isSubmitting={false}
            mode="set-card"
            primaryFieldName="setName"
            secondaryFieldName="cardName"
            primaryLabel="Pokemon Set"
            secondaryLabel="Card Name"
            primaryPlaceholder="Search for a Pokemon set..."
            secondaryPlaceholder="Search for a card..."
            onSelectionChange={(data) => {
              if (data.secondary) {
                setSelectedMatch({ 
                  card: data.secondary,
                  confidence: 1.0 // Manual selection has 100% confidence
                });
              }
            }}
          />
          
          <div className="flex gap-3 mt-6">
            <PokemonButton
              variant="outline"
              onClick={handleEditModalClose}
              className="flex-1"
            >
              Cancel
            </PokemonButton>
            <PokemonButton
              onClick={handleEditModalClose}
              className="flex-1"
            >
              Confirm Selection
            </PokemonButton>
          </div>
        </div>
      </PokemonModal>
    </>
  );
};