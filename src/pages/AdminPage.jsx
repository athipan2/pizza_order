import { ArrowLeft, ChevronDown } from 'lucide-react';
import { OrderStatus } from '../types';

const statusOptions = [
  { value: OrderStatus.PENDING_PAYMENT, label: '⏳ รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
  { value: OrderStatus.PAID, label: '✅ ชำระแล้ว', color: 'bg-blue-100 text-blue-700' },
  { value: OrderStatus.PREPARING, label: '👨‍🍳 กำลังทำ', color: 'bg-orange-100 text-orange-700' },
  { value: OrderStatus.DELIVERED, label: '🚚 ส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
  { value: OrderStatus.COMPLETED, label: '✨ เสร็จสิ้น', color: 'bg-green-100 text-green-700' }
];

function AdminPage({ orders, onUpdateStatus, onBack }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-primary-600 rounded-full hover:bg-primary-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">🧑‍💼 หน้าจอแอดมิน</h1>
                <p className="text-sm text-primary-200">จัดการออเดอร์ทั้งหมด</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{orders.length}</span>
              <p className="text-xs text-primary-200">ออเดอร์</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีออเดอร์</h3>
            <p className="text-gray-500">รอลูกค้าสั่งซื้อ...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* ส่วนหัวออเดอร์ */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">ออเดอร์ #{order.id.toString().slice(-6)}</span>
                      <p className="text-sm text-gray-400">{order.createdAt}</p>
                    </div>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className={`appearance-none px-3 py-1.5 rounded-lg font-medium text-sm pr-8 cursor-pointer ${
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

                {/* ข้อมูลลูกค้า */}
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    👤 ข้อมูลลูกค้า
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">ชื่อ:</span> {order.name}</p>
                    <p><span className="text-gray-500">โทร:</span> {order.phone}</p>
                    <p>
                      <span className="text-gray-500">รับสินค้า:</span>{' '}
                      <span className="inline-flex items-center gap-1">
                        {order.deliveryMethod === 'เดลิเวอรี่' ? '🚚' : '🏪'} {order.deliveryMethod}
                      </span>
                    </p>
                    {order.deliveryMethod === 'เดลิเวอรี่' && (
                      <p><span className="text-gray-500">ที่อยู่:</span> {order.address}</p>
                    )}
                  </div>
                </div>

                {/* รายการสินค้า */}
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🍽️ รายการสินค้า
                  </h4>
                  <div className="space-y-2">
                    {order.cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.image}</span>
                          <span>{item.name}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">฿{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* การชำระเงิน */}
                <div className="p-4 bg-primary-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">วิธีชำระเงิน</span>
                    <span className="font-medium text-sm flex items-center gap-1">
                      {order.paymentMethod === 'สแกน QR PromptPay' && '💳'}
                      {order.paymentMethod === 'โอนบัญชี' && '🏦'}
                      {order.paymentMethod === 'เก็บเงินปลายทาง' && '💰'}
                      {order.paymentMethod}
                    </span>
                  </div>
                  {order.slipFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">สลิป:</span>
                      <span className="text-primary-600 bg-primary-100 px-2 py-1 rounded">{order.slipFile.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-200">
                    <span className="font-semibold text-gray-700">ยอดรวม</span>
                    <span className="text-xl font-bold text-primary-700">฿{order.total}</span>
                  </div>
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
