import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookRidePage } from './pages/BookRidePage';
import { RideTrackingPage } from './pages/RideTrackingPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RideHistoryPage } from './pages/RideHistoryPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/architecture" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ArchitecturePage />
              </ProtectedRoute>
            } 
          />

          {/* Role-Specific Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* RIDER ROUTES */}
          <Route
            path="/book"
            element={
              <ProtectedRoute requiredRole="RIDER">
                <BookRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rides"
            element={
              <ProtectedRoute requiredRole="RIDER">
                <RideHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rides/:id"
            element={
              <ProtectedRoute requiredRole="RIDER">
                <RideTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredRole="RIDER">
                <PaymentHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* DRIVER ROUTES */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute requiredRole="DRIVER">
                <DriverDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Common Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
