/**
 * Custom Hooks
 *
 * Exports all custom hooks for consistent usage patterns
 */

// Modal management hooks
export { useModal, useConfirmModal, useMultiModal } from './useModal';

export type {
  UseModalReturn,
  UseConfirmModalReturn,
  UseMultiModalReturn,
} from './useModal';

// Item action hooks
export {
  useItemActions,
  usePsaItemActions,
  useRawItemActions,
  useSealedItemActions,
} from './useItemActions';

export type {
  UseItemActionsOptions,
  UseItemActionsReturn,
} from './useItemActions';

// Item display data hooks
export {
  useItemDisplayData,
  useAuctionItemDisplayData,
  useCollectionItemDisplayData,
  useMultipleItemDisplayData,
} from './useItemDisplayData';

export type {
  UseItemDisplayDataReturn,
  UseItemDisplayDataOptions,
} from './useItemDisplayData';
