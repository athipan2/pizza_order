import { useState } from 'react';
import { Plus, Search, ArrowLeft, Package } from 'lucide-react';
import { categories } from '../data/menu';
import ProductCard from '../components/admin/ProductCard';
import ProductForm from '../components/admin/ProductForm';

function ProductManager({ products, onAdd, onEdit, onDelete, onBack, isUpdating }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-lg w-fit">
                <Package className="text-primary-600" size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">สินค้า</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg w-fit">
                <span className="text-xl sm:text-2xl">🍕</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">พิซซ่า</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {products.filter(p => p.category === 'pizza').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg w-fit">
                <span className="text-xl sm:text-2xl">🥗</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">ส้มตำ</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {products.filter(p => p.category === 'sontam').length}
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
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบสินค้า</h3>
            <p className="text-gray-500">
              {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'ยังไม่มีสินค้าในหมวดหมู่นี้'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default ProductManager;
