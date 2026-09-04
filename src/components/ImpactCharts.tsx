import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingBag, Globe, Award, Leaf } from 'lucide-react';

export const ImpactCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'crafts' | 'states'>('income');

  const incomeData = [
    { craft: 'Mithila Art', before: 6200, after: 18400, gain: '+196%' },
    { craft: 'Bamboo Weave', before: 5500, after: 15800, gain: '+187%' },
    { craft: 'Kondapalli Toys', before: 5800, after: 16200, gain: '+179%' },
    { craft: 'Bankura Pottery', before: 4800, after: 14600, gain: '+204%' },
    { craft: 'Pashmina Shawl', before: 11000, after: 29500, gain: '+168%' },
    { craft: 'Lambani Stitch', before: 5200, after: 15400, gain: '+196%' }
  ];

  const stateData = [
    { state: 'Assam', count: 124, craft: 'Bamboo & Wild Cane' },
    { state: 'Bihar', count: 186, craft: 'Madhubani Painting & Sikki Grass' },
    { state: 'Andhra Pradesh', count: 142, craft: 'Kondapalli Toys & Kalamkari' },
    { state: 'West Bengal', count: 210, craft: 'Terracotta & Kantha Embroidery' },
    { state: 'Rajasthan', count: 260, craft: 'Blue Pottery & Block Print' },
    { state: 'Jammu & Kashmir', count: 95, craft: 'Pashmina & Walnut Wood' },
    { state: 'Karnataka', count: 130, craft: 'Lambani Embroidery & Channapatna' },
    { state: 'Odisha', count: 175, craft: 'Pattachitra & Dhokra Metal' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
      {/* Chart Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <TrendingUp className="w-5 h-5 text-amber-700" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Empowerment & Economic Impact</h3>
              <p className="text-xs text-stone-500">Live analytics tracking fair-trade livelihood improvements across rural India</p>
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'income' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Income Growth
          </button>
          <button
            onClick={() => setActiveTab('crafts')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'crafts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Craft Breakdown
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'states' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            States Covered
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="pt-6">
        {activeTab === 'income' && (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-2">
              <span>Artisan Craft Cluster</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-stone-300"></span> Before KalaConnect (Local Middlemen)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span className="w-3 h-3 rounded-xs bg-amber-700"></span> With KalaConnect AI Direct
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {incomeData.map((item, idx) => {
                const max = 32000;
                const beforeWidth = Math.round((item.before / max) * 100);
                const afterWidth = Math.round((item.after / max) * 100);

                return (
                  <div key={idx} className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-100 hover:border-amber-200 transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-stone-900 font-bold">{item.craft}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                        {item.gain} monthly income
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Before bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400 w-16">Traditional:</span>
                        <div className="flex-1 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-stone-400 h-full rounded-full transition-all duration-700"
                            style={{ width: `${beforeWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-medium text-stone-500 w-16 text-right">
                          ₹{item.before.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* After bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-800 w-16">KalaConnect:</span>
                        <div className="flex-1 bg-amber-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-600 to-amber-700 h-full rounded-full transition-all duration-700"
                            style={{ width: `${afterWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-extrabold text-amber-900 w-16 text-right">
                          ₹{item.after.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'crafts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut graphic */}
            <div className="flex flex-col items-center justify-center p-6 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="16" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#be633b" strokeWidth="16" strokeDasharray="60 251.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1d3557" strokeWidth="16" strokeDasharray="50 251.2" strokeDashoffset="-60" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e9c46a" strokeWidth="16" strokeDasharray="45 251.2" strokeDashoffset="-110" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#059669" strokeWidth="16" strokeDasharray="40 251.2" strokeDashoffset="-155" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#9333ea" strokeWidth="16" strokeDasharray="30 251.2" strokeDashoffset="-195" />
              </svg>
              <span className="text-xs font-bold text-stone-800 mt-2">1,320+ Crafts Preserved</span>
              <span className="text-[11px] text-stone-500">Across 10 GI-Tagged Categories</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#be633b]"></span>
                  <span className="text-xs font-bold text-stone-800">Handloom & Textiles (28%)</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">370 Artisans</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1d3557]"></span>
                  <span className="text-xs font-bold text-stone-800">Pottery & Terracotta (22%)</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">290 Artisans</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#e9c46a]"></span>
                  <span className="text-xs font-bold text-stone-800">Bamboo & Cane Crafts (19%)</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">250 Artisans</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
                  <span className="text-xs font-bold text-stone-800">Mithila & Folk Art (17%)</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">225 Artisans</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#9333ea]"></span>
                  <span className="text-xs font-bold text-stone-800">Woodwork & Metalcraft (14%)</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">185 Artisans</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'states' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stateData.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{item.state}</h4>
                  <p className="text-[11px] text-stone-500">{item.craft}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-700">{item.count}</span>
                  <p className="text-[10px] text-stone-400">Artisans</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
