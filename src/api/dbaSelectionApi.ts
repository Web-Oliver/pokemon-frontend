/**
 * DBA Selection API Client
 * Handles all DBA selection-related API operations
 */

import unifiedApiClient from './unifiedApiClient';

export interface DbaSelectionItem {
  itemId: string;
  itemType: 'psa' | 'raw' | 'sealed';
  notes?: string;
}

export interface DbaSelection {
  _id: string;
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

/**
 * Get all DBA selections
 * @param active - Filter by active status
 * @param expiring - Show only expiring items
 * @param days - Days threshold for expiring soon
 * @returns Promise<DbaSelection[]>
 */
export const getDbaSelections = async (
  active?: boolean,
  expiring?: boolean,
  days?: number
): Promise<DbaSelection[]> => {
  const params = new URLSearchParams();
  
  if (active !== undefined) {
    params.append('active', active.toString());
  }
  
  if (expiring !== undefined) {
    params.append('expiring', expiring.toString());
  }
  
  if (days !== undefined) {
    params.append('days', days.toString());
  }
  
  const response = await unifiedApiClient.get(`/dba-selection?${params.toString()}`);
  return response.data || [];
};

/**
 * Add items to DBA selection
 * @param items - Array of items to add
 * @returns Promise<DbaSelectionResponse>
 */
export const addToDbaSelection = async (
  items: DbaSelectionItem[]
): Promise<DbaSelectionResponse> => {
  const response = await unifiedApiClient.post('/dba-selection', { items });
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
  const response = await unifiedApiClient.delete('/dba-selection', { data: { items } });
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
  const response = await unifiedApiClient.get(`/dba-selection/${itemType}/${itemId}`);
  return response.data;
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
  const response = await unifiedApiClient.put(`/dba-selection/${itemType}/${itemId}/notes`, { notes });
  return response.data;
};

/**
 * Get DBA selection statistics
 * @returns Promise<DbaSelectionStats>
 */
export const getDbaSelectionStats = async (): Promise<DbaSelectionStats> => {
  const response = await unifiedApiClient.get('/dba-selection/stats');
  return response.data;
};