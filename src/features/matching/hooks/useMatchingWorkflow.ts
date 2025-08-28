import { useState, useCallback, useEffect } from 'react';
import { useOcrMatching } from '../../ocr-matching/hooks/useOcrMatching';
import { toast } from 'react-hot-toast';

/**
 * Matching Workflow Hook
 * 
 * Manages state and operations for the card matching workflow,
 * building on the existing OCR matching functionality.
 */
export const useMatchingWorkflow = () => {
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [matchResults, setMatchResults] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Use existing OCR matching functionality
  const {
    scansQuery,
    matchCardsMutation,
    createPsaMutation,
    getScanDetails,
  } = useOcrMatching();

  // Load ONLY matched scans ready for PSA creation (after completing OCR workflow)
  const { 
    data: scansResponse, 
    isLoading, 
    error: queryError,
    refetch: refetchScans
  } = scansQuery({ 
    // Get ONLY 'matched' scans that are ready for PSA card creation
    status: 'matched',
    limit: 100 
  });

  // Extract scans array from response
  const scansReadyForMatching = scansResponse?.scans || [];

  // Debug logging
  console.log('🔍 MATCHING WORKFLOW DEBUG:', {
    scansResponse,
    scansReadyForMatching,
    isLoading,
    error: queryError,
    length: scansReadyForMatching?.length,
    firstScan: scansReadyForMatching[0]
  });

  const error = queryError ? String(queryError) : null;

  /**
   * Perform card matching for selected scans
   */
  const performMatching = useCallback(async (imageHashes: string[]) => {
    if (!imageHashes || imageHashes.length === 0) {
      toast.error('No scans selected for matching');
      return;
    }

    setIsMatching(true);
    try {
      const result = await matchCardsMutation.mutateAsync(imageHashes);
      setMatchResults(result);
      
      // Refresh scans to get updated statuses
      await refetchScans();
      
      toast.success(`Successfully matched ${result.matchingResults?.length || 0} cards`);
    } catch (error) {
      console.error('Matching failed:', error);
      toast.error('Card matching failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  }, [matchCardsMutation, refetchScans]);

  /**
   * Create PSA Graded Card from matched scan
   */
  const createPsaCard = useCallback(async (cardData: any) => {
    if (!selectedScan || !cardData) {
      toast.error('Invalid card data for PSA creation');
      return;
    }

    setIsCreating(true);
    try {
      const psaData = {
        imageHash: selectedScan.imageHash,
        cardId: cardData.cardId,
        grade: cardData.grade,
        certNumber: cardData.certNumber || '',
        myPrice: cardData.myPrice,
        dateAdded: new Date().toISOString(),
        images: selectedScan.fullImage ? [selectedScan.fullImage] : [],
        // Include OCR and matching data for reference
        ocrText: selectedScan.ocrText,
        extractedData: cardData.extractedData || {},
        matchConfidence: cardData.matchConfidence || 0
      };

      const result = await createPsaMutation.mutateAsync(psaData);
      
      // Refresh scans to reflect the new status
      await refetchScans();
      
      toast.success(`PSA Graded Card created successfully!`);
      
      // Clear selected scan after successful creation
      setSelectedScan(null);
      
      return result;
    } catch (error) {
      console.error('PSA card creation failed:', error);
      toast.error('Failed to create PSA graded card. Please try again.');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [selectedScan, createPsaMutation, refetchScans]);

  /**
   * Auto-select first scan if none selected and scans are available
   */
  useEffect(() => {
    if (scansReadyForMatching.length > 0 && !selectedScan) {
      setSelectedScan(scansReadyForMatching[0]);
    }
  }, [scansReadyForMatching, selectedScan]);

  return {
    // Data
    scansReadyForMatching,
    isLoading,
    error,
    
    // Selected scan management
    selectedScan,
    setSelectedScan,
    
    // Matching operations
    matchResults,
    isMatching,
    performMatching,
    
    // PSA card creation
    createPsaCard,
    isCreating,
    
    // Utilities
    refetchScans,
    getScanDetails
  };
};