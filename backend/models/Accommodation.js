const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['PG', 'Hostel', 'Flat', 'Shared Room'],
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  rent: {
    type: Number,
    required: [true, 'Please provide rent amount']
  },
  deposit: {
    type: Number,
    default: 0
  },
  availableFrom: {
    type: Date,
    required: true
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  rules: [{
    type: String
  }],
  nearbyColleges: [{
    name: { type: String },
    distance: { type: Number } // in km
  }],
  facilities: {
    wifi: { type: Boolean, default: false },
    electricity: { type: Boolean, default: true },
    water: { type: Boolean, default: true },
    parking: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false }
  },
  occupancy: {
    total: { type: Number, required: true },
    available: { type: Number, required: true }
  },
  genderPreference: {
    type: String,
    enum: ['Male', 'Female', 'Any'],
    default: 'Any'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for latitude and longitude for legacy frontend support
accommodationSchema.virtual('latitude').get(function () {
  return this.location?.coordinates?.[1];
});

accommodationSchema.virtual('longitude').get(function () {
  return this.location?.coordinates?.[0];
});

accommodationSchema.index({ location: '2dsphere' });
accommodationSchema.index({ owner: 1 });
accommodationSchema.index({ type: 1, city: 1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);

