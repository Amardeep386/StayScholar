import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Accommodations.css';
import GoogleMap from '../components/GoogleMapClean';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Accommodations = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minRent: '',
    maxRent: '',
    gender: ''
  });
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Initial fetch on mount
    fetchAccommodations(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Skip debounce on initial render as we already fired initial fetch
    if (initialLoading) return;

    // Debounce the API call - wait 500ms after filter changes stop
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAccommodations(false);
    }, 500);

    // Cleanup timer on component unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters]);

  const fetchAccommodations = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setResultsLoading(true);

    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_URL}/accommodations?${params}`);
      setAccommodations(response.data.data);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    } finally {
      setInitialLoading(false);
      setResultsLoading(false);
    }
  };


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      type: '',
      minRent: '',
      maxRent: '',
      gender: ''
    });
  };

  if (initialLoading) {
    return (
      <div className="container">
        <div className="loading" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="accommodations-page">
      <div className="container" style={{ opacity: resultsLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
        <h1 className="page-title">Browse Accommodations</h1>


        <div className="filters-section">
          <div className="filters-grid">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="Enter city"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                className="form-control"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
            <div className="form-group">
              <label>Min Rent (₹)</label>
              <input
                type="number"
                name="minRent"
                className="form-control"
                placeholder="Min"
                value={filters.minRent}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Max Rent (₹)</label>
              <input
                type="number"
                name="maxRent"
                className="form-control"
                placeholder="Max"
                value={filters.maxRent}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                className="form-control"
                value={filters.gender}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="list-section">
            <div className="accommodations-grid">
              {accommodations.length === 0 ? (
                <div className="no-results">
                  <p>No accommodations found. Try adjusting your filters.</p>
                </div>
              ) : (
                accommodations.map((acc) => (
                  <div key={acc._id} className="accommodation-card">
                    {acc.images && acc.images.length > 0 && (
                      <div className="accommodation-image">
                        <img src={acc.images[0]} alt={acc.title} />
                      </div>
                    )}
                    <div className="accommodation-content">
                      <div className="accommodation-header">
                        <h3>{acc.title}</h3>
                        <span className="accommodation-type">{acc.type}</span>
                      </div>
                      <p className="accommodation-location">
                        📍 {acc.address?.city}, {acc.address?.state}
                      </p>
                      <div className="accommodation-details">
                        <span className="rent">₹{acc.rent}/month</span>
                        {acc.rating?.average > 0 && (
                          <span className="rating">⭐ {acc.rating.average.toFixed(1)}</span>
                        )}
                      </div>
                      <div className="accommodation-amenities">
                        {acc.facilities?.wifi && <span>WiFi</span>}
                        {acc.facilities?.ac && <span>AC</span>}
                        {acc.facilities?.parking && <span>Parking</span>}
                        {acc.facilities?.security && <span>Security</span>}
                      </div>
                      <Link to={`/accommodations/${acc._id}`} className="btn btn-primary btn-block">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="map-section">
            {accommodations && accommodations.length > 0 ? (
              <GoogleMap
                height="100%"
                center={
                  accommodations[0]
                    ? { lat: accommodations[0].latitude, lng: accommodations[0].longitude }
                    : { lat: 22.3072, lng: 73.1812 }
                }
                markers={accommodations
                  .filter(a => a.latitude && a.longitude)
                  .map(a => ({
                    id: a._id,
                    lat: a.latitude,
                    lng: a.longitude,
                    title: a.title
                  }))}
              />
            ) : (
              <div className="no-results-map" style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                color: 'var(--text-secondary)'
              }}>
                <p>No locations to display</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Accommodations;

