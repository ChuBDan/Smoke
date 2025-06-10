import axios from "@/config/api";

export const registerUser = async (userData) => {
  try {
    const res = await axios.post("/public/register",userData)
    return res.data
  } catch (error) {
    console.error("Error during registration:", error);
    throw new Error(error.message); 
  }
}