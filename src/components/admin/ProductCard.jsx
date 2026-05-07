import { useState } from 'react';
import { Edit2, Trash2, Image as ImageIcon, Maximize2 } from 'lucide-react';
import ImageModal from '../ImageModal';

function ProductCard({ product, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleDelete = () => {
    if (window.confirm(`ต้องการลบ "${product.name}" ใช่หรือไม่?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* รูปภาพ */}
      <div
        className="relative h-40 bg-gray-100 group cursor-pointer overflow-hidden"
        onClick={() => product.image && setIsModalOpen(true)}
      >
        {product.image ? (
          <>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 size={24} className="text-white" />
            </div>
          </>
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <ImageIcon size={48} className="text-gray-400 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">ไม่มีรูปภาพ</span>
          </div>
        </div>

        {/* Badge หมวดหมู่ */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            product.category === 'pizza' ? 'bg-orange-100 text-orange-700' :
            product.category === 'sontam' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {product.category === 'pizza' && '🍕 พิซซ่า'}
            {product.category === 'sontam' && '🥗 ส้มตำ'}
            {product.category === 'drink' && '🥤 เครื่องดื่ม'}
          </span>
        </div>
      </div>

      {/* ข้อมูล */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">฿{product.price}</span>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(product)}
              className="p-2.5 sm:p-2 text-blue-600 active:bg-blue-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              title="แก้ไข"
              aria-label="แก้ไขสินค้า"
            >
              <Edit2 size={20} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 sm:p-2 text-red-600 active:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              title="ลบ"
              aria-label="ลบสินค้า"
            >
              <Trash2 size={20} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageModal
        isOpen={isModalOpen}
        image={product.image}
        title={product.name}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default ProductCard;
