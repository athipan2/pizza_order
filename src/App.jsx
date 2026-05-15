import { useState, useEffect, useRef, useMemo } from 'react';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/ProductManager';
import SalesHistory from './pages/SalesHistory';
import ShopSettings from './pages/ShopSettings';
import { initialMenuItems, categories as initialCategories } from './data/menu';
import { googleSheetsApi } from './utils/googleSheets';
import { formatDriveUrl } from './utils/imageUtils';
import { playNotificationSound, startNotificationLoop, stopNotificationLoop } from './utils/audio';
import NewOrderPopup from './components/admin/NewOrderPopup';
import { OrderStatus } from './types';

function App() {
  const [adminView, setAdminView] = useState('dashboard'); // dashboard | orders | products | sales | settings
  const [orders, setOrders] = useState([]);

  const { todayOrders, pastOrders } = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayList = [];
    const pastList = [];

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toDateString();
      if (orderDate === todayStr) {
        todayList.push(order);
      } else {
        pastList.push(order);
      }
    });

    return { todayOrders: todayList, pastOrders: pastList };
  }, [orders]);

  const [products, setProducts] = useState(initialMenuItems);
  const [categories, setCategories] = useState(initialCategories);
  const [settings, setSettings] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    qrCode: '',
    isShopOpen: true,
    lineChannelAccessToken: '',
    lineOaId: '',
    liffId: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // ติดตามออเดอร์ที่กำลังบันทึก
  const [isUpdatingProducts, setIsUpdatingProducts] = useState(false); // สำหรับ Product Manager
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const prevOrdersCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // ตรวจสอบ URL path เพื่อกำหนดว่าเป็นหน้าแอดมินหรือลูกค้า
  const isAdminPage = window.location.pathname.startsWith('/admin');

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // Use Promise.allSettled for settings/categories to prevent blocking products/orders if they fail
      const [productsRes, ordersRes, settingsRes, categoriesRes] = await Promise.allSettled([
        googleSheetsApi.getProducts(),
        googleSheetsApi.getOrders(),
        googleSheetsApi.getSettings(),
        googleSheetsApi.getCategories()
      ]);

      const fetchedProducts = productsRes.status === 'fulfilled' ? productsRes.value : null;
      const fetchedOrders = ordersRes.status === 'fulfilled' ? ordersRes.value : null;
      const fetchedSettings = settingsRes.status === 'fulfilled' ? settingsRes.value : null;
      const fetchedCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : null;

      if (productsRes.status === 'rejected') console.error("Failed to fetch products:", productsRes.reason);
      if (ordersRes.status === 'rejected') console.error("Failed to fetch orders:", ordersRes.reason);
      if (settingsRes.status === 'rejected') console.warn("Failed to fetch settings:", settingsRes.reason);
      if (categoriesRes.status === 'rejected') console.warn("Failed to fetch categories:", categoriesRes.reason);

      let hasError = false;

      // จัดการข้อมูลสินค้า
      if (fetchedProducts) {
        if (fetchedProducts.status === 'error') {
          console.error("Products API error:", fetchedProducts.message);
          hasError = true;
        } else {
          const pList = Array.isArray(fetchedProducts) ? fetchedProducts : (fetchedProducts.data || []);
          if (Array.isArray(pList)) {
            const sanitizedProducts = pList.map(p => {
            // ดึงค่าพื้นฐานแบบปกติ
            let id = p.id ? p.id.toString() : Date.now().toString();
            let name = p.name || '';
            let price = Number(p.price || 0);
            let priceM = Number(p.priceM || 0);
            let priceL = Number(p.priceL || 0);
            let category = p.category || '';
            let description = p.description ? p.description.toString() : '';
            let image = p.image || '';
            // ตรรกะตรวจสอบสถานะความพร้อมขาย (ค่าเริ่มต้นเป็น true ถ้าไม่มีข้อมูล)
            // รองรับกรณีชื่อคอลัมน์จาก Google Sheets เพี้ยน (คอลัมน์ที่ 9)
            let rawAvailable = p.isAvailable;
            // ตรวจสอบคอลัมน์ที่ 9 แบบครอบคลุมที่สุด (กรณี Header หายหรือ Sheets คืนค่าเป็นชื่อคอลัมน์)
            const possibleKeys = ['isAvailable', 'column9', 'COLUMN_I', 'COLUMN_9', 'column_9', 'Column9'];
            for (const key of possibleKeys) {
              if (p[key] !== undefined) {
                rawAvailable = p[key];
                break;
              }
            }

            let isAvailable = true;
            // ตรวจสอบค่าที่เป็น "เท็จ" ในทุกรูปแบบที่ Google Sheets อาจส่งมา
            if (rawAvailable !== undefined) {
              const strVal = String(rawAvailable).toLowerCase().trim();
              if (strVal === 'false' || strVal === '0' || rawAvailable === false || rawAvailable === 0) {
                isAvailable = false;
              }
            }

            // --- ระบบกู้คืนข้อมูลกรณีลำดับคอลัมน์เยื้อง (Self-healing logic) ---
            // ใช้ "Hybrid" categories: รวมจากที่ดึงมาได้ และค่ามาตรฐานเดิมเพื่อความปลอดภัย
            const dynamicCategoryIds = Array.isArray(fetchedCategories)
              ? fetchedCategories.map(c => c.id)
              : (fetchedCategories?.data || []).map(c => c.id);

            const validCategories = [...new Set([
              ...dynamicCategoryIds,
              'pizza', 'sontam', 'drink', 'others'
            ])].filter(Boolean);

            // กรณีที่ 1: category ไปอยู่ในช่อง priceM (เยื้องเพราะใช้หัวตาราง 6 คอลัมน์ดั้งเดิม แต่ API ดึงแบบ 8 คอลัมน์)
            // โครงสร้างที่พบจริง: [id, name, price, category, description, image]
            // ถูกแมพเป็น: [id, name, price, priceM, priceL, category, description, image]
            if (validCategories.includes(p.priceM)) {
              category = p.priceM;
              description = (p.priceL || '').toString();
              image = p.category || '';
              priceM = 0;
              priceL = 0;
            }
            // กรณีที่ 2: category ไปอยู่ในช่อง image (เยื้อง 2 ตำแหน่ง)
            else if (validCategories.includes(image)) {
              category = image;
              priceM = Number(p.category || 0);
              priceL = Number(p.description || 0);
              description = (p[""] || p["COLUMN_G"] || p["column7"] || '').toString();
              image = p["image_url"] || p["COLUMN_H"] || p["column8"] || '';
            }
            // กรณีที่ 3: category ไปอยู่ในช่อง description (เยื้อง 1 ตำแหน่ง)
            else if (validCategories.includes(description)) {
              category = description;
              priceM = Number(p.category || 0);
              description = (p.image || '').toString();
              image = p[""] || '';
            }

              return {
                ...p,
              id,
              name,
              price,
              priceM,
              priceL,
              category,
              description,
                image: formatDriveUrl(image),
                isAvailable
              };
            });
            setProducts(sanitizedProducts);
          }
        }
      }

      // จัดการข้อมูลหมวดหมู่
      if (fetchedCategories && fetchedCategories.status !== 'error') {
        const cList = Array.isArray(fetchedCategories) ? fetchedCategories : (fetchedCategories.data || []);
        if (Array.isArray(cList) && cList.length > 0) {
          setCategories(cList);
        }
      }

      // จัดการข้อมูลการตั้งค่า
      if (fetchedSettings && fetchedSettings.status !== 'error') {
        const sData = fetchedSettings.data || fetchedSettings;
        setSettings({
          bankName: sData.bankName || '',
          accountNumber: sData.accountNumber || '',
          accountHolder: sData.accountHolder || '',
          qrCode: formatDriveUrl(sData.qrCode || ''),
          isShopOpen: (sData.isShopOpen === false || sData.isShopOpen === 'FALSE' || sData.isShopOpen === 'false') ? false : true,
          lineChannelAccessToken: sData.lineChannelAccessToken || '',
          lineOaId: sData.lineOaId || '',
          liffId: sData.liffId || ''
        });
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

              // จัดการวันที่ให้ถูกต้อง (รองรับทั้ง ISO และ Thai Locale string ดั้งเดิม)
              let createdAt = o.createdAt;
              try {
                let dateObj = new Date(createdAt);
                // ถ้าเป็น NaN หรือ ปีมากกว่า 2500 (น่าจะเป็นปี พ.ศ. ที่ browser ตีความเป็น ค.ศ.)
                if (isNaN(dateObj.getTime()) || dateObj.getFullYear() > 2500) {
                  // พยายามดึงตัวเลขปีออกมาแล้วลบ 543
                  const yearMatch = createdAt.match(/\b(25|26)\d{2}\b/);
                  if (yearMatch) {
                    const thaiYear = parseInt(yearMatch[0]);
                    const adYear = thaiYear - 543;
                    createdAt = createdAt.replace(yearMatch[0], adYear.toString());
                    dateObj = new Date(createdAt);
                  }
                }
                createdAt = dateObj.toISOString();
              } catch (e) {
                console.error("Date parsing error:", e);
                createdAt = new Date().toISOString();
              }

              return {
                ...o,
                id: o.id.toString(),
                phone: sanitizedPhone,
                total: Number(o.total),
                location: location,
                createdAt: createdAt,
                lineUserId: o.lineUserId || '',
                cartItems: Array.isArray(o.cartItems) ? o.cartItems : (typeof o.cartItems === 'string' ? JSON.parse(o.cartItems) : [])
              };
            }).sort((a, b) => b.id - a.id);
            // ตรวจสอบออเดอร์ใหม่สำหรับแอดมิน
            if (isAdminPage && !isFirstLoadRef.current && sanitizedOrders.length > prevOrdersCountRef.current) {
              // playNotificationSound(); // Remove individual sound in favor of loop
            }

            setOrders(sanitizedOrders);
            prevOrdersCountRef.current = sanitizedOrders.length;
            isFirstLoadRef.current = false;
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
    // หน้าแอดมินทุก 20 วินาที (ปรับจาก 2 นาที เพื่อให้แจ้งเตือนทันใจขึ้น)
    // หน้าลูกค้าทุก 3 วินาที เพื่อติดตามสถานะออเดอร์เรียลไทม์
    const interval = setInterval(() => {
      fetchData(false);
    }, isAdminPage ? 20000 : 3000);

    return () => clearInterval(interval);
  }, [isAdminPage]);

  // ระบบแจ้งเตือนออเดอร์ใหม่ (เสียงวนลูป + Popup) สำหรับแอดมิน
  const unacceptedOrders = useMemo(() => {
    if (!isAdminPage) return [];
    // ออเดอร์ที่ถือว่ายังไม่ได้รับ คือ สถานะ 'รอชำระเงิน' หรือ 'ชำระแล้ว'
    return orders.filter(o =>
      o.status === OrderStatus.PENDING_PAYMENT ||
      o.status === OrderStatus.PAID
    );
  }, [orders, isAdminPage]);

  useEffect(() => {
    if (isAdminPage && unacceptedOrders.length > 0) {
      startNotificationLoop();
      setShowNewOrderPopup(true);
    } else {
      stopNotificationLoop();
      setShowNewOrderPopup(false);
    }

    // Cleanup on unmount or when leaving admin page
    return () => stopNotificationLoop();
  }, [unacceptedOrders.length, isAdminPage]);

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
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddProduct = async (product) => {
    const oldProducts = [...products];
    setIsUpdatingProducts(true);
    setProducts(prev => [...prev, product]);
    try {
      await googleSheetsApi.addProduct(product);
      showSuccess('เพิ่มสินค้าสำเร็จแล้ว');
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
      showSuccess('แก้ไขสินค้าสำเร็จแล้ว');
    } catch (error) {
      console.error('Failed to update product to Google Sheets:', error);
      alert('ไม่สามารถแก้ไขสินค้าได้: ' + error.message);
      setProducts(oldProducts);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  // จัดการหมวดหมู่
  const handleAddCategory = async (category) => {
    const oldCategories = [...categories];
    setIsUpdatingProducts(true);
    setCategories(prev => [...prev, category]);
    try {
      await googleSheetsApi.addCategory(category);
      showSuccess('เพิ่มหมวดหมู่สำเร็จแล้ว');
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('ไม่สามารถเพิ่มหมวดหมู่ได้: ' + error.message);
      setCategories(oldCategories);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const oldCategories = [...categories];
    setIsUpdatingProducts(true);
    const catId = updatedCategory.id.toString();
    setCategories(prev =>
      prev.map(c => c.id.toString() === catId ? updatedCategory : c)
    );
    try {
      await googleSheetsApi.updateCategory(updatedCategory);
      showSuccess('แก้ไขหมวดหมู่สำเร็จแล้ว');
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('ไม่สามารถแก้ไขหมวดหมู่ได้: ' + error.message);
      setCategories(oldCategories);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const oldCategories = [...categories];
    setIsUpdatingProducts(true);
    const idStr = categoryId.toString();
    setCategories(prev => prev.filter(c => c.id.toString() !== idStr));
    try {
      await googleSheetsApi.deleteCategory(categoryId);
      showSuccess('ลบหมวดหมู่สำเร็จแล้ว');
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('ไม่สามารถลบหมวดหมู่ได้: ' + error.message);
      setCategories(oldCategories);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  const handleToggleShopOpen = async () => {
    const newSettings = { ...settings, isShopOpen: !settings.isShopOpen };
    await handleUpdateSettings(newSettings);
  };

  const handleUpdateSettings = async (newSettings) => {
    const oldSettings = { ...settings };
    setIsUpdatingProducts(true); // Reuse product updating state or add new one
    setSettings(newSettings);
    try {
      await googleSheetsApi.updateSettings(newSettings);
      showSuccess('บันทึกการตั้งค่าร้านค้าสำเร็จแล้ว');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('ไม่สามารถบันทึกการตั้งค่าได้: ' + error.message);
      setSettings(oldSettings);
    } finally {
      setIsUpdatingProducts(false);
      fetchData(false);
    }
  };

  const handleToggleAvailability = async (productId) => {
    const idStr = productId.toString();
    const product = products.find(p => p.id.toString() === idStr);
    if (!product) return;

    const newStatus = !product.isAvailable;
    const oldProducts = [...products];

    // 1. อัปเดต UI ทันที (Optimistic Update)
    setProducts(prev =>
      prev.map(p => p.id.toString() === idStr ? { ...p, isAvailable: newStatus } : p)
    );

    setIsUpdatingProducts(true);
    try {
      // 2. ส่งข้อมูลไปที่ Google Sheets
      const updatedProduct = { ...product, isAvailable: newStatus };
      await googleSheetsApi.updateProduct(updatedProduct);
      showSuccess(newStatus ? 'เปิดการขายสินค้าแล้ว' : 'ตั้งค่าเป็นสินค้าหมดแล้ว');
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('ไม่สามารถเปลี่ยนสถานะสินค้าได้: ' + error.message);
      setProducts(oldProducts); // Rollback
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
      showSuccess('ลบสินค้าสำเร็จแล้ว');
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
      {isAdminPage && showNewOrderPopup && unacceptedOrders.length > 0 && (
        <NewOrderPopup
          orders={unacceptedOrders}
          onAccept={(id) => handleUpdateStatus(id, OrderStatus.PREPARING)}
          onDismiss={() => setShowNewOrderPopup(false)}
        />
      )}
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
      {successMessage && (
        <div className="bg-green-500 text-white px-4 py-2 text-center text-sm font-medium sticky top-0 z-[60] shadow-lg animate-in slide-in-from-top duration-300">
          ✅ {successMessage}
        </div>
      )}
      {!isAdminPage ? (
        <CustomerPage
          onAddOrder={handleAddOrder}
          products={products}
          categories={categories}
          orders={orders}
          settings={settings}
        />
      ) : (
        <>
          {adminView === 'dashboard' && (
            <AdminDashboard
              orders={todayOrders}
              products={products}
              settings={settings}
              onNavigate={navigateAdmin}
              onRefresh={() => fetchData(false)}
              onToggleShop={handleToggleShopOpen}
              isRefreshing={isRefreshing}
            />
          )}
          {adminView === 'orders' && (
            <AdminPage
              orders={todayOrders}
              onUpdateStatus={handleUpdateStatus}
              onBack={() => setAdminView('dashboard')}
              updatingOrders={updatingOrders}
            />
          )}
          {adminView === 'products' && (
            <ProductManager
              products={products}
              categories={categories}
              onAdd={handleAddProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleAvailability={handleToggleAvailability}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onBack={() => setAdminView('dashboard')}
              isUpdating={isUpdatingProducts}
            />
          )}
          {adminView === 'sales' && (
            <SalesHistory
              orders={pastOrders}
              onBack={() => setAdminView('dashboard')}
            />
          )}
          {adminView === 'settings' && (
            <ShopSettings
              settings={settings}
              onSave={handleUpdateSettings}
              onBack={() => setAdminView('dashboard')}
              isUpdating={isUpdatingProducts}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
