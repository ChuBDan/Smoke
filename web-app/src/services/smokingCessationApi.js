import { httpMethods } from "@/config/api"

export const smokingCessationApi = {
    // Create smoking log
    createSmokingLog: async (memberId, smokingData, token) => {
        try {
            const response = await httpMethods.post(`/user/create-smoking-log/member/${memberId}`, smokingData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error creating smoking log:", error)
            throw error
        }
    },

    getSmokingLogById: async (smokingLogId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-smoking-log/${smokingLogId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching smoking log:", error)
            throw error
        }
    },

    getSmokingLogByMemberId: async (userId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-smoking-logs-by-member/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching smoking log:", error)
            throw error
        }
    },

    updateSmokingLog: async (smokingLogId, updateData) => {
        try {
            const response = await httpMethods.put(`/user/update-smoking-log/${smokingLogId}`, updateData)
            return response.data
        } catch (error) {
            console.error("Error updating smoking log:", error)
            throw error
        }
    },

    getAllSmokingLogs: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-smoking-logs")
            return response.data
        } catch (error) {
            console.error("Error fetching all smoking logs:", error)
            throw error
        }
    },

    createPlan: async (memberId, smokingLogId, token) => {
        try {
            const response = await httpMethods.post(`/user/create-plan/member/${memberId}/smoking-log/${smokingLogId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error creating plan:", error)
            throw error
        }
    },

    getPlanByUserId: async (userId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-plans-by-member/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching plan:", error)
            throw error
        }
    },

    getPlan: async (planId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-plan/${planId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching plan:", error)
            throw error
        }
    },

    deletePlan: async (planId) => {
        try {
            const response = await httpMethods.delete(`/user/delete-plan/${planId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting plan:", error)
            throw error
        }
    },

    createProgress: async (memberId, progressData, token) => {
        try {
            const response = await httpMethods.post(`/user/create-progress/member/${memberId}`, progressData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error creating progress:", error)
            throw error
        }
    },

    getProgress: async (progressId, token) => {
        try {
            const response = await httpMethods.get(`/public/get-progress/${progressId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching progress:", error)
            throw error
        }
    },

    updateProgress: async (progressId, progressData, token) => {
        try {
            const response = await httpMethods.put(`/user/update-progress/${progressId}`, progressData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error updating progress:", error)
            throw error
        }
    },

    getAllProgresses: async (token) => {
        try {
            const response = await httpMethods.get("/public/get-all-progresses", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching all progresses:", error)
            throw error
        }
    },

    deleteProgress: async (progressId) => {
        try {
            const response = await httpMethods.delete(`/public/delete-progress/${progressId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting progress:", error)
            throw error
        }
    },

    createConsultation: async (coachId, memberId, consultationData) => {
        try {
            const response = await httpMethods.post(`/user/create-consultation/coach/${coachId}/member/${memberId}`, consultationData)
            return response.data
        } catch (error) {
            console.error("Error creating consultation:", error)
            throw error
        }
    },

    getConsultation: async (consultationId) => {
        try {
            const response = await httpMethods.get(`/user/get-consultation/${consultationId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching consultation:", error)
            throw error
        }
    },

    createNotification: async (memberId, notificationData) => {
        try {
            const response = await httpMethods.post(`/user/create-notification/member/${memberId}`, notificationData)
            return response.data
        } catch (error) {
            console.error("Error creating notification:", error)
            throw error
        }
    },

    getAllNotifications: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-notifications")
            return response.data
        } catch (error) {
            console.error("Error fetching notifications:", error)
            throw error
        }
    },

    askAI: async (question, context = null) => {
        try {
            const response = await httpMethods.post("/public/ai/ask", {
                question,
                context,
            })
            return response.data
        } catch (error) {
            console.error("Error asking AI:", error)
            throw error
        }
    },

    askAIWithSchema: async (question, schema) => {
        try {
            const response = await httpMethods.post("/public/ai/ask/schema", {
                question,
                schema,
            })
            return response.data
        } catch (error) {
            console.error("Error asking AI with schema:", error)
            throw error
        }
    },

    getAIPlan: async (token) => {
        try {
            const response = await httpMethods.get(`/public/ai/ask/schema`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching AI plan:", error)
            throw error
        }
    },

    submitDailyProgress: async (memberId, progressData, token) => {
        try {
            const today = new Date().toISOString().split("T")[0]
            const allProgresses = await smokingCessationApi.getAllProgresses(token)

            const todayProgress = allProgresses.find(p => p.memberId === memberId && p.date === today)

            if (todayProgress) {
                const response = await httpMethods.put(`/public/update-progress/${todayProgress.id}`, {
                    ...progressData,
                    date: today,
                    memberId,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                return response.data
            } else {
                const response = await httpMethods.post(`/api/public/create-progress/member/${memberId}`, {
                    ...progressData,
                    date: today,
                })
                return response.data
            }
        } catch (error) {
            console.error("Error submitting daily progress:", error)
            throw error
        }
    },

    getDailyProgressStatus: async (memberId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-daily-progress/member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching daily progress:", error)
            throw error
        }
    },

    getDailyProgressByMemberId: async (memberId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-progresses-by-member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching daily progress by member:", error)
            throw error
        }
    },

    getMemberProgressHistory: async (memberId, token) => {
        try {
            const response = await httpMethods.get("/public/get-all-progresses", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const allProgresses = response.data
            return allProgresses.filter((p) => p.memberId === memberId)
        } catch (error) {
            console.error("Error fetching member progress history:", error)
            throw error
        }
    },
}
