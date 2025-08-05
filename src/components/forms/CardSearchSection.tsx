/**
 * Card Search Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Dedicated search component for cards only (PSA and Raw cards)
 * Handles Set -> Card hierarchical search pattern
 */

import React, { useEffect, useState, useCallback, memo } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { SearchResult, useSearch } from '../../hooks/useSearch';
import { InformationFieldRenderer } from './fields';
import { useDebouncedValue } from '../../hooks/useDebounce';

interface CardSearchSectionProps {
  /** React Hook Form functions */
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;

  /** Section configuration */
  sectionTitle: string;
  sectionIcon: LucideIcon;

  /** Card selection functionality */
  onCardSelection: (selectedData: Record<string, unknown> | null) => void;
  onError?: (error: string) => void;
}

/**
 * Card Search Section
 * Handles hierarchical Set -> Card search pattern
 */
const CardSearchSectionComponent: React.FC<CardSearchSectionProps> = ({
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  sectionTitle,
  sectionIcon: SectionIcon,
  onCardSelection,
  onError: _onError,
}) => {
  // Watch form values
  const setName = watch('setName') || '';
  const cardName = watch('cardName') || '';

  // Centralized state management
  const [activeField, setActiveField] = useState<'setName' | 'cardName' | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [_isLoading, _setIsLoading] = useState(false);

  // Use centralized search hook
  const search = useSearch();

  // Debounce search queries
  const debouncedSetName = useDebouncedValue(setName, 300);
  const debouncedCardName = useDebouncedValue(cardName, 300);

  // Sync search results to local suggestions state
  useEffect(() => {
    setSuggestions(search.results || []);
  }, [search.results]);

  // Centralized search effect
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const currentValue =
      activeField === 'setName' ? debouncedSetName : debouncedCardName;

    if (!currentValue || typeof currentValue !== 'string') {
      setSuggestions([]);
      return;
    }

    switch (activeField) {
      case 'setName':
        search.searchSets(currentValue);
        break;
      case 'cardName': {
        const currentSetName = setName;

        // Smart search: If no query but set selected, show all from set
        let searchQuery = currentValue;
        if (!currentValue || currentValue.trim() === '') {
          if (currentSetName && currentSetName.trim()) {
            searchQuery = '*';
          } else {
            setSuggestions([]);
            return;
          }
        }

        search.searchCards(searchQuery, currentSetName?.trim() || undefined);
        break;
      }
    }
  }, [activeField, debouncedSetName, debouncedCardName, setName, search]);

  // Handle set selection
  const handleSetSelection = useCallback(
    (result: SearchResult) => {
      console.log('[CARD SEARCH DEBUG] SET SELECTION:', result);

      if (!result.id || !result.displayName) {
        setValue('setName', '');
        clearErrors('setName');
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      // Set selection - only update setName field
      const selectedSetName = result.data.setName || result.displayName;
      setValue('setName', selectedSetName);
      clearErrors('setName');

      // Auto-fill year if available
      if (result.data.year) {
        setValue('year', result.data.year);
        clearErrors('year');
      }

      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setActiveField(null);
      }, 10);
    },
    [setValue, clearErrors]
  );

  // Handle card selection
  const handleCardSelection = useCallback(
    (result: SearchResult) => {
      console.log('[CARD SEARCH DEBUG] CARD SELECTION:', result);
      console.log('[CARD SEARCH DEBUG] CARD DATA setId:', result.data.setId);

      if (!result.id || !result.displayName) {
        setValue('cardName', '');
        clearErrors('cardName');
        onCardSelection(null);
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      // Card selection - this should trigger the card selection hook
      const cardData = {
        _id: result.id,
        ...result.data,
      };

      console.log('[CARD SEARCH DEBUG] SENDING TO useCardSelection:', cardData);
      console.log('[CARD SEARCH DEBUG] setId in cardData:', cardData.setId);

      onCardSelection(cardData);

      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setActiveField(null);
      }, 10);
    },
    [setValue, clearErrors, onCardSelection]
  );

  return (
    <div className="relative">
      {/* Main Container with Context7 Design */}
      <div className="relative">
        {/* Context7 Background Glass Effects */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/5 via-blue-400/5 to-purple-400/5 rounded-[2.5rem] blur-xl"></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-visible">
          {/* Floating Orbs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Context7 Premium Header */}
          <div className="mb-8 relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <SectionIcon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent leading-tight mb-2">
              {sectionTitle}
            </h3>
            <p className="text-white/60 font-medium">
              Search sets first, then find cards within the selected set
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Set Name Search */}
            <div className="relative z-50">
              <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
                  <SectionIcon className="w-3 h-3 text-emerald-400" />
                </div>
                <span>Set Name</span>
                <span className="text-red-400 ml-1 font-bold">*</span>
              </label>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-[1.2rem] blur-md opacity-60"></div>

                <div className="relative bg-black/40 backdrop-blur-3xl rounded-xl shadow-xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
                  <input
                    type="text"
                    value={setName}
                    onChange={(e) => setValue('setName', e.target.value)}
                    onFocus={() => setActiveField('setName')}
                    onBlur={() => {
                      setTimeout(() => {
                        if (activeField === 'setName') {
                          setActiveField(null);
                        }
                      }, 150);
                    }}
                    placeholder="Search for set name..."
                    className="relative z-10 block w-full px-4 py-3 bg-transparent border-none text-white placeholder-white/50 font-medium focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Set Name Dropdown */}
                {activeField === 'setName' && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
                    <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
                      <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent relative z-10">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.id || `set-suggestion-${index}`}
                            onClick={() => handleSetSelection(suggestion)}
                            className="group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/10"
                            role="option"
                          >
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-lg leading-tight truncate group-hover:text-emerald-400 transition-colors duration-300">
                                  {suggestion.displayName}
                                </div>
                                {suggestion.data.year && (
                                  <div className="text-white/60 text-sm font-medium mt-1">
                                    {suggestion.data.year}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errors.setName && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
                  <p className="text-sm text-red-300 font-medium">
                    {errors.setName.message}
                  </p>
                </div>
              )}
            </div>

            {/* Card Name Search */}
            <div className="relative z-50">
              <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10">
                  <SectionIcon className="w-3 h-3 text-blue-400" />
                </div>
                <span>Card Name</span>
                <span className="text-red-400 ml-1 font-bold">*</span>
              </label>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-[1.2rem] blur-md opacity-60"></div>

                <div className="relative bg-black/40 backdrop-blur-3xl rounded-xl shadow-xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setValue('cardName', e.target.value)}
                    onFocus={() => {
                      setActiveField('cardName');

                      // Auto-trigger search if set is selected but no card name yet
                      if (
                        setName &&
                        setName.trim() &&
                        (!cardName || cardName.trim() === '')
                      ) {
                        search.searchCards('*', setName.trim());
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (activeField === 'cardName') {
                          setActiveField(null);
                        }
                      }, 150);
                    }}
                    placeholder="Search for card name..."
                    className="relative z-10 block w-full px-4 py-3 bg-transparent border-none text-white placeholder-white/50 font-medium focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Card Name Dropdown */}
                {activeField === 'cardName' && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
                    <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
                      <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent relative z-10">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.id || `card-suggestion-${index}`}
                            onClick={() => handleCardSelection(suggestion)}
                            className="group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/10"
                            role="option"
                          >
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="text-white font-bold text-lg leading-tight truncate group-hover:text-blue-400 transition-colors duration-300">
                                  {suggestion.displayName}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {setName && setName.trim() && (
                                    <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold">
                                      Set: {setName}
                                    </div>
                                  )}
                                  {suggestion.data?.cardNumber && (
                                    <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold">
                                      #{suggestion.data.cardNumber}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errors.cardName && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
                  <p className="text-sm text-red-300 font-medium">
                    {errors.cardName.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <InformationFieldRenderer
              fieldType="card"
              register={register}
              errors={errors}
              watch={watch}
              readOnlyFields={{}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardSearchSection = memo(CardSearchSectionComponent);
CardSearchSection.displayName = 'CardSearchSection';
