import axios from "@/config/api";

export const getPlansByMember = (memberId) =>
  axios.get(`/api/user/get-plans-by-member/${memberId}`).then((res) => res.data);

export const getPlanWeeks = (planId) =>
  axios.get(`/api/user/get-plan-week-by-plan/${planId}`).then((res) => res.data);

export const updatePlanDay = (weekId, dayId, body) =>
  axios.put(`/api/user/update-plan-day/week/${weekId}/day/${dayId}`, body);

export const updatePlanPhase = (phaseId, body) =>
  axios.put(`/api/user/update-plan-phase/${phaseId}`, body);

export const updateCoping = (copingId, planId, body) =>
  axios.put(`/api/user/update-coping-mechanism/${copingId}/plan/${planId}`, body);
