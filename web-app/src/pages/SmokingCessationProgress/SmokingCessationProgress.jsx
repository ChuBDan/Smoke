<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { useUserMembership } from "@/hooks/useUserMembership";
import { smokingCessationApi } from "@/services/smokingCessationApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AppointmentModal from "@/pages/Appointments/AppointmentModal";

const freePlanPhases = [
  {
    key: "phase1",
    name: "Phase 1 (Weeks 1-4)",
    days: 28,
    weeks: 4,
    goal: "Awareness, Trigger Identification, and Initial Reduction",
    strategies: [
      "Keep a smoking diary to track cigarettes, triggers, and mood.",
      "Identify top 3 smoking triggers.",
      "Note alternative activities for triggers.",
      "Substitute 1 cigarette per day with a healthy alternative.",
      "Introduce nicotine gum/lozenges (if desired) to manage cravings.",
      "Change your routine to avoid triggers.",
      "Practice mindful breathing exercises.",
      "Reward yourself for progress.",
    ],
  },
  {
    key: "phase2",
    name: "Phase 2 (Weeks 5-8)",
    days: 28,
    weeks: 4,
    goal: "Gradual Reduction and Management",
    strategies: [
      "Delay your first cigarette of the day.",
      "Extend the time between cigarettes.",
      "Focus on eliminating a cigarette associated with a specific trigger.",
      "Increase the delay between each cigarette.",
      "Practice visualization techniques to mentally distance yourself from cravings.",
      "Review your smoking diary and identify remaining challenges.",
      "Refine your coping mechanisms and alternative activities.",
      "Reward yourself for completing Phase 2.",
    ],
  },
  {
    key: "phase3",
    name: "Phase 3 (Weeks 9-12)",
    days: 28,
    weeks: 4,
    goal: "Stabilization and Maintenance",
    strategies: [
      "Work to remove one more cigarette.",
      "Introduce more healthy lifestyle choices like regular physical activity.",
      "Continue to focus on the habits you've broken so far.",
      "Continue to focus on avoiding high risk scenarios.",
      "Stay focused on the reasons why you started the plan.",
      "Identify high-risk situations and develop plans for managing them.",
      "Continue practicing your coping mechanisms and alternative activities.",
    ],
  },
];

