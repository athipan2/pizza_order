import { useState } from 'react';
import { ShoppingCart, CheckCircle, Package, Home, ArrowLeft } from 'lucide-react';
import { categories } from '../data/menu';
import { OrderStatus } from '../types';
import MenuItem from '../components/MenuItem';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import OrderTracker from '../components/OrderTracker';

function CustomerPage({ onAddOrder, products, orders }) {
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
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + addQty }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: addQty }];
    });
    setShowCart(true);
  };

  const updateQuantity = (itemId, change) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = (orderData) => {
    const order = {
      id: Date.now(),
      ...orderData,
      status: OrderStatus.PENDING_PAYMENT,
      createdAt: new Date().toLocaleString('th-TH')
    };
    onAddOrder(order);
    setCart([]);
    setShowCheckout(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-primary-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🍽️ ร้านอาหารอร่อยใกล้บ้าน</h1>
              <p className="text-sm text-primary-100">{activeTab === 'menu' ? 'พิซซ่า | ส้มตำ | เครื่องดื่ม' : 'ติดตามสถานะออเดอร์ของคุณ'}</p>
            </div>
            {activeTab === 'menu' && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors"
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
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'menu'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home size={20} />
            เมนูอาหาร
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'tracking'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={20} />
            ติดตามออเดอร์
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        {activeTab === 'tracking' ? (
          /* หน้าติดตามออเดอร์ */
          <div className="space-y-4">
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
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* แสดงตะกร้า หรือ checkout หรือเมนู */}
            {showCheckout ? (
              <CheckoutForm
                cartItems={cart}
                total={cartTotal}
                onSubmit={handleCheckout}
                onCancel={() => setShowCheckout(false)}
              />
            ) : showCart ? (
              <div className="space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <MenuItem key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ปุ่มตะกร้าลอย */}
      {activeTab === 'menu' && !showCart && !showCheckout && cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-4xl mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-4 rounded-2xl bg-primary-500 text-white font-bold shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={24} />
            ดูตะกร้า ({cart.reduce((sum, item) => sum + item.quantity, 0)} รายการ)
            <span className="ml-2">฿{cartTotal}</span>
          </button>
        </div>
      )}

      {/* แจ้งเตือนสำเร็จ */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccess(false)} />
          <div className="bg-white rounded-2xl p-6 shadow-2xl relative z-10 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สั่งซื้อสำเร็จ!</h3>
            <p className="text-gray-600">ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการให้เร็วที่สุด</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;
