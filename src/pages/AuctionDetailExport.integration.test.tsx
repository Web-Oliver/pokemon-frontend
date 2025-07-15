/**
 * AuctionDetail Export Features Integration Tests
 * Phase 10.1 & 10.2 - Test suite for export functionality in AuctionDetail page
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import AuctionDetail from './AuctionDetail';
import { useAuction } from '../hooks/useAuction';

// Mock the useAuction hook
vi.mock('../hooks/useAuction');

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn()
};
Object.assign(navigator, {
  clipboard: mockClipboard
});

// Mock document.execCommand
global.document.execCommand = vi.fn();

// Mock alert
global.alert = vi.fn();

// Mock the collection modal
vi.mock('../components/modals/AddItemToAuctionModal', () => ({
  default: () => <div data-testid="add-item-modal">Add Item Modal</div>
}));

const mockAuction = {
  id: 'auction123',
  topText: 'Pokemon Card Auction',
  bottomText: 'Amazing collection of rare cards',
  auctionDate: '2024-12-25T10:00:00Z',
  status: 'active',
  generatedFacebookPost: 'Check out this auction!',
  isActive: true,
  items: [
    {
      itemId: 'item1',
      itemCategory: 'PsaGradedCard',
      itemName: 'Charizard PSA 10',
      sold: false,
      salePrice: 500,
      itemImage: 'charizard.jpg'
    },
    {
      itemId: 'item2',
      itemCategory: 'RawCard',
      itemName: 'Blastoise Raw',
      sold: true,
      salePrice: 200,
      itemImage: 'blastoise.jpg'
    }
  ],
  totalValue: 700,
  soldValue: 200,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z'
};

describe('AuctionDetail Export Features Integration Tests', () => {
  const mockGenerateFacebookPost = vi.fn();
  const mockDownloadAuctionTextFile = vi.fn();
  const mockDownloadAuctionImagesZip = vi.fn();
  const mockFetchAuctionById = vi.fn();
  const mockClearCurrentAuction = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL to simulate auction detail page
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/auctions/auction123'
      },
      writable: true
    });

    (useAuction as ReturnType<typeof vi.fn>).mockReturnValue({
      currentAuction: mockAuction,
      loading: false,
      error: null,
      fetchAuctionById: mockFetchAuctionById,
      generateFacebookPost: mockGenerateFacebookPost,
      downloadAuctionTextFile: mockDownloadAuctionTextFile,
      downloadAuctionImagesZip: mockDownloadAuctionImagesZip,
      clearCurrentAuction: mockClearCurrentAuction,
      clearError: mockClearError,
      deleteAuction: vi.fn(),
      addItemToAuction: vi.fn(),
      removeItemFromAuction: vi.fn()
    });
  });

  describe('Export Section Rendering', () => {
    test('should render export and social media tools section', () => {
      render(<AuctionDetail />);

      expect(screen.getByText('Export & Social Media Tools')).toBeInTheDocument();
      expect(screen.getByText('Facebook Post')).toBeInTheDocument();
      expect(screen.getByText('Text File Export')).toBeInTheDocument();
      expect(screen.getByText('Image Export')).toBeInTheDocument();
    });

    test('should render export buttons', () => {
      render(<AuctionDetail />);

      expect(screen.getByRole('button', { name: /Generate Post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download Text File/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download Images Zip/i })).toBeInTheDocument();
    });
  });

  describe('Facebook Post Generation', () => {
    test('should generate Facebook post when button clicked', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);

      render(<AuctionDetail />);

      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateFacebookPost).toHaveBeenCalledWith('auction123');
      });
    });

    test('should display generated Facebook post', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);

      render(<AuctionDetail />);

      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated Facebook Post')).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockPostText)).toBeInTheDocument();
      });
    });

    test('should show copy to clipboard button after generation', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);

      render(<AuctionDetail />);

      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy to Clipboard/i })).toBeInTheDocument();
      });
    });

    test('should copy to clipboard when copy button clicked', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);
      mockClipboard.writeText.mockResolvedValue(undefined);

      render(<AuctionDetail />);

      // Generate post first
      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy to Clipboard/i })).toBeInTheDocument();
      });

      // Click copy button
      const copyButton = screen.getByRole('button', { name: /Copy to Clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(mockPostText);
        expect(global.alert).toHaveBeenCalledWith('Facebook post copied to clipboard!');
      });
    });

    test('should handle clipboard API failure with fallback', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API not available'));
      (global.document.execCommand as ReturnType<typeof vi.fn>).mockReturnValue(true);

      // Mock createElement and body methods
      const mockTextArea = {
        value: '',
        select: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockTextArea as HTMLTextAreaElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      render(<AuctionDetail />);

      // Generate post first
      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy to Clipboard/i })).toBeInTheDocument();
      });

      // Click copy button
      const copyButton = screen.getByRole('button', { name: /Copy to Clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(global.document.execCommand).toHaveBeenCalledWith('copy');
        expect(global.alert).toHaveBeenCalledWith('Facebook post copied to clipboard!');
      });
    });

    test('should hide Facebook post when close button clicked', async () => {
      const mockPostText = 'Generated Facebook post content';
      mockGenerateFacebookPost.mockResolvedValue(mockPostText);

      render(<AuctionDetail />);

      // Generate post first
      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated Facebook Post')).toBeInTheDocument();
      });

      // Click close button in the post display
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(button => button.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Generated Facebook Post')).not.toBeInTheDocument();
      });
    });
  });

  describe('File Downloads', () => {
    test('should download text file when button clicked', async () => {
      mockDownloadAuctionTextFile.mockResolvedValue(undefined);

      render(<AuctionDetail />);

      const downloadButton = screen.getByRole('button', { name: /Download Text File/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockDownloadAuctionTextFile).toHaveBeenCalledWith('auction123');
      });
    });

    test('should download images zip when button clicked', async () => {
      mockDownloadAuctionImagesZip.mockResolvedValue(undefined);

      render(<AuctionDetail />);

      const zipButton = screen.getByRole('button', { name: /Download Images Zip/i });
      fireEvent.click(zipButton);

      await waitFor(() => {
        expect(mockDownloadAuctionImagesZip).toHaveBeenCalledWith('auction123');
      });
    });
  });

  describe('Loading States', () => {
    test('should disable buttons when loading', () => {
      (useAuction as ReturnType<typeof vi.fn>).mockReturnValue({
        currentAuction: mockAuction,
        loading: true,
        error: null,
        fetchAuctionById: mockFetchAuctionById,
        generateFacebookPost: mockGenerateFacebookPost,
        downloadAuctionTextFile: mockDownloadAuctionTextFile,
        downloadAuctionImagesZip: mockDownloadAuctionImagesZip,
        clearCurrentAuction: mockClearCurrentAuction,
        clearError: mockClearError,
        deleteAuction: vi.fn(),
        addItemToAuction: vi.fn(),
        removeItemFromAuction: vi.fn()
      });

      render(<AuctionDetail />);

      expect(screen.getByRole('button', { name: /Generate Post/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Download Text File/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Download Images Zip/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    test('should handle Facebook post generation error', async () => {
      mockGenerateFacebookPost.mockRejectedValue(new Error('Generation failed'));

      render(<AuctionDetail />);

      const generateButton = screen.getByRole('button', { name: /Generate Post/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateFacebookPost).toHaveBeenCalledWith('auction123');
        // Error handling is done by the hook, so we just verify the call was made
      });
    });

    test('should handle download errors', async () => {
      mockDownloadAuctionTextFile.mockRejectedValue(new Error('Download failed'));
      mockDownloadAuctionImagesZip.mockRejectedValue(new Error('Zip failed'));

      render(<AuctionDetail />);

      const textButton = screen.getByRole('button', { name: /Download Text File/i });
      const zipButton = screen.getByRole('button', { name: /Download Images Zip/i });

      fireEvent.click(textButton);
      fireEvent.click(zipButton);

      await waitFor(() => {
        expect(mockDownloadAuctionTextFile).toHaveBeenCalledWith('auction123');
        expect(mockDownloadAuctionImagesZip).toHaveBeenCalledWith('auction123');
        // Error handling is done by the hook
      });
    });
  });

  describe('Existing Facebook Post Display', () => {
    test('should display existing Facebook post if present', () => {
      render(<AuctionDetail />);

      // Check if the existing post is displayed in the auction metadata section
      expect(screen.getByText('Generated Facebook Post')).toBeInTheDocument();
      expect(screen.getByText('Check out this auction!')).toBeInTheDocument();
    });
  });
});