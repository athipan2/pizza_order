import { useState, useEffect } from 'react';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/ProductManager';
import SalesHistory from './pages/SalesHistory';
import { initialMenuItems } from './data/menu';
import { googleSheetsApi } from './utils/googleSheets';
import { formatDriveUrl } from './utils/imageUtils';

function App() {
  const [adminView, setAdminView] = useState('dashboard'); // dashboard | orders | products | sales
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(initialMenuItems);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // ติดตามออเดอร์ที่กำลังบันทึก
  const [isUpdatingProducts, setIsUpdatingProducts] = useState(false); // สำหรับ Product Manager

  // ตรวจสอบ URL path เพื่อกำหนดว่าเป็นหน้าแอดมินหรือลูกค้า
  const isAdminPage = window.location.pathname.startsWith('/admin');

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [fetchedProducts, fetchedOrders] = await Promise.all([
        googleSheetsApi.getProducts(),
        googleSheetsApi.getOrders()
      ]);

      let hasError = false;

      // จัดการข้อมูลสินค้า
      if (fetchedProducts) {
        if (fetchedProducts.status === 'error') {
          console.error("Products API error:", fetchedProducts.message);
          hasError = true;
        } else {
          const pList = Array.isArray(fetchedProducts) ? fetchedProducts : (fetchedProducts.data || []);
          if (Array.isArray(pList)) {
            const sanitizedProducts = pList.map(p => ({
              ...p,
              id: p.id.toString(),
              price: Number(p.price),
              image: formatDriveUrl(p.image)
            }));
            setProducts(sanitizedProducts);
          }
        }
      }

      // จัดการข้อมูลออเดอร์
      if (fetchedOrders) {
        if (fetchedOrders.status === 'error') {
          console.error("Orders API error:", fetchedOrders.message);
          hasError = true;
        } else {
          const oList = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.data || []);
          if (Array.isArray(oList)) {
            const sanitizedOrders = oList.map(o => {
              let sanitizedPhone = o.phone ? o.phone.toString() : '';
              if (sanitizedPhone.length === 9 && !sanitizedPhone.startsWith('0')) {
                sanitizedPhone = '0' + sanitizedPhone;
              }

              // ตรวจสอบว่ามีพิกัดที่ซ่อนอยู่ใน key อื่นหรือไม่ (กรณี header ใน Sheets ไม่ตรง)
              let location = o.location;
              if (!location && o[""]) {
                const coordRegex = /^-?\d+\.\d+,\s?-?\d+\.\d+$/;
                if (coordRegex.test(o[""])) {
                  location = o[""];
                }
              }

              return {
                ...o,
                id: o.id.toString(),
                phone: sanitizedPhone,
                total: Number(o.total),
                location: location,
                cartItems: Array.isArray(o.cartItems) ? o.cartItems : (typeof o.cartItems === 'string' ? JSON.parse(o.cartItems) : [])
              };
            }).sort((a, b) => b.id - a.id);
            setOrders(sanitizedOrders);
            setLastUpdated(new Date());
          }
        }
      }

      if (hasError) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets กรุณาตรวจสอบ Apps Script');
      } else {
        setError(null);
      }

    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      setError('ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ Apps Script URL');
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
    setUpdatingOrders(prev => new Set(prev).add(orderId.toString()));

    // 3. อัปเดต UI ทันที (Optimistic Update)
    setOrders(prev =>
      prev.map(order =>
        order.id.toString() === orderId.toString() ? { ...order, status: newStatus } : order
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
        next.delete(orderId.toString());
        return next;
      });
    }
  };

  // จัดการสินค้า
  const handleAddProduct = async (product) => {
    const oldProducts = [...products];
    setIsUpdatingProducts(true);
    setProducts(prev => [...prev, product]);
    try {
      await googleSheetsApi.addProduct(product);
    } catch (error) {
      console.error('Failed to add product to Google Sheets:', error);
      alert('ไม่สามารถเพิ่มสินค้าได้: ' + error.message);
      setProducts(oldProducts);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false); // รีเฟรชข้อมูลล่าสุด
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    const oldProducts = [...products];
    setIsUpdatingProducts(true);
    const productId = updatedProduct.id.toString();
    setProducts(prev =>
      prev.map(p => p.id.toString() === productId ? updatedProduct : p)
    );
    try {
      await googleSheetsApi.updateProduct(updatedProduct);
    } catch (error) {
      console.error('Failed to update product to Google Sheets:', error);
      alert('ไม่สามารถแก้ไขสินค้าได้: ' + error.message);
      setProducts(oldProducts);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const oldProducts = [...products];
    setIsUpdatingProducts(true);
    const idStr = productId.toString();
    setProducts(prev => prev.filter(p => p.id.toString() !== idStr));
    try {
      await googleSheetsApi.deleteProduct(productId);
    } catch (error) {
      console.error('Failed to delete product from Google Sheets:', error);
      alert('ไม่สามารถลบสินค้าได้: ' + error.message);
      setProducts(oldProducts);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
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
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium animate-pulse sticky top-0 z-[60] flex items-center justify-center gap-2">
          <span>⚠️ {error}</span>
          <button
            onClick={() => fetchData()}
            className="underline hover:no-underline ml-2"
          >
            ลองใหม่
          </button>
        </div>
      )}
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
              isUpdating={isUpdatingProducts}
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
