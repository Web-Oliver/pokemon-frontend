/**
 * Card Form Container Component
 * Layer 3: Components (UI Building Blocks) - Container Pattern
 *
 * Template component for PSA and Raw card forms to eliminate 70% of boilerplate code
 * Provides unified structure and consistent behavior across card forms
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Provides card form structure and orchestration
 * - DRY: Eliminates duplicate form structure and common sections
 * - Open/Closed: Extensible through render props and configuration
 * - Template Method Pattern: Defines form structure, delegates specifics to props
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import UnifiedHeader from '../../molecules/common/UnifiedHeader';
import FormActionButtons from '../../molecules/common/FormActionButtons';
import HierarchicalCardSearch from '../sections/HierarchicalCardSearch';
import CardInformationDisplaySection from '../sections/CardInformationDisplaySection';
import GradingPricingSection from '../sections/GradingPricingSection';
import ImageUploadSection from '../sections/ImageUploadSection';
import SaleDetailsSection from '../sections/SaleDetailsSection';

interface CardFormContainerProps {
  /** Form Configuration */
  cardType: 'psa' | 'raw';
  isEditing: boolean;
  isSubmitting: boolean;

  /** Form Header Props */
  title: string;
  description: string;
  icon: LucideIcon;
  primaryColorClass: string;

  /** React Hook Form Functions */
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  handleSubmit: (
    onValid: (data: any) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;

  /** Form Submission */
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;

  /** Card Selection */
  onSelectionChange: (selectedData: any) => void;

  /** Conditional Rendering */
  showCardInformation?: boolean;
  showSaleDetails?: boolean;
  isSoldItem?: boolean;

  /** Watch Values for Sections */
  currentGradeOrCondition?: string;
  currentPrice?: string;
  currentPriceNumber?: number;

  /** Price History */
  priceHistory?: Array<{ price: number; dateUpdated: string }>;
  onPriceUpdate?: (newPrice: number, date: string) => void;

  /** Image Upload */
  onImagesChange?: (files: File[], remainingUrls?: string[]) => void;
  existingImageUrls?: string[];

  /** Customization Slots */
  additionalSections?: React.ReactNode;
  customButtons?: React.ReactNode;
}

/**
 * CardFormContainer
 * Template component that provides consistent structure for PSA and Raw card forms
 * Eliminates ~70% of form boilerplate through standardized sections
 */
const CardFormContainer: React.FC<CardFormContainerProps> = ({
  cardType,
  isEditing,
  isSubmitting,
  title,
  description,
  icon,
  primaryColorClass,
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  handleSubmit,
  onSubmit,
  onCancel,
  onSelectionChange,
  showCardInformation = true,
  showSaleDetails = false,
  isSoldItem = false,
  currentGradeOrCondition,
  currentPrice,
  currentPriceNumber,
  priceHistory = [],
  onPriceUpdate,
  onImagesChange,
  existingImageUrls = [],
  additionalSections,
  customButtons,
}) => {
  // Get the appropriate icon and section title for card information
  const CardInfoIcon = icon;
  const sectionIconClass =
    cardType === 'psa' ? 'text-blue-300' : 'text-emerald-300';
  const sectionBgClass =
    cardType === 'psa' ? 'bg-blue-900/50' : 'bg-emerald-900/50';
  const sectionBorderClass =
    cardType === 'psa' ? 'border-blue-600/30' : 'border-emerald-600/30';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Standardized Form Header */}
      <UnifiedHeader
        icon={icon}
        title={title}
        subtitle={description}
        variant="form"
        size="md"
      />

      {/* Card Information Section - Hidden for sold items */}
      {showCardInformation && !isSoldItem && (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>

          <h4 className="text-xl font-medium text-zinc-100 mb-4 flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <CardInfoIcon className="w-5 h-5 mr-2 text-zinc-300" />
              Card Information
            </div>
            {watch('setName') && (
              <div
                className={`flex items-center text-sm ${sectionIconClass} ${sectionBgClass} px-3 py-1 rounded-full backdrop-blur-sm border ${sectionBorderClass}`}
              >
                <CardInfoIcon className="w-4 h-4 mr-1" />
                Filtering by: {watch('setName')}
              </div>
            )}
          </h4>

          {/* Hierarchical Search - Only for ADD pages */}
          <HierarchicalCardSearch
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            clearErrors={clearErrors}
            onSelectionChange={onSelectionChange}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />

          {/* Reusable Card Information Display */}
          <CardInformationDisplaySection
            register={register}
            errors={errors}
            watch={watch}
            cardType={cardType}
          />
        </div>
      )}

      {/* Standardized Grading & Pricing Section - Hidden for sold items */}
      {!isSoldItem && (
        <GradingPricingSection
          register={register as any}
          errors={errors as any}
          cardType={cardType}
          currentGradeOrCondition={currentGradeOrCondition}
          currentPrice={currentPrice}
          isEditing={isEditing}
          priceHistory={priceHistory}
          currentPriceNumber={currentPriceNumber}
          onPriceUpdate={onPriceUpdate}
          disableGradeConditionEdit={cardType === 'psa' ? isEditing : false}
          isVisible={true}
        />
      )}

      {/* Standardized Image Upload Section - Hidden for sold items */}
      {!isSoldItem && onImagesChange && (
        <ImageUploadSection
          onImagesChange={onImagesChange}
          existingImageUrls={existingImageUrls}
          maxFiles={8}
          maxFileSize={5}
          title="Card Images"
          isVisible={true}
        />
      )}

      {/* Sale Details Section - Only for sold items */}
      {showSaleDetails && isSoldItem && (
        <SaleDetailsSection
          register={register as any}
          errors={errors as any}
          watch={watch as any}
          isVisible={true}
          itemName="card"
        />
      )}

      {/* Additional Custom Sections */}
      {additionalSections}

      {/* Standardized Action Buttons */}
      {customButtons || (
        <FormActionButtons
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          submitButtonText={
            isEditing
              ? `Update ${cardType.toUpperCase()} Card`
              : `Add ${cardType.toUpperCase()} Card`
          }
          loadingSubmitText={isEditing ? 'Updating...' : 'Adding...'}
          primaryButtonColorClass={primaryColorClass}
        />
      )}
    </form>
  );
};

export default CardFormContainer;
