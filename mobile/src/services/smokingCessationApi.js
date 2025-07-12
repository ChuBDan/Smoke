import axios from "axios";
import * as SecureStore from "expo-secure-store";

// API configuration
const API_BASE_URL = "https://deploy-smk.onrender.com";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      // You might want to dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

// HTTP Methods object for easy API calls
export const httpMethods = {
  get: (endpoint, config = {}) => api.get(endpoint, config),
  post: (endpoint, data = {}, config = {}) => api.post(endpoint, data, config),
  put: (endpoint, data = {}, config = {}) => api.put(endpoint, data, config),
  patch: (endpoint, data = {}, config = {}) =>
    api.patch(endpoint, data, config),
  delete: (endpoint, config = {}) => api.delete(endpoint, config),
};

// Smoking Cessation API (matching web-app patterns)
export const smokingCessationApi = {
  // Create smoking log
  createSmokingLog: async (memberId, smokingData, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-smoking-log/member/${memberId}`,
        smokingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating smoking log:", error);
      throw error;
    }
  },

  getSmokingLogByMemberId: async (userId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-smoking-logs-by-member/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching smoking log:", error);
      throw error;
    }
  },

  createPlan: async (memberId, smokingLogId, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-plan/member/${memberId}/smoking-log/${smokingLogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  },

  getPlanByUserId: async (userId, token) => {
    const res = await httpMethods.get(
      `/api/user/get-plans-by-member/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const rawPlans = res.data?.plans ?? (res.data?.plan ? [res.data.plan] : []);

    const normalizedPlans = rawPlans.map((plan) => ({
      ...plan,
      phases: res.data?.planPhases ?? [],
      planWeeks: res.data?.planWeeks ?? [],
      copingMechanisms: res.data?.copingMechanisms ?? [],
    }));

    return { ...res.data, plans: normalizedPlans };
  },

  submitDailyProgress: async (memberId, payload, token) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data } = await httpMethods.post(
        `/api/user/create-progress/member/${memberId}`,
        { ...payload, date: today },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return data;
    } catch (err) {
      console.error("Error submit progress:", err);
      throw err;
    }
  },

  getDailyProgressByMemberId: async (memberId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-progresses-by-member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching daily progress by member:", error);
      throw error;
    }
  },
};

// Membership API
export const membershipApi = {
  getAllMembershipPackages: async (token) => {
    try {
      const response = await httpMethods.get(
        "/api/user/get-all-membership-packages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching membership packages:", error);
      throw error;
    }
  },

  buyMembershipPackage: async (packageId, userId, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/buy-membership-package/${packageId}/user/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error buying membership package:", error);
      throw error;
    }
  },
};

// User API
export const userApi = {
  getMemberById: async (userId, token) => {
    try {
      const response = await httpMethods.get(`/api/user/get-member/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching member by ID:", error);
      throw error;
    }
  },

  updateMemberProfile: async (userId, userData, token) => {
    try {
      const response = await httpMethods.put(
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
      console.error("Error updating member profile:", error);
      throw error;
    }
  },

  updateMemberById: async (userId, userData, token) => {
    try {
      const response = await httpMethods.put(
        `/api/user/update-member-by-id/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating member by ID:", error);
      throw error;
    }
  },

  // Get appointments by member
  getAppointmentsByMember: async (memberId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-consultations-by-member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments by member:", error);
      throw error;
    }
  },

  // Create consultation/appointment
  createConsultation: async (coachId, memberId, consultationData, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-consultation/coach/${coachId}/member/${memberId}`,
        consultationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw error;
    }
  },

  // Get all coaches
  getAllCoaches: async (token) => {
    try {
      const response = await httpMethods.get(`/api/user/get-all-coaches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching coaches:", error);
      throw error;
    }
  },
};

// Appointment API
export const appointmentApi = {
  createConsultation: async (coachId, memberId, appointmentData, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-consultation/coach/${coachId}/member/${memberId}`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw error;
    }
  },

  getAppointmentsByMember: async (memberId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-consultations-by-member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments by member:", error);
      throw error;
    }
  },

  cancelAppointment: async (appointmentId, token) => {
    try {
      const response = await httpMethods.put(
        `/api/user/cancel-consultation/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  },

  updateAppointment: async (appointmentId, updateData, token) => {
    try {
      const response = await httpMethods.put(
        `/api/user/update-consultation/${appointmentId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },
};

// Coaches API
export const coachApi = {
  getAllCoaches: async (token) => {
    try {
      const response = await httpMethods.get(`/api/user/get-all-coaches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching coaches:", error);
      throw error;
    }
  },

  getCoachById: async (coachId, token) => {
    try {
      const response = await httpMethods.get(`/api/user/get-coach/${coachId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching coach by ID:", error);
      throw error;
    }
  },
};

export default api;
