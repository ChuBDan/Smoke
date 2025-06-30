"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { smokingCessationApi } from "@/services/smokingCessationApi"
import { useUserMembership } from "@/hooks/useUserMembership"
import { useSelector } from "react-redux";


const SmokingStatusForm = () => {
  const navigate = useNavigate();
  const { userId, token } = useSelector((state) => state.auth);
  const { isPaidMember } = useUserMembership()
  //const isPaidMember = true // For testing purposes, set to true

  const [formData, setFormData] = useState({
    cigarettesPerDay: "",
    frequency: "",
    cost: ""
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.cigarettesPerDay || !formData.frequency || !formData.costPerPack) {
        toast.error("Please fill in all required fields")
        return
      }

      if (!userId) {
        toast.error("Please log in to continue")
        navigate("/login")
        return
      }

      // Create smoking log
      const smokingLogData = {
        cigarettesPerDay: Number.parseInt(formData.cigarettesPerDay),
        frequency: `${Number.parseInt(formData.frequency)} times per day`,
        cost: Number.parseFloat(formData.costPerPack)
      }

      const smokingLogResponse = await smokingCessationApi.createSmokingLog(userId, smokingLogData, token);
      const smokingLogId = smokingLogResponse?.smokingLog?.id;
      localStorage.setItem("smokingLogId", smokingLogId);

      if (isPaidMember && smokingLogId) {
        // Generate AI plan for paid members
        try {
          const planResponse = await smokingCessationApi.createPlan(userId, smokingLogId, token);
          localStorage.setItem("planId", planResponse?.plan?.id);
          toast.success("Your personalized plan has been successfully created!");
        } catch (planError) {
          console.error("Error creating plan:", planError);
          toast.warning("Your information has been saved, but there was an error creating the plan. Please try again later.");
        }
      } else {
        toast.success("Your information has been recorded. Upgrade to VIP to receive a personalized plan!");
      }



      // Navigate to progress page
      navigate("/smokingprogress")
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.error("Form submission error:", error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center py-8"
      style={{ backgroundColor: "#F0F4F8" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl" style={{ borderTop: "4px solid #4A90E2" }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800" style={{ color: "#4A90E2" }}>
          Detailed Smoking Status Assessment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Smoking Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="cigarettesPerDay">
                  Cigarettes per day *
                </label>
                <input
                  type="number"
                  id="cigarettesPerDay"
                  name="cigarettesPerDay"
                  value={formData.cigarettesPerDay}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: 10"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="frequency">
                  Frequency (times/day) *
                </label>
                <input
                  type="number"
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: 5"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="costPerPack">
                  Cost per pack (VND) *
                </label>
                <input
                  type="number"
                  id="costPerPack"
                  name="costPerPack"
                  value={formData.costPerPack}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: 30000"
                  min="0"
                  required
                />
              </div>
            </div>



          </div>






          {/* Membership Notice */}
          {!isPaidMember && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Upgrade to VIP for Personalized Plan</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    VIP members will receive a smoking cessation plan created by AI based on your detailed information.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            style={{ backgroundColor: "#4A90E2" }}
          >
            {loading ? "Processing..." : "Submit & Create Plan"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SmokingStatusForm
