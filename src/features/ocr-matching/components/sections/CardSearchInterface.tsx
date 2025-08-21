/**
 * SOLID/DRY Implementation: Card Search Interface Section
 * Single Responsibility: Handle card search interface for editing workflow
 * Open/Closed: Extensible through props
 * DRY: Reusable card search pattern
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PokemonCard, PokemonButton } from '../../../../shared/components/atoms/design-system';
// Removed StatusIndicator import - using inline status display instead
import HierarchicalCardSearch from '../../../../shared/components/forms/sections/HierarchicalCardSearch';

export interface CardSearchInterfaceProps {
  selectedCard: any;
  form: UseFormReturn<any>;
  onCardFromSearch: (selectionData: any) => void;
  onReset: () => void;
  onConfirm: () => void;
}

export const CardSearchInterface: React.FC<CardSearchInterfaceProps> = ({
  selectedCard,
  form,
  onCardFromSearch,
  onReset,
  onConfirm
}) => {
  const hasSelection = form.watch('setName') && form.watch('cardName');

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <PokemonCard className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-xl border-orange-400/30">
        <div className="text-center space-y-3 p-6">
          <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            🔍 Find the Correct Card
          </h4>
          <p className="text-orange-300">
            {selectedCard?.card?.cardName === 'Unknown Card' 
              ? 'Use the intelligent search below to identify this Pokemon card in our comprehensive database'
              : 'Refine your selection or search for a different card using our advanced matching system'
            }
          </p>
        </div>
      </PokemonCard>

      {/* Bento Grid Layout - Modern 2025 Design */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        
        {/* Left Panel: PSA Reference Image - Takes 5 columns */}
        <div className="xl:col-span-5">
          <PokemonCard className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-cyan-400/30">
            <div className="p-8 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-300/30 rounded-full">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-300 font-medium text-sm">Original PSA Label</span>
              </div>
              
              {/* Enhanced image container */}
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-2xl blur-lg"></div>
                <div className="relative backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-4 shadow-xl">
                  <img
                    src={`http://localhost:3000/api/ocr/psa-label/${selectedCard?.psaLabel?.psaLabelId}/image`}
                    alt="PSA Label"
                    className="w-full h-auto max-h-96 object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2MEg4OFY4MEg0MFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                    }}
                  />
                </div>
                {/* Floating info badge */}
                <div className="absolute -bottom-3 -right-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Reference
                </div>
              </div>
            </div>
          </PokemonCard>
        </div>

        {/* Right Panel: Status & Controls - Takes 7 columns */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Status Card */}
          {/* Status Card */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            hasSelection 
              ? 'bg-emerald-500/10 border-emerald-400/30' 
              : 'bg-orange-500/10 border-orange-400/30'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                {hasSelection ? (
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${hasSelection ? 'text-emerald-300' : 'text-orange-300'}`}>
                  {hasSelection ? "Card Selected!" : "No Card Selected"}
                </h3>
                <p className={`${hasSelection ? 'text-emerald-400/80' : 'text-orange-400/80'} mt-1`}>
                  {hasSelection 
                    ? "Ready for confirmation" 
                    : "Use the intelligent search fields below to find and select the correct card"
                  }
                </p>
              </div>
            </div>
            
            {hasSelection && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-emerald-200 font-medium">Card Name:</span>
                  <div className="text-white font-semibold">{form.watch('cardName')}</div>
                </div>
                <div>
                  <span className="text-emerald-200 font-medium">Set:</span>
                  <div className="text-white font-semibold">{form.watch('setName')}</div>
                </div>
                {form.watch('cardNumber') && (
                  <div>
                    <span className="text-emerald-200 font-medium">Number:</span>
                    <div className="text-white font-semibold">#{form.watch('cardNumber')}</div>
                  </div>
                )}
                {form.watch('variety') && (
                  <div>
                    <span className="text-emerald-200 font-medium">Variety:</span>
                    <div className="text-white font-semibold">{form.watch('variety')}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PokemonButton
              variant="secondary"
              size="lg"
              onClick={onReset}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Search
            </PokemonButton>
            
            <PokemonButton
              variant="primary"
              size="lg"
              onClick={onConfirm}
              disabled={!hasSelection}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Selection
            </PokemonButton>
          </div>
        </div>
      </div>

      {/* Enhanced Search Interface */}
      <PokemonCard className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-cyan-400/30">
        <div className="p-8 space-y-8">
          {/* Instruction banner */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg"></div>
            <div className="relative backdrop-blur-sm bg-blue-500/5 border border-blue-300/20 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-300/30">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h6 className="text-xl font-black text-blue-200 mb-1">Intelligent Card Search</h6>
                  <p className="text-blue-200/70">Use the hierarchical search fields below to find the exact Pokemon card</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search container */}
          <div className="relative z-[100] backdrop-blur-sm bg-black/10 border border-white/5 rounded-2xl p-8 pb-48">
            <div className="w-full max-w-none">
              <HierarchicalCardSearch
                register={form.register}
                errors={form.formState.errors}
                setValue={form.setValue}
                watch={form.watch}
                clearErrors={form.clearErrors}
                onSelectionChange={onCardFromSearch}
                isSubmitting={false}
                isEditing={false}
              />
            </div>
            {/* Enhanced spacer for dropdown expansion */}
            <div className="h-40 w-full"></div>
          </div>
        </div>
      </PokemonCard>
    </div>
  );
};