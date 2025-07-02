import { smokingCessationApi } from "@/services/smokingCessationApi"

export const getCurrentSmokingLog = async (userId, token) => {
    try {
        const response = await smokingCessationApi.getSmokingLogByMemberId(userId, token)
        const logs = response?.smokingLogs || []

        if (Array.isArray(logs) && logs.length > 0) {
            const sortedLogs = logs.sort(
                (a, b) => b.id - a.id
            )
            const latestLog = sortedLogs[0]

            if (latestLog.status === "ACTIVE") {
                return latestLog
            }
        }
    } catch (error) {
        console.error("Error fetching smoking logs:", error)
    }

    return null
}
