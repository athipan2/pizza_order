const API_URL = 'https://script.google.com/macros/s/AKfycby8OBQceiLO3dzzWh5IGP3jnSAg8dAH55OgApUsyWNH6bXJCBXhrq5rYGdDyFgh5Npf/exec';

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
          id: product.id.toString() // Ensure ID is string
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
          id: product.id.toString() // Ensure ID is string
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
      console.log('Deleting product ID:', productId);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteProduct',
          id: productId.toString() // Ensure ID is string
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
          id: order.id.toString() // Ensure ID is string
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
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
      console.log(`Updating order ${orderId} status to: ${status}`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          id: orderId.toString(), // Ensure ID is string
          status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update result:', result);

      if (result.status === 'error') {
        throw new Error(result.message || 'Unknown error from Google Sheets');
      }

      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};
