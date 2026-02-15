import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AddFarmhouse from './pages/AddFarmhouse';
import MyFarmhouses from './pages/MyFarmhouses';
import EditFarmhouse from './pages/EditFarmhouse';
import FarmhouseDetails from './pages/FarmhouseDetails';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import KYC from './pages/KYC';
import Earnings from './pages/Earnings';
import PayoutPolicy from './pages/PayoutPolicy';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Analytics from './pages/Analytics';
import CalendarView from './pages/CalendarView';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPermissionModal from './components/NotificationPermissionModal';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <NotificationPermissionModal />
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="add-farmhouse" element={<AddFarmhouse />} />
                <Route path="farmhouses" element={<MyFarmhouses />} />
                <Route path="farmhouses/:id" element={<FarmhouseDetails />} />
                <Route path="farmhouses/edit/:id" element={<EditFarmhouse />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="bookings/:id" element={<BookingDetails />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="payout-policy" element={<PayoutPolicy />} />
                <Route path="kyc" element={<KYC />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="calendar" element={<CalendarView />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;