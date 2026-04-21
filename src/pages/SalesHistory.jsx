import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

function SalesHistory({ orders, onBack }) {
  // วันนี้
  const today = new Date().toDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  // จัดกลุ่มออเดอร์ตามวันที่
  const dailyStats = useMemo(() => {
    const grouped = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toDateString(); // ใช้สำหรับเปรียบเทียบ
      const dateLabel = orderDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          dateLabel,
          orders: [],
          totalSales: 0,
          orderCount: 0,
          dateObj: orderDate
        };
      }
      
      grouped[dateKey].orders.push(order);
      grouped[dateKey].totalSales += order.total;
      grouped[dateKey].orderCount += 1;
    });
    
    return grouped;
  }, [orders]);

  // รายการวันที่มีข้อมูล เรียงจากใหม่ไปเก่า
  const availableDates = useMemo(() => {
    return Object.entries(dailyStats)
      .sort((a, b) => b[1].dateObj - a[1].dateObj)
      .map(([key]) => key);
  }, [dailyStats]);

  // ข้อมูลวันที่เลือก
  const currentDayData = dailyStats[selectedDate] || {
    dateLabel: new Date(selectedDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }),
    orders: [],
    totalSales: 0,
    orderCount: 0
  };

  // นำทางไปวันก่อน/ถัดไป
  const goToPreviousDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToNextDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  const isToday = selectedDate === today;

  // คำนวณยอดรวมทั้งหมด (ทุกวัน)
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averagePerDay = availableDates.length > 0 ? totalRevenue / availableDates.length : 0;

  // คำนวณยอดขายสะสมถึงวันที่เลือก
  const cumulativeRevenue = useMemo(() => {
    let sum = 0;
    for (const date of availableDates) {
      const dateObj = new Date(date);
      const selectedObj = new Date(selectedDate);
      if (dateObj <= selectedObj) {
        sum += dailyStats[date]?.totalSales || 0;
      }
    }
    return sum;
  }, [availableDates, dailyStats, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-primary-600 rounded-full hover:bg-primary-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">📊 ประวัติยอดขาย</h1>
              <p className="text-sm text-primary-200">ยอดขายแยกตามวัน</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* ตัวเลือกวันที่ */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">กำลังดูยอดขายวัน</p>
              <p className="text-lg font-bold text-gray-900">{currentDayData.dateLabel}</p>
              {isToday && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">วันนี้</span>}
            </div>
            
            <button
              onClick={goToNextDay}
              disabled={availableDates.indexOf(selectedDate) <= 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {!isToday && (
            <button
              onClick={goToToday}
              className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
            >
              <RotateCcw size={16} />
              กลับไปวันนี้
            </button>
          )}
        </div>

        {/* สรุปยอดรวมของวันที่เลือก */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">ยอดขายวันนี้</p>
                <p className="text-xl font-bold text-gray-900">฿{currentDayData.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <ShoppingBag className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">จำนวนออเดอร์</p>
                <p className="text-xl font-bold text-gray-900">{currentDayData.orderCount} รายการ</p>
              </div>
            </div>
          </div>
        </div>

        {/* สรุปรวมทุกวัน (แสดงเล็กๆ ด้านล่าง) */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500 text-center">
            ยอดขายสะสมถึงวันนี้: <span className="font-bold text-gray-900">฿{cumulativeRevenue.toLocaleString()}</span>
            <span className="mx-2">|</span>
            ยอดรวมทั้งหมด: <span className="font-bold text-gray-900">฿{totalRevenue.toLocaleString()}</span>
            <span className="mx-2">|</span>
            {availableDates.length} วัน
          </p>
        </div>

        {/* รายการออเดอร์ของวันที่เลือก */}
        {currentDayData.orderCount === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">ไม่มีออเดอร์ในวันนี้</p>
            <p className="text-sm text-gray-400 mt-1">เลือกวันอื่นเพื่อดูยอดขาย</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                รายการออเดอร์ ({currentDayData.orderCount} รายการ)
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {currentDayData.orders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        ออเดอร์ #{order.id.toString().slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.name} · {order.cartItems.length} รายการ
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">฿{order.total.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                        order.status === 'รอชำระเงิน' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'ชำระแล้ว' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SalesHistory;
