import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../config/api";
import { toast } from "react-toastify";

const VnPayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentResult = async () => {
      try {
        setIsLoading(true);
        const query = location.search;
        console.log("Query string gửi đi:", query);
        const res = await axios.get(`/api/public/payment/vnpay-return${query}`);
        console.log("Kết quả API trả về:", res.data);

        const successStatuses = [
          "success",
          "SUCCESS",
          "completed",
          "COMPLETED",
        ];
        const isSuccess = successStatuses.includes(res.data.status);
        const statusText = isSuccess
          ? "Thành công"
          : "Không thành công hoặc bị hủy";

        if (isSuccess) {
          toast.success("Thanh toán thành công!");
        } else {
          toast.warn("Thanh toán không thành công hoặc bị hủy.");
        }

        // Lưu thông tin để hiển thị
        const urlParams = new URLSearchParams(query);
        const info = {
          mãGiaoDịch: urlParams.get("vnp_TxnRef"),
          mãNgânHàng: urlParams.get("vnp_BankCode"),
          sốTiền: Number(urlParams.get("vnp_Amount")) / 100,
          thờiGian: urlParams.get("vnp_PayDate"),
          trạngThái: statusText,
          isSuccess: isSuccess,
        };

        setPaymentInfo(info);
      } catch (error) {
        console.error("Lỗi khi gọi API kết quả thanh toán:", error);
        toast.error("Lỗi xử lý kết quả thanh toán.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentResult();
  }, [location.search]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    // Assuming format: yyyyMMddHHmmss
    const year = dateTime.substr(0, 4);
    const month = dateTime.substr(4, 2);
    const day = dateTime.substr(6, 2);
    const hour = dateTime.substr(8, 2);
    const minute = dateTime.substr(10, 2);
    const second = dateTime.substr(12, 2);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Đang xử lý kết quả thanh toán...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              paymentInfo?.isSuccess
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {paymentInfo?.isSuccess ? (
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${
              paymentInfo?.isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {paymentInfo?.isSuccess
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại"}
          </h1>

          <p className="text-gray-600 text-lg">
            {paymentInfo?.isSuccess
              ? "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi."
              : "Giao dịch không thể hoàn tất. Vui lòng thử lại sau."}
          </p>
        </div>

        {/* Payment Details Card */}
        {paymentInfo && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Chi tiết giao dịch
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Mã giao dịch:
                  </span>
                  <span className="text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded">
                    {paymentInfo.mãGiaoDịch || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Ngân hàng:</span>
                  <span className="text-gray-900 font-semibold">
                    {paymentInfo.mãNgânHàng || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Số tiền:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {paymentInfo.sốTiền.toLocaleString()} VND
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Thời gian:</span>
                  <span className="text-gray-900">
                    {formatDateTime(paymentInfo.thờiGian)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Trạng thái:</span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      paymentInfo.isSuccess
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {paymentInfo.trạngThái}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Về trang chủ
          </button>

          {paymentInfo?.isSuccess && (
            <button
              onClick={() => window.print()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              In hóa đơn
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Nếu bạn có thắc mắc về giao dịch này, vui lòng liên hệ với chúng tôi
            qua email hoặc hotline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VnPayReturn;
