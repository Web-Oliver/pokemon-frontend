/**
 * DBA Selection API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for DBA selection-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains DbaSelection interface compatibility
 * - ISP: Provides specific DBA selection operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import { createResourceOperations, DBA_SELECTION_CONFIG, idMapper } from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';

// ========== INTERFACES (ISP Compliance) ==========

export interface DbaSelectionItem {
  itemId: string;
  itemType: 'psa' | 'raw' | 'sealed';
  notes?: string;
}

export interface DbaSelection {
  _id?: string;
  id?: string;
  itemId: string;
  itemType: 'psa' | 'raw' | 'sealed';
  selectedDate: string;
  isActive: boolean;
  notes: string;
  expiryDate: string;
  daysRemaining: number;
  daysSelected: number;
  createdAt: string;
  updatedAt: string;
  item?: any; // Populated item data
}

export interface DbaSelectionStats {
  totalActive: number;
  expiringSoon: number;
  expired: number;
  byType: {
    psa: number;
    raw: number;
    sealed: number;
  };
}

export interface DbaSelectionResponse {
  success: boolean;
  count?: number;
  data: DbaSelection[] | DbaSelection | DbaSelectionStats;
  errors?: Array<{ itemId: string; error: string }>;
  message?: string;
}

export interface DbaSelectionParams {
  active?: boolean;
  expiring?: boolean;
  days?: number;
}

/**
 * DBA selection creation payload interface
 */
interface IDbaSelectionCreatePayload
  extends Omit<DbaSelection, 'id' | '_id' | 'createdAt' | 'updatedAt'> {}

/**
 * DBA selection update payload interface
 */
interface IDbaSelectionUpdatePayload extends Partial<IDbaSelectionCreatePayload> {}

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for DBA selections using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const dbaSelectionOperations = createResourceOperations<
  DbaSelection,
  IDbaSelectionCreatePayload,
  IDbaSelectionUpdatePayload
>(DBA_SELECTION_CONFIG, {
  includeExportOperations: true,
  includeBatchOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all DBA selections with optional filtering
 * @param params - Optional filter parameters
 * @returns Promise<DbaSelection[]> - Array of DBA selections
 */
export const getDbaSelections = async (params?: DbaSelectionParams): Promise<DbaSelection[]> => {
  const { active, expiring, days } = params || {};

  const queryParams = {
    ...(active !== undefined && { active: active.toString() }),
    ...(expiring !== undefined && { expiring: expiring.toString() }),
    ...(days !== undefined && { days: days.toString() }),
  };

  return dbaSelectionOperations.getAll(queryParams, {
    transform: idMapper,
  });
};

/**
 * Get DBA selection by ID
 * @param id - DBA selection ID
 * @returns Promise<DbaSelection> - Single DBA selection
 */
export const getDbaSelectionById = async (id: string): Promise<DbaSelection> => {
  return dbaSelectionOperations.getById(id, {
    transform: idMapper,
  });
};

/**
 * Create a new DBA selection
 * @param selectionData - DBA selection creation data
 * @returns Promise<DbaSelection> - Created DBA selection
 */
export const createDbaSelection = dbaSelectionOperations.create;

/**
 * Update existing DBA selection
 * @param id - DBA selection ID
 * @param selectionData - DBA selection update data
 * @returns Promise<DbaSelection> - Updated DBA selection
 */
export const updateDbaSelection = dbaSelectionOperations.update;

/**
 * Delete DBA selection
 * @param id - DBA selection ID
 * @returns Promise<void>
 */
export const removeDbaSelection = dbaSelectionOperations.remove;

/**
 * Search DBA selections with parameters
 * @param searchParams - DBA selection search parameters
 * @returns Promise<DbaSelection[]> - Search results
 */
export const searchDbaSelections = dbaSelectionOperations.search;

/**
 * Bulk create DBA selections
 * @param selectionsData - Array of DBA selection creation data
 * @returns Promise<DbaSelection[]> - Created DBA selections
 */
export const bulkCreateDbaSelections = dbaSelectionOperations.bulkCreate;

/**
 * Export DBA selections data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportDbaSelections = dbaSelectionOperations.export;

/**
 * Batch operation on DBA selections
 * @param operation - Operation name
 * @param ids - DBA selection IDs
 * @param operationData - Operation-specific data
 * @returns Promise<DbaSelection[]> - Operation results
 */
export const batchDbaSelectionOperation = dbaSelectionOperations.batchOperation;

// ========== DBA-SPECIFIC OPERATIONS ==========

/**
 * Add items to DBA selection
 * @param items - Array of items to add
 * @returns Promise<DbaSelectionResponse>
 */
export const addToDbaSelection = async (
  items: DbaSelectionItem[]
): Promise<DbaSelectionResponse> => {
  const response = await unifiedApiClient.apiCreate<DbaSelectionResponse>(
    '/dba-selection',
    { items },
    'DBA selection items'
  );
  return response;
};

/**
 * Remove items from DBA selection
 * @param items - Array of items to remove
 * @returns Promise<DbaSelectionResponse>
 */
export const removeFromDbaSelection = async (
  items: Pick<DbaSelectionItem, 'itemId' | 'itemType'>[]
): Promise<DbaSelectionResponse> => {
  const response = await unifiedApiClient.delete<DbaSelectionResponse>('/dba-selection', {
    data: { items },
    operation: 'remove DBA selection items',
    successMessage: 'Items removed from DBA selection successfully',
  });
  return response;
};

/**
 * Get DBA selection for specific item
 * @param itemType - Type of item
 * @param itemId - Item ID
 * @returns Promise<DbaSelection>
 */
export const getDbaSelectionByItem = async (
  itemType: string,
  itemId: string
): Promise<DbaSelection> => {
  const response = await unifiedApiClient.apiGet<DbaSelection>(
    `/dba-selection/${itemType}/${itemId}`,
    'DBA selection by item'
  );
  return idMapper(response) as DbaSelection;
};

/**
 * Update DBA selection notes
 * @param itemType - Type of item
 * @param itemId - Item ID
 * @param notes - Notes to update
 * @returns Promise<DbaSelection>
 */
export const updateDbaSelectionNotes = async (
  itemType: string,
  itemId: string,
  notes: string
): Promise<DbaSelection> => {
  const response = await unifiedApiClient.apiUpdate<DbaSelection>(
    `/dba-selection/${itemType}/${itemId}/notes`,
    { notes },
    'DBA selection notes'
  );
  return idMapper(response) as DbaSelection;
};

/**
 * Get DBA selection statistics
 * @returns Promise<DbaSelectionStats>
 */
export const getDbaSelectionStats = async (): Promise<DbaSelectionStats> => {
  const response = await unifiedApiClient.apiGet<DbaSelectionStats>(
    '/dba-selection/stats',
    'DBA selection statistics'
  );
  return response;
};
