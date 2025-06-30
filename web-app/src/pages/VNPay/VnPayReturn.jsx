// src/pages/VnPayReturn.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../config/api";
import { toast } from "react-toastify";

const VnPayReturn = () => {
  const navigate = useNavigate();
  const location = useLocation(); // để lấy query string

  useEffect(() => {
    const fetchPaymentResult = async () => {
      try {
        const query = location.search; // lấy toàn bộ ?vnp_Amount=...&vnp_TxnRef=...
        const res = await axios.get(`/public/payment/vnpay-return${query}`);

        if (res.data.status === "success") {
          toast.success("Thanh toán thành công!");
        } else {
          toast.warn("Thanh toán không thành công hoặc bị hủy.");
        }

        // Chuyển về trang chủ sau 3s
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        console.error("Lỗi khi gọi API kết quả thanh toán:", error);
        toast.error("Lỗi xử lý kết quả thanh toán.");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    fetchPaymentResult();
  }, [location.search, navigate]);

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h2 className="text-xl font-bold text-green-600">Đang xác thực thanh toán...</h2>
      <p>Vui lòng đợi trong giây lát, bạn sẽ được chuyển về trang chủ.</p>
    </div>
  );
};

export default VnPayReturn;
