/**
 * AddEditItem Page Component - Context7 Award-Winning Design
 *
 * Ultra-premium page for adding collection items with stunning visual hierarchy.
 * Features glass-morphism, premium animations, and Context7 design patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, Package, Archive } from 'lucide-react';
import AddEditPsaCardForm from '../components/forms/AddEditPsaCardForm';
import AddEditRawCardForm from '../components/forms/AddEditRawCardForm';
import AddEditSealedProductForm from '../components/forms/AddEditSealedProductForm';

type ItemType = 'psa-graded' | 'raw-card' | 'sealed-product' | null;

interface ItemTypeOption {
  id: ItemType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AddEditItem: React.FC = () => {
  const [selectedItemType, setSelectedItemType] = useState<ItemType>(null);

  // Handle navigation back to collection
  const handleBackToCollection = () => {
    window.history.pushState({}, '', '/collection');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Item type options for selection
  const itemTypes: ItemTypeOption[] = [
    {
      id: 'psa-graded',
      name: 'PSA Graded Card',
      description: 'Professional Sports Authenticator graded Pokémon card',
      icon: Star,
      color: 'blue',
    },
    {
      id: 'raw-card',
      name: 'Raw Card',
      description: 'Ungraded Pokémon card in various conditions',
      icon: Package,
      color: 'green',
    },
    {
      id: 'sealed-product',
      name: 'Sealed Product',
      description: 'Booster boxes, ETBs, and other sealed products',
      icon: Archive,
      color: 'purple',
    },
  ];

  // Handle successful form submission
  const handleFormSuccess = () => {
    handleBackToCollection();
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setSelectedItemType(null);
  };

  // Render form based on selected item type
  const renderForm = () => {
    if (!selectedItemType) {
      return null;
    }

    switch (selectedItemType) {
      case 'psa-graded':
        return (
          <AddEditPsaCardForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={false}
          />
        );
      case 'raw-card':
        return (
          <AddEditRawCardForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={false}
          />
        );
      case 'sealed-product':
        return (
          <AddEditSealedProductForm
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
            isEditing={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20-20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-5xl mx-auto space-y-8'>
          {/* Context7 Premium Page Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5'></div>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500'></div>

            <div className='flex items-center justify-between relative z-10'>
              <div className='flex items-center'>
                <button
                  onClick={handleBackToCollection}
                  className='mr-6 p-3 text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-lg rounded-2xl backdrop-blur-sm border border-transparent hover:border-white/30 transition-all duration-300 group'
                  aria-label='Back to collection'
                >
                  <ArrowLeft className='w-6 h-6 group-hover:scale-110 transition-transform duration-300' />
                </button>
                <div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2'>
                    Add New Item
                  </h1>
                  <p className='text-slate-600 font-medium'>
                    Add a new item to your premium Pokémon collection
                  </p>
                </div>
              </div>

              {/* Premium Status Indicator */}
              <div className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-sm font-medium text-slate-600'>Collection Active</span>
              </div>
            </div>
          </div>

          {/* Context7 Premium Item Type Selection */}
          {!selectedItemType && (
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-indigo-50/50'></div>

              <div className='mb-8 relative z-10'>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3'>
                  Select Item Type
                </h2>
                <p className='text-slate-600 font-medium'>
                  Choose the type of item you want to add to your premium collection
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10'>
                {itemTypes.map((itemType, index) => {
                  const Icon = itemType.icon;
                  const gradientClasses = {
                    blue: 'from-blue-500 to-indigo-600',
                    green: 'from-emerald-500 to-teal-600',
                    purple: 'from-purple-500 to-violet-600',
                  };

                  const hoverClasses = {
                    blue: 'hover:shadow-blue-500/25',
                    green: 'hover:shadow-emerald-500/25',
                    purple: 'hover:shadow-purple-500/25',
                  };

                  return (
                    <button
                      key={itemType.id}
                      onClick={() => setSelectedItemType(itemType.id)}
                      className={`group relative text-left p-8 bg-white/90 backdrop-blur-sm rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl ${hoverClasses[itemType.color as keyof typeof hoverClasses]} border border-slate-200/50 hover:border-white/60 overflow-hidden`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Premium background gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                      ></div>

                      {/* Floating icon container */}
                      <div className='relative z-10 mb-6'>
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${gradientClasses[itemType.color as keyof typeof gradientClasses]} rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        >
                          <Icon className='w-8 h-8 text-white' />
                        </div>
                      </div>

                      <div className='relative z-10'>
                        <h3 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors duration-300'>
                          {itemType.name}
                        </h3>
                        <p className='text-slate-600 text-sm leading-relaxed group-hover:text-slate-500 transition-colors duration-300'>
                          {itemType.description}
                        </p>
                      </div>

                      {/* Premium hover effect arrow */}
                      <div className='absolute bottom-4 right-4 w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100'>
                        <ArrowLeft className='w-6 h-6 rotate-180' />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Context7 Premium Selected Form */}
          {selectedItemType && (
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>

              <div className='flex items-center justify-between mb-8 relative z-10'>
                <div className='flex items-center'>
                  <button
                    onClick={() => setSelectedItemType(null)}
                    className='mr-6 p-3 text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-lg rounded-2xl backdrop-blur-sm border border-transparent hover:border-white/30 transition-all duration-300 group'
                    aria-label='Back to item type selection'
                  >
                    <ArrowLeft className='w-6 h-6 group-hover:scale-110 transition-transform duration-300' />
                  </button>
                  <div>
                    <h2 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-2'>
                      {itemTypes.find(type => type.id === selectedItemType)?.name}
                    </h2>
                    <p className='text-slate-600 font-medium'>
                      {itemTypes.find(type => type.id === selectedItemType)?.description}
                    </p>
                  </div>
                </div>

                {/* Premium progress indicator */}
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                  <div className='w-2 h-2 bg-indigo-300 rounded-full'></div>
                  <div className='w-2 h-2 bg-slate-300 rounded-full'></div>
                  <span className='text-sm font-medium text-slate-600 ml-2'>Step 2 of 3</span>
                </div>
              </div>

              <div className='relative z-10'>{renderForm()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditItem;
