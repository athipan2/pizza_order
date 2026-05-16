import { useState } from 'react';
import { Plus, Search, ArrowLeft, Package, Settings2, X, Edit2, Trash2 } from 'lucide-react';
import ProductCard from '../components/admin/ProductCard';
import ProductForm from '../components/admin/ProductForm';
import EmptyState from '../components/EmptyState';

function ProductManager({
  products,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onBack,
  isUpdating
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // สถานะสำหรับ Modal จัดการหมวดหมู่
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', icon: '' });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      onEdit(productData);
    } else {
      onAdd(productData);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catFormData.name || !catFormData.icon) return;

    if (editingCategory) {
      onEditCategory({ ...editingCategory, ...catFormData });
    } else {
      onAddCategory({
        id: catFormData.name.toLowerCase().replace(/\s+/g, '-'),
        ...catFormData
      });
    }
    setCatFormData({ name: '', icon: '' });
    setEditingCategory(null);
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatFormData({ name: cat.name, icon: cat.icon });
  };

  const handleDeleteCategoryClick = (catId) => {
    const productsInCat = products.filter(p => p.category === catId);
    if (productsInCat.length > 0) {
      alert(`⚠️ ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากยังมีสินค้าอยู่ (${productsInCat.length} รายการ)\nกรุณาย้ายสินค้าออกก่อนทำการลบ`);
      return;
    }
    if (window.confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) {
      onDeleteCategory(catId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-primary-600 rounded-full hover:bg-primary-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">📦 จัดการสินค้า</h1>
                <p className="text-sm text-primary-200">เพิ่ม แก้ไข ลบ เมนูอาหาร</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-xl hover:bg-primary-500 transition-colors font-medium border border-primary-400"
                title="จัดการหมวดหมู่"
              >
                <Settings2 size={20} />
                <span className="hidden sm:inline">หมวดหมู่</span>
              </button>
              {isUpdating && (
                <div className="flex items-center gap-2 bg-primary-600/50 px-3 py-1.5 rounded-lg border border-primary-400/30">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-white/90">กำลังบันทึก...</span>
                </div>
              )}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 rounded-xl hover:bg-primary-400 transition-colors font-medium"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">เพิ่มสินค้า</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-lg w-fit">
                <Package className="text-primary-600" size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">สินค้าทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          {categories.slice(0, 4).map((cat, idx) => {
            const colors = ['bg-orange-100', 'bg-green-100', 'bg-blue-100', 'bg-gray-100'];
            return (
              <div key={cat.id} className="bg-white rounded-xl p-2 sm:p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className={`p-2 sm:p-3 ${colors[idx % colors.length]} rounded-lg w-fit`}>
                    <span className="text-xl sm:text-2xl">{cat.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px]">{cat.name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {products.filter(p => p.category === cat.id).length}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm col-span-2 md:col-span-1 border-2 border-red-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg w-fit">
                <span className="text-xl sm:text-2xl">🚫</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-red-600 font-medium">สินค้าหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700">
                  {products.filter(p => !p.isAvailable).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🍽️</span>
              <span className="font-medium text-sm">ทั้งหมด</span>
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            type={searchTerm ? "search" : "products"}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16"
            title={searchTerm ? "ไม่พบสินค้า" : undefined}
            description={searchTerm ? `ไม่พบสินค้าที่ตรงกับ "${searchTerm}" ลองใช้คำอื่นดูนะ` : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">📂 จัดการหมวดหมู่</h2>
              <button onClick={() => setShowCategoryManager(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <form onSubmit={handleSaveCategory} className="mb-6 bg-primary-50 p-4 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider">
                  {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="อีโมจิ (เช่น 🍕)"
                    value={catFormData.icon}
                    onChange={(e) => setCatFormData({ ...catFormData, icon: e.target.value })}
                    className="w-20 px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-400 outline-none"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="ชื่อหมวดหมู่"
                    value={catFormData.name}
                    onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-400 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-bold hover:bg-primary-600 transition-colors"
                  >
                    {editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatFormData({ name: '', icon: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  หมวดหมู่ปัจจุบัน ({categories.length})
                </h3>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-bold text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(cat.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">
                * หมวดหมู่จะมีผลต่อหน้าลูกค้าและการจัดกลุ่มสินค้าทันที
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManager;
