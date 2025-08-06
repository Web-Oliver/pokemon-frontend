/**
 * Theme Export/Import Utilities
 * Phase 3.1.2: Theme Export/Import System
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Manages only theme export/import operations
 * - Open/Closed: Extensible for new export formats
 * - DRY: Reusable export/import logic following existing patterns
 * - Dependency Inversion: Abstracts file operations from theme configuration
 *
 * Integrates with:
 * - ThemeContext.tsx for theme configuration access
 * - fileOperations.ts for consistent file handling patterns
 * - exportUtils.ts for standardized export operations
 */

import {
  ThemeConfiguration,
  ThemePreset,
  VisualTheme,
} from '../types/themeTypes';
import { exportToJSON } from './fileOperations';

// ================================
// THEME EXPORT INTERFACES
// ================================

/**
 * Exported theme data structure
 * Complete theme configuration with metadata
 */
export interface ExportedTheme {
  /** Theme metadata */
  metadata: {
    name: string;
    description?: string;
    version: string;
    exportDate: string;
    appVersion: string;
  };
  /** Complete theme configuration */
  configuration: ThemeConfiguration;
  /** Optional custom CSS properties */
  customStyles?: Record<string, string>;
}

/**
 * Exported theme collection
 * Multiple themes in a single export file
 */
export interface ExportedThemeCollection {
  /** Collection metadata */
  metadata: {
    name: string;
    description?: string;
    version: string;
    exportDate: string;
    appVersion: string;
    themeCount: number;
  };
  /** Array of exported themes */
  themes: ExportedTheme[];
}

/**
 * Theme import result
 * Result of importing theme configuration
 */
export interface ThemeImportResult {
  success: boolean;
  error?: string;
  importedTheme?: ThemeConfiguration;
  importedThemes?: ThemeConfiguration[];
  metadata?: ExportedTheme['metadata'] | ExportedThemeCollection['metadata'];
}

// ================================
// STORAGE UTILITIES
// ================================

const CUSTOM_PRESETS_KEY = 'pokemon-custom-presets';
const THEME_EXPORT_VERSION = '1.0.0';
const APP_VERSION = '2025.1.0';

/**
 * Save custom theme preset to localStorage
 * Following existing localStorage patterns from ThemeContext
 */
export const saveCustomPreset = (
  name: string,
  config: ThemeConfiguration
): void => {
  try {
    const customPresets = JSON.parse(
      localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}'
    );
    customPresets[name] = config;
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
  } catch (error) {
    console.warn('Failed to save custom preset:', error);
    throw new Error('Failed to save custom theme preset');
  }
};

/**
 * Load custom theme preset from localStorage
 * Following existing localStorage patterns from ThemeContext
 */
export const loadCustomPreset = (name: string): ThemeConfiguration | null => {
  try {
    const customPresets = JSON.parse(
      localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}'
    );
    return customPresets[name] || null;
  } catch (error) {
    console.warn('Failed to load custom preset:', error);
    return null;
  }
};

/**
 * Get all custom preset names
 */
export const getCustomPresetNames = (): string[] => {
  try {
    const customPresets = JSON.parse(
      localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}'
    );
    return Object.keys(customPresets);
  } catch (error) {
    console.warn('Failed to load custom preset names:', error);
    return [];
  }
};

/**
 * Delete custom theme preset
 */
export const deleteCustomPreset = (name: string): void => {
  try {
    const customPresets = JSON.parse(
      localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}'
    );
    delete customPresets[name];
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
  } catch (error) {
    console.warn('Failed to delete custom preset:', error);
    throw new Error('Failed to delete custom theme preset');
  }
};

// ================================
// EXPORT FUNCTIONS
// ================================

/**
 * Export single theme configuration to JSON file
 * Following existing exportToJSON pattern from fileOperations.ts
 */
