/**
 * Auction Edit Page
 * Edit auction details, manage items, and update auction settings
 * Following CLAUDE.md Layer 4 (Views/Pages) principles
 */

import { Check, Trash2 } from 'lucide-react';
import AuctionEditLayout from '../components/auction/AuctionEditLayout';
import AuctionItemsSection from '../components/auction/sections/AuctionItemsSection';
import { PokemonButton } from '../components/design-system/PokemonButton';
import { PokemonConfirmModal } from '../components/design-system/PokemonModal';
import { PokemonCard } from '../components/design-system/PokemonCard';
import { CollectionItem } from '../components/lists/CollectionItemCard';
import AddItemToAuctionModal from '../components/modals/AddItemToAuctionModal';
import { useAuction } from '../hooks/useAuction';
import { useAuctionFormData } from '../hooks/useAuctionFormData';
import { usePageNavigation } from '../hooks/usePageNavigation';
import { useModalManager, useConfirmationModal } from '../hooks/useModalManager';
import { showSuccessToast } from '../ui/toastNotifications';

interface AuctionEditProps {
  auctionId?: string;
}

const AuctionEdit: React.FC<AuctionEditProps> = ({ auctionId }) => {
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
  } = useAuction();

  // Use shared auction form data hook for form management
  const { form, formErrors, updateFormValues } = useAuctionFormData();
  
  // Use shared navigation hook
  const {
    navigateToAuctionDetail,
    navigateToAuctions,
    extractAuctionIdFromUrl,
  } = usePageNavigation();
  
  // Use shared modal management hooks
  const addItemModal = useModalManager();
  const removeItemModal = useConfirmationModal();

  // Get auction ID from URL if not provided as prop
  const [currentAuctionId, setCurrentAuctionId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Extract auction ID from URL using shared navigation hook
    const urlAuctionId = auctionId || extractAuctionIdFromUrl();

    if (urlAuctionId && urlAuctionId !== 'auctions') {
      setCurrentAuctionId(urlAuctionId);
      fetchAuctionById(urlAuctionId);
    }

    return () => {
      clearCurrentAuction();
    };
  }, [auctionId, fetchAuctionById, clearCurrentAuction, extractAuctionIdFromUrl]);

  // Update form data when auction is loaded using shared hook
  useEffect(() => {
    if (currentAuction) {
      updateFormValues({
        topText: currentAuction.topText || '',
        bottomText: currentAuction.bottomText || '',
        auctionDate: currentAuction.auctionDate
          ? currentAuction.auctionDate.split('T')[0]
          : '',
        status: currentAuction.status || 'draft',
      });
    }
  }, [currentAuction, updateFormValues]);

  // Navigation handlers using shared navigation hook
  const handleBackToAuction = () => {
    navigateToAuctionDetail(currentAuctionId);
  };

  // Handle save auction changes using shared form data
  const handleSaveChanges = async () => {
    if (!currentAuctionId) {
      return;
    }

    const formData = form.getValues();
    try {
      setIsEditing(true);
      await updateAuction(currentAuctionId, {
        topText: formData.topText,
        bottomText: formData.bottomText,
        auctionDate: new Date(formData.auctionDate).toISOString(),
        status: formData.status,
      });
      showSuccessToast('Auction updated successfully!');
    } catch (_error) {
      // Error handled by hook
    } finally {
      setIsEditing(false);
    }
  };

  // Handle add items to auction
  const handleAddItems = async (
    items: { itemId: string; itemCategory: string }[]
  ) => {
    for (const item of items) {
      await addItemToAuction(currentAuctionId, item);
    }
    showSuccessToast(`Added ${items.length} item(s) to auction`);
  };

  // Handle remove item from auction using shared modal management
  const handleRemoveItem = (
    itemId: string,
    itemName: string,
    itemCategory: string
  ) => {
    removeItemModal.open({ id: itemId, name: itemName, category: itemCategory });
  };

  // Confirm remove item from auction
  const confirmRemoveItem = async () => {
    if (!removeItemModal.data) {
      return;
    }

    await removeItemModal.confirm(
      removeItemModal.data,
      async (data) => {
        await removeItemFromAuction(
          currentAuctionId,
          data.id,
          data.category || ''
        );
        showSuccessToast('Item removed from auction');
      }
    );
  };

  // Convert auction item to CollectionItem format
  const convertAuctionItemToCollectionItem = (
    auctionItem: any
  ): CollectionItem => {
    const { itemData, itemCategory } = auctionItem;

    // Create a normalized item that matches CollectionItem interface
    const normalizedItem: CollectionItem = {
      id: auctionItem.itemId || itemData?._id || itemData?.id,
      images: itemData?.images || [],
      myPrice: itemData?.myPrice || 0,
      sold: auctionItem.sold || itemData?.sold || false,
      dateAdded: itemData?.dateAdded,
      priceHistory: itemData?.priceHistory || [],
      saleDetails: auctionItem.saleDetails || itemData?.saleDetails,
    };

    // Add category-specific fields
    if (itemCategory === 'PsaGradedCard') {
      (normalizedItem as any).grade = itemData?.grade;
      (normalizedItem as any).cardId = itemData?.cardId;
      (normalizedItem as any).cardName =
        itemData?.cardId?.cardName || itemData?.cardName;
    } else if (itemCategory === 'RawCard') {
      (normalizedItem as any).condition = itemData?.condition;
      (normalizedItem as any).cardId = itemData?.cardId;
      (normalizedItem as any).cardName =
        itemData?.cardId?.cardName || itemData?.cardName;
    } else if (itemCategory === 'SealedProduct') {
      (normalizedItem as any).name = itemData?.name;
      (normalizedItem as any).category = itemData?.category;
      (normalizedItem as any).setName = itemData?.setName;
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


  return (
    <AuctionEditLayout
      currentAuction={currentAuction}
      loading={loading}
      error={error}
      isEditing={isEditing}
      form={form}
      onBackToAuction={handleBackToAuction}
      onSaveChanges={handleSaveChanges}
      onClearError={clearError}
      getStatusColor={getStatusColor}
    >
      {/* Context7 Premium Auction Items Management */}
      <AuctionItemsSection
        items={currentAuction?.items || []}
        onAddItems={() => addItemModal.open()}
      >
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentAuction?.items?.map(
            (auctionItem: any, index: number) => {
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
                  <PokemonCard
                    cardType="collection"
                    variant="glass"
                    size="md"
                    images={collectionItem.images || []}
                    title={collectionItem.cardName || collectionItem.name || 'Unknown Item'}
                    subtitle={collectionItem.setName || 'Unknown Set'}
                    price={collectionItem.myPrice}
                    grade={'grade' in collectionItem ? collectionItem.grade : undefined}
                    condition={'condition' in collectionItem ? collectionItem.condition : undefined}
                    category={itemType}
                    sold={collectionItem.sold}
                    saleDate={collectionItem.saleDetails?.dateSold}
                    showActions={true}
                    onViewDetails={() => handleViewItemDetail(collectionItem._id, itemType)}
                    interactive={true}
                  />

                  {/* Remove from Auction Button - Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                    <PokemonButton
                      onClick={() => {
                        const itemName =
                          auctionItem.itemData?.cardId?.cardName ||
                          auctionItem.itemData?.cardName ||
                          auctionItem.itemData?.name ||
                          'Unknown Item';
                        handleRemoveItem(
                          auctionItem.itemId ||
                            auctionItem.itemData?._id,
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
                    <div className="absolute top-4 left-4 z-20">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[var(--theme-status-success)]/30 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/40 backdrop-blur-sm shadow-lg">
                        <Check className="w-3 h-3 mr-1" />
                        Sold in Auction
                      </span>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </AuctionItemsSection>

      {/* Add Item to Auction Modal */}
      <AddItemToAuctionModal
        isOpen={addItemModal.isOpen}
        onClose={addItemModal.close}
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
        isOpen={removeItemModal.isOpen}
        onClose={removeItemModal.close}
        onConfirm={confirmRemoveItem}
        title="Remove Item from Auction"
        confirmMessage={`Are you sure you want to remove "${removeItemModal.data?.name || 'this item'}" from the auction? This will not delete the item from your collection, only remove it from this auction.`}
        confirmText="Remove Item"
        variant="warning"
        loading={removeItemModal.loading}
      />
    </AuctionEditLayout>
  );
};

export default AuctionEdit;
