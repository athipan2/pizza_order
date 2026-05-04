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
  MapPin
} from 'lucide-react';
import { OrderStatus } from '../types';

function AdminDashboard({ orders, products, onNavigate, onRefresh, isRefreshing }) {
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
      title: 'ออเดอร์ทั้งหมด', 
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
      trend: `${products.filter(p => p.category === 'pizza').length} พิซซ่า`
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
      <header className="bg-primary-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🧑‍💼 แดชบอร์ดแอดมิน</h1>
            <p className="text-sm text-primary-200">ภาพรวมร้านอาหาร</p>
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

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`p-4 rounded-xl border-2 text-left hover:shadow-md transition-all ${link.color}`}
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-primary-500" />
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
                      <p className="text-xs text-gray-400 mt-1">{order.createdAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
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
