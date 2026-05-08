export const initialMenuItems = [
  {
    id: "1",
    name: "พิซซ่าฮาวายเอี้ยน",
    price: 299,
    priceM: 399,
    priceL: 499,
    category: "pizza",
    description: "แฮม สับปะรด ชีส mozzarella",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"
  },
  {
    id: "2",
    name: "พิซซ่าซีฟู้ด",
    price: 349,
    priceM: 449,
    priceL: 549,
    category: "pizza",
    description: "กุ้ง ปู ปลาหมึก ชีส mozzarella",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
  },
  {
    id: "3",
    name: "พิซซ่าหมูพีเปอร์โรนี",
    price: 279,
    priceM: 379,
    priceL: 479,
    category: "pizza",
    description: "พีเปอร์โรนี ชีส mozzarella",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400"
  },
  {
    id: "4",
    name: "ส้มตำไทย",
    price: 79,
    category: "sontam",
    description: "ส้มตำรสชาติจัดจ้าน ถั่วฝักยาว มะเขือเทศ",
    image: "https://images.unsplash.com/photo-1563275605-550b94dbb6f4?w=400"
  },
  {
    id: "5",
    name: "ส้มตำปูปลาร้า",
    price: 89,
    category: "sontam",
    description: "ปูสด ปลาร้า รสแซ่บ",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
  },
  {
    id: "6",
    name: "ตำหมูยอ",
    price: 85,
    category: "sontam",
    description: "หมูยอแน่นๆ รสเด็ด",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"
  },
  {
    id: "7",
    name: "ไข่ต้ม",
    price: 20,
    category: "sontam",
    description: "ไข่ต้มสดๆ คู่กับส้มตำ",
    image: "https://images.unsplash.com/photo-1511426420268-4a7a9d7d8cbf?w=400"
  },
  {
    id: "8",
    name: "น้ำอัดลม",
    price: 25,
    category: "drink",
    description: "โค้ก เป๊ปซี่ แฟนต้า",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400"
  },
  {
    id: "9",
    name: "น้ำเปล่า",
    price: 15,
    category: "drink",
    description: "น้ำดื่มสะอาด",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"
  },
  {
    id: "10",
    name: "ชาเย็น",
    price: 40,
    category: "drink",
    description: "ชารสเข้มข้น หวานมัน",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"
  }
];

// For backward compatibility
export const menuItems = initialMenuItems;

export const categories = [
  { id: "all", name: "ทั้งหมด", icon: "🍽️" },
  { id: "pizza", name: "พิซซ่า", icon: "🍕" },
  { id: "sontam", name: "ส้มตำ", icon: "🥗" },
  { id: "drink", name: "เครื่องดื่ม", icon: "🥤" },
  { id: "others", name: "อื่นๆ", icon: "📦" }
];

export const categoryOptions = [
  { value: "pizza", label: "🍕 พิซซ่า" },
  { value: "sontam", label: "🥗 ส้มตำ" },
  { value: "drink", label: "🥤 เครื่องดื่ม" },
  { value: "others", label: "📦 อื่นๆ" }
];
