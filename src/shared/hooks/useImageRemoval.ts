/**
 * Image Removal Hook - Following SOLID principles
 * Single Responsibility: Only handles image removal logic and confirmation
 * Open/Closed: Extensible for different removal handlers
 * Dependency Inversion: Uses callback abstractions
 */

import { useCallback, useState } from 'react';
import { ImagePreview } from '@/shared/utils/ui/imageUtils';
import { useApiErrorHandler } from './error/useErrorHandler';

export const useImageRemoval = (
  previews: ImagePreview[],
  onPreviewsUpdate: (previews: ImagePreview[]) => void
) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<ImagePreview | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const errorHandler = useApiErrorHandler('IMAGE_REMOVAL');

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      const imagePreview = previews.find((p) => p.id === imageId);
      if (imagePreview) {
        setImageToRemove(imagePreview);
        setShowRemoveConfirm(true);
      }
    },
    [previews]
  );

  const confirmRemoveImage = useCallback(async () => {
    if (!imageToRemove) return;

    setIsRemoving(true);

    try {
      // For existing images, send DELETE request to backend
      if (imageToRemove.isExisting) {
        try {
          // Extract filename from URL (e.g., "/uploads/collection/filename.jpg" -> "filename.jpg")
          const urlParts = imageToRemove.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          
          console.log(`[useImageRemoval] Deleting existing image: ${filename}`);
          
          const response = await fetch(`/api/images/delete/${filename}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to delete image from server: ${response.status} ${errorData}`);
          }

          console.log(`[useImageRemoval] Successfully deleted image from server: ${filename}`);
        } catch (error) {
          errorHandler.handleError(error, { context: 'IMAGE_DELETION', showToast: true });
          // Don't throw - continue with UI removal even if server deletion fails
        }
      }

      // Clean up object URL if it's a new image
      if (!imageToRemove.isExisting && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      // Remove from previews
      const updatedPreviews = previews.filter((p) => p.id !== imageToRemove.id);
      onPreviewsUpdate(updatedPreviews);

      setShowRemoveConfirm(false);
      setImageToRemove(null);
    } finally {
      setIsRemoving(false);
    }
  }, [imageToRemove, previews, onPreviewsUpdate]);

  const handleCancelRemoveImage = useCallback(() => {
    setShowRemoveConfirm(false);
    setImageToRemove(null);
  }, []);

  return {
    showRemoveConfirm,
    imageToRemove,
    isRemoving,
    handleRemoveImage,
    confirmRemoveImage,
    handleCancelRemoveImage,
  };
};
