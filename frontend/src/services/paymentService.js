import api from './api';

export const paymentService = {
  async getPaymentById(paymentId) {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  async getPaymentByRideId(rideId) {
    const response = await api.get(`/payments/ride/${rideId}`);
    return response.data;
  },

  async getPaymentsByRiderId(riderId) {
    const response = await api.get(`/payments/rider/${riderId}`);
    return response.data;
  },

  async refundPayment(paymentId) {
    const response = await api.put(`/payments/${paymentId}/refund`);
    return response.data;
  }
};
