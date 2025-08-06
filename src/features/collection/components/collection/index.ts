/**
 * Collection Components
 * 
 * Exports all collection-related components
 */

// Detail section components (existing)
export { 
  ItemDetailSection,
  PsaCardDetailSection,
  RawCardDetailSection,
  SealedProductDetailSection
} from './ItemDetailSection';

export type { 
  ItemDetailSectionProps,
  DetailItem,
  PsaCardDetailProps,
  RawCardDetailProps,
  SealedProductDetailProps
} from './ItemDetailSection';

// New refactored components
export { CollectionItemHeader } from './CollectionItemHeader';
export { ItemEssentialDetails } from './ItemEssentialDetails';
export { ItemImageGallery } from './ItemImageGallery';
export { ItemPriceHistory } from './ItemPriceHistory';
export { ItemSaleDetails } from './ItemSaleDetails';

export type { 
  CollectionItemHeaderProps,
  ItemEssentialDetailsProps,
  ItemImageGalleryProps,
  ItemPriceHistoryProps,
  ItemSaleDetailsProps
} from './CollectionItemHeader';
export type { ItemEssentialDetailsProps } from './ItemEssentialDetails';
export type { ItemImageGalleryProps } from './ItemImageGallery';
export type { ItemPriceHistoryProps } from './ItemPriceHistory';
export type { ItemSaleDetailsProps } from './ItemSaleDetails';