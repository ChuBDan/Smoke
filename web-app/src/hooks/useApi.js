import { useState, useEffect, useCallback } from "react";
import apiManager from "@/services/apiManager";

/**
 * Custom hook for handling API calls with loading states
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies for the effect
 * @param {boolean} immediate - Whether to call immediately
 */
export const useApi = (apiCall, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};

/**
 * Hook for authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        if (apiManager.isAuthenticated()) {
          const currentUser = await apiManager.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiManager.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiManager.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await apiManager.updateCurrentUser(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    userRole: user?.role,
  };
};

/**
 * Hook for fetching users with filters and pagination
 */
export const useUsers = (role = "all", initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchUsers = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...initialParams, ...params };
        const response = await apiManager.getUsersList(role, mergedParams);

        if (role === "all") {
          setUsers(response);
        } else {
          setUsers(response.data || response);
          setPagination(response.pagination || pagination);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [role, initialParams]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    fetchUsers,
  };
};

/**
 * Hook for managing appointments
 */
export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiManager.getMyAppointments(params);
      setAppointments(response.data || response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const bookAppointment = async (doctorId, dateTime, notes) => {
    try {
      const response = await apiManager.bookNewAppointment(
        doctorId,
        dateTime,
        notes
      );
      await fetchAppointments(); // Refresh list
      return response;
    } catch (error) {
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await apiManager.appointments.cancelAppointment(appointmentId);
      await fetchAppointments(); // Refresh list
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    bookAppointment,
    cancelAppointment,
    refetch: fetchAppointments,
  };
};

/**
 * Hook for fetching doctors
 */
export const useDoctors = (specialty = null) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (specialty) {
          response = await apiManager.getDoctorsBySpecialty(specialty);
        } else {
          response = await apiManager.getAllDoctors(params);
        }

        setDoctors(response.data || response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [specialty]
  );

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    refetch: fetchDoctors,
  };
};

/**
 * Hook for admin dashboard data
 */
export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiManager.getAdminDashboard();
      setDashboardData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

/**
 * Hook for coach dashboard data
 */
export const useCoachDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiManager.getCoachDashboard();
      setDashboardData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

/**
 * Hook for file upload with progress
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, type = "document") => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      let response;
      if (type === "avatar") {
        response = await apiManager.uploadAvatar(file);
      } else {
        response = await apiManager.uploadDocument(file, type);
      }

      setProgress(100);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progress,
    error,
    uploadFile,
  };
};

/**
 * Hook for handling form submission with API calls
 */
export const useFormSubmission = (submitFunction) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await submitFunction(formData);
      setSuccess(true);
    } catch (err) {
      setError(apiManager.handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submit,
    submitting,
    error,
    success,
    reset,
  };
};
