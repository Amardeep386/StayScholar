import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    course: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        course: user.course || '',
        year: user.year || ''
      });
      if (user.avatar) {
        setPreviewUrl(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    setPreviewUrl(URL.createObjectURL(file));

    setUploading(true);
    const avatarData = new FormData();
    avatarData.append('avatar', file);

    try {
      const response = await axios.put(`${API_URL}/auth/avatar`, avatarData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast.success('Avatar updated');
        fetchUser();
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/auth/update-profile`, formData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        fetchUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">
                {user.name?.charAt(0)}
              </div>
            )}
            <label htmlFor="avatar-upload" className="avatar-upload-label">
              <input
                type="file"
                id="avatar-upload"
                hidden
                onChange={handleAvatarChange}
                accept="image/*"
              />
              <span style={{ fontSize: '20px' }}>{uploading ? '⌛' : '📸'}</span>
            </label>
          </div>
          <div className="header-info">
            <h1>{user.name}</h1>
            <p>{user.role} Dashboard</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-section-card">
            <h2 className="section-title-modern">Personal Information</h2>
            <form onSubmit={handleSubmit} className="modern-form-grid">
              <div className="form-group-modern">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-modern"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-modern">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input-modern"
                  value={user.email}
                  disabled
                />
              </div>
              <div className="form-group-modern">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input-modern"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (234) 567-890"
                />
              </div>

              {user.role === 'student' && (
                <>
                  <div className="form-group-modern">
                    <label>College / University</label>
                    <input
                      type="text"
                      name="college"
                      className="input-modern"
                      value={formData.college}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group-modern">
                    <label>Major / Course</label>
                    <input
                      type="text"
                      name="course"
                      className="input-modern"
                      value={formData.course}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group-modern">
                    <label>Academic Year</label>
                    <input
                      type="text"
                      name="year"
                      className="input-modern"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g. Sophomore, Final Year"
                    />
                  </div>
                </>
              )}

              <div className="form-group-modern full-width">
                <button type="submit" className="btn-update" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

