import { useState, useEffect, useRef } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, ChefHat, CreditCard, BellRing, X, Cloud, MessageCircle, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { OrderStatus } from '../types';

const Confetti = ({ count = 50 }) => {
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-full animate-confetti ${colors[i % colors.length]}`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

function OrderTracker({ orders, settings, onUpdateLineUserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [isLiffLoading, setIsLiffLoading] = useState(false);
  const [liffError, setLiffError] = useState(null);
  const previousStatuses = useRef({});
  const speechInterval = useRef(null);

  // เริ่มต้นใช้งาน LIFF
  useEffect(() => {
    if (settings?.liffId && window.liff) {
      window.liff.init({ liffId: settings.liffId })
        .then(() => {
          console.log('LIFF initialized');
        })
        .catch((err) => {
          console.error('LIFF initialization failed', err);
        });
    }
  }, [settings?.liffId]);

  const handleLineNotify = async (orderId) => {
    if (!settings?.liffId) {
      alert('ร้านค้ายังไม่ได้ตั้งค่าระบบแจ้งเตือนผ่าน LINE');
      return;
    }

    setIsLiffLoading(true);
    setLiffError(null);

    try {
      if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }

      const profile = await window.liff.getProfile();
      const lineUserId = profile.userId;

      if (lineUserId) {
        await onUpdateLineUserId(orderId, lineUserId);
        alert('ลงทะเบียนรับการแจ้งเตือนสำเร็จ! ระบบจะแจ้งเตือนเมื่อสถานะออเดอร์เปลี่ยน');
      }
    } catch (err) {
      console.error('LIFF Error:', err);
      setLiffError('ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLiffLoading(false);
    }
  };

  // ระบบเล่นเสียงแจ้งเตือนวนซ้ำ
  useEffect(() => {
    if (activeNotifications.length > 0) {
      const playSpeech = () => {
        if ('speechSynthesis' in window) {
          // หยุดเสียงเก่าก่อน
          window.speechSynthesis.cancel();

          activeNotifications.forEach(order => {
            const itemNames = order.cartItems.map(i => i.name).join(', ');
            const utterance = new SpeechSynthesisUtterance(`ออเดอร์ ${itemNames} รอรับของได้เลย`);
            utterance.lang = 'th-TH';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          });
        }
      };

      // เล่นทันทีครั้งแรก
      playSpeech();

      // วนซ้ำทุก 5 วินาที
      speechInterval.current = setInterval(playSpeech, 5000);
    } else {
      if (speechInterval.current) {
        clearInterval(speechInterval.current);
        speechInterval.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (speechInterval.current) clearInterval(speechInterval.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [activeNotifications]);

  // อัปเดตผลการค้นหาเมื่อข้อมูลออเดอร์จากเซิร์ฟเวอร์เปลี่ยน
  useEffect(() => {
    if (hasSearched && searchQuery) {
      const searchPhone = searchQuery.replace(/-/g, '');
      const normalizedSearchPhone = searchPhone.length === 9 ? '0' + searchPhone : searchPhone;

      const foundOrders = orders.filter(order => {
        const orderPhone = order.phone.toString().replace(/-/g, '');
        const normalizedOrderPhone = orderPhone.length === 9 ? '0' + orderPhone : orderPhone;
        return normalizedOrderPhone === normalizedSearchPhone && order.status !== OrderStatus.COMPLETED;
      });

      // ตรวจสอบการเปลี่ยนสถานะเพื่อแจ้งเตือน
      foundOrders.forEach(order => {
        const prevStatus = previousStatuses.current[order.id];
        if (prevStatus && prevStatus !== order.status && order.status === OrderStatus.DELIVERED) {
          // ตรวจสอบว่าไม่มีในรายการแจ้งเตือนเดิมอยู่แล้ว
          setActiveNotifications(prev => {
            if (prev.find(n => n.id === order.id)) return prev;
            return [...prev, order];
          });
        }
        previousStatuses.current[order.id] = order.status;
      });

      setSearchResult(foundOrders);
    }
  }, [orders, hasSearched, searchQuery]);

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

      return normalizedOrderPhone === normalizedSearchPhone && order.status !== OrderStatus.COMPLETED;
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

  const getStatusIcon = (status, isCurrent) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return <CreditCard size={20} className={isCurrent ? "animate-bounce" : ""} />;
      case OrderStatus.PAID:
        return <CheckCircle size={20} className={isCurrent ? "scale-110" : ""} />;
      case OrderStatus.PREPARING:
        return (
          <div className="relative">
            {isCurrent && (
              <>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-3 bg-white/40 rounded-full animate-steam" style={{ animationDelay: '0s' }} />
                <div className="absolute -top-3 left-1/4 -translate-x-1/2 w-1 h-2 bg-white/30 rounded-full animate-steam" style={{ animationDelay: '0.5s' }} />
                <div className="absolute -top-3 left-3/4 -translate-x-1/2 w-1 h-2 bg-white/30 rounded-full animate-steam" style={{ animationDelay: '1s' }} />
              </>
            )}
            <ChefHat size={20} className={isCurrent ? "animate-float" : ""} />
          </div>
        );
      case OrderStatus.DELIVERED:
        return (
          <div className="relative">
            {isCurrent && (
              <>
                <Cloud size={10} className="absolute -top-2 -right-3 text-white/40 animate-cloud" style={{ animationDelay: '0s' }} />
                <Cloud size={8} className="absolute top-1 -right-4 text-white/30 animate-cloud" style={{ animationDelay: '1.5s' }} />
              </>
            )}
            <Truck size={20} className={isCurrent ? "animate-drive" : ""} />
          </div>
        );
      case OrderStatus.COMPLETED:
        return <Package size={20} className={isCurrent ? "animate-bounce" : ""} />;
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
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white overflow-hidden relative transition-all duration-500">
      {/* แจ้งเตือนสถานะ - ปรับเป็น fixed เพื่อให้เห็นชัดเจนทุกที่ */}
      {activeNotifications.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
          <Confetti count={100} />
          <div className="bg-orange-500/90 backdrop-blur-xl text-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(251,146,60,0.5)] max-w-md w-full border border-white/30 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-white text-orange-500 p-6 rounded-full shadow-[0_20px_40px_rgba(255,255,255,0.3)] border-4 border-orange-100">
                <BellRing size={56} className="animate-ring" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">อาหารมาส่งแล้ว!</h3>
                <p className="text-orange-50 font-medium text-lg">กรุณาเตรียมรอรับสินค้า</p>
              </div>

              <div className="w-full bg-white/15 backdrop-blur-sm rounded-[24px] p-5 space-y-4 border border-white/10 shadow-inner">
                {activeNotifications.map(order => (
                  <div key={order.id} className="text-left border-b border-white/10 last:border-0 pb-3 last:pb-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">ออเดอร์ #{order.id.toString().slice(-6)}</p>
                    <p className="font-bold text-lg leading-tight">{order.cartItems.map(i => i.name).join(', ')}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveNotifications([])}
                className="w-full py-5 bg-white text-orange-600 font-black text-2xl rounded-2xl shadow-2xl hover:bg-orange-50 active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(255,255,255,0.4)]"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-primary-400/20 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <h2 className="font-black text-2xl flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Package size={28} />
            </div>
            ติดตามสถานะออเดอร์
          </h2>
          <p className="text-sm text-primary-100 mt-1 font-medium opacity-90">ค้นหาด้วยเบอร์โทรศัพท์ของคุณ</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="p-6 space-y-4">
        {/* ช่องค้นหาเบอร์โทร */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
          <input
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 outline-none text-lg font-medium transition-all bg-gray-50/50"
            required
            inputMode="numeric"
            pattern="[0-9]{10}"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-primary-500 text-white font-black text-lg shadow-[0_10px_20px_-5px_rgba(var(--color-primary-500),0.4)] hover:shadow-[0_15px_30px_-5px_rgba(var(--color-primary-500),0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 min-h-[56px]"
        >
          <Search size={24} />
          ค้นหาออเดอร์
        </button>
      </form>

      {/* ผลการค้นหา */}
      {hasSearched && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          <div className="p-3 bg-white/40 backdrop-blur-sm flex items-center justify-center gap-3 border-b border-gray-100">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">อัปเดตสถานะอัตโนมัติ (เรียลไทม์)</span>
          </div>
          {searchResult && searchResult.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto px-4 py-4 space-y-6">
              <div className="p-3 bg-primary-50/50 backdrop-blur-sm border border-primary-100 rounded-2xl">
                <p className="text-primary-700 text-sm font-bold text-center">
                  ✨ พบข้อมูลทั้งหมด {searchResult.length} ออเดอร์
                </p>
              </div>
              
              {searchResult.map((order) => {
                const currentStep = getStatusStep(order.status);
                
                return (
                  <div key={order.id} className="bg-white rounded-[32px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                    {/* หัวออเดอร์ */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">ORDER</span>
                           <p className="text-sm font-black text-gray-900 tracking-tight">#{order.id.toString().slice(-6)}</p>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(order.createdAt).toLocaleString('th-TH', {
                            day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-2xl text-[11px] font-black shadow-sm tracking-wide ${getStatusColor(order.status, true)}`}>
                        {order.status === OrderStatus.DELIVERED ? 'กำลังจัดส่ง' : order.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="relative mb-8">
                      {/* เส้นเชื่อม */}
                      <div className="absolute left-[20px] top-6 bottom-6 w-1 bg-gray-100 rounded-full" />
                      
                      {/* Steps */}
                      <div className="space-y-6">
                        {statusSteps.map((step, index) => {
                          const isActive = index <= currentStep;
                          const isCurrent = index === currentStep;
                          
                          return (
                            <div key={step.status} className="flex items-start gap-5 relative group">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-700 shadow-sm ${
                                isActive ? `${getStatusColor(step.status, true)} shadow-lg` : 'bg-gray-100 text-gray-300'
                              } ${isCurrent ? 'ring-8 ring-primary-500/10 scale-110' : ''}`}>
                                <div>
                                  {getStatusIcon(step.status, isCurrent)}
                                </div>
                              </div>
                              <div className="flex-1 pt-0.5">
                                <div className="flex items-center gap-2">
                                  <p className={`font-black text-sm transition-colors duration-500 ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                                    {step.label}
                                  </p>
                                  {isCurrent && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-primary-100 text-primary-700 uppercase tracking-wider animate-bounce">
                                      NOW
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[11px] font-medium transition-colors duration-500 ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
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

                    {/* ปุ่มรับการแจ้งเตือน LINE */}
                    {!order.lineUserId && settings?.liffId && settings?.showLineNotify !== false && (
                      <div className="mt-4 space-y-2">
                        {settings?.lineOaId && (
                          <a
                            href={`https://line.me/R/ti/p/${settings.lineOaId.startsWith('@') ? settings.lineOaId : '@' + settings.lineOaId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-white text-[#06C755] border-2 border-[#06C755] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-all active:scale-95"
                          >
                            <UserPlus size={18} />
                            เพิ่มเพื่อนเพื่อรับแจ้งเตือน
                          </a>
                        )}
                        <button
                          onClick={() => handleLineNotify(order.id)}
                          disabled={isLiffLoading}
                          className="w-full py-3 px-4 bg-[#06C755] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#05b14c] transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isLiffLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <MessageCircle size={18} />
                          )}
                          รับการแจ้งเตือนผ่าน LINE
                        </button>
                        <p className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1 px-4">
                          <AlertCircle size={10} className="flex-shrink-0" />
                          <span>กรุณา<b>เพิ่มเพื่อน</b>ก่อน แล้วค่อยกด<b>รับการแจ้งเตือน</b>นะครับ</span>
                        </p>
                      </div>
                    )}

                    {order.lineUserId && (
                      <div className="mt-4 py-2 px-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">
                          เปิดการแจ้งเตือน LINE แล้ว
                        </span>
                      </div>
                    )}

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
