import axios from "@/config/api";

export const loginAdmin = async (adminData) => {
  try {
    console.log("Sending admin login to backend:", adminData);
    const res = await axios.post("/api/public/login-admin", adminData);
    return res.data;
  } catch (error) {
    console.error("Error during admin login:", error);
    throw new Error(error.response?.data?.message || "Admin login failed");
  }
};
