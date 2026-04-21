import { useState } from 'react';
import { Plus, Minus, Image as ImageIcon, ShoppingCart } from 'lucide-react';

function MenuItem({ item, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const isEmoji = item.image && item.image.length <= 4;

  const handleAdd = () => {
    onAdd({ ...item, addQuantity: quantity });
    setQuantity(1); // reset กลับเป็น 1 หลังเพิ่ม
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const increaseQty = () => {
    setQuantity(q => q + 1);
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-primary-100 active:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-xl p-1 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {item.image && !isEmoji ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="fallback-icon w-full h-full flex items-center justify-center"
            style={{ display: item.image && !isEmoji ? 'none' : 'flex' }}
          >
            {isEmoji ? (
              <span className="text-3xl sm:text-4xl">{item.image}</span>
            ) : (
              <ImageIcon size={28} className="text-primary-300 sm:w-8 sm:h-8" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
          
          {/* ราคาและตัวเลือกจำนวน */}
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold text-primary-600">
                ฿{item.price}
                {quantity > 1 && (
                  <span className="text-sm text-gray-500 font-normal ml-1">
                    (รวม ฿{item.price * quantity})
                  </span>
                )}
              </span>
            </div>
            
            {/* ปุ่มเลือกจำนวน */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg active:bg-gray-200 disabled:opacity-40 transition-colors"
                  aria-label="ลดจำนวน"
                >
                  <Minus size={18} className="sm:w-4 sm:h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={increaseQty}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg active:bg-gray-200 transition-colors"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus size={18} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              
              <button
                onClick={handleAdd}
                className="flex-1 bg-primary-500 active:bg-primary-600 text-white rounded-lg py-2.5 px-3 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                aria-label="เพิ่มลงตะกร้า"
              >
                <ShoppingCart size={18} />
                <span className="text-sm font-medium">เพิ่ม {quantity} รายการ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuItem;
