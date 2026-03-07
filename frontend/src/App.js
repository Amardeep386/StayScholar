import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Accommodations from './pages/Accommodations';
import AccommodationDetail from './pages/AccommodationDetail';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import CreateAccommodation from './pages/CreateAccommodation';
import Payment from './pages/Payment';
import PaymentCallback from './pages/PaymentCallback';

import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <AnimatePresence>
              {showSplash && <SplashScreen key="splash" />}
            </AnimatePresence>
            <Navbar hideLinks={showSplash} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/accommodations" element={<Accommodations />} />
                <Route path="/accommodations/:id" element={<AccommodationDetail />} />

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <MyBookings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payment/:bookingId"
                  element={
                    <PrivateRoute>
                      <Payment />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <Messages />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-accommodation"
                  element={
                    <PrivateRoute>
                      <CreateAccommodation />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/payment-callback"
                  element={
                    <PrivateRoute>
                      <PaymentCallback />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

