import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../config/api";
import { toast } from "react-toastify";
import { addHours, format, startOfWeek } from "date-fns";

/* ------------------------------------------------------------------
  Helpers
-------------------------------------------------------------------*/
const WEEK_DAYS = 7;
const DISPLAY_LOCALE = "en-US";

const buildWeekDays = (anchor) =>
  Array.from({ length: WEEK_DAYS }, (_, i) => {
    const d = addHours(anchor, i * 24);
    return {
      label: d.toLocaleDateString(DISPLAY_LOCALE, {
        weekday: "long",
      }),
      short: d.toLocaleDateString(DISPLAY_LOCALE, {
        day: "2-digit",
        month: "2-digit",
      }),
      date: d,
    };
  });

const SLOT_LABELS = [
  "08AM-09AM",
  "09AM-10AM",
  "10AM-11AM",
  "11AM-12PM",
  "01PM-02PM",
  "02PM-03PM",
  "03PM-04PM",
  "04PM-05PM",
];

const getStartHour24 = (slot) => {
  const raw = slot.split("-")[0]; // 08AM
  const hour = parseInt(raw.replace(/AM|PM/, ""), 10);
  return raw.includes("PM") && hour < 12 ? hour + 12 : hour;
};

/* ------------------------------------------------------------------
  Component
-------------------------------------------------------------------*/
const AppointmentCalendar = ({ open, onClose }) => {
  /* ------------------------------ state -----------------------------*/
  const memberId = String(localStorage.getItem("userId") || "");
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const weekAnchor = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(() => buildWeekDays(weekAnchor), [weekAnchor]);

  /* ----------------------------- effects ----------------------------*/
  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-all-coaches");
      setCoaches((data.coaches || []).filter((c) => c.status === "ACTIVE"));
    } catch (e) {
      toast.error("Unable to load coach list");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!memberId) return;
    try {
      const { data } = await axios.get(`/api/user/get-consultations-by-member/${memberId}`);
      const list = Array.isArray(data?.consultations) ? data.consultations : Array.isArray(data) ? data : [];
      setAppointments(list);
    } catch (e) {
      console.error(e);
      setAppointments([]);
    }
  }, [memberId]);

  useEffect(() => {
    if (!open) return;

    /* lock scroll */
    document.body.style.overflow = "hidden";
    fetchCoaches();
    fetchAppointments();

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, fetchCoaches, fetchAppointments]);

  /* --------------------------- utils -------------------------------*/
  const isSlotBooked = (dateObj, slot, coachId, memberId) => {
    const dayKey = format(dateObj, "dd-MM-yyyy");
    const hour24 = getStartHour24(slot);
    const hourKey = String(hour24).padStart(2, "0") + ":00:00";

    return appointments.find(
      (a) =>
        a.coach?.id?.toString() === coachId?.toString() &&
        a.member?.id?.toString() === memberId?.toString() &&
        a.status === "ACTIVE" &&
        a.consultationDate?.startsWith(dayKey) &&
        a.consultationDate?.includes(hourKey)
    );
  };

  /* ------------------------ event handlers -------------------------*/
  const handleConfirm = async () => {
    if (!selectedCoach || !selectedSlot) {
      toast.warning("Please select a coach and time slot");
      return;
    }

    const { date, time } = selectedSlot;
    const start = new Date(date);
    start.setHours(getStartHour24(time), 0, 0, 0);
    if (start <= new Date()) {
      toast.warning("Please select a future start time");
      return;
    }

    const payload = {
      consultationDate: format(start, "dd-MM-yyyy HH:mm:ss"),
      startDate: format(start, "dd-MM-yyyy HH:mm:ss"),
      endDate: format(addHours(start, 1), "dd-MM-yyyy HH:mm:ss"),
      notes: notes.trim() || "Mental health consultation",
    };

    try {
      setSubmitting(true);
      await axios.post(`/api/user/create-consultation/coach/${selectedCoach}/member/${memberId}`, payload);
      toast.success("Appointment booked successfully!");
      setSelectedSlot(null);
      setNotes("");
      await fetchAppointments(); // refresh grid
    } catch (e) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------- render -----------------------------*/
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" 
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl w-full max-w-5xl shadow-2xl border border-white/10 bg-white/95 backdrop-blur-lg flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-t-2xl p-8 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🏥</span>
              Book Appointment
            </h2>
            <p className="text-emerald-100 text-base mt-1">Consult with our experts</p>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-110"
          >
            ×
          </button>
        </header>

        {/* body */}
        <section className="p-8 overflow-y-auto flex-1 space-y-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          {/* coach select */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 items-center gap-2">
              <span className="text-2xl">👨‍⚕️</span>
              Select Coach 
              <span className="text-red-500 text-xl">*</span>
            </label>
            <div className="relative">
              <select 
                value={selectedCoach} 
                onChange={(e) => setSelectedCoach(e.target.value)} 
                className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-lg font-medium bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 hover:border-emerald-300 appearance-none cursor-pointer"
              >
                <option value="">-- Select a suitable coach --</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.expertise && ` (${c.expertise})`}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* calendar grid */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg">
            <div className="flex justify-between items-center mb-6 text-base font-medium">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-emerald-500 rounded-full"></span>
                <span className="text-emerald-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                <span className="text-red-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                <span className="text-blue-600">Today</span>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200/50">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="border-b border-gray-300 p-4 text-left font-semibold text-gray-700"></th>
                    {weekDays.map((d) => (
                      <th key={d.short} className="border-b border-gray-300 p-4 text-center font-semibold text-gray-700 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="text-sm">{d.label}</div>
                          <div className="text-xs text-gray-500">{d.short}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {SLOT_LABELS.map((slot, index) => (
                    <tr key={slot} className={index % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="border-b border-gray-200 p-4 bg-emerald-50/80 font-semibold text-emerald-800 text-center">
                        {slot}
                      </td>
                      {weekDays.map(({ date }) => {
                        const booked = isSlotBooked(date, slot, selectedCoach, memberId);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isChosen = selectedSlot && selectedSlot.time === slot && selectedSlot.date.toDateString() === date.toDateString();

                        return (
                          <td
                            key={date + slot}
                            className={`border-b border-gray-200 p-3 text-center cursor-pointer select-none transition-all duration-200 hover:scale-105 ${
                              isToday ? "bg-blue-50 border-blue-200" : "bg-white"
                            } ${
                              isChosen ? "bg-emerald-100 border-emerald-300 shadow-md" : ""
                            } ${
                              booked ? "bg-red-50 cursor-not-allowed" : "hover:bg-emerald-50"
                            }`}
                            onClick={() => {
                              if (!booked) setSelectedSlot({ time: slot, date });
                            }}
                          >
                            {booked ? (
                              <div className="space-y-2">
                                <div className="text-red-600 font-semibold text-sm">Booked</div>
                                {booked.googleMeetLink && (
                                  <a 
                                    href={booked.googleMeetLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-xs font-medium transition-colors"
                                  >
                                    <span>🔗</span>
                                    Meet Link
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className={`font-medium ${isChosen ? "text-emerald-700" : "text-gray-600"}`}>
                                {isChosen ? "✓ Selected" : "Available"}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* notes */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 items-center gap-2">
              <span className="text-2xl">📝</span>
              Notes (optional)
            </label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4} 
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-base resize-none bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 hover:border-emerald-300" 
              placeholder="E.g., mental health consultation, nutrition, health concerns..."
            />
          </div>
        </section>

       {/* footer */}
        <footer className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl p-8 flex gap-6 border-t border-gray-200/50">
          <button 
            onClick={onClose} 
            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedCoach || !selectedSlot}
            className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <span className="text-xl">📅</span>
                Confirm Appointment
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AppointmentCalendar;