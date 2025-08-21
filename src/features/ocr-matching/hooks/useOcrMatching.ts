/**
 * OCR Matching Hook - API integration for OCR card matching
 * 
 * Handles API calls for OCR matching, search, and approval workflow
 */

import { useState, useCallback } from 'react';

// Comprehensive debugging utility for frontend
const debugLog = (context: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [OCR-FRONTEND-${context}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

interface UseOcrMatchingReturn {
  matchOcrText: (ocrText: string, options?: any) => Promise<any>;
  processAllPsaLabels: (options?: any) => Promise<any>;
  deletePsaLabel: (psaLabelId: string) => Promise<any>;
  searchSets: (query: string, options?: any) => Promise<any>;
  searchCards: (query: string, filters?: any) => Promise<any>;
  approveMatch: (approvalData: any) => Promise<any>;
  editExtractedData: (ocrText: string, corrections: any) => Promise<any>;
  getStats: () => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useOcrMatching = (): UseOcrMatchingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const startTime = Date.now();
    const fullUrl = `${baseUrl}/api/ocr${endpoint}`;
    
    debugLog('API_CALL_START', `Starting API call to ${endpoint}`, {
      url: fullUrl,
      method: options.method || 'GET',
      hasBody: !!options.body
    });
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const responseTime = Date.now() - startTime;
      debugLog('API_CALL_RESPONSE', `Received response from ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        responseTime,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      debugLog('API_CALL_SUCCESS', `API call successful for ${endpoint}`, {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        responseTime
      });
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const responseTime = Date.now() - startTime;
      
      debugLog('API_CALL_ERROR', `API call failed for ${endpoint}`, {
        error: errorMessage,
        responseTime
      });
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const matchOcrText = useCallback(async (ocrText: string, options: any = {}) => {
    return await apiCall('/match', {
      method: 'POST',
      body: JSON.stringify({
        ocrText,
        options: {
          limit: 10,
          ...options,
        },
      }),
    });
  }, [apiCall]);

  const processAllPsaLabels = useCallback(async (options: any = {}) => {
    const params = new URLSearchParams({
      limit: options.limit?.toString() || '50',
      offset: options.offset?.toString() || '0',
      forceReprocess: options.forceReprocess?.toString() || 'false',
    });

    return await apiCall(`/process-all-psa-labels?${params}`, {
      method: 'GET',
    });
  }, [apiCall]);

  const deletePsaLabel = useCallback(async (psaLabelId: string) => {
    return await apiCall(`/delete-psa-label/${psaLabelId}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const batchMatchOcrText = useCallback(async (ocrTexts: string[], options: any = {}) => {
    return await apiCall('/batch-match', {
      method: 'POST',
      body: JSON.stringify({
        ocrTexts,
        options,
      }),
    });
  }, [apiCall]);

  const searchSets = useCallback(async (query: string = '', options: any = {}) => {
    const params = new URLSearchParams({
      query,
      limit: options.limit?.toString() || '20',
    });

    return await apiCall(`/search/sets?${params}`, {
      method: 'GET',
    });
  }, [apiCall]);

  const searchCards = useCallback(async (query: string = '', filters: any = {}) => {
    const params = new URLSearchParams({
      query,
      limit: filters.limit?.toString() || '20',
    });

    if (filters.setId) params.append('setId', filters.setId);
    if (filters.setName) params.append('setName', filters.setName);

    return await apiCall(`/search/cards?${params}`, {
      method: 'GET',
    });
  }, [apiCall]);

  const approveMatch = useCallback(async (approvalData: {
    ocrText: string;
    selectedCard: any;
    extractedData: any;
    confidence: number;
    userCorrections?: any;
    grade?: string;
    myPrice?: number;
  }) => {
    return await apiCall('/approve', {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }, [apiCall]);

  const editExtractedData = useCallback(async (ocrText: string, corrections: {
    pokemonName?: string;
    cardNumber?: string;
  }) => {
    return await apiCall('/edit-extract', {
      method: 'POST',
      body: JSON.stringify({
        ocrText,
        corrections,
      }),
    });
  }, [apiCall]);

  const getStats = useCallback(async () => {
    return await apiCall('/stats', {
      method: 'GET',
    });
  }, [apiCall]);

  return {
    matchOcrText,
    processAllPsaLabels,
    deletePsaLabel,
    batchMatchOcrText,
    searchSets,
    searchCards,
    approveMatch,
    editExtractedData,
    getStats,
    loading,
    error,
  };
};