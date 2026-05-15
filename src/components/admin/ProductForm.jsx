import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

function ProductForm({ product, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priceM: '',
    priceL: '',
    category: 'pizza',
    description: '',
    image: '',
    isAvailable: true
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        priceM: product.priceM || '',
        priceL: product.priceL || '',
        category: product.category || 'pizza',
        description: product.description || '',
        image: product.image || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
      });
      setPreviewImage(product.image || null);
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    setPreviewImage(url);
    setImageFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      id: (product?.id || Date.now()).toString(),
      price: parseInt(formData.price, 10),
      priceM: formData.category === 'pizza' ? parseInt(formData.priceM || 0, 10) : 0,
      priceL: formData.category === 'pizza' ? parseInt(formData.priceL || 0, 10) : 0,
      // ส่งรูปภาพเป็น Base64 หรือ URL ไปยัง Apps Script
      image: previewImage || formData.image
    };
    onSave(productData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? '📝 แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* รูปภาพ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพสินค้า
            </label>
            <div className="space-y-3">
              {/* Preview */}
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, image: '' }));
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-500 text-sm">ยังไม่มีรูปภาพ</span>
                </div>
              )}

              {/* Upload หรือ URL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-xl cursor-pointer hover:bg-primary-200 transition-colors"
                  >
                    <Upload size={18} />
                    <span className="text-sm font-medium">อัปโหลดรูป</span>
                  </label>
                </div>
              </div>

              {/* URL Input */}
              <input
                type="url"
                placeholder="หรือใส่ URL รูปภาพ"
                value={formData.image?.startsWith('data:') ? '' : formData.image}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อสินค้า <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              placeholder="เช่น พิซซ่าฮาวายเอี้ยน"
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* ราคา */}
          <div className={`grid ${formData.category === 'pizza' ? 'grid-cols-3' : 'grid-cols-1'} gap-3`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา {formData.category === 'pizza' && 'Size S'} (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                placeholder="เช่น 299"
              />
            </div>

            {formData.category === 'pizza' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ราคา Size M
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceM}
                    onChange={(e) => setFormData({ ...formData, priceM: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                    placeholder="เช่น 399"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ราคา Size L
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceL}
                    onChange={(e) => setFormData({ ...formData, priceL: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                    placeholder="เช่น 499"
                  />
                </div>
              </>
            )}
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none resize-none"
              placeholder="คำอธิบายสินค้า..."
            />
          </div>

          {/* สถานะความพร้อมขาย */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 cursor-pointer">
              สินค้าพร้อมจำหน่าย (ถ้าสินค้าหมดให้ติ๊กออก)
            </label>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
            >
              {product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
