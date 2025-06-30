import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

const AppointmentModal = ({ open, onClose }) => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const memberId = localStorage.getItem("userId");

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios
        .get("/user/get-all-coaches")
        .then((res) => {
          const activeCoaches = (res.data?.coaches || []).filter(
            (coach) => coach.status === "ACTIVE"
          );
          setCoaches(activeCoaches);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách coach:", err);
          toast.error("Không thể tải danh sách coach.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Chuyển Date thành chuỗi định dạng datetime-local đúng múi giờ VN
  const toLocalDateTimeInputValue = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const handleStartTimeChange = (e) => {
    const selectedStart = e.target.value;
    setStartTime(selectedStart);

    if (selectedStart) {
      const startDate = new Date(selectedStart);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 giờ
      setEndTime(toLocalDateTimeInputValue(endDate));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCoach || !startTime || !endTime) {
      toast.warning("Vui lòng chọn coach và thời gian bắt đầu.");
      return;
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const now = new Date();

    if (startDateTime <= now) {
      toast.warning("Vui lòng chọn thời gian bắt đầu trong tương lai.");
      return;
    }

    const durationMinutes = (endDateTime - startDateTime) / 60000;
    if (durationMinutes !== 60) {
      toast.warning("Thời gian tư vấn phải đúng 1 giờ.");
      return;
    }

    const formattedStart = format(startDateTime, "dd-MM-yyyy HH:mm:ss");
    const formattedEnd = format(endDateTime, "dd-MM-yyyy HH:mm:ss");

    const payload = {
      consultationDate: formattedStart,
      startDate: formattedStart,
      endDate: formattedEnd,
      notes: notes.trim() || "Tư vấn sức khỏe tâm lý",
    };

    setSubmitting(true);
    try {
      await axios.post(
        `/user/create-consultation/coach/${selectedCoach}/member/${memberId}`,
        payload
      );
      toast.success("Đặt lịch hẹn thành công!");
      setSelectedCoach("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Lỗi đặt lịch hẹn:", error);
      toast.error("Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCoach("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    onClose();
  };

  const getDuration = () => {
    if (startTime && endTime) return "1 giờ (tự động)";
    return "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className=" rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-t-3xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🏥 Đặt lịch hẹn
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                Tư vấn với chuyên gia của chúng tôi
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white space-y-6">
          {/* Coach selector */}
          <div>
            <label className="block mb-3 text-sm font-bold text-gray-700">
              👨‍⚕️ Chọn Coach <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border-2 rounded-xl px-4 py-4 font-medium"
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
            >
              <option value="">-- Chọn coach phù hợp --</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} {coach.expertise && `(${coach.expertise})`}
                </option>
              ))}
            </select>
            {coaches.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                ⚠️ Hiện tại không có coach nào khả dụng
              </div>
            )}
          </div>

          {/* Time selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-3 text-sm font-bold text-gray-700">
                🕐 Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full border-2 rounded-xl px-4 py-4"
                value={startTime}
                onChange={handleStartTimeChange}
                min={toLocalDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000))}
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-bold text-gray-700">
                🕐 Giờ kết thúc (tự động)
              </label>
              <input
                type="datetime-local"
                className="w-full border-2 rounded-xl px-4 py-4 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={endTime}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* Thời gian tư vấn */}
          {startTime && endTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              ⏱️ Tư vấn từ{" "}
              <strong>{format(new Date(startTime), "hh:mm a dd/MM/yyyy")}</strong> đến{" "}
              <strong>{format(new Date(endTime), "hh:mm a dd/MM/yyyy")}</strong> – {getDuration()}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block mb-3 text-sm font-bold text-gray-700">📝 Ghi chú (tuỳ chọn)</label>
            <textarea
              className="w-full border-2 rounded-xl px-4 py-3 resize-none"
              rows={3}
              placeholder="Ví dụ: Tư vấn tâm lý, dinh dưỡng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-3xl p-6 flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-xl font-bold"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCoach || !startTime}
            className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold"
          >
            {submitting ? "Đang xử lý..." : "📅 Xác nhận lịch hẹn"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
