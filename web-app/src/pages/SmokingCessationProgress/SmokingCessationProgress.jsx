import React, { useState } from "react";

const phases = [
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
  const [customDate, setCustomDate] = useState(""); // State for custom date

  const startDate = new Date("2025-06-19");
  const cigsPerDay = 10;
  const costPerCig = 2000;

  const getTotalDays = () => {
    const now = customDate ? new Date(customDate) : new Date();
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  };

  const getPhase = () => phases.find((p) => p.key === currentPhase);

  const getCurrentWeekAndDay = () => {
    const totalDays = getTotalDays();
    const daysInPhase = totalDays % getPhase().days || totalDays;
    const currentWeek = Math.floor(daysInPhase / 7) + 1;
    const currentDay = (daysInPhase % 7) || 7;
    return { currentWeek, currentDay };
  };

  const showQuiz = () => {
    const { currentDay } = getCurrentWeekAndDay();
    return currentDay === 3 || currentDay === 7;
  };

  const calculateSavedMoney = () => {
    return getPhase().days * cigsPerDay * costPerCig;
  };

  const calculateHealthImprovement = () => {
    const days = getPhase().days;
    return Math.min((days / 30) * 100, 100);
  };

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

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleDateChange = (e) => {
    setCustomDate(e.target.value);
    setQuizSubmitted(false); // Reset quiz when changing date
  };

  const phase = getPhase();
  const strategiesByWeek = splitStrategiesByWeek(phase.strategies, phase.weeks);
  const { currentWeek, currentDay } = getCurrentWeekAndDay();

  return (
    <div className="px-4 py-6">
      <p className="text-gray-600 text-lg mb-4">Track Your Smoking Cessation Progress</p>

      {/* Date Picker */}
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
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Phase Selector */}
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          {phases.map((phase) => (
            <p
              key={phase.key}
              onClick={() => {
                setCurrentPhase(phase.key);
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
                currentPhase === phase.key ? "bg-indigo-100 text-black font-medium" : ""
              }`}
            >
              {phase.name}
            </p>
          ))}
        </div>

        {/* Main Content */}
        <div className="w-full grid md:grid-cols-2 gap-6">
          {/* Goal & Strategies */}
          <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-blue-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Goal & Strategies</p>
            </div>
            <div className="p-4 text-sm text-gray-800 space-y-3">
              <p><strong>Goal:</strong> {phase.goal}</p>
              <p><strong>Strategies by Week:</strong></p>
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

          {/* Weekly Quiz */}
          {showQuiz() && (
            <div className="md:col-span-2 border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <div className="bg-blue-50 p-4">
                <p className="text-gray-900 text-lg font-medium">
                  Week {currentWeek} Quiz (Day {currentDay})
                </p>
              </div>
              <div className="p-4 text-sm text-gray-800 space-y-3">
                {quizSubmitted ? (
                  <div>
                    <p className="text-green-600 font-semibold">Quiz Submitted!</p>
                    <p>Your answers:</p>
                    <ul className="list-disc list-inside">
                      {Object.entries(quizAnswers).map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold">
                        How many cigarettes did you smoke this week?
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
                        What was your biggest trigger this week?
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
                    <button
                      onClick={handleQuizSubmit}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                      Submit Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase Duration */}
          <Card
            title="Phase Duration"
            subtitle="In Progress"
            value={`${phase.days} days`}
          />

          {/* Money Saved */}
          <Card
            title="Money Saved"
            subtitle="Savings"
            value={`${calculateSavedMoney().toLocaleString()} VND`}
          />

          {/* Health Improvement */}
          <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-blue-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Health Improvement</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Recovering</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all"
                  style={{ width: `${calculateHealthImprovement()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {calculateHealthImprovement().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <p className="text-gray-900 text-xl font-semibold">{value}\</p>
    </div>
  </div>
);