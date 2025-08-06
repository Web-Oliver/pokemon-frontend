/**
 * Modal Management Hook
 * 
 * Extracts common modal state management patterns from CreateAuction, AuctionEdit,
 * and other components to eliminate repeated modal handling code.
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Manages modal state and interactions
 * - DRY: Eliminates repeated modal state patterns across components  
 * - Open/Closed: Extensible for different modal types
 */

import { useCallback, useState } from 'react';

export interface ModalState<T = any> {
  isOpen: boolean;
  data?: T;
}

export interface ModalActions<T = any> {
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  data?: T;
}

export const useModalManager = <T = any>(initialState: boolean = false): ModalActions<T> => {
  const [modal, setModal] = useState<ModalState<T>>({
    isOpen: initialState,
    data: undefined,
  });

  const open = useCallback((data?: T) => {
    setModal({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setModal({ isOpen: false, data: undefined });
  }, []);

  const toggle = useCallback(() => {
    setModal((prev) => ({ 
      isOpen: !prev.isOpen, 
      data: prev.isOpen ? undefined : prev.data 
    }));
  }, []);

  return {
    open,
    close,
    toggle,
    isOpen: modal.isOpen,
    data: modal.data,
  };
};

// Specialized hook for confirmation modals
export interface ConfirmationModalData {
  id: string;
  name: string;
  category?: string;
  action?: string;
}

export const useConfirmationModal = () => {
  const modal = useModalManager<ConfirmationModalData>();
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(async (
    data: ConfirmationModalData,
    onConfirm: (data: ConfirmationModalData) => Promise<void>
  ) => {
    try {
      setLoading(true);
      await onConfirm(data);
      modal.close();
    } catch (error) {
      // Error handled by the calling component
      throw error;
    } finally {
      setLoading(false);
    }
  }, [modal]);

  return {
    ...modal,
    loading,
    confirm,
  };
};

// Specialized hook for add item modals
export const useAddItemModal = () => {
  const modal = useModalManager<{ currentItems?: any[] }>();

  const openWithItems = useCallback((currentItems: any[] = []) => {
    modal.open({ currentItems });
  }, [modal]);

  return {
    ...modal,
    openWithItems,
  };
};