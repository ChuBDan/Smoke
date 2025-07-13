import { httpMethods } from "./api";

// Smoking Cessation API (matching web-app patterns)
export const smokingCessationApi = {
  // Create smoking log
  createSmokingLog: async (memberId, smokingData, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-smoking-log/member/${memberId}`,
        smokingData
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
        `/api/user/get-smoking-logs-by-member/${userId}`
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
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  },

  getPlanByUserId: async (userId, token) => {
    const res = await httpMethods.get(
      `/api/user/get-plans-by-member/${userId}`
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
        { ...payload, date: today }
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
        `/api/user/get-progresses-by-member/${memberId}`
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
        `/api/user/buy-membership-package/${packageId}/member/${userId}`,
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
      const response = await httpMethods.get(
        `/api/user/get-member-by-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Match web-app response structure: return res.data?.member
      return response.data?.member || response.data;
    } catch (error) {
      console.error("Error fetching member by ID:", error);
      throw error;
    }
  },

  updateMemberProfile: async (userId, userData, token) => {
    try {
      const response = await httpMethods.put(
        `/api/member/update-member/${userId}`,
        userData
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

      // Match web-app response structure exactly
      const data = response.data;
      const consultations = Array.isArray(data?.consultations)
        ? data.consultations
        : Array.isArray(data)
        ? data
        : [];

      return {
        consultations,
        success: true,
        message: "Appointments fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching appointments by member:", error);

      // Handle specific error cases like web-app - don't throw, return empty
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.warn(
          "No appointments found for member (this is normal for new users)"
        );
        return {
          consultations: [],
          success: true,
          message: "No appointments found",
        };
      }

      // For other errors, still return empty but log the error
      console.error("Unexpected error fetching appointments:", error.message);
      return {
        consultations: [],
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch appointments",
      };
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

      // Match web-app response structure
      const responseData = response.data;
      return {
        success: true,
        coaches: responseData?.coaches || responseData || [],
        data: responseData,
        message: "Coaches fetched successfully",
      };
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

      // Match web-app response structure exactly
      const data = response.data;
      const consultations = Array.isArray(data?.consultations)
        ? data.consultations
        : Array.isArray(data)
        ? data
        : [];

      return {
        consultations,
        success: true,
        message: "Appointments fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching appointments by member:", error);

      // Handle specific error cases like web-app - don't throw, return empty
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.warn(
          "No appointments found for member (this is normal for new users)"
        );
        return {
          consultations: [],
          success: true,
          message: "No appointments found",
        };
      }

      // For other errors, still return empty but log the error
      console.error("Unexpected error fetching appointments:", error.message);
      return {
        consultations: [],
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch appointments",
      };
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

      // Match web-app response structure and error handling pattern
      const responseData = response.data;
      return {
        success: true,
        coaches: responseData?.coaches || responseData || [],
        data: responseData,
        message: "Coaches fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching coaches:", error);

      // Enhanced error handling like web-app
      if (error.response?.status === 400) {
        throw new Error("No coaches available");
      } else if (error.response?.status === 404) {
        throw new Error("Coaches endpoint not found");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error occurred");
      }

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

// Badge API
export const badgeApi = {
  getBadgesByMember: async (userId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-badge-by-member/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Match web-app response structure: return res.data.badges || []
      return response.data.badges || [];
    } catch (error) {
      console.error("Error fetching badges by member:", error);
      throw error;
    }
  },
};

// Payment API
export const paymentApi = {
  // Get payment transactions by member ID
  getTransactionsByMember: async (memberId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-transactions-by-member/${memberId}`
      );

      // Handle the response structure similar to web-app
      const transactions = response.data?.transactions || response.data || [];

      return {
        success: true,
        transactions: Array.isArray(transactions) ? transactions : [],
        message: "Transactions fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching payment transactions:", error);

      // Handle specific error cases gracefully
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.warn(
          "No transactions found for member (this is normal for new users)"
        );
        return {
          success: true,
          transactions: [],
          message: "No transactions found",
        };
      }

      // For other errors, still return empty but log the error
      console.error("Unexpected error fetching transactions:", error.message);
      return {
        success: false,
        transactions: [],
        message: "Unable to load payment history",
        error: error.message,
      };
    }
  },
};

// No need to export api since we're using the centralized one from api.js
