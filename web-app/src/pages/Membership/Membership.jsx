import { useEffect, useState } from "react";
import axios from "../../config/api"; // ✅ axios instance đã cấu hình sẵn
import { toast } from "react-toastify";

const MembershipPage = () => {
  const [packages, setPackages] = useState([]);
  const memberId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get("/api/user/get-all-membership-packages")
      .then((res) => {
        const rawPackages = res.data.membership_Packages || [];
        const activePackages = rawPackages.filter(
          (pkg) => pkg.status === "ACTIVE"
        );
        setPackages(activePackages);
      })
      .catch((err) => console.error("Lỗi lấy gói thành viên:", err));
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
    <div
      className="pb-3 mt-12 font-medium text-zinc-800"
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: "60px 20px",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col gap-6 items-center">
        <div
          className="membership-container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            justifyContent: "center",
          }}
        >
          {/* FREE PLAN */}
          <div
            className="plan-card"
            style={{
              background: "#fff",
              color: "#333",
              borderRadius: "10px",
              width: "350px",
              padding: "40px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2 className="text-xl font-semibold text-blue-600">Miễn phí</h2>
            <p className="price text-4xl font-bold mt-2">
              $0 <span style={{ fontSize: "20px" }}>USD</span>
            </p>
            <p className="text-sm mt-2">
              Cùng khám phá sức mạnh của AI trong các công việc hàng ngày cuộc
              sống
            </p>
            <button
              style={{
                backgroundColor: "#d1d5db",
                color: "#333",
                padding: "12px 25px",
                borderRadius: "6px",
                border: "none",
                cursor: "not-allowed",
                marginTop: "20px",
                width: "100%",
              }}
              disabled
            >
              Đã chọn tài khoản
            </button>
            <ul className="mt-4 text-sm">
              <li className="mb-2">
                ✔ Truy cập GPT-4o mini với tính năng suy luận
              </li>
              <li className="mb-2">✔ Chế độ thoại tiếng chuông</li>
              <li className="mb-2">
                ✔ Dữ liệu được lưu trữ trên web qua tính năng thời kiêm
              </li>
              <li className="mb-2">✔ Truy cập giới hạn GPT-4o với 0-4 mini</li>
              <li className="mb-2">
                ✔ Hỗ trợ quyên góp với các tính năng thông tin, phần tích dữ
                liệu nâng cao với toán học
              </li>
              <li className="mb-2">✔ Sử dụng GPT tư vấn</li>
            </ul>
          </div>

          {/* VIP / PREMIUM PLANS từ API */}
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="plan-card"
              style={{
                background: "#fff",
                color: "#333",
                borderRadius: "10px",
                width: "350px",
                padding: "40px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <h2 className="text-xl font-semibold text-blue-600 relative">
                {pkg.packageName}
                <span
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    background: "#28a745",
                    color: "#fff",
                    padding: "5px 10px",
                    fontSize: "12px",
                    borderRadius: "5px",
                  }}
                >
                  PREMIUM
                </span>
              </h2>
              <p className="price text-4xl font-bold mt-2">
                ${pkg.price} <span style={{ fontSize: "20px" }}>VND</span>
              </p>
              <p
                className="text-sm mt-2"
                style={{
                  maxHeight: "60px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {pkg.description}
              </p>
              <button
                style={{
                  backgroundColor: "#28a745",
                  color: "#fff",
                  padding: "12px 25px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "20px",
                  width: "100%",
                }}
                onClick={() => handleBuyPackage(pkg.id)}
              >
                Chuyển sang {pkg.packageName}
              </button>
              <ul className="mt-4 text-sm">
                <li className="mb-2">✔ Truy cập không giới hạn với GPT</li>
                <li className="mb-2">✔ Ưu tiên hỗ trợ</li>
                <li className="mb-2">✔ Quyền truy cập bản xem trước</li>
                <li className="mb-2">✔ Truy cập dữ liệu AI nâng cao</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
