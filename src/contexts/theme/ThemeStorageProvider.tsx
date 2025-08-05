/**
 * Theme Storage Provider
 * AGENT 3: THEMECONTEXT DECOMPOSITION - Task 1.5
 * 
 * Focused context for theme persistence management following ISP
 * Handles: localStorage operations, custom presets, and theme persistence
 */

import React, { createContext, useContext, useCallback } from 'react';
import { ThemeConfiguration } from '../../types/themeTypes';

// ================================
// THEME STORAGE INTERFACES
// ================================

export interface CustomPreset {
  name: string;
  config: ThemeConfiguration;
  created: Date;
}

export interface ThemeStorageContextType {
  // Preset Management
  saveCustomPreset: (name: string, config: ThemeConfiguration) => Promise<void>;
  loadCustomPreset: (name: string) => Promise<ThemeConfiguration | null>;
  deleteCustomPreset: (name: string) => Promise<void>;
  getCustomPresets: () => Promise<CustomPreset[]>;
  
  // Configuration Persistence
  saveConfiguration: (config: ThemeConfiguration) => Promise<void>;
  loadConfiguration: () => Promise<ThemeConfiguration | null>;
  clearConfiguration: () => Promise<void>;
  
  // Utility Functions
  exportConfiguration: (config: ThemeConfiguration) => string;
  importConfiguration: (jsonString: string) => ThemeConfiguration | null;
  getStorageInfo: () => Promise<{ used: number; available: number }>;
}

// ================================
// STORAGE UTILITIES
// ================================

const STORAGE_KEYS = {
  config: 'pokemon-theme-config',
  customPresets: 'pokemon-custom-presets',
} as const;

const safeJsonParse = <T,>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

const safeLocalStorageOperation = async <T,>(
  operation: () => T,
  fallback: T,
  errorMessage: string
): Promise<T> => {
  try {
    return operation();
  } catch (error) {
    console.warn(errorMessage, error);
    return fallback;
  }
};

// ================================
// CONTEXT SETUP
// ================================

const ThemeStorageContext = createContext<ThemeStorageContextType | null>(null);

export interface ThemeStorageProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Storage Provider Component
 * Manages theme persistence following Single Responsibility Principle
 * Only handles storage, persistence, and custom preset management
 */
export const ThemeStorageProvider: React.FC<ThemeStorageProviderProps> = ({
  children,
}) => {
  // Custom preset management
  const saveCustomPreset = useCallback(async (name: string, config: ThemeConfiguration): Promise<void> => {
    await safeLocalStorageOperation(
      () => {
        const customPresets = safeJsonParse(
          localStorage.getItem(STORAGE_KEYS.customPresets),
          {}
        );
        
        customPresets[name] = {
          name,
          config,
          created: new Date().toISOString(),
        };
        
        localStorage.setItem(
          STORAGE_KEYS.customPresets,
          JSON.stringify(customPresets)
        );
      },
      undefined,
      'Failed to save custom preset:'
    );
  }, []);

  const loadCustomPreset = useCallback(async (name: string): Promise<ThemeConfiguration | null> => {
    return safeLocalStorageOperation(
      () => {
        const customPresets = safeJsonParse(
          localStorage.getItem(STORAGE_KEYS.customPresets),
          {}
        );
        
        const preset = customPresets[name];
        return preset ? preset.config : null;
      },
      null,
      'Failed to load custom preset:'
    );
  }, []);

  const deleteCustomPreset = useCallback(async (name: string): Promise<void> => {
    await safeLocalStorageOperation(
      () => {
        const customPresets = safeJsonParse(
          localStorage.getItem(STORAGE_KEYS.customPresets),
          {}
        );
        
        delete customPresets[name];
        
        localStorage.setItem(
          STORAGE_KEYS.customPresets,
          JSON.stringify(customPresets)
        );
      },
      undefined,
      'Failed to delete custom preset:'
    );
  }, []);

  const getCustomPresets = useCallback(async (): Promise<CustomPreset[]> => {
    return safeLocalStorageOperation(
      () => {
        const customPresets = safeJsonParse(
          localStorage.getItem(STORAGE_KEYS.customPresets),
          {}
        );
        
        return Object.values(customPresets).map((preset: any) => ({
          ...preset,
          created: new Date(preset.created),
        }));
      },
      [],
      'Failed to get custom presets:'
    );
  }, []);

  // Configuration persistence
  const saveConfiguration = useCallback(async (config: ThemeConfiguration): Promise<void> => {
    await safeLocalStorageOperation(
      () => {
        localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
      },
      undefined,
      'Failed to save theme configuration:'
    );
  }, []);

  const loadConfiguration = useCallback(async (): Promise<ThemeConfiguration | null> => {
    return safeLocalStorageOperation(
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.config);
        return stored ? JSON.parse(stored) : null;
      },
      null,
      'Failed to load theme configuration:'
    );
  }, []);

  const clearConfiguration = useCallback(async (): Promise<void> => {
    await safeLocalStorageOperation(
      () => {
        localStorage.removeItem(STORAGE_KEYS.config);
      },
      undefined,
      'Failed to clear theme configuration:'
    );
  }, []);

  // Utility functions
  const exportConfiguration = useCallback((config: ThemeConfiguration): string => {
    try {
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.warn('Failed to export configuration:', error);
      return '{}';
    }
  }, []);

  const importConfiguration = useCallback((jsonString: string): ThemeConfiguration | null => {
    try {
      const config = JSON.parse(jsonString);
      // Basic validation - ensure it has required properties
      if (config && typeof config === 'object' && config.visualTheme) {
        return config as ThemeConfiguration;
      }
      return null;
    } catch (error) {
      console.warn('Failed to import configuration:', error);
      return null;
    }
  }, []);

  const getStorageInfo = useCallback(async (): Promise<{ used: number; available: number }> => {
    return safeLocalStorageOperation(
      () => {
        let used = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            used += localStorage[key].length + key.length;
          }
        }
        
        // Estimate available storage (most browsers limit localStorage to ~5-10MB)
        const estimated = 5 * 1024 * 1024; // 5MB estimate
        return {
          used,
          available: Math.max(0, estimated - used),
        };
      },
      { used: 0, available: 0 },
      'Failed to get storage info:'
    );
  }, []);

  const contextValue: ThemeStorageContextType = {
    // Preset Management
    saveCustomPreset,
    loadCustomPreset,
    deleteCustomPreset,
    getCustomPresets,
    
    // Configuration Persistence
    saveConfiguration,
    loadConfiguration,
    clearConfiguration,
    
    // Utility Functions
    exportConfiguration,
    importConfiguration,
    getStorageInfo,
  };

  return (
    <ThemeStorageContext.Provider value={contextValue}>
      {children}
    </ThemeStorageContext.Provider>
  );
};

/**
 * Hook to access theme storage context
 * Provides type-safe access to theme storage functionality
 */
export const useThemeStorage = (): ThemeStorageContextType => {
  const context = useContext(ThemeStorageContext);
  if (!context) {
    throw new Error('useThemeStorage must be used within a ThemeStorageProvider');
  }
  return context;
};