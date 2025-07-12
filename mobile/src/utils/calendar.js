import { addDays, parse, parseISO, format } from "date-fns";

export const buildCalendar = (plan) => {
  const planWeeks = plan.planWeeks || [];
  const raw = plan.startDate;

  if (!raw) return [];

  const startDate =
    raw.includes("-") && raw.indexOf("-") === 2
      ? parse(raw, "dd-MM-yyyy", new Date())
      : parseISO(raw);

  let dayIndex = 0;

  return planWeeks.map((week, wIdx) =>
    week.days.map((day, dIdx) => {
      const date = format(addDays(startDate, dayIndex), "yyyy-MM-dd");
      const result = {
        ...day,
        dayNumber: dayIndex + 1,
        date,
      };

      dayIndex++;
      return result;
    })
  );
};

export const mapPhases = (planPhases = []) =>
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
