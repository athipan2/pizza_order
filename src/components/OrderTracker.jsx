import { useState, useEffect, useRef } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, ChefHat, CreditCard, BellRing, X } from 'lucide-react';
import { OrderStatus } from '../types';

function OrderTracker({ orders }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [notification, setNotification] = useState(null);
  const previousStatuses = useRef({});

  // อัปเดตผลการค้นหาเมื่อข้อมูลออเดอร์จากเซิร์ฟเวอร์เปลี่ยน
  useEffect(() => {
    if (hasSearched && searchQuery) {
      const searchPhone = searchQuery.replace(/-/g, '');
      const normalizedSearchPhone = searchPhone.length === 9 ? '0' + searchPhone : searchPhone;

      const foundOrders = orders.filter(order => {
        const orderPhone = order.phone.toString().replace(/-/g, '');
        const normalizedOrderPhone = orderPhone.length === 9 ? '0' + orderPhone : orderPhone;
        return normalizedOrderPhone === normalizedSearchPhone;
      });

      // ตรวจสอบการเปลี่ยนสถานะเพื่อแจ้งเตือน
      foundOrders.forEach(order => {
        const prevStatus = previousStatuses.current[order.id];
        if (prevStatus && prevStatus !== order.status && order.status === OrderStatus.DELIVERED) {
          triggerNotification(order);
        }
        previousStatuses.current[order.id] = order.status;
      });

      setSearchResult(foundOrders);
    }
  }, [orders, hasSearched, searchQuery]);

  const triggerNotification = (order) => {
    // แสดง UI แจ้งเตือน
    setNotification(`ออเดอร์ #${order.id.toString().slice(-6)} กำลังจัดส่ง`);

    // เล่นเสียงแจ้งเตือน (Text-to-Speech)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('รอรับของได้เลย');
      utterance.lang = 'th-TH';
      window.speechSynthesis.speak(utterance);
    }

    // หายไปเองหลัง 10 วินาที
    setTimeout(() => setNotification(null), 10000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    
    // ค้นหาด้วยเบอร์โทรเท่านั้น (ค้นหาหลายออเดอร์ได้)
    const foundOrders = orders.filter(order => {
      const orderPhone = order.phone.toString().replace(/-/g, '');
      const searchPhone = searchQuery.replace(/-/g, '');

      // ถ้าเบอร์ในระบบมี 9 หลัก (กรณีเลข 0 นำหน้าหาย) ให้เติม 0 ข้างหน้าก่อนเทียบ
      const normalizedOrderPhone = orderPhone.length === 9 ? '0' + orderPhone : orderPhone;
      const normalizedSearchPhone = searchPhone.length === 9 ? '0' + searchPhone : searchPhone;

      return normalizedOrderPhone === normalizedSearchPhone;
    });
    
    setSearchResult(foundOrders);
  };

  const getStatusStep = (status) => {
    const steps = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.PREPARING,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED
    ];
    return steps.indexOf(status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return <CreditCard size={20} />;
      case OrderStatus.PAID: return <CheckCircle size={20} />;
      case OrderStatus.PREPARING: return <ChefHat size={20} />;
      case OrderStatus.DELIVERED: return <Truck size={20} />;
      case OrderStatus.COMPLETED: return <Package size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return 'bg-gray-200 text-gray-400';
    
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return 'bg-yellow-500 text-white';
      case OrderStatus.PAID: return 'bg-blue-500 text-white';
      case OrderStatus.PREPARING: return 'bg-orange-500 text-white';
      case OrderStatus.DELIVERED: return 'bg-purple-500 text-white';
      case OrderStatus.COMPLETED: return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const statusSteps = [
    { status: OrderStatus.PENDING_PAYMENT, label: 'รอชำระเงิน', desc: 'กรุณาชำระเงิน' },
    { status: OrderStatus.PAID, label: 'ชำระแล้ว', desc: 'รอร้านยืนยัน' },
    { status: OrderStatus.PREPARING, label: 'กำลังทำ', desc: 'กำลังปรุงอาหาร' },
    { status: OrderStatus.DELIVERED, label: 'กำลังจัดส่ง', desc: 'อยู่ระหว่างจัดส่ง' },
    { status: OrderStatus.COMPLETED, label: 'เสร็จสิ้น', desc: 'ออเดอร์สำเร็จ' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden relative">
      {/* แจ้งเตือนสถานะ - ปรับเป็น fixed เพื่อให้เห็นชัดเจนทุกที่ */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-[9999] animate-bounce max-w-md mx-auto">
          <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white">
            <div className="flex items-center gap-3">
              <div className="bg-white text-orange-500 p-2.5 rounded-full shadow-inner">
                <BellRing size={24} className="animate-ring" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">รอรับของได้เลย!</p>
                <p className="text-sm opacity-90">{notification}</p>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-primary-500 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Package size={24} />
          ติดตามสถานะออเดอร์
        </h2>
        <p className="text-sm text-primary-100">ค้นหาด้วยเบอร์โทรศัพท์</p>
      </div>

      <form onSubmit={handleSearch} className="p-4 space-y-4">
        {/* ช่องค้นหาเบอร์โทร */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-base"
            required
            inputMode="numeric"
            pattern="[0-9]{10}"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 sm:py-3 rounded-xl bg-primary-500 text-white font-medium active:bg-primary-600 transition-colors flex items-center justify-center gap-2 text-base min-h-[48px]"
        >
          <Search size={20} />
          ค้นหา
        </button>
      </form>

      {/* ผลการค้นหา */}
      {hasSearched && (
        <div className="border-t border-gray-100">
          <div className="p-2 bg-gray-50 flex items-center justify-center gap-2 border-b border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-gray-400">อัปเดตสถานะอัตโนมัติ (เรียลไทม์)</span>
          </div>
          {searchResult && searchResult.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="p-3 bg-green-50 border-b border-green-100">
                <p className="text-green-700 text-sm text-center">
                  พบ {searchResult.length} ออเดอร์
                </p>
              </div>
              
              {searchResult.map((order) => {
                const currentStep = getStatusStep(order.status);
                
                return (
                  <div key={order.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    {/* หัวออเดอร์ */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">ออเดอร์ #{order.id.toString().slice(-6)}</p>
                        <p className="text-xs text-gray-400">{order.createdAt}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status, true)}`}>
                        {order.status === OrderStatus.DELIVERED ? 'กำลังจัดส่ง' : order.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                      {/* เส้นเชื่อม */}
                      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
                      
                      {/* Steps */}
                      <div className="space-y-4">
                        {statusSteps.map((step, index) => {
                          const isActive = index <= currentStep;
                          const isCurrent = index === currentStep;
                          
                          return (
                            <div key={step.status} className="flex items-start gap-4 relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 ${
                                isActive ? getStatusColor(step.status, true) : 'bg-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-opacity-30 ring-primary-300 scale-110' : ''}`}>
                                <div className={isCurrent ? 'animate-pulse' : ''}>
                                  {getStatusIcon(step.status)}
                                </div>
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`font-medium text-sm transition-colors duration-500 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {step.label}
                                  {isCurrent && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 animate-pulse">
                                      กำลังดำเนินการ
                                    </span>
                                  )}
                                </p>
                                <p className={`text-xs ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {step.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* รายละเอียดสินค้า */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">รายการสินค้า:</p>
                      <div className="space-y-1">
                        {order.cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-gray-900">฿{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">ยอดรวม</span>
                        <span className="font-bold text-primary-600">฿{order.total}</span>
                      </div>
                    </div>

                    {/* ข้อมูลจัดส่ง */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">วิธีรับสินค้า: {order.deliveryMethod}</p>
                      {order.deliveryMethod === 'เดลิเวอรี่' && (
                        <p className="text-xs text-gray-600">{order.address}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-700 mb-1">ไม่พบออเดอร์</h3>
              <p className="text-sm text-gray-500">
                ไม่พบออเดอร์ที่ใช้เบอร์โทรศัพท์นี้
              </p>
              <p className="text-xs text-gray-400 mt-2">
                ตรวจสอบเบอร์โทรศัพท์อีกครั้งหรือติดต่อร้านค้า
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderTracker;
