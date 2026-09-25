/**
 * UrbanGlide — API Gateway Client & Telemetry Bus
 * Communicates with API Gateway on http://localhost:8080
 */

const API_BASE = "http://localhost:8080";

class ApiClient {
  constructor() {
    this.token = localStorage.getItem("urbanglide_token") || null;
    this.currentUser = JSON.parse(localStorage.getItem("urbanglide_user") || "null");
  }

  setAuth(token, user) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem("urbanglide_token", token);
    localStorage.setItem("urbanglide_user", JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem("urbanglide_token");
    localStorage.removeItem("urbanglide_user");
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const method = options.method || "GET";
    const startTime = performance.now();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (this.token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    let status = 0;
    let responseData = null;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      status = response.status;
      const text = await response.text();
      try {
        responseData = text ? JSON.parse(text) : {};
      } catch (e) {
        responseData = { text };
      }

      const duration = Math.round(performance.now() - startTime);

      // Emit event for telemetry console
      if (window.emitTelemetry) {
        window.emitTelemetry({
          timestamp: new Date().toLocaleTimeString(),
          method,
          endpoint,
          status,
          duration
        });
      }

      if (!response.ok) {
        const errorMsg = responseData?.message || responseData?.error || `HTTP ${status}`;
        throw new Error(errorMsg);
      }

      return responseData;
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      if (window.emitTelemetry && status === 0) {
        window.emitTelemetry({
          timestamp: new Date().toLocaleTimeString(),
          method,
          endpoint,
          status: "ERR",
          duration
        });
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async register(username, email, password, role = "RIDER") {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, role })
    });
    if (res.token) {
      this.setAuth(res.token, { username: res.username, role: res.role });
    }
    return res;
  }

  async login(username, password) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      this.setAuth(res.token, { username: res.username, role: res.role });
    }
    return res;
  }

  // --- Driver Fleet Endpoints ---
  async getAvailableDrivers() {
    return await this.request("/drivers/available");
  }

  async findNearestDriver(latitude, longitude) {
    return await this.request(`/drivers/nearest?latitude=${latitude}&longitude=${longitude}`);
  }

  async updateDriverStatus(driverId, status) {
    return await this.request(`/drivers/${driverId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  }

  // --- Ride Dispatch Endpoints ---
  async bookRide(bookingData) {
    return await this.request("/rides", {
      method: "POST",
      body: JSON.stringify(bookingData)
    });
  }

  async getRide(rideId) {
    return await this.request(`/rides/${rideId}`);
  }

  async acceptRide(rideId) {
    return await this.request(`/rides/${rideId}/accept`, { method: "PUT" });
  }

  async driverArrived(rideId) {
    return await this.request(`/rides/${rideId}/arrived`, { method: "PUT" });
  }

  async startRide(rideId) {
    return await this.request(`/rides/${rideId}/start`, { method: "PUT" });
  }

  async completeRide(rideId) {
    return await this.request(`/rides/${rideId}/complete`, { method: "PUT" });
  }

  async cancelRide(rideId) {
    return await this.request(`/rides/${rideId}/cancel`, { method: "PUT" });
  }

  // --- Payment Endpoints ---
  async getPaymentByRideId(rideId) {
    return await this.request(`/payments/ride/${rideId}`);
  }

  // --- Health Check ---
  async pingHealth(port) {
    try {
      const url = `http://localhost:${port}/actuator/health`;
      const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

window.api = new ApiClient();
