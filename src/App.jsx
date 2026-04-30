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
        const oList = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.data || []);
        if (Array.isArray(oList)) {
          const sanitizedOrders = oList.map(o => ({
            ...o,
            id: Number(o.id),
            total: Number(o.total),
            cartItems: Array.isArray(o.cartItems) ? o.cartItems : (typeof o.cartItems === 'string' ? JSON.parse(o.cartItems) : [])
          })).sort((a, b) => b.id - a.id);
          setOrders(sanitizedOrders);
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

    // ตั้งเวลาดึงข้อมูลอัตโนมัติทุก 2 นาทีสำหรับหน้าแอดมิน
    let interval;
    if (isAdminPage) {
      interval = setInterval(() => {
        fetchData(false);
      }, 120000);
    }

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
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    try {
      await googleSheetsApi.updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update status to Google Sheets:', error);
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
