import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getOrderQueue() {
    const response = await api.get('/orders/queue');
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  async getCustomerOrders() {
    const response = await api.get('/customer/orders');
    return response.data;
  },

  async getOrderDetails(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};