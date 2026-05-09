import React from 'react';
import { ShoppingBag, User, Phone, MapPin, CheckCircle2, X } from 'lucide-react';

function NewOrderPopup({ orders, onAccept, onDismiss }) {
  if (!orders || orders.length === 0) return null;

  // Show the most recent one first
  const currentOrder = orders[0];
  const remainingCount = orders.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-primary-500">
        {/* Header */}
        <div className="bg-primary-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg animate-bounce">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="font-bold text-xl">มีออเดอร์ใหม่!</h2>
              {remainingCount > 0 && (
                <p className="text-xs text-primary-100">และอีก {remainingCount} ออเดอร์ที่รออยู่</p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-wider">
                ออเดอร์ #{currentOrder.id.toString().slice(-6)}
              </span>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(currentOrder.createdAt).toLocaleTimeString('th-TH')} น.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">ยอดรวม</p>
              <p className="text-2xl font-black text-primary-700">฿{currentOrder.total.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 leading-none">ลูกค้า</p>
                <p className="font-bold text-gray-800">{currentOrder.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 leading-none">เบอร์โทร</p>
                <p className="font-bold text-gray-800">{currentOrder.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 leading-none">การจัดส่ง</p>
                <p className="font-bold text-gray-800">
                  {currentOrder.deliveryMethod === 'เดลิเวอรี่' ? '🚚 ' : '🏪 '}
                  {currentOrder.deliveryMethod}
                </p>
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">รายการอาหาร</p>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {currentOrder.cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded flex items-center justify-center">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    {item.size && <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded uppercase font-bold">{item.size}</span>}
                  </div>
                  <span className="text-gray-500">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0">
          <button
            onClick={() => onAccept(currentOrder.id)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-lg"
          >
            <CheckCircle2 size={24} />
            กดรับออเดอร์ (เริ่มทำอาหาร)
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest animate-pulse font-bold">
            📢 เสียงเตือนจะดังจนกว่าจะกดรับออเดอร์ครบทั้งหมด
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewOrderPopup;
