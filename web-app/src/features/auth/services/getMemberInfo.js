import axios from "@/config/api";

export const getMemberInfo = async (userId, token) => {
  const res = await axios.get(`/api/user/get-member-by-id/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data?.member;
};
