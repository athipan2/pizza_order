import { useState } from 'react';
import { ShoppingCart, CheckCircle, Package, Home, ArrowLeft, Store, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../types';
import MenuItem from '../components/MenuItem';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import OrderTracker from '../components/OrderTracker';

function CustomerPage({ onAddOrder, products, categories, orders, settings }) {
  const menuItems = products;
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'tracking'

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const addQty = item.addQuantity || 1;
    setCart(prev => {
      // ตรวจสอบทั้ง id และ size เพื่อแยกสินค้าชนิดเดียวกันแต่คนละขนาด
      const existing = prev.find(cartItem =>
        cartItem.id === item.id && cartItem.size === item.size
      );
      if (existing) {
        return prev.map(cartItem =>
          (cartItem.id === item.id && cartItem.size === item.size)
            ? { ...cartItem, quantity: cartItem.quantity + addQty }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: addQty }];
    });
    setShowCart(true);
  };

  const updateQuantity = (itemId, change, size = null) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId && item.size === size) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId, size = null) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.size === size)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (orderData) => {
    setIsSubmitting(true);
    const order = {
      id: Date.now(),
      ...orderData,
      status: OrderStatus.PENDING_PAYMENT,
      createdAt: new Date().toISOString()
    };
    await onAddOrder(order);
    setIsSubmitting(false);
    setCart([]);
    setShowCheckout(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Shop Closed Overlay */}
      {!settings.isShopOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border-8 border-primary-100 overflow-hidden text-center animate-in zoom-in-90 duration-500">
            <div className="bg-primary-500 p-12 flex justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-4 left-4 rotate-12"><Store size={40} /></div>
                 <div className="absolute bottom-4 right-4 -rotate-12"><Package size={40} /></div>
              </div>
              <div className="relative animate-bounce">
                <Store size={100} className="text-white" />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-xl">
                  <AlertCircle size={32} className="text-primary-500" />
                </div>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <h2 className="text-4xl font-black text-gray-900 leading-tight">ขออภัยน้าาา<br/>ร้านปิดชั่วคราวครับ</h2>
              <p className="text-gray-500 font-medium leading-relaxed text-lg">
                ตอนนี้เชฟกำลังพักผ่อนหรือเตรียมวัตถุดิบอยู่ครับ<br/>
                ลองแวะมาดูใหม่ภายหลังนะครับผม! 🥗🍕
              </p>
              <div className="pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white font-black text-xl rounded-2xl transition-all shadow-[0_10px_30px_rgba(132,204,22,0.3)] active:scale-95 flex items-center justify-center gap-3"
                >
                  <Package size={24} />
                  รีเฟรชเช็คสถานะร้าน
                </button>
              </div>
            </div>
            <div className="bg-primary-50 p-6 text-sm text-primary-400 font-bold">
              อดใจรอแป๊บนึงนะ เดี๋ยวเราก็กลับมาเปิดแล้ว!
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-500 text-white p-6 sticky top-0 z-[60] shadow-[0_10px_30px_rgba(132,204,22,0.2)] rounded-b-[2.5rem]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-inner animate-float">
                🥗
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">อร่อยจัง<span className="text-primary-200">!</span></h1>
                <p className="text-xs font-bold text-primary-100 uppercase tracking-widest">{activeTab === 'menu' ? 'Delicious Food Service' : 'Track Your Deliciousness'}</p>
              </div>
            </div>
            {activeTab === 'menu' && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-all hover:scale-110 active:scale-90 cart-button-target"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[96px] z-50">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
              activeTab === 'menu'
                ? 'text-primary-600 border-b-4 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 hover:text-primary-400 hover:bg-gray-50'
            }`}
          >
            <Home size={20} className={activeTab === 'menu' ? 'animate-bounce' : ''} />
            เมนูอาหาร
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
              activeTab === 'tracking'
                ? 'text-primary-600 border-b-4 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 hover:text-primary-400 hover:bg-gray-50'
            }`}
          >
            <Package size={20} className={activeTab === 'tracking' ? 'animate-bounce' : ''} />
            ติดตามออเดอร์
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 min-h-[60vh]">
        {activeTab === 'tracking' ? (
          /* หน้าติดตามออเดอร์ */
          <div className="space-y-4 animate-scale-in">
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              กลับไปหน้าเมนูอาหาร
            </button>
            <OrderTracker orders={orders} />
          </div>
        ) : (
          /* หน้าเมนู */
          <>
            {/* หมวดหมู่ */}
            <div className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white scale-105 shadow-primary-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <span>🍽️</span>
                <span className="font-medium">ทั้งหมด</span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white scale-105 shadow-primary-200'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* แสดงตะกร้า หรือ checkout หรือเมนู */}
            {showCheckout ? (
              <div className="relative animate-scale-in">
                {isSubmitting && (
                  <div className="absolute inset-0 bg-white/50 z-20 flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary-700 font-black text-xl animate-bounce">กำลังส่งคำสั่งซื้อ...</p>
                  </div>
                )}
                <CheckoutForm
                  cartItems={cart}
                  total={cartTotal}
                  onSubmit={handleCheckout}
                  onCancel={() => !isSubmitting && setShowCheckout(false)}
                  settings={settings}
                />
              </div>
            ) : showCart ? (
              <div className="space-y-6 animate-scale-in">
                <button
                  onClick={() => setShowCart(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <ArrowLeft size={20} />
                  กลับไปหน้าเมนูอาหาร
                </button>
                <Cart
                  items={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  total={cartTotal}
                />
                {cart.length > 0 && (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                  >
                    ดำเนินการสั่งซื้อ ฿{cartTotal}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="stagger-item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <MenuItem item={item} onAdd={addToCart} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ปุ่มตะกร้าลอย */}
      {activeTab === 'menu' && !showCart && !showCheckout && cart.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-4xl mx-auto z-40 animate-bounce-subtle">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-5 rounded-[2rem] bg-primary-500 text-white font-black text-lg shadow-[0_20px_50px_rgba(132,204,22,0.3)] hover:bg-primary-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <ShoppingCart size={24} />
            </div>
            ดูตะกร้า ({cart.reduce((sum, item) => sum + item.quantity, 0)} รายการ)
            <span className="bg-white text-primary-600 px-3 py-1 rounded-full ml-2">฿{cartTotal}</span>
          </button>
        </div>
      )}

      {/* แจ้งเตือนสำเร็จ */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 text-center max-w-sm w-full animate-scale-in border-8 border-primary-100">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="text-primary-600" size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">สั่งซื้อสำเร็จแล้วจ้า!</h3>
            <p className="text-gray-600 font-medium">ขอบคุณที่อุดหนุนนะครับ <br/>เราจะรีบทำอาหารให้ด่วนที่สุดเลย!</p>
            <button
               onClick={() => {
                 setShowSuccess(false);
                 setActiveTab('tracking');
               }}
               className="mt-6 w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all active:scale-95"
            >
              ไปดูสถานะออเดอร์กันเลย
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;
