import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Header_com from './Components/Header_com';
import Footer_com from './Components/Footer_com';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterShopPage from './pages/RegisterShopPage';
import HealthProfilePage from './pages/HealthProfilePage';
import MedicineSearchPage from './pages/MedicineSearchPage';
import MedicineDetailsPage from './pages/MedicineDetailsPage';
import PharmacyDiscoveryPage from './pages/PharmacyDiscoveryPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MedicationRemindersPage from './pages/MedicationRemindersPage';
import GeofencePage from './pages/GeofencePage';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

import ShopDashboard from './pages/ShopDashboard';
import ShopMedicinesPage from './pages/ShopMedicinesPage';
import ShopOrdersPage from './pages/ShopOrdersPage';
import ShopProfilePage from './pages/ShopProfilePage';
import ShopFeedbacksPage from './pages/ShopFeedbacksPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminShopsPage from './pages/AdminShopsPage';
import AdminMedicinesPage from './pages/AdminMedicinesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminFeedbacksPage from './pages/AdminFeedbacksPage';

import './App.css';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Verifying authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app-container">
              <Header_com />
              <main className="main-content">
                <Routes>
                  {/* Public Core Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/search" element={<MedicineSearchPage />} />
                  <Route path="/medicines/:id" element={<MedicineDetailsPage />} />
                  <Route path="/pharmacies" element={<PharmacyDiscoveryPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/login-admin" element={<AdminLoginPage />} />
                  <Route path="/register" element={<RegisterCustomerPage />} />
                  <Route path="/register-shop" element={<RegisterShopPage />} />

                  {/* Customer Portal (Protected) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/health-profile"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <HealthProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/confirm/:id"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <OrderConfirmationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/track/:id"
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'shop', 'admin']}>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reminders"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <MedicationRemindersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/geofence"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <GeofencePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Medical Shop Portal (Protected) */}
                  <Route
                    path="/shop"
                    element={
                      <ProtectedRoute allowedRoles={['shop']}>
                        <ShopDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/medicines"
                    element={
                      <ProtectedRoute allowedRoles={['shop']}>
                        <ShopMedicinesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/orders"
                    element={
                      <ProtectedRoute allowedRoles={['shop']}>
                        <ShopOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/profile"
                    element={
                      <ProtectedRoute allowedRoles={['shop']}>
                        <ShopProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/feedbacks"
                    element={
                      <ProtectedRoute allowedRoles={['shop']}>
                        <ShopFeedbacksPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal (Protected) */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminCustomersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shops"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminShopsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/medicines"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminMedicinesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/feedbacks"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminFeedbacksPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer_com />
            </div>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
