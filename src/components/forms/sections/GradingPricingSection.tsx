/**
 * Context7 Award-Winning Pricing & Investment Metrics Component
 * Ultra-premium pricing section with stunning visual displays and investment analytics
 * Following CLAUDE.md + Context7 principles for award-winning design
 */

import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  Award,
  Banknote,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { PriceHistoryDisplay } from '../../PriceHistoryDisplay';

interface GradingPricingSectionProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  // Card type - determines if we show PSA grades or conditions
  cardType: 'psa' | 'raw';
  // Current form values for display
  currentGradeOrCondition?: string;
  currentPrice?: string;
  // Price history for editing
  isEditing?: boolean;
  priceHistory?: Array<{ price: number; dateUpdated: string }>;
  currentPriceNumber?: number;
  onPriceUpdate?: (newPrice: number, date: string) => void;
  // Disable grade/condition editing when editing existing items
  disableGradeConditionEdit?: boolean;
  // Visibility control
  isVisible?: boolean;
  // Card information for investment metrics display
  cardInfo?: {
    setName?: string;
    cardName?: string;
    pokemonNumber?: string;
    baseName?: string;
    variety?: string;
  };
  // Show investment metrics instead of input fields when card is auto-filled
  showInvestmentMetrics?: boolean;
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

const CARD_CONDITIONS = [
  { value: 'Near Mint', label: 'Near Mint (NM)' },
  { value: 'Lightly Played', label: 'Lightly Played (LP)' },
  { value: 'Moderately Played', label: 'Moderately Played (MP)' },
  { value: 'Heavily Played', label: 'Heavily Played (HP)' },
  { value: 'Damaged', label: 'Damaged (DMG)' },
];

