/**
 * Collection Item Detail Page
 * Shows comprehensive information about a single collection item
 * Following CLAUDE.md principles for detailed information display
 */

import {
  Archive,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  Image as ImageIcon,
  Info,
  Package,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import { ImageProductView } from '../components/common/ImageProductView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageLayout } from '../components/layouts/PageLayout';
import { PriceHistoryDisplay } from '../components/PriceHistoryDisplay';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import {
  getCollectionApiService,
  getExportApiService,
} from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { navigationHelper } from '../utils/navigation';

type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

const CollectionItemDetail: React.FC = () => {
  const [item, setItem] = useState<CollectionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ZIP download handler
  const handleDownloadImages = async () => {
    if (!item) {
      return;
    }

    const { type, id } = getUrlParams();
    if (!type || !id) {
      return;
    }

    try {
      setDownloadingZip(true);

      let zipBlob: Blob;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];

      const exportApi = getExportApiService();

      switch (type) {
        case 'psa':
          zipBlob = await exportApi.zipPsaCardImages([id]);
          filename = `psa-card-${getItemTitle().replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.zip`;
          break;
        case 'raw':
          zipBlob = await exportApi.zipRawCardImages([id]);
          filename = `raw-card-${getItemTitle().replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.zip`;
          break;
        case 'sealed':
          zipBlob = await exportApi.zipSealedProductImages([id]);
          filename = `sealed-product-${getItemTitle().replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.zip`;
          break;
        default:
          throw new Error('Unknown item type');
      }

      exportApi.downloadBlob(zipBlob, filename);
      showSuccessToast('Images downloaded successfully!');
      log('[CollectionItemDetail] Images zip downloaded successfully', {
        itemId: id,
        type,
      });
    } catch (err: any) {
      const errorMessage = 'Failed to download images';
      setError(errorMessage);
      handleApiError(err, errorMessage);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Price update handler
  const handlePriceUpdate = async (newPrice: number, date: string) => {
    if (!item) {
      return;
    }

    try {
      setLoading(true);
      const { type, id } = getUrlParams();

      if (!type || !id) {
        throw new Error('Invalid URL parameters');
      }

      // Create updated price history with new entry
      const updatedPriceHistory = [
        ...(item.priceHistory || []),
        { price: newPrice, dateUpdated: date },
      ];

      let updatedItem: CollectionItem;

      const collectionApi = getCollectionApiService();

      // Update item based on type - backend will automatically sync myPrice to latest price
      if (type === 'psa') {
        updatedItem = await collectionApi.updatePsaCard(id, {
          priceHistory: updatedPriceHistory,
        });
      } else if (type === 'raw') {
        updatedItem = await collectionApi.updateRawCard(id, {
          priceHistory: updatedPriceHistory,
        });
      } else if (type === 'sealed') {
        updatedItem = await collectionApi.updateSealedProduct(id, {
          priceHistory: updatedPriceHistory,
        });
      } else {
        throw new Error('Unknown item type');
      }

      // Update local state with fresh data from server
      setItem(updatedItem);
      showSuccessToast(
        'Price updated successfully! My Price synced to latest entry.'
      );
      log('[CollectionItemDetail] Price updated successfully', {
        newPrice,
        itemId: id,
      });
    } catch (err: any) {
      const errorMessage = 'Failed to update price';
      setError(errorMessage);
      handleApiError(err, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Extract type and id from URL path using navigationHelper
  const getUrlParams = () => {
    return navigationHelper.getCollectionItemParams();
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
        const collectionApi = getCollectionApiService();
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

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const { type, id } = getUrlParams();

    if (!item || !type || !id) {
      return;
    }

    try {
      setDeleting(true);
      const collectionApi = getCollectionApiService();

      switch (type) {
        case 'psa':
          await collectionApi.deletePsaCard(id);
          break;
        case 'raw':
          await collectionApi.deleteRawCard(id);
          break;
        case 'sealed':
          await collectionApi.deleteSealedProduct(id);
          break;
      }

      showSuccessToast('Item deleted successfully');
      setShowDeleteConfirm(false);
      // Navigate back to collection
      navigationHelper.navigateToCollection();
    } catch (err) {
      handleApiError(err, 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    const { type, id } = getUrlParams();

    if (!item || !type || !id) {
      return;
    }

    // Navigate to edit form with the item data
    // The edit forms are part of the AddEditItem page with edit mode
    navigationHelper.navigateToEdit.item(type as 'psa' | 'raw' | 'sealed', id);
  };

  const handleBackToCollection = () => {
    // Navigate back to collection
    navigationHelper.navigateToCollection();
  };

  const getItemTitle = () => {
    if (!item) {
      return 'Loading...';
    }

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
    if (!item) {
      return '';
    }

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
    if (!item) {
      return '';
    }

    if ('setName' in item) {
      return item.setName;
    }

    if ('cardId' in item && item.cardId?.setId?.setName) {
      return item.cardId.setId.setName;
    }

    return 'Unknown Set';
  };

  const renderItemSpecificInfo = () => {
    if (!item) {
      return null;
    }

    if ('grade' in item) {
      // PSA Graded Card
      const psaCard = item as IPsaGradedCard;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/20 p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                PSA Grading Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Grade:</span>
                  <span className="font-bold text-blue-400">
                    {psaCard.grade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Card Name:</span>
                  <span className="font-medium text-zinc-100">
                    {psaCard.cardName || psaCard.cardId?.cardName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Base Name:</span>
                  <span className="font-medium text-zinc-100">
                    {psaCard.cardId?.baseName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Pokemon #:</span>
                  <span className="font-medium text-zinc-100">
                    {psaCard.cardId?.pokemonNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Variety:</span>
                  <span className="font-medium text-zinc-100">
                    {psaCard.cardId?.variety || 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/20 p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Population Data
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Total PSA Population:</span>
                  <span className="font-bold text-green-400">
                    {psaCard.cardId?.psaTotalGradedForCard || 'N/A'}
                  </span>
                </div>
                {psaCard.cardId?.psaGrades && (
                  <div className="mt-4">
                    <p className="text-sm text-zinc-300 mb-2">
                      Grade Distribution:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(psaCard.cardId.psaGrades)
                        .filter(([, count]) => count > 0) // Only show grades with population > 0
                        .map(([grade, count]) => {
                          // Extract grade number from "psa_X" format
                          const gradeNumber = grade.replace('psa_', '');
                          return (
                            <div
                              key={grade}
                              className={`flex justify-between p-2 rounded ${
                                psaCard.grade === gradeNumber
                                  ? 'bg-blue-500/20 border border-blue-400/50 font-bold text-blue-400'
                                  : 'bg-zinc-800/50 text-zinc-100'
                              }`}
                            >
                              <span>Grade {gradeNumber}:</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Show total population */}
                    <div className="mt-3 pt-2 border-t border-zinc-700">
                      <div className="flex justify-between text-sm font-semibold text-zinc-100">
                        <span>Total Population:</span>
                        <span>
                          {Object.values(psaCard.cardId.psaGrades).reduce(
                            (sum: number, count: any) => sum + (count || 0),
                            0
                          )}
                        </span>
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
              <span className="font-bold text-emerald-800">
                {rawCard.condition}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Card Name:</span>
              <span className="font-medium text-emerald-800">
                {rawCard.cardName || rawCard.cardId?.cardName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Base Name:</span>
              <span className="font-medium text-emerald-800">
                {rawCard.cardId?.baseName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Pokemon #:</span>
              <span className="font-medium text-emerald-800">
                {rawCard.cardId?.pokemonNumber || 'N/A'}
              </span>
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
              <span className="font-bold text-purple-800">
                {sealedProduct.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">Availability:</span>
              <span className="font-medium text-purple-800">
                {sealedProduct.availability || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">CardMarket Price:</span>
              <span className="font-medium text-purple-800">
                {sealedProduct.cardMarketPrice || 'N/A'} kr.
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSaleInfo = () => {
    if (!item || !item.sold || !item.saleDetails) {
      return null;
    }

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
              <span className="font-bold text-green-800">
                {item.saleDetails.actualSoldPrice} kr.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Payment Method:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Delivery:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.deliveryMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Source:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.source}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600">Date Sold:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.dateSold
                  ? new Date(item.saleDetails.dateSold).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Buyer:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.buyerFullName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Tracking:</span>
              <span className="font-medium text-green-800">
                {item.saleDetails.trackingNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleEdit}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Edit Item
      </button>
      <button
        onClick={handleBackToCollection}
        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Back to Collection
      </button>
    </div>
  );

  return (
    <PageLayout
      title={getItemTitle()}
      subtitle="View and manage your collection item"
      loading={loading}
      error={error || (!item ? 'Item not found' : null)}
      actions={headerActions}
      variant="default"
    >
      <>
        {!item ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <p className="text-zinc-400 mb-4">Loading item details...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToCollection}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collection
              </Button>

              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                      {getItemTitle()}
                    </h1>
                    <p className="text-xl text-zinc-300 mb-2">
                      {getItemSubtitle()}
                    </p>
                    <p className="text-lg text-zinc-400">Set: {getSetName()}</p>
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

            {/* Main Content - Details */}
            <div className="space-y-6 mb-8">
              {/* Basic Information */}
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-6">
                <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">My Price:</span>
                      <span className="font-bold text-zinc-100">
                        {item.myPrice || '0'} kr.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Date Added:</span>
                      <span className="font-medium text-zinc-100">
                        {item.dateAdded
                          ? new Date(item.dateAdded).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Status:</span>
                      <span
                        className={`font-medium ${item.sold ? 'text-green-600' : 'text-blue-600'}`}
                      >
                        {item.sold ? 'Sold' : 'Available'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Item Type:</span>
                      <span className="font-medium text-zinc-100">
                        {(() => {
                          const { type } = getUrlParams();
                          return type === 'psa'
                            ? 'PSA Graded Card'
                            : type === 'raw'
                              ? 'Raw Card'
                              : 'Sealed Product';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Images:</span>
                      <span className="font-medium text-zinc-100">
                        {item.images?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item-specific Information */}
              {renderItemSpecificInfo()}

              {/* Price History */}
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-6">
                <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Price History
                </h2>

                <PriceHistoryDisplay
                  priceHistory={item.priceHistory || []}
                  currentPrice={item.myPrice}
                  onPriceUpdate={handlePriceUpdate}
                />
              </div>

              {/* Sale Information */}
              {renderSaleInfo()}
            </div>

            {/* Images Section - Using Standardized ImageProductView */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Images
                </h2>

                {/* ZIP Download Button */}
                {item.images && item.images.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadImages}
                    disabled={downloadingZip}
                    className="flex items-center space-x-2"
                  >
                    {downloadingZip ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>
                      {downloadingZip ? 'Downloading...' : 'Download ZIP'}
                    </span>
                  </Button>
                )}
              </div>

              {/* Standardized Image Product View */}
              <div className="w-full flex justify-center">
                <div className="w-full max-w-[400px]">
                  <ImageProductView
                    images={item.images || []}
                    title={getItemTitle()}
                    subtitle={getSetName()}
                    price={item.myPrice}
                    type={(() => {
                      const { type } = getUrlParams();
                      return type as 'psa' | 'raw' | 'sealed';
                    })()}
                    grade={'grade' in item ? item.grade : undefined}
                    condition={'condition' in item ? item.condition : undefined}
                    category={'category' in item ? item.category : undefined}
                    sold={item.sold}
                    saleDate={item.saleDetails?.dateSold}
                    variant="detail"
                    size="xl"
                    aspectRatio="card"
                    showBadge={true}
                    showPrice={true}
                    showActions={true}
                    enableInteractions={true}
                    onDownload={handleDownloadImages}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Collection Item"
          description="Are you sure you want to delete this item? This action cannot be undone and will permanently remove the item from your collection."
          confirmText="Delete Item"
          variant="danger"
          icon="trash"
          isLoading={deleting}
        />
      </>
    </PageLayout>
  );
};

export default CollectionItemDetail;
