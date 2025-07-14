import axios from "@/config/api"; 

export const getConsultationsByCoach = async (coachId, token) => {
  const res = await axios.get(`/api/user/get-consultations-by-coach/${coachId}`, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return res.data;
};
