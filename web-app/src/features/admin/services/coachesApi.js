// Coaches API service
import { httpMethods } from "@/config/api";

export const coachesApi = {
  // Get all coaches from the public endpoint
  getAllCoaches: async () => {
    try {
      const response = await httpMethods.get("/api/user/get-all-coaches");

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
        message: "Coaches fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching all coaches:", error);

      // Handle different types of errors
      let errorMessage = "Failed to fetch coaches";
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

  // Register a new coach
  registerCoach: async (coachData) => {
    try {
      const response = await httpMethods.post(
        "/api/admin/register-coach",
        coachData
      );
      return {
        success: true,
        data: response.data,
        message: "Coach registered successfully",
      };
    } catch (error) {
      console.error("Error registering coach:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to register coach",
        error: error.response?.data || error.message,
      };
    }
  },

  // Delete a coach
  deleteCoach: async (coachId) => {
    try {
      const response = await httpMethods.delete(
        `/api/admin/delete-coach/${coachId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Coach deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting coach:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to delete coach",
        error: error.response?.data || error.message,
      };
    }
  },

  // Test endpoint function that logs the response
  testGetAllCoaches: async () => {
    console.log("🔍 Testing /api/user/get-all-coaches endpoint...");
    console.log(
      "📡 Full URL: https://deploy-smk.onrender.com/api/user/get-all-coaches"
    );

    try {
      const result = await coachesApi.getAllCoaches();

      if (result.success) {
        console.log("✅ API call successful!");
        console.log("📊 Response data:", result.data);
        console.log("📈 Number of coaches:", result.data?.length || 0);

        // Log coach structure if data exists
        if (result.data && result.data.length > 0) {
          console.log("👨‍💼 Sample coach structure:", result.data[0]);
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
};

export default coachesApi;
