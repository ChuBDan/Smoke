// src/utils/planUtils.js

import { smokingCessationApi } from "@/services/smokingCessationApi"

export const getCurrentSmokingPlan = async (userId, token) => {
    try {
        const response = await smokingCessationApi.getPlanByUserId(userId, token)
        const plans = response?.plans || []

        if (Array.isArray(plans) && plans.length > 0) {
            const sortedPlans = plans
                .filter(plan => plan?.status === "ACTIVE")
                .sort((a, b) => (b.id) - a.id)

            if (sortedPlans.length > 0) {
                return sortedPlans[0]
            }
        }
    } catch (error) {
        console.error("Error fetching smoking plans:", error)
    }

    return null
}
