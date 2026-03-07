const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Accommodation = require('../models/Accommodation');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Cashfree API endpoints
const CASHFREE_API_URL = process.env.CASHFREE_ENV === 'PROD'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';


// @route   POST /api/bookings
// @desc    Create booking request
// @access  Private (Student only)
router.post('/', protect, [
  body('accommodation').notEmpty().withMessage('Accommodation ID is required'),
  body('moveInDate').isISO8601().withMessage('Valid move-in date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
  body('message').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can create bookings'
      });
    }

    const { accommodation, moveInDate, duration, message } = req.body;

    // Get accommodation details
    const accommodationData = await Accommodation.findById(accommodation);
    if (!accommodationData) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    if (!accommodationData.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Accommodation is not available'
      });
    }

    if (accommodationData.occupancy.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms available'
      });
    }

    // Calculate total amount
    const totalAmount = accommodationData.rent * duration;
    const depositAmount = accommodationData.deposit || 0;

    // Create booking
    const booking = await Booking.create({
      student: req.user._id,
      accommodation: accommodation,
      owner: accommodationData.owner,
      moveInDate,
      duration,
      totalAmount,
      depositAmount,
      message
    });

    // Create notification for owner
    try {
      await Notification.create({
        recipient: accommodationData.owner,
        sender: req.user._id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${req.user.name} has requested to book ${accommodationData.title}`,
        link: '/dashboard',
        referenceId: booking._id
      });
    } catch (notifError) {
      console.error('Failed to create booking request notification:', notifError);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'owner') {
      filter.owner = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate('accommodation', 'title type address rent images location')
      .populate('student', 'name email phone')
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('accommodation')
      .populate('student', 'name email phone college')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.student._id.toString() !== req.user._id.toString() &&
      booking.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Accept booking request
// @access  Private (Owner only)
router.put('/:id/accept', protect, [
  body('ownerResponse').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can accept bookings'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    booking.status = 'accepted';
    booking.ownerResponse = req.body.ownerResponse || 'Booking accepted';

    // Decrease available occupancy
    const accommodation = await Accommodation.findById(booking.accommodation);
    if (accommodation.occupancy.available > 0) {
      accommodation.occupancy.available -= 1;
      await accommodation.save();
    }

    await booking.save();

    // Create notification for student
    try {
      await Notification.create({
        recipient: booking.student,
        sender: req.user._id,
        type: 'booking_status',
        title: 'Booking Accepted',
        message: `Your booking for ${accommodation.title} has been accepted!`,
        link: '/bookings',
        referenceId: booking._id
      });
    } catch (notifError) {
      console.error('Failed to create booking acceptance notification:', notifError);
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking request
// @access  Private (Owner only)
router.put('/:id/reject', protect, [
  body('ownerResponse').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can reject bookings'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this booking'
      });
    }

    booking.status = 'rejected';
    booking.ownerResponse = req.body.ownerResponse || 'Booking rejected';
    await booking.save();

    // Create notification for student
    try {
      const accommodationData = await Accommodation.findById(booking.accommodation);
      await Notification.create({
        recipient: booking.student,
        sender: req.user._id,
        type: 'booking_status',
        title: 'Booking Rejected',
        message: `Your booking for ${accommodationData ? accommodationData.title : 'an accommodation'} was rejected`,
        link: '/bookings',
        referenceId: booking._id
      });
    } catch (notifError) {
      console.error('Failed to create booking rejection notification:', notifError);
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/bookings/:id/payment
// @desc    Create payment order
// @access  Private (Student only)
router.post('/:id/payment', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can make payments'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted before payment'
      });
    }

    const amount = (booking.totalAmount + booking.depositAmount) * 100; // Convert to paise

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        studentId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: order.id,
        amount: amount,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);

    // Check if it's a Razorpay configuration error
    if (error.message && error.message.includes('Invalid API key')) {
      console.error('❌ Invalid Razorpay API Key. Please check RAZORPAY_KEY_ID in .env');
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/bookings/:id/payment/verify
// @desc    Verify payment
// @access  Private (Student only)
router.post('/:id/payment/verify', protect, [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(req.body.razorpay_order_id + '|' + req.body.razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === req.body.razorpay_signature) {
      booking.paymentStatus = 'paid';
      booking.paymentId = req.body.razorpay_payment_id;
      booking.razorpayPaymentId = req.body.razorpay_payment_id;
      booking.status = 'completed';
      await booking.save();

      // Create notification for owner (Payment Received)
      try {
        const accommodationData = await Accommodation.findById(booking.accommodation);
        await Notification.create({
          recipient: booking.owner,
          sender: booking.student,
          type: 'payment',
          title: 'Payment Received',
          message: `Payment received for ${accommodationData?.title || 'booking'}`,
          link: '/dashboard',
          referenceId: booking._id
        });
      } catch (notifError) {
        console.error('Failed to create payment notification:', notifError);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: booking
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ CASHFREE PAYMENT ENDPOINTS ============

// @route   POST /api/bookings/:id/payment/cashfree
// @desc    Create Cashfree payment order
// @access  Private (Student only)
router.post('/:id/payment/cashfree', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can make payments'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted before payment'
      });
    }

    const amount = booking.totalAmount + booking.depositAmount;
    const orderId = `booking_${booking._id}_${Date.now()}`;

    // Cashfree has different transaction limits based on merchant account
    // Common limits: ₹50,000, ₹100,000, ₹500,000 etc.
    // Add validation to prevent exceeding limits
    const CASHFREE_MAX_AMOUNT = parseInt(process.env.CASHFREE_MAX_ORDER_AMOUNT || '100000');

    if (amount > CASHFREE_MAX_AMOUNT) {
      console.error(`❌ Amount ₹${amount} exceeds Cashfree max limit of ₹${CASHFREE_MAX_AMOUNT}`);
      return res.status(400).json({
        success: false,
        message: `Booking amount ₹${amount} exceeds payment limit. Please contact support to increase your payment limit or split the booking.`,
        data: {
          amount: amount,
          maxAllowed: CASHFREE_MAX_AMOUNT,
          suggestion: `Your booking includes ₹${booking.totalAmount} (rent) + ₹${booking.depositAmount} (deposit). Contact support to increase your Cashfree merchant limit.`
        }
      });
    }

    try {
      // Prepare order payload for Cashfree v2 API
      const orderPayload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: req.user._id.toString(),
          customer_name: req.user.name,
          customer_email: req.user.email,
          customer_phone: req.user.phone || '9999999999'
        }
      };

      // Always provide return_url to ensure Cashfree redirects back to our app with the bookingId
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      orderPayload.order_meta = {
        return_url: `${frontendUrl}/payment-callback?bookingId=${req.params.id}&gateway=cashfree&order_id=${orderId}`
      };

      console.log('📤 Sending Cashfree request:', JSON.stringify(orderPayload));

      // Create order with Cashfree v2 API
      const response = await axios.post(
        `${CASHFREE_API_URL}/orders`,
        orderPayload,
        {
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Cashfree Order Created:', response.data);

      booking.cashfreeOrderId = orderId;
      booking.paymentMethod = 'cashfree';
      await booking.save();

      // Return payment details for frontend
      res.json({
        success: true,
        data: {
          orderId: orderId,
          amount: amount,
          paymentSessionId: response.data.payment_session_id,
          cfPaymentUrl: response.data.payment_link,
          cfMode: process.env.CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox'
        }
      });
    } catch (error) {
      console.error('❌ Cashfree API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Provide detailed error messages
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Failed to create payment order';

      throw {
        message: errorMessage,
        status: error.response?.status || 500
      };
    }
  } catch (error) {
    console.error('Create Cashfree payment error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to create payment order with Cashfree',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/bookings/:id/payment/cashfree/verify
// @desc    Verify Cashfree payment
// @access  Private (Student only)
router.post('/:id/payment/cashfree/verify', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify payment with Cashfree v2 API
    try {
      const response = await axios.get(
        `${CASHFREE_API_URL}/orders/${orderId}/payments`,
        {
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY
          }
        }
      );

      console.log('📊 Cashfree Payment Status Response:', JSON.stringify(response.data));

      // Fix: Cashfree API might return the array directly or wrapped in a data object
      const payments = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

      if (successfulPayment) {
        booking.paymentStatus = 'paid';
        booking.cashfreePaymentId = successfulPayment.cf_payment_id;
        booking.paymentId = successfulPayment.cf_payment_id;
        booking.status = 'completed';
        await booking.save();

        // Create notification for owner
        try {
          const accommodationData = await Accommodation.findById(booking.accommodation);
          await Notification.create({
            recipient: booking.owner,
            sender: booking.student,
            type: 'payment',
            title: 'Payment Confirmed',
            message: `Payment confirmed for ${accommodationData?.title || 'booking'} via Cashfree`,
            link: '/dashboard',
            referenceId: booking._id
          });
        } catch (notifError) {
          console.error('Failed to create cashfree payment notification:', notifError);
        }

        console.log('✅ Cashfree Payment Verified Successfully');

        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: booking
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not found or still pending'
        });
      }
    } catch (error) {
      console.error('❌ Cashfree Verification Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  } catch (error) {
    console.error('Verify Cashfree payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify Cashfree payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/bookings/:id/payment/cashfree/webhook
// @desc    Cashfree webhook for payment status
// @access  Public (Webhooks don't require auth)
router.post('/:id/payment/cashfree/webhook', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { data } = req.body;

    if (data && data.payment_status === 'SUCCESS') {
      booking.paymentStatus = 'paid';
      booking.cashfreePaymentId = data.cf_payment_id;
      booking.paymentId = data.cf_payment_id;
      booking.status = 'completed';
      await booking.save();

      // Create notification for owner
      try {
        const accommodationData = await Accommodation.findById(booking.accommodation);
        await Notification.create({
          recipient: booking.owner,
          sender: booking.student,
          type: 'payment',
          title: 'Payment Received (Webhook)',
          message: `Late payment confirmation for ${accommodationData?.title || 'booking'}`,
          link: '/dashboard',
          referenceId: booking._id
        });
      } catch (notifError) {
        console.error('Failed to create webhook payment notification:', notifError);
      }

      console.log('✅ Cashfree Payment Webhook: Payment successful for booking', req.params.id);
    } else if (data && (data.payment_status === 'FAILED' || data.payment_status === 'CANCELLED')) {
      booking.paymentStatus = 'pending';
      await booking.save();

      console.log('❌ Cashfree Payment Webhook: Payment failed for booking', req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
});

module.exports = router;

