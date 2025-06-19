// Members API service
import { httpMethods } from "@/config/api";

export const membersApi = {
  // Get all users (members) from the public endpoint
  getAllUsers: async () => {
    try {
      const response = await httpMethods.get("/api/user/get-all-users");

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
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching all users:", error);

      // Handle different types of errors
      let errorMessage = "Failed to fetch users";
      if (error.message.includes("JSON")) {
        errorMessage = "Server returned invalid data format";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network connection failed";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        data: null,
        message: errorMessage,
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
