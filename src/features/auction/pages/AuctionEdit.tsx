/**
 * Auction Edit Page
 * Edit auction details, manage items, and update auction settings
 * Following CLAUDE.md Layer 4 (Views/Pages) principles
 * Updated to use consistent PageLayout component
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Check, Edit3, Package, Trash2 } from 'lucide-react';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import AuctionItemsSection from '../components/auction/sections/AuctionItemsSection';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { PokemonConfirmModal } from '../../../shared/components/atoms/design-system/PokemonModal';
import { GlassmorphismContainer } from '../../../shared/components/organisms/effects/GlassmorphismContainer';
import CollectionItemCard, {
  CollectionItem,
} from '../../../components/lists/CollectionItemCard';
import AddItemToAuctionModal from '../../../components/modals/AddItemToAuctionModal';
import { useAuction } from '../../../shared/hooks/useAuction';
import { useGenericFormState } from '../../../shared/hooks/form/useGenericFormState';
import { showSuccessToast } from '../../../shared/components/organisms/ui/toastNotifications';
import { navigationHelper } from '../../../shared/utils/navigation';

interface AuctionEditProps {
  auctionId?: string;
}

const AuctionEdit: React.FC<AuctionEditProps> = ({ auctionId }) => {
  // Memoize auction ID to prevent infinite loops
  const resolvedAuctionId = useMemo(() => {
    return auctionId || navigationHelper.getAuctionIdFromUrl();
  }, [auctionId]);

  const {
    currentAuction,
    loading,
    error,
    fetchAuctionById,
    updateAuction,
    addItemToAuction,
    removeItemFromAuction,
    clearError,
    clearCurrentAuction,
  } = useAuction(undefined, resolvedAuctionId || undefined);

  // Get auction ID from URL if not provided as prop
  const [currentAuctionId, setCurrentAuctionId] = useState<string>('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRemoveItemConfirmation, setShowRemoveItemConfirmation] =
    useState(false);
  const [removingItem, setRemovingItem] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  // Form state for editing auction details using consolidated hook
  const formState = useGenericFormState({
    initialData: {
      topText: '',
      bottomText: '',
      auctionDate: '',
      status: 'draft' as 'draft' | 'active' | 'sold' | 'expired',
    },
    validateField: (fieldName, value) => {
      if (fieldName === 'topText' && !value?.trim()) {
        return 'Auction title is required';
      }
      if (
        fieldName === 'auctionDate' &&
        value &&
        new Date(value) < new Date()
      ) {
        return 'Auction date cannot be in the past';
      }
      return null;
    },
  });

  useEffect(() => {
    // Set current auction ID for internal state tracking
    if (resolvedAuctionId && resolvedAuctionId !== 'auctions') {
      setCurrentAuctionId(resolvedAuctionId);
    }
  }, [resolvedAuctionId]);

  // Separate cleanup effect that doesn't depend on clearCurrentAuction
  useEffect(() => {
    return () => {
      clearCurrentAuction();
    };
  }, []);

  // Update form data when auction is loaded
  useEffect(() => {
    if (currentAuction) {
      const auctionData = {
        topText: currentAuction.topText || '',
        bottomText: currentAuction.bottomText || '',
        auctionDate: currentAuction.auctionDate
          ? currentAuction.auctionDate.split('T')[0]
          : '',
        status:
          currentAuction.status ||
          ('draft' as 'draft' | 'active' | 'sold' | 'expired'),
      };
      formState.resetToData(auctionData);
    }
  }, [currentAuction, formState]);

  // Navigation using navigationHelper
  const navigateToAuctionDetail = () => {
    if (currentAuctionId) {
      navigationHelper.navigateToAuctionDetail(currentAuctionId);
    }
  };

  const navigateToAuctions = () => {
    navigationHelper.navigateToAuctions();
  };

  const handleCancelEdit = () => {
    navigateToAuctionDetail();
  };

  // Handle form input changes using consolidated form state
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    formState.updateField(name as keyof typeof formState.data, value);
  };

  // Handle save auction changes using consolidated form state
  const handleSaveChanges = async () => {
    if (!currentAuctionId) {
      return;
    }

    // Validate form before submission
    if (!formState.validateForm()) {
      return;
    }

    try {
      formState.setLoading(true);
      setIsEditing(true);
      await updateAuction(currentAuctionId, {
        topText: formState.data.topText,
        bottomText: formState.data.bottomText,
        auctionDate: new Date(formState.data.auctionDate).toISOString(),
        status: formState.data.status,
      });
      showSuccessToast('Auction updated successfully!');
    } catch (_error) {
      // Error handled by hook
    } finally {
      formState.setLoading(false);
      setIsEditing(false);
    }
  };

  // Handle add items to auction
  const handleAddItems = async (
    items: { itemId: string; itemCategory: string }[]
  ) => {
    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      try {
        await addItemToAuction(currentAuctionId, item);
        addedCount++;
      } catch (err: any) {
        if (err?.message === 'DUPLICATE_ITEM') {
          duplicateCount++;
          // Continue with next item, don't show error for duplicates
        } else {
          // Re-throw other errors to be handled by error boundary
          throw err;
        }
      }
    }

    // Show appropriate success message
    if (addedCount > 0 && duplicateCount > 0) {
      showSuccessToast(`Added ${addedCount} item(s) to auction. ${duplicateCount} item(s) were already in the auction.`);
    } else if (addedCount > 0) {
      showSuccessToast(`Added ${addedCount} item(s) to auction`);
    } else if (duplicateCount > 0) {
      showSuccessToast(`${duplicateCount} item(s) were already in the auction`);
    }
  };

  // Handle remove item from auction - show confirmation modal
  const handleRemoveItem = (
    itemId: string,
    itemName: string,
    itemCategory: string
  ) => {
    setItemToRemove({ id: itemId, name: itemName, category: itemCategory });
    setShowRemoveItemConfirmation(true);
  };

  // Confirm remove item from auction
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
    } catch {
      // Error handled by the hook
    } finally {
      setRemovingItem(false);
    }
  };

  const handleCancelRemoveItem = () => {
    setShowRemoveItemConfirmation(false);
    setItemToRemove(null);
  };

  // Convert auction item to CollectionItem format
  const convertAuctionItemToCollectionItem = (
    auctionItem: any
  ): CollectionItem => {
    const { itemData, itemCategory } = auctionItem;

    // Handle the case where itemData might be the actual item data
    const actualItemData = itemData || auctionItem;

    // Create a normalized item that matches CollectionItem interface
    const normalizedItem: CollectionItem = {
      _id: auctionItem.itemId || actualItemData?._id || actualItemData?.id,
      id: auctionItem.itemId || actualItemData?._id || actualItemData?.id,
      images: actualItemData?.images || [],
      myPrice: actualItemData?.myPrice || 0,
      sold: auctionItem.sold || actualItemData?.sold || false,
      dateAdded: actualItemData?.dateAdded,
      priceHistory: actualItemData?.priceHistory || [],
      saleDetails: auctionItem.saleDetails || actualItemData?.saleDetails,
    };

    // Add category-specific fields
    if (itemCategory === 'PsaGradedCard') {
      (normalizedItem as any).grade = actualItemData?.grade;
      (normalizedItem as any).cardId = actualItemData?.cardId;
      (normalizedItem as any).cardName =
        actualItemData?.cardId?.cardName || actualItemData?.cardName;
      // Ensure setName is available from cardId->setId->setName path
      if (actualItemData?.cardId?.setId) {
        (normalizedItem as any).setName = actualItemData.cardId.setId.setName;
      }
    } else if (itemCategory === 'RawCard') {
      (normalizedItem as any).condition = actualItemData?.condition;
      (normalizedItem as any).cardId = actualItemData?.cardId;
      (normalizedItem as any).cardName =
        actualItemData?.cardId?.cardName || actualItemData?.cardName;
      // Ensure setName is available from cardId->setId->setName path
      if (actualItemData?.cardId?.setId) {
        (normalizedItem as any).setName = actualItemData.cardId.setId.setName;
      }
    } else if (itemCategory === 'SealedProduct') {
      (normalizedItem as any).name = actualItemData?.name;
      (normalizedItem as any).category = actualItemData?.category;
      (normalizedItem as any).setName = actualItemData?.setName;
      (normalizedItem as any).productId = actualItemData?.productId;
    }

    return normalizedItem;
  };

  // Get item type from auction item category
  const getItemTypeFromCategory = (
    category: string
  ): 'psa' | 'raw' | 'sealed' => {
    switch (category) {
      case 'PsaGradedCard':
        return 'psa';
      case 'RawCard':
        return 'raw';
      case 'SealedProduct':
        return 'sealed';
      default:
        return 'sealed';
    }
  };

  // Handle viewing item details (navigate to collection detail)
  const handleViewItemDetail = (
    item: CollectionItem,
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    navigationHelper.navigateToItemDetail(type, item.id);
  };

  // Handle mark item as sold (show remove from auction option)
  const handleMarkAsSold = (
    item: CollectionItem,
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    // For auction edit, we'll provide an option to remove from auction instead
    const itemName =
      (item as any).cardName || (item as any).name || 'Unknown Item';
    const itemCategory =
      type === 'psa'
        ? 'PsaGradedCard'
        : type === 'raw'
          ? 'RawCard'
          : 'SealedProduct';
    handleRemoveItem(item.id, itemName, itemCategory);
  };

  const pageTitle = currentAuction?.topText || 'Edit Auction';
  const pageSubtitle =
    currentAuction?.bottomText ||
    'Modify your auction details and manage items';

  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleSaveChanges}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Save Changes
      </button>
      <button
        onClick={handleCancelEdit}
        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Cancel
      </button>
    </div>
  );

  // Handle not found auction
  if (!loading && !currentAuction && currentAuctionId) {
    return (
      <PageLayout
        title="Auction Not Found"
        subtitle="The auction you're trying to edit doesn't exist or has been deleted"
        loading={false}
        error={null}
        actions={
          <button
            onClick={navigateToAuctions}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
          >
            Back to Auctions
          </button>
        }
        variant="default"
      >
        <GlassmorphismContainer
          variant="intense"
          colorScheme="danger"
          size="xl"
          rounded="3xl"
          glow="medium"
          pattern="dots"
        >
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-text-secondary)] to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-[var(--theme-text-muted)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
              Auction not found
            </h3>
            <p className="text-[var(--theme-text-muted)] font-medium max-w-md mx-auto leading-relaxed">
              The auction you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </GlassmorphismContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
      {/* Glassmorphism Auction Details Form */}
      <GlassmorphismContainer
        variant="intense"
        colorScheme="neural"
        size="lg"
        rounded="3xl"
        glow="medium"
        pattern="neural"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
            Auction Details
          </h2>
          <Edit3 className="w-6 h-6 text-[var(--theme-accent-secondary)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Text */}
          <div className="space-y-2">
            <label
              htmlFor="topText"
              className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
            >
              Auction Title
            </label>
            <input
              type="text"
              id="topText"
              name="topText"
              value={formState.data.topText}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
              placeholder="Enter auction title..."
            />
          </div>

          {/* Auction Date */}
          <div className="space-y-2">
            <label
              htmlFor="auctionDate"
              className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
            >
              Auction Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="auctionDate"
                name="auctionDate"
                value={formState.data.auctionDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formState.data.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Bottom Text - Full Width */}
          <div className="md:col-span-2 space-y-2">
            <label
              htmlFor="bottomText"
              className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
            >
              Description
            </label>
            <textarea
              id="bottomText"
              name="bottomText"
              value={formState.data.bottomText}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Enter auction description..."
            />
          </div>
        </div>
      </GlassmorphismContainer>

      {/* Context7 Premium Auction Items Management */}
      {currentAuction && (
        <AuctionItemsSection
          items={currentAuction.items}
          onAddItems={() => setIsAddItemModalOpen(true)}
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAuction.items.map((auctionItem: any, index: number) => {
              const collectionItem =
                convertAuctionItemToCollectionItem(auctionItem);
              const itemType = getItemTypeFromCategory(
                auctionItem.itemCategory
              );

              return (
                <div
                  key={`${auctionItem.itemId || auctionItem.itemData?._id}-${index}`}
                  className="relative"
                >
                  <CollectionItemCard
                    item={collectionItem}
                    itemType={itemType}
                    activeTab="psa-graded" // Not really used in this context
                    showMarkAsSoldButton={false} // Hide mark as sold, show remove instead
                    onViewDetails={handleViewItemDetail}
                    onMarkAsSold={handleMarkAsSold}
                  />

                  {/* Remove from Auction Button - Overlay */}
                  <div className="absolute top-2 right-2 z-20">
                    <PokemonButton
                      onClick={() => {
                        const itemName =
                          auctionItem.itemData?.cardId?.cardName ||
                          auctionItem.itemData?.cardName ||
                          auctionItem.itemData?.name ||
                          'Unknown Item';
                        handleRemoveItem(
                          auctionItem.itemId || auctionItem.itemData?._id,
                          itemName,
                          auctionItem.itemCategory
                        );
                      }}
                      variant="outline"
                      size="sm"
                      className="text-[var(--theme-status-error)] hover:text-[var(--theme-status-error)]/80 border-[var(--theme-status-error)]/40 hover:border-[var(--theme-status-error)]/60 bg-[var(--theme-surface)] backdrop-blur-sm shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </PokemonButton>
                  </div>

                  {/* Auction Specific Badge */}
                  {auctionItem.sold && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[var(--theme-status-success)]/30 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/40 backdrop-blur-sm shadow-lg">
                        <Check className="w-3 h-3 mr-1" />
                        Sold in Auction
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AuctionItemsSection>
      )}

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

      {/* Remove Item Confirmation Modal */}
      <PokemonConfirmModal
        isOpen={showRemoveItemConfirmation}
        onClose={handleCancelRemoveItem}
        onConfirm={confirmRemoveItem}
        title="Remove Item from Auction"
        confirmMessage={`Are you sure you want to remove "${itemToRemove?.name || 'this item'}" from the auction? This will not delete the item from your collection, only remove it from this auction.`}
        confirmText="Remove Item"
        variant="warning"
        loading={removingItem}
      />
    </PageLayout>
  );
};

export default AuctionEdit;
