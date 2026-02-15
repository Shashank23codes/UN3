import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPermissionModal from './components/NotificationPermissionModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import VendorDetails from './pages/VendorDetails';
import Bookings from './pages/Bookings';
import Earnings from './pages/Earnings';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Notifications from './pages/Notifications';
import VendorPayouts from './pages/VendorPayouts';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SystemSettings from './pages/SystemSettings';
import FarmhouseModeration from './pages/FarmhouseModeration';
import ReportsExport from './pages/ReportsExport';
import DashboardLayout from './components/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:id" element={<VendorDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="payouts" element={<VendorPayouts />} />
        <Route path="farmhouses" element={<FarmhouseModeration />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="reports" element={<ReportsExport />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationPermissionModal />
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

