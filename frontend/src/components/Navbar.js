import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import './Navbar.css';

const Navbar = ({ hideLinks }) => {
  const { isAuthenticated, user, logout, isOwner } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(location.pathname);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close notifications on route change
    setShowNotifications(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/accommodations', label: 'Browse' },
    ...(isAuthenticated ? [
      { path: '/bookings', label: 'Bookings' },
      { path: '/messages', label: 'Messages' },
      ...(isOwner ? [{ path: '/create-accommodation', label: 'List Property' }] : []),
      { path: '/profile', label: 'Profile' }
    ] : [])
  ];

  const springTransition = {
    type: "spring",
    stiffness: 100,
    damping: 22,
    mass: 1
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="navbar-container">
        {!hideLinks && (
          <Link to="/" className="navbar-brand">
            <motion.div
              className="brand-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src="/logo.png"
                alt="StayScholars"
                className="brand-logo"
                layoutId="main-logo"
                transition={springTransition}
              />
              <motion.h1
                layoutId="main-brand-text"
                transition={springTransition}
              >
                StayScholars
              </motion.h1>
            </motion.div>
          </Link>
        )}

        {!hideLinks && (
          <motion.div
            className="navbar-menu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="nav-links-wrapper">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredPath(link.path)}
                  onMouseLeave={() => setHoveredPath(location.pathname)}
                >
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="active-indicator"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="link-text">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="navbar-actions">
              {isAuthenticated ? (
                <div className="navbar-user">
                  <div className="notifications-wrapper">
                    <button
                      className="notification-bell"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <i className="fa-solid fa-bell"></i>
                      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          className="notifications-dropdown"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        >
                          <div className="notifications-header">
                            <h3>Notifications</h3>
                            <button onClick={markAllAsRead} className="btn-link">Mark all as read</button>
                          </div>
                          <div className="notifications-list">
                            {notifications.length === 0 ? (
                              <div className="no-notifications">No notifications yet</div>
                            ) : (
                              notifications.map(notif => (
                                <div
                                  key={notif._id}
                                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                  onClick={() => {
                                    markAsRead(notif._id);
                                    navigate(notif.link || '#');
                                  }}
                                >
                                  <div className="notification-content">
                                    <p className="notification-title">{notif.title}</p>
                                    <p className="notification-msg">{notif.message}</p>
                                    <span className="notification-time">
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {!notif.isRead && <span className="unread-dot"></span>}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="user-greeting">Hi, {user?.name.split(' ')[0]}</span>
                  <motion.button
                    onClick={handleLogout}
                    className="btn btn-logout"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login">
                    <motion.button
                      className="btn btn-ghost"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

