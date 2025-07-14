import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../config/api";
import { toast } from "react-toastify";
import { addHours, format, startOfWeek } from "date-fns";

/* ------------------------------------------------------------------ Helpers ------------------------------------------------------------------*/
const WEEK_DAYS = 7;
const DISPLAY_LOCALE = "en-US";

const buildWeekDays = (anchor) =>
  Array.from({ length: WEEK_DAYS }, (_, i) => {
    const d = addHours(anchor, i * 24);
    return {
      label: d.toLocaleDateString(DISPLAY_LOCALE, { weekday: "long" }),
      short: d.toLocaleDateString(DISPLAY_LOCALE, { day: "2-digit", month: "2-digit" }),
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
  const raw = slot.split("-")[0];           
  const hour = parseInt(raw.replace(/AM|PM/, ""), 10);
  return raw.includes("PM") && hour < 12 ? hour + 12 : hour;
};

/* ------------------------------------------------------------------ Component ------------------------------------------------------------------*/
const AppointmentCalendar = ({ open, onClose }) => {
  /* ------------------------------ state -----------------------------*/
  const memberId = String(localStorage.getItem("userId") || "");
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hai tập consultations: của coach và của chính member
  const [coachConsultations, setCoachConsultations] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);

  const weekAnchor  = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays    = useMemo(() => buildWeekDays(weekAnchor), [weekAnchor]);

  /* ----------------------------- effects ----------------------------*/
  /* 1. Danh sách coach */
  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-all-coaches");
      setCoaches((data.coaches || []).filter((c) => c.status === "ACTIVE"));
    } catch {
      toast.error("Unable to load coach list");
    } finally {
      setLoading(false);
    }
  }, []);

  /* 2. Lịch hẹn của coach */
  const fetchCoachCons = useCallback(
    async (coachId) => {
      if (!coachId) return;
      try {
        const { data } = await axios.get(`/api/user/get-consultations-by-coach/${coachId}`);
        const list = Array.isArray(data?.consultations) ? data.consultations : Array.isArray(data) ? data : [];
        setCoachConsultations(list);
      } catch {
        setCoachConsultations([]);
      }
    },
    []
  );

  /* 3. Lịch hẹn của chính member */
  const fetchMyCons = useCallback(async () => {
    if (!memberId) return;
    try {
      const { data } = await axios.get(`/api/user/get-consultations-by-member/${memberId}`);
      const list = Array.isArray(data?.consultations) ? data.consultations : Array.isArray(data) ? data : [];
      setMyConsultations(list);
    } catch {
      setMyConsultations([]);
    }
  }, [memberId]);

  /* 4. Tổng hợp gọi khi mở modal */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    fetchCoaches();
    fetchMyCons();
    if (selectedCoach) fetchCoachCons(selectedCoach);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, fetchCoaches, fetchMyCons, fetchCoachCons, selectedCoach]);

  /* --------------------------- utils -------------------------------*/
  /** Tìm consultation ở slot ; return object nếu có */
  const findConsultation = (dateObj, slot) => {
    const dayKey  = format(dateObj, "dd-MM-yyyy");
    const hourKey = String(getStartHour24(slot)).padStart(2, "0") + ":00:00";

    return coachConsultations.find(
      (c) =>
        c.status === "ACTIVE" &&
        c.consultationDate?.startsWith(dayKey) &&
        c.consultationDate?.includes(hourKey)
    );
  };

  /** Kiểm tra consultation này có phải của chính member hay không */
  const isMine = (cons) => cons && cons.member?.id?.toString() === memberId;

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
      startDate:        format(start, "dd-MM-yyyy HH:mm:ss"),
      endDate:          format(addHours(start, 1), "dd-MM-yyyy HH:mm:ss"),
      notes: notes.trim() || "Mental health consultation",
    };

    try {
      setSubmitting(true);
      await axios.post(`/api/user/create-consultation/coach/${selectedCoach}/member/${memberId}`, payload);
      toast.success("Appointment booked successfully!");
      setSelectedSlot(null);
      setNotes("");
      // Reload 
      await Promise.all([fetchCoachCons(selectedCoach), fetchMyCons()]);
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------- render -----------------------------*/
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rounded-2xl w-full max-w-5xl shadow-2xl border border-white/10 bg-white/95 flex flex-col max-h-[90vh]">
        {/* ---------------- Header ---------------- */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-t-2xl p-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            🏥 Book Appointment
          </h2>
          <button onClick={onClose} className="text-white text-3xl">×</button>
        </header>

        {/* ---------------- Body ---------------- */}
        <section className="p-8 overflow-y-auto flex-1 space-y-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          {/* --- Coach select --- */}
          <div>
            <label className="block text-lg font-semibold mb-2">👨‍⚕️ Select Coach <span className="text-red-500">*</span></label>
            <select
              value={selectedCoach}
              onChange={(e) => {
                setSelectedCoach(e.target.value);
                setSelectedSlot(null);   
                fetchCoachCons(e.target.value);
              }}
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-3 text-lg"
            >
              <option value="">-- Select a suitable coach --</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.expertise && ` (${c.expertise})`}
                </option>
              ))}
            </select>
          </div>

          {/* --- Calendar grid --- */}
          <div className="bg-white/80 p-6 rounded-2xl border">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4" />
                    {weekDays.map((d) => (
                      <th key={d.short} className="p-4 text-center font-semibold">
                        <div>{d.label}</div>
                        <div className="text-xs text-gray-500">{d.short}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOT_LABELS.map((slot) => (
                    <tr key={slot}>
                      <td className="p-3 bg-emerald-50 font-semibold text-center">{slot}</td>
                      {weekDays.map(({ date }) => {
                        const cons      = findConsultation(date, slot);
                        const booked    = Boolean(cons);
                        const mine      = isMine(cons);
                        const isToday   = date.toDateString() === new Date().toDateString();
                        const isChosen  =
                          selectedSlot &&
                          selectedSlot.time === slot &&
                          selectedSlot.date.toDateString() === date.toDateString();

                        return (
                          <td
                            key={date + slot}
                            className={`p-3 text-center cursor-pointer transition ${
                              isToday ? "bg-blue-50" : ""
                            } ${isChosen ? "bg-emerald-100" : ""} ${
                              booked ? "bg-red-50 cursor-not-allowed" : "hover:bg-emerald-50"
                            }`}
                            onClick={() => {
                              if (!booked) setSelectedSlot({ time: slot, date });
                            }}
                          >
                            {booked ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-red-600 font-semibold text-sm">Booked</span>
                                {/* Chỉ show link nếu là lịch của chính user */}
                                {mine && (
                                  <a
                                    href={cons.googleMeetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-xs hover:text-blue-800"
                                  >
                                    🔗 Meet Link
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className={isChosen ? "text-emerald-700 font-medium" : ""}>
                                {isChosen ? "✓ Selected" : "Available"}
                              </span>
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

          {/* --- Notes --- */}
          <div>
            <label className="block text-lg font-semibold mb-2">📝 Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-3"
              placeholder="E.g., mental health consultation, nutrition..."
            />
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="p-6 bg-gray-50 rounded-b-2xl flex gap-4">
          <button onClick={onClose} className="flex-1 border px-6 py-3 rounded-lg">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedCoach || !selectedSlot}
            className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Confirm Appointment"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AppointmentCalendar;