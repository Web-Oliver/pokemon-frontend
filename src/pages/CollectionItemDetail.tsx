/**
 * Collection Item Detail Page
 * Shows comprehensive information about a single collection item
 * Following CLAUDE.md principles for detailed information display
 */

import {
  Archive,
  ArrowLeft,
  CheckCircle,
  Download,
  Edit,
  Image as ImageIcon,
  Info,
  Package,
  Plus,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';
import { ImageProductView } from '../components/common/ImageProductView';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
  const [newPrice, setNewPrice] = useState<string>('');

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

  // Handle custom price input
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow whole numbers
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setNewPrice(numericValue);
  };

  const handleCustomPriceUpdate = () => {
    if (!newPrice.trim()) {
      return;
    }

    const price = parseInt(newPrice, 10);
    if (isNaN(price) || price <= 0) {
      return;
    }

    // Check if the new price is the same as current price
    const currentPriceInt = Math.round(item?.myPrice || 0);
    if (price === currentPriceInt) {
      return;
    }

    const currentDate = new Date().toISOString();
    handlePriceUpdate(price, currentDate);
    setNewPrice('');
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
      // PSA Graded Card - Premium Design
      const psaCard = item as IPsaGradedCard;
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PSA Grading Information */}
          <div className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>

            <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                    PSA Certification
                  </h3>
                  <p className="text-white/60 text-sm">
                    Professional grading details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">PSA Grade</span>
                  <span className="font-bold text-blue-400 text-2xl">
                    {psaCard.grade}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">Card Name</span>
                  <span className="font-medium text-white">
                    {psaCard.cardName || psaCard.cardId?.cardName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">Base Name</span>
                  <span className="font-medium text-cyan-300">
                    {psaCard.cardId?.baseName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">Pokemon #</span>
                  <span className="font-bold text-yellow-400">
                    {psaCard.cardId?.pokemonNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">Variety</span>
                  <span className="font-medium text-purple-300">
                    {psaCard.cardId?.variety || 'Standard'}
                  </span>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
            </div>
          </div>

          {/* Population Data */}
          <div className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-teal-900/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.1),transparent_70%)]"></div>

            <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                    Population Data
                  </h3>
                  <p className="text-white/60 text-sm">
                    Rarity & distribution stats
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className="text-white/70 font-medium">
                    Total PSA Population
                  </span>
                  <span className="font-bold text-green-400 text-xl">
                    {psaCard.cardId?.psaTotalGradedForCard || 'N/A'}
                  </span>
                </div>

                {psaCard.cardId?.psaGrades && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/80 font-medium mb-3">
                      Grade Distribution:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(psaCard.cardId.psaGrades)
                        .filter(([, count]) => count > 0)
                        .map(([grade, count]) => {
                          const gradeNumber = grade.replace('psa_', '');
                          const isCurrentGrade = psaCard.grade === gradeNumber;
                          return (
                            <div
                              key={grade}
                              className={`flex justify-between items-center p-2 rounded-lg border transition-all duration-300 ${
                                isCurrentGrade
                                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 shadow-lg shadow-blue-500/20'
                                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <span className="font-medium text-sm">
                                Grade {gradeNumber}
                              </span>
                              <span
                                className={`font-bold text-sm ${isCurrentGrade ? 'text-blue-400' : 'text-white'}`}
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <span className="text-green-300 font-medium">
                          Total Population
                        </span>
                        <span className="text-green-400 font-bold text-lg">
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

              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
            </div>
          </div>
        </div>
      );
    }

    if ('condition' in item) {
      // Raw Card - Premium Design
      const rawCard = item as IRawCard;
      return (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-green-900/10 to-teal-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.1),transparent_70%)]"></div>

          <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-100 to-green-100 bg-clip-text text-transparent">
                  Raw Card Details
                </h3>
                <p className="text-white/60 text-sm">
                  Ungraded card information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Condition</span>
                <span className="font-bold text-emerald-400 text-lg">
                  {rawCard.condition}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Card Name</span>
                <span className="font-medium text-white">
                  {rawCard.cardName || rawCard.cardId?.cardName || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Base Name</span>
                <span className="font-medium text-cyan-300">
                  {rawCard.cardId?.baseName || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Pokemon #</span>
                <span className="font-bold text-yellow-400">
                  {rawCard.cardId?.pokemonNumber || 'N/A'}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
          </div>
        </div>
      );
    }

    if ('category' in item) {
      // Sealed Product - Premium Design
      const sealedProduct = item as ISealedProduct;
      return (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-violet-900/10 to-fuchsia-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(147,51,234,0.1),transparent_70%)]"></div>

          <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <Archive className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-fuchsia-100 bg-clip-text text-transparent">
                  Sealed Product
                </h3>
                <p className="text-white/60 text-sm">
                  Unopened product details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Category</span>
                <span className="font-bold text-purple-400 text-lg">
                  {sealedProduct.category}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Availability</span>
                <span className="font-medium text-cyan-300">
                  {sealedProduct.availability || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-white/70 font-medium">Market Price</span>
                <span className="font-bold text-green-400">
                  {sealedProduct.cardMarketPrice || 'N/A'} kr
                </span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
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
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Award-Winning Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-blue-950/30"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08),transparent_70%)]"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(236,72,153,0.05),transparent_70%)]"></div>

        {/* Floating Particles Effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/3 right-20 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-400/20 rounded-full animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative z-10">
          {loading && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"
                    style={{
                      animationDirection: 'reverse',
                      animationDuration: '1.5s',
                    }}
                  ></div>
                </div>
                <p className="text-white/80 text-lg">
                  Loading premium details...
                </p>
              </div>
            </div>
          )}

          {error && !item && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center p-8 rounded-3xl bg-red-500/10 backdrop-blur-xl border border-red-500/20">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  Item Not Found
                </h3>
                <p className="text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {item && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* Stunning Header Section */}
              <div className="mb-8">
                <div className="mb-6">
                  <button
                    onClick={handleBackToCollection}
                    className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-medium">Back to Collection</span>
                  </button>
                </div>

                {/* Premium Header Card */}
                <div className="relative overflow-hidden">
                  {/* Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>

                  <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                            <Star className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                              {getItemTitle()}
                            </h1>
                            <p className="text-lg text-blue-300/80 font-medium mt-1">
                              {getItemSubtitle()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6">
                          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white/90">
                            <span className="text-sm font-medium">
                              Set: {getSetName()}
                            </span>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-green-500/20 backdrop-blur-xl border border-green-500/30 text-green-300">
                            <span className="text-sm font-bold">
                              {item.myPrice || '0'} kr
                            </span>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-xl backdrop-blur-xl border ${item.sold ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}
                          >
                            <span className="text-sm font-medium">
                              {item.sold ? 'Sold' : 'Available'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3">
                        <button
                          onClick={handleEdit}
                          className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-blue-400/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Edit Item</span>
                          </div>
                        </button>

                        <button
                          onClick={handleDelete}
                          className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-red-400/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center space-x-2">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Breathing Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Stunning Information Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Premium Basic Information */}
                <div className="relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-purple-900/20"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>

                  <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 h-full flex flex-col">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                        <Info className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                          Essential Details
                        </h2>
                        <p className="text-white/60 text-sm">
                          Core item information
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Current Value
                        </span>
                        <span className="font-bold text-green-400 text-lg">
                          {item.myPrice || '0'} kr
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Date Added
                        </span>
                        <span className="font-medium text-blue-300">
                          {item.dateAdded
                            ? new Date(item.dateAdded).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Status
                        </span>
                        <span
                          className={`font-bold px-3 py-1 rounded-lg ${item.sold ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}
                        >
                          {item.sold ? 'Sold' : 'Available'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Category
                        </span>
                        <span className="font-medium text-purple-300">
                          {(() => {
                            const { type } = getUrlParams();
                            return type === 'psa'
                              ? 'PSA Graded'
                              : type === 'raw'
                                ? 'Raw Card'
                                : 'Sealed Product';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Images
                        </span>
                        <span className="font-bold text-cyan-400">
                          {item.images?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-white/70 font-medium">
                          Condition
                        </span>
                        <span className="font-bold text-yellow-400">
                          {'grade' in item
                            ? `Grade ${item.grade}`
                            : 'condition' in item
                              ? item.condition
                              : 'Sealed'}
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
                  </div>
                </div>

                {/* Stunning Award-Winning Image Gallery Section - MOVED HERE */}
                <div className="relative overflow-hidden h-full">
                  {/* Premium Background with Gradient Mesh */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-pink-900/20 opacity-50"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]"></div>

                  <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 h-full flex flex-col">
                    {/* Elegant Header with Glass Morphism */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                          Premium Gallery
                        </h2>
                        <p className="text-white/60 text-sm">
                          High-resolution imagery
                        </p>
                      </div>
                    </div>

                    {/* Award-Winning Image Display */}
                    <div className="relative flex-1 flex flex-col">
                      {/* Subtle Glow Effects */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-[2.5rem] blur-xl opacity-60"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-[2rem] blur-lg"></div>

                      {/* Main Image Container */}
                      <div className="relative w-full flex justify-center flex-1">
                        <div className="w-full h-[500px] relative">
                          {/* Premium Border Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-[2px]">
                            <div className="w-full h-full bg-black/60 backdrop-blur-xl rounded-3xl overflow-visible">
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
                                condition={
                                  'condition' in item
                                    ? item.condition
                                    : undefined
                                }
                                category={
                                  'category' in item ? item.category : undefined
                                }
                                sold={item.sold}
                                saleDate={item.saleDetails?.dateSold}
                                variant="detail"
                                size="xl"
                                aspectRatio="auto"
                                showBadge={false}
                                showPrice={false}
                                showActions={false}
                                enableInteractions={false}
                                className="mx-auto h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Breathing Light Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-[2.5rem] animate-pulse opacity-40 pointer-events-none"></div>
                      
                      {/* Premium Download Button - Pushed to bottom */}
                      {item.images && item.images.length > 0 && (
                        <div className="mt-auto pt-6 flex justify-center">
                          <button
                            onClick={handleDownloadImages}
                            disabled={downloadingZip}
                            className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center space-x-2">
                              {downloadingZip ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              <span>
                                {downloadingZip
                                  ? 'Downloading...'
                                  : 'Download ZIP'}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
                  </div>
                </div>

                {/* Premium Price History */}
                <div className="relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-teal-900/20"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.1),transparent_70%)]"></div>

                  <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 h-full flex flex-col">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                          Value Timeline
                        </h2>
                        <p className="text-white/60 text-sm">
                          Price tracking & history
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <PriceHistoryDisplay
                        priceHistory={item.priceHistory || []}
                        currentPrice={item.myPrice}
                        onPriceUpdate={undefined}
                      />
                    </div>

                    {/* Price Update Section - Moved to Right Column */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                          <Plus className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-white via-purple-100 to-violet-100 bg-clip-text text-transparent">
                            Update Price
                          </h3>
                          <p className="text-white/60 text-xs">
                            Adjust market value
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter new price (e.g., 1500)"
                          value={newPrice}
                          onChange={handlePriceInputChange}
                          className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                        />
                        <button
                          onClick={handleCustomPriceUpdate}
                          disabled={
                            !newPrice.trim() ||
                            isNaN(parseInt(newPrice, 10)) ||
                            parseInt(newPrice, 10) <= 0 ||
                            parseInt(newPrice, 10) ===
                              Math.round(item?.myPrice || 0)
                          }
                          className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Update Price</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Item-Specific Premium Information */}
              <div className="mb-8">{renderItemSpecificInfo()}</div>

              {/* Premium Sale Information */}
              {item.sold && item.saleDetails && (
                <div className="mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-pink-900/10 to-rose-900/20"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]"></div>

                  <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                        <CheckCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-red-100 to-pink-100 bg-clip-text text-transparent">
                          Sale Completed
                        </h2>
                        <p className="text-white/60 text-sm">
                          Transaction details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Sale Price
                          </span>
                          <span className="font-bold text-green-400 text-lg">
                            {item.saleDetails.actualSoldPrice} kr
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Payment
                          </span>
                          <span className="font-medium text-blue-300">
                            {item.saleDetails.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Delivery
                          </span>
                          <span className="font-medium text-purple-300">
                            {item.saleDetails.deliveryMethod}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Date Sold
                          </span>
                          <span className="font-medium text-cyan-300">
                            {item.saleDetails.dateSold
                              ? new Date(
                                  item.saleDetails.dateSold
                                ).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Buyer
                          </span>
                          <span className="font-medium text-yellow-300">
                            {item.saleDetails.buyerFullName || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                          <span className="text-white/70 font-medium">
                            Tracking
                          </span>
                          <span className="font-medium text-pink-300">
                            {item.saleDetails.trackingNumber || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-rose-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Premium Delete Confirmation Modal */}
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
  );
};

export default CollectionItemDetail;
