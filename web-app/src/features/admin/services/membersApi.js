// Members API service
import { httpMethods } from "@/config/api";

export const membersApi = {
  // Get all users (members) from the public endpoint
  getAllUsers: async () => {
    try {
      const response = await httpMethods.get("/api/user/get-all-users");
      return {
        success: true,
        data: response.data,
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching all users:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch users",
        error: error.response?.data || error.message,
      };
    }
  },
  // Test endpoint function that logs the response
  testGetAllUsers: async () => {
    console.log("🔍 Testing /api/user/get-all-users endpoint...");
    console.log(
      "📡 Full URL: https://deploy-smk.onrender.com/api/user/get-all-users"
    );

    try {
      const result = await membersApi.getAllUsers();

      if (result.success) {
        console.log("✅ API call successful!");
        console.log("📊 Response data:", result.data);
        console.log("📈 Number of users:", result.data?.length || 0);

        // Log user structure if data exists
        if (result.data && result.data.length > 0) {
          console.log("👤 Sample user structure:", result.data[0]);
        }
      } else {
        console.log("❌ API call failed:", result.message);
        console.log("🔍 Error details:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 Unexpected error during API test:", error);
      return {
        success: false,
        data: null,
        message: "Unexpected error occurred",
        error: error.message,
      };
    }
  },

  // Delete a user/member
  deleteUser: async (userId) => {
    try {
      const response = await httpMethods.delete(`/api/user/delete/${userId}`);
      return {
        success: true,
        data: response.data,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to delete user",
        error: error.response?.data || error.message,
      };
    }
  },
};

export default membersApi;
