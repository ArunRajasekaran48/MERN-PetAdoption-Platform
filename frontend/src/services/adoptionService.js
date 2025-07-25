import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;
export const createAdoptionRequest = async (petId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      throw new Error('User not logged in');
    }
    const response = await axios.post(
      `${API_URL}/adoptionrequests/create-adoption-request`,
      { petId, userId: user._id },
      { withCredentials: true }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create adoption request'
    };
  }
};

export const getOutgoingAdoptionRequests = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/adoptionrequests/outgoing-requests`,
      { withCredentials: true }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch outgoing requests'
    };
  }
};

export const getIncomingAdoptionRequests = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/adoptionrequests/incoming-requests`,
      { withCredentials: true }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch incoming requests'
    };
  }
};

export const updateAdoptionRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/adoptionrequests/update-adoption-request-status/${requestId}`,
      { status },
      { withCredentials: true }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update request status'
    };
  }
};

export const cancelAdoptionRequest = async (requestId) => {
  try {
    await axios.delete(
      `${API_URL}/adoptionrequests/delete-adoption-request/${requestId}`,
      { withCredentials: true }
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel adoption request'
    };
  }
};

export const submitAdoptionReview = async (requestId, reviewData) => {
  try {
    const response = await axios.post(
      `${API_URL}/reviews/add-review`,
      {
        petId: reviewData.petId,
        rating: reviewData.rating,
        comment: reviewData.comment
      },
      { withCredentials: true }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit review'
    };
  }
};

export const countPendingRequestsForPet = async (petId) => {
  try {
    const response = await axios.get(
      `${API_URL}/adoptionrequests/get-all-adoption-requests`,
      {
        params: { petId, status: 'pending' },
        withCredentials: true,
      }
    );
    return {
      success: true,
      count: response.data.data.totalCount || 0,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: error.response?.data?.message || 'Failed to count pending requests',
    };
  }
};