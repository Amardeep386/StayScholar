import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateAccommodation.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreateAccommodation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PG',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    location: {
      latitude: '',
      longitude: ''
    },
    rent: '',
    deposit: '',
    availableFrom: new Date(),
    amenities: [],
    facilities: {
      wifi: false,
      electricity: true,
      water: true,
      parking: false,
      security: false,
      laundry: false,
      kitchen: false,
      ac: false,
      furnished: false
    },
    occupancy: {
      total: '',
      available: ''
    },
    genderPreference: 'Any',
    rules: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFacilityChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      facilities: {
        ...formData.facilities,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        rent: Number(formData.rent),
        deposit: Number(formData.deposit) || 0,
        location: {
          latitude: Number(formData.location.latitude),
          longitude: Number(formData.location.longitude)
        },
        occupancy: {
          total: Number(formData.occupancy.total),
          available: Number(formData.occupancy.available)
        },
        availableFrom: formData.availableFrom.toISOString()
      };

      const response = await axios.post(`${API_URL}/accommodations`, submitData);
      toast.success('Accommodation created successfully!');
      navigate(`/accommodations/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create accommodation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-accommodation-page">
      <div className="container">
        <h1 className="page-title">List New Accommodation</h1>
        <form onSubmit={handleSubmit} className="accommodation-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="address.street"
                className="form-control"
                value={formData.address.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="address.city"
                  className="form-control"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="address.state"
                  className="form-control"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="address.pincode"
                  className="form-control"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="address.landmark"
                  className="form-control"
                  value={formData.address.landmark}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="location.latitude"
                  className="form-control"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="location.longitude"
                  className="form-control"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Availability</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Monthly Rent (₹) *</label>
                <input
                  type="number"
                  name="rent"
                  className="form-control"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Security Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  className="form-control"
                  value={formData.deposit}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Available From *</label>
              <DatePicker
                selected={formData.availableFrom}
                onChange={(date) => setFormData({ ...formData, availableFrom: date })}
                minDate={new Date()}
                className="form-control"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Total Occupancy *</label>
                <input
                  type="number"
                  name="occupancy.total"
                  className="form-control"
                  value={formData.occupancy.total}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Available Rooms *</label>
                <input
                  type="number"
                  name="occupancy.available"
                  className="form-control"
                  value={formData.occupancy.available}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gender Preference</label>
              <select
                name="genderPreference"
                className="form-control"
                value={formData.genderPreference}
                onChange={handleChange}
              >
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Facilities</h2>
            <div className="facilities-grid">
              {Object.keys(formData.facilities).map((facility) => (
                <label key={facility} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={facility}
                    checked={formData.facilities[facility]}
                    onChange={handleFacilityChange}
                  />
                  <span>{facility.charAt(0).toUpperCase() + facility.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Creating...' : 'Create Accommodation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccommodation;

