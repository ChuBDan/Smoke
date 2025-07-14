import { useEffect, useState } from "react";
import axios from "../../config/api"; // ✅ axios instance đã cấu hình sẵn
import { toast } from "react-toastify";

const MembershipPage = () => {
  const [packages, setPackages] = useState([]);
  const memberId = localStorage.getItem("userId");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  axios
    .get("/api/user/get-all-membership-packages")
    .then((res) => {
      const rawPackages = res.data.membership_Packages || [];
      const activePackages = rawPackages.filter(pkg => pkg.status === "ACTIVE");
      setPackages(activePackages);
      setIsLoading(false); // Đã load xong
    })
    .catch((err) => {
      console.error("Lỗi lấy gói thành viên:", err);
      setIsLoading(false);
    });
}, []);

  const handleBuyPackage = async (packageId) => {
    try {
      const res = await axios.post(
        `/api/user/buy-membership-package/${packageId}/member/${memberId}`
      );
      const paymentUrl = res.data.token;

      if (paymentUrl) {
        window.location.href = paymentUrl; // chuyển hướng sang trang thanh toán
      } else {
        toast.error("Không lấy được URL thanh toán.");
      }
    } catch (error) {
      console.error("Lỗi mua gói:", error);
      toast.error("Mua gói thất bại. Vui lòng thử lại.");
    }
  };

  return (
  <div className="pb-10 pt-20 px-4 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">💎 Choose Your Membership Plan</h1>

    {isLoading ? (
      <div className="text-center text-gray-500">Loading membership plans...</div>
    ) : (
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">

        {/* GÓI FREE */}
        <div className="bg-white border rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Free Plan</h3>
          <div className="text-3xl font-bold text-center text-blue-500 mb-6">0₫</div>
          <ul className="space-y-3 text-gray-600 mb-8 text-sm">
            <li>✔ Track your daily cigarette count</li>
            <li>✔ View statistics for the past 7 days</li>
            <li>✔ Receive 5 sample tips per day</li>
            <li className="text-gray-400">✖ No expert support</li>
            <li className="text-gray-400">✖ Limited to 3 basic badges</li>
          </ul>
          <button
            className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            Currently Selected
          </button>
        </div>

        {/* GÓI VIP / PREMIUM */}
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`bg-white border-2 ${index === packages.length - 1 ? 'border-blue-500' : 'border-gray-300'} rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition`}
          >
            {index === packages.length - 1 && (
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">{pkg.packageName}</h3>
            <div className="text-3xl font-bold text-center text-blue-500 mb-6">
              {pkg.price.toLocaleString()}₫<span className="text-base text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 text-gray-600 mb-8 text-sm">
              {pkg.packageName.toLowerCase().includes("48") ? (
                <>
                  <li>✔ Includes all Free Plan features</li>
                  <li>✔ 14-day progress tracking</li>
                  <li>✔ Daily motivational messages & challenges</li>
                  <li>✔ Unlock up to 10 achievement badges</li>
                  <li className="text-gray-400">✖ No expert consultation</li>
                </>
              ) : (
                <>
                  <li>✔ Includes all Standard Plan features</li>
                  <li>✔ 1-on-1 consultation with a quit-smoking expert</li>
                  <li>✔ Personalized plans & daily tips</li>
                  <li>✔ Full badge system (20+ types)</li>
                  <li>✔ Weekly reports & 24/7 support community</li>
                </>
              )}
            </ul>
            <button
              onClick={() => handleBuyPackage(pkg.id)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Choose {pkg.packageName}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
export default MembershipPage;
