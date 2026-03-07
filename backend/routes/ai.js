const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route   POST /api/ai/recommendations
// @desc    Get AI-powered accommodation recommendations
// @access  Private
router.post('/recommendations', protect, async (req, res) => {
  try {
    const { preferences, location, budget } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/recommendations`, {
      userId: req.user._id.toString(),
      preferences,
      location,
      budget,
      userProfile: {
        role: req.user.role,
        college: req.user.college,
        course: req.user.course
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    
    // Fallback if AI service is unavailable
    if (error.code === 'ECONNREFUSED' || !error.response) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable',
        fallback: true
      });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Error getting recommendations'
    });
  }
});

// @route   POST /api/ai/predict-rent
// @desc    Predict rent for a property
// @access  Private (Owner only)
router.post('/predict-rent', protect, async (req, res) => {
  try {
    const { type, location, amenities, size, facilities } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/predict-rent`, {
      type,
      location,
      amenities,
      size,
      facilities
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Rent prediction error:', error);
    
    // Fallback if AI service is unavailable
    if (error.code === 'ECONNREFUSED' || !error.response) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable',
        fallback: true
      });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Error predicting rent'
    });
  }
});

module.exports = router;

