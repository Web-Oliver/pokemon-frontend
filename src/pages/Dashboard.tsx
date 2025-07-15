/**
 * Dashboard Page Component - Context7 Award-Winning Design
 *
 * Ultra-premium dashboard with stunning visual hierarchy and micro-interactions.
 * Features glass-morphism, premium gradients, and award-winning Context7 patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 */

import React from 'react';
import { Package, TrendingUp, DollarSign, Eye, Plus, BarChart3, Grid3X3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Handle navigation to different sections
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Context7 Premium Welcome Section */}
          <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl text-white p-10 relative overflow-hidden border border-white/20'>
            <div className='absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10'></div>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50'></div>

            <div className='relative z-10'>
              <h1 className='text-4xl font-bold mb-3 tracking-wide drop-shadow-lg'>
                Welcome to PokéCollection
              </h1>
              <p className='text-indigo-100 text-xl font-medium leading-relaxed'>
                Manage your Pokémon card collection with ease and precision.
              </p>
            </div>

            {/* Premium floating elements */}
            <div className='absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-75'></div>
          </div>

          {/* Context7 Premium Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-purple-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Package className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
                    Total Items
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300'>
                    --
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <DollarSign className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
                    Total Value
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
                    --
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-purple-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <TrendingUp className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>Sales</p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-300'>
                    --
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-amber-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Eye className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
                    Watching
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-300'>
                    --
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Recent Activity */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
            <div className='p-8 border-b border-slate-200/50 relative z-10'>
              <h2 className='text-2xl font-bold text-slate-900 tracking-wide'>Recent Activity</h2>
            </div>
            <div className='p-8 relative z-10'>
              <div className='text-center py-16'>
                <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                  <Package className='w-10 h-10 text-slate-500' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>No recent activity</h3>
                <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed'>
                  Start adding items to your collection to see activity here.
                </p>
              </div>
            </div>
          </div>

          {/* Context7 Premium Quick Actions */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
            <div className='p-8 border-b border-slate-200/50 relative z-10'>
              <h2 className='text-2xl font-bold text-slate-900 tracking-wide'>Quick Actions</h2>
            </div>
            <div className='p-8 relative z-10'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                <button
                  onClick={() => handleNavigation('/add-item')}
                  className='group p-8 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border-2 border-indigo-200/50 rounded-3xl hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <Plus className='w-8 h-8 text-white' />
                  </div>
                  <p className='text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300'>
                    Add New Item
                  </p>
                  <p className='text-sm text-slate-600 font-medium'>Add cards or products</p>
                </button>

                <button
                  onClick={() => handleNavigation('/sales-analytics')}
                  className='group p-8 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border-2 border-emerald-200/50 rounded-3xl hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <BarChart3 className='w-8 h-8 text-white' />
                  </div>
                  <p className='text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300'>
                    View Analytics
                  </p>
                  <p className='text-sm text-slate-600 font-medium'>Sales and trends</p>
                </button>

                <button
                  onClick={() => handleNavigation('/collection')}
                  className='group p-8 bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm border-2 border-purple-200/50 rounded-3xl hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <Grid3X3 className='w-8 h-8 text-white' />
                  </div>
                  <p className='text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors duration-300'>
                    Browse Collection
                  </p>
                  <p className='text-sm text-slate-600 font-medium'>View all items</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
