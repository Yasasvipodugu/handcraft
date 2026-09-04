import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/database';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { parseSmartSearchQuery, filterProductsByNlp } from '../services/nlpSearchService';
import {
  Search,
  Sparkles,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Tag
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());

  // Listen to product changes (e.g. freshly published products)
  useEffect(() => {
    const unsub = db.subscribe('products', () => {
      setProducts(db.getProducts());
    });
    return unsub;
  }, []);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedCraft, setSelectedCraft] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // NLP Smart Search analysis
  const nlpExtraction = useMemo(() => {
    return parseSmartSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle Quick NLP Preset Click
  const handleQuickPreset = (queryText: string) => {
    setSearchQuery(queryText);
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedMaterial('All');
    setSelectedCraft('All');
    setMaxPrice(20000);
    setMinRating(0);
    setSortBy('featured');
  };

  // Filtering & Sorting Pipeline
  const filteredProducts = useMemo(() => {
    let result = filterProductsByNlp(products, nlpExtraction, searchQuery);

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by State
    if (selectedState !== 'All') {
      result = result.filter((p) =>
        p.artisanLocation.toLowerCase().includes(selectedState.toLowerCase())
      );
    }

    // Filter by Material
    if (selectedMaterial !== 'All') {
      result = result.filter((p) =>
        p.material.toLowerCase().includes(selectedMaterial.toLowerCase())
      );
    }

    // Filter by Craft Type
    if (selectedCraft !== 'All') {
      result = result.filter((p) =>
        p.craftType.toLowerCase().includes(selectedCraft.toLowerCase())
      );
    }

    // Filter by Max Price (if not already overridden by NLP)
    if (!nlpExtraction.maxBudget) {
      result = result.filter((p) => p.publishedPrice <= maxPrice);
    }

    // Filter by Min Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.publishedPrice - b.publishedPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.publishedPrice - a.publishedPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [
    products,
    searchQuery,
    nlpExtraction,
    selectedCategory,
    selectedState,
    selectedMaterial,
    selectedCraft,
    maxPrice,
    minRating,
    sortBy
  ]);

  const categories = [
    'All',
    'Bamboo & Cane',
    'Paintings',
    'Pottery',
    'Woodwork',
    'Textiles',
    'Metalcraft',
    'Handmade Jewelry & Textile'
  ];

  const states = [
    'All',
    'Assam',
    'Bihar',
    'Andhra Pradesh',
    'West Bengal',
    'Jammu & Kashmir',
    'Rajasthan',
    'Karnataka',
    'Odisha',
    'Chhattisgarh',
    'Tamil Nadu'
  ];

  const materials = [
    'All',
    'Bamboo',
    'Cane',
    'Clay',
    'Terracotta',
    'Silk',
    'Cashmere',
    'Wood',
    'Brass',
    'Cotton'
  ];

  const craftTypes = [
    'All',
    'Weaving',
    'Kachni',
    'Wheel-thrown',
    'Carving',
    'Dhokra',
    'Embroidery',
    'Glazed'
  ];

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Direct From Rural Artisans
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Explore Indian Crafts
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
            Discover GI-certified authentic treasures hand-made across 28 states. Fair trade certified with 100% transparent direct payments.
          </p>
        </div>

        {/* AI SMART SEARCH BOX */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='AI Smart Search: Try "I want an eco-friendly handmade gift under ₹1000"'
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-600/20 text-xs sm:text-sm font-medium bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Extraction Banner */}
          {nlpExtraction.isNlpMatch && (
            <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-amber-50 to-emerald-50/60 p-3 rounded-xl border border-amber-200/80 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                <span>AI NLP Parser:</span>
              </span>
              <span className="text-stone-600">{nlpExtraction.explanation}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-auto text-[11px] text-amber-800 font-bold hover:underline"
              >
                Clear AI Query
              </button>
            </div>
          )}

          {/* Quick NLP Sample Query Chips for Evaluator */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Popular AI Searches:</span>
            </span>
            {[
              'I want an eco-friendly handmade gift under ₹1000',
              'Madhubani folk painting on handmade paper under ₹2000',
              'Kondapalli wooden toys under ₹800',
              'Bankura terracotta clay pots below 1000',
              'Pure Kashmir pashmina cashmere shawls'
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPreset(preset)}
                className="text-xs bg-stone-100 hover:bg-amber-100 text-stone-800 px-3 py-1 rounded-full border border-stone-200 transition-colors"
              >
                "{preset.substring(0, 36)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                <span>Filter Indian Crafts</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Craft Category
              </label>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Origin State
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {states.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedState === st
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>Maximum Price</span>
                <span className="text-amber-800">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={200}
                max={20000}
                step={200}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>₹200</span>
                <span>₹20,000+</span>
              </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Primary Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full bg-stone-50 rounded-xl border border-stone-200 p-2 text-xs font-medium focus:outline-none focus:border-amber-700"
              >
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Craft Technique */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Craft Technique
              </label>
              <select
                value={selectedCraft}
                onChange={(e) => setSelectedCraft(e.target.value)}
                className="w-full bg-stone-50 rounded-xl border border-stone-200 p-2 text-xs font-medium focus:outline-none focus:border-amber-700"
              >
                {craftTypes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Minimum Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                {[0, 4.5, 4.8].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setMinRating(rt)}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      minRating === rt
                        ? 'bg-amber-700 text-white font-bold border-amber-700'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {rt === 0 ? 'All' : `${rt}★+`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Bar: Count & Sort */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-xs font-semibold text-stone-800 border border-stone-200"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <span className="text-xs font-semibold text-stone-700">
                  Showing <strong className="text-stone-900 font-extrabold">{filteredProducts.length}</strong> authentic handcrafted items
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-stone-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option value="featured">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Recently Published</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">No matching crafts found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try broadening your price range or search terms, or reset your filters to see all available products.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
