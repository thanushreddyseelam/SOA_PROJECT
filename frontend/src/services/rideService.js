import api from './api';

export const rideService = {
  async bookRide(rideRequest) {
    const response = await api.post('/rides', rideRequest);
    return response.data;
  },

  async getRide(rideId) {
    const response = await api.get(`/rides/${rideId}`);
    return response.data;
  },

  async getRidesByRider(riderId) {
    const response = await api.get(`/rides/rider/${riderId}`);
    return response.data;
  },

  async getRidesByDriver(driverId) {
    const response = await api.get(`/rides/driver/${driverId}`);
    return response.data;
  },

  async acceptRide(rideId, driverId) {
    const url = driverId ? `/rides/${rideId}/accept?driverId=${driverId}` : `/rides/${rideId}/accept`;
    const response = await api.put(url);
    return response.data;
  },

  async driverArrived(rideId) {
    const response = await api.put(`/rides/${rideId}/arrived`);
    return response.data;
  },

  async startRide(rideId) {
    const response = await api.put(`/rides/${rideId}/start`);
    return response.data;
  },

  async completeRide(rideId) {
    const response = await api.put(`/rides/${rideId}/complete`);
    return response.data;
  },

  async cancelRide(rideId) {
    const response = await api.put(`/rides/${rideId}/cancel`);
    return response.data;
  }
};
