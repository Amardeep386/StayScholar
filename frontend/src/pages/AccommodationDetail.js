import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthContext from '../context/AuthContext';
import GoogleMap from '../components/GoogleMapClean';
import './AccommodationDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useContext(AuthContext);
  const [accommodation, setAccommodation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    moveInDate: new Date(),
    duration: 1,
    message: ''
  });
  const [inquiryMessage, setInquiryMessage] = useState('');

  useEffect(() => {
    fetchAccommodation();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAccommodation = async () => {
    try {
      const response = await axios.get(`${API_URL}/accommodations/${id}`);
      setAccommodation(response.data.data);
    } catch (error) {
      console.error('Error fetching accommodation:', error);
      toast.error('Failed to load accommodation details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/${id}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleInquiry = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to send inquiries');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      toast.error('Only students can send inquiries');
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await axios.post(`${API_URL}/messages`, {
        receiver: accommodation.owner._id || accommodation.owner.id,
        content: inquiryMessage,
        accommodation: id
      });

      toast.success('Inquiry sent successfully!');
      setShowInquiryModal(false);
      setInquiryMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send inquiry');
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to book accommodation');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      toast.error('Only students can book accommodations');
      return;
    }

    try {
      await axios.post(`${API_URL}/bookings`, {
        accommodation: id,
        moveInDate: bookingData.moveInDate.toISOString(),
        duration: bookingData.duration,
        message: bookingData.message
      });

      toast.success('Booking request sent successfully!');
      setShowBookingModal(false);
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    }
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

  if (!accommodation) {
    return (
      <div className="container">
        <div className="no-results">
          <p>Accommodation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accommodation-detail-page">
      <div className="container">
        <div className="detail-header">
          <h1>{accommodation.title}</h1>
          <div className="detail-meta">
            <span className="type-badge">{accommodation.type}</span>
            {accommodation.rating?.average > 0 && (
              <span className="rating-badge">
                ⭐ {accommodation.rating.average.toFixed(1)} ({accommodation.rating.count} reviews)
              </span>
            )}
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-main">
            {accommodation.images && accommodation.images.length > 0 && (
              <div className="image-gallery">
                <img src={accommodation.images[0]} alt={accommodation.title} />
              </div>
            )}

            <div className="detail-section">
              <h2>Description</h2>
              <p>{accommodation.description}</p>
            </div>

            <div className="detail-section">
              <h2>Location</h2>
              <p>
                {accommodation.address?.street}, {accommodation.address?.city},
                {accommodation.address?.state} - {accommodation.address?.pincode}
              </p>
              {/* Map for this accommodation */}
              {accommodation.location && (
                <div className="map-container-wrapper">
                  <GoogleMap
                    height="350px"
                    center={{ lat: accommodation.latitude, lng: accommodation.longitude }}
                    markers={[{
                      id: accommodation._id,
                      lat: accommodation.latitude,
                      lng: accommodation.longitude,
                      title: accommodation.title
                    }]}
                  />
                  <div style={{ padding: '12px', textAlign: 'right', background: 'var(--bg-card)' }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${accommodation.latitude},${accommodation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                      style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}
                    >
                      ↗️ View on Google Maps
                    </a>
                  </div>
                </div>
              )}

            </div>

            <div className="detail-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {accommodation.facilities?.wifi && <div className="amenity">✅ WiFi</div>}
                {accommodation.facilities?.electricity && <div className="amenity">✅ Electricity</div>}
                {accommodation.facilities?.water && <div className="amenity">✅ Water</div>}
                {accommodation.facilities?.parking && <div className="amenity">✅ Parking</div>}
                {accommodation.facilities?.security && <div className="amenity">✅ Security</div>}
                {accommodation.facilities?.laundry && <div className="amenity">✅ Laundry</div>}
                {accommodation.facilities?.kitchen && <div className="amenity">✅ Kitchen</div>}
                {accommodation.facilities?.ac && <div className="amenity">✅ AC</div>}
                {accommodation.facilities?.furnished && <div className="amenity">✅ Furnished</div>}
              </div>
            </div>

            <div className="detail-section">
              <h2>Reviews</h2>
              {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div>
                          <strong>{review.student?.name}</strong>
                          <div className="review-rating">⭐ {review.rating}/5</div>
                        </div>
                      </div>
                      {review.comment && <p>{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="booking-card">
              <div className="price-section">
                <div className="price">₹{accommodation.rent}<span>/month</span></div>
                {accommodation.deposit > 0 && (
                  <div className="deposit">Deposit: ₹{accommodation.deposit}</div>
                )}
              </div>
              <div className="availability">
                Available: {accommodation.occupancy?.available} / {accommodation.occupancy?.total}
              </div>
              {isStudent && (
                <div className="sidebar-actions">
                  {accommodation.occupancy?.available > 0 && (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="btn btn-primary btn-block"
                    >
                      Book Now
                    </button>
                  )}
                  <button
                    onClick={() => setShowInquiryModal(true)}
                    className="btn btn-outline btn-block mt-2"
                  >
                    Inquire / Ask Owner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showBookingModal && (
          <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Book Accommodation</h2>
              <div className="form-group">
                <label>Move-in Date</label>
                <DatePicker
                  selected={bookingData.moveInDate}
                  onChange={(date) => setBookingData({ ...bookingData, moveInDate: date })}
                  minDate={new Date()}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Duration (months)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={bookingData.duration}
                  onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                  placeholder="Any special requests or questions..."
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleBooking} className="btn btn-primary">
                  Send Booking Request
                </button>
              </div>
            </div>
          </div>
        )}

        {showInquiryModal && (
          <div className="modal-overlay" onClick={() => setShowInquiryModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Inquire about {accommodation.title}</h2>
              <div className="form-group">
                <label>Message to Owner</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Ask about availability, rules, or anything else..."
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowInquiryModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleInquiry} className="btn btn-primary">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationDetail;

