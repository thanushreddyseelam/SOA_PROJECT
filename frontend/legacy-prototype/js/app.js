/**
 * UrbanGlide — Main Application Controller
 */

// Presets in Vijayawada
const LOCATION_PRESETS = {
  pvp: { name: "PVP Square Mall", lat: 16.5062, lng: 80.6480 },
  benz: { name: "Benz Circle", lat: 16.5010, lng: 80.6436 },
  station: { name: "Vijayawada Railway Station", lat: 16.5175, lng: 80.6200 },
  busstand: { name: "Pandit Nehru Bus Station", lat: 16.5090, lng: 80.6180 },
  temple: { name: "Kanaka Durga Temple", lat: 16.5186, lng: 80.6054 },
  airport: { name: "Gannavaram Airport", lat: 16.5284, lng: 80.7969 }
};

const RIDE_STATES = [
  "REQUESTED",
  "DRIVER_ASSIGNED",
  "DRIVER_ACCEPTED",
  "DRIVER_ARRIVED",
  "TRIP_STARTED",
  "TRIP_COMPLETED",
  "PAID"
];

let activeRide = null;

// Telemetry Log Store
const telemetryLogs = [];

window.emitTelemetry = function(entry) {
  telemetryLogs.unshift(entry);
  if (telemetryLogs.length > 50) telemetryLogs.pop();
  renderTelemetryConsole();
};

function renderTelemetryConsole() {
  const container = document.getElementById("telemetry-entries");
  if (!container) return;

  container.innerHTML = telemetryLogs.map(log => {
    let statusClass = "s2xx";
    if (typeof log.status === "number") {
      if (log.status >= 400 && log.status < 500) statusClass = "s4xx";
      else if (log.status >= 500) statusClass = "s5xx";
    } else {
      statusClass = "s5xx";
    }

    return `
      <div class="telemetry-entry">
        <span class="telemetry-timestamp">${log.timestamp}</span>
        <span class="telemetry-method ${log.method}">${log.method}</span>
        <span class="telemetry-path">${log.endpoint}</span>
        <span class="telemetry-status ${statusClass}">${log.status}</span>
        <span style="color:var(--text-dim); font-size:0.75rem;">${log.duration}ms</span>
      </div>
    `;
  }).join("");
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.mapController.init();
  setupNavigation();
  setupAuthControls();
  setupPresets();
  setupBookingEvents();
  setupDriverActions();
  startHealthChecks();
  refreshDriverFleet();
  updateAuthUI();

  // Pre-load default locations for immediate demonstration
  selectPreset("pickup", "pvp");
  selectPreset("dest", "benz");
});

// -----------------------------------------------------------------------------
// Navigation Tabs
// -----------------------------------------------------------------------------
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");

      if (targetId === "tab-rider" && window.mapController.map) {
        setTimeout(() => window.mapController.map.invalidateSize(), 200);
      }
      if (targetId === "tab-driver") {
        refreshDriverFleet();
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Auth Controls
// -----------------------------------------------------------------------------
function setupAuthControls() {
  const loginBtn = document.getElementById("btn-quick-login");
  const logoutBtn = document.getElementById("btn-logout");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      try {
        // Try logging in as thanush, or auto-register if not exists
        try {
          await window.api.login("thanush", "password123");
        } catch (e) {
          await window.api.register("thanush", "thanush@urbanglide.com", "password123", "RIDER");
        }
        updateAuthUI();
        showToast("Logged in successfully as thanush", "success");
      } catch (err) {
        showToast("Login failed: " + err.message, "danger");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.api.clearAuth();
      updateAuthUI();
      showToast("Logged out", "info");
    });
  }
}

function updateAuthUI() {
  const isAuth = window.api.isAuthenticated();
  const authText = document.getElementById("auth-username");
  const loginBtn = document.getElementById("btn-quick-login");
  const logoutBtn = document.getElementById("btn-logout");
  const bookBtn = document.getElementById("btn-book-ride");

  if (isAuth && window.api.currentUser) {
    authText.innerText = `${window.api.currentUser.username} (${window.api.currentUser.role})`;
    document.getElementById("auth-dot").classList.add("online");
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (bookBtn) bookBtn.disabled = false;
  } else {
    authText.innerText = "Guest (Not Logged In)";
    document.getElementById("auth-dot").classList.remove("online");
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (bookBtn) bookBtn.disabled = false; // allow booking; will prompt login if needed
  }
}

// -----------------------------------------------------------------------------
// Location Presets & Fare Calculation
// -----------------------------------------------------------------------------
function setupPresets() {
  document.getElementById("preset-pickup").addEventListener("change", (e) => {
    if (e.target.value) selectPreset("pickup", e.target.value);
  });

  document.getElementById("preset-dest").addEventListener("change", (e) => {
    if (e.target.value) selectPreset("dest", e.target.value);
  });
}

function selectPreset(type, key) {
  const loc = LOCATION_PRESETS[key];
  if (!loc) return;

  if (type === "pickup") {
    window.mapController.setPickup(loc.lat, loc.lng, loc.name);
  } else {
    window.mapController.setDestination(loc.lat, loc.lng, loc.name);
  }
  updateFarePreview();
}

