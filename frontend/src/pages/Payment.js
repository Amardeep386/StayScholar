import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Payment.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_11111111111111';
// const CASHFREE_APP_ID = process.env.REACT_APP_CASHFREE_APP_ID || '';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  // const [showSummary, setShowSummary] = useState(true);
  const [paymentGateway, setPaymentGateway] = useState('razorpay');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookingDetails();
    loadPaymentScripts();
  }, [bookingId, isAuthenticated, fetchBookingDetails, navigate]);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  const loadPaymentScripts = () => {
    // Load Razorpay script
    const razorpayScript = document.createElement('script');
    razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    razorpayScript.async = true;
    document.body.appendChild(razorpayScript);

    // Load Cashfree script (v3)
    const cashfreeScript = document.createElement('script');
    cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    cashfreeScript.async = true;
    document.body.appendChild(cashfreeScript);
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      if (paymentGateway === 'razorpay') {
        await handleRazorpayPayment();
      } else if (paymentGateway === 'cashfree') {
        await handleCashfreePayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create payment order
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/payment`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { razorpayOrderId, amount, key } = response.data.data;

      if (!key) {
        toast.error('Razorpay Key is not configured. Please contact support.');
        setProcessing(false);
        return;
      }

      // Razorpay payment options
      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'StayScholars',
        description: `Booking for ${booking?.accommodation?.title}`,
        image: '/logo.svg',
        order_id: razorpayOrderId,
        handler: handleRazorpayPaymentSuccess,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          booking_id: bookingId,
          accommodation_id: booking?.accommodation?._id
        },
        theme: {
          color: '#FF8C42'
        }
      };

      if (!window.Razorpay) {
        toast.error('Razorpay script not loaded. Please refresh the page.');
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', handlePaymentFailure);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay init error:', error);
      throw error;
    }
  };

  const handleCashfreePayment = async () => {
    try {
      // Create payment order with Cashfree
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/payment/cashfree`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { orderId, paymentSessionId, cfMode } = response.data.data;
      console.log('💳 Cashfree Payment Info:', { orderId, paymentSessionId, cfMode });

      if (!paymentSessionId) {
        toast.error('Cashfree payment session creation failed. Please try again.');
        setProcessing(false);
        return;
      }

      // Initialize Cashfree v3
      if (window.Cashfree) {
        console.log('🚀 Initializing Cashfree v3 SDK in mode:', cfMode || "sandbox");
        const cashfree = window.Cashfree({
          mode: cfMode || "sandbox"
        });

        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self"
        });
      } else {
        console.error('❌ Cashfree SDK not found on window object');
        toast.error('Cashfree SDK not loaded. Please refresh and try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Cashfree init error:', error);
      throw error;
    }
  };

  const handleRazorpayPaymentSuccess = async (response) => {
    try {
      // Verify payment on backend
      await axios.post(
        `${API_URL}/bookings/${bookingId}/payment/verify`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success('Payment successful! Your booking is confirmed.');
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
    setProcessing(false);
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

  if (!booking) {
    return (
      <div className="container">
        <div className="no-results">
          <p>Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-wrapper">
          {/* Left side - Order Summary */}
          <div className="payment-summary">
            <h2>Order Summary</h2>

            <div className="summary-section">
              <h3>Accommodation Details</h3>
              <div className="summary-item">
                <span className="label">Property:</span>
                <span className="value">{booking.accommodation?.title}</span>
              </div>
              <div className="summary-item">
                <span className="label">Type:</span>
                <span className="value">{booking.accommodation?.type}</span>
              </div>
              <div className="summary-item">
                <span className="label">Location:</span>
                <span className="value">
                  {booking.accommodation?.address?.city}, {booking.accommodation?.address?.state}
                </span>
              </div>
            </div>

            <div className="summary-section">
              <h3>Booking Details</h3>
              <div className="summary-item">
                <span className="label">Move-in Date:</span>
                <span className="value">
                  {new Date(booking.moveInDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{booking.duration} month(s)</span>
              </div>
              <div className="summary-item">
                <span className="label">Monthly Rent:</span>
                <span className="value">₹{booking.accommodation?.rent}</span>
              </div>
            </div>

            <div className="summary-section">
              <h3>Price Breakdown</h3>
              <div className="summary-item">
                <span className="label">Rent ({booking.duration} months)</span>
                <span className="value">₹{booking.totalAmount}</span>
              </div>
              {booking.depositAmount > 0 && (
                <div className="summary-item">
                  <span className="label">Security Deposit</span>
                  <span className="value">₹{booking.depositAmount}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-item total">
                <span className="label">Total Amount</span>
                <span className="value">₹{booking.totalAmount + (booking.depositAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Right side - Payment Form */}
          <div className="payment-form">
            <div className="payment-header">
              <h2>Secure Payment</h2>
              <p>Complete your booking securely</p>
            </div>

            <div className="security-info">
              <div className="security-badge">
                <span className="icon">🔒</span>
                <span className="text">Secure Payment</span>
              </div>
              <p className="security-message">
                Your payment information is encrypted and secure. We use industry-standard SSL encryption.
              </p>
            </div>

            <div className="payment-gateway-selector">
              <h3>Select Payment Method</h3>
              <div className="gateway-options">
                <label className="gateway-radio">
                  <input
                    type="radio"
                    name="gateway"
                    value="razorpay"
                    checked={paymentGateway === 'razorpay'}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                  />
                  <span className="gateway-label">
                    <span className="gateway-name">💳 Razorpay</span>
                    <span className="gateway-desc">Fast & Secure</span>
                  </span>
                </label>
                <label className="gateway-radio">
                  <input
                    type="radio"
                    name="gateway"
                    value="cashfree"
                    checked={paymentGateway === 'cashfree'}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                  />
                  <span className="gateway-label">
                    <span className="gateway-name">🎯 Cashfree</span>
                    <span className="gateway-desc">Multiple Payment Options</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="payment-details">
              <h3>Payment Details</h3>

              <div className="detail-row">
                <span className="label">Student Name</span>
                <span className="value">{user?.name}</span>
              </div>

              <div className="detail-row">
                <span className="label">Email</span>
                <span className="value">{user?.email}</span>
              </div>

              <div className="detail-row">
                <span className="label">Phone</span>
                <span className="value">{user?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="payment-amount">
              <div className="amount-display">
                <span>Amount to Pay</span>
                <span className="amount">₹{booking.totalAmount + (booking.depositAmount || 0)}</span>
              </div>
            </div>

            <div className="payment-terms">
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>I agree to the terms and conditions</span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn btn-primary btn-pay"
            >
              {processing ? 'Processing...' : `Pay Securely with ${paymentGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}`}
            </button>

            <div className="payment-methods">
              <p>Accepted Payment Methods:</p>
              <div className="methods-grid">
                <div className="method">💳 Credit Card</div>
                <div className="method">💳 Debit Card</div>
                <div className="method">🏦 Net Banking</div>
                <div className="method">📱 UPI</div>
                <div className="method">💰 Wallet</div>
              </div>
            </div>

            <div className="cancellation-policy">
              <h4>Cancellation Policy</h4>
              <ul>
                <li>Cancellations before 7 days: Full refund of security deposit</li>
                <li>Cancellations within 7 days: 50% of security deposit</li>
                <li>No refund within 3 days of move-in</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/bookings')}
              className="btn btn-outline"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
