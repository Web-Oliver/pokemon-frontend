/**
 * Theme Debugger Component
 * Phase 3.3.1: Developer Debugging Tools
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme debugging and visualization only
 * - Open/Closed: Extensible for new debugging features
 * - DRY: Centralized theme debugging logic
 * - Dependency Inversion: Uses theme abstractions rather than direct implementation
 *
 * Integrates with:
 * - ThemeContext.tsx for current theme state
 * - themeUtils.ts for style configurations
 * - formThemes.ts for color scheme information
 * - themeDebug.ts for validation utilities
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Code,
  Palette,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  RefreshCw,
  Zap,
  Layers,
  Clock,
} from 'lucide-react';
import { useVisualTheme, useLayoutTheme, useAnimationTheme, useAccessibilityTheme } from '../../contexts/theme';
import { useCentralizedTheme } from '../../utils/themeConfig';
import {
  buttonStyleConfig,
  inputStyleConfig,
  cardStyleConfig,
  badgeStyleConfig,
  cn,
} from '../../utils/themeUtils';
import {
  validateThemeConfiguration,
  getThemePerformanceMetrics,
  extractCSSCustomProperties,
} from '../../utils/themeDebug';

export interface ThemeDebuggerProps {
  /** Show debugger by default in development */
  enabled?: boolean;
  /** Position of the debugger panel */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Initial panel to show */
  defaultPanel?:
    | 'overview'
    | 'tokens'
    | 'components'
    | 'performance'
    | 'validation';
}

type DebugPanel =
  | 'overview'
  | 'tokens'
  | 'components'
  | 'performance'
  | 'validation';

