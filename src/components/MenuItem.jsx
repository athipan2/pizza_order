import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Minus, Image as ImageIcon, ShoppingCart, Maximize2, Ban } from 'lucide-react';
import ImageModal from './ImageModal';

function MenuItem({ item, onAdd }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('S'); // S, M, L
  const [isFlying, setIsFlying] = useState(false);
  const isEmoji = item.image && item.image.length <= 4;
  const isPizza = item.category === 'pizza';

  const getPrice = () => {
    if (!isPizza) return item.price;
    if (selectedSize === 'M') return item.priceM || item.price;
    if (selectedSize === 'L') return item.priceL || item.price;
    return item.price;
  };

  const currentPrice = getPrice();

  const handleAdd = (e) => {
    // Start flying animation
    setIsFlying(true);

    // Calculate target position (approximate cart button position)
    const cartBtn = document.querySelector('.cart-button-target');
    if (cartBtn) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();
      const tx = cartRect.left - rect.left;
      const ty = cartRect.top - rect.top;
      e.currentTarget.style.setProperty('--target-x', `${tx}px`);
      e.currentTarget.style.setProperty('--target-y', `${ty}px`);
    }

    onAdd({
      ...item,
      price: currentPrice,
      size: isPizza ? selectedSize : null,
      addQuantity: quantity
    });

    setTimeout(() => {
      setIsFlying(false);
      setQuantity(1); // reset กลับเป็น 1 หลังเพิ่ม
    }, 800);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const increaseQty = () => {
    setQuantity(q => q + 1);
  };

  return (
    <div className={`bg-white rounded-[2rem] p-3 sm:p-4 shadow-sm border border-primary-100 transition-all relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 hover:border-primary-300 ${!item.isAvailable ? 'grayscale-[0.8] opacity-90' : ''}`}>
      {!item.isAvailable && (
        <div className="absolute inset-0 bg-black/5 z-[5] pointer-events-none" />
      )}

      <div className="flex items-start gap-3 relative">
        <button
          type="button"
          disabled={!item.image || isEmoji || !item.isAvailable}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-xl p-1 flex-shrink-0 overflow-hidden flex items-center justify-center relative group cursor-pointer disabled:cursor-default"
          onClick={() => setIsModalOpen(true)}
        >
          {item.image && !isEmoji ? (
            <>
              <img
                src={item.image}
                alt={item.name}
                className={`w-full h-full object-cover rounded-lg transition-all ${!item.isAvailable ? 'grayscale opacity-60' : ''}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.fallback-icon');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {item.isAvailable && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Maximize2 size={20} className="text-white" />
                </div>
              )}
            </>
          ) : null}
          <div
            className={`fallback-icon w-full h-full flex items-center justify-center transition-all ${!item.isAvailable ? 'grayscale opacity-40' : ''}`}
            style={{ display: item.image && !isEmoji ? 'none' : 'flex' }}
          >
            {isEmoji ? (
              <span className="text-3xl sm:text-4xl">{item.image}</span>
            ) : (
              <ImageIcon size={28} className="text-primary-300 sm:w-8 sm:h-8" />
            )}
          </div>

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
               <div className="flex flex-col items-center gap-1 scale-110 sm:scale-125">
                 <Ban size={24} className="text-white drop-shadow-lg" />
                 <span className="bg-red-600 text-white text-[12px] font-black px-2 py-0.5 rounded-full shadow-2xl ring-2 ring-white animate-pulse">
                  หมดแล้ว
                </span>
               </div>
            </div>
          )}
        </button>
        <div className={`flex-1 min-w-0 ${!item.isAvailable ? 'opacity-40' : ''}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
          
          {/* ตัวเลือกขนาด (เฉพาะพิซซ่า) */}
          {isPizza && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {[
                { id: 'S', label: 'S', price: item.price },
                { id: 'M', label: 'M', price: item.priceM },
                { id: 'L', label: 'L', price: item.priceL }
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all border ${
                    selectedSize === size.id
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm scale-105'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {size.label}
                  {size.price > 0 && <span className="ml-1 opacity-80">฿{size.price}</span>}
                </button>
              ))}
            </div>
          )}

          {/* ราคาและตัวเลือกจำนวน */}
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold text-primary-600">
                ฿{currentPrice}
                {quantity > 1 && (
                  <span className="text-sm text-gray-500 font-normal ml-1">
                    (รวม ฿{currentPrice * quantity})
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
                disabled={!item.isAvailable || isFlying}
                className={`flex-1 rounded-2xl py-2.5 px-3 transition-all flex items-center justify-center gap-1.5 min-h-[44px] relative ${
                  item.isAvailable
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                } ${isFlying ? 'animate-fly-to-cart' : ''}`}
                aria-label={item.isAvailable ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
              >
                {isFlying ? (
                   <div className="flex items-center gap-1">
                     <ShoppingCart size={18} className="animate-bounce" />
                     <span className="text-sm font-bold">วุ้ววว!</span>
                   </div>
                ) : (
                  <>
                    {item.isAvailable ? <ShoppingCart size={18} /> : <Ban size={18} />}
                    <span className="text-sm font-bold">
                      {item.isAvailable ? `เพิ่ม ${quantity} รายการ` : 'ขณะนี้หมดชั่วคราว'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isModalOpen && createPortal(
        <ImageModal
          isOpen={isModalOpen}
          image={item.image}
          title={item.name}
          onClose={() => setIsModalOpen(false)}
        />,
        document.body
      )}
    </div>
  );
}

export default MenuItem;
