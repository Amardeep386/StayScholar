const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Accommodation = require('../models/Accommodation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/accommodations
// @desc    Get all accommodations with filters
// @access  Public
router.get('/', [
  query('city').optional().trim(),
  query('type').optional().isIn(['PG', 'Hostel', 'Flat', 'Shared Room']),
  query('minRent').optional().isNumeric(),
  query('maxRent').optional().isNumeric(),
  query('gender').optional().isIn(['Male', 'Female', 'Any']),
  query('latitude').optional().isFloat(),
  query('longitude').optional().isFloat(),
  query('radius').optional().isFloat() // in km
], async (req, res) => {
  try {
    const {
      city,
      type,
      minRent,
      maxRent,
      gender,
      latitude,
      longitude,
      radius,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }
    if (gender && gender !== 'Any') filter.genderPreference = { $in: [gender, 'Any'] };

    // Location-based search
    let query = Accommodation.find(filter);

    if (latitude && longitude && radius) {
      query = Accommodation.find({
        ...filter,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: Number(radius) * 1000 // Convert km to meters
          }
        }
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const accommodations = await query
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('owner', 'name email phone')
      .select('-__v');

    const total = await Accommodation.countDocuments(filter);

    res.json({
      success: true,
      count: accommodations.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: accommodations
    });
  } catch (error) {
    console.error('Get accommodations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/accommodations/:id
// @desc    Get single accommodation
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id)
      .populate('owner', 'name email phone avatar');

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Increment views
    accommodation.views += 1;
    await accommodation.save();

    res.json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    console.error('Get accommodation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/accommodations
// @desc    Create new accommodation
// @access  Private (Owner only)
router.post('/', protect, authorize('owner'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['PG', 'Hostel', 'Flat', 'Shared Room']).withMessage('Invalid type'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('location.latitude').isFloat().withMessage('Valid latitude is required'),
  body('location.longitude').isFloat().withMessage('Valid longitude is required'),
  body('rent').isNumeric().withMessage('Rent is required'),
  body('availableFrom').isISO8601().withMessage('Valid date is required'),
  body('occupancy.total').isInt({ min: 1 }).withMessage('Total occupancy is required'),
  body('occupancy.available').isInt({ min: 0 }).withMessage('Available occupancy is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const accommodationData = { ...req.body };

    // Transform location to GeoJSON if provided as lat/lng
    if (req.body.location && req.body.location.latitude && req.body.location.longitude) {
      accommodationData.location = {
        type: 'Point',
        coordinates: [Number(req.body.location.longitude), Number(req.body.location.latitude)]
      };
    }

    const accommodation = await Accommodation.create({
      ...accommodationData,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    console.error('Create accommodation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/accommodations/:id
// @desc    Update accommodation
// @access  Private (Owner only)
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Check ownership
    if (accommodation.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this accommodation'
      });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };

    // Transform location to GeoJSON if provided as lat/lng
    if (req.body.location && req.body.location.latitude && req.body.location.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(req.body.location.longitude), Number(req.body.location.latitude)]
      };
    }

    accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    console.error('Update accommodation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/accommodations/:id
// @desc    Delete accommodation
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Check ownership
    if (accommodation.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this accommodation'
      });
    }

    accommodation.isActive = false;
    await accommodation.save();

    res.json({
      success: true,
      message: 'Accommodation deleted successfully'
    });
  } catch (error) {
    console.error('Delete accommodation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

