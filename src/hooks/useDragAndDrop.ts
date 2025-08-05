/**
 * Drag and Drop Hook - Following SOLID principles
 * Single Responsibility: Only handles drag and drop state and events
 * Open/Closed: Extensible for different drop handlers
 * Dependency Inversion: Uses callback abstractions
 */

import { useCallback, useState } from 'react';

export const useDragAndDrop = (
  onDrop: (files: FileList) => void,
  disabled: boolean = false
) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files);
    }
  }, [onDrop, disabled]);

  return {
    dragActive,
    handleDrag,
    handleDragIn,
    handleDragOut,
    handleDrop,
  };
};