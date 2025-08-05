/**
 * CLAUDE.md COMPLIANCE: Theme Debug Panel Component
 * 
 * SRP: Single responsibility for theme debugging interface
 * OCP: Open for extension via props interface
 * DIP: Depends on theme utilities abstraction
 */

import { useState } from 'react';
import { Bug, Copy, Download, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/themeUtils';
import type { ValidationResult } from './utils/themeValidationUtils';

interface DebugPanel {
  id: string;
  name: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface ThemeDebugPanelProps {
  /** Theme configuration object */
  themeConfig: any;
  /** Validation results */
  validationResults: ValidationResult[];
  /** CSS properties object */
  cssProperties: Record<string, string>;
  /** Available debug panels */
  panels?: DebugPanel[];
  /** Default active panel */
  defaultPanel?: string;
}

/**
 * ThemeDebugPanel Component
 * Provides debugging interface for theme configuration
 * 
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only debug interface
 * - DRY: Reusable debug panel logic
 * - SOLID: Clean interface with dependency injection
 */
export const ThemeDebugPanel: React.FC<ThemeDebugPanelProps> = ({
  themeConfig,
  validationResults,
  cssProperties,
  panels: customPanels,
  defaultPanel = 'config',
}) => {
  const [activePanel, setActivePanel] = useState(defaultPanel);

  // Copy to clipboard utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Download theme config as JSON
  const downloadThemeConfig = () => {
    const dataStr = JSON.stringify(themeConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // Default debug panels
  const defaultPanels: DebugPanel[] = [
    {
      id: 'config',
      name: 'Configuration',
      icon: <Bug className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => copyToClipboard(JSON.stringify(themeConfig, null, 2))}
              className={cn(
                'px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded',
                'flex items-center gap-2 transition-colors'
              )}
            >
              <Copy className="w-3 h-3" />
              Copy Config
            </button>
            
            <button
              onClick={downloadThemeConfig}
              className={cn(
                'px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded',
                'flex items-center gap-2 transition-colors'
              )}
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-3 max-h-64 overflow-auto">
            <pre className="text-xs text-zinc-300 font-mono">
              {JSON.stringify(themeConfig, null, 2)}
            </pre>
          </div>
        </div>
      ),
    },
    
    {
      id: 'validation',
      name: 'Validation',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          {validationResults.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              No validation issues found
            </div>
          ) : (
            <div className="space-y-2">
              {/* Errors */}
              {validationResults.filter(r => r.type === 'error').map((result, index) => (
                <div key={`error-${index}`} className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-red-300">
                        {result.property}
                      </div>
                      <div className="text-xs text-red-400 mt-1">
                        {result.message}
                      </div>
                      {result.value && (
                        <div className="text-xs text-red-500 mt-1 font-mono">
                          Value: {JSON.stringify(result.value)}
                        </div>
                      )}
                      {result.suggestion && (
                        <div className="text-xs text-red-300 mt-1">
                          💡 {result.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Warnings */}
              {validationResults.filter(r => r.type === 'warning').map((result, index) => (
                <div key={`warning-${index}`} className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-yellow-300">
                        {result.property}
                      </div>
                      <div className="text-xs text-yellow-400 mt-1">
                        {result.message}
                      </div>
                      {result.suggestion && (
                        <div className="text-xs text-yellow-300 mt-1">
                          💡 {result.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Info */}
              {validationResults.filter(r => r.type === 'info').map((result, index) => (
                <div key={`info-${index}`} className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-blue-300">
                        {result.property}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        {result.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    
    {
      id: 'css',
      name: 'CSS Variables',
      icon: <Copy className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                const cssText = Object.entries(cssProperties)
                  .map(([key, value]) => `${key}: ${value};`)
                  .join('\n');
                copyToClipboard(cssText);
              }}
              className={cn(
                'px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded',
                'flex items-center gap-2 transition-colors'
              )}
            >
              <Copy className="w-3 h-3" />
              Copy CSS
            </button>
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-3 max-h-64 overflow-auto">
            <div className="space-y-1">
              {Object.entries(cssProperties).map(([property, value]) => (
                <div key={property} className="flex items-center gap-2 text-xs">
                  <span className="text-purple-400 font-mono">{property}:</span>
                  <span className="text-green-400 font-mono">{value};</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const panels = customPanels || defaultPanels;
  const currentPanel = panels.find(p => p.id === activePanel) || panels[0];

  return (
    <div className="bg-zinc-900/80 rounded-lg border border-zinc-700/50">
      {/* Panel Tabs */}
      <div className="flex border-b border-zinc-700/50">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              'border-b-2 border-transparent',
              activePanel === panel.id
                ? 'text-blue-400 border-blue-400 bg-zinc-800/50'
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30'
            )}
          >
            {panel.icon}
            {panel.name}
          </button>
        ))}
      </div>
      
      {/* Panel Content */}
      <div className="p-4">
        {currentPanel.content}
      </div>
    </div>
  );
};

export default ThemeDebugPanel;