import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './MyBookings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MyBookings = () => {
  const { user, isOwner } = useContext(AuthContext);

  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await axios.put(`${API_URL}/bookings/${bookingId}/accept`);
      toast.success('Booking accepted');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(`${API_URL}/bookings/${bookingId}/reject`);
      toast.success('Booking rejected');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'badge-warning' },
      accepted: { text: 'Accepted', class: 'badge-success' },
      rejected: { text: 'Rejected', class: 'badge-danger' },
      cancelled: { text: 'Cancelled', class: 'badge-secondary' },
      completed: { text: 'Completed', class: 'badge-primary' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1 className="page-title">
          {isOwner ? 'Booking Requests' : 'My Bookings'}
        </h1>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.accommodation?.title}</h3>
                      <p className="booking-type">{booking.accommodation?.type}</p>
                    </div>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <strong>Move-in Date:</strong> {new Date(booking.moveInDate).toLocaleDateString()}
                    </div>
                    <div className="detail-item">
                      <strong>Duration:</strong> {booking.duration} month(s)
                    </div>
                    <div className="detail-item">
                      <strong>Total Amount:</strong> ₹{booking.totalAmount}
                    </div>
                    {booking.depositAmount > 0 && (
                      <div className="detail-item">
                        <strong>Deposit:</strong> ₹{booking.depositAmount}
                      </div>
                    )}
                    {isOwner && (
                      <div className="detail-item">
                        <strong>Student:</strong> {booking.student?.name} ({booking.student?.email})
                      </div>
                    )}
                    {booking.message && (
                      <div className="detail-item">
                        <strong>Message:</strong> {booking.message}
                      </div>
                    )}
                    {booking.ownerResponse && (
                      <div className="detail-item">
                        <strong>Owner Response:</strong> {booking.ownerResponse}
                      </div>
                    )}
                  </div>

                  {isOwner && booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button
                        onClick={() => handleAccept(booking._id)}
                        className="btn btn-success"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => navigate(`/messages?id=${[user.id, booking.student._id].sort().join('_')}`)}
                        className="btn btn-outline ml-2"
                      >
                        Message Student
                      </button>
                    </div>
                  )}

                  {isOwner && booking.status !== 'pending' && (
                    <div className="booking-actions">
                      <button
                        onClick={() => navigate(`/messages?id=${[user.id, booking.student._id].sort().join('_')}`)}
                        className="btn btn-outline"
                      >
                        Message Student
                      </button>
                    </div>
                  )}


                  {!isOwner && booking.status === 'accepted' && booking.paymentStatus === 'pending' && (
                    <div className="booking-actions">
                      <button
                        onClick={() => navigate(`/payment/${booking._id}`)}
                        className="btn btn-primary"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

