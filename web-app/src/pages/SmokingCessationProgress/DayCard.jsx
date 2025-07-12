import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { parse, format } from "date-fns";

const DayCard = ({ day, allProgresses = [], onSubmit }) => {
  const [daysSmokeFree, setDaysSmokeFree] = useState("");
  const [healthImprovement, setHealthImprovement] = useState("GOOD");

  // Ngày hiện tại
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");
  const formattedDay = day.date;

  // Tìm tiến trình của ngày này (nếu có)
  const dayProgress = allProgresses.find((p) => {
    const progressDate = format(
      parse(p.dateCreated, "dd-MM-yyyy", new Date()),
      "yyyy-MM-dd"
    );
    return progressDate === formattedDay;
  });

  const isToday = formattedDay === formattedToday;
  const isPastDay = new Date(formattedDay) < new Date(formattedToday);
const isCompleted = !!dayProgress;

  const getStatus = () => {
    if (isCompleted) return "completed";
    if (isPastDay) return "missed";
    if (isToday) return "today";
    return "pending";
  };

  const status = getStatus();

  const statusConfig = {
    completed: {
      bgClass: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      headerClass: "bg-green-100 text-green-800",
      badgeClass: "bg-green-500",
      icon: <CheckCircleIcon className="w-5 h-5 text-white" />,
      actionClass: "bg-green-50 text-green-600",
      actionIcon: <CheckCircleIcon className="w-5 h-5" />,
      actionText: "Completed!",
    },
    today: {
      bgClass:
        "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 ring-2 ring-blue-200",
      headerClass: "bg-blue-100 text-blue-800",
      badgeClass: "bg-blue-500",
      icon: (
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      ),
    },
    missed: {
      bgClass: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200",
      headerClass: "bg-red-100 text-red-800",
      badgeClass: "bg-red-500",
      icon: <XCircleIcon className="w-5 h-5 text-white" />,
      actionClass: "bg-red-50 text-red-600",
      actionIcon: <XCircleIcon className="w-5 h-5" />,
      actionText: "Missed",
    },
    pending: {
      bgClass: "bg-white border-gray-200 hover:border-gray-300",
      headerClass: "bg-gray-100 text-gray-700",
      badgeClass: "bg-gray-300",
      icon: <Clock className="w-5 h-5 text-white" />,
      actionClass: "bg-gray-50 text-gray-400",
      actionIcon: <Clock className="w-5 h-5" />,
      actionText: "Pending",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={clsx(
        "relative border-2 rounded-xl p-4 flex flex-col transition-all duration-300 hover:shadow-lg h-full",
        config.bgClass
      )}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={clsx(
            "flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-semibold",
            config.headerClass
          )}
        >
          <Calendar className="w-3 h-3" />
          <span>Day {day.dayNumber}</span>
        </div>

        {/* Status Badge */}
        <div
          className={clsx(
            "w-7 h-7 rounded-full flex items-center justify-center",
            config.badgeClass
          )}
        >
          {config.icon}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3 flex-grow">
        <div className="flex items-start space-x-2">
          <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-0.5">
              Goal
            </p>
            <p className="text-xs text-gray-900 leading-tight line-clamp-2">
              {day.goal || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <CheckCircleIcon className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-0.5">
              Task
            </p>
            <p className="text-xs text-gray-900 leading-tight line-clamp-2">
              {day.task || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Lightbulb className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-0.5">
              Tip
            </p>
            <p className="text-xs text-gray-900 leading-tight line-clamp-2">
              {day.tip || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Form or Status */}
      <div className="mt-auto">
        {status === "today" && !isCompleted ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ daysSmokeFree, healthImprovement });
            }}
          >
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Number of cigarettes smoked today
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="Enter days"
                value={daysSmokeFree}
                onChange={(e) => setDaysSmokeFree(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Health Status
              </label>
              <select
                value={healthImprovement}
                onChange={(e) => setHealthImprovement(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GOOD">😊 Good</option>
                <option value="NORMAL">😐 Normal</option>
                <option value="BAD">😷 Bad</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md py-2 text-xs font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>Complete</span>
              </div>
            </button>
          </form>
        ) : (
          <div
            className={clsx(
              "flex items-center justify-center space-x-2 font-medium py-2 rounded-md",
              config.actionClass
            )}
          >
            {config.actionIcon}
            <span className="text-xs">{config.actionText}</span>
          </div>
        )}
      </div>

      {/* Today indicator */}
      {isToday && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
          TODAY
        </div>
      )}
    </div>
  );
};

export default DayCard;
