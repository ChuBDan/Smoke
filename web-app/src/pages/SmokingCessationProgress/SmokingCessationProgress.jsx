"use client";

import { useState, useEffect, useMemo } from "react";
import { smokingCessationApi } from "@/services/smokingCessationApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { dateUtils } from "@/utils/dateUtils";
import { getCurrentSmokingLog } from "@/utils/smokingLogUtils";
import { getCurrentSmokingPlan } from "@/utils/planUtils";
import Card from "./components/Card";
import { lightPlanPhases } from "./components/freePhases";
import AppointmentModal from "@/pages/Appointments/AppointmentModal";

export default function SmokingcessationProgress() {
  const [currentPhase, setCurrentPhase] = useState("phase1");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [planLoadingDone, setPlanLoadingDone] = useState(false);

  const [plan, setPlan] = useState(null);
  const [dailyProgressStatus, setDailyProgressStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [progressHistory, setProgressHistory] = useState([]);
  const [existingLog, setExistingLog] = useState(null);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [moneySaved, setMoneySaved] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { userId, token } = useSelector((state) => state.auth);

  // Move this useMemo to the top level, after all useState calls
  const startDate = useMemo(() => {
    if (existingLog?.logDate) {
      return new Date(dateUtils.parseDDMMYYYY(existingLog.logDate));
    }
    return new Date();
  }, [existingLog]);

  // Move isPaidMember calculation to useMemo at top level
  const isPaidMember = useMemo(() => {
    return plan && Object.prototype.hasOwnProperty.call(plan, "planSchema");
  }, [plan]);

  // Helper functions should be defined before they're used in useMemo
  const transformAIPlanToPhases = (plan) => {
    if (!plan || !plan.planSchema || !plan.planSchema.phases) {
      return null;
    }

    return plan.planSchema.phases.map((phase) => ({
      key: `ai_phase${phase.phaseNumber}`,
      name: `Phase ${phase.phaseNumber} (${phase.weekRange})`,
      days: calculatePhaseDays(phase.weekRange),
      weeks: calculatePhaseWeeks(phase.weekRange),
      goal: phase.goal,
      strategies: phase.strategies,
      weeklyBreakdown: phase.weeklyBreakdown || [],
    }));
  };

  const calculatePhaseDays = (timePeriod) => {
    // Parse time period like "Weeks 1-2", "Weeks 3-8", etc.
    const match = timePeriod.match(/Weeks?\s+(\d+)(?:-(\d+))?/i);
    if (match) {
      const start = Number.parseInt(match[1]);
      const end = match[2] ? Number.parseInt(match[2]) : start;
      return (end - start + 1) * 7;
    }
    return 28; // Default to 4 weeks
  };

  const calculatePhaseWeeks = (timePeriod) => {
    return Math.ceil(calculatePhaseDays(timePeriod) / 7);
  };

  // Move activePlan useMemo to top level with all dependencies
  const activePlan = useMemo(() => {
    if (isPaidMember && plan) {
      return transformAIPlanToPhases(plan);
    }
    return lightPlanPhases.find((p) => p.key === currentPhase);
  }, [isPaidMember, plan, currentPhase]);

  const getTotalDays = () => {
    const now = customDate ? new Date(customDate) : new Date();
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  };

  const { currentWeek, currentDay, dayKey } = useMemo(() => {
    const totalDays = getTotalDays();
    let daysInPhase = totalDays;
    let planDuration = 28;

    if (isPaidMember && Array.isArray(activePlan)) {
      const currentPhaseData =
        activePlan.find((p) => p.key === currentPhase) || activePlan[0];
      if (currentPhaseData) {
        planDuration = currentPhaseData.days;
      }
    } else if (activePlan) {
      planDuration = activePlan.days;
    }

    daysInPhase = totalDays % planDuration || totalDays;
    const currentWeek = Math.floor(daysInPhase / 7) + 1;
    const currentDay = daysInPhase % 7 || 7;
    const dayKey = `week${currentWeek}_day${currentDay}`;

    return { currentWeek, currentDay, dayKey };
  }, [
    customDate,
    startDate,
    activePlan,
    currentPhase,
    isPaidMember,
    refreshKey,
  ]);

  useEffect(() => {
    if (plan?.planSchema?.phases) {
      console.log("Plan Phases Debug >>", plan.planSchema.phases);
    }
  }, [plan]);

  useEffect(() => {
    const fetchSmokingLogData = async () => {
      try {
        const activeLog = await getCurrentSmokingLog(userId, token);
        if (activeLog) {
          setExistingLog(activeLog);
        }
      } catch (error) {
        console.error("Error fetching smoking log data:", error);
        toast.error("Can't load smoking log data");
      }
    };
    fetchSmokingLogData();
  }, [userId, token]);

  const normalizeProgresses = (progresses, startDate) => {
    const result = {};

    progresses.forEach((p) => {
      const createdAt = new Date(p.dateCreated);
      const diffInDays = Math.ceil(
        (createdAt - startDate) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays <= 0) return;

      const week = Math.floor((diffInDays - 1) / 7) + 1;
      const day = ((diffInDays - 1) % 7) + 1;
      const key = `week${week}_day${day}`;

      result[key] = {
        completed: true,
        submissionDate: createdAt.toISOString(),
        id: p.id, // <- thêm ID
      };
    });

    return result;
  };

  // Function to refresh progress data
  const refreshProgressData = async (effectiveStartDate) => {
    try {
      const fullProgress = await smokingCessationApi.getDailyProgressByMemberId(
        userId,
        token
      );

      if (fullProgress?.progresses) {
        const normalized = normalizeProgresses(
          fullProgress.progresses,
          effectiveStartDate
        );
        setDailyProgressStatus(normalized);
      }

      if (fullProgress?.progressLog?.totalMoneySaved != null) {
        setMoneySaved(fullProgress.progressLog.totalMoneySaved);
      }

      setProgressHistory(fullProgress.progresses || []);
    } catch (error) {
      console.error("Error refreshing progress data:", error);
    }
  };

  // Fetch plan data
  useEffect(() => {
    const fetchPlanData = async () => {
      if (userId && token && existingLog) {
        setLoading(true);
        try {
          const planInitResponse = await getCurrentSmokingPlan(userId, token);

          const planId = planInitResponse.id;

          if (planInitResponse) {
            const planResponse = await smokingCessationApi.getPlan(
              planId,
              token
            );
            setPlan(planResponse.plan);

            if (planResponse.plan?.planSchema) {
              await refreshProgressData();
            }
          } else {
            // free member vẫn fetch progressHistory
            setPlan(null);
            await refreshProgressData();
          }
        } catch (error) {
          console.error("Error fetching plan data:", error);
        } finally {
          setLoading(false);
          setPlanLoadingDone(true);
        }
      }
    };

    fetchPlanData();
  }, [existingLog, userId, token, startDate]); // chạy sau khi existingLog được set

  // Default values
  let cigsPerDay = 10;
  let costPerCig = 2000;

  if (!planLoadingDone) {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Checking your membership status...
          </p>
        </div>
      </div>
    );
  }
  // Use smokingLogs if available
  if (existingLog) {
    if (existingLog.cigarettesPerDay) {
      cigsPerDay = existingLog.cigarettesPerDay;
    }
    if (existingLog.cost) {
      costPerCig = existingLog.cost;
    }
  }

  const showDailySubmission = () => {
    return isPaidMember
      ? !isDayCompleted(dayKey)
      : currentDay === 3 || currentDay === 7;
  };

  const isDayCompleted = (key) => !!dailyProgressStatus[key]?.completed;

  const splitStrategiesByWeek = (strategies, weeks) => {
    const result = [];
    const perWeek = Math.ceil(strategies.length / weeks);
    for (let i = 0; i < weeks; i++) {
      result.push(strategies.slice(i * perWeek, (i + 1) * perWeek));
    }
    return result;
  };

  const handleQuizChange = (e) => {
    setQuizAnswers({ ...quizAnswers, [e.target.name]: e.target.value });
  };

  const handleQuizSubmit = async () => {
    const { healthImprovement, daysSmokeFree } = quizAnswers;
    const existingProgressEntry = dailyProgressStatus[dayKey];
    const progressId = existingProgressEntry?.id;

    if (isPaidMember) {
      // ==== Validate input ====
      if (
        !healthImprovement ||
        !daysSmokeFree ||
        isNaN(daysSmokeFree) ||
        daysSmokeFree <= 0
      ) {
        toast.error(
          "Vui lòng nhập đầy đủ và hợp lệ cho ngày không hút thuốc và cảm nhận sức khỏe."
        );
        return;
      }

      setSubmittingProgress(true);
      try {
        const progressData = {
          healthImprovement,
          daysSmokeFree: parseInt(daysSmokeFree),
        };

        const hasExistingProgress = Object.keys(dailyProgressStatus).length > 0;

        let response;
        if (!progressId) {
          response = await smokingCessationApi.createProgress(
            userId,
            progressData,
            token
          );
        } else {
          response = await smokingCessationApi.updateProgress(
            progressId,
            progressData,
            token
          );
        }

        // Cập nhật moneySaved nếu BE trả về
        if (response?.moneySaved != null) {
          setMoneySaved(response.moneySaved);
        }

        // Refresh progress data after successful submission
        await refreshProgressData(startDate);
        setRefreshKey((prev) => prev + 1);

        setQuizSubmitted(true);
        setCustomDate(""); // reset ngày thử nghiệm
        setQuizAnswers({}); // Reset form

        toast.success("Tiến độ hàng ngày đã được ghi nhận!");
      } catch (error) {
        console.error("Error submitting daily progress:", error);
        toast.error("Có lỗi khi ghi nhận tiến độ. Vui lòng thử lại.");
      } finally {
        setSubmittingProgress(false);
      }
    } else {
      // ===== Free Member =====
      setSubmittingProgress(true);
      try {
        const progressData = {
          cigarettes: quizAnswers.cigarettes,
          trigger: quizAnswers.trigger,
          cravings: quizAnswers.cravings,
        };

        await smokingCessationApi.createProgress(userId, progressData, token);

        const historyResponse =
          await smokingCessationApi.getMemberProgressHistory(userId);
        setProgressHistory(historyResponse);
        setQuizSubmitted(true);
        setQuizAnswers({}); // Reset form
        setQuizAnswers({}); // Reset form
        toast.success("Quiz đã được ghi nhận!");
      } catch (error) {
        console.error("Error submitting quiz:", error);
        toast.error("Có lỗi khi ghi nhận quiz. Vui lòng thử lại.");
      } finally {
        setSubmittingProgress(false);
      }
    }
  };

  const handleDateChange = (e) => {
    setCustomDate(e.target.value);
    setQuizSubmitted(false);
  };

  const renderSmokingLogInfo = () => {
    if (!existingLog) return null;
    const log = existingLog;

    return (
      <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition mb-6">
        <div className="bg-blue-50 p-4">
          <p className="text-gray-900 text-lg font-medium">
            Your Smoking Profile
          </p>
        </div>
        <div className="p-4 text-sm text-gray-800 space-y-3">
          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(startDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Cigarettes per Day:</strong> {log.cigarettesPerDay}
              </p>
              <p>
                <strong>Cost per Cigarette:</strong>{" "}
                {log.cost?.toLocaleString()} VND
              </p>
              <p>
                <strong>Daily Cost:</strong>{" "}
                {(log.cigarettesPerDay * log.cost)?.toLocaleString()} VND
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
    );
  };

  const renderProgressHistory = () => {
    if (progressHistory.length === 0) return null;

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
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">
                      {progress.dateCreated
                        ? new Date(progress.dateCreated).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </span>
                    {progress.cigarettes && (
                      <span className="ml-2 text-gray-600">
                        {progress.cigarettes} cigarettes
                      </span>
                    )}
                  </div>
                  <div className="text-green-600">✅</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVIPPlanPhases = () => {
    if (!activePlan || !Array.isArray(activePlan)) return null;

    return (
      <div className="flex flex-col gap-4 text-sm text-gray-600">
        {activePlan.map((phase) => (
          <p
            key={phase.key}
            onClick={() => {
              setCurrentPhase(phase.key);
              setQuizAnswers({});
              setQuizSubmitted(false);
            }}
            className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
              currentPhase === phase.key
                ? "bg-indigo-100 text-black font-medium"
                : ""
            }`}
          >
            {phase.name}
          </p>
        ))}
      </div>
    );
  };

  const renderFreePlanPhases = () => (
    <div className="flex flex-col gap-4 text-sm text-gray-600">
      {lightPlanPhases.map((phase) => (
        <p
          key={phase.key}
          onClick={() => {
            setCurrentPhase(phase.key);
            setQuizAnswers({});
            setQuizSubmitted(false);
          }}
          className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
            currentPhase === phase.key
              ? "bg-indigo-100 text-black font-medium"
              : ""
          }`}
        >
          {phase.name}
        </p>
      ))}
    </div>
  );

  const getActivePlan = () => {
    return activePlan;
  };

  const renderDailySubmission = () => {
    const isCompleted = isDayCompleted(dayKey);

    const activePhase = getActivePlan();
    const currentPlan = Array.isArray(activePhase)
      ? activePhase.find((p) => p.key === currentPhase) || activePhase[0]
      : activePhase;

    const weekIndex = currentWeek - 1;
    const dayIndex = currentDay - 1;
    const today =
      currentPlan?.weeklyBreakdown?.[weekIndex]?.dailyBreakdowns?.[dayIndex];

    // Nếu đã hoàn thành, chỉ hiện thông tin đã nộp
    if (isPaidMember && isCompleted) {
      return (
        <div className="md:col-span-2 border border-green-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
          <div className="bg-green-50 p-4">
            <p className="text-gray-900 text-lg font-medium">
              Week {currentWeek}, Day {currentDay} - Completed ✅
            </p>
          </div>
          <div className="p-4 text-sm text-gray-800">
            <p className="text-green-600 font-semibold">
              Bạn đã hoàn thành tiến độ cho ngày hôm nay!
            </p>
            <p className="text-gray-600 mt-2">
              Submission Date:{" "}
              {dailyProgressStatus[dayKey]?.submissionDate
                ? new Date(
                    dailyProgressStatus[dayKey].submissionDate
                  ).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
            {moneySaved !== null && (
              <p className="text-green-700 font-semibold mt-2">
                🎉 You've saved {moneySaved.toLocaleString()} VND!
              </p>
            )}
          </div>
        </div>
      );
    }

    // Nếu chưa hoàn thành, hiện form + today's plan
    if (!showDailySubmission()) return null;

    return (
      <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
        <div className="bg-blue-50 p-4">
          <p className="text-gray-900 text-lg font-medium">
            {isPaidMember
              ? `Week ${currentWeek}, Day ${currentDay} - Daily Check-in`
              : `Week ${currentWeek} Quiz (Day ${currentDay})`}
          </p>
        </div>
        <div className="p-4 text-sm text-gray-800 space-y-4">
          {/* Today's Plan */}
          {today && (
            <div className="p-3 border rounded bg-blue-50 text-sm text-gray-800 space-y-2">
              <p className="font-semibold text-indigo-700">Today's Plan:</p>
              <p>
                <strong>Daily Goal:</strong> {today.dailyGoal}
              </p>
              <p>
                <strong>Task:</strong> {today.taskOrAdvice}
              </p>
              <p className="text-green-600">
                <strong>Tip:</strong> {today.motivationalTip}
              </p>
            </div>
          )}

          {/* Quiz Input */}
          <div>
            <label className="block font-semibold mb-1">
              How are you feeling about your health today?
            </label>
            <select
              name="healthImprovement"
              value={quizAnswers.healthImprovement || ""}
              onChange={handleQuizChange}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">Choose your feeling...</option>
              <option value="BAD">Not so good</option>
              <option value="NORMAL">Okay</option>
              <option value="GOOD">Great!</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              How many days have you stayed smoke-free?
            </label>
            <input
              type="number"
              name="daysSmokeFree"
              min={0}
              value={quizAnswers.daysSmokeFree || ""}
              onChange={handleQuizChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g., 5"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleQuizSubmit}
            disabled={submittingProgress}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {submittingProgress ? "Submitting..." : "Check in for today"}
          </button>

          <p className="text-gray-500 text-xs mt-2">
            Your daily check-in helps you stay on track. Keep it up!
          </p>

          {moneySaved !== null && (
            <p className="text-green-700 font-semibold">
              🎉 You've saved {moneySaved.toLocaleString()} VND!
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPlanInfo = () => {
    if (isPaidMember && plan) {
      return (
        <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition mb-6">
          <div className="bg-purple-50 p-4">
            <p className="text-gray-900 text-lg font-medium">
              AI Generated Plan Details
            </p>
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
                  <strong>Starting Cigarettes:</strong>{" "}
                  {plan.planSchema?.initialCigarettesPerDay}/day
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
                  <strong>Daily Cost:</strong>{" "}
                  {plan.planSchema?.costPerDay?.toLocaleString()} VND
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600">{plan.status}</span>
                </p>
              </div>
            </div>

            {plan.planSchema?.copingMechanisms && (
              <div className="mt-4">
                <p className="font-semibold text-purple-600 mb-2">
                  Recommended Coping Mechanisms:
                </p>
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
                <p className="font-semibold text-yellow-800 mb-2">
                  Important Notes:
                </p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {plan.planSchema.warningsOrNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {plan.planSchema?.notesOrDisclaimers && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800 mb-2">
                  Important Notes:
                </p>
                <p className="text-yellow-700 space-y-1">
                  {plan.planSchema.notesOrDisclaimers}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your personalized plan...
          </p>
        </div>
      </div>
    );
  }

  const currentPlanPhase = Array.isArray(activePlan)
    ? activePlan.find((p) => p.key === currentPhase) || activePlan[0]
    : activePlan;

  const strategiesByWeek = currentPlanPhase
    ? splitStrategiesByWeek(currentPlanPhase.strategies, currentPlanPhase.weeks)
    : [];

  console.log("plan >> ", plan);
  console.log("existingLog >> ", existingLog);

  if (!existingLog && !loading) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="text-lg font-semibold mb-2">
          You haven't provided your smoking status yet!
        </p>
        <p className="mb-4">
          Please complete the form before starting to track your cessation
          progress.
        </p>
        <a
          href="/smokingstatusform"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Go to Smoking Status Form
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
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
              PRENIUM MEMBER
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Select Date to Test (YYYY-MM-DD):
        </label>
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
          Journey started: {startDate.toLocaleDateString("vi-VN")} (
          {getTotalDays()} days ago)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {isPaidMember ? renderVIPPlanPhases() : renderFreePlanPhases()}

        <div className="w-full grid md:grid-cols-2 gap-6">
          {renderSmokingLogInfo()}

          {/* Progress History */}
          {/* {renderProgressHistory()} */}

          {/* AI Plan Info for VIP */}
          {renderPlanInfo()}

          {currentPlanPhase && (
            <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-blue-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Goal & Strategies{" "}
                  {isPaidMember && (
                    <span className="text-purple-600">(AI Generated)</span>
                  )}
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
                    <p className="font-semibold text-indigo-600">
                      Week {index + 1}:
                    </p>
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
          {!loading && showDailySubmission() && renderDailySubmission()}

          {currentPlanPhase && (
            <Card
              title="Phase Duration"
              subtitle="In Progress"
              value={`${currentPlanPhase.days} days`}
            />
          )}

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
            </div>
          </div>

          <div className="border border-orange-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-orange-50 p-4">
              <p className="text-gray-900 text-lg font-medium">
                Your Statistics
              </p>
            </div>
            <div className="p-4 text-sm text-gray-800 space-y-2">
              <p>
                <strong>Daily cigarettes:</strong> {cigsPerDay}
              </p>
              <p>
                <strong>Cost per cigarette:</strong>{" "}
                {costPerCig.toLocaleString()} VND
              </p>
              <p>
                <strong>Daily cost:</strong>{" "}
                {(cigsPerDay * costPerCig).toLocaleString()} VND
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
          <div className="md:col-span-2 border border-purple-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-purple-50 p-4">
              <p className="text-gray-900 text-lg font-medium">
                Weekly Progress Overview
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: currentDay }, (_, i) => i + 1).map(
                  (day) => {
                    const dayKey = `week${currentWeek}_day${day}`;
                    const isCompleted = isDayCompleted(dayKey);
                    const isToday = day === currentDay;

                    // Chỉ đánh ❌ nếu đã có ít nhất một bản ghi trong dailyProgressStatus
                    const shouldMark =
                      Object.keys(dailyProgressStatus).length > 0;

                    return (
                      <div
                        key={day}
                        className={`p-2 text-center rounded text-sm font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-800"
                            : isToday
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Day {day}
                        {isCompleted ? (
                          <div className="text-xs">✅</div>
                        ) : shouldMark ? (
                          <div className="text-xs">❌</div>
                        ) : (
                          <div className="text-xs">—</div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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
  );
}
