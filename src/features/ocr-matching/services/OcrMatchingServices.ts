// OCR Matching Services - Single Responsibility: API calls and data fetching
import { OcrApiResponse, PsaCardApprovalData, PsaLabelResult } from '../types/OcrMatchingTypes';

// Interface for dependency inversion
export interface IOcrMatchingService {
  processImage(imageFile: File): Promise<OcrApiResponse>;
  processImageUrl(imageUrl: string): Promise<OcrApiResponse>;
  processPsaLabels(imageFile: File): Promise<PsaLabelResult[]>;
  approvePsaCard(cardData: PsaCardApprovalData): Promise<{ success: boolean; card?: any; error?: string }>;
  deletePsaLabel(psaLabelId: string): Promise<{ success: boolean; error?: string }>;
}

// Concrete implementation
export class OcrMatchingService implements IOcrMatchingService {
  private readonly baseUrl = 'http://localhost:3000/api';

  async processImage(imageFile: File): Promise<OcrApiResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/ocr/process-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async processImageUrl(imageUrl: string): Promise<OcrApiResponse> {
    const response = await fetch(`${this.baseUrl}/ocr/process-image-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async processPsaLabels(imageFile: File): Promise<PsaLabelResult[]> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/ocr/process-psa-labels`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  async approvePsaCard(cardData: PsaCardApprovalData): Promise<{ success: boolean; card?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/approve-psa-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to approve PSA card' };
      }

      return { success: true, card: result.card };
    } catch (error) {
      console.error('Error approving PSA card:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deletePsaLabel(psaLabelId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/psa-label/${psaLabelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to delete PSA label' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting PSA label:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Factory function for dependency injection
export const createOcrMatchingService = (): IOcrMatchingService => {
  return new OcrMatchingService();
};

// Demo service for testing (implements same interface)
export class DemoOcrMatchingService implements IOcrMatchingService {
  async processImage(): Promise<OcrApiResponse> {
    // Return demo data
    return {
      text: 'Pikachu 025/102',
      extractedData: {
        pokemonName: 'Pikachu',
        cardNumber: '025/102'
      },
      matches: [],
      setRecommendations: [],
      confidence: 0.85
    };
  }

  async processImageUrl(): Promise<OcrApiResponse> {
    return this.processImage();
  }

  async processPsaLabels(): Promise<PsaLabelResult[]> {
    return [];
  }

  async approvePsaCard(): Promise<{ success: boolean; card?: any; error?: string }> {
    return { success: true };
  }

  async deletePsaLabel(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}