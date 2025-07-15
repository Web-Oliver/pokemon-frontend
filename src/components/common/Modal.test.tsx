/**
 * Modal Component Tests
 * Following CLAUDE.md testing principles
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    // Clean up body styles after each test
    document.body.style.overflow = 'unset';
  });

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should render with title when provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title='Test Modal'>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should render without title when not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
      // Should not render close button when no title
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when backdrop is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      const backdrop = document.querySelector('.bg-gray-500');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title='Test Modal'>
          <div>Modal content</div>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when escape key is pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose for other keys', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: ' ' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Overflow Management', () => {
    it('should set body overflow to hidden when modal is open', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should reset body overflow when modal is closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Max Width Variants', () => {
    it('should apply correct max-width class for sm', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} maxWidth='sm'>
          <div>Modal content</div>
        </Modal>
      );

      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });

    it('should apply correct max-width class for lg', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} maxWidth='lg'>
          <div>Modal content</div>
        </Modal>
      );

      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('should apply default max-width class for md', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });
  });
});
