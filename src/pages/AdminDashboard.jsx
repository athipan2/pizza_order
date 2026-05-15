import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Users,
  ChevronRight,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  MapPin,
  Store,
  Power,
  AlertTriangle
} from 'lucide-react';
import { OrderStatus } from '../types';

function AdminDashboard({ orders, products, settings, onNavigate, onRefresh, onToggleShop, isRefreshing }) {
  // คำนวณสถิติ
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING_PAYMENT).length;
  const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING).length;
  
  // ออเดอร์ล่าสุด 5 รายการ
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { 
      title: 'ยอดขายวันนี้', 
      value: `฿${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'bg-green-500',
      trend: '+12%'
    },
    { 
      title: 'ออเดอร์วันนี้',
      value: totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-primary-500',
      trend: `${pendingOrders} รอชำระ`
    },
    { 
      title: 'สินค้าในร้าน', 
      value: products.length, 
      icon: Package, 
      color: 'bg-blue-500',
      trend: `${products.filter(p => p.category === 'others').length} อื่นๆ`
    },
    { 
      title: 'กำลังทำ', 
      value: preparingOrders, 
      icon: Clock, 
      color: 'bg-orange-500',
      trend: 'ออเดอร์'
    },
  ];

  const quickLinks = [
    { 
      id: 'orders', 
      title: '📋 จัดการออเดอร์', 
      desc: 'ดูและอัปเดตสถานะออเดอร์',
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'products', 
      title: '📦 จัดการสินค้า', 
      desc: 'เพิ่ม แก้ไข เมนูอาหาร',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'settings',
      title: '⚙️ ตั้งค่าร้านค้า',
      desc: 'ตั้งค่าบัญชีธนาคารและ QR Code',
      color: 'bg-purple-50 border-purple-200'
    },
    { 
      id: 'sales', 
      title: '📊 ประวัติยอดขาย', 
      desc: 'ดูยอดขายแยกตามวัน',
      color: 'bg-green-50 border-green-200',
      icon: BarChart3
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.PAID: return 'bg-blue-100 text-blue-700';
      case OrderStatus.PREPARING: return 'bg-orange-100 text-orange-700';
      case OrderStatus.DELIVERED: return 'bg-purple-100 text-purple-700';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white p-6 sticky top-0 z-10 shadow-lg rounded-b-[2rem]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
               👨‍🍳
             </div>
             <div>
              <h1 className="text-2xl font-black">ระบบจัดการร้าน</h1>
              <p className="text-xs font-bold text-primary-100 uppercase tracking-widest opacity-80">Admin Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-50"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <a
              href="/"
              className="text-sm text-primary-100 hover:text-white transition-colors flex items-center gap-1"
            >
              🛒 ไปหน้าร้านค้า →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8 animate-scale-in">
        {/* Shop Status Control */}
        <div className={`rounded-[2.5rem] p-6 sm:p-8 shadow-xl border-4 transition-all ${
          settings.isShopOpen
            ? 'bg-white border-primary-100'
            : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                settings.isShopOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Store size={32} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  สถานะร้านค้า:
                  <span className={settings.isShopOpen ? 'text-green-600' : 'text-red-600'}>
                    {settings.isShopOpen ? 'เปิดให้บริการ' : 'ปิดร้านชั่วคราว'}
                  </span>
                </h2>
                <p className="text-sm text-gray-500">
                  {settings.isShopOpen
                    ? 'ลูกค้าสามารถเลือกดูเมนูและสั่งอาหารได้ตามปกติ'
                    : 'ลูกค้าจะเห็นป้ายแจ้งเตือนร้านปิดและไม่สามารถสั่งอาหารได้'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`ต้องการ${settings.isShopOpen ? 'ปิดร้าน' : 'เปิดร้าน'}ใช่หรือไม่?`)) {
                  onToggleShop();
                }
              }}
              disabled={isRefreshing}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                settings.isShopOpen
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Power size={20} />
              {settings.isShopOpen ? 'กดเพื่อปิดร้าน' : 'กดเพื่อเปิดร้าน'}
            </button>
          </div>
          {!settings.isShopOpen && (
            <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-100/50 p-3 rounded-lg text-sm border border-red-200">
              <AlertTriangle size={16} />
              <span>ขณะนี้ระบบถูกตั้งค่าเป็นปิดร้าน ลูกค้าจะไม่สามารถทำรายการสั่งซื้อได้</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-[2rem] p-6 shadow-lg border-2 border-gray-50 hover:border-primary-200 hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
                  <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`p-6 rounded-[2rem] border-4 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group ${link.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{link.desc}</p>
                </div>
                <ChevronRight className="text-gray-400" size={24} />
              </div>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-gray-50 overflow-hidden">
          <div className="p-6 border-b-4 border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                <Clock size={24} />
              </div>
              ออเดอร์ล่าสุด
            </h2>
            <button
              onClick={() => onNavigate('orders')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ดูทั้งหมด →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={48} className="mx-auto mb-2 text-gray-300" />
              <p>ยังไม่มีออเดอร์</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🍽️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.name}</p>
                      <p className="text-sm text-gray-500">
                        {order.cartItems.length} รายการ · ฿{order.total}
                      </p>
                      {order.remark && (
                        <p className="text-xs text-orange-600 font-medium truncate max-w-[200px]">
                          📝 {order.remark}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        title="ดูแผนที่จุดส่ง"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin size={20} />
                      </a>
                    )}
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Users size={120} />
           </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-semibold">💡 เคล็ดลับการใช้งาน</h3>
              <p className="text-sm text-primary-100">
                ตรวจสอบออเดอร์ใหม่ทุก ๆ 15 นาที และอัปเดตสถานะให้ลูกค้าทราบ
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
