import api from "@/config/api";

export const loginCoach = async (coachData) => {
  try {
    console.log("Sending to backend:", coachData);
    const res = await api.post("/api/public/login-coach", coachData);
    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};