export const exportTheme = (
  config: ThemeConfiguration,
  name: string,
  description?: string,
  customStyles?: Record<string, string>
): void => {
  const exportedTheme: ExportedTheme = {
    metadata: {
      name,
      description,
      version: THEME_EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
    },
    configuration: config,
    customStyles,
  };

  const filename = `theme_${name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
  exportToJSON([exportedTheme], filename);
};

/**
 * Export multiple themes as a collection
 * Follows existing export patterns with batch handling
 */
export const exportThemeCollection = (
  themes: Array<{
    config: ThemeConfiguration;
    name: string;
    description?: string;
    customStyles?: Record<string, string>;
  }>,
  collectionName: string,
  collectionDescription?: string
): void => {
  const exportedThemes: ExportedTheme[] = themes.map((theme) => ({
    metadata: {
      name: theme.name,
      description: theme.description,
      version: THEME_EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
    },
    configuration: theme.config,
    customStyles: theme.customStyles,
  }));

  const collection: ExportedThemeCollection = {
    metadata: {
      name: collectionName,
      description: collectionDescription,
      version: THEME_EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
      themeCount: themes.length,
    },
    themes: exportedThemes,
  };

  const filename = `theme_collection_${collectionName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
  exportToJSON([collection], filename);
};

/**
 * Export all custom presets
 * Convenience function to export all saved custom themes
 */
export const exportAllCustomPresets = (
  collectionName: string = 'My Custom Themes'
): void => {
  try {
    const customPresets = JSON.parse(
      localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}'
    );
    const presetNames = Object.keys(customPresets);

    if (presetNames.length === 0) {
      throw new Error('No custom presets found to export');
    }

    const themes = presetNames.map((name) => ({
      config: customPresets[name],
      name,
      description: `Custom theme preset: ${name}`,
    }));

    exportThemeCollection(
      themes,
      collectionName,
      'Collection of all custom theme presets'
    );
  } catch (error) {
    console.error('Failed to export custom presets:', error);
    throw new Error('Failed to export custom presets');
  }
};

// ================================
// IMPORT FUNCTIONS
// ================================

/**
 * Import theme from JSON file
 * Validates theme structure and applies configuration
 */
export const importThemeFromFile = (file: File): Promise<ThemeImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = parseThemeJSON(content);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to parse theme file',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read theme file',
      });
    };

    reader.readAsText(file);
  });
};

/**
 * Parse theme JSON content
 * Validates and extracts theme configuration
 */
export const parseThemeJSON = (jsonContent: string): ThemeImportResult => {
  try {
    const parsed = JSON.parse(jsonContent);

    // Check if it's a single theme export (array with one ExportedTheme)
    if (
      Array.isArray(parsed) &&
      parsed.length === 1 &&
      parsed[0].metadata &&
      parsed[0].configuration
    ) {
      const theme = parsed[0] as ExportedTheme;
      return validateAndExtractTheme(theme);
    }

    // Check if it's a theme collection export (array with one ExportedThemeCollection)
    if (
      Array.isArray(parsed) &&
      parsed.length === 1 &&
      parsed[0].metadata &&
      parsed[0].themes
    ) {
      const collection = parsed[0] as ExportedThemeCollection;
      return validateAndExtractThemeCollection(collection);
    }

    // Check if it's a direct ExportedTheme object
    if (parsed.metadata && parsed.configuration) {
      const theme = parsed as ExportedTheme;
      return validateAndExtractTheme(theme);
    }

    // Check if it's a direct ExportedThemeCollection object
    if (parsed.metadata && parsed.themes) {
      const collection = parsed as ExportedThemeCollection;
      return validateAndExtractThemeCollection(collection);
    }

    return {
      success: false,
      error:
        'Invalid theme file format. Expected exported theme or theme collection.',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Invalid JSON format in theme file',
    };
  }
};

/**
 * Validate and extract single theme
 */
const validateAndExtractTheme = (theme: ExportedTheme): ThemeImportResult => {
  try {
    const validatedConfig = validateThemeConfiguration(theme.configuration);

    return {
      success: true,
      importedTheme: validatedConfig,
      metadata: theme.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Invalid theme configuration',
    };
  }
};

/**
 * Validate and extract theme collection
 */
const validateAndExtractThemeCollection = (
  collection: ExportedThemeCollection
): ThemeImportResult => {
  try {
    const validatedThemes: ThemeConfiguration[] = [];

    for (const themeItem of collection.themes) {
      const validatedConfig = validateThemeConfiguration(
        themeItem.configuration
      );
      validatedThemes.push(validatedConfig);
    }

    return {
      success: true,
      importedThemes: validatedThemes,
      metadata: collection.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Invalid theme collection',
    };
  }
};

/**
 * Validate theme configuration structure
 * Ensures imported theme meets expected interface
 */
