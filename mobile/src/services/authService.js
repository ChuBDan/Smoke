import api from "./api";

export const authService = {
  // Login user (member)
  login: async (userData) => {
    try {
      console.log("Sending login request:", userData);
      const response = await api.post("/api/public/login", userData);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // Register user (member)
  register: async (userData) => {
    try {
      console.log("Sending register request:", userData);
      const response = await api.post("/api/public/register", userData);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Login coach
  loginCoach: async (coachData) => {
    try {
      console.log("Sending coach login request:", coachData);
      const response = await api.post("/public/login-coach", coachData);
      return response.data;
    } catch (error) {
      console.error("Coach login error:", error);
      throw new Error(error.response?.data?.message || "Coach login failed");
    }
  },

  // Get member info
  getMemberInfo: async (userId, token) => {
    try {
      const response = await api.get(`/api/user/get-member-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data?.member;
    } catch (error) {
      console.error("Get member info error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get member info"
      );
    }
  },

  // Update member profile
  updateProfile: async (userId, userData, token) => {
    try {
      const response = await api.put(
        `/api/member/update-member/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },
};
