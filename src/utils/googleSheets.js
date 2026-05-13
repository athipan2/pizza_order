const API_URL = 'https://script.google.com/macros/s/AKfycbyR9D_VPNB4Gyd7Hh65mkmVLfAoYvhVpUrBlVrzuM2bWB2Kouhf_E8k5d6QeUno1m5D/exec';

export const googleSheetsApi = {
  async getProducts() {
    try {
      const response = await fetch(`${API_URL}?action=getProducts&_=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async addProduct(product) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addProduct',
          ...product,
          id: product.id.toString(),
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(product) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateProduct',
          ...product,
          id: product.id.toString(),
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteProduct',
          id: productId.toString()
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async addOrder(order) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addOrder',
          ...order,
          id: order.id.toString()
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  async getOrders() {
    try {
      const response = await fetch(`${API_URL}?action=getOrders&_=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          id: orderId.toString(),
          status
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getSettings() {
    try {
      const response = await fetch(`${API_URL}?action=getSettings&_=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  async updateSettings(settings) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateSettings',
          ...settings,
          isShopOpen: settings.isShopOpen !== undefined ? settings.isShopOpen : true
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);
      return result;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};
