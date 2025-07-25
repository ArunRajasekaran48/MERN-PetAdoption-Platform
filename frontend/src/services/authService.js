import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL 

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    }
  }
}

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    }
  }
}

export const logoutUser = async () => {
  try {
    // Call backend logout endpoint to clear cookie (if implemented)
    await axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
  } catch (e) {
    // Ignore errors for logout
  }
  // Remove user info from localStorage
  localStorage.removeItem("user");
  // Optionally, you can redirect or refresh the page here if needed
  // window.location.href = "/login"; // Uncomment if you want to redirect
}

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user || user === "undefined" || user === "null") return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/users/request-reset-password`, { email }, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to request password reset",
    }
  }
}

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/users/reset-password`, { token, newPassword }, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset password",
    }
  }
}

export const changeCurrentPassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/users/changepassword`, data, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password",
    }
  }
};

export const updateAccountDetails = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/users/change-account-details`, data, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update account details",
    }
  }
};