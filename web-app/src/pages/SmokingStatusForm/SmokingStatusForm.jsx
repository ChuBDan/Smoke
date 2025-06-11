const SmokingStatusForm = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" style={{ borderTop: '4px solid #4A90E2' }}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: '#4A90E2' }}>Ghi Nhận Tình Trạng Hút Thuốc Hiện Tại</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="cigarettesPerDay">
              Số Lượng Điếu Thuốc Mỗi Ngày
            </label>
            <input
              type="number"
              id="cigarettesPerDay"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-#4A90E2"
              placeholder="Nhập số điếu (ví dụ: 10)"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="frequency">
              Tần Suất Hút (lần/ngày)
            </label>
            <input
              type="number"
              id="frequency"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-#4A90E2"
              placeholder="Nhập tần suất (ví dụ: 5)"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="costPerPack">
              Giá Tiền Thuốc Hút (VND)
            </label>
            <input
              type="number"
              id="costPerPack"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-#4A90E2"
              placeholder="Nhập giá tiền (ví dụ: 30000)"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-#4A90E2 text-white p-2 rounded-md hover:bg-#357ABD transition duration-200"
            style={{ backgroundColor: '#4A90E2' }}
          >
            Ghi Nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmokingStatusForm;