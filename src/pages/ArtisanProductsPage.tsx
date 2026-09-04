import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/database';
import { Product } from '../types';
import { processBackgroundReplacement } from '../services/backgroundReplacementService';
import {
  Package,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const ArtisanProductsPage: React.FC = () => {
  const { currentArtisan } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const loadProducts = () => {
    if (currentArtisan) {
      setProducts(db.getProductsByArtisan(currentArtisan.id));
    } else {
      setProducts(db.getProducts());
    }
  };

  useEffect(() => {
    loadProducts();
    const unsub = db.subscribe('products', loadProducts);
    return unsub;
  }, [currentArtisan?.id]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      const deleted = db.deleteProduct(id);
      if (deleted) {
        showToast('Product Deleted', `"${name}" has been removed from your catalog.`, 'info');
        loadProducts();
      }
    }
  };

  const handleRegenerateBackground = async (prod: Product) => {
    setRegeneratingId(prod.id);
    showToast('AI Background Studio', `Regenerating studio background for "${prod.name}"...`, 'info');
    try {
      const sourceImage = prod.originalImage || prod.image;
      const res = await processBackgroundReplacement({
        originalImage: sourceImage,
        productCategory: prod.category,
        productDescription: prod.description,
        backgroundStyle: 'smart-match',
        aspectRatio: '1:1'
      });
      db.updateProduct(prod.id, {
        image: res.finalCompositedDataUrl,
        enhancedImage: res.finalCompositedDataUrl,
        backgroundStyle: res.detectedStudio
      });
      showToast('Studio Background Updated! 📸', `Applied "${res.detectedStudio}" to "${prod.name}".`, 'success');
      loadProducts();
      if (editingProduct && editingProduct.id === prod.id) {
        setEditingProduct({
          ...editingProduct,
          image: res.finalCompositedDataUrl,
          enhancedImage: res.finalCompositedDataUrl,
          backgroundStyle: res.detectedStudio
        });
      }
    } catch (err) {
      showToast('Regeneration Failed', 'Could not regenerate background.', 'error');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    db.updateProduct(editingProduct.id, {
      name: editingProduct.name,
      publishedPrice: Number(editingProduct.publishedPrice),
      category: editingProduct.category,
      material: editingProduct.material,
      stock: Number(editingProduct.stock),
      description: editingProduct.description,
      status: editingProduct.status
    });

    showToast('Product Updated! ✨', `"${editingProduct.name}" details saved successfully.`, 'success');
    setEditingProduct(null);
    loadProducts();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
              Workshop Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">My Products</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your published craft items, stock levels, pricing, and live customer visibility.
            </p>
          </div>

          <button
            onClick={() => navigate('/artisan/studio')}
            className="px-5 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all self-start active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE PRODUCT (AI STUDIO)</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by product name or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700"
            />
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Total Listed: <strong className="text-stone-900 font-bold">{filtered.length}</strong>
          </span>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-800">No products found</h4>
              <p className="text-xs text-stone-500">
                You haven't added any products yet, or none match your search.
              </p>
              <button
                onClick={() => navigate('/artisan/studio')}
                className="px-5 py-2.5 rounded-xl bg-amber-700 text-white font-bold text-xs"
              >
                Create Product with AI
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-[11px] font-bold text-stone-700 uppercase border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Stock</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Views</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((prod) => (
                    <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 text-xs line-clamp-1 max-w-xs">
                              {prod.name}
                            </p>
                            <span className="text-[11px] text-stone-400 block mt-0.5 truncate max-w-xs">
                              {prod.material}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-stone-900 text-sm">
                        ₹{prod.publishedPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6 font-medium text-stone-700">
                        {prod.stock || 15} units
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            prod.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-stone-500 font-medium">
                        {prod.views || 0} views
                      </td>

                      {/* 4 WORKING ACTIONS: VIEW, EDIT, REGENERATE BG, DELETE */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. VIEW */}
                          <button
                            onClick={() => navigate(`/marketplace/product/${prod.id}`)}
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="VIEW Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. REGENERATE BACKGROUND */}
                          <button
                            onClick={() => handleRegenerateBackground(prod)}
                            disabled={regeneratingId === prod.id}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                            title="Regenerate Background (AI Studio)"
                          >
                            <Sparkles className={`w-4 h-4 ${regeneratingId === prod.id ? 'animate-spin text-amber-600' : ''}`} />
                          </button>

                          {/* 3. EDIT */}
                          <button
                            onClick={() => setEditingProduct({ ...prod })}
                            className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="EDIT Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* 4. DELETE */}
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="DELETE Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Edit Product: {editingProduct.name}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Product Title:</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Selling Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.publishedPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, publishedPrice: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Category:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Status:</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, status: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700 bg-white"
                  >
                    <option value="active">Active (Visible in Marketplace)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                ></textarea>
              </div>

              {/* Regenerate Background in Modal */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-stone-900 block">AI Studio Background:</span>
                    <span className="text-[10px] text-amber-800 font-semibold">{editingProduct.backgroundStyle || 'Smart Match'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRegenerateBackground(editingProduct)}
                  disabled={regeneratingId === editingProduct.id}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/70 text-amber-900 font-bold text-xs border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-700 ${regeneratingId === editingProduct.id ? 'animate-spin' : ''}`} />
                  <span>{regeneratingId === editingProduct.id ? 'Regenerating...' : 'Regenerate Background'}</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