window.updateFarePreview = function() {
  const pLat = parseFloat(document.getElementById("pickup-lat").value);
  const pLng = parseFloat(document.getElementById("pickup-lng").value);
  const dLat = parseFloat(document.getElementById("dest-lat").value);
  const dLng = parseFloat(document.getElementById("dest-lng").value);

  if (isNaN(pLat) || isNaN(dLat)) return;

  // Haversine formula
  const d = calculateHaversine(pLat, pLng, dLat, dLng);
  // Formula: BASE_FARE (50) + (distance * 15) + TIME_CHARGE (30)
  const baseFare = 50.0;
  const distFare = d * 15.0;
  const timeCharge = 30.0;
  const total = (baseFare + distFare + timeCharge).toFixed(2);

  document.getElementById("fare-distance").innerText = `${d.toFixed(2)} km`;
  document.getElementById("fare-distance-charge").innerText = `₹${distFare.toFixed(2)}`;
  document.getElementById("fare-total").innerText = `₹${total}`;
};

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// -----------------------------------------------------------------------------
// Booking & State Machine Tracker
// -----------------------------------------------------------------------------
function setupBookingEvents() {
  document.getElementById("btn-book-ride").addEventListener("click", async () => {
    // Auto-authenticate if guest
    if (!window.api.isAuthenticated()) {
      try {
        await window.api.login("thanush", "password123");
        updateAuthUI();
      } catch (e) {
        await window.api.register("thanush", "thanush@urbanglide.com", "password123", "RIDER");
        updateAuthUI();
      }
    }

    const pickupLat = parseFloat(document.getElementById("pickup-lat").value);
    const pickupLng = parseFloat(document.getElementById("pickup-lng").value);
    const destLat = parseFloat(document.getElementById("dest-lat").value);
    const destLng = parseFloat(document.getElementById("dest-lng").value);
    const pickupAddress = document.getElementById("pickup-address").value || "Pickup Location";
    const dropAddress = document.getElementById("dest-address").value || "Drop Location";

    if (isNaN(pickupLat) || isNaN(destLat)) {
      showToast("Please select valid pickup and destination locations!", "danger");
      return;
    }

    const bookBtn = document.getElementById("btn-book-ride");
    bookBtn.disabled = true;
    bookBtn.innerHTML = `<span>⏳</span> Dispatching Driver...`;

    try {
      const response = await window.api.bookRide({
        riderId: 1,
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLng,
        destinationLatitude: destLat,
        destinationLongitude: destLng,
        pickupAddress,
        dropAddress
      });

      activeRide = response;
      renderActiveTrip(response);
      showToast(`Ride #${response.id} booked! Assigned Driver ID: ${response.driverId || 'Pending'}`, "success");
      refreshDriverFleet();
    } catch (err) {
      showToast("Booking failed: " + err.message, "danger");
    } finally {
      bookBtn.disabled = false;
      bookBtn.innerHTML = `<span>🚗</span> Confirm & Book Ride`;
    }
  });
}

function renderActiveTrip(ride) {
  const panel = document.getElementById("active-trip-panel");
  panel.style.display = "block";

  document.getElementById("trip-id-display").innerText = `Ride #${ride.id}`;
  document.getElementById("trip-fare-display").innerText = `₹${ride.fare}`;
  document.getElementById("trip-route-display").innerText = `${ride.pickupAddress} ➔ ${ride.dropAddress}`;

  // Update Stepper
  const currentIndex = RIDE_STATES.indexOf(ride.status);
  const steps = document.querySelectorAll(".step-item");
  steps.forEach((step, idx) => {
    step.classList.remove("active", "completed");
    if (idx < currentIndex) {
      step.classList.add("completed");
    } else if (idx === currentIndex) {
      step.classList.add("active");
    }
  });

  // Action Buttons based on status
  const actionsDiv = document.getElementById("trip-actions");
  actionsDiv.innerHTML = "";

  if (ride.status === "REQUESTED" || ride.status === "DRIVER_ASSIGNED") {
    actionsDiv.innerHTML += `<button class="btn btn-secondary" onclick="handleRideAction('accept')">Accept (Driver Action)</button>`;
    actionsDiv.innerHTML += `<button class="btn btn-danger" onclick="handleRideAction('cancel')">Cancel Ride</button>`;
  } else if (ride.status === "DRIVER_ACCEPTED") {
    actionsDiv.innerHTML += `<button class="btn btn-primary" onclick="handleRideAction('arrived')">Driver Arrived</button>`;
  } else if (ride.status === "DRIVER_ARRIVED") {
    actionsDiv.innerHTML += `<button class="btn btn-primary" onclick="handleRideAction('start')">Start Trip</button>`;
  } else if (ride.status === "TRIP_STARTED") {
    actionsDiv.innerHTML += `<button class="btn btn-success" onclick="handleRideAction('complete')">Complete Trip & Pay</button>`;
  } else if (ride.status === "PAID" || ride.status === "PAYMENT_PENDING") {
    // Fetch Receipt
    loadReceipt(ride.id);
  }
}

