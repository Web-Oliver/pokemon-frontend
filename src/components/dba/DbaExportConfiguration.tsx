/**
 * DBA Export Configuration Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for export configuration UI
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { Settings, FileDown, Zap } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  customTitle?: string;
  customDescription?: string;
}

interface DbaExportConfigurationProps {
  selectedItems: SelectedItem[];
  customDescription: string;
  setCustomDescription: (value: string) => void;
  updateItemCustomization: (
    itemId: string,
    field: string,
    value: string
  ) => void;
  generateTitle: (item: any) => string;
  generateDescription: (item: any) => string;
  exportCollectionData: (items: SelectedItem[], mode: string) => void;
  downloadZip: () => void;
  isExporting: boolean;
  exportResult: any;
}

const DbaExportConfiguration: React.FC<DbaExportConfigurationProps> =
  React.memo(
    ({
      selectedItems,
      customDescription,
      setCustomDescription,
      updateItemCustomization,
      generateTitle,
      generateDescription,
      exportCollectionData,
      downloadZip,
      isExporting,
      exportResult,
    }) => {
      if (selectedItems.length === 0) {
        return null;
      }

      return (
        <div className="relative group overflow-hidden">
          {/* Holographic background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>

          <div className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-800/85 to-zinc-900/95 backdrop-blur-3xl rounded-3xl border border-emerald-400/20 shadow-[0_0_60px_rgba(16,185,129,0.2)] p-10">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out rounded-3xl"></div>

            <div className="relative z-10">
              {/* Cosmic header */}
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    DBA Export Settings
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Configure your DBA.dk export
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Custom Description Prefix (Optional)
                  </label>
                  <Input
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g., Sjældent samler kort..."
                    className="w-full"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    This text will be added before the auto-generated
                    description
                  </p>
                </div>

                {/* Individual Item Customization */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-100 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-cyan-400" />
                    Customize Individual Items
                  </h3>
                  <div className="space-y-4">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-600/30"
                      >
                        {/* Mobile Layout */}
                        <div className="block lg:hidden">
                          {/* Item name at top */}
                          <div className="mb-4">
                            <span className="text-base font-medium text-white">
                              {item.productId?.productName || item.name || generateTitle(item)}
                            </span>
                            <p className="text-sm text-zinc-400 mt-1">
                              {item.productId?.setProductId || item.setName || 'Unknown Set'} • {item.type.toUpperCase()}
                            </p>
                          </div>

                          {/* Image centered */}
                          <div className="flex justify-center mb-6">
                            {item.images && item.images[0] ? (
                              <img
                                src={(() => {
                                  const imageUrl = item.images[0];
                                  const ext = imageUrl.substring(
                                    imageUrl.lastIndexOf('.')
                                  );
                                  const nameWithoutExt = imageUrl.substring(
                                    0,
                                    imageUrl.lastIndexOf('.')
                                  );
                                  const thumbnailUrl = `${nameWithoutExt}-thumb${ext}`;
                                  return thumbnailUrl.startsWith('http')
                                    ? thumbnailUrl
                                    : `http://localhost:3000${thumbnailUrl}`;
                                })()}
                                alt={item.name || 'Item'}
                                className="w-48 h-48 object-contain rounded-lg border border-zinc-600 bg-zinc-800"
                              />
                            ) : (
                              <div className="w-48 h-48 bg-zinc-700 rounded-lg border border-zinc-600 flex items-center justify-center">
                                <span className="text-zinc-500 text-xs text-center">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Text fields stacked */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-400 mb-1">
                                Custom Title
                              </label>
                              <textarea
                                value={item.customTitle || generateTitle(item)}
                                onChange={(e) => {
                                  updateItemCustomization(
                                    item.id,
                                    'customTitle',
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter custom title..."
                                className="w-full h-20 px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-400 mb-1">
                                Custom Description
                              </label>
                              <textarea
                                value={
                                  item.customDescription ||
                                  generateDescription(item)
                                }
                                onChange={(e) => {
                                  updateItemCustomization(
                                    item.id,
                                    'customDescription',
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter custom description..."
                                className="w-full h-32 px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:flex gap-4">
                          {/* Left side - Item name and Thumbnail Image */}
                          <div className="flex-shrink-0 w-64">
                            {/* Item name above image - same width */}
                            <div className="mb-3">
                              <span className="text-sm font-medium text-white">
                                {item.productId?.productName || item.name || generateTitle(item)}
                              </span>
                              <p className="text-xs text-zinc-400 mt-1">
                                {item.productId?.setProductId || item.setName || 'Unknown Set'} • {item.type.toUpperCase()}
                              </p>
                            </div>

                            {/* Image */}
                            {item.images && item.images[0] ? (
                              <img
                                src={(() => {
                                  const imageUrl = item.images[0];
                                  const ext = imageUrl.substring(
                                    imageUrl.lastIndexOf('.')
                                  );
                                  const nameWithoutExt = imageUrl.substring(
                                    0,
                                    imageUrl.lastIndexOf('.')
                                  );
                                  const thumbnailUrl = `${nameWithoutExt}-thumb${ext}`;
                                  return thumbnailUrl.startsWith('http')
                                    ? thumbnailUrl
                                    : `http://localhost:3000${thumbnailUrl}`;
                                })()}
                                alt={item.name || 'Item'}
                                className="w-64 h-64 object-contain rounded-lg border border-zinc-600 bg-zinc-800"
                              />
                            ) : (
                              <div className="w-64 h-64 bg-zinc-700 rounded-lg border border-zinc-600 flex items-center justify-center">
                                <span className="text-zinc-500 text-xs text-center">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right side - Text fields */}
                          <div className="flex-1 h-64 flex flex-col">
                            <div className="mb-12">
                              <label className="block text-xs font-medium text-zinc-400 mb-1">
                                Custom Title
                              </label>
                              <textarea
                                value={item.customTitle || generateTitle(item)}
                                onChange={(e) => {
                                  updateItemCustomization(
                                    item.id,
                                    'customTitle',
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter custom title..."
                                className="w-full h-[100px] px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-400 mb-1">
                                Custom Description
                              </label>
                              <textarea
                                value={
                                  item.customDescription ||
                                  generateDescription(item)
                                }
                                onChange={(e) => {
                                  updateItemCustomization(
                                    item.id,
                                    'customDescription',
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter custom description..."
                                className="w-full h-[135px] px-3 py-3 bg-zinc-700 text-white font-medium text-sm rounded-lg border border-zinc-600 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:bg-zinc-600 transition-all duration-200 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex gap-3 pt-6 border-t border-zinc-700/50">
                  <Button
                    onClick={() =>
                      exportCollectionData(selectedItems, 'selected')
                    }
                    disabled={isExporting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export to DBA'}
                  </Button>

                  {exportResult && (
                    <button
                      onClick={downloadZip}
                      disabled={isExporting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Files
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

export default DbaExportConfiguration;
