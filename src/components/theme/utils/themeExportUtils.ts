/**
 * CLAUDE.md COMPLIANCE: Theme Export Utilities
 * 
 * SRP: Single responsibility for theme export/import operations
 * DRY: Centralized theme export logic
 * SOLID: Pure functions with no side effects
 */

import type { 
  ThemeConfig, 
  VisualTheme, 
  LayoutTheme, 
  AnimationTheme, 
  AccessibilityTheme 
} from '../../../types/theme';

export interface ThemeExportData {
  version: string;
  timestamp: string;
  config: ThemeConfig;
  visualTheme: VisualTheme;
  layoutTheme: LayoutTheme;
  animationTheme: AnimationTheme;
  accessibilityTheme: AccessibilityTheme;
  description?: string;
  name?: string;
}

export interface ThemeBackup {
  id: string;
  name: string;
  timestamp: string;
  data: ThemeExportData;
}

/**
 * Generate theme export data with metadata
 * SRP: Handles only theme data serialization
 */
export const generateThemeExportData = (
  config: ThemeConfig,
  visualTheme: VisualTheme,
  layoutTheme: LayoutTheme,
  animationTheme: AnimationTheme,
  accessibilityTheme: AccessibilityTheme,
  description?: string,
  name?: string
): ThemeExportData => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config,
    visualTheme,
    layoutTheme,
    animationTheme,
    accessibilityTheme,
    description,
    name,
  };
};

/**
 * Export theme data as downloadable JSON file
 * SRP: Handles only file download operations
 */
export const downloadThemeAsFile = (
  themeData: ThemeExportData,
  filename: string
): void => {
  const dataStr = JSON.stringify(themeData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Validate imported theme data structure
 * SRP: Handles only theme data validation
 */
export const validateThemeData = (data: any): data is ThemeExportData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = [
    'version',
    'timestamp',
    'config',
    'visualTheme',
    'layoutTheme',
    'animationTheme',
    'accessibilityTheme',
  ];

  return requiredFields.every(field => field in data);
};

/**
 * Generate theme configuration summary for display
 * SRP: Handles only theme summary generation
 */
export const getThemeConfigSummary = (
  config: ThemeConfig,
  visualTheme: VisualTheme
): string => {
  const features = [];
  
  if (config.accentPrimary && config.accentPrimary !== '#06b6d4') {
    features.push(`Primary: ${config.accentPrimary}`);
  }
  
  if (config.accentSecondary && config.accentSecondary !== '#a855f7') {
    features.push(`Secondary: ${config.accentSecondary}`);
  }
  
  if (visualTheme.name && visualTheme.name !== 'default') {
    features.push(`Theme: ${visualTheme.name}`);
  }
  
  if (config.highContrast) {
    features.push('High Contrast');
  }
  
  if (config.reducedMotion) {
    features.push('Reduced Motion');
  }
  
  return features.length > 0 ? features.join(', ') : 'Default configuration';
};

/**
 * Create theme backup with unique ID
 * SRP: Handles only backup creation
 */
export const createThemeBackup = (
  themeData: ThemeExportData,
  name?: string
): ThemeBackup => {
  return {
    id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || `Backup ${new Date().toLocaleDateString()}`,
    timestamp: new Date().toISOString(),
    data: themeData,
  };
};

/**
 * Parse theme data from file content
 * SRP: Handles only file parsing
 */
export const parseThemeFile = async (file: File): Promise<ThemeExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (validateThemeData(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid theme file format'));
        }
      } catch (error) {
        reject(new Error('Failed to parse theme file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read theme file'));
    };
    
    reader.readAsText(file);
  });
};