window.handleRideAction = async function(action) {
  if (!activeRide) return;
  try {
    let updated;
    if (action === "accept") updated = await window.api.acceptRide(activeRide.id);
    else if (action === "arrived") updated = await window.api.driverArrived(activeRide.id);
    else if (action === "start") updated = await window.api.startRide(activeRide.id);
    else if (action === "complete") updated = await window.api.completeRide(activeRide.id);
    else if (action === "cancel") updated = await window.api.cancelRide(activeRide.id);

    activeRide = updated;
    renderActiveTrip(updated);
    showToast(`Ride updated: ${updated.status}`, "success");
    refreshDriverFleet();
  } catch (e) {
    showToast(`Action failed: ${e.message}`, "danger");
  }
};

async function loadReceipt(rideId) {
  try {
    const payment = await window.api.getPaymentByRideId(rideId);
    const receiptBox = document.getElementById("receipt-display");
    receiptBox.style.display = "block";
    receiptBox.innerHTML = `
      <div style="font-weight:700; color:var(--success); margin-bottom:0.5rem;">Digital Receipt (Payment Verified)</div>
      <div class="fare-row"><span>Transaction ID:</span><b style="color:var(--text-main); font-family:var(--font-mono);">${payment.transactionId}</b></div>
      <div class="fare-row"><span>Amount Paid:</span><b>₹${payment.amount}</b></div>
      <div class="fare-row"><span>Payment Method:</span><b>${payment.paymentMethod}</b></div>
      <div class="fare-row"><span>Status:</span><span class="badge badge-available">${payment.status}</span></div>
    `;
  } catch (e) {
    console.log("Could not load receipt: ", e.message);
  }
}

// -----------------------------------------------------------------------------
// Driver Fleet Management
// -----------------------------------------------------------------------------
async function refreshDriverFleet() {
  try {
    const drivers = await window.api.getAvailableDrivers();
    window.mapController.renderDrivers(drivers);

    const fleetGrid = document.getElementById("fleet-roster");
    if (!fleetGrid) return;

    fleetGrid.innerHTML = drivers.map(d => `
      <div class="glass-card driver-card">
        <div>
          <div class="driver-header">
            <div>
              <div class="driver-name">${d.name}</div>
              <div class="driver-phone">📞 ${d.phone}</div>
            </div>
            <span class="badge ${d.status === 'AVAILABLE' ? 'badge-available' : (d.status === 'BUSY' ? 'badge-busy' : 'badge-offline')}">
              ${d.status}
            </span>
          </div>
          <div class="driver-meta">
            <div>🚗 ${d.vehicleNumber}</div>
            <div>🏷️ ${d.vehicleType}</div>
            <div>📍 (${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)})</div>
            <div>⚡ ${d.availability ? 'Online' : 'Offline'}</div>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
          <button class="btn btn-secondary" style="flex:1; padding:0.4rem; font-size:0.78rem;" onclick="toggleDriverStatus(${d.id}, '${d.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'}')">
            Toggle Status
          </button>
        </div>
      </div>
    `).join("");
  } catch (e) {
    console.log("Error loading drivers:", e.message);
  }
}

window.toggleDriverStatus = async function(driverId, newStatus) {
  try {
    await window.api.updateDriverStatus(driverId, newStatus);
    showToast(`Driver #${driverId} status changed to ${newStatus}`, "success");
    refreshDriverFleet();
  } catch (e) {
    showToast(`Error updating driver: ${e.message}`, "danger");
  }
};

function setupDriverActions() {
  const refreshBtn = document.getElementById("btn-refresh-fleet");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshDriverFleet);
}

// -----------------------------------------------------------------------------
// Microservices Health Monitoring
// -----------------------------------------------------------------------------
const SERVICES = [
  { id: "eureka", name: "Eureka Registry", port: 8761 },
  { id: "gateway", name: "API Gateway", port: 8080 },
  { id: "auth", name: "Auth Service", port: 8090 },
  { id: "driver", name: "Driver Service", port: 8087 },
  { id: "ride", name: "Ride Service", port: 8086 },
  { id: "payment", name: "Payment Service", port: 8088 }
];

async function startHealthChecks() {
  checkAllServices();
  setInterval(checkAllServices, 6000);
}

async function checkAllServices() {
  for (const s of SERVICES) {
    const isUp = await window.api.pingHealth(s.port);
    const card = document.getElementById(`srv-${s.id}`);
    const statusText = document.getElementById(`srv-${s.id}-status`);

    if (card && statusText) {
      if (isUp) {
        card.classList.add("healthy");
        statusText.innerText = "ONLINE";
        statusText.className = "badge badge-available";
      } else {
        card.classList.remove("healthy");
        statusText.innerText = "OFFLINE";
        statusText.className = "badge badge-offline";
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Toast Notifications
// -----------------------------------------------------------------------------
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: ${type === 'success' ? '#065f46' : (type === 'danger' ? '#7f1d1d' : '#1e293b')};
    color: #fff;
    border: 1px solid ${type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : '#64748b')};
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-size: 0.85rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    animation: fadeIn 0.2s ease-in;
  `;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
