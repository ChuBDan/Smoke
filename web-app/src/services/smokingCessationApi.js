import { httpMethods } from "@/config/api";

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

  getSmokingLogById: async (smokingLogId, token) => {
    try {
      const response = await httpMethods.get(
        `/api/user/get-smoking-log/${smokingLogId}`,
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

  updateSmokingLog: async (smokingLogId, updateData) => {
    try {
      const response = await httpMethods.put(
        `/api/user/update-smoking-log/${smokingLogId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating smoking log:", error);
      throw error;
    }
  },

  getAllSmokingLogs: async () => {
    try {
      const response = await httpMethods.get("/api/user/get-all-smoking-logs");
      return response.data;
    } catch (error) {
      console.error("Error fetching all smoking logs:", error);
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

  const rawPlans = res.data?.plans
    ?? (res.data?.plan ? [res.data.plan] : []);

  const normalizedPlans = rawPlans.map((plan) => ({
    ...plan,
    phases: res.data?.planPhases ?? [],
    planWeeks: res.data?.planWeeks ?? [],
    copingMechanisms: res.data?.copingMechanisms ?? [],
  }));

  return { ...res.data, plans: normalizedPlans };
},



  deletePlan: async (planId) => {
    try {
      const response = await httpMethods.delete(
        `/api/user/delete-plan/${planId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting plan:", error);
      throw error;
    }
  },

  createProgress: async (memberId, progressData, token) => {
    try {
      const response = await httpMethods.post(
        `/api/user/create-progress/member/${memberId}`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating progress:", error);
      throw error;
    }
  },

  updateProgress: async (progressId, progressData, token) => {
    try {
      const response = await httpMethods.put(
        `/api/user/update-progress/${progressId}`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },

  submitDailyProgress: async (memberId, payload, token) => {
  /**
   * payload gồm:
   * { daysSmokeFree: number, healthImprovement: 'GOOD'|'NORMAL'|'BAD', completed: true }
   */
  try {
    const today = new Date().toISOString().split("T")[0];

    // gọi BE
    const { data } = await httpMethods.post(
      `/api/user/create-progress/member/${memberId}`,
      { ...payload, date: today },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // BE trả về { moneySaved: number, ... }
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
