# 🍕 Order Pizza App

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fathipan2%2Foder_pizza)

แอปพลิเคชันสั่งอาหารออนไลน์ (เน้นพิซซ่าและส้มตำ) ที่มาพร้อมกับระบบจัดการสำหรับร้านค้า (Admin Dashboard) พัฒนาด้วย React และ Vite

## ✨ คุณสมบัติ (Features)

### 🛒 สำหรับลูกค้า (Customer Side)
- **เลือกดูเมนูอาหาร:** แบ่งหมวดหมู่ชัดเจน (พิซซ่า, ส้มตำ, เครื่องดื่ม)
- **ระบบตะกร้าสินค้า:** เพิ่ม/ลด จำนวนสินค้า และคำนวณยอดรวมอัตโนมัติ
- **ระบบสั่งซื้อ:** กรอกข้อมูลผู้รับ เลือกวิธีการรับสินค้า (รับที่ร้าน/เดลิเวอรี่) และวิธีการชำระเงิน
- **แจ้งชำระเงิน:** รองรับการเลือกไฟล์สลิปการโอนเงิน

### 🧑‍💼 สำหรับแอดมิน (Admin Side)
- **แดชบอร์ดสรุปผล:** ดูยอดขายวันนี้, จำนวนออเดอร์ และสถานะต่างๆ
- **จัดการออเดอร์:** ดูรายละเอียดการสั่งซื้อ และอัปเดตสถานะ (รอชำระเงิน, กำลังทำ, ส่งแล้ว, เสร็จสิ้น)
- **จัดการสินค้า:** เพิ่ม แก้ไข และลบเมนูอาหารในร้าน
- **ประวัติการขาย:** ดูสรุปยอดขายแยกตามวัน

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### การติดตั้ง

1. คลอน Repository:
   ```bash
   git clone https://github.com/athipan2/oder_pizza.git
   ```

2. เข้าไปยังโฟลเดอร์โปรเจกต์:
   ```bash
   cd oder_pizza
   ```

3. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

4. รันโปรเจกต์ (Development Mode):
   ```bash
   npm run dev
   ```

### การเข้าใช้งานหน้า Admin
- เข้าไปที่ URL: `http://localhost:5173/admin` (หรือ path `/admin` บน production)

## 📦 การ Deploy

สามารถกดปุ่ม **Deploy to Vercel** ด้านบน หรือใช้คำสั่ง:
```bash
npm run build
```
แล้วนำโฟลเดอร์ `dist` ไปใช้งาน

---
พัฒนาโดย [athipan2](https://github.com/athipan2)
