import api from './api';

export const driverService = {
  async getAllDrivers() {
    const response = await api.get('/drivers');
    return response.data;
  },

  async getAvailableDrivers() {
    const response = await api.get('/drivers/available');
    return response.data;
  },

  async getDriverById(driverId) {
    const response = await api.get(`/drivers/${driverId}`);
    return response.data;
  },

  async findNearestDriver(latitude, longitude) {
    const response = await api.get(`/drivers/nearest?latitude=${latitude}&longitude=${longitude}`);
    return response.data;
  },

  async updateAvailability(driverId, isAvailable) {
    const response = await api.put(`/drivers/${driverId}/availability`, { availability: isAvailable });
    return response.data;
  },

  async updateLocation(driverId, latitude, longitude) {
    const response = await api.put(`/drivers/${driverId}/location`, { latitude, longitude });
    return response.data;
  },

  async updateStatus(driverId, status) {
    const response = await api.put(`/drivers/${driverId}/status`, { status });
    return response.data;
  },

  async updateProfile(driverId, profileData) {
    const response = await api.put(`/drivers/${driverId}/profile`, profileData);
    return response.data;
  }
};
