import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isStudent, isOwner } = useContext(AuthContext);

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        <div className="welcome-section">
          <h2>Welcome back, {user?.name}!</h2>
          <p>Manage your accommodations and bookings from here</p>
        </div>

        <div className="dashboard-grid">
          {isStudent && (
            <>
              <Link to="/accommodations" className="dashboard-card">
                <div className="card-icon">🔍</div>
                <h3>Browse Accommodations</h3>
                <p>Find your perfect student accommodation</p>
              </Link>
              <Link to="/bookings" className="dashboard-card">
                <div className="card-icon">📋</div>
                <h3>My Bookings</h3>
                <p>View and manage your bookings</p>
              </Link>
              <Link to="/messages" className="dashboard-card">
                <div className="card-icon">💬</div>
                <h3>Messages</h3>
                <p>Chat with property owners</p>
              </Link>
            </>
          )}

          {isOwner && (
            <>
              <Link to="/create-accommodation" className="dashboard-card">
                <div className="card-icon">➕</div>
                <h3>List New Property</h3>
                <p>Add a new accommodation listing</p>
              </Link>
              <Link to="/bookings" className="dashboard-card">
                <div className="card-icon">📋</div>
                <h3>Booking Requests</h3>
                <p>Manage booking requests from students</p>
              </Link>
              <Link to="/messages" className="dashboard-card">
                <div className="card-icon">💬</div>
                <h3>Messages</h3>
                <p>Communicate with students</p>
              </Link>
            </>
          )}

          <Link to="/profile" className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile Settings</h3>
            <p>Update your profile information</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

