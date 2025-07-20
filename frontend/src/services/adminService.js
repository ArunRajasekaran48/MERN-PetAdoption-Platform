import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Dashboard Stats
export const fetchDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/admin/dashboard`, { withCredentials: true });
  return res.data.data;
};

// User Management
export const getAllUsers = async () => {
  const res = await axios.get(`${API_URL}/admin/users`, { withCredentials: true });
  return res.data.data;
};

// User Suspension & Ban
export const suspendUser = async (userId, days) => {
  const res = await axios.post(`${API_URL}/admin/users/${userId}/suspend`, { days }, { withCredentials: true });
  return res.data.data;
};

export const banUser = async (userId, reason) => {
  const res = await axios.post(`${API_URL}/admin/users/${userId}/ban`, { reason }, { withCredentials: true });
  return res.data.data;
};

export const unbanUser = async (userId) => {
  const res = await axios.post(`${API_URL}/admin/users/${userId}/unban`, {}, { withCredentials: true });
  return res.data.data;
};

// Pet Listings
export const getAllPetListings = async () => {
  const res = await axios.get(`${API_URL}/admin/pets`, { withCredentials: true });
  return res.data.data;
};

export const removePetListing = async (petId) => {
  const res = await axios.delete(`${API_URL}/admin/pets/${petId}`, { withCredentials: true });
  return res.data.data;
};

// Review Management
export const getAllReviews = async () => {
  const res = await axios.get(`${API_URL}/admin/reviews`, { withCredentials: true });
  return res.data.data;
};

export const deleteReview = async (reviewId) => {
  const res = await axios.delete(`${API_URL}/admin/reviews/${reviewId}`, { withCredentials: true });
  return res.data.data;
};

// Adoption Requests
export const getAllAdoptionRequests = async () => {
  const res = await axios.get(`${API_URL}/adoptionrequests/get-all-adoption-requests`, { withCredentials: true });
  // The backend returns { requests, totalCount } in .data
  // For the dashboard, we want the array of requests
  return res.data.data.requests || res.data.data;
};

export const updateAdoptionRequestStatus = async (id, status) => {
  const res = await axios.put(
    `${API_URL}/adoptionrequests/update-adoption-request-status/${id}`,
    { status },
    { withCredentials: true }
  );
  return res.data.data;
};

// Report Management
export const createReport = async ({ reportedUser, pet, reason }) => {
  const res = await axios.post(`${API_URL}/reports`, { reportedUser, pet, reason }, { withCredentials: true });
  return res.data;
};

export const getAllReports = async () => {
  const res = await axios.get(`${API_URL}/admin/reports`, { withCredentials: true });
  return res.data.data;
};

export const updateReportStatus = async (id, status) => {
  const res = await axios.put(`${API_URL}/admin/reports/${id}`, { status }, { withCredentials: true });
  return res.data.data;
};

// Review Report Management
export const createReviewReport = async ({ review, reason }) => {
  const res = await axios.post(`${API_URL}/review-reports`, { review, reason }, { withCredentials: true });
  return res.data;
};

export const getAllReviewReports = async () => {
  const res = await axios.get(`${API_URL}/admin/review-reports`, { withCredentials: true });
  return res.data.data;
};

export const updateReviewReportStatus = async (id, status) => {
  const res = await axios.put(`${API_URL}/admin/review-reports/${id}`, { status }, { withCredentials: true });
  return res.data.data;
};