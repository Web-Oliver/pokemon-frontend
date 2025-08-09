/**
 * Auction Detail Page
 * Displays detailed view of a single auction with items and management options
 * Phase 9.1 - Auction List & Detail Pages implementation
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  DollarSign,
  Share,
  Copy,
  FileText,
  Download,
  X,
} from 'lucide-react';
import AuctionItemsSection from '../components/auction/sections/AuctionItemsSection';
import {
  PokemonModal,
  PokemonConfirmModal,
} from '../../../shared/components/atoms/design-system/PokemonModal';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { MarkSoldForm } from '../../../shared/components/forms/MarkSoldForm';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import AddItemToAuctionModal from '../../../components/modals/AddItemToAuctionModal';
import { AuctionItemCard } from '../components/auction/AuctionItemCard';
import { ISaleDetails } from '../../../shared/domain/models/common';
import { useAuction } from '../../../shared/hooks/useAuction';
import { useCollectionOperations } from '../../../shared/hooks/useCollectionOperations';
import { useModal, useConfirmModal } from '../../../shared/hooks/useModal';
import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import {
  showSuccessToast,
  showWarningToast,
} from '../../../shared/components/organisms/ui/toastNotifications';
import { navigationHelper } from "../../../shared/utils/navigation";
import {
  formatCurrency,
  formatDate,
} from '../../../shared/utils/helpers/itemDisplayHelpers';
import { getStatusColor } from '../../../shared/utils/helpers/auctionStatusUtils';
import { GlassmorphismContainer } from '../../../shared/components/organisms/effects/GlassmorphismContainer';

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
  const [generatedFacebookPost, setGeneratedFacebookPost] =
    useState<string>('');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'psa' | 'raw' | 'sealed';
    name: string;
    itemCategory?: string;
  } | null>(null);
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  // Modal management using new hooks
  const addItemModal = useModal();
  const facebookPostModal = useModal();
  const markSoldModal = useModal();
  const deleteConfirmModal = useConfirmModal();
  const removeItemConfirmModal = useConfirmModal();

  useEffect(() => {
    // Extract auction ID from URL or use prop
    const urlAuctionId = auctionId || navigationHelper.getAuctionIdFromUrl();
    
    console.log('AuctionDetail useEffect:', {
      auctionId,
      urlAuctionId,
      currentPath: window.location.pathname
    });

    if (urlAuctionId) {
      console.log('Setting currentAuctionId and fetching auction:', urlAuctionId);
      setCurrentAuctionId(urlAuctionId);
      fetchAuctionById(urlAuctionId);
    } else {
      console.warn('No auction ID found - neither from prop nor URL');
    }

    return () => {
      clearCurrentAuction();
    };
  }, [auctionId, fetchAuctionById, clearCurrentAuction]);

  // Navigation
  const navigateToAuctions = () => {
    console.log('navigateToAuctions clicked');
    navigationHelper.navigateTo('/auctions');
  };

  const navigateToEditAuction = () => {
    console.log('navigateToEditAuction clicked, currentAuctionId:', currentAuctionId);
    console.log('Current URL path:', window.location.pathname);
    
    if (!currentAuctionId) {
      console.error('No auction ID available for navigation');
      return;
    }
    
    // Use correct path format: /auctions/{id}/edit
    const editPath = `/auctions/${currentAuctionId}/edit`;
    console.log('Navigating to edit path:', editPath);
    navigationHelper.navigateTo(editPath);
  };

  // Removed utility functions - now using itemDisplayHelpers

  // Removed: now using formatCurrency from itemDisplayHelpers

  // Removed: now using getStatusColor from itemDisplayHelpers

  // Removed: now using getItemCategoryColor from itemDisplayHelpers

  // Removed: now using formatItemCategory from itemDisplayHelpers

  // Handle delete auction with new modal hook
  const handleDeleteAuction = () => {
    deleteConfirmModal.openModal();
  };

  const confirmDeleteAuction = async () => {
    await deleteConfirmModal.confirmAction(async () => {
      await deleteAuction(currentAuctionId);
      showSuccessToast('Auction deleted successfully');
      navigateToAuctions();
    });
  };

  // Handle add items to auction
  const handleAddItems = async (
    items: { itemId: string; itemCategory: string }[]
  ) => {
    for (const item of items) {
      await addItemToAuction(currentAuctionId, item);
    }
    addItemModal.closeModal();
    showSuccessToast('Items added to auction successfully');
  };

  // Handle remove item from auction with new modal hook
  const handleRemoveItem = (item: any) => {
    const displayData = getItemDisplayData(item);
    setItemToRemove({
      id: item.itemId || item._id,
      name: displayData.itemName,
      category: item.itemCategory,
    });
    removeItemConfirmModal.openModal();
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    await removeItemConfirmModal.confirmAction(async () => {
      await removeItemFromAuction(
        currentAuctionId,
        itemToRemove.id,
        itemToRemove.category
      );
      showSuccessToast('Item removed from auction successfully');
      setItemToRemove(null);
    });
  };

  // Handle mark item as sold - open modal with item details
  const handleMarkSold = (item: any) => {
    // Don't allow marking already sold items as sold
    if (isItemSold(item)) {
      return;
    }

    const itemId = item.itemId || item.itemData?._id;
    const displayData = getItemDisplayData(item);

    // Determine item type based on category
    let itemType: 'psa' | 'raw' | 'sealed';
    switch (item.itemCategory) {
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
          new Error(`Unknown item category: ${item.itemCategory}`),
          'Invalid item category'
        );
        return;
    }

    setSelectedItem({
      id: itemId,
      type: itemType,
      name: displayData.itemName || 'Unknown Item',
      itemCategory: item.itemCategory,
    });
    markSoldModal.openModal();
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
      markSoldModal.closeModal();
      setSelectedItem(null);
      showSuccessToast('Item marked as sold successfully');
    } catch (error) {
      handleApiError(error, 'Failed to mark item as sold');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    markSoldModal.closeModal();
    setSelectedItem(null);
  };

  // Handle Facebook post generation
  const handleGenerateFacebookPost = async () => {
    try {
      const postText = await generateFacebookPost(currentAuctionId);
      setGeneratedFacebookPost(postText);
      facebookPostModal.openModal();
    } catch (_err) {
      // Error handled by the hook
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedFacebookPost);
      showSuccessToast('Facebook post copied to clipboard!');
    } catch (_err) {
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
    } catch (_err) {
      // Error handled by the hook
    }
  };

  // Handle download images zip
  const handleDownloadImagesZip = async () => {
    try {
      await downloadAuctionImagesZip(currentAuctionId);
    } catch (_err) {
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
                  The auction you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </p>
                <PokemonButton onClick={navigateToAuctions}>
                  Back to Auctions
                </PokemonButton>
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
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Glassmorphism Premium Header */}
          <GlassmorphismContainer
            variant="intense"
            colorScheme="primary"
            size="lg"
            rounded="3xl"
            glow="medium"
            pattern="neural"
            animated={true}
            className="group"
          >
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
          </GlassmorphismContainer>

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

          {/* Glassmorphism Premium Progress and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassmorphismContainer
              variant="medium"
              colorScheme="secondary"
              size="lg"
              rounded="3xl"
              glow="medium"
              pattern="dots"
            >
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
            </GlassmorphismContainer>

            <GlassmorphismContainer
              variant="medium"
              colorScheme="success"
              size="lg"
              rounded="3xl"
              glow="medium"
              pattern="waves"
              interactive={true}
              className="group"
            >
              <div className="flex items-center">
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
            </GlassmorphismContainer>

            <GlassmorphismContainer
              variant="medium"
              colorScheme="primary"
              size="lg"
              rounded="3xl"
              glow="medium"
              pattern="waves"
              interactive={true}
              className="group"
            >
              <div className="flex items-center">
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
            </GlassmorphismContainer>
          </div>

          {/* Glassmorphism Export and Social Media Tools */}
          <GlassmorphismContainer
            variant="intense"
            colorScheme="cosmic"
            size="lg"
            rounded="3xl"
            glow="intense"
            pattern="particles"
            className="border-zinc-700/20"
          >
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
                    <PokemonButton
                      onClick={handleGenerateFacebookPost}
                      disabled={loading}
                      className="w-full flex items-center justify-center"
                      variant="outline"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Generate Post
                    </PokemonButton>
                    {facebookPostModal.isOpen && generatedFacebookPost && (
                      <PokemonButton
                        onClick={handleCopyToClipboard}
                        className="w-full flex items-center justify-center"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </PokemonButton>
                    )}
                  </div>
                </div>

                {/* Text File Export */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--theme-status-success)] tracking-wide uppercase">
                    Text File Export
                  </h4>
                  <PokemonButton
                    onClick={handleDownloadTextFile}
                    disabled={loading}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Text File
                  </PokemonButton>
                </div>

                {/* Images Zip Export */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-amber-600 tracking-wide uppercase">
                    Image Export
                  </h4>
                  <PokemonButton
                    onClick={handleDownloadImagesZip}
                    disabled={loading}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Images Zip
                  </PokemonButton>
                </div>
              </div>

              {/* Generated Facebook Post Display */}
              {facebookPostModal.isOpen && generatedFacebookPost && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      Generated Facebook Post
                    </h4>
                    <PokemonButton
                      onClick={facebookPostModal.closeModal}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </PokemonButton>
                  </div>
                  <div className="bg-[var(--theme-surface-secondary)] backdrop-blur-sm rounded-2xl p-6 border border-[var(--theme-border)]">
                    <textarea
                      className="w-full h-32 p-4 border-0 bg-transparent resize-none focus:outline-none text-sm font-medium text-[var(--theme-text-secondary)]"
                      value={generatedFacebookPost}
                      readOnly
                    />
                    <div className="flex justify-end mt-3">
                      <PokemonButton
                        onClick={handleCopyToClipboard}
                        size="sm"
                        className="flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </PokemonButton>
                    </div>
                  </div>
                </div>
              )}
          </GlassmorphismContainer>

          {/* Context7 Premium Auction Items */}
          <AuctionItemsSection
            items={currentAuction.items}
            onAddItems={addItemModal.openModal}
          >
            <div className="p-8 space-y-6">
              {currentAuction.items.map((item: any, index: number) => (
                <AuctionItemCard
                  key={`${item.itemId || item.itemData?._id}-${index}`}
                  item={item}
                  isItemSold={isItemSold}
                  onMarkSold={handleMarkSold}
                  onRemoveItem={handleRemoveItem}
                  disabled={loading || collectionLoading}
                />
              ))}
            </div>
          </AuctionItemsSection>

          {/* Glassmorphism Auction Metadata */}
          <GlassmorphismContainer
            variant="intense"
            colorScheme="cosmic"
            size="lg"
            rounded="3xl"
            glow="medium"
            pattern="grid"
          >
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
                    <GlassmorphismContainer
                      variant="medium"
                      colorScheme="secondary"
                      size="sm"
                      rounded="2xl"
                      glow="subtle"
                      className="border-[var(--theme-border)]"
                    >
                      <p className="whitespace-pre-wrap text-sm font-medium text-[var(--theme-text-primary)]">
                        {currentAuction.generatedFacebookPost}
                      </p>
                    </GlassmorphismContainer>
                  </dd>
                </div>
              )}
            </dl>
          </GlassmorphismContainer>

          {/* Add Item to Auction Modal */}
          <AddItemToAuctionModal
            isOpen={addItemModal.isOpen}
            onClose={addItemModal.closeModal}
            onAddItems={handleAddItems}
            currentAuctionItems={
              currentAuction?.items?.map((item) => ({
                itemId: item.itemId,
                itemCategory: item.itemCategory,
              })) || []
            }
          />

          {/* Mark as Sold Modal */}
          <PokemonModal
            isOpen={markSoldModal.isOpen}
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
          </PokemonModal>

          {/* Delete Auction Confirmation Modal */}
          <PokemonConfirmModal
            isOpen={deleteConfirmModal.isOpen}
            onClose={deleteConfirmModal.closeModal}
            onConfirm={confirmDeleteAuction}
            title="Delete Auction"
            confirmMessage={`Are you sure you want to delete the auction "${currentAuction?.topText || 'Untitled Auction'}"? This action cannot be undone and will permanently remove the auction and all its associated data.`}
            confirmText="Delete Auction"
            variant="danger"
            loading={deleteConfirmModal.isConfirming}
          />

          {/* Remove Item Confirmation Modal */}
          <PokemonConfirmModal
            isOpen={removeItemConfirmModal.isOpen}
            onClose={removeItemConfirmModal.closeModal}
            onConfirm={confirmRemoveItem}
            title="Remove Item from Auction"
            confirmMessage={`Are you sure you want to remove "${itemToRemove?.name || 'this item'}" from the auction? This will not delete the item from your collection, only remove it from this auction.`}
            confirmText="Remove Item"
            variant="warning"
            loading={removeItemConfirmModal.isConfirming}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default AuctionDetail;