export const validateThemeConfiguration = (config: any): ThemeConfiguration => {
  if (!config || typeof config !== 'object') {
    throw new Error('Theme configuration must be an object');
  }

  // Validate required fields with proper types
  const requiredFields = [
    'visualTheme',
    'colorScheme',
    'density',
    'animationIntensity',
    'primaryColor',
    'highContrast',
    'reducedMotion',
    'glassmorphismIntensity',
    'particleEffectsEnabled',
  ];

  for (const field of requiredFields) {
    if (!(field in config)) {
      throw new Error(`Missing required theme configuration field: ${field}`);
    }
  }

  // Validate enum values
  const validVisualThemes: VisualTheme[] = [
    'context7-premium',
    'context7-futuristic',
    'dba-cosmic',
    'minimal',
  ];
  const validColorSchemes = ['light', 'dark', 'system'];
  const validDensities = ['compact', 'comfortable', 'spacious'];
  const validAnimationIntensities = [
    'subtle',
    'normal',
    'enhanced',
    'disabled',
  ];
  const validPrimaryColors = [
    'purple',
    'blue',
    'emerald',
    'amber',
    'rose',
    'dark',
  ];

  if (!validVisualThemes.includes(config.visualTheme)) {
    throw new Error(`Invalid visual theme: ${config.visualTheme}`);
  }

  if (!validColorSchemes.includes(config.colorScheme)) {
    throw new Error(`Invalid color scheme: ${config.colorScheme}`);
  }

  if (!validDensities.includes(config.density)) {
    throw new Error(`Invalid density: ${config.density}`);
  }

  if (!validAnimationIntensities.includes(config.animationIntensity)) {
    throw new Error(
      `Invalid animation intensity: ${config.animationIntensity}`
    );
  }

  if (!validPrimaryColors.includes(config.primaryColor)) {
    throw new Error(`Invalid primary color: ${config.primaryColor}`);
  }

  // Validate boolean fields
  if (typeof config.highContrast !== 'boolean') {
    throw new Error('highContrast must be a boolean');
  }

  if (typeof config.reducedMotion !== 'boolean') {
    throw new Error('reducedMotion must be a boolean');
  }

  if (typeof config.particleEffectsEnabled !== 'boolean') {
    throw new Error('particleEffectsEnabled must be a boolean');
  }

  // Validate numeric fields
  if (
    typeof config.glassmorphismIntensity !== 'number' ||
    config.glassmorphismIntensity < 0 ||
    config.glassmorphismIntensity > 100
  ) {
    throw new Error(
      'glassmorphismIntensity must be a number between 0 and 100'
    );
  }

  // Return validated configuration
  return {
    visualTheme: config.visualTheme,
    colorScheme: config.colorScheme,
    density: config.density,
    animationIntensity: config.animationIntensity,
    primaryColor: config.primaryColor,
    highContrast: config.highContrast,
    reducedMotion: config.reducedMotion,
    glassmorphismIntensity: config.glassmorphismIntensity,
    particleEffectsEnabled: config.particleEffectsEnabled,
    customCSSProperties: config.customCSSProperties || undefined,
  };
};

// ================================
// PRESET MANAGEMENT UTILITIES
// ================================

/**
 * Import and save custom preset
 * Combines import and storage operations
 */
export const importAndSavePreset = async (
  file: File,
  presetName?: string
): Promise<{ success: boolean; error?: string; presetName?: string }> => {
  try {
    const importResult = await importThemeFromFile(file);

    if (!importResult.success || !importResult.importedTheme) {
      return {
        success: false,
        error: importResult.error || 'Failed to import theme',
      };
    }

    // Use provided name or metadata name
    const finalPresetName =
      presetName || importResult.metadata?.name || 'Imported Theme';

    // Save as custom preset
    saveCustomPreset(finalPresetName, importResult.importedTheme);

    return {
      success: true,
      presetName: finalPresetName,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to import and save preset',
    };
  }
};

/**
 * Import and save multiple presets from collection
 */
export const importAndSavePresetCollection = async (
  file: File
): Promise<{
  success: boolean;
  error?: string;
  importedCount?: number;
  skippedCount?: number;
}> => {
  try {
    const importResult = await importThemeFromFile(file);

    if (!importResult.success || !importResult.importedThemes) {
      return {
        success: false,
        error: importResult.error || 'Failed to import theme collection',
      };
    }

    const existingPresets = getCustomPresetNames();
    let importedCount = 0;
    let skippedCount = 0;

    // Import each theme, handling duplicates
    for (let i = 0; i < importResult.importedThemes.length; i++) {
      const themeConfig = importResult.importedThemes[i];
      const baseName = `Imported Theme ${i + 1}`;

      let finalName = baseName;
      let counter = 1;

      // Handle name conflicts
      while (existingPresets.includes(finalName)) {
        finalName = `${baseName} (${counter})`;
        counter++;
      }

      try {
        saveCustomPreset(finalName, themeConfig);
        importedCount++;
      } catch (error) {
        console.warn(`Failed to save preset ${finalName}:`, error);
        skippedCount++;
      }
    }

    return {
      success: importedCount > 0,
      importedCount,
      skippedCount,
      error: importedCount === 0 ? 'No themes could be imported' : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to import theme collection',
    };
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Generate standardized theme export filename
 * Following existing filename generation patterns from exportUtils.ts
 */
export const generateThemeFilename = (
  themeName: string,
  isCollection: boolean = false
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedName = themeName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  const prefix = isCollection ? 'theme_collection' : 'theme';

  return `${prefix}_${sanitizedName}_${timestamp}.json`;
};

/**
 * Validate file type for theme import
 */
export const validateThemeFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Theme files must be JSON format (.json)',
    };
  }

  // Check file size (max 1MB for theme files)
  const maxSize = 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Theme file is too large (max 1MB)',
    };
  }

  return { valid: true };
};

