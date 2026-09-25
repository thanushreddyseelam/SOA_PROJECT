import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rideService } from '../services/rideService';
import { RideCard } from '../components/RideCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { History, Search, RefreshCw, Car, Download, FileSpreadsheet } from 'lucide-react';

export const RideHistoryPage = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRides = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await rideService.getRidesByRider(user.userId);
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve ride history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user?.userId]);

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ride.id).includes(searchTerm);

    const matchesStatus =
      filterStatus === 'ALL' || ride.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (rides.length === 0) return;
    const headers = ['Ride ID', 'Pickup Location', 'Drop-off Destination', 'Fare (INR)', 'Status', 'Payment Method'];
    const rows = rides.map(r => [
      r.id,
      `"${r.pickupAddress || ''}"`,
      `"${r.dropAddress || ''}"`,
      r.fare || 0,
      r.status,
      r.paymentMethod || 'UPI'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanGlide_Rides_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Ride history exported as CSV successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Rider Ledger
            </span>
            <span className="badge badge-amber">{rides.length} Total Trips</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '2px 0 0 0' }}>Ride History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Historical trip logs queried from <code>urban_ride_db</code> via API Gateway.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} disabled={rides.length === 0} className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button onClick={fetchRides} className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchRides} />}

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search by pickup, destination, or Ride ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: 170, fontSize: '0.9rem' }}
        >
          <option value="ALL">All Trip Statuses</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="DRIVER_ASSIGNED">DRIVER_ASSIGNED</option>
          <option value="TRIP_STARTED">TRIP_STARTED</option>
          <option value="TRIP_COMPLETED">TRIP_COMPLETED</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* List / Empty State */}
      {loading ? (
        <LoadingSpinner text="Retrieving trip ledger from Ride Service..." />
      ) : filteredRides.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Car size={42} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No matching rides found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem auto' }}>
            Try adjusting your search criteria or book a new trip across Vijayawada.
          </p>
          <a href="/book" className="btn btn-primary">Book a Ride</a>
        </div>
      ) : (
        <div className="grid-2">
          {filteredRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
