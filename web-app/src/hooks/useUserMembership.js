"use client"

import { useState, useEffect } from "react"
import { membershipApi, userApi } from "@/services/smokingCessationApi"
import { useSelector } from "react-redux"

export const useUserMembership = () => {
    const [membershipStatus, setMembershipStatus] = useState("free") // 'free' or 'vip'
    const [membershipPackages, setMembershipPackages] = useState([])
    const [currentMember, setCurrentMember] = useState(null)
    const [loading, setLoading] = useState(true)
    const { userId, token } = useSelector((state) => state.auth);

    useEffect(() => {
        const checkMembershipStatus = async () => {
            try {

                if (userId) {
                    // Fetch member details
                    const memberData = await userApi.getMemberById(userId, token)
                    setCurrentMember(memberData);

                    if (memberData.member && memberData.member.plans === "VIP") {
                        setMembershipStatus("vip")
                    } else {
                        setMembershipStatus("free")
                    }
                }

                // Fetch available membership packages
                const packages = await membershipApi.getAllMembershipPackages(token)
                setMembershipPackages(packages)
            } catch (error) {
                console.error("Error checking membership:", error)
                setMembershipStatus("free")
            } finally {
                setLoading(false)
            }
        }

        checkMembershipStatus()
    }, [])

    const upgradeMembership = async (packageId) => {
        try {
            const userId = localStorage.getItem("userId")
            if (!userId) {
                throw new Error("User not logged in")
            }

            await membershipApi.buyMembershipPackage(packageId, userId)
            setMembershipStatus("vip")

            // Refresh member data
            const updatedMember = await userApi.getMemberById(userId)
            setCurrentMember(updatedMember)

            return true
        } catch (error) {
            console.error("Error upgrading membership:", error)
            throw error
        }
    }

    return {
        membershipStatus,
        membershipPackages,
        currentMember,
        loading,
        isPaidMember: membershipStatus === "vip",
        upgradeMembership,
    }
}
