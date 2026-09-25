import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async register(username, email, password) {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  async registerDriver(username, email, password) {
    const response = await api.post('/auth/register-driver', { username, email, password });
    return response.data;
  },

  async validateToken() {
    const response = await api.get('/auth/validate');
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};
