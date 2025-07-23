/**
 * DBA Integration API Client
 * 
 * Provides API functions for integrating with DBA.dk automation
 * Following CLAUDE.md principles and TypeScript best practices
 */

import apiClient from './apiClient';

// Type definitions
export interface DbaPostRequest {
  items: Array<{
    id: string;
    type: 'psa' | 'raw' | 'sealed';
  }>;
  customDescription?: string;
  dryRun?: boolean;
}

export interface DbaPostResponse {
  success: boolean;
  message: string;
  data: {
    itemCount: number;
    export: {
      itemCount: number;
      jsonFilePath: string;
      dataFolder: string;
    };
    posting: {
      success: boolean;
      exitCode?: number;
      stdout?: string;
      stderr?: string;
      message: string;
      timestamp: string;
      dryRun?: boolean;
    };
    dryRun: boolean;
    timestamp: string;
  };
}

export interface DbaStatus {
  ready: boolean;
  scriptExists: boolean;
  packageExists: boolean;
  dataFolderExists: boolean;
  dbaPostFileExists: boolean;
  userDataExists: boolean;
  scriptPath: string;
  configPath: string;
  userDataPath: string;
  packageInfo?: {
    name: string;
    version: string;
    dependencies: Record<string, string>;
  };
  currentDbaPost?: {
    lastModified: string;
    size: number;
    itemCount: number;
  };
  userDataInfo?: {
    created: string;
    lastModified: string;
    size: number;
    hasSessionData: boolean;
    hasCookies: boolean;
  };
  error?: string;
}

export interface DbaStatusResponse {
  success: boolean;
  data: DbaStatus;
}

export interface DbaTestResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    test: DbaPostResponse['data'];
    status: DbaStatus;
    message: string;
  };
}

/**
 * Post selected items directly to DBA.dk
 * 
 * @param postData - Items and options for posting
 * @returns Promise<DbaPostResponse>
 */
export const postToDba = async (postData: DbaPostRequest): Promise<DbaPostResponse> => {
  console.log('[DBA INTEGRATION API] Posting to DBA.dk:', postData);
  
  try {
    const response = await apiClient.post('/export/dba/post', postData);
    console.log('[DBA INTEGRATION API] Post successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DBA INTEGRATION API] Post failed:', error);
    throw error;
  }
};

/**
 * Get DBA integration status
 * 
 * @returns Promise<DbaStatusResponse>
 */
export const getDbaStatus = async (): Promise<DbaStatusResponse> => {
  console.log('[DBA INTEGRATION API] Getting DBA status...');
  
  try {
    const response = await apiClient.get('/export/dba/status');
    console.log('[DBA INTEGRATION API] Status retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DBA INTEGRATION API] Status failed:', error);
    throw error;
  }
};

/**
 * Test DBA integration without posting
 * 
 * @param items - Items to test with
 * @returns Promise<DbaTestResponse>
 */
export const testDbaIntegration = async (items: DbaPostRequest['items']): Promise<DbaTestResponse> => {
  console.log('[DBA INTEGRATION API] Testing DBA integration:', items);
  
  try {
    const response = await apiClient.post('/export/dba/test', { items });
    console.log('[DBA INTEGRATION API] Test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DBA INTEGRATION API] Test failed:', error);
    throw error;
  }
};

/**
 * Post items to DBA.dk with dry run mode
 * 
 * @param postData - Items and options for posting
 * @returns Promise<DbaPostResponse>
 */
export const testPostToDba = async (postData: Omit<DbaPostRequest, 'dryRun'>): Promise<DbaPostResponse> => {
  return postToDba({
    ...postData,
    dryRun: true
  });
};

// Export all functions as default
export default {
  postToDba,
  getDbaStatus,
  testDbaIntegration,
  testPostToDba,
};