/**
 * Create theme backup
 * Saves current theme configuration as emergency backup
 */
export const createThemeBackup = (config: ThemeConfiguration): void => {
  const backupName = `backup_${new Date().toISOString().replace(/[:.]/g, '_')}`;
  const backupTheme: ExportedTheme = {
    metadata: {
      name: backupName,
      description: 'Automatic theme backup',
      version: THEME_EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
    },
    configuration: config,
  };

  try {
    const backups = JSON.parse(
      localStorage.getItem('pokemon-theme-backups') || '[]'
    );
    backups.push(backupTheme);

    // Keep only last 10 backups
    if (backups.length > 10) {
      backups.splice(0, backups.length - 10);
    }

    localStorage.setItem('pokemon-theme-backups', JSON.stringify(backups));
  } catch (error) {
    console.warn('Failed to create theme backup:', error);
  }
};

/**
 * Get available theme backups
 */
export const getThemeBackups = (): ExportedTheme[] => {
  try {
    return JSON.parse(localStorage.getItem('pokemon-theme-backups') || '[]');
  } catch (error) {
    console.warn('Failed to load theme backups:', error);
    return [];
  }
};

/**
 * Restore theme from backup
 */
export const restoreThemeFromBackup = (
  backupIndex: number
): ThemeConfiguration | null => {
  try {
    const backups = getThemeBackups();
    const backup = backups[backupIndex];

    if (!backup) {
      throw new Error('Backup not found');
    }

    return validateThemeConfiguration(backup.configuration);
  } catch (error) {
    console.warn('Failed to restore theme backup:', error);
    return null;
  }
};

// ================================
// PRESET CONVERSION UTILITIES
// ================================

/**
 * Convert theme preset to exportable format
 */
export const presetToExportable = (
  preset: ThemePreset,
  customStyles?: Record<string, string>
): ExportedTheme => {
  // Convert partial config to full config by merging with defaults
  const defaultConfig: ThemeConfiguration = {
    visualTheme: 'context7-premium',
    colorScheme: 'system',
    density: 'comfortable',
    animationIntensity: 'normal',
    primaryColor: 'dark',
    highContrast: false,
    reducedMotion: false,
    glassmorphismIntensity: 80,
    particleEffectsEnabled: true,
  };

  const fullConfig: ThemeConfiguration = {
    ...defaultConfig,
    ...preset.config,
  };

  return {
    metadata: {
      name: preset.name,
      description: preset.description,
      version: THEME_EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
    },
    configuration: fullConfig,
    customStyles,
  };
};

/**
 * Get theme configuration summary for display
 */
export const getThemeConfigSummary = (config: ThemeConfiguration): string => {
  return [
    `Theme: ${config.visualTheme}`,
    `Colors: ${config.primaryColor}`,
    `Density: ${config.density}`,
    `Animation: ${config.animationIntensity}`,
    `Effects: ${config.particleEffectsEnabled ? 'enabled' : 'disabled'}`,
    `Accessibility: ${config.highContrast ? 'high contrast' : 'normal'}${config.reducedMotion ? ', reduced motion' : ''}`,
  ].join(' | ');
};

export default {
  exportTheme,
  exportThemeCollection,
  exportAllCustomPresets,
  importThemeFromFile,
  parseThemeJSON,
  importAndSavePreset,
  importAndSavePresetCollection,
  saveCustomPreset,
  loadCustomPreset,
  getCustomPresetNames,
  deleteCustomPreset,
  validateThemeConfiguration,
  validateThemeFile,
  generateThemeFilename,
  createThemeBackup,
  getThemeBackups,
  restoreThemeFromBackup,
  presetToExportable,
  getThemeConfigSummary,
};
