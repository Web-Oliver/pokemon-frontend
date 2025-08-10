/**
 * Image Download Hook
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles image download operations
 * - DRY: Eliminates duplicated download logic
 * - Reusability: Can be used by other components needing image downloads
 */

import { useCallback } from 'react';
import { CollectionItem } from './useCollectionItem';

import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import { showSuccessToast } from '../../components/organisms/ui/toastNotifications';
import { log } from '../../../shared/utils/performance/logger';
import { navigationHelper } from '../../utils/navigation';
import { useDataFetch } from '../common/useDataFetch';

export interface UseImageDownloadReturn {
  downloadingZip: boolean;
  handleDownloadImages: () => Promise<void>;
}

/**
 * Custom hook for managing image download operations
 * Handles ZIP creation and download for different item types
 * REFACTORED: Uses useDataFetch to standardize async operation handling
 */
export const useImageDownload = (
  item: CollectionItem | null,
  getItemTitle?: () => string
): UseImageDownloadReturn => {
  // REFACTORED: Use useDataFetch to replace manual loading state management
  // Eliminates: const [downloadingZip, setDownloadingZip] = useState(false)
  const downloadFetch = useDataFetch<void>(undefined, {
    onSuccess: () => showSuccessToast('Images downloaded successfully!'),
    onError: (error) =>
      handleApiError(new Error(error), 'Failed to download images'),
  });

  // Get URL params for download operations
  const getUrlParams = useCallback(() => {
    return navigationHelper.getCollectionItemParams();
  }, []);

  // Generate filename for download
  const generateFileName = useCallback(
    (type: string, title: string): string => {
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-');

      switch (type) {
        case 'psa':
          return `psa-card-${sanitizedTitle}-${timestamp}.zip`;
        case 'raw':
          return `raw-card-${sanitizedTitle}-${timestamp}.zip`;
        case 'sealed':
          return `sealed-product-${sanitizedTitle}-${timestamp}.zip`;
        default:
          return `item-${sanitizedTitle}-${timestamp}.zip`;
      }
    },
    []
  );

  // REFACTORED: Download images as ZIP using standardized async operation handling
  const handleDownloadImages = useCallback(async () => {
    if (!item) {
      return;
    }

    const { type, id } = getUrlParams();
    if (!type || !id) {
      return;
    }

    await downloadFetch.execute(async (): Promise<void> => {
      const exportApi = getExportApiService();
      let zipBlob: Blob;

      // Get ZIP blob based on item type
      switch (type) {
        case 'psa':
          zipBlob = await exportApi.zipPsaCardImages([id]);
          break;
        case 'raw':
          zipBlob = await exportApi.zipRawCardImages([id]);
          break;
        case 'sealed':
          zipBlob = await exportApi.zipSealedProductImages([id]);
          break;
        default:
          throw new Error('Unknown item type');
      }

      // Generate filename
      const title = getItemTitle ? getItemTitle() : 'item';
      const filename = generateFileName(type, title);

      // Download the ZIP file
      exportApi.downloadBlob(zipBlob, filename);

      log('[ImageDownload] Images zip downloaded successfully', {
        itemId: id,
        type,
        filename,
      });
    });
  }, [item, getUrlParams, generateFileName, getItemTitle, downloadFetch]);

  return {
    // REFACTORED: Use standardized loading state from useDataFetch
    downloadingZip: downloadFetch.loading,
    handleDownloadImages,
  };
};
