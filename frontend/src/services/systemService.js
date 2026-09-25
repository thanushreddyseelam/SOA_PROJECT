import api, { API_BASE_URL } from './api';
import axios from 'axios';

export const systemService = {
  async checkGatewayHealth() {
    try {
      const res = await axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 3000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  async checkEurekaHealth() {
    try {
      const res = await axios.get('http://localhost:8761/actuator/health', { timeout: 3000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  async checkAuthServiceHealth() {
    try {
      // Testing auth public endpoint availability through gateway
      await axios.post(`${API_BASE_URL}/auth/login`, {}, { timeout: 3000 });
      return true;
    } catch (err) {
      // 400 Bad Request or 401 Unauthorized means service responded and is UP!
      if (err.response && err.response.status < 500) return true;
      return false;
    }
  },

  async checkDriverServiceHealth() {
    try {
      const res = await api.get('/drivers/available', { timeout: 3000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  async checkRideServiceHealth() {
    try {
      await api.get('/rides/1', { timeout: 3000 });
      return true;
    } catch (err) {
      // 404 Not Found means service is UP and actively handling requests!
      if (err.response && (err.response.status === 200 || err.response.status === 404)) return true;
      return false;
    }
  },

  async checkPaymentServiceHealth() {
    try {
      await api.get('/payments/1', { timeout: 3000 });
      return true;
    } catch (err) {
      // 404 Not Found or 200 OK means payment service is UP!
      if (err.response && (err.response.status === 200 || err.response.status === 404)) return true;
      return false;
    }
  },

  async getGatewayRoutes() {
    try {
      const res = await axios.get(`${API_BASE_URL}/actuator/gateway/routes`, { timeout: 3000 });
      return res.data;
    } catch {
      return [];
    }
  }
};
