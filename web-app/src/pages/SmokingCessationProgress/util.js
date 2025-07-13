import { addDays, parse, parseISO, format } from "date-fns";

export const buildCalendar = (plan) => {
  const planWeeks = plan.planWeeks || [];
  const raw = plan.startDate;
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
