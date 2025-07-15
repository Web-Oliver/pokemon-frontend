/**
 * Collection Item Detail Page
 * Shows comprehensive information about a single collection item
 * Following CLAUDE.md principles for detailed information display
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Package,
  Archive,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { PriceHistoryDisplay } from '../components/PriceHistoryDisplay';
import * as collectionApi from '../api/collectionApi';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';

type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

const CollectionItemDetail: React.FC = () => {
  const [item, setItem] = useState<CollectionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract type and id from URL path
  const getUrlParams = () => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length === 4) { // /collection/{type}/{id}
      const [, , type, id] = pathParts;
      return { type, id };
    }
    return { type: null, id: null };
  };

  useEffect(() => {
    const fetchItem = async () => {
      const { type, id } = getUrlParams();
      
      if (!type || !id) {
        setError('Invalid item type or ID');
        setLoading(false);
        return;
      }

      try {
        log(`Fetching ${type} item with ID: ${id}`);
        let fetchedItem;

        switch (type) {
          case 'psa':
            fetchedItem = await collectionApi.getPsaGradedCardById(id);
            break;
          case 'raw':
            fetchedItem = await collectionApi.getRawCardById(id);
            break;
          case 'sealed':
            fetchedItem = await collectionApi.getSealedProductById(id);
            break;
          default:
            throw new Error(`Unknown item type: ${type}`);
        }

        setItem(fetchedItem);
        log('Item fetched successfully');
      } catch (err) {
        handleApiError(err, 'Failed to fetch item details');
        setError('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []); // Run once on mount, URL params are read inside fetchItem

  const handleDelete = async () => {
    const { type, id } = getUrlParams();
    
    if (!item || !type || !id) return;

    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      
      switch (type) {
        case 'psa':
          await collectionApi.deletePsaGradedCard(id);
          break;
        case 'raw':
          await collectionApi.deleteRawCard(id);
          break;
        case 'sealed':
          await collectionApi.deleteSealedProduct(id);
          break;
      }

      showSuccessToast('Item deleted successfully');
      // Navigate back to collection
      window.history.pushState({}, '', '/collection');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      handleApiError(err, 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    const { type, id } = getUrlParams();
    
    if (!item || !type || !id) return;

    // Navigate to edit form with the item data
    // The edit forms are part of the AddEditItem page with edit mode
    window.history.pushState({}, '', `/collection/edit/${type}/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getItemTitle = () => {
    if (!item) return 'Loading...';
    
    // For PSA and Raw cards, check cardId.cardName first, then cardName
    if ('cardId' in item || 'cardName' in item) {
      return item.cardId?.cardName || item.cardName || 'Unknown Card';
    }
    
    // For sealed products, check name
    if ('name' in item) {
      return item.name || 'Unknown Item';
    }
    
    return 'Unknown Item';
  };

  const getItemSubtitle = () => {
    if (!item) return '';
    
    if ('grade' in item) {
      return `PSA Grade ${item.grade}`;
    }
    
    if ('condition' in item) {
      return `Condition: ${item.condition}`;
    }
    
    if ('category' in item) {
      return `Category: ${item.category}`;
    }
    
    return '';
  };

  const getSetName = () => {
    if (!item) return '';
    
    if ('setName' in item) {
      return item.setName;
    }
    
    if ('cardId' in item && item.cardId?.setId?.setName) {
      return item.cardId.setId.setName;
    }
    
    return 'Unknown Set';
  };

  const renderItemSpecificInfo = () => {
    if (!item) return null;

    if ('grade' in item) {
      // PSA Graded Card
      const psaCard = item as IPsaGradedCard;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                PSA Grading Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-600">Grade:</span>
                  <span className="font-bold text-blue-800">{psaCard.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Card Name:</span>
                  <span className="font-medium text-blue-800">{psaCard.cardName || psaCard.cardId?.cardName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Base Name:</span>
                  <span className="font-medium text-blue-800">{psaCard.cardId?.baseName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Pokemon #:</span>
                  <span className="font-medium text-blue-800">{psaCard.cardId?.pokemonNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Variety:</span>
                  <span className="font-medium text-blue-800">{psaCard.cardId?.variety || 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Population Data
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">Total PSA Population:</span>
                  <span className="font-bold text-green-800">{psaCard.cardId?.psaTotalGradedForCard || 'N/A'}</span>
                </div>
                {psaCard.cardId?.psaGrades && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 mb-2">Grade Distribution:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(psaCard.cardId.psaGrades)
                        .filter(([grade, count]) => count > 0) // Only show grades with population > 0
                        .map(([grade, count]) => {
                          // Extract grade number from "psa_X" format
                          const gradeNumber = grade.replace('psa_', '');
                          return (
                            <div key={grade} className={`flex justify-between p-2 rounded ${
                              psaCard.grade === gradeNumber ? 'bg-blue-100 border border-blue-300 font-bold' : 'bg-green-100'
                            }`}>
                              <span>Grade {gradeNumber}:</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                    
                    {/* Show total population */}
                    <div className="mt-3 pt-2 border-t border-green-200">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Population:</span>
                        <span>{Object.values(psaCard.cardId.psaGrades).reduce((sum: number, count: any) => sum + (count || 0), 0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if ('condition' in item) {
      // Raw Card
      const rawCard = item as IRawCard;
      return (
        <div className="bg-emerald-50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Raw Card Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-emerald-600">Condition:</span>
              <span className="font-bold text-emerald-800">{rawCard.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Card Name:</span>
              <span className="font-medium text-emerald-800">{rawCard.cardName || rawCard.cardId?.cardName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Base Name:</span>
              <span className="font-medium text-emerald-800">{rawCard.cardId?.baseName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Pokemon #:</span>
              <span className="font-medium text-emerald-800">{rawCard.cardId?.pokemonNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      );
    }

    if ('category' in item) {
      // Sealed Product
      const sealedProduct = item as ISealedProduct;
      return (
        <div className="bg-purple-50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <Archive className="w-5 h-5 mr-2" />
            Sealed Product Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-purple-600">Category:</span>
              <span className="font-bold text-purple-800">{sealedProduct.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">Availability:</span>
              <span className="font-medium text-purple-800">{sealedProduct.availability || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">CardMarket Price:</span>
              <span className="font-medium text-purple-800">{sealedProduct.cardMarketPrice || 'N/A'} kr.</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSaleInfo = () => {
    if (!item || !item.sold || !item.saleDetails) return null;

    return (
      <div className="bg-green-50 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Sale Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600">Sale Price:</span>
              <span className="font-bold text-green-800">{item.saleDetails.actualSoldPrice} kr.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Payment Method:</span>
              <span className="font-medium text-green-800">{item.saleDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Delivery:</span>
              <span className="font-medium text-green-800">{item.saleDetails.deliveryMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Source:</span>
              <span className="font-medium text-green-800">{item.saleDetails.source}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600">Date Sold:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.dateSold ? new Date(item.saleDetails.dateSold).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Buyer:</span>
              <span className="font-medium text-green-800">{item.saleDetails.buyerFullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Tracking:</span>
              <span className="font-medium text-green-800">{item.saleDetails.trackingNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading item details..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested item could not be found.'}</p>
          <Button 
            onClick={() => {
              window.history.pushState({}, '', '/collection');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }} 
            variant="primary"
          >
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.history.pushState({}, '', '/collection');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Button>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{getItemTitle()}</h1>
                <p className="text-xl text-slate-600 mb-2">{getItemSubtitle()}</p>
                <p className="text-lg text-slate-500">Set: {getSetName()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Images
              </h2>
              
              {item.images && item.images.length > 0 ? (
                <div className="space-y-4">
                  {item.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`http://localhost:3000${image}`}
                        alt={`${getItemTitle()} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                        onLoad={() => {
                          console.log(`Image loaded successfully: ${image}`);
                        }}
                        onError={(e) => {
                          console.error(`Failed to load image: ${image}`);
                          console.error(`Full URL: http://localhost:3000${image}`);
                          // Show a placeholder instead of hiding
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDIwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA5NkM4NyA5MC40NzcyIDkxLjQ3NzIgODYgOTcgODZDMTAyLjUyMyA4NiAxMDcgOTAuNDc3MiAxMDcgOTZDMTA3IDEwMS41MjMgMTAyLjUyMyAxMDYgOTcgMTA2Qzg3IDEwNiA4NyAxMDEuNTIzIDg3IDk2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTE5IDEyNkM4MyAxMjYgODMgMTI2IDgzIDEyNlY5NkM4MyA5My4yMzg2IDg1LjIzODYgOTEgODggOTFIMTMyQzEzNC43NjEgOTEgMTM3IDkzLjIzODYgMTM3IDk2VjEyNkgxMTlaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTA2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjczODAiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                          e.currentTarget.className = "w-full h-48 object-cover rounded-xl shadow-lg border-2 border-dashed border-gray-300";
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {image}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images available</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Images: {item.images ? item.images.length : 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">My Price:</span>
                    <span className="font-bold text-slate-900">{item.myPrice || '0'} kr.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date Added:</span>
                    <span className="font-medium text-slate-900">
                      {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`font-medium ${item.sold ? 'text-green-600' : 'text-blue-600'}`}>
                      {item.sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Item Type:</span>
                    <span className="font-medium text-slate-900">
                      {(() => {
                        const { type } = getUrlParams();
                        return type === 'psa' ? 'PSA Graded Card' : type === 'raw' ? 'Raw Card' : 'Sealed Product';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Images:</span>
                    <span className="font-medium text-slate-900">{item.images?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Item-specific Information */}
            {renderItemSpecificInfo()}

            {/* Price History */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Price History
              </h2>
              
              {item.priceHistory && item.priceHistory.length > 0 ? (
                <PriceHistoryDisplay 
                  priceHistory={item.priceHistory} 
                  currentPrice={item.myPrice}
                />
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No price history available</p>
                </div>
              )}
            </div>

            {/* Sale Information */}
            {renderSaleInfo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionItemDetail;