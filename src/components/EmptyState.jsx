import React from 'react';
import { ShoppingCart, Search, PackageOpen, Inbox, History, ChefHat } from 'lucide-react';

const EmptyState = ({
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  className = ""
}) => {

  const presets = {
    cart: {
      icon: ShoppingCart,
      title: 'ตะกร้าของคุณว่างเปล่าจ้า',
      description: 'หิวแล้วใช่มั้ย? เลือกเมนูอร่อยๆ ใส่ตะกร้าได้เลย!',
      animation: 'animate-levitate',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    search: {
      icon: Search,
      title: 'หาไม่เจอเลยครับผม',
      description: 'ลองค้นหาด้วยคำอื่นดูอีกทีนะ หรือตรวจสอบตัวสะกดดูครับ',
      animation: 'animate-morph',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    orders: {
      icon: Inbox,
      title: 'ยังไม่มีออเดอร์เลยครับ',
      description: 'รอกดรับออเดอร์ใหม่ๆ ได้เลย เดี๋ยวก็มา!',
      animation: 'animate-swing',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    products: {
      icon: PackageOpen,
      title: 'ยังไม่มีสินค้าเลย',
      description: 'เริ่มเพิ่มเมนูอร่อยๆ ให้ลูกค้าได้เลือกชิมกันเลย!',
      animation: 'animate-levitate',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    sales: {
      icon: History,
      title: 'ยังไม่มีประวัติการขาย',
      description: 'สู้ๆ นะครับเชฟ! วันนี้ยังอีกยาวไกล ยอดปังแน่นอน',
      animation: 'animate-float',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    default: {
      icon: ChefHat,
      title: 'ไม่พบข้อมูล',
      description: 'ดูเหมือนว่าข้อมูลที่คุณมองหาจะหายไปชั่วคราวครับ',
      animation: 'animate-pulse-subtle',
      color: 'text-gray-400',
      bgColor: 'bg-gray-50'
    }
  };

  const config = presets[type] || presets.default;
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center animate-scale-in ${className}`}>
      <div className={`relative mb-8 p-8 rounded-[3rem] ${config.bgColor} border-4 border-white shadow-xl overflow-hidden group`}>
        {/* Background blobs for depth */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 bg-white/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-16 h-16 bg-white/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

        <div className={`${config.animation} relative z-10`}>
          <Icon size={80} className={`${config.color} drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)]`} />
        </div>
      </div>

      <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
        {title || config.title}
      </h3>
      <p className="text-gray-500 font-medium max-w-[280px] mx-auto leading-relaxed mb-8">
        {description || config.description}
      </p>

      {action && (
        <div className="animate-bounce-subtle">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
