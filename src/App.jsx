import { useState, useEffect } from 'react';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/ProductManager';
import SalesHistory from './pages/SalesHistory';
import { initialMenuItems } from './data/menu';
import { googleSheetsApi } from './utils/googleSheets';

function App() {
  const [adminView, setAdminView] = useState('dashboard'); // dashboard | orders | products | sales
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(initialMenuItems);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // ติดตามออเดอร์ที่กำลังบันทึก

  // ตรวจสอบ URL path เพื่อกำหนดว่าเป็นหน้าแอดมินหรือลูกค้า
  const isAdminPage = window.location.pathname.startsWith('/admin');

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [fetchedProducts, fetchedOrders] = await Promise.all([
        googleSheetsApi.getProducts().catch(err => { console.error("Products API error:", err); return null; }),
        googleSheetsApi.getOrders().catch(err => { console.error("Orders API error:", err); return null; })
      ]);

      // จัดการข้อมูลสินค้า
      if (fetchedProducts) {
        const pList = Array.isArray(fetchedProducts) ? fetchedProducts : (fetchedProducts.data || []);
        if (Array.isArray(pList) && pList.length > 0) {
          const sanitizedProducts = pList.map(p => ({
            ...p,
            id: Number(p.id),
            price: Number(p.price)
          }));
          setProducts(sanitizedProducts);
        }
      }

      // จัดการข้อมูลออเดอร์
      if (fetchedOrders) {
        // ตรวจสอบว่ามีข้อมูลออเดอร์จริงๆ หรือไม่ (ไม่ใช่ error object หรือ empty error response)
        const oList = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.data || null);

        if (Array.isArray(oList) && oList.length > 0) {
          const sanitizedOrders = oList.map(o => {
            // ตรวจสอบเบอร์โทรศัพท์ (ถ้า 0 นำหน้าหายไปใน Sheets จะเหลือ 9 หลัก)
            let sanitizedPhone = o.phone ? o.phone.toString() : '';
            if (sanitizedPhone.length === 9 && !sanitizedPhone.startsWith('0')) {
              sanitizedPhone = '0' + sanitizedPhone;
            }

            return {
              ...o,
              id: Number(o.id),
              phone: sanitizedPhone,
              total: Number(o.total),
              cartItems: Array.isArray(o.cartItems) ? o.cartItems : (typeof o.cartItems === 'string' ? JSON.parse(o.cartItems) : [])
            };
          }).sort((a, b) => b.id - a.id);
          setOrders(sanitizedOrders);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // ดึงข้อมูลเริ่มต้น
  useEffect(() => {
    fetchData();

    // ตั้งเวลาดึงข้อมูลอัตโนมัติ
    // หน้าแอดมินทุก 2 นาที
    // หน้าลูกค้าทุก 3 วินาที เพื่อติดตามสถานะออเดอร์เรียลไทม์
    const interval = setInterval(() => {
      fetchData(false);
    }, isAdminPage ? 120000 : 3000);

    return () => clearInterval(interval);
  }, [isAdminPage]);

  const handleAddOrder = async (order) => {
    setOrders(prev => [order, ...prev]);
    try {
      await googleSheetsApi.addOrder(order);
    } catch (error) {
      console.error('Failed to sync order to Google Sheets:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // 1. เก็บสถานะเดิมไว้ก่อน (เพื่อใช้ Rollback ถ้าบันทึกไม่สำเร็จ)
    const oldOrders = [...orders];

    // 2. แสดงสถานะกำลังบันทึก
    setUpdatingOrders(prev => new Set(prev).add(orderId));

    // 3. อัปเดต UI ทันที (Optimistic Update)
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      // 4. ส่งข้อมูลไปที่ Google Sheets
      await googleSheetsApi.updateOrderStatus(orderId, newStatus);
      console.log(`Successfully updated order ${orderId} to ${newStatus}`);
    } catch (error) {
      // 5. หากพลาด ให้แจ้งเตือนและย้อนกลับ (Rollback)
      console.error('Failed to update status to Google Sheets:', error);
      alert(`⚠️ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}\n\nกรุณาตรวจสอบว่าได้อัปเดต Google Apps Script เป็นเวอร์ชันล่าสุดแล้ว`);
      setOrders(oldOrders);
    } finally {
      // 6. ยกเลิกสถานะกำลังบันทึก
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  // จัดการสินค้า
  const handleAddProduct = async (product) => {
    setProducts(prev => [...prev, product]);
    try {
      await googleSheetsApi.addProduct(product);
    } catch (error) {
      console.error('Failed to add product to Google Sheets:', error);
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    try {
      await googleSheetsApi.updateProduct(updatedProduct);
    } catch (error) {
      console.error('Failed to update product to Google Sheets:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await googleSheetsApi.deleteProduct(productId);
    } catch (error) {
      console.error('Failed to delete product from Google Sheets:', error);
    }
  };

  // นำทางแอดมิน
  const navigateAdmin = (view) => {
    setAdminView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-primary-600 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {!isAdminPage ? (
        <CustomerPage onAddOrder={handleAddOrder} products={products} orders={orders} />
      ) : (
        <>
          {adminView === 'dashboard' && (
            <AdminDashboard
              orders={orders}
              products={products}
              onNavigate={navigateAdmin}
              onRefresh={() => fetchData(false)}
              isRefreshing={isRefreshing}
            />
          )}
          {adminView === 'orders' && (
            <AdminPage
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
              onBack={() => setAdminView('dashboard')}
              updatingOrders={updatingOrders}
            />
          )}
          {adminView === 'products' && (
            <ProductManager
              products={products}
              onAdd={handleAddProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onBack={() => setAdminView('dashboard')}
            />
          )}
          {adminView === 'sales' && (
            <SalesHistory
              orders={orders}
              onBack={() => setAdminView('dashboard')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
