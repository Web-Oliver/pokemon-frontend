/**
 * AddEditItem Page Component
 * 
 * Page for adding or editing collection items with conditional form rendering.
 * Phase 4.4: Initial page structure with item type selection.
 * 
 * Following CLAUDE.md principles:
 * - Beautiful, award-winning design with modern aesthetics
 * - Single Responsibility: Item management form routing
 * - Responsive layout for all device sizes
 * - Integration with common UI components
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, Package, Archive } from 'lucide-react';
import AddEditPsaCardForm from '../components/forms/AddEditPsaCardForm';

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
      color: 'blue'
    },
    {
      id: 'raw-card',
      name: 'Raw Card',
      description: 'Ungraded Pokémon card in various conditions',
      icon: Package,
      color: 'green'
    },
    {
      id: 'sealed-product',
      name: 'Sealed Product',
      description: 'Booster boxes, ETBs, and other sealed products',
      icon: Archive,
      color: 'purple'
    }
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">Raw Card Form</h3>
            <p className="text-green-700">
              Form for adding raw cards will be implemented in Phase 5.1
            </p>
          </div>
        );
      case 'sealed-product':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-purple-900 mb-2">Sealed Product Form</h3>
            <p className="text-purple-700">
              Form for adding sealed products will be implemented in Phase 5.1
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToCollection}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Back to collection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
                <p className="mt-1 text-gray-600">
                  Add a new item to your Pokémon collection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Type Selection */}
        {!selectedItemType && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Select Item Type
              </h2>
              <p className="text-gray-600">
                Choose the type of item you want to add to your collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {itemTypes.map((itemType) => {
                const Icon = itemType.icon;
                const colorClasses = {
                  blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
                  green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
                  purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                };

                const iconClasses = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  purple: 'text-purple-600'
                };

                return (
                  <button
                    key={itemType.id}
                    onClick={() => setSelectedItemType(itemType.id)}
                    className={`text-left p-6 border-2 rounded-lg transition-all duration-200 ${colorClasses[itemType.color as keyof typeof colorClasses]}`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${iconClasses[itemType.color as keyof typeof iconClasses]}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {itemType.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {itemType.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Form */}
        {selectedItemType && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedItemType(null)}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Back to item type selection"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {itemTypes.find(type => type.id === selectedItemType)?.name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {itemTypes.find(type => type.id === selectedItemType)?.description}
                  </p>
                </div>
              </div>
            </div>

            {renderForm()}
          </div>
        )}

      </div>
    </div>
  );
};

export default AddEditItem;