import { Minus, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

function Cart({ items, onUpdateQuantity, onRemove, total }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-primary-100 text-center animate-scale-in">
        <div className="text-6xl mb-4 animate-bounce">🛒</div>
        <p className="text-gray-900 font-bold text-xl">ตะกร้าของคุณว่างเปล่าจ้า</p>
        <p className="text-gray-500 mt-2">หิวแล้วใช่มั้ย? เลือกเมนูอร่อยๆ ใส่ตะกร้าได้เลย!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border-4 border-primary-100 overflow-hidden animate-scale-in">
      <div className="p-4 border-b border-primary-100">
        <h2 className="font-bold text-lg text-gray-900">ตะกร้าสินค้า</h2>
        <p className="text-sm text-gray-500">{items.length} รายการ</p>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div key={`${item.id}-${item.size || index}`} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-primary-50/30 transition-colors">
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
      
      <div className="p-6 bg-primary-50 border-t-4 border-primary-100">
        <div className="flex items-center justify-between">
          <span className="font-black text-gray-700 text-lg">ราคารวมทั้งหมด</span>
          <div className="text-right">
            <span className="text-3xl font-black text-primary-700">฿{total}</span>
            <p className="text-xs text-primary-600 font-bold">รวมภาษีมูลค่าเพิ่มแล้ว</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
