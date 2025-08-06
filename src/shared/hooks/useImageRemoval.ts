/**
 * Image Removal Hook - Following SOLID principles
 * Single Responsibility: Only handles image removal logic and confirmation
 * Open/Closed: Extensible for different removal handlers
 * Dependency Inversion: Uses callback abstractions
 */

import { useCallback, useState } from 'react';
import { ImagePreview } from '../utils/imageUtils';

export const useImageRemoval = (
  previews: ImagePreview[],
  onPreviewsUpdate: (previews: ImagePreview[]) => void
) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<ImagePreview | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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
