import { useState, useCallback } from 'react';

export interface UseModalReturn<T = any> {
  isOpen: boolean;
  selectedItem: T | null;
  openModal: (item?: T) => void;
  closeModal: () => void;
  openCreateModal: () => void;
  openEditModal: (item: T) => void;
  openDetailModal: (item: T) => void;
}

export const useModal = <T = any>(): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = useCallback((item?: T) => {
    setSelectedItem(item || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedItem(null);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const openDetailModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    selectedItem,
    openModal,
    closeModal,
    openCreateModal,
    openEditModal,
    openDetailModal
  };
}; 