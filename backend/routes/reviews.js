const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Accommodation = require('../models/Accommodation');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private (Student only)
router.post('/', protect, [
  body('accommodation').notEmpty().withMessage('Accommodation ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
  body('aspects').optional()
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
        message: 'Only students can create reviews'
      });
    }

    const { accommodation, rating, comment, aspects, booking } = req.body;

    // Check if accommodation exists
    const accommodationData = await Accommodation.findById(accommodation);
    if (!accommodationData) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Check if user has already reviewed this accommodation
    const existingReview = await Review.findOne({
      student: req.user._id,
      accommodation: accommodation
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this accommodation'
      });
    }

    // Optional: Verify booking (if booking ID provided)
    if (booking) {
      const bookingData = await Booking.findOne({
        _id: booking,
        student: req.user._id,
        accommodation: accommodation,
        status: 'completed'
      });

      if (!bookingData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking or booking not completed'
        });
      }
    }

    // Create review
    const review = await Review.create({
      student: req.user._id,
      accommodation,
      booking,
      rating,
      comment,
      aspects,
      isVerified: !!booking
    });

    // Update accommodation rating
    const reviews = await Review.find({ accommodation });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    accommodationData.rating = {
      average: averageRating,
      count: reviews.length
    };
    await accommodationData.save();

    const populatedReview = await Review.findById(review._id)
      .populate('student', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/:accommodationId
// @desc    Get reviews for an accommodation
// @access  Public
router.get('/:accommodationId', async (req, res) => {
  try {
    const reviews = await Review.find({
      accommodation: req.params.accommodationId
    })
      .populate('student', 'name avatar college')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

