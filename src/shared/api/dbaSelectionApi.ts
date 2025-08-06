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

import {
  createResourceOperations,
  DBA_SELECTION_CONFIG,
  idMapper,
} from './genericApiOperations';
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
type IDbaSelectionCreatePayload = Omit<
  DbaSelection,
  'id' | '_id' | 'createdAt' | 'updatedAt'
>;

/**
 * DBA selection update payload interface
 */
type IDbaSelectionUpdatePayload = Partial<IDbaSelectionCreatePayload>;

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
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all DBA selections with optional filtering
 * @param params - Optional filter parameters
 * @returns Promise<DbaSelection[]> - Array of DBA selections
 */
export const getDbaSelections = async (
  params?: DbaSelectionParams
): Promise<DbaSelection[]> => {
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

// UNUSED DBA CRUD OPERATIONS REMOVED - Not used by any frontend components

/**
 * Search DBA selections with parameters
 * @param searchParams - DBA selection search parameters
 * @returns Promise<DbaSelection[]> - Search results
 */
export const searchDbaSelections = dbaSelectionOperations.search;

// BULK/BATCH CREATE OPERATIONS REMOVED - Not used by any frontend components

/**
 * Export DBA selections data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportDbaSelections = dbaSelectionOperations.export;

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
  const response = await unifiedApiClient.delete<DbaSelectionResponse>(
    '/dba-selection',
    {
      data: { items },
      operation: 'remove DBA selection items',
      successMessage: 'Items removed from DBA selection successfully',
    }
  );
  return response;
};

// ALL DBA ITEM MANIPULATION FUNCTIONS REMOVED - Not used by any frontend components
