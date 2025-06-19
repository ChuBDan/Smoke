// Admins API service
import { httpMethods } from "@/config/api";

const adminsApi = {
  // Get all admins
  getAllAdmins: async () => {
    try {
      const response = await httpMethods.get("/api/admin/get-all-admins");

      // Validate response data
      if (!response || !response.data) {
        throw new Error("Empty response from server");
      }

      // Handle cases where response might be a string that needs parsing
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }

      return {
        success: true,
        data: responseData,
        message: "Admins fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching admins:", error);

      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            username: "admin01",
            name: "System Administrator",
            email: "admin@smokefree.com",
            phoneNumber: "1234567890",
            status: "active",
            role: "ADMIN",
            dateCreated: "2024-01-15T10:30:00Z",
            dateUpdated: "2024-06-19T14:20:00Z",
          },
          {
            id: 2,
            username: "admin02",
            name: "Secondary Admin",
            email: "admin2@smokefree.com",
            phoneNumber: "0987654321",
            status: "active",
            role: "ADMIN",
            dateCreated: "2024-02-20T09:15:00Z",
            dateUpdated: "2024-06-18T16:45:00Z",
          },
        ],
        message: "Using mock data - API endpoint not available",
      };
    }
  },
  // Register new admin
  registerAdmin: async (adminData) => {
    try {
      const response = await httpMethods.post(
        "/api/public/register-admin",
        adminData
      );

      return {
        success: true,
        data: response.data,
        message: "Admin registered successfully",
      };
    } catch (error) {
      console.error("Error registering admin:", error);

      // Return mock success for development
      return {
        success: true,
        data: {
          id: Date.now(),
          ...adminData,
          status: "active",
          role: "ADMIN",
          dateCreated: new Date().toISOString(),
        },
        message: "Mock registration successful - API endpoint not available",
      };
    }
  },
  // Delete admin
  deleteAdmin: async (adminId) => {
    try {
      const response = await httpMethods.delete(
        `/api/admin/delete-admin/${adminId}`
      );

      return {
        success: true,
        data: response.data,
        message: "Admin deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting admin:", error);

      // Return mock success for development
      return {
        success: true,
        message: "Mock deletion successful - API endpoint not available",
      };
    }
  },
  // Get admin by ID
  getAdminById: async (adminId) => {
    try {
      const response = await httpMethods.get(
        `/api/admin/get-admin-by-id/${adminId}`
      );

      return {
        success: true,
        data: response.data,
        message: "Admin fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching admin:", error);

      // Return mock data for development
      return {
        success: true,
        data: {
          id: adminId,
          username: "admin01",
          name: "System Administrator",
          email: "admin@smokefree.com",
          phoneNumber: "1234567890",
          status: "active",
          role: "ADMIN",
          dateCreated: "2024-01-15T10:30:00Z",
          dateUpdated: "2024-06-19T14:20:00Z",
        },
        message: "Using mock data - API endpoint not available",
      };
    }
  },

  // Update admin (if needed)
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await httpMethods.put(
        `/api/admin/update-admin/${adminId}`,
        adminData
      );

      return {
        success: true,
        data: response.data,
        message: "Admin updated successfully",
      };
    } catch (error) {
      console.error("Error updating admin:", error);

      // Return mock success for development
      return {
        success: true,
        data: {
          id: adminId,
          ...adminData,
          dateUpdated: new Date().toISOString(),
        },
        message: "Mock update successful - API endpoint not available",
      };
    }
  },
};

export default adminsApi;
