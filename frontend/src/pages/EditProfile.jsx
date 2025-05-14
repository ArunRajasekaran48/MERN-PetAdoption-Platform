import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { changeCurrentPassword, updateAccountDetails } from '../services/authService';

const EditProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'password'

  // Account details state
  const [accountDetails, setAccountDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Password change state
  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setAccountDetails({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          });
        }
      } catch (error) {
        showToast('Failed to load user data', 'error');
      }
    };

    fetchUserData();
  }, []);

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordDetails.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordDetails.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordDetails.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAccountForm = () => {
    const newErrors = {};
    if (!accountDetails.name) {
      newErrors.name = 'Name is required';
    }
    if (!accountDetails.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(accountDetails.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!accountDetails.phone) {
      newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);
      const response = await changeCurrentPassword({
        oldPassword: passwordDetails.currentPassword,
        newPassword: passwordDetails.newPassword
      });
      
      if (response.success) {
        showToast('✅ Password updated successfully');
        setPasswordDetails({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showToast(response.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    if (!validateAccountForm()) return;

    try {
      setLoading(true);
      const response = await updateAccountDetails(accountDetails);
      
      if (response.success) {
        showToast('✅ Profile updated successfully');
        
        // Update local storage with new user data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({ ...userData, ...response.data }));
        }
      } else {
        showToast(response.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
        <div className="w-24"></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'account'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('account')}
        >
          Account Details
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'password'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      {/* Account Details Form */}
      {activeTab === 'account' && (
        <form onSubmit={handleAccountUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={accountDetails.name}
              onChange={(e) => setAccountDetails({ ...accountDetails, name: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={accountDetails.email}
              onChange={(e) => setAccountDetails({ ...accountDetails, email: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={accountDetails.phone}
              onChange={(e) => setAccountDetails({ ...accountDetails, phone: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )}

      {/* Password Change Form */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwordDetails.currentPassword}
              onChange={(e) => setPasswordDetails({ ...passwordDetails, currentPassword: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.currentPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordDetails.newPassword}
              onChange={(e) => setPasswordDetails({ ...passwordDetails, newPassword: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.newPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={passwordDetails.confirmPassword}
              onChange={(e) => setPasswordDetails({ ...passwordDetails, confirmPassword: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProfile; 