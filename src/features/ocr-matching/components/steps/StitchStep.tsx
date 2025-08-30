/**
 * STITCH STEP - SOLID & DRY
 * Single Responsibility: Stitch together PSA label parts
 * DRY: Reusable stitching interface
 */

import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { StepComponentProps } from '@/types/OcrWorkflowTypes';
import { useOcrMatching } from '../../hooks/useOcrMatching';
import { handleError } from '@/shared/utils/helpers/errorHandler';

interface StitchData {
  stitchedLabels: Array<{
    id: string;
    originalFiles: string[];
    stitchedImage: string;
    confidence: number;
    parts: Array<{
      type: 'front' | 'back' | 'side';
      image: string;
      confidence: number;
    }>;
  }>;
  unmatched: Array<{
    originalFile: string;
    labelImage: string;
    reason: string;
  }>;
}

export const StitchStep: React.FC<StepComponentProps> = ({ 
  data, 
  onComplete, 
  onError, 
  isActive 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stitchedData, setStitchedData] = useState<StitchData | null>(null);
  const [selectedStitch, setSelectedStitch] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');

  // Get extracted labels from previous step and real API integration
  const extractData = data as { extractedLabels: Array<any> } | undefined;
  const { scansQuery, stitchMutation, deleteStitchedMutation } = useOcrMatching();
  
  // Import ImageUrlService for proper URL handling
  const [imageUrlService, setImageUrlService] = useState<any>(null);
  
  useEffect(() => {
    const loadImageUrlService = async () => {
      const { ImageUrlService } = await import('../../../../shared/services/ImageUrlService');
      setImageUrlService(new ImageUrlService());
    };
    loadImageUrlService();
  }, []);
  
  // Load scans with 'extracted' status (ready for stitching)
  const { data: extractedScans } = scansQuery({ status: 'extracted' });
  // Load already stitched images that can be re-stitched (not yet OCR analyzed)
  const { data: stitchedScans } = scansQuery({ status: 'stitched' });
  // Load scans that are fully OCR completed (should not be re-stitched)
  const { data: ocrCompletedScans } = scansQuery({ status: 'ocr_completed' });
  
  // Load existing stitched images from the API
  const [existingStitched, setExistingStitched] = useState<any[]>([]);
  
  // Load existing stitched images on component mount
  useEffect(() => {
    const loadExistingStitched = async () => {
      try {
        // Call the repository method to get stitched images
        const apiRepository = new (await import('../../infrastructure/api/OcrApiRepository')).OcrApiRepository();
        const result = await apiRepository.getStitchedImages();
        console.log('🔍 Existing stitched images:', result);
        setExistingStitched(result.stitchedImages || []);
      } catch (error) {
        handleError(error, {
          component: 'StitchStep',
          action: 'loadExistingStitchedImages'
        });
      }
    };
    
    if (isActive) {
      loadExistingStitched();
    }
  }, [isActive]);

  // AUTO-START STITCHING - Single Responsibility
  useEffect(() => {
    if (isActive && extractData?.extractedLabels && !isProcessing && !stitchedData) {
      handleStitching();
    }
  }, [isActive, extractData]);

  // REAL API STITCHING PROCESS - Single Responsibility
  const handleStitching = useCallback(async () => {
    // Combine both extracted and stitched scans for re-stitching
    const availableScans = [
      ...(extractedScans?.scans || []),
      ...(stitchedScans?.scans || [])
    ];

    // PHASE 1 FIX: Log available scans structure for debugging
    console.log('🔍 DEBUG: Available scans structure:', JSON.stringify(availableScans, null, 2));
    console.log('🔍 DEBUG: Number of available scans:', availableScans.length);
    
    // Log individual scan properties to verify imageHash presence
    availableScans.forEach((scan, index) => {
      console.log(`🔍 DEBUG: Scan ${index}:`, {
        id: scan.id,
        originalFileName: scan.originalFileName,
        imageHash: scan.imageHash,
        processingStatus: scan.processingStatus,
        hasImageHash: !!scan.imageHash,
        imageHashType: typeof scan.imageHash
      });
    });

    if (availableScans.length === 0) {
      handleError(new Error('No scans available for stitching'), {
        component: 'StitchStep',
        action: 'validateScansAvailable'
      });
      onError('No scans available for stitching. Please go back to extraction step.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Delete ONLY stitched images that correspond to scans that are NOT OCR completed yet
      if (existingStitched.length > 0) {
        setProcessingStep('Removing old stitched images for re-stitchable scans...');
        setProgress(10);
        
        // Get the image hashes that we're about to re-stitch
        const restitchingHashes = availableScans.map(scan => scan.imageHash);
        
        // PHASE 1 FIX: Log restitching hashes for debugging
        console.log('🔍 DEBUG: Restitching hashes:', restitchingHashes);
        console.log('🔍 DEBUG: Restitching hashes count:', restitchingHashes.length);
        console.log('🔍 DEBUG: Existing stitched images:', existingStitched.length);
        
        // Only delete stitched images that contain labels from scans we're re-stitching
        const stitchedToDelete = existingStitched.filter(stitched => {
          // Check if this stitched image contains any of the hashes we're re-stitching
          return stitched.labelHashes && stitched.labelHashes.some(hash => 
            restitchingHashes.includes(hash)
          );
        });
        
        console.log('🔍 DEBUG: Stitched images to delete:', stitchedToDelete.length);
        
        for (const stitched of stitchedToDelete) {
          try {
            await deleteStitchedMutation.mutateAsync(stitched.id);
          } catch (error) {
            console.warn('Failed to delete stitched image:', stitched.id, error);
          }
        }
        
        // Update local state to remove only the deleted ones
        setExistingStitched(prev => prev.filter(stitched => !stitchedToDelete.includes(stitched)));
      }

      // PHASE 1 FIX: Validate imageHashes before API call
      const imageHashes = availableScans.map(scan => scan.imageHash);
      
      // DEBUG: Check what type imageHashes actually is
      console.log('🔍 DEBUG: imageHashes creation debug:', {
        availableScansLength: availableScans.length,
        imageHashesType: typeof imageHashes,
        imageHashesIsArray: Array.isArray(imageHashes),
        imageHashesLength: imageHashes?.length,
        firstScan: availableScans[0],
        firstScanImageHash: availableScans[0]?.imageHash,
        firstScanImageHashType: typeof availableScans[0]?.imageHash,
        rawImageHashes: imageHashes
      });
      
      // Validate that all imageHashes are valid strings
      const invalidHashes = imageHashes.filter(hash => !hash || typeof hash !== 'string' || hash.trim().length === 0);
      
      if (invalidHashes.length > 0 || imageHashes.length === 0) {
        handleError(new Error('Invalid or missing imageHashes detected'), {
          component: 'StitchStep',
          action: 'validateImageHashes',
          additionalInfo: {
            totalScans: availableScans.length,
            totalHashes: imageHashes.length,
            invalidHashes: invalidHashes,
            allHashes: imageHashes
          }
        });
        onError(`Invalid image hashes detected. Found ${invalidHashes.length} invalid hashes out of ${imageHashes.length} total.`);
        return;
      }
      
      // PHASE 1 FIX: Log exactly what imageHashes are being sent to API
      console.log('🚀 DEBUG: Sending imageHashes to stitch API:', {
        imageHashes: imageHashes,
        imageHashesType: typeof imageHashes,
        imageHashesIsArray: Array.isArray(imageHashes),
        count: imageHashes.length,
        hashSamples: imageHashes.slice(0, 3), // Show first 3 for debugging
        allValid: imageHashes.every(hash => hash && typeof hash === 'string' && hash.trim().length > 0)
      });
      
      setProcessingStep('Starting stitching process...');
      setProgress(20);

      // REAL API CALL - Call the stitching mutation
      const result = await stitchMutation.mutateAsync(imageHashes);
      
      setProgress(80);
      setProcessingStep('Processing stitching results...');

      // DEBUG: Log the actual API response
      console.log('🔍 Stitch API Response:', JSON.stringify(result, null, 2));

      // Handle duplicate detection and proper error messages
      if (result.isDuplicate) {
        console.log('⚠️ Duplicate stitched image detected');
        toast.warning('This combination has already been stitched. Using existing stitched image.');
      } else {
        toast.success('New stitched image created successfully!');
      }

      // Transform API response to component format
      const stitchedData: StitchData = {
        stitchedLabels: result ? [{
          id: result.stitchedImagePath || 'stitched_1',
          originalFiles: availableScans.map(scan => scan.originalFileName),
          stitchedImage: result.stitchedImageUrl || availableScans[0]?.labelImageUrl,
          confidence: 0.95, // From API if available
          parts: availableScans.map((scan, idx) => ({
            type: ['front', 'back', 'side'][idx % 3] as 'front' | 'back' | 'side',
            image: scan.labelImageUrl,
            confidence: 0.9
          }))
        }] : [],
        unmatched: [] // Empty since we processed all as one stitched image
      };

      // Reload existing stitched images to show the new/existing one
      const apiRepository = new (await import('../../infrastructure/api/OcrApiRepository')).OcrApiRepository();
      const updatedStitched = await apiRepository.getStitchedImages();
      setExistingStitched(updatedStitched.stitchedImages || []);

      setProgress(100);
      setStitchedData(stitchedData);

      if (stitchedData.stitchedLabels.length === 0) {
        onError('Stitching process completed but no stitched image was created.');
      } else {
        onComplete(stitchedData);
      }

    } catch (error) {
      handleError(error, {
        component: 'StitchStep',
        action: 'performStitching'
      });
      onError(error instanceof Error ? error.message : 'Stitching failed');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgress(0);
    }
  }, [extractedScans, stitchedScans, existingStitched, stitchMutation, deleteStitchedMutation, onComplete, onError]);

  // MANUAL STITCHING - DRY: Allow manual grouping
  const createManualStitch = useCallback((labelIds: string[]) => {
    // In real implementation, allow users to manually group labels
    console.log('Manual stitch requested for:', labelIds);
  }, []);

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🧩 Stitch Label Parts</h2>
        <p className="text-gray-400">Combine multiple views of the same PSA label</p>
      </div>

      {/* PROCESSING STATUS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* AWAITING STITCHING OR RE-STITCHING */}
        {(() => {
          const availableScans = [
            ...(extractedScans?.scans || []),
            ...(stitchedScans?.scans || [])
          ];
          const extractedCount = extractedScans?.scans?.length || 0;
          const stitchedCount = stitchedScans?.scans?.length || 0;
          
          return availableScans.length > 0 ? (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6 col-span-2">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">
                🔧 Ready for {stitchedCount > 0 ? 'Re-' : ''}Stitching ({availableScans.length} cards)
                {extractedCount > 0 && stitchedCount > 0 && (
                  <span className="text-sm text-blue-400 ml-2">
                    ({extractedCount} extracted + {stitchedCount} stitched)
                  </span>
                )}
              </h3>
            
            {/* DETAILED CARD DISPLAY */}
            <div className="space-y-4 mb-4 max-h-[800px] overflow-y-auto">
              {availableScans.map((scan) => (
                <div key={scan.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium truncate">{scan.originalFileName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      scan.processingStatus === 'extracted' 
                        ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                        : 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
                    }`}>
                      {scan.processingStatus === 'extracted' ? '✅ Extracted' : '🧩 Stitched'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* FULL ORIGINAL IMAGE */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Full Image</p>
                      <img 
                        src={imageUrlService ? imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.fullImageUrl} 
                        alt={`Full image: ${scan.originalFileName}`}
                        className="w-full h-48 object-cover rounded border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => setSelectedStitch(imageUrlService ? imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.fullImageUrl)}
                      />
                    </div>
                    
                    {/* EXTRACTED LABEL */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Extracted PSA Label</p>
                      {scan.labelImageUrl ? (
                        <img 
                          src={imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) : scan.labelImageUrl} 
                          alt={`PSA label: ${scan.originalFileName}`}
                          className="w-full h-48 object-cover rounded border-2 border-green-600 cursor-pointer hover:border-green-400 transition-colors"
                          onClick={() => setSelectedStitch(imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) : scan.labelImageUrl)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-600 rounded border-2 border-red-600 flex items-center justify-center">
                          <div className="text-center text-red-300">
                            <div className="text-2xl mb-2">❌</div>
                            <p className="text-sm">No Label Extracted</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* SCAN INFO */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      <span className="font-medium">Status:</span> {scan.processingStatus}
                    </div>
                    <div className="text-gray-400">
                      <span className="font-medium">ID:</span> {scan.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* STITCHING BUTTON */}
            <div className="border-t border-blue-700/30 pt-4">
              <button
                onClick={handleStitching}
                disabled={stitchMutation?.isPending}
                className={`
                  w-full px-4 py-3 rounded-lg font-semibold transition-colors
                  ${stitchMutation?.isPending
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                `}
              >
                {stitchMutation?.isPending 
                  ? '🤖 Processing...' 
                  : stitchedCount > 0 
                    ? '🔄 Re-stitch All (Removes old data)' 
                    : '🧩 Start Stitching Process'
                }
              </button>
              
              <p className="text-blue-200 text-sm mt-2 text-center">
                💡 Click on images above to view them in full size
              </p>
            </div>
          </div>
          ) : null;
        })()}

        {/* EXISTING STITCHED IMAGES */}
        {existingStitched.length > 0 && (
          <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-semibold text-green-300 mb-4">
              ✅ Previously Stitched Images ({existingStitched.length})
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {existingStitched.map((stitched, index) => (
                <div key={stitched.id || index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* STITCHED IMAGE */}
                    <div className="flex-shrink-0">
                      <img 
                        src={imageUrlService ? imageUrlService.getStitchedImageUrl(stitched.stitchedImageUrl || stitched.imagePath) : (stitched.stitchedImageUrl || stitched.imagePath)}
                        alt={`Stitched image ${index + 1}`}
                        className="w-48 h-32 object-cover rounded border-2 border-green-600 cursor-pointer hover:border-green-400 transition-colors"
                        onClick={() => setSelectedStitch(imageUrlService ? imageUrlService.getStitchedImageUrl(stitched.stitchedImageUrl || stitched.imagePath) : (stitched.stitchedImageUrl || stitched.imagePath))}
                      />
                    </div>
                    
                    {/* DETAILS */}
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">
                        Stitched Image #{index + 1}
                      </h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p><span className="font-medium">Labels:</span> {stitched.totalLabels || 'Multiple'}</p>
                        <p><span className="font-medium">Size:</span> {stitched.imageWidth}x{stitched.imageHeight}px</p>
                        <p><span className="font-medium">Created:</span> {stitched.createdAt ? new Date(stitched.createdAt).toLocaleDateString() : 'Unknown'}</p>
                        {stitched.isDuplicate && (
                          <p className="text-yellow-400"><span className="font-medium">⚠️ Duplicate detected</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-2 bg-green-800/20 rounded">
              <p className="text-green-200 text-sm">
                💡 These stitched images are ready for OCR text extraction
              </p>
            </div>
          </div>
        )}

        {/* OCR COMPLETED - CANNOT BE RE-STITCHED */}
        {ocrCompletedScans && ocrCompletedScans.scans.length > 0 && (
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              🔒 OCR Completed - Cannot Re-stitch ({ocrCompletedScans.scans.length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ocrCompletedScans.scans.map((scan) => (
                <div key={scan.id} className="bg-gray-700/30 rounded p-3 flex items-center justify-between">
                  <span className="text-purple-200 text-sm truncate">{scan.originalFileName}</span>
                  <span className="px-2 py-1 bg-purple-900/40 text-purple-300 text-xs rounded">
                    📝 OCR Done
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-2 bg-purple-800/20 rounded">
              <p className="text-purple-200 text-sm">
                💡 These scans have completed OCR analysis and cannot be re-stitched
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PROCESSING STATE */}
      {isProcessing && (
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">
              Stitching Labels...
            </h3>
            <p className="text-purple-200 mb-4">{processingStep}</p>
            
            {/* PROGRESS BAR */}
            <div className="bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{progress}% Complete</p>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {stitchedData && (
        <div className="space-y-6">
          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl text-green-400 font-bold">
                {stitchedData.stitchedLabels.length}
              </div>
              <div className="text-green-300 text-sm">Complete Labels</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl text-orange-400 font-bold">
                {stitchedData.unmatched.length}
              </div>
              <div className="text-orange-300 text-sm">Single Parts</div>
            </div>
          </div>

          {/* STITCHED LABELS */}
          {stitchedData.stitchedLabels.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                ✅ Successfully Stitched Labels
              </h3>
              
              <div className="space-y-4">
                {stitchedData.stitchedLabels.map((stitch, index) => (
                  <div 
                    key={stitch.id}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      {/* STITCHED RESULT */}
                      <div className="flex-shrink-0">
                        <img 
                          src={imageUrlService ? imageUrlService.getStitchedImageUrl(stitch.stitchedImage) : stitch.stitchedImage} 
                          alt={`Stitched label ${index + 1}`}
                          className="w-32 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedStitch(imageUrlService ? imageUrlService.getStitchedImageUrl(stitch.stitchedImage) : stitch.stitchedImage)}
                        />
                        <div className="text-center mt-2">
                          <span className={`
                            text-xs px-2 py-1 rounded
                            ${stitch.confidence > 0.85 
                              ? 'bg-green-600 text-green-100' 
                              : 'bg-yellow-600 text-yellow-100'
                            }
                          `}>
                            {Math.round(stitch.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* PARTS */}
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">
                          Label #{index + 1} ({stitch.parts.length} parts)
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {stitch.parts.map((part, partIndex) => (
                            <div key={partIndex} className="text-center">
                              <img 
                                src={imageUrlService ? imageUrlService.getLabelImageUrl(part.image) : part.image} 
                                alt={`${part.type} view`}
                                className="w-full h-16 object-cover rounded"
                              />
                              <p className="text-xs text-gray-400 mt-1 capitalize">
                                {part.type}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          <strong>Source files:</strong> {stitch.originalFiles.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UNMATCHED LABELS */}
          {stitchedData.unmatched.length > 0 && (
            <div className="bg-orange-900/10 border border-orange-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-4">
                🔶 Individual Labels (No Matches Found)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stitchedData.unmatched.map((item, index) => (
                  <div key={index} className="bg-orange-800/20 rounded-lg p-4">
                    <img 
                      src={item.labelImage} 
                      alt={`Unmatched label from ${item.originalFile}`}
                      className="w-full h-24 object-cover rounded mb-3"
                    />
                    <p className="text-sm font-medium text-orange-200 truncate">
                      {item.originalFile}
                    </p>
                    <p className="text-xs text-orange-300 mt-1">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-orange-200">
                <strong>Note:</strong> These labels will be processed individually in the next step.
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="text-center">
            <button
              onClick={handleStitching}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Re-stitch All
            </button>
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {selectedStitch && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStitch(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src={selectedStitch} 
              alt="Stitched label preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedStitch(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
        <h4 className="text-purple-300 font-semibold mb-2">🔧 Stitching Process:</h4>
        <ul className="text-purple-200 text-sm space-y-1">
          <li>• AI groups similar label parts from different angles</li>
          <li>• Combines front, back, and side views into complete labels</li>
          <li>• Unmatched parts are processed individually</li>
          <li>• Higher confidence scores indicate better stitching quality</li>
        </ul>
      </div>
    </div>
  );
};