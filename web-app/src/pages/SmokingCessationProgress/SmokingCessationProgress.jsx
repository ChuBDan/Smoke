/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from "react"
import { smokingCessationApi } from "@/services/smokingCessationApi"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { dateUtils } from "@/utils/dateUtils"
import { getCurrentSmokingLog } from "@/utils/smokingLogUtils"
import { getCurrentSmokingPlan } from "@/utils/planUtils"
import Card from "./components/Card"
import { lightPlanPhases, moderatePlanPhases, heavyPlanPhases } from "./components/freePhases"

export default function SmokingcessationProgress() {
  const [currentPhase, setCurrentPhase] = useState("phase1")
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [customDate, setCustomDate] = useState("")

  const [plan, setPlan] = useState(null)
  const [dailyProgressStatus, setDailyProgressStatus] = useState({})
  const [loading, setLoading] = useState(false)
  const [submittingProgress, setSubmittingProgress] = useState(false)
  const [progressHistory, setProgressHistory] = useState([])
  const [existingLog, setExistingLog] = useState(null)

  const { userId, token } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchSmokingLogData = async () => {
      try {
        const activeLog = await getCurrentSmokingLog(userId, token)
        if (activeLog) {
          setExistingLog(activeLog)
        }
      } catch (error) {
        console.error("Error fetching smoking log data:", error)
        toast.error("Can't load smoking log data")
      }
    }
    fetchSmokingLogData();
  }, [])

  // Fetch plan data
  useEffect(() => {
    const fetchPlanData = async () => {
      if (userId && token) {
        setLoading(true)
        try {
          const planInitResponse = await getCurrentSmokingPlan(userId, token);
          const planId = planInitResponse.id;
          if (planInitResponse) {
            // If planId exists, fetch the plan
            const planResponse = await smokingCessationApi.getPlan(planId, token);
  
            setPlan(planResponse.plan)

            // If it's a VIP plan (has planSchema), fetch daily progress
            if (planResponse.plan && planResponse.plan.planSchema) {
              try {
                const progressResponse = await smokingCessationApi.getDailyProgressByMemberId(userId, token)
                setDailyProgressStatus(progressResponse || {})
                if (progressResponse) {
                  // Also fetch progress history
                  const historyResponse = await smokingCessationApi.getMemberProgressHistory(userId)
                  setProgressHistory(historyResponse)
                }
              } catch (progressError) {
                console.error("Error fetching daily progress:", progressError)
                setDailyProgressStatus({})
              }
            }
          } else {
            // No planId means free user, but still fetch progress history
            setPlan(null)
            try {
              const historyResponse = await smokingCessationApi.getMemberProgressHistory(userId)
              setProgressHistory(historyResponse)
            } catch (error) {
              console.error("Error fetching progress history:", error)
            }
          }
        } catch (error) {
          console.error("Error fetching plan data:", error)
          setPlan(null)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPlanData()
  }, [])

  const isPaidMember = plan && Object.prototype.hasOwnProperty.call(plan, "planSchema")
  // Default values
  let startDate = new Date(Date.now())
  let cigsPerDay = 10
  let costPerCig = 2000

  // Use smokingLogs if available
  if (existingLog) {
    if (existingLog.logDate) {
      startDate = new Date(dateUtils.parseDDMMYYYY(existingLog.logDate))
    }
    if (existingLog.cigarettesPerDay) {
      cigsPerDay = existingLog.cigarettesPerDay
    }
    if (existingLog.cost) {
      costPerCig = existingLog.cost
    }
  }

  const getTotalDays = () => {
    const now = customDate ? new Date(customDate) : new Date()
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
  }

  const getActivePlan = () => {
    if (isPaidMember && plan) {
      // Transform AI plan to match our expected structure
      return transformAIPlanToPhases(plan)
    }
    // Free plan logic
    let freePhases
    switch (plan?.phases) {
      case "Light Smoker":
        freePhases = lightPlanPhases
        break
      case "Moderate Smoker":
        freePhases = moderatePlanPhases
        break
      case "Heavy Smoker":
        freePhases = heavyPlanPhases
        break
      default:
        freePhases = lightPlanPhases
    }
    return freePhases.find((p) => p.key === currentPhase)
  }

  const transformAIPlanToPhases = (plan) => {
    if (!plan || !plan.planSchema || !plan.planSchema.phases) {
      return null
    }

    return plan.planSchema.phases.map((phase) => ({
      key: `ai_phase${phase.phaseNumber}`,
      name: `Phase ${phase.phaseNumber} (${phase.weekRange})`,
      days: calculatePhaseDays(phase.weekRange),
      weeks: calculatePhaseWeeks(phase.weekRange),
      goal: phase.goal,
      strategies: phase.strategies,
    }))
  }

  const calculatePhaseDays = (timePeriod) => {
    const match = timePeriod.match(/Weeks?\s+(\d+)(?:-(\d+))?/i)
    if (match) {
      const start = Number.parseInt(match[1])
      const end = match[2] ? Number.parseInt(match[2]) : start
      return (end - start + 1) * 7
    }
    return 28 // Default to 4 weeks
  }

  const calculatePhaseWeeks = (timePeriod) => {
    return Math.ceil(calculatePhaseDays(timePeriod) / 7)
  }

  const getCurrentWeekAndDay = () => {
    const totalDays = getTotalDays()
    const activePlan = getActivePlan()

    if (isPaidMember && Array.isArray(activePlan)) {
      const currentPhaseData = activePlan.find((p) => p.key === currentPhase) || activePlan[0]
      if (currentPhaseData) {
        const daysInPhase = totalDays % currentPhaseData.days || totalDays
        const currentWeek = Math.floor(daysInPhase / 7) + 1
        const currentDay = daysInPhase % 7 || 7
        return { currentWeek, currentDay }
      }
    } else if (activePlan) {
      const daysInPhase = totalDays % activePlan.days || totalDays
      const currentWeek = Math.floor(daysInPhase / 7) + 1
      const currentDay = daysInPhase % 7 || 7
      return { currentWeek, currentDay }
    }
    return { currentWeek: 1, currentDay: 1 }
  }

  const showDailySubmission = () => {
    if (!isPaidMember) {
      const { currentDay } = getCurrentWeekAndDay()
      return currentDay === 3 || currentDay === 7
    }
    const dayKey = getDayKey()
    const isCompleted = isDayCompleted(dayKey)
    return !isCompleted
  }

  const getDayKey = () => {
    const { currentWeek, currentDay } = getCurrentWeekAndDay()
    return `week${currentWeek}_day${currentDay}`
  }

  const isDayCompleted = (dayKey) => {
    return dailyProgressStatus[dayKey]?.completed || false
  }

  const splitStrategiesByWeek = (strategies, weeks) => {
    const result = []
    const perWeek = Math.ceil(strategies.length / weeks)
    for (let i = 0; i < weeks; i++) {
      result.push(strategies.slice(i * perWeek, (i + 1) * perWeek))
    }
    return result
  }

  const handleQuizChange = (e) => {
    setQuizAnswers({ ...quizAnswers, [e.target.name]: e.target.value })
  }

  const handleQuizSubmit = async () => {
    if (isPaidMember) {
      setSubmittingProgress(true)
      try {
        const dayKey = getDayKey()
        const progressData = {
          daysSmokeFree: getTotalDays(),
          healthImprovement: quizAnswers.healthImprovement,
        }

        const hasExistingProgress = Object.keys(dailyProgressStatus).length > 0

        if (!hasExistingProgress) {
          await smokingCessationApi.createProgress(userId, progressData, token)
        } else {
          await smokingCessationApi.updateProgress(userId, progressData, token)
        }

        setDailyProgressStatus((prev) => ({
          ...prev,
          [dayKey]: { completed: true, submissionDate: new Date().toISOString() },
        }))

        let historyResponse
        setProgressHistory(historyResponse)

        setQuizSubmitted(true)
        toast.success("Tiến độ hàng ngày đã được ghi nhận!")
      } catch (error) {
        console.error("Error submitting daily progress:", error)
        toast.error("Có lỗi khi ghi nhận tiến độ. Vui lòng thử lại.")
      } finally {
        setSubmittingProgress(false)
      }
    } else {
      setSubmittingProgress(true)
      try {
        const progressData = {
          cigarettes: quizAnswers.cigarettes,
          trigger: quizAnswers.trigger,
          cravings: quizAnswers.cravings,
        }

        await smokingCessationApi.createProgress(userId, progressData, token)

        const historyResponse = await smokingCessationApi.getMemberProgressHistory(userId)
        setProgressHistory(historyResponse)
        setQuizSubmitted(true)
        toast.success("Quiz đã được ghi nhận!")
      } catch (error) {
        console.error("Error submitting quiz:", error)
        toast.error("Có lỗi khi ghi nhận quiz. Vui lòng thử lại.")
      } finally {
        setSubmittingProgress(false)
      }
    }
  }

  const handleDateChange = (e) => {
    setCustomDate(e.target.value)
    setQuizSubmitted(false)
  }

  const renderSmokingLogInfo = () => {
    if (!existingLog) return null
    const log = existingLog

    return (
      <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition mb-6">
        <div className="bg-blue-50 p-4">
          <p className="text-gray-900 text-lg font-medium">Your Smoking Profile</p>
        </div>
        <div className="p-4 text-sm text-gray-800 space-y-3">
          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <p>
                <strong>Start Date:</strong> {new Date(startDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Cigarettes per Day:</strong> {log.cigarettesPerDay}
              </p>
              <p>
                <strong>Cost per Cigarette:</strong> {log.cost?.toLocaleString()} VND
              </p>
              <p>
                <strong>Daily Cost:</strong> {(log.cigarettesPerDay * log.cost)?.toLocaleString()} VND
              </p>
            </div>
            <div>
              {log.smokingFrequency && (
                <p>
                  <strong>Smoking Frequency:</strong> {log.smokingFrequency}
                </p>
              )}
              {log.triggers && log.triggers.length > 0 && (
                <div>
                  <p className="font-semibold">Main Triggers:</p>
                  <ul className="list-disc list-inside ml-2">
                    {log.triggers.map((trigger, index) => (
                      <li key={index}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              )}
              {log.motivations && log.motivations.length > 0 && (
                <div>
                  <p className="font-semibold">Motivations:</p>
                  <ul className="list-disc list-inside ml-2">
                    {log.motivations.map((motivation, index) => (
                      <li key={index}>{motivation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderProgressHistory = () => {
    if (progressHistory.length === 0) return null

    return (
      <div className="md:col-span-2 border border-green-200 rounded-xl overflow-hidden shadow hover:shadow-md transition mb-6">
        <div className="bg-green-50 p-4">
          <p className="text-gray-900 text-lg font-medium">Progress History</p>
        </div>
        <div className="p-4 text-sm text-gray-800">
          <div className="max-h-40 overflow-y-auto space-y-2">
            {progressHistory
              .slice(-10)
              .reverse()
              .map((progress, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">
                      {progress.date ? new Date(progress.date).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                    {progress.cigarettes && (
                      <span className="ml-2 text-gray-600">{progress.cigarettes} cigarettes</span>
                    )}
                  </div>
                  <div className="text-green-600">✅</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  const renderVIPPlanPhases = () => {
    const planPhases = getActivePlan()
    if (!planPhases || !Array.isArray(planPhases)) return null

    return (
      <div className="flex flex-col gap-4 text-sm text-gray-600">
        {planPhases.map((phase) => (
          <p
            key={phase.key}
            onClick={() => {
              setCurrentPhase(phase.key)
              setQuizAnswers({})
              setQuizSubmitted(false)
            }}
            className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${currentPhase === phase.key ? "bg-indigo-100 text-black font-medium" : ""
              }`}
          >
            {phase.name}
          </p>
        ))}
      </div>
    )
  }

  const renderFreePlanPhases = () => {
    let freePhases
    switch (plan?.phases) {
      case "Light Smoker":
        freePhases = lightPlanPhases
        break
      case "Moderate Smoker":
        freePhases = moderatePlanPhases
        break
      case "Heavy Smoker":
        freePhases = heavyPlanPhases
        break
      default:
        freePhases = lightPlanPhases
    }

    return (
      <div className="flex flex-col gap-4 text-sm text-gray-600">
        {freePhases.map((phase) => (
          <p
            key={phase.key}
            onClick={() => {
              setCurrentPhase(phase.key)
              setQuizAnswers({})
              setQuizSubmitted(false)
            }}
            className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${currentPhase === phase.key ? "bg-indigo-100 text-black font-medium" : ""
              }`}
          >
            {phase.name}
          </p>
        ))}
      </div>
    )
  }

  const renderDailySubmission = () => {
    const dayKey = getDayKey()
    const isCompleted = isDayCompleted(dayKey)
    const { currentWeek, currentDay } = getCurrentWeekAndDay()

    if (isPaidMember && isCompleted) {
      return (
        <div className="md:col-span-2 border border-green-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
          <div className="bg-green-50 p-4">
            <p className="text-gray-900 text-lg font-medium">
              Week {currentWeek}, Day {currentDay} - Completed ✅
            </p>
          </div>
          <div className="p-4 text-sm text-gray-800">
            <p className="text-green-600 font-semibold">Bạn đã hoàn thành tiến độ cho ngày hôm nay!</p>
            <p className="text-gray-600 mt-2">
              Submission Date:{" "}
              {dailyProgressStatus[dayKey]?.submissionDate
                ? new Date(dailyProgressStatus[dayKey].submissionDate).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
          </div>
        </div>
      )
    }

    if (!showDailySubmission()) return null

    return (
      <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
        <div className="bg-blue-50 p-4">
          <p className="text-gray-900 text-lg font-medium">
            {isPaidMember
              ? `Week ${currentWeek}, Day ${currentDay} - Daily Check-in`
              : `Week ${currentWeek} Quiz (Day ${currentDay})`}
          </p>
        </div>
        <div className="p-4 text-sm text-gray-800 space-y-3">
          {quizSubmitted && !isPaidMember ? (
            <div>
              <p className="text-green-600 font-semibold">Thank you for sharing! 🎉</p>
              <p>Your answers:</p>
              <ul className="list-disc list-inside">
                {Object.entries(quizAnswers).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  How are you feeling about your health {isPaidMember ? "today" : "this week"}?
                </label>
                <select
                  name="healthImprovement"
                  value={quizAnswers.healthImprovement || ""}
                  onChange={handleQuizChange}
                  className="w-full border border-gray-300 rounded p-2 mt-1"
                  required
                >
                  <option value="">Choose your feeling...</option>
                  <option value="BAD">Not so good</option>
                  <option value="NORMAL">Okay</option>
                  <option value="GOOD">Great!</option>
                </select>
              </div>

              <button
                onClick={handleQuizSubmit}
                disabled={submittingProgress}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submittingProgress
                  ? "Submitting..."
                  : isPaidMember
                    ? "Check in for today"
                    : "Submit my answers"}
              </button>
              <p className="text-gray-500 text-xs mt-2">
                {isPaidMember
                  ? "Your daily check-in helps you stay on track. Keep it up!"
                  : "Your weekly quiz helps us support your journey. You're doing great!"}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderPlanInfo = () => {
    if (isPaidMember && plan) {
      return (
        <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition mb-6">
          <div className="bg-purple-50 p-4">
            <p className="text-gray-900 text-lg font-medium">AI Generated Plan Details</p>
          </div>
          <div className="p-4 text-sm text-gray-800 space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Plan Name:</strong> {plan.planSchema?.planName}
                </p>
                <p>
                  <strong>Smoking Level:</strong> {plan.phases}
                </p>
                <p>
                  <strong>Reason:</strong> {plan.reason}
                </p>
                <p>
                  <strong>Starting Cigarettes:</strong> {plan.planSchema?.initialCigarettesPerDay}/day
                </p>
              </div>
              <div>
                <p>
                  <strong>Start Date:</strong> {plan.StartDate}
                </p>
                <p>
                  <strong>Expected End Date:</strong> {plan.ExpectedEndDate}
                </p>
                <p>
                  <strong>Daily Cost:</strong> {plan.planSchema?.costPerDay?.toLocaleString()} VND
                </p>
                <p>
                  <strong>Status:</strong> <span className="text-green-600">{plan.status}</span>
                </p>
              </div>
            </div>

            {plan.planSchema?.copingMechanisms && (
              <div className="mt-4">
                <p className="font-semibold text-purple-600 mb-2">Recommended Coping Mechanisms:</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {plan.planSchema.copingMechanisms.map((mechanism, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>{mechanism}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.planSchema?.warningsOrNotes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800 mb-2">Important Notes:</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {plan.planSchema.warningsOrNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized plan...</p>
        </div>
      </div>
    )
  }

  const activePlan = getActivePlan()
  const currentPlanPhase = Array.isArray(activePlan)
    ? activePlan.find((p) => p.key === currentPhase) || activePlan[0]
    : activePlan

  const strategiesByWeek = currentPlanPhase
    ? splitStrategiesByWeek(currentPlanPhase.strategies, currentPlanPhase.weeks)
    : []
  const { currentWeek, currentDay } = getCurrentWeekAndDay()

  console.log("plan >> ", plan);
  console.log("existingLog >> ", existingLog)

  if (!existingLog && !loading) {
  return (
    <div className="p-6 text-center text-red-600">
      <p className="text-lg font-semibold mb-2">You haven't provided your smoking status yet!</p>
      <p className="mb-4">Please complete the form before starting to track your cessation progress.</p>
      <a
        href="/smokingstatusform"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
      >
        Go to Smoking Status Form
      </a>
    </div>
  )
}

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-lg">Track Your Smoking Cessation Progress</p>
        {isPaidMember && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            VIP Member
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Select Date to Test (YYYY-MM-DD):</label>
        <input
          type="date"
          value={customDate}
          onChange={handleDateChange}
          className="mt-1 w-full sm:w-1/4 border border-gray-300 rounded p-2"
        />
        <p className="text-sm text-gray-600 mt-2">
          Current Week: {currentWeek}, Day in Week: {currentDay}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Journey started: {startDate.toLocaleDateString("vi-VN")} ({getTotalDays()} days ago)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {isPaidMember ? renderVIPPlanPhases() : renderFreePlanPhases()}

        <div className="w-full grid md:grid-cols-2 gap-6">
          {renderSmokingLogInfo()}
          {renderProgressHistory()}
          {renderPlanInfo()}

          {currentPlanPhase && (
            <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-blue-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Goal & Strategies {isPaidMember && <span className="text-purple-600">(AI Generated)</span>}
                </p>
              </div>
              <div className="p-4 text-sm text-gray-800 space-y-3">
                <p>
                  <strong>Goal:</strong> {currentPlanPhase.goal}
                </p>
                <p>
                  <strong>Strategies by Week:</strong>
                </p>
                {strategiesByWeek.map((weekStrategies, index) => (
                  <div key={index} className="pl-4">
                    <p className="font-semibold text-indigo-600">Week {index + 1}:</p>
                    <ul className="list-disc list-inside text-gray-700 mb-2">
                      {weekStrategies.map((strategy, idx) => (
                        <li key={idx}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderDailySubmission()}

          {currentPlanPhase && (
            <Card title="Phase Duration" subtitle="In Progress" value={`${currentPlanPhase.days} days`} />
          )}

          <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-blue-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Health Improvement</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Recovering</span>
              </div>
            </div>
          </div>

          <div className="border border-orange-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-orange-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Your Statistics</p>
            </div>
            <div className="p-4 text-sm text-gray-800 space-y-2">
              <p>
                <strong>Daily cigarettes:</strong> {cigsPerDay}
              </p>
              <p>
                <strong>Cost per cigarette:</strong> {costPerCig.toLocaleString()} VND
              </p>
              <p>
                <strong>Daily cost:</strong> {(cigsPerDay * costPerCig).toLocaleString()} VND
              </p>
              <p>
                <strong>Days in journey:</strong> {getTotalDays()}
              </p>
              <p>
                <strong>Total submissions:</strong> {progressHistory.length}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-purple-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Weekly Progress Overview</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dayKey = `week${currentWeek}_day${day}`
                  const isCompleted = isDayCompleted(dayKey)
                  const isToday = day === currentDay

                  return (
                    <div
                      key={day}
                      className={`p-2 text-center rounded text-sm font-medium ${isCompleted
                        ? "bg-green-100 text-green-800"
                        : isToday
                          ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      Day {day}
                      {isCompleted && <div className="text-xs">✅</div>}
                      {isToday && !isCompleted && <div className="text-xs">📝</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}