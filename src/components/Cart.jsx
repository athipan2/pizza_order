import { Minus, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

function Cart({ items, onUpdateQuantity, onRemove, total }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 text-center">
        <div className="text-4xl mb-2">🛒</div>
        <p className="text-gray-500">ตะกร้าของคุณว่างเปล่า</p>
        <p className="text-sm text-gray-400">เพิ่มเมนูอาหารที่ชอบเลย!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
      <div className="p-4 border-b border-primary-100">
        <h2 className="font-bold text-lg text-gray-900">ตะกร้าสินค้า</h2>
        <p className="text-sm text-gray-500">{items.length} รายการ</p>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div key={`${item.id}-${item.size || index}`} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.image && item.image.length > 4 ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl">{item.image || '🍽️'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.name} {item.size && <span className="text-primary-600">({item.size})</span>}
                </h4>
                <p className="text-sm text-gray-500">฿{item.price}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1, item.size)}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                  disabled={item.quantity <= 1}
                  aria-label="ลดจำนวน"
                >
                  <Minus size={18} className="sm:w-4 sm:h-4" />
                </button>
                <span className="w-10 sm:w-8 text-center font-medium text-base sm:text-sm">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1, item.size)}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-primary-100 active:bg-primary-200 text-primary-700 transition-colors"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus size={18} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary-600 text-base sm:text-sm">฿{item.price * item.quantity}</span>
                <button
                  onClick={() => onRemove(item.id, item.size)}
                  className="p-2 sm:p-1 text-red-500 active:bg-red-50 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  aria-label="ลบสินค้า"
                >
                  <Trash2 size={20} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-primary-50 border-t border-primary-100">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">ราคารวมทั้งหมด</span>
          <span className="text-xl font-bold text-primary-700">฿{total}</span>
        </div>
      </div>
    </div>
  );
}

export default Cart;
