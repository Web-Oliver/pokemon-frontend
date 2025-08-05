/**
 * Auction Detail Page
 * Displays detailed view of a single auction with items and management options
 * Phase 9.1 - Auction List & Detail Pages implementation
 */

import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  DollarSign,
  Download,
  Edit,
  FileText,
  Package,
  Plus,
  Share,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import Modal from '../components/common/Modal';
import { MarkSoldForm } from '../components/forms/MarkSoldForm';
import { PageLayout } from '../components/layouts/PageLayout';
import AddItemToAuctionModal from '../components/modals/AddItemToAuctionModal';
import { ISaleDetails } from '../domain/models/common';
import { useAuction } from '../hooks/useAuction';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import {
  handleApiError,
  showSuccessToast,
  showWarningToast,
} from '../utils/errorHandler';
import { navigationHelper } from '../utils/navigation';

interface AuctionDetailProps {
  auctionId?: string;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({ auctionId }) => {
  const {
    currentAuction,
    loading,
    error,
    fetchAuctionById,
    deleteAuction,
    addItemToAuction,
    removeItemFromAuction,
    markAuctionItemSold,
    generateFacebookPost,
    downloadAuctionTextFile,
    downloadAuctionImagesZip,
    clearError,
    clearCurrentAuction,
  } = useAuction();

  const {
    markPsaCardSold,
    markRawCardSold,
    markSealedProductSold,
    loading: collectionLoading,
  } = useCollectionOperations();

  // Get auction ID from URL if not provided as prop
  const [currentAuctionId, setCurrentAuctionId] = useState<string>('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [generatedFacebookPost, setGeneratedFacebookPost] =
    useState<string>('');
  const [showFacebookPost, setShowFacebookPost] = useState(false);
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'psa' | 'raw' | 'sealed';
    name: string;
    itemCategory?: string;
  } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showRemoveItemConfirmation, setShowRemoveItemConfirmation] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingItem, setRemovingItem] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    // Extract auction ID from URL
    const pathParts = window.location.pathname.split('/');
    const urlAuctionId = auctionId || pathParts[pathParts.length - 1];

    if (urlAuctionId && urlAuctionId !== 'auctions') {
      setCurrentAuctionId(urlAuctionId);
      fetchAuctionById(urlAuctionId);
    }

    return () => {
      clearCurrentAuction();
    };
  }, [auctionId, fetchAuctionById, clearCurrentAuction]);

  // Navigation
  const navigateToAuctions = () => {
    navigationHelper.navigateTo('/auctions');
  };

  const navigateToEditAuction = () => {
    navigationHelper.navigateToEdit.auction(currentAuctionId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Extract item display data from populated structure - UPDATED for new field structure
  const getItemDisplayData = (item: any) => {
    const defaultData = {
      itemName: 'Unknown Item',
      itemImage: undefined,
      setName: undefined,
      cardNumber: undefined, // NEW: Add cardNumber support
      grade: undefined,
      condition: undefined,
      price: undefined,
    };

    if (!item.itemData) {
      return defaultData;
    }

    const { itemData, itemCategory } = item;

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string | undefined) => {
      if (!imagePath) {
        return undefined;
      }
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // If it's a relative path, prepend the backend server URL
      return `http://localhost:3000${imagePath}`;
    };

    switch (itemCategory) {
      case 'PsaGradedCard':
      case 'RawCard':
        return {
          itemName:
            itemData.cardId?.cardName || itemData.cardName || 'Unknown Item', // REMOVED: baseName reference (deprecated)
          itemImage: getImageUrl(itemData.images?.[0]),
          setName: itemData.cardId?.setId?.setName || itemData.setName,
          cardNumber: itemData.cardId?.cardNumber || itemData.cardNumber, // NEW: cardNumber support
          grade: itemCategory === 'PsaGradedCard' ? itemData.grade : undefined,
          condition:
            itemCategory === 'RawCard' ? itemData.condition : undefined,
          price: itemData.myPrice,
        };
      case 'SealedProduct':
        return {
          itemName:
            itemData.name ||
            itemData.productId?.productName ||
            itemData.productName ||
            'Unknown Item', // UPDATED: Support new Product model structure
          itemImage: getImageUrl(itemData.images?.[0]),
          setName:
            itemData.setName ||
            itemData.productId?.setProductName ||
            itemData.setProductName ||
            undefined, // UPDATED: Support SetProduct hierarchy
          cardNumber: undefined, // N/A for sealed products
          grade: undefined,
          condition: undefined,
          price: itemData.myPrice,
        };
      default:
        return defaultData;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} kr.`;
  };

  // Get status color - Theme-aware design system
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
      case 'active':
        return 'bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/50';
      case 'sold':
        return 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/50';
      case 'expired':
        return 'bg-[var(--theme-status-error)]/20 text-[var(--theme-status-error)] border border-[var(--theme-status-error)]/50';
      default:
        return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
    }
  };

  // Get item category color - Theme-aware design system
  const getItemCategoryColor = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/50';
      case 'RawCard':
        return 'bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/50';
      case 'SealedProduct':
        return 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/50';
      default:
        return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
    }
  };

  // Format item category for display
  const formatItemCategory = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'PSA Graded Card';
      case 'RawCard':
        return 'Raw Card';
      case 'SealedProduct':
        return 'Sealed Product';
      default:
        return category;
    }
  };

  // Handle delete auction
  const handleDeleteAuction = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAuction = async () => {
    try {
      setDeleting(true);
      await deleteAuction(currentAuctionId);
      // Set a flag in sessionStorage to indicate auctions list needs refresh
      sessionStorage.setItem('auctionsNeedRefresh', 'true');
      showSuccessToast('Auction deleted successfully');
      setShowDeleteConfirmation(false);
      navigateToAuctions();
    } catch (err) {
      // Error handled by the hook
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeleteAuction = () => {
    setShowDeleteConfirmation(false);
  };

  // Handle add items to auction
  const handleAddItems = async (
    items: { itemId: string; itemCategory: string }[]
  ) => {
    for (const item of items) {
      await addItemToAuction(currentAuctionId, item);
    }
  };

  // Handle remove item from auction
  const handleRemoveItem = (
    itemId: string,
    itemName: string,
    itemCategory: string
  ) => {
    setItemToRemove({ id: itemId, name: itemName, category: itemCategory });
    setShowRemoveItemConfirmation(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) {
      return;
    }

    try {
      setRemovingItem(true);
      await removeItemFromAuction(
        currentAuctionId,
        itemToRemove.id,
        itemToRemove.category
      );
      showSuccessToast('Item removed from auction');
      setShowRemoveItemConfirmation(false);
      setItemToRemove(null);
    } catch (err) {
      // Error handled by the hook
    } finally {
      setRemovingItem(false);
    }
  };

  const handleCancelRemoveItem = () => {
    setShowRemoveItemConfirmation(false);
    setItemToRemove(null);
  };

  // Handle mark item as sold - open modal with item details
  const handleMarkSold = (item: any) => {
    // Don't allow marking already sold items as sold
    if (item.sold || (item.itemData && item.itemData.sold)) {
      return;
    }

    const itemId = item.itemId || item.itemData?._id;
    const itemCategory = item.itemCategory;
    const displayData = getItemDisplayData(item);

    // Determine item type based on category
    let itemType: 'psa' | 'raw' | 'sealed';
    switch (itemCategory) {
      case 'PsaGradedCard':
        itemType = 'psa';
        break;
      case 'RawCard':
        itemType = 'raw';
        break;
      case 'SealedProduct':
        itemType = 'sealed';
        break;
      default:
        handleApiError(
          new Error(`Unknown item category: ${itemCategory}`),
          'Invalid item category'
        );
        return;
    }

    setSelectedItem({
      id: itemId,
      type: itemType,
      name: displayData.itemName || 'Unknown Item',
      itemCategory, // Store category for auction sale tracking
    });
    setIsMarkSoldModalOpen(true);
  };

  // Check if item is sold
  const isItemSold = (item: any) => {
    return item.sold || (item.itemData && item.itemData.sold);
  };

  // Handle mark sold form submission
  const handleMarkSoldSubmit = async (saleDetails: ISaleDetails) => {
    if (!selectedItem) {
      return;
    }

    try {
      // Step 1: Mark the collection item as sold
      switch (selectedItem.type) {
        case 'psa':
          await markPsaCardSold(selectedItem.id, saleDetails);
          break;
        case 'raw':
          await markRawCardSold(selectedItem.id, saleDetails);
          break;
        case 'sealed':
          await markSealedProductSold(selectedItem.id, saleDetails);
          break;
      }

      // Step 2: Also mark the auction item as sold to update auction's soldValue
      if (selectedItem.itemCategory) {
        await markAuctionItemSold(currentAuctionId, {
          itemId: selectedItem.id,
          itemCategory: selectedItem.itemCategory,
          soldPrice: saleDetails.actualSoldPrice || 0,
        });
      }

      // Close modal and reset selected item
      setIsMarkSoldModalOpen(false);
      setSelectedItem(null);

      // Refresh the auction to show updated sold status (already handled by markAuctionItemSold)
      // await fetchAuctionById(currentAuctionId);
    } catch (error) {
      handleApiError(error, 'Failed to mark item as sold');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsMarkSoldModalOpen(false);
    setSelectedItem(null);
  };

  // Handle Facebook post generation
  const handleGenerateFacebookPost = async () => {
    try {
      const postText = await generateFacebookPost(currentAuctionId);
      setGeneratedFacebookPost(postText);
      setShowFacebookPost(true);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedFacebookPost);
      showSuccessToast('Facebook post copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = generatedFacebookPost;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessToast('Facebook post copied to clipboard!');
      } catch {
        showWarningToast('Failed to copy to clipboard. Please copy manually.');
      }
    }
  };

  // Handle download text file
  const handleDownloadTextFile = async () => {
    try {
      await downloadAuctionTextFile(currentAuctionId);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle download images zip
  const handleDownloadImagesZip = async () => {
    try {
      await downloadAuctionImagesZip(currentAuctionId);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Calculate progress
  const soldItems =
    currentAuction?.items.filter((item) => isItemSold(item)).length || 0;
  const totalItems = currentAuction?.items.length || 0;
  const progress = totalItems > 0 ? (soldItems / totalItems) * 100 : 0;

  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={navigateToEditAuction}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Edit Auction
      </button>
      <button
        onClick={navigateToAuctions}
        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Back to Auctions
      </button>
    </div>
  );

  if (!currentAuction) {
    return (
      <PageLayout
        title="Auction Not Found"
        subtitle="The requested auction could not be found"
        loading={false}
        error="Auction not found"
        variant="default"
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-error)]/5 via-rose-500/5 to-pink-500/5"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-text-secondary)] to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-[var(--theme-text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
                  Auction not found
                </h3>
                <p className="text-[var(--theme-text-muted)] font-medium max-w-md mx-auto leading-relaxed mb-8">
                  The auction you're looking for doesn't exist or has been
                  deleted.
                </p>
                <Button onClick={navigateToAuctions}>Back to Auctions</Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={currentAuction?.topText || 'Auction Details'}
      subtitle={currentAuction?.bottomText || 'View and manage auction details'}
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
      {/* Context7 Premium Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Context7 Premium Header */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent-primary)]/5 via-[var(--theme-accent-secondary)]/5 to-[var(--theme-accent-primary)]/5"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-6">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide ${getStatusColor(currentAuction.status)}`}
                    >
                      {currentAuction.status.charAt(0).toUpperCase() +
                        currentAuction.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center text-[var(--theme-text-secondary)]">
                      <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-accent-secondary)] to-purple-600 rounded-xl flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        {formatDate(currentAuction.auctionDate)}
                      </span>
                    </div>

                    <div className="flex items-center text-[var(--theme-text-secondary)]">
                      <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-status-success)] to-teal-600 rounded-xl flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center text-[var(--theme-text-secondary)]">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        Total Value: {formatCurrency(currentAuction.totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>

          {/* Context7 Premium Error Message */}
          {error && (
            <div className="bg-[var(--theme-status-error)]/10 backdrop-blur-sm border border-[var(--theme-status-error)]/30 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-status-error)] to-rose-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <X className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[var(--theme-status-error)] font-medium">
                    {error}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearError}
                    className="inline-flex text-[var(--theme-status-error)]/70 hover:text-[var(--theme-status-error)] p-2 rounded-lg hover:bg-[var(--theme-status-error)]/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context7 Premium Progress and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent-secondary)]/5 to-purple-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--theme-accent-secondary)] tracking-wide uppercase">
                    Sales Progress
                  </h3>
                  <span className="text-sm font-bold text-[var(--theme-text-primary)]">
                    {soldItems}/{totalItems}
                  </span>
                </div>
                <div className="w-full bg-[var(--theme-surface-secondary)] rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-[var(--theme-accent-secondary)] to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                  {progress.toFixed(1)}% of items sold
                </p>
              </div>
            </div>

            <div className="group bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-[var(--theme-border)] hover:scale-105 transition-all duration-500 hover:shadow-[var(--theme-status-success)]/20">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-status-success)]/5 to-teal-500/5"></div>
              <div className="flex items-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-status-success)] to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-[var(--theme-status-success)] tracking-wide uppercase mb-1">
                    Sold Value
                  </p>
                  <p className="text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-status-success)] transition-colors duration-300">
                    {formatCurrency(currentAuction.soldValue || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-[var(--theme-border)] hover:scale-105 transition-all duration-500 hover:shadow-[var(--theme-accent-primary)]/20">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent-primary)]/5 to-[var(--theme-accent-secondary)]/5"></div>
              <div className="flex items-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-accent-primary)] to-[var(--theme-accent-secondary)] rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-[var(--theme-accent-primary)] tracking-wide uppercase mb-1">
                    Remaining Value
                  </p>
                  <p className="text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-300">
                    {formatCurrency(
                      (currentAuction.totalValue || 0) -
                        (currentAuction.soldValue || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Export and Social Media Tools */}
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/3 via-purple-500/3 to-indigo-500/3"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-wide">
                Export & Social Media Tools
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Facebook Post Generation */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--theme-accent-secondary)] tracking-wide uppercase">
                    Facebook Post
                  </h4>
                  <div className="space-y-3">
                    <Button
                      onClick={handleGenerateFacebookPost}
                      disabled={loading}
                      className="w-full flex items-center justify-center"
                      variant="outline"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Generate Post
                    </Button>
                    {showFacebookPost && generatedFacebookPost && (
                      <Button
                        onClick={handleCopyToClipboard}
                        className="w-full flex items-center justify-center"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    )}
                  </div>
                </div>

                {/* Text File Export */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--theme-status-success)] tracking-wide uppercase">
                    Text File Export
                  </h4>
                  <Button
                    onClick={handleDownloadTextFile}
                    disabled={loading}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Text File
                  </Button>
                </div>

                {/* Images Zip Export */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-amber-600 tracking-wide uppercase">
                    Image Export
                  </h4>
                  <Button
                    onClick={handleDownloadImagesZip}
                    disabled={loading}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Images Zip
                  </Button>
                </div>
              </div>

              {/* Generated Facebook Post Display */}
              {showFacebookPost && generatedFacebookPost && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      Generated Facebook Post
                    </h4>
                    <Button
                      onClick={() => setShowFacebookPost(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-[var(--theme-surface-secondary)] backdrop-blur-sm rounded-2xl p-6 border border-[var(--theme-border)]">
                    <textarea
                      className="w-full h-32 p-4 border-0 bg-transparent resize-none focus:outline-none text-sm font-medium text-[var(--theme-text-secondary)]"
                      value={generatedFacebookPost}
                      readOnly
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleCopyToClipboard}
                        size="sm"
                        className="flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context7 Premium Auction Items */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-success)]/3 via-teal-500/3 to-[var(--theme-accent-primary)]/3"></div>
            <div className="relative z-10">
              <div className="px-8 py-6 border-b border-[var(--theme-border)] flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                  Auction Items ({currentAuction.items.length})
                </h2>
                <Button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Add Items
                </Button>
              </div>

              {currentAuction.items.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-text-secondary)] to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-[var(--theme-text-muted)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
                    No items in auction
                  </h3>
                  <p className="text-[var(--theme-text-secondary)] font-medium max-w-md mx-auto leading-relaxed mb-8">
                    Add items from your collection to this auction.
                  </p>
                  <Button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  {currentAuction.items.map((item: any, index: number) => {
                    const displayData = getItemDisplayData(item);
                    return (
                      <div
                        key={`${item.itemId || item.itemData?._id}-${index}`}
                        className="group bg-[var(--theme-surface-secondary)] backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--theme-border)] p-6 hover:bg-[var(--theme-surface-secondary)]/80 hover:shadow-xl hover:scale-102 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-success)]/5 via-teal-500/5 to-[var(--theme-accent-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-start space-x-6">
                            {/* Regular Image Display */}
                            <div className="flex-shrink-0">
                              {displayData.itemImage ? (
                                <img
                                  src={displayData.itemImage}
                                  alt={displayData.itemName}
                                  className="w-32 h-52 object-cover rounded-xl border border-zinc-600 shadow-lg"
                                />
                              ) : (
                                <div className="w-32 h-52 bg-[var(--theme-surface-secondary)] rounded-xl border border-[var(--theme-border)] flex items-center justify-center">
                                  <Package className="w-8 h-8 text-[var(--theme-text-muted)]" />
                                </div>
                              )}
                            </div>

                            {/* Card Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-status-success)] transition-colors duration-300">
                                    {displayData.itemName}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${getItemCategoryColor(item.itemCategory)}`}
                                  >
                                    {formatItemCategory(item.itemCategory)}
                                  </span>
                                  {isItemSold(item) && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <Check className="w-3 h-3 mr-1" />
                                      Sold
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {!isItemSold(item) && (
                                    <Button
                                      onClick={() => handleMarkSold(item)}
                                      variant="outline"
                                      size="sm"
                                      className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:border-emerald-300"
                                    >
                                      Mark Sold
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() =>
                                      handleRemoveItem(
                                        item.itemId || item.itemData?._id,
                                        displayData.itemName,
                                        item.itemCategory
                                      )
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              {/* Card Information Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <span className="font-medium text-[var(--theme-text-secondary)]">
                                      Item ID:
                                    </span>
                                    <span className="text-[var(--theme-text-primary)] font-mono text-xs">
                                      {item.itemId || item.itemData?._id}
                                    </span>
                                  </div>
                                  {displayData.itemName &&
                                    displayData.itemName !== 'Unknown Item' && (
                                      <div className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-[var(--theme-text-secondary)]">
                                          {item.itemCategory === 'SealedProduct'
                                            ? 'Product Name:'
                                            : 'Card Name:'}
                                        </span>
                                        <span className="text-[var(--theme-text-primary)] font-medium">
                                          {displayData.itemName}
                                        </span>
                                      </div>
                                    )}
                                  {/* NEW: Card Number display for card items */}
                                  {(item.itemCategory === 'PsaGradedCard' ||
                                    item.itemCategory === 'RawCard') &&
                                    displayData.cardNumber && (
                                      <div className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-[var(--theme-text-secondary)]">
                                          Card Number:
                                        </span>
                                        <span className="text-[var(--theme-text-primary)] font-bold text-yellow-500">
                                          #{displayData.cardNumber}
                                        </span>
                                      </div>
                                    )}
                                  {item.itemCategory === 'PsaGradedCard' &&
                                    displayData.grade && (
                                      <div className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-[var(--theme-text-secondary)]">
                                          PSA Grade:
                                        </span>
                                        <span className="text-[var(--theme-text-primary)] font-bold text-[var(--theme-accent-primary)]">
                                          Grade {displayData.grade}
                                        </span>
                                      </div>
                                    )}
                                  {item.itemCategory === 'RawCard' &&
                                    displayData.condition && (
                                      <div className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-[var(--theme-text-secondary)]">
                                          Condition:
                                        </span>
                                        <span className="text-[var(--theme-text-primary)] font-medium">
                                          {displayData.condition}
                                        </span>
                                      </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                  {displayData.setName && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="font-medium text-[var(--theme-text-secondary)]">
                                        Set:
                                      </span>
                                      <span className="text-[var(--theme-text-primary)] font-medium">
                                        {displayData.setName}
                                      </span>
                                    </div>
                                  )}
                                  {displayData.price && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="font-medium text-[var(--theme-text-secondary)]">
                                        Listed Price:
                                      </span>
                                      <span className="text-[var(--theme-text-primary)] font-bold text-[var(--theme-status-success)]">
                                        {formatCurrency(displayData.price)}
                                      </span>
                                    </div>
                                  )}
                                  {item.salePrice && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="font-medium text-[var(--theme-text-secondary)]">
                                        Sale Price:
                                      </span>
                                      <span className="text-[var(--theme-status-success)] font-bold">
                                        {formatCurrency(item.salePrice)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Context7 Premium Auction Metadata */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-surface-secondary)]/30 via-gray-500/3 to-[var(--theme-surface-secondary)]/30"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-6 tracking-wide">
                Auction Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <dt className="font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase mb-2">
                    Created
                  </dt>
                  <dd className="text-[var(--theme-text-primary)] font-medium">
                    {formatDate(currentAuction.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase mb-2">
                    Last Updated
                  </dt>
                  <dd className="text-[var(--theme-text-primary)] font-medium">
                    {formatDate(currentAuction.updatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase mb-2">
                    Active Status
                  </dt>
                  <dd className="text-[var(--theme-text-primary)] font-medium">
                    {currentAuction.isActive ? 'Yes' : 'No'}
                  </dd>
                </div>
                {currentAuction.generatedFacebookPost && (
                  <div className="md:col-span-2">
                    <dt className="font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase mb-2">
                      Generated Facebook Post
                    </dt>
                    <dd className="text-[var(--theme-text-primary)] mt-1">
                      <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 dark:border-zinc-700">
                        <p className="whitespace-pre-wrap text-sm font-medium">
                          {currentAuction.generatedFacebookPost}
                        </p>
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Add Item to Auction Modal */}
          <AddItemToAuctionModal
            isOpen={isAddItemModalOpen}
            onClose={() => setIsAddItemModalOpen(false)}
            onAddItems={handleAddItems}
            currentAuctionItems={
              currentAuction?.items?.map((item) => ({
                itemId: item.itemId,
                itemCategory: item.itemCategory,
              })) || []
            }
          />

          {/* Mark as Sold Modal */}
          <Modal
            isOpen={isMarkSoldModalOpen}
            onClose={handleModalClose}
            title={`Mark "${selectedItem?.name}" as Sold`}
            maxWidth="2xl"
          >
            {selectedItem && (
              <MarkSoldForm
                itemId={selectedItem.id}
                itemType={selectedItem.type}
                onSubmit={handleMarkSoldSubmit}
                onCancel={handleModalClose}
                isLoading={collectionLoading}
              />
            )}
          </Modal>

          {/* Delete Auction Confirmation Modal */}
          <ConfirmModal
            isOpen={showDeleteConfirmation}
            onClose={handleCancelDeleteAuction}
            onConfirm={confirmDeleteAuction}
            title="Delete Auction"
            description={`Are you sure you want to delete the auction "${currentAuction?.topText || 'Untitled Auction'}"? This action cannot be undone and will permanently remove the auction and all its associated data.`}
            confirmText="Delete Auction"
            variant="danger"
            icon="trash"
            isLoading={deleting}
          />

          {/* Remove Item Confirmation Modal */}
          <ConfirmModal
            isOpen={showRemoveItemConfirmation}
            onClose={handleCancelRemoveItem}
            onConfirm={confirmRemoveItem}
            title="Remove Item from Auction"
            description={`Are you sure you want to remove "${itemToRemove?.name || 'this item'}" from the auction? This will not delete the item from your collection, only remove it from this auction.`}
            confirmText="Remove Item"
            variant="warning"
            icon="trash"
            isLoading={removingItem}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default AuctionDetail;
