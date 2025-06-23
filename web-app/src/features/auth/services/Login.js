import api from "@/config/api";

export const loginUser = async (userData) => {
  try {
    console.log("Sending to backend:", userData);
    const res = await api.post("/public/login", userData);
    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};
