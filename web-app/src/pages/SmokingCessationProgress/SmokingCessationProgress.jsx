/* eslint-disable react/prop-types */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { parse, format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { smokingCessationApi } from "@/services/smokingCessationApi";
import DayCard from "./DayCard";
import { buildCalendar } from "./util";
import AppointmentCalendar from "../Appointments/AppointmentModal";

// Helper
const mapPhases = (planPhases = []) =>
  planPhases.map((p, idx) => ({
    number: p.phaseNumber ?? idx + 1,
    title: `Phase ${p.phaseNumber ?? idx + 1}: ${p.weekRange || "Phase"}`,
    subtitle: p.goal ?? "",
    icon: ["🎯", "🚀", "💪", "🏆"][idx % 4],
    color: [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-yellow-400 to-yellow-600",
    ][idx % 4],
    raw: p,
  }));

const SmokingCessationProgress = () => {
  const { userId, token, memberPackage } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const isVIP = memberPackage?.status === "ACTIVE";

  const [plan, setPlan] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [phaseInfo, setPhaseInfo] = useState([]);
  const [copingList, setCopingList] = useState([]);
  const [activePhase, setActivePhase] = useState(0);
  const [progressToday, setProgressToday] = useState(null);
  const [allProgresses, setAllProgresses] = useState([]);
  const [moneySaved, setMoneySaved] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const { plans, planPhases, copingMechanisms } =
        await smokingCessationApi.getPlanByUserId(userId, token);

      if (!plans?.length) {
        toast.info("AI plan is still generating. Please wait …");
        return;
      }

      const activePlan = plans[0];
      setPlan(activePlan);
      setCalendar(buildCalendar(activePlan));
      setPhaseInfo(planPhases?.length ? mapPhases(planPhases) : []);
      setCopingList(copingMechanisms || []);
    } catch (err) {
      console.error("fetchPlan", err);
      toast.error("Cannot load plan");
    } finally {
      setLoadingPlan(false);
    }
  }, [userId, token]);

  const fetchTodayProgress = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const { progresses, progressLog } =
        await smokingCessationApi.getDailyProgressByMemberId(userId, token);

      const todayStr = format(new Date(), "yyyy-MM-dd");
      const todayData = progresses?.find((p) => {
        const formatted = format(
          parse(p.dateCreated, "dd-MM-yyyy", new Date()),
          "yyyy-MM-dd"
        );
        return formatted === todayStr;
      });

      setProgressToday(todayData || null);
      setMoneySaved(progressLog?.totalMoneySaved || 0);
      setAllProgresses(progresses || []);
    } catch (err) {
      if (err.response?.status === 400) {
        setProgressToday(null);
        setMoneySaved(0);
      } else {
        console.error("Unexpected error loading progress:", err);
      }
    }
  }, [userId, token]);

  useEffect(() => {
    fetchPlan();
    fetchTodayProgress();
  }, [fetchPlan, fetchTodayProgress]);

  const submitProgress = async ({ daysSmokeFree, healthImprovement }) => {
    setLoadingSubmit(true);
    try {
      const res = await smokingCessationApi.submitDailyProgress(
        userId,
        { completed: true, daysSmokeFree, healthImprovement },
        token
      );
      toast.success(`Progress saved! 💰 Money saved: $${res.moneySaved}`);
      await fetchTodayProgress();
    } catch (err) {
      console.error("submit", err);
      toast.error("Could not submit progress");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleSubmitProgress = (day, data) => {
    submitProgress(data);
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🚭</div>
          <p className="text-gray-600 mb-4">No plan found. Go back & create one.</p>
          <button
            onClick={() => navigate("/onboarding")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center relative">
            <div className="flex items-center justify-center mb-2">
              <span className="text-4xl mr-3">🚭</span>
              <h1 className="text-3xl font-bold text-gray-900">
                28-Day Smoking Cessation Journey
              </h1>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="absolute right-0 top-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
              >
                📅 Book Appointments             </button>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your personalized path to a smoke‑free life. Each phase is designed to support your journey with daily goals, tasks, and tips.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Money Saved</h3>
            <p className="text-3xl font-bold text-green-600">
              {moneySaved?.toLocaleString() || 0} đ
            </p>
          </div>
        </div>

        {/* Phase Selection Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {phaseInfo.map((phase, index) => {
              const isActive = activePhase === index;
              const isLocked = !isVIP && index > 0;
              return (
                <button
                  key={index}
                  onClick={() => !isLocked && setActivePhase(index)}
                  disabled={isLocked}
                  className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 min-w-[200px]
                    ${isActive ? `bg-gradient-to-r ${phase.color} text-white shadow-lg transform scale-105` : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}
                    ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">{phase.icon}</span>
                    {isLocked && <span className="text-sm">🔒</span>}
                  </div>
                  <div className="text-sm font-semibold">{phase.title}</div>
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {!!calendar.length && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">{phaseInfo[activePhase]?.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{phaseInfo[activePhase]?.title}</h2>
                <p className="text-gray-600">{phaseInfo[activePhase]?.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {calendar[activePhase]?.map((day, dIdx) => {
                if (!isVIP && activePhase === 0 && dIdx >= 3) {
                  return (
                    <div key={`${activePhase}-${dIdx}`} className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-2">🔒</div>
                        <div className="text-xs font-medium">VIP Only</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <DayCard
                    key={`${activePhase}-${dIdx}`}
                    day={day}
                    allProgresses={allProgresses}
                    todayProgress={progressToday}
                    moneySaved={moneySaved}
                    todayMoney={progressToday?.moneySaved}
                    onSubmit={(data) => handleSubmitProgress(day, data)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Coping Mechanisms */}
        {copingList.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">🛠️ Coping Mechanisms</h2>
            <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
              {copingList.map((item) => (
                <li key={item.id}>{item.content}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Non-VIP Notice */}
      {!isVIP && (
        <div className="py-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⭐</span>
              <div>
                <h3 className="font-semibold text-amber-800">Preview Mode</h3>
                <p className="text-amber-700 text-sm">
                  You're viewing a preview. Upgrade to VIP to unlock the full 28‑day plan with all phases.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/membership")}
              className="ml-6 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Upgrade to VIP
            </button>
          </div>
        </div>
      )}

      <AppointmentCalendar open={showAppointmentModal} onClose={() => setShowAppointmentModal(false)} />
    </div>
  );
};

export default SmokingCessationProgress;
