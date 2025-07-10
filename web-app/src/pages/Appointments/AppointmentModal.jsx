import { useEffect, useState } from "react";
import axios from "../../config/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

// Định nghĩa getCurrentWeek bên ngoài component để tránh vấn đề khởi tạo
const getCurrentWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
};

const AppointmentCalendar = ({ open, onClose }) => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const memberId = localStorage.getItem("userId");
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

  useEffect(() => {
    if (open) {
      // Ngăn cuộn trang nền khi modal mở
      document.body.style.overflow = "hidden";
      setLoading(true);
      axios
        .get("/api/user/get-all-coaches")
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
    } else {
      // Khôi phục cuộn trang nền khi modal đóng
      document.body.style.overflow = "auto";
    }
    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      days.push({
        day: date.toLocaleDateString("vi-VN", { weekday: "long" }),
        date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        fullDate: date,
      });
    }
    return days;
  };

  const timeSlots = [
    "06AM-07AM", "07AM-08AM", "08AM-09AM", "09AM-10AM",
    "10AM-11AM", "11AM-12PM"
  ];

  const handleSlotClick = (time, day) => {
    setSelectedSlot({ time, day: day.fullDate });
  };

  const handleSubmit = async () => {
    if (!selectedCoach || !selectedSlot) {
      toast.warning("Vui lòng chọn coach và thời gian.");
      return;
    }

    const startDateTime = new Date(selectedSlot.day);
    const [startHour] = selectedSlot.time.split("-")[0].replace("AM", "").replace("PM", "").split("AM")[0].split(":");
    startDateTime.setHours(parseInt(startHour) + (selectedSlot.time.includes("PM") ? 12 : 0), 0, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    if (startDateTime <= new Date()) {
      toast.warning("Vui lòng chọn thời gian bắt đầu trong tương lai.");
      return;
    }

    const payload = {
      consultationDate: format(startDateTime, "dd-MM-yyyy HH:mm:ss"),
      startDate: format(startDateTime, "dd-MM-yyyy HH:mm:ss"),
      endDate: format(endDateTime, "dd-MM-yyyy HH:mm:ss"),
      notes: notes.trim() || "Tư vấn sức khỏe tâm lý",
    };

    setSubmitting(true);
    try {
      await axios.post(
        `/api/user/create-consultation/coach/${selectedCoach}/member/${memberId}`,
        payload
      );
      toast.success("Đặt lịch hẹn thành công!");
      setSelectedSlot(null);
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
    setSelectedSlot(null);
    setNotes("");
    onClose();
  };

  // Xử lý nhấp ra ngoài để đóng modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100">
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
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white space-y-6 max-h-[70vh] overflow-y-auto">
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
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Lịch hẹn</h3>
              <div className="flex space-x-2">
                <span className="text-green-500">Lịch trống</span>
                <span className="text-red-500">Đã đặt lịch</span>
                <span className="text-blue-500">Hôm nay</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2"></th>
                    {getWeekDays().map((day, index) => (
                      <th key={index} className="border p-2 text-center">
                        {day.day}<br/>{day.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border p-2 bg-green-100">{time}</td>
                      {getWeekDays().map((day, colIndex) => {
                        const isToday = day.fullDate.toDateString() === new Date().toDateString();
                        const isSelected = selectedSlot && selectedSlot.time === time && selectedSlot.day.toDateString() === day.fullDate.toDateString();
                        return (
                          <td
                            key={colIndex}
                            className={`border p-2 text-center cursor-pointer ${isToday ? 'bg-blue-100' : 'bg-green-50'} ${isSelected ? 'bg-green-200' : ''}`}
                            onClick={() => handleSlotClick(time, day)}
                          >
                            {isSelected ? "Đã chọn" : "Trống"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Thêm phần Ghi chú (tùy chọn) */}
          <div>
            <label className="block mb-3 text-sm font-bold text-gray-700">
              📝 Ghi chú (tùy chọn)
            </label>
            <textarea
              className="w-full border-2 rounded-xl px-4 py-3 resize-none"
              rows={3}
              placeholder="Ví dụ: Tư vấn tâm lý, dinh dưỡng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-b-3xl p-6 flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-xl font-bold"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCoach || !selectedSlot}
            className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold"
          >
            {submitting ? "Đang xử lý..." : "📅 Xác nhận lịch hẹn"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;