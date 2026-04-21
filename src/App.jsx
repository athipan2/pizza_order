import { useState } from 'react';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/ProductManager';
import SalesHistory from './pages/SalesHistory';
import { initialMenuItems } from './data/menu';

function App() {
  const [adminView, setAdminView] = useState('dashboard'); // dashboard | orders | products | sales
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(initialMenuItems);

  // ตรวจสอบ URL path เพื่อกำหนดว่าเป็นหน้าแอดมินหรือลูกค้า
  const isAdminPage = window.location.pathname.startsWith('/admin');

  const handleAddOrder = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // จัดการสินค้า
  const handleAddProduct = (product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // นำทางแอดมิน
  const navigateAdmin = (view) => {
    setAdminView(view);
  };

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
