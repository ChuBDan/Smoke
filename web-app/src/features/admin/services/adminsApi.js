import apiConfig from "@/config/api";

const adminsApi = {
  // Get all admins
  getAllAdmins: async () => {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/admin/get-all-admins`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  },

  // Register new admin
  registerAdmin: async (adminData) => {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/public/register-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adminData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error registering admin:", error);
      throw error;
    }
  },

  // Delete admin
  deleteAdmin: async (adminId) => {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/admin/delete-admin/${adminId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting admin:", error);
      throw error;
    }
  },

  // Get admin by ID
  getAdminById: async (adminId) => {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/admin/get-admin-by-id/${adminId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching admin:", error);
      throw error;
    }
  },

  // Update admin (if needed)
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/admin/update-admin/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(adminData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  },
};

export default adminsApi;