export const ThemeDebugger: React.FC<ThemeDebuggerProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  defaultPanel = 'overview',
}) => {
  const themeConfig = useCentralizedTheme();
  const visualTheme = useVisualTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();
  const accessibilityTheme = useAccessibilityTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<DebugPanel>(defaultPanel as DebugPanel);
  const [performanceData, setPerformanceData] = useState(() =>
    getThemePerformanceMetrics()
  );
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update performance data every 2 seconds when performance panel is active
  useEffect(() => {
    if (activePanel === 'performance' && isOpen) {
      intervalRef.current = setInterval(() => {
        setPerformanceData(getThemePerformanceMetrics());
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activePanel, isOpen]);

  if (!enabled) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  // Construct theme configuration for validation from centralized theme
  const themeConfigForValidation = {
    visualTheme: themeConfig.visualTheme,
    colorScheme: 'dark' as const, // Assume dark for now
    density: themeConfig.density,
    animationIntensity: themeConfig.animationIntensity,
    primaryColor: 'blue' as const, // Default primary color
    highContrast: themeConfig.highContrast,
    reducedMotion: themeConfig.reducedMotion,
    glassmorphismIntensity: themeConfig.glassmorphismIntensity,
    particleEffectsEnabled: themeConfig.particleEffectsEnabled,
  };

  const validationResults = validateThemeConfiguration(themeConfigForValidation);
  const cssProperties = extractCSSCustomProperties();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadThemeConfig = () => {
    const config = {
      ...themeConfigForValidation,
      cssProperties,
      performance: performanceData,
      validation: validationResults,
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `theme-debug-${Date.now()}.json`);
    linkElement.click();
  };

  const panels = {
    overview: {
      icon: Eye,
      title: 'Theme Overview',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-cyan-400">Current Theme</div>
              <div className="bg-zinc-800/50 p-2 rounded">
                <div>Visual: {themeConfig.visualTheme}</div>
                <div>Color: {themeConfigForValidation.colorScheme}</div>
                <div>Primary: {themeConfigForValidation.primaryColor}</div>
                <div>Density: {themeConfig.density}</div>
                <div>Animation: {themeConfig.animationIntensity}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-purple-400">Settings</div>
              <div className="bg-zinc-800/50 p-2 rounded">
                <div>
                  High Contrast: {themeConfig.highContrast ? 'ON' : 'OFF'}
                </div>
                <div>
                  Reduced Motion: {themeConfig.reducedMotion ? 'ON' : 'OFF'}
                </div>
                <div>Glassmorphism: {themeConfig.glassmorphismIntensity}%</div>
                <div>
                  Particles:{' '}
                  {themeConfig.particleEffectsEnabled ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-emerald-400">
              Applied CSS Classes
            </div>
            <div className="bg-zinc-800/50 p-2 rounded text-xs font-mono break-all">
              theme-{themeConfig.visualTheme} density-{themeConfig.density} animation-{themeConfig.animationIntensity}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadThemeConfig}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600/50 hover:bg-blue-600/70 rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              Export Config
            </button>
            <button
              onClick={() =>
                copyToClipboard(JSON.stringify(themeConfigForValidation, null, 2))
              }
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600/50 hover:bg-green-600/70 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy Config
            </button>
          </div>
        </div>
      ),
    },
    tokens: {
      icon: Code,
      title: 'CSS Tokens',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-semibold text-cyan-400">
              CSS Custom Properties
            </div>
            <div className="max-h-48 overflow-y-auto bg-zinc-800/50 p-2 rounded">
              {Object.entries(cssProperties).map(([property, value]) => (
                <div
                  key={property}
                  className="flex justify-between text-xs font-mono py-1 border-b border-zinc-700/30 last:border-b-0"
                >
                  <span className="text-emerald-400">{property}</span>
                  <span className="text-zinc-300 truncate ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-purple-400">
              Computed Theme Properties
            </div>
            <div className="max-h-48 overflow-y-auto bg-zinc-800/50 p-2 rounded">
              {Object.entries({
                '--theme-visual': themeConfig.visualTheme,
                '--theme-density': themeConfig.density,
                '--theme-animation': themeConfig.animationIntensity,
                '--theme-glassmorphism': `${themeConfig.glassmorphismIntensity}%`,
                '--theme-particles': themeConfig.particleEffectsEnabled ? 'enabled' : 'disabled',
                '--theme-contrast': themeConfig.highContrast ? 'high' : 'normal',
                '--theme-motion': themeConfig.reducedMotion ? 'reduced' : 'normal',
              }).map(
                ([property, value]) => (
                  <div
                    key={property}
                    className="flex justify-between text-xs font-mono py-1 border-b border-zinc-700/30 last:border-b-0"
                  >
                    <span className="text-purple-400">{property}</span>
                    <span className="text-zinc-300 truncate ml-2">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                Object.entries(cssProperties)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')
              )
            }
            className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-600/50 hover:bg-cyan-600/70 rounded transition-colors w-full justify-center"
          >
            <Copy className="w-3 h-3" />
            Copy All Tokens
          </button>
        </div>
      ),
    },
    components: {
      icon: Layers,
      title: 'Components',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { name: 'Button', config: buttonStyleConfig },
              { name: 'Input', config: inputStyleConfig },
              { name: 'Card', config: cardStyleConfig },
              { name: 'Badge', config: badgeStyleConfig },
            ].map(({ name, config }) => {
              return (
                <div key={name} className="bg-zinc-800/50 p-3 rounded">
                  <div className="font-semibold text-cyan-400 mb-2">
                    {name} Component
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-zinc-400 mb-1">Variants</div>
                      <div className="space-y-1">
                        {Object.keys(config.variants || {}).map((variant) => (
                          <div key={variant} className="text-emerald-400">
                            {variant}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-1">Sizes</div>
                      <div className="space-y-1">
                        {Object.keys(config.sizes || {}).map((size) => (
                          <div key={size} className="text-purple-400">
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="text-zinc-400 mb-1">Base Classes</div>
                    <div className="bg-zinc-900/50 p-1 rounded font-mono text-[10px] break-all">
                      {config.base}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    performance: {
      icon: Zap,
      title: 'Performance',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-semibold text-cyan-400">Theme Performance</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-800/50 p-2 rounded">
                <div className="text-zinc-400">CSS Properties</div>
                <div className="text-xl font-bold text-green-400">
                  {performanceData.cssPropertiesCount}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-2 rounded">
                <div className="text-zinc-400">Theme Classes</div>
                <div className="text-xl font-bold text-blue-400">
                  {performanceData.themeClassesCount}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-2 rounded">
                <div className="text-zinc-400">Load Time</div>
                <div className="text-xl font-bold text-purple-400">
                  {performanceData.loadTimeMs}ms
                </div>
              </div>
              <div className="bg-zinc-800/50 p-2 rounded">
                <div className="text-zinc-400">Memory Usage</div>
                <div className="text-xl font-bold text-orange-400">
                  {performanceData.memoryUsageMB}MB
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-purple-400">
              Theme Transitions
            </div>
            <div className="bg-zinc-800/50 p-2 rounded text-xs">
              <div className="flex justify-between">
                <span>Last Switch Duration:</span>
                <span className="text-green-400">
                  {performanceData.lastSwitchDuration}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Switches:</span>
                <span className="text-blue-400">
                  {performanceData.totalSwitches}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Switch Time:</span>
                <span className="text-purple-400">
                  {performanceData.averageSwitchTime}ms
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-emerald-400">
              Resource Impact
            </div>
            <div className="bg-zinc-800/50 p-2 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span>Bundle Size Impact:</span>
                <span
                  className={
                    performanceData.bundleSizeImpact < 50
                      ? 'text-green-400'
                      : 'text-orange-400'
                  }
                >
                  {performanceData.bundleSizeImpact}KB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Render Impact:</span>
                <span
                  className={
                    performanceData.renderImpactScore < 3
                      ? 'text-green-400'
                      : 'text-orange-400'
                  }
                >
                  {performanceData.renderImpactScore}/5
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPerformanceData(getThemePerformanceMetrics())}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600/50 hover:bg-emerald-600/70 rounded transition-colors w-full justify-center"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Metrics
          </button>
        </div>
      ),
    },
    validation: {
      icon: CheckCircle,
      title: 'Validation',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-semibold text-cyan-400">Theme Validation</div>
            <div className="space-y-2">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded text-xs',
                    result.type === 'error'
                      ? 'bg-red-900/30 text-red-300'
                      : result.type === 'warning'
                        ? 'bg-amber-900/30 text-amber-300'
                        : 'bg-green-900/30 text-green-300'
                  )}
                >
                  {result.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : result.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{result.category}</div>
                    <div>{result.message}</div>
                    {result.suggestion && (
                      <div className="text-zinc-400 mt-1">
                        💡 {result.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-purple-400">
              Theme Health Score
            </div>
            <div className="bg-zinc-800/50 p-2 rounded">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Configuration:</span>
                  <span
                    className={
                      validationResults.filter(
                        (r) =>
                          r.category === 'Configuration' && r.type === 'success'
                      ).length > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {
                      validationResults.filter(
                        (r) =>
                          r.category === 'Configuration' && r.type === 'success'
                      ).length
                    }{' '}
                    /{' '}
                    {
                      validationResults.filter(
                        (r) => r.category === 'Configuration'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <span
                    className={
                      validationResults.filter(
                        (r) =>
                          r.category === 'Performance' && r.type === 'success'
                      ).length > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {
                      validationResults.filter(
                        (r) =>
                          r.category === 'Performance' && r.type === 'success'
                      ).length
                    }{' '}
                    /{' '}
                    {
                      validationResults.filter(
                        (r) => r.category === 'Performance'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accessibility:</span>
                  <span
                    className={
                      validationResults.filter(
                        (r) =>
                          r.category === 'Accessibility' && r.type === 'success'
                      ).length > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {
                      validationResults.filter(
                        (r) =>
                          r.category === 'Accessibility' && r.type === 'success'
                      ).length
                    }{' '}
                    /{' '}
                    {
                      validationResults.filter(
                        (r) => r.category === 'Accessibility'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className={cn('fixed z-[9999]', positionClasses)}>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/80 backdrop-blur-sm hover:bg-black/90 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
          title="Open Theme Debugger"
        >
          <Palette className="w-5 h-5" />
        </button>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-2xl border border-zinc-700/50 w-96 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-700/50">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              <span className="font-bold">Theme Debugger</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Navigation */}
          <div className="flex border-b border-zinc-700/50">
            {Object.entries(panels).map(([panelId, panel]) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panelId}
                  onClick={() => setActivePanel(panelId as DebugPanel)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 p-2 text-xs transition-colors',
                    activePanel === panelId
                      ? 'bg-cyan-600/30 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  )}
                  title={panel.title}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{panelId}</span>
                </button>
              );
            })}
          </div>

          {/* Panel Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="font-semibold text-sm mb-3 text-cyan-400">
              {panels[activePanel].title}
            </div>
            {panels[activePanel].content}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-700/50 p-2 text-xs text-zinc-400 flex items-center justify-between">
            <span>Theme Debug v1.0</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDebugger;
