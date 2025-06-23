import api from "@/config/api";

export const loginAdmin = async (adminData) => {
  try {
    console.log("Sending admin login to backend:", adminData);
    const res = await api.post("/api/public/login-admin", {
      username: adminData.username,
      password: adminData.password,
    });
    return res.data;
  } catch (error) {
    console.error("Error during admin login:", error);
    throw new Error(error.response?.data?.message || "Admin login failed");
  }
};
