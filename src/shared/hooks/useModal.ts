/**
 * Modal Management Hook
 * 
 * Abstracts common modal state management patterns used across AuctionDetail and CollectionItemDetail
 * Following CLAUDE.md principles: DRY, Single Responsibility, reusable logic extraction
 */

import { useState, useCallback } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export interface UseConfirmModalReturn extends UseModalReturn {
  confirmAction: (callback: () => void | Promise<void>) => void;
  isConfirming: boolean;
}

/**
 * Basic modal state management
 */
export const useModal = (initialOpen = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

/**
 * Confirmation modal with action handling
 */
export const useConfirmModal = (initialOpen = false): UseConfirmModalReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
    setIsConfirming(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const confirmAction = useCallback(async (callback: () => void | Promise<void>) => {
    if (isConfirming) return;

    setIsConfirming(true);
    try {
      await callback();
      closeModal();
    } catch (error) {
      console.error('Confirm action failed:', error);
      // Keep modal open on error so user can retry
    } finally {
      setIsConfirming(false);
    }
  }, [isConfirming, closeModal]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    confirmAction,
    isConfirming,
  };
};

/**
 * Multi-modal state management for components with multiple modals
 */
export interface UseMultiModalReturn {
  modals: Record<string, boolean>;
  openModal: (modalKey: string) => void;
  closeModal: (modalKey: string) => void;
  toggleModal: (modalKey: string) => void;
  closeAllModals: () => void;
  isAnyModalOpen: boolean;
}

export const useMultiModal = (modalKeys: string[]): UseMultiModalReturn => {
  const initialState = modalKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as Record<string, boolean>);

  const [modals, setModals] = useState(initialState);

  const openModal = useCallback((modalKey: string) => {
    setModals(prev => ({ ...prev, [modalKey]: true }));
  }, []);

  const closeModal = useCallback((modalKey: string) => {
    setModals(prev => ({ ...prev, [modalKey]: false }));
  }, []);

  const toggleModal = useCallback((modalKey: string) => {
    setModals(prev => ({ ...prev, [modalKey]: !prev[modalKey] }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(initialState);
  }, [initialState]);

  const isAnyModalOpen = Object.values(modals).some(isOpen => isOpen);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isAnyModalOpen,
  };
};