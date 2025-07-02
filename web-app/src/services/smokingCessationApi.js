import { httpMethods } from "@/config/api"

// Smoking Cessation API endpoints
export const smokingCessationApi = {
    // Create smoking log (initial smoking status form)
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

    // Get smoking log
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

<<<<<<< HEAD
=======
    // Get smoking log
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

>>>>>>> 46ea0bb (progress)
    // Update smoking log
    updateSmokingLog: async (smokingLogId, updateData) => {
        try {
            const response = await httpMethods.put(`/user/update-smoking-log/${smokingLogId}`, updateData)
            return response.data
        } catch (error) {
            console.error("Error updating smoking log:", error)
            throw error
        }
    },

    // Get all smoking logs
    getAllSmokingLogs: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-smoking-logs")
            return response.data
        } catch (error) {
            console.error("Error fetching all smoking logs:", error)
            throw error
        }
    },

    // Create AI-powered plan
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
    // Get user's plan
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
    // Get user's plan
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

    // Delete plan
    deletePlan: async (planId) => {
        try {
            const response = await httpMethods.delete(`/user/delete-plan/${planId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting plan:", error)
            throw error
        }
    },

    // Create progress entry
<<<<<<< HEAD
    createProgress: async (memberId, progressData) => {
        try {
            const response = await httpMethods.post(`/public/create-progress/member/${memberId}`, progressData)
=======
    createProgress: async (memberId, progressData, token) => {
        try {
            const response = await httpMethods.post(`/user/create-progress/member/${memberId}`, progressData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
>>>>>>> 46ea0bb (progress)
            return response.data
        } catch (error) {
            console.error("Error creating progress:", error)
            throw error
        }
    },

    // Get progress
<<<<<<< HEAD
    getProgress: async (progressId) => {
        try {
            const response = await httpMethods.get(`/public/get-progress/${progressId}`)
=======
    getProgress: async (progressId, token) => {
        try {
            const response = await httpMethods.get(`/public/get-progress/${progressId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
>>>>>>> 46ea0bb (progress)
            return response.data
        } catch (error) {
            console.error("Error fetching progress:", error)
            throw error
        }
    },

    // Update progress
<<<<<<< HEAD
    updateProgress: async (progressId, progressData) => {
        try {
            const response = await httpMethods.put(`/public/update-progress/${progressId}`, progressData)
=======
    updateProgress: async (progressId, progressData, token) => {
        try {
            const response = await httpMethods.put(`/user/update-progress/${progressId}`, progressData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
>>>>>>> 46ea0bb (progress)
            return response.data
        } catch (error) {
            console.error("Error updating progress:", error)
            throw error
        }
    },

    // Get all progresses
<<<<<<< HEAD
    getAllProgresses: async () => {
        try {
            const response = await httpMethods.get("/public/get-all-progresses")
=======
    getAllProgresses: async (token) => {
        try {
            const response = await httpMethods.get("/public/get-all-progresses", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
>>>>>>> 46ea0bb (progress)
            return response.data
        } catch (error) {
            console.error("Error fetching all progresses:", error)
            throw error
        }
    },
<<<<<<< HEAD
=======
    // Delete progress
    deleteProgress: async (progressId) => {
        try {
            const response = await httpMethods.delete(`/public/delete-progress/${progressId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting progress:", error)
            throw error
        }
    },

>>>>>>> 46ea0bb (progress)

    // Create consultation
    createConsultation: async (coachId, memberId, consultationData) => {
        try {
            const response = await httpMethods.post(
                `/user/create-consultation/coach/${coachId}/member/${memberId}`,
                consultationData,
            )
            return response.data
        } catch (error) {
            console.error("Error creating consultation:", error)
            throw error
        }
    },

    // Get consultation
    getConsultation: async (consultationId) => {
        try {
            const response = await httpMethods.get(`/user/get-consultation/${consultationId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching consultation:", error)
            throw error
        }
    },

    // Create notification
    createNotification: async (memberId, notificationData) => {
        try {
            const response = await httpMethods.post(`/user/create-notification/member/${memberId}`, notificationData)
            return response.data
        } catch (error) {
            console.error("Error creating notification:", error)
            throw error
        }
    },

    // Get all notifications
    getAllNotifications: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-notifications")
            return response.data
        } catch (error) {
            console.error("Error fetching notifications:", error)
            throw error
        }
    },

    // AI Chat functionality
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

    // AI with schema
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

<<<<<<< HEAD
    // Get AI-generated plan for VIP members
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

    // Submit daily progress for VIP members
    submitDailyProgress: async (memberId, progressData, token) => {
        try {
            const response = await httpMethods.post(`/user/submit-daily-progress/member/${memberId}`, progressData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
=======


    // Submit daily progress for VIP members (using the progress endpoints)
    submitDailyProgress: async (memberId, progressData, token) => {
        try {
            // First try to get existing progress for today
            const today = new Date().toISOString().split("T")[0]
            const existingProgress = await smokingCessationApi.getAllProgresses()

            // Check if progress already exists for today
            const todayProgress = existingProgress.find((p) => p.memberId === memberId && p.date === today)

            if (todayProgress) {
                // Update existing progress
                const response = await httpMethods.put(`/public/update-progress/${todayProgress.id}`, {

                    ...progressData,
                    date: today,
                    memberId: memberId,
                },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                return response.data
            } else {
                // Create new progress
                const response = await httpMethods.post(`/api/public/create-progress/member/${memberId}`, {
                    ...progressData,
                    date: today,
                })
                return response.data
            }
>>>>>>> 46ea0bb (progress)
        } catch (error) {
            console.error("Error submitting daily progress:", error)
            throw error
        }
    },

<<<<<<< HEAD
    // Get daily progress status
    getDailyProgressStatus: async (memberId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-daily-progress/member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
=======
    getDailyProgressByMemberId: async (memberId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-progresses-by-member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
>>>>>>> 46ea0bb (progress)
            })
            return response.data
        } catch (error) {
            console.error("Error fetching daily progress:", error)
            throw error
        }
    },
<<<<<<< HEAD
=======

    // Get member's progress history
    getMemberProgressHistory: async (memberId, token) => {
        try {
            const response = await httpMethods.get("/public/get-all-progresses", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const allProgresses = response.data

            // Filter and return progresses for this member
            return allProgresses.filter((p) => p.memberId === memberId)
        } catch (error) {
            console.error("Error fetching member progress history:", error)
            throw error
        }
    },
>>>>>>> 46ea0bb (progress)
}

// Membership API
export const membershipApi = {
    // Get all membership packages
    getAllMembershipPackages: async (token) => {
        try {
            const response = await httpMethods.get("/user/get-all-membership-packages", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching membership packages:", error)
            throw error
        }
    },

    // Get membership package by ID
    getMembershipPackage: async (packageId) => {
        try {
            const response = await httpMethods.get(`/user/get-membership-package-by-id/${packageId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching membership package:", error)
            throw error
        }
    },

    // Buy membership package
    buyMembershipPackage: async (packageId, memberId) => {
        try {
            const response = await httpMethods.post(`/user/buy-membership-package/${packageId}/member/${memberId}`)
            return response.data
        } catch (error) {
            console.error("Error buying membership package:", error)
            throw error
        }
    },
}

// User/Member API
export const userApi = {
    // Get member by ID
    getMemberById: async (memberId, token) => {
        try {
            const response = await httpMethods.get(`/user/get-member-by-id/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error("Error fetching member:", error)
            throw error
        }
    },

    // Update member
    updateMember: async (memberId, memberData) => {
        try {
            const response = await httpMethods.put(`/member/update-member/${memberId}`, memberData)
            return response.data
        } catch (error) {
            console.error("Error updating member:", error)
            throw error
        }
    },

    // Get all users
    getAllUsers: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-users")
            return response.data
        } catch (error) {
            console.error("Error fetching all users:", error)
            throw error
        }
    },
}

// Coach API
export const coachApi = {
    // Get all coaches
    getAllCoaches: async () => {
        try {
            const response = await httpMethods.get("/user/get-all-coaches")
            return response.data
        } catch (error) {
            console.error("Error fetching coaches:", error)
            throw error
        }
    },

    // Get coach by ID
    getCoachById: async (coachId) => {
        try {
            const response = await httpMethods.get(`/user/get-coach-by-id/${coachId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching coach:", error)
            throw error
        }
    },
}
