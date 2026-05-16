import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown, RefreshCw, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { OrderStatus } from '../types';
import EmptyState from '../components/EmptyState';

const statusOptions = [
  { value: OrderStatus.PENDING_PAYMENT, label: '⏳ รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
  { value: OrderStatus.PAID, label: '✅ ชำระแล้ว', color: 'bg-blue-100 text-blue-700' },
  { value: OrderStatus.PREPARING, label: '👨‍🍳 กำลังทำ', color: 'bg-orange-100 text-orange-700' },
  { value: OrderStatus.DELIVERED, label: '🚚 ส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
  { value: OrderStatus.COMPLETED, label: '✨ เสร็จสิ้น', color: 'bg-green-100 text-green-700' }
];

function AdminPage({ orders, onUpdateStatus, onBack, updatingOrders = new Set() }) {
  // จัดกลุ่มออเดอร์ตามวัน
  const groupedOrders = useMemo(() => {
    const groups = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj: date,
          items: []
        };
      }
      groups[dateKey].items.push(order);
    });

    // เรียงลำดับวันที่จากใหม่ไปเก่า
    return Object.entries(groups)
      .sort((a, b) => b[1].dateObj - a[1].dateObj);
  }, [orders]);

  const getDateLabel = (dateObj) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) return "วันนี้";
    if (dateObj.toDateString() === yesterday.toDateString()) return "เมื่อวานนี้";

    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary-600 text-white p-6 sticky top-0 z-20 shadow-lg rounded-b-[2.5rem]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-all active:scale-90"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight">จัดการออเดอร์</h1>
                <p className="text-xs font-bold text-primary-100 uppercase tracking-widest opacity-80">Order Management</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{orders.length}</span>
              <p className="text-xs text-primary-200">ออเดอร์</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 animate-scale-in">
        {orders.length === 0 ? (
          <EmptyState
            type="orders"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16"
          />
        ) : (
          <div className="space-y-8">
            {groupedOrders.map(([dateKey, group]) => (
              <div key={dateKey} className="space-y-4">
                {/* วันที่ Header */}
                <div className="flex items-center gap-2 sticky top-[72px] z-[5] bg-gray-100 py-2">
                  <div className="bg-primary-100 text-primary-700 p-1.5 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <h2 className="font-bold text-gray-800 text-lg">
                    {getDateLabel(group.dateObj)}
                  </h2>
                  <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-200">
                    {group.items.length} ออเดอร์
                  </span>
                  <div className="flex-1 h-px bg-gray-200 ml-2"></div>
                </div>

                <div className="space-y-4">
                  {group.items.map((order) => (
                    <div key={order.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-gray-50 hover:border-primary-100 transition-all group">
                      {/* ส่วนหัวออเดอร์ */}
                      <div className="p-6 border-b-4 border-gray-50 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-primary-600 uppercase tracking-widest">ออเดอร์ #{order.id.toString().slice(-6)}</span>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {updatingOrders.has(order.id.toString()) && (
                              <div className="flex items-center gap-1 text-xs text-primary-600 font-medium animate-pulse">
                                <RefreshCw size={12} className="animate-spin" />
                                กำลังบันทึก...
                              </div>
                            )}
                            <div className="relative group/select">
                              <select
                                value={order.status}
                                disabled={updatingOrders.has(order.id.toString())}
                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                className={`appearance-none px-4 py-2.5 rounded-2xl font-black text-sm pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 ${
                                  statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {statusOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ข้อมูลลูกค้า */}
                      <div className="p-4 border-b border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          👤 ข้อมูลลูกค้า
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">ชื่อ:</span> {order.name}</p>
                          <p><span className="text-gray-500">โทร:</span> {order.phone}</p>
                    {order.remark && (
                      <p className="bg-orange-50 p-2 rounded-lg border border-orange-100 mt-2">
                        <span className="text-orange-700 font-bold">📝 หมายเหตุ:</span>{' '}
                        <span className="text-orange-900">{order.remark}</span>
                      </p>
                    )}
                          <p>
                            <span className="text-gray-500">รับสินค้า:</span>{' '}
                            <span className="inline-flex items-center gap-1">
                              {order.deliveryMethod === 'เดลิเวอรี่' ? '🚚' : '🏪'} {order.deliveryMethod}
                            </span>
                          </p>
                          {order.deliveryMethod === 'เดลิเวอรี่' && (
                            <>
                              <p><span className="text-gray-500">ที่อยู่:</span> {order.address}</p>
                              {order.location && (
                                <div className="mt-3 space-y-2">
                                  <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      frameBorder="0"
                                      scrolling="no"
                                      marginHeight="0"
                                      marginWidth="0"
                                      src={`https://maps.google.com/maps?q=${order.location}&z=15&output=embed`}
                                    ></iframe>
                                  </div>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${order.location}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
                                  >
                                    <MapPin size={18} />
                                    เปิดแผนที่นำทางไปยังลูกค้า
                                    <ExternalLink size={16} />
                                  </a>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* รายการสินค้า */}
                      <div className="p-6 border-b-4 border-gray-50 bg-white">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          🍽️ รายการสินค้า
                        </h4>
                        <div className="space-y-2">
                          {order.cartItems.map((item) => {
                            const isEmoji = item.image && item.image.length <= 4;
                            return (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-100">
                                    {isEmoji ? (
                                      <span className="text-lg">{item.image}</span>
                                    ) : (
                                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <span className="font-medium text-gray-800">{item.name}</span>
                                  <span className="text-gray-500">x{item.quantity}</span>
                                </div>
                                <span className="font-medium">฿{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* การชำระเงิน */}
                      <div className="p-6 bg-primary-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm font-medium">วิธีชำระเงิน</span>
                          <span className="font-semibold text-sm flex items-center gap-1 text-primary-700">
                            {order.paymentMethod === 'สแกน QR PromptPay' && '💳'}
                            {order.paymentMethod === 'โอนบัญชี' && '🏦'}
                            {order.paymentMethod === 'เก็บเงินปลายทาง' && '💰'}
                            {order.paymentMethod}
                          </span>
                        </div>
                        {order.slipFile && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">สลิป:</span>
                            <span className="text-primary-600 bg-white px-2 py-0.5 rounded border border-primary-200">{order.slipFile.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-primary-100">
                          <span className="font-black text-gray-700 text-lg">ยอดรวมทั้งสิ้น</span>
                          <span className="text-3xl font-black text-primary-700">฿{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
