/**
 * UrbanGlide — Interactive Leaflet Map Controller
 * Focus area: Vijayawada, Andhra Pradesh, India
 */

class MapController {
  constructor() {
    this.map = null;
    this.pickupMarker = null;
    this.destMarker = null;
    this.driverMarkers = [];
    this.routeLine = null;
    
    this.defaultCenter = [16.5062, 80.6480]; // PVP Mall, Vijayawada
    this.defaultZoom = 13;
  }

  init() {
    if (this.map) return;

    this.map = L.map("map", {
      zoomControl: true,
      attributionControl: false
    }).setView(this.defaultCenter, this.defaultZoom);

    // OpenStreetMap dark/modern style tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19
    }).addTo(this.map);

    // Click handler to pick coordinates
    this.map.on("click", (e) => {
      this.handleMapClick(e.latlng.lat, e.latlng.lng);
    });
  }

  handleMapClick(lat, lng) {
    // If pickup not set, set pickup; else set destination
    const pickupInput = document.getElementById("pickup-lat");
    const destInput = document.getElementById("dest-lat");

    if (!pickupInput.value || (pickupInput.value && destInput.value)) {
      this.setPickup(lat, lng, `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      document.getElementById("dest-lat").value = "";
      document.getElementById("dest-lng").value = "";
      document.getElementById("dest-address").value = "";
      if (this.destMarker) {
        this.map.removeLayer(this.destMarker);
        this.destMarker = null;
      }
      if (this.routeLine) {
        this.map.removeLayer(this.routeLine);
        this.routeLine = null;
      }
    } else {
      this.setDestination(lat, lng, `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }

    if (window.updateFarePreview) {
      window.updateFarePreview();
    }
  }

  setPickup(lat, lng, label = "Pickup Location") {
    document.getElementById("pickup-lat").value = lat;
    document.getElementById("pickup-lng").value = lng;
    document.getElementById("pickup-address").value = label;

    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }

    const icon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background:#10b981; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 10px rgba(16,185,129,0.7); font-weight:bold; font-size:12px;">P</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.pickupMarker = L.marker([lat, lng], { icon }).addTo(this.map).bindPopup(`<b>Pickup:</b> ${label}`).openPopup();
    this.updateRouteLine();
  }

  setDestination(lat, lng, label = "Destination") {
    document.getElementById("dest-lat").value = lat;
    document.getElementById("dest-lng").value = lng;
    document.getElementById("dest-address").value = label;

    if (this.destMarker) {
      this.map.removeLayer(this.destMarker);
    }

    const icon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background:#ef4444; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 10px rgba(239,68,68,0.7); font-weight:bold; font-size:12px;">D</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.destMarker = L.marker([lat, lng], { icon }).addTo(this.map).bindPopup(`<b>Destination:</b> ${label}`).openPopup();
    this.updateRouteLine();
  }

  updateRouteLine() {
    const pLat = parseFloat(document.getElementById("pickup-lat").value);
    const pLng = parseFloat(document.getElementById("pickup-lng").value);
    const dLat = parseFloat(document.getElementById("dest-lat").value);
    const dLng = parseFloat(document.getElementById("dest-lng").value);

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }

    if (!isNaN(pLat) && !isNaN(dLat)) {
      const latlngs = [[pLat, pLng], [dLat, dLng]];
      this.routeLine = L.polyline(latlngs, {
        color: "#06b6d4",
        weight: 4,
        dashArray: "8, 8",
        opacity: 0.85
      }).addTo(this.map);

      this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });
    }
  }

  renderDrivers(drivers) {
    // Clear old driver markers
    this.driverMarkers.forEach(m => this.map.removeLayer(m));
    this.driverMarkers = [];

    drivers.forEach(d => {
      if (!d.latitude || !d.longitude) return;

      const isAvailable = d.status === "AVAILABLE";
      const markerColor = isAvailable ? "#10b981" : "#f59e0b";

      const icon = L.divIcon({
        className: "driver-pin",
        html: `<div style="background:${markerColor}; color:#fff; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 8px rgba(0,0,0,0.5); font-size:11px;">🚗</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([d.latitude, d.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`<b>${d.name}</b><br>Vehicle: ${d.vehicleNumber} (${d.vehicleType})<br>Status: <span style="color:${markerColor}">${d.status}</span>`);

      this.driverMarkers.push(marker);
    });
  }
}

window.mapController = new MapController();
