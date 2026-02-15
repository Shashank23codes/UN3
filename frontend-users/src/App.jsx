import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FarmhouseDetails from './pages/FarmhouseDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Trips from './pages/Trips';
import Wishlists from './pages/Wishlists';
import Profile from './pages/Profile';
import BookingConfirmation from './pages/BookingConfirmation';
import Checkout from './pages/Checkout';
import BookingDetails from './pages/BookingDetails';
import SearchPage from './pages/SearchPage';
import WriteReview from './pages/WriteReview';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import HelpCenter from './pages/HelpCenter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPermissionModal from './components/NotificationPermissionModal';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <NotificationPermissionModal />
            <ToastContainer position="top-center" autoClose={3000} />
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/search" element={<Layout><SearchPage /></Layout>} />
              <Route path="/farmhouses/:id" element={<Layout><FarmhouseDetails /></Layout>} />
              <Route path="/trips" element={<Layout><Trips /></Layout>} />
              <Route path="/trips/:id" element={<Layout><BookingDetails /></Layout>} />
              <Route path="/reviews/write/:bookingId" element={<Layout><WriteReview /></Layout>} />
              <Route path="/wishlists" element={<Layout><Wishlists /></Layout>} />
              <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              <Route path="/booking-confirmation" element={<Layout><BookingConfirmation /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
              <Route path="/faq" element={<Layout><FAQ /></Layout>} />
              <Route path="/help" element={<Layout><HelpCenter /></Layout>} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