export default function SmokingcessationProgress() {
  const [currentPhase, setCurrentPhase] = useState("phase1");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [aiPlan, setAiPlan] = useState(null);
  const [dailyProgressStatus, setDailyProgressStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [smokingLogs, setSmokingLogs] = useState([]);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);

  const { isPaidMember } = useUserMembership();
  // const isPaidMember = true
  const { userId, token } = useSelector((state) => state.auth);

  // Default values
  let startDate = new Date(Date.now());
  let cigsPerDay;
  let costPerCig;

  // Use smokingLogs if available
  if (smokingLogs && smokingLogs.smokingLog) {
    if (smokingLogs.smokingLog.logDate) {
      startDate = new Date(smokingLogs.smokingLog.logDate);
    }
    if (smokingLogs.smokingLog.cigarettesPerDay) {
      cigsPerDay = smokingLogs.smokingLog.cigarettesPerDay;
    }
    if (smokingLogs.smokingLog.costPerCig) {
      costPerCig = smokingLogs.smokingLog.costPerCig;
    }
  }

  // Fetch AI plan and daily progress for VIP members
  useEffect(() => {
    const fetchSmokingLogData = async () => {
      if (userId) {
        setLoading(true);
        try {
          const smokingLogId = localStorage.getItem("smokingLogId");
          const response = await smokingCessationApi.getSmokingLogById(
            smokingLogId,
            token
          );
          setSmokingLogs(response);
        } catch (error) {
          console.error("Error fetching smoking log data:", error);
          toast.error("Không thể tải dữ liệu nhật ký hút thuốc");
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchVIPData = async () => {
      if (isPaidMember && userId) {
        setLoading(true);
        try {
          // Fetch plan
          const planId = localStorage.getItem("planId");
          const planResponse = await smokingCessationApi.getPlan(planId, token);
          setAiPlan(planResponse);

          // Fetch daily progress status
          // const progressResponse = await smokingCessationApi.getDailyProgressStatus(userId, token)
          // setDailyProgressStatus(progressResponse)
        } catch (error) {
          console.error("Error fetching VIP data:", error);
          toast.error("Không thể tải dữ liệu kế hoạch VIP");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSmokingLogData();
    fetchVIPData();
  }, []);
=======
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
import { freePlanPhases } from "./components/freePhases"

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
                // Set progress status, even if empty - don't create automatically
                setDailyProgressStatus(progressResponse || {})
                if (progressResponse) {
                  // Also fetch progress history
                  const historyResponse = await smokingCessationApi.getMemberProgressHistory(userId)
                  setProgressHistory(historyResponse)
                }
              } catch (progressError) {
                console.error("Error fetching daily progress:", progressError)
                // Set empty progress status - user will be on day 1
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
          // If plan fetch fails, user might be on free plan
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
>>>>>>> 46ea0bb (progress)

  const getTotalDays = () => {
    const now = customDate ? new Date(customDate) : new Date()
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
  }

  const getActivePlan = () => {
<<<<<<< HEAD
    if (isPaidMember && aiPlan) {
      return aiPlan;
    }
    return freePlanPhases.find((p) => p.key === currentPhase);
  };

  const getCurrentWeekAndDay = () => {
    const totalDays = getTotalDays();
    const plan = getActivePlan();
    const daysInPhase = totalDays % plan.days || totalDays;
    const currentWeek = Math.floor(daysInPhase / 7) + 1;
    const currentDay = daysInPhase % 7 || 7;
    return { currentWeek, currentDay };
  };

  const showDailySubmission = () => {
    if (!isPaidMember) {
      // Free members: show quiz on day 3 and 7
      const { currentDay } = getCurrentWeekAndDay();
      return currentDay === 3 || currentDay === 7;
    }
    // VIP members: show daily submission every day
    return true;
  };

  const getDayKey = () => {
    const { currentWeek, currentDay } = getCurrentWeekAndDay();
    return `week${currentWeek}_day${currentDay}`;
  };

  const isDayCompleted = (dayKey) => {
    return dailyProgressStatus[dayKey]?.completed || false;
  };

  const calculateSavedMoney = () => {
    const plan = getActivePlan();
    return plan.days * cigsPerDay * costPerCig;
  };

  const calculateHealthImprovement = () => {
    const plan = getActivePlan();
    const days = plan.days;
    return Math.min((days / 30) * 100, 100);
  };
=======
    if (isPaidMember && plan) {
      // Transform AI plan to match our expected structure
      return transformAIPlanToPhases(plan)
    }
    return freePlanPhases.find((p) => p.key === currentPhase)
  }

  const transformAIPlanToPhases = (plan) => {
    if (!plan || !plan.planSchema || !plan.planSchema.phases) {
      return null
    }

    // Use the correct property names from the API response
    return plan.planSchema.phases.map((phase) => ({
      key: `ai_phase${phase.phaseNumber}`,
      name: `Phase ${phase.phaseNumber} (${phase.weekRange})`, // Use weekRange
      days: calculatePhaseDays(phase.weekRange), // Pass weekRange
      weeks: calculatePhaseWeeks(phase.weekRange), // Pass weekRange
      goal: phase.goal, // Use goal
      strategies: phase.strategies, // Use strategies
    }))
  }

  const calculatePhaseDays = (timePeriod) => {
    // Parse time period like "Weeks 1-2", "Weeks 3-8", etc.
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
      // For AI plan, find current phase and calculate within that phase
      const currentPhaseData = activePlan.find((p) => p.key === currentPhase) || activePlan[0]
      if (currentPhaseData) {
        const daysInPhase = totalDays % currentPhaseData.days || totalDays
        const currentWeek = Math.floor(daysInPhase / 7) + 1
        const currentDay = daysInPhase % 7 || 7
        return { currentWeek, currentDay }
      }
    } else if (activePlan) {
      // For free plan
      const daysInPhase = totalDays % activePlan.days || totalDays
      const currentWeek = Math.floor(daysInPhase / 7) + 1
      const currentDay = daysInPhase % 7 || 7
      return { currentWeek, currentDay }
    }
    return { currentWeek: 1, currentDay: 1 }
  }

  const showDailySubmission = () => {
    if (!isPaidMember) {
      // Free members: show quiz on day 3 and 7
      const { currentDay } = getCurrentWeekAndDay()
      return currentDay === 3 || currentDay === 7
    }
    // VIP members: show daily submission every day if not completed
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
>>>>>>> 46ea0bb (progress)

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
      // VIP members: submit daily progress
<<<<<<< HEAD
      setSubmittingProgress(true);
      try {
        const dayKey = getDayKey();
        const progressData = {
          dayKey,
          answers: quizAnswers,
          submissionDate: new Date().toISOString(),
          completed: true,
        };

        await smokingCessationApi.submitDailyProgress(
          userId,
          progressData,
          token
        );
=======
      setSubmittingProgress(true)
      try {
        const dayKey = getDayKey()
        const progressData = {
          daysSmokeFree: getTotalDays(),
          healthImprovement: quizAnswers.healthImprovement,
        }

        // Check if this is the first progress entry
        const hasExistingProgress = Object.keys(dailyProgressStatus).length > 0

        if (!hasExistingProgress) {
          // Create new progress using the create-progress endpoint
          await smokingCessationApi.createProgress(userId, progressData, token)
        } else {
          // Update existing progress
          await smokingCessationApi.updateProgress(userId, progressData, token)
        }
>>>>>>> 46ea0bb (progress)

        // Update local state
        setDailyProgressStatus((prev) => ({
          ...prev,
<<<<<<< HEAD
          [dayKey]: {
            completed: true,
            submissionDate: new Date().toISOString(),
          },
        }));

        setQuizSubmitted(true);
        toast.success("Tiến độ hàng ngày đã được ghi nhận!");
      } catch (error) {
        console.error("Error submitting daily progress:", error);
        toast.error("Có lỗi khi ghi nhận tiến độ. Vui lòng thử lại.");
      } finally {
        setSubmittingProgress(false);
      }
    } else {
      // Free members: just mark as submitted locally
      setQuizSubmitted(true);
    }
  };

  const handleDateChange = (e) => {
    setCustomDate(e.target.value);
    setQuizSubmitted(false);
  };

  const renderVIPPlanPhases = () => {
    if (!aiPlan || !aiPlan.phases) return null;

    return (
      <div className="flex flex-col gap-4 text-sm text-gray-600">
        {aiPlan.phases.map((phase, index) => (
          <p
            key={phase.key || `phase${index}`}
            onClick={() => {
              setCurrentPhase(phase.key || `phase${index}`);
              setQuizAnswers({});
              setQuizSubmitted(false);
            }}
            className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
              currentPhase === (phase.key || `phase${index}`)
                ? "bg-indigo-100 text-black font-medium"
                : ""
            }`}
=======
          [dayKey]: { completed: true, submissionDate: new Date().toISOString() },
        }))

        // Refresh progress history
        // const historyResponse = await smokingCessationApi.getMemberProgressHistory(userId, token)
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
      // Free members: submit progress using the progress API
      setSubmittingProgress(true)
      try {
        const progressData = {

          cigarettes: quizAnswers.cigarettes,
          trigger: quizAnswers.trigger,
          cravings: quizAnswers.cravings,
        }

        await smokingCessationApi.createProgress(userId, progressData, token)

        // Refresh progress history
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
>>>>>>> 46ea0bb (progress)
          >
            {phase.name}
          </p>
        ))}
      </div>
<<<<<<< HEAD
    );
  };
=======
    )
  }
>>>>>>> 46ea0bb (progress)

  const renderFreePlanPhases = () => (
    <div className="flex flex-col gap-4 text-sm text-gray-600">
      {freePlanPhases.map((phase) => (
        <p
          key={phase.key}
          onClick={() => {
<<<<<<< HEAD
            setCurrentPhase(phase.key);
            setQuizAnswers({});
            setQuizSubmitted(false);
          }}
          className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
            currentPhase === phase.key
              ? "bg-indigo-100 text-black font-medium"
              : ""
          }`}
=======
            setCurrentPhase(phase.key)
            setQuizAnswers({})
            setQuizSubmitted(false)
          }}
          className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${currentPhase === phase.key ? "bg-indigo-100 text-black font-medium" : ""
            }`}
>>>>>>> 46ea0bb (progress)
        >
          {phase.name}
        </p>
      ))}
    </div>
<<<<<<< HEAD
  );

  const renderDailySubmission = () => {
    const dayKey = getDayKey();
    const isCompleted = isDayCompleted(dayKey);
    const { currentWeek, currentDay } = getCurrentWeekAndDay();
=======
  )

  const renderDailySubmission = () => {
    const dayKey = getDayKey()
    const isCompleted = isDayCompleted(dayKey)
    const { currentWeek, currentDay } = getCurrentWeekAndDay()
>>>>>>> 46ea0bb (progress)

    if (isPaidMember && isCompleted) {
      return (
        <div className="md:col-span-2 border border-green-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
          <div className="bg-green-50 p-4">
            <p className="text-gray-900 text-lg font-medium">
              Week {currentWeek}, Day {currentDay} - Completed ✅
            </p>
          </div>
          <div className="p-4 text-sm text-gray-800">
<<<<<<< HEAD
            <p className="text-green-600 font-semibold">
              Bạn đã hoàn thành tiến độ cho ngày hôm nay!
            </p>
            <p className="text-gray-600 mt-2">
              Submission Date:{" "}
              {dailyProgressStatus[dayKey]?.submissionDate
                ? new Date(
                    dailyProgressStatus[dayKey].submissionDate
                  ).toLocaleDateString("vi-VN")
=======
            <p className="text-green-600 font-semibold">Bạn đã hoàn thành tiến độ cho ngày hôm nay!</p>
            <p className="text-gray-600 mt-2">
              Submission Date:{" "}
              {dailyProgressStatus[dayKey]?.submissionDate
                ? new Date(dailyProgressStatus[dayKey].submissionDate).toLocaleDateString("vi-VN")
>>>>>>> 46ea0bb (progress)
                : "N/A"}
            </p>
          </div>
        </div>
<<<<<<< HEAD
      );
    }

    if (!showDailySubmission()) return null;
=======
      )
    }

    if (!showDailySubmission()) return null
>>>>>>> 46ea0bb (progress)

    return (
      <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
        <div className="bg-blue-50 p-4">
          <p className="text-gray-900 text-lg font-medium">
            {isPaidMember
<<<<<<< HEAD
              ? `Week ${currentWeek}, Day ${currentDay} - Daily Progress`
=======
              ? `Week ${currentWeek}, Day ${currentDay} - Daily Check-in`
>>>>>>> 46ea0bb (progress)
              : `Week ${currentWeek} Quiz (Day ${currentDay})`}
          </p>
        </div>
        <div className="p-4 text-sm text-gray-800 space-y-3">
          {quizSubmitted && !isPaidMember ? (
            <div>
<<<<<<< HEAD
              <p className="text-green-600 font-semibold">Quiz Submitted!</p>
=======
              <p className="text-green-600 font-semibold">Thank you for sharing! 🎉</p>
>>>>>>> 46ea0bb (progress)
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
<<<<<<< HEAD
                <label className="block font-semibold">
                  How many cigarettes did you smoke{" "}
                  {isPaidMember ? "today" : "this week"}?
                </label>
                <input
                  type="number"
                  name="cigarettes"
                  value={quizAnswers.cigarettes || ""}
                  onChange={handleQuizChange}
                  className="w-full border border-gray-300 rounded p-2 mt-1"
                  placeholder="Enter number"
                />
              </div>
              <div>
                <label className="block font-semibold">
                  What was your biggest trigger{" "}
                  {isPaidMember ? "today" : "this week"}?
                </label>
                <input
                  type="text"
                  name="trigger"
                  value={quizAnswers.trigger || ""}
                  onChange={handleQuizChange}
                  className="w-full border border-gray-300 rounded p-2 mt-1"
                  placeholder="Describe trigger"
                />
              </div>
              <div>
                <label className="block font-semibold">
                  How did you manage cravings?
                </label>
                <textarea
                  name="cravings"
                  value={quizAnswers.cravings || ""}
                  onChange={handleQuizChange}
                  className="w-full border border-gray-300 rounded p-2 mt-1"
                  placeholder="Describe your strategies"
                  rows="4"
                />
              </div>
              {isPaidMember && (
                <div>
                  <label className="block font-semibold">
                    Rate your mood today (1-10):
                  </label>
                  <input
                    type="number"
                    name="mood"
                    min="1"
                    max="10"
                    value={quizAnswers.mood || ""}
                    onChange={handleQuizChange}
                    className="w-full border border-gray-300 rounded p-2 mt-1"
                    placeholder="1 (very bad) to 10 (excellent)"
                  />
                </div>
              )}
=======
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

>>>>>>> 46ea0bb (progress)
              <button
                onClick={handleQuizSubmit}
                disabled={submittingProgress}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submittingProgress
                  ? "Submitting..."
                  : isPaidMember
<<<<<<< HEAD
                  ? "Submit Daily Progress"
                  : "Submit Quiz"}
              </button>
=======
                    ? "Check in for today"
                    : "Submit my answers"}
              </button>
              <p className="text-gray-500 text-xs mt-2">
                {isPaidMember
                  ? "Your daily check-in helps you stay on track. Keep it up!"
                  : "Your weekly quiz helps us support your journey. You're doing great!"}
              </p>
>>>>>>> 46ea0bb (progress)
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
    );
  };
=======
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


                  {plan.planSchema?.notesOrDisclaimers && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-semibold text-yellow-800 mb-2">Important Notes:</p>
                      <p className="text-yellow-700 space-y-1">{plan.planSchema.notesOrDisclaimers}</p>
                    </div>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }
>>>>>>> 46ea0bb (progress)

  if (loading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
<<<<<<< HEAD
          <p className="mt-4 text-gray-600">
            Loading your personalized plan...
          </p>
        </div>
      </div>
    );
  }

  const plan = getActivePlan();
  const strategiesByWeek = plan
    ? splitStrategiesByWeek(plan.strategies, plan.weeks)
    : [];
  const { currentWeek, currentDay } = getCurrentWeekAndDay();

  return (
    <div className="px-4 py-6 relative">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-lg">
          Track Your Smoking Cessation Progress
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenAppointmentModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            📅 Đặt lịch hẹn
          </button>
          {isPaidMember && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              VIP Member
            </div>
          )}
        </div>
=======
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

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-lg">Track Your Smoking Cessation Progress</p>
        {isPaidMember && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            VIP Member
          </div>
        )}
>>>>>>> 46ea0bb (progress)
      </div>

      {/* Date Picker */}
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
        {/* Phase Selector */}
        {isPaidMember ? renderVIPPlanPhases() : renderFreePlanPhases()}

        {/* Main Content */}
        <div className="w-full grid md:grid-cols-2 gap-6">
<<<<<<< HEAD
          {/* Goal & Strategies */}
          {plan && (
            <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-blue-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Goal & Strategies{" "}
                  {isPaidMember && (
                    <span className="text-purple-600">(AI Generated)</span>
                  )}
=======
          {/* Smoking Log Info */}
          {renderSmokingLogInfo()}

          {/* Progress History */}
          {renderProgressHistory()}

          {/* AI Plan Info for VIP */}
          {renderPlanInfo()}

          {/* Goal & Strategies */}
          {currentPlanPhase && (
            <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-blue-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Goal & Strategies {isPaidMember && <span className="text-purple-600">(AI Generated)</span>}
>>>>>>> 46ea0bb (progress)
                </p>
              </div>
              <div className="p-4 text-sm text-gray-800 space-y-3">
                <p>
<<<<<<< HEAD
                  <strong>Goal:</strong> {plan.goal}
=======
                  <strong>Goal:</strong> {currentPlanPhase.goal}
>>>>>>> 46ea0bb (progress)
                </p>
                <p>
                  <strong>Strategies by Week:</strong>
                </p>
                {strategiesByWeek.map((weekStrategies, index) => (
                  <div key={index} className="pl-4">
<<<<<<< HEAD
                    <p className="font-semibold text-indigo-600">
                      Week {index + 1}:
                    </p>
=======
                    <p className="font-semibold text-indigo-600">Week {index + 1}:</p>
>>>>>>> 46ea0bb (progress)
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

          {/* Daily Submission / Weekly Quiz */}
          {renderDailySubmission()}

          {/* Phase Duration */}
<<<<<<< HEAD
          {plan && (
            <Card
              title="Phase Duration"
              subtitle="In Progress"
              value={`${plan.days} days`}
            />
=======
          {currentPlanPhase && (
            <Card title="Phase Duration" subtitle="In Progress" value={`${currentPlanPhase.days} days`} />
>>>>>>> 46ea0bb (progress)
          )}

          {/* Money Saved */}
          {/* <Card title="Money Saved" subtitle="Savings" value={`${calculateSavedMoney().toLocaleString()} VND`} /> */}

          {/* Health Improvement */}
          <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-blue-50 p-4">
              <p className="text-gray-900 text-lg font-medium">
                Health Improvement
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Recovering</span>
              </div>
              {/* <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all"
                  style={{ width: `${calculateHealthImprovement()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{calculateHealthImprovement().toFixed(1)}%</p> */}
            </div>
          </div>

          {/* Smoking Statistics */}
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

          {/* VIP Progress Overview */}
<<<<<<< HEAD
          {isPaidMember && (
            <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-purple-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Weekly Progress Overview
                </p>
=======
          {
            <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-purple-50 p-4">
                <p className="text-gray-900 text-lg font-medium">Weekly Progress Overview</p>
>>>>>>> 46ea0bb (progress)
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
<<<<<<< HEAD
                    const dayKey = `week${currentWeek}_day${day}`;
                    const isCompleted = isDayCompleted(dayKey);
                    const isToday = day === currentDay;
=======
                    const dayKey = `week${currentWeek}_day${day}`
                    const isCompleted = isDayCompleted(dayKey)
                    const isToday = day === currentDay
>>>>>>> 46ea0bb (progress)

                    return (
                      <div
                        key={day}
<<<<<<< HEAD
                        className={`p-2 text-center rounded text-sm font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-800"
                            : isToday
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Day {day}
                        {isCompleted && <div className="text-xs">✅</div>}
                        {isToday && !isCompleted && (
                          <div className="text-xs">📝</div>
                        )}
                      </div>
                    );
=======
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
>>>>>>> 46ea0bb (progress)
                  })}
                </div>
              </div>
            </div>
<<<<<<< HEAD
          )}
=======
          }
>>>>>>> 46ea0bb (progress)
        </div>
      </div>

      {/* Modal với custom styling để tránh background đen */}
      {openAppointmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay với background trong suốt */}
          <div
            className="fixed inset-0  bg-opacity-10 backdrop-blur-sm transition-opacity"
            onClick={() => setOpenAppointmentModal(false)}
          />

          {/* Modal content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <AppointmentModal
                open={openAppointmentModal}
                onClose={() => setOpenAppointmentModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

<<<<<<< HEAD
// Card component
const Card = ({ title, subtitle, value }) => (
  <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
    <div className="bg-blue-50 p-4">
      <p className="text-gray-900 text-lg font-medium">{title}</p>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>{subtitle}</span>
      </div>
      <p className="text-gray-900 text-xl font-semibold">{value}</p>
    </div>
  </div>
);
=======
>>>>>>> 46ea0bb (progress)
