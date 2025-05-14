import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/pets';

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Clear invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }
  throw error.response?.data || error.message;
};

export const getAllPets = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllPets`, {
      withCredentials: true
    });
    if (response.data.success && response.data.message) {
      return response.data.message;
    }
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error in getAllPets:', error);
    throw handleApiError(error);
  }
};

export const getPetsByOwner = async (ownerId) => {
  try {
    const response = await axios.get(`${API_URL}/getPetsByOwner/${ownerId}`, {
      withCredentials: true
    });
    if (response.data.success && response.data.message) {
      return response.data.message;
    }
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error in getPetsByOwner:', error);
    throw handleApiError(error);
  }
};

export const updatePet = async (petId, petData) => {
  try {
    const response = await axios.put(`${API_URL}/updatePet/${petId}`, petData, {
      withCredentials: true
    });
    if (response.data.success) {
      // Return the message for UI acknowledgement
      return { success: true, message: response.data.message || "Pet updated successfully" };
    }
    throw new Error(response.data.data || 'Failed to update pet');
  } catch (error) {
    console.error('Error in updatePet:', error);
    throw handleApiError(error);
  }
};

export const deletePet = async (petId) => {
  try {
    const response = await axios.delete(`${API_URL}/deletePet/${petId}`, {
      withCredentials: true
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.data || 'Failed to delete pet');
  } catch (error) {
    console.error('Error in deletePet:', error);
    throw handleApiError(error);
  }
};

export const updatePetImages = async (petId, files, replace = false) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('replace', replace);

    const response = await axios.put(`${API_URL}/updatePetImages/${petId}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.message;
    }
    throw new Error(response.data.data || 'Failed to update pet images');
  } catch (error) {
    console.error('Error in updatePetImages:', error);
    throw handleApiError(error);
  }
};