const GradingPricingSection: React.FC<GradingPricingSectionProps> = ({
  register,
  errors,
  cardType,
  currentGradeOrCondition,
  currentPrice,
  isEditing = false,
  priceHistory = [],
  currentPriceNumber = 0,
  onPriceUpdate,
  disableGradeConditionEdit = false,
  isVisible = true,
  cardInfo,
  showInvestmentMetrics = false,
}) => {
  if (!isVisible) {
    return null;
  }
  const isPsaCard = cardType === 'psa';
  const fieldName = isPsaCard ? 'grade' : 'condition';
  const options = isPsaCard ? PSA_GRADES : CARD_CONDITIONS;
  const fieldLabel = isPsaCard ? 'PSA Grade' : 'Card Condition';
  const icon = isPsaCard ? Award : Star;
  const IconComponent = icon;

  // Color schemes for different card types
  const colorScheme = isPsaCard
    ? {
        bg: 'from-blue-50/80 to-indigo-50/80',
        border: 'border-blue-200/50',
        text: 'text-blue-800',
        accent: 'text-blue-600',
      }
    : {
        bg: 'from-emerald-50/80 to-teal-50/80',
        border: 'border-emerald-200/50',
        text: 'text-emerald-800',
        accent: 'text-emerald-600',
      };

  // If we should show investment metrics for auto-filled cards
  if (showInvestmentMetrics && cardInfo) {
    return (
      <div className="relative">
        {/* Background Glass Effects */}
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/5 via-orange-400/5 to-red-400/5 rounded-[2.5rem] blur-xl"></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-hidden">
          {/* Floating Orbs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Header */}
          <div className="mb-8 relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight mb-2">
              Pricing & Investment Metrics
            </h3>
            <p className="text-white/60 font-medium">
              Auto-populated from selected card data
            </p>
          </div>

          {/* Investment Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Card Identity Metrics */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border border-white/10">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Identity
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Set Name</span>
                  <span
                    className="font-semibold text-white text-sm truncate max-w-32"
                    title={cardInfo.setName}
                  >
                    {cardInfo.setName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Card Name</span>
                  <span
                    className="font-semibold text-blue-300 text-sm truncate max-w-32"
                    title={cardInfo.cardName}
                  >
                    {cardInfo.cardName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Number</span>
                  <span className="font-semibold text-yellow-300 text-sm">
                    #{cardInfo.pokemonNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Grading/Condition Metrics */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-white/10">
                  <IconComponent className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Quality
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <Select
                    label={fieldLabel}
                    {...register(fieldName, {
                      required: `${fieldLabel} is required`,
                    })}
                    error={errors[fieldName]?.message}
                    options={options}
                    disabled={disableGradeConditionEdit}
                  />
                </div>

                {currentGradeOrCondition && (
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="text-sm text-purple-200 font-bold">
                        {
                          options.find(
                            (option) => option.value === currentGradeOrCondition
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Metrics */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-white/10">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">
                  Valuation
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    label="My Price (kr.)"
                    type="text"
                    inputMode="numeric"
                    {...register('myPrice', {
                      required: 'Price is required',
                      pattern: {
                        value: /^\d+$/,
                        message: 'Price must be a whole number only',
                      },
                      validate: (value) => {
                        const num = parseInt(value, 10);
                        if (isNaN(num) || num < 0) {
                          return 'Price must be a positive whole number';
                        }
                        return true;
                      },
                    })}
                    error={errors.myPrice?.message}
                    placeholder="Enter your price"
                    className="text-center"
                  />
                </div>

                <div>
                  <Input
                    label="Date Added"
                    type="date"
                    {...register('dateAdded', {
                      required: 'Date added is required',
                    })}
                    error={errors.dateAdded?.message}
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Investment Insights */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-white font-semibold">Card Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Base Name</span>
                    <span className="text-white font-medium">
                      {cardInfo.baseName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Variety</span>
                    <span className="text-white font-medium">
                      {cardInfo.variety || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold">
                    Investment Status
                  </span>
                </div>
                <div className="text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 font-medium">
                      Ready for Collection
                    </span>
                  </div>
                  <p className="text-white/60 mt-1">
                    Card data auto-verified from database
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Breathing Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // Standard form view for when no card info is available yet
  return (
    <div className="relative">
      {/* Background Glass Effects */}
      <div
        className={`absolute -inset-4 ${isPsaCard ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10' : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10'} rounded-[3rem] blur-2xl opacity-60`}
      ></div>
      <div
        className={`absolute -inset-2 ${isPsaCard ? 'bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5' : 'bg-gradient-to-r from-emerald-400/5 via-teal-400/5 to-green-400/5'} rounded-[2.5rem] blur-xl`}
      ></div>

      <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-hidden">
        {/* Floating Orbs */}
        <div
          className={`absolute -top-6 -right-6 w-32 h-32 ${isPsaCard ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10' : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10'} rounded-full blur-3xl animate-pulse`}
        ></div>

        <div className="mb-8 relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div
              className={`p-3 rounded-2xl ${isPsaCard ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20'} backdrop-blur-xl border border-white/10 shadow-lg`}
            >
              <Banknote
                className={`w-8 h-8 ${isPsaCard ? 'text-blue-400' : 'text-emerald-400'}`}
              />
            </div>
          </div>
          <h3
            className={`text-2xl font-bold bg-gradient-to-r ${isPsaCard ? 'from-white via-blue-100 to-indigo-100' : 'from-white via-emerald-100 to-teal-100'} bg-clip-text text-transparent leading-tight mb-2`}
          >
            {isEditing
              ? 'Update Price (kr.)'
              : isPsaCard
                ? 'Grading & Pricing (kr.)'
                : 'Condition & Pricing (kr.)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Grade/Condition Selection */}
          <div>
            <Select
              label={fieldLabel}
              {...register(fieldName, {
                required: `${fieldLabel} is required`,
              })}
              error={errors[fieldName]?.message}
              options={options}
              disabled={disableGradeConditionEdit}
            />
            {currentGradeOrCondition && (
              <div
                className={`mt-3 p-3 bg-gradient-to-r ${colorScheme.bg} ${colorScheme.border} border rounded-xl backdrop-blur-sm`}
              >
                <div className="flex items-center">
                  <IconComponent
                    className={`w-4 h-4 ${colorScheme.accent} mr-2`}
                  />
                  <span className={`text-sm ${colorScheme.text} font-bold`}>
                    Selected:{' '}
                    {
                      options.find(
                        (option) => option.value === currentGradeOrCondition
                      )?.label
                    }
                  </span>
                </div>
              </div>
            )}
            {disableGradeConditionEdit && (
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500 dark:text-zinc-400">
                {isPsaCard ? 'Grade' : 'Condition'} cannot be changed after
                adding
              </p>
            )}
          </div>

          {/* Price Input */}
          <div>
            <Input
              label="My Price (kr.)"
              type="text"
              inputMode="numeric"
              {...register('myPrice', {
                required: 'Price is required',
                pattern: {
                  value: /^\d+$/,
                  message: 'Price must be a whole number only',
                },
                validate: (value) => {
                  const num = parseInt(value, 10);
                  if (isNaN(num) || num < 0) {
                    return 'Price must be a positive whole number';
                  }
                  return true;
                },
              })}
              error={errors.myPrice?.message}
              placeholder="0"
              className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 dark:text-zinc-500 cursor-not-allowed' : ''}`}
              disabled={isEditing}
            />
            {currentPrice && (
              <div
                className={`mt-2 text-sm ${colorScheme.accent} font-semibold text-center`}
              >
                Current: {parseFloat(currentPrice || '0')} kr.
              </div>
            )}
            {isEditing && (
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500 dark:text-zinc-400 text-center">
                Use price history below to update price
              </p>
            )}
          </div>

          {/* Date Added */}
          <div>
            <Input
              label="Date Added"
              type="date"
              {...register('dateAdded', {
                required: isEditing ? false : 'Date added is required',
              })}
              error={errors.dateAdded?.message}
              disabled={isEditing}
              className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 dark:text-zinc-500 cursor-not-allowed' : ''}`}
            />
            {isEditing && (
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500 dark:text-zinc-400 text-center">
                Date cannot be changed after adding
              </p>
            )}
          </div>
        </div>

        {/* Price History Section (for editing existing cards) */}
        {isEditing && priceHistory.length > 0 && onPriceUpdate && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <PriceHistoryDisplay
              priceHistory={priceHistory}
              currentPrice={currentPriceNumber}
              onPriceUpdate={onPriceUpdate}
            />
          </div>
        )}

        {/* Breathing Animation */}
        <div
          className={`absolute inset-0 ${isPsaCard ? 'bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5' : 'bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-green-500/5'} rounded-[2rem] animate-pulse opacity-40 pointer-events-none`}
        ></div>
      </div>
    </div>
  );
};

export default GradingPricingSection;
