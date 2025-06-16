import React, { useState } from "react";

export default function SmokingcessationProgress() {
  const [startDate] = useState(new Date("2025-06-01"));
  const [cigsPerDay] = useState(10);
  const [costPerCig] = useState(2000); // VND
  const [currentView, setCurrentView] = useState("daily");

  const getTotalDays = () => {
    const now = new Date();
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  };

  const getDaysByView = () => {
    const totalDays = getTotalDays();
    if (currentView === "daily") return 1;
    if (currentView === "weekly") return Math.min(totalDays, 7);
    if (currentView === "monthly") return Math.min(totalDays, 30);
    return totalDays;
  };

  const calculateSavedMoney = () => {
    return getDaysByView() * cigsPerDay * costPerCig;
  };

  const calculateHealthImprovement = () => {
    const days = getDaysByView();
    return Math.min((days / 30) * 100, 100); // giả sử hồi phục 100% sau 30 ngày
  };

  return (
    <div className="px-4 py-6">
      <p className="text-gray-600 text-lg mb-4">Theo dõi tiến trình cai thuốc của bạn</p>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Bộ lọc chế độ */}
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          {["daily", "weekly", "monthly"].map((type) => (
            <p
              key={type}
              onClick={() => setCurrentView(type)}
              className={`w-[94vw] sm:w-auto pl-4 pr-16 py-2 border border-gray-300 rounded cursor-pointer whitespace-nowrap transition-all ${
                currentView === type ? "bg-indigo-100 text-black font-medium" : ""
              }`}
            >
              {type === "daily" && "Hàng Ngày"}
              {type === "weekly" && "Hàng Tuần"}
              {type === "monthly" && "Hàng Tháng"}
            </p>
          ))}
        </div>

        {/* Nội dung */}
        <div className="w-full grid md:grid-cols-2 gap-6">
          {/* Số ngày không hút */}
          <Card
            title={`Số Ngày Không Hút (${{
              daily: "Hôm Nay",
              weekly: "7 Ngày",
              monthly: "30 Ngày",
            }[currentView]})`}
            subtitle="Đang tiến hành"
            value={`${getDaysByView()} ngày`}
          />

          {/* Tiền tiết kiệm */}
          <Card
            title="Số Tiền Tiết Kiệm"
            subtitle="Tiết kiệm"
            value={`${calculateSavedMoney().toLocaleString()} VND`}
          />

          {/* Cải thiện sức khỏe */}
          <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <div className="bg-blue-50 p-4">
              <p className="text-gray-900 text-lg font-medium">Cải Thiện Sức Khỏe</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Đang hồi phục</span>
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

          {/* Tổng số ngày không hút - chỉ hiển thị khi là "monthly" */}
          {currentView === "monthly" && (
            <Card
              title="Tổng Số Ngày Không Hút"
              subtitle="Kể từ khi bắt đầu"
              value={`${getTotalDays()} ngày`}
            />
          )}
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
      <p className="text-gray-900 text-xl font-semibold">{value}</p>
    </div>
  </div>
);
