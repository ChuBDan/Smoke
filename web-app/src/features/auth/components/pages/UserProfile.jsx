import React, { useState, useEffect, useRef } from "react";

const MyProfile = () => {
  // State cho dữ liệu người dùng
  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    email: "richardjameswap@gmail.com",
    phone: "+1 123 456 7890",
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London",
    },
    gender: "Male",
    dob: "2000-01-20",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data cho huy hiệu
  useEffect(() => {
    const mockBadges = [
      {
        id: 1,
        title: "1-Day Smoking Free",
        date: "11/06/2025",
        description: "Chúc mừng bạn đã không hút thuốc 1 ngày!",
        icon: "🚭",
      },
      {
        id: 2,
        title: "100K Money Save",
        date: "12/06/2025",
        description: "Bạn đã tiết kiệm 100K nhờ cai thuốc!",
        icon: "💰",
      },
      {
        id: 3,
        title: "1-Week Milestone",
        date: "18/06/2025",
        description: "Tuyệt vời! Bạn đã kiên trì 1 tuần!",
        icon: "🏆",
      },
      {
        id: 4,
        title: "Health Improvement",
        date: "25/06/2025",
        description: "Sức khỏe của bạn đã cải thiện đáng kể!",
        icon: "❤️",
      },
      {
        id: 5,
        title: "1-Month Achievement",
        date: "20/07/2025",
        description: "Xuất sắc! 1 tháng không thuốc lá!",
        icon: "🎯",
      },
      {
    id: 6,
    title: "2-Month Champion",
    date: "20/08/2025",
    description: "Bạn là nhà vô địch kiên trì!",
    icon: "🏅"
  }
    ];

    // Giả lập load API
    setTimeout(() => {
      setBadges(mockBadges);
      setLoading(false);
    }, 1000);
  }, []);

  // Hàm xử lý thay đổi thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý thay đổi địa chỉ
  const handleAddressChange = (e, line) => {
    const { value } = e.target;
    setUserData((prev) => ({
      ...prev,
      address: { ...prev.address, [line]: value },
    }));
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
      {/* Cột thông tin cá nhân */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
            👤
          </div>
          {isEdit ? (
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              className="text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-black"
            />
          ) : (
            <h1 className="text-2xl font-bold">{userData.name}</h1>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">
            Contact Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-600 block">Email:</label>
              {isEdit ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{userData.email}</p>
              )}
            </div>
            <div>
              <label className="text-gray-600 block">Phone:</label>
              {isEdit ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{userData.phone}</p>
              )}
            </div>
            <div>
              <label className="text-gray-600 block">Address:</label>
              {isEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={userData.address.line1}
                    onChange={(e) => handleAddressChange(e, "line1")}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={userData.address.line2}
                    onChange={(e) => handleAddressChange(e, "line2")}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ) : (
                <p>
                  {userData.address.line1}
                  <br />
                  {userData.address.line2}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-600 block">Gender:</label>
              {isEdit ? (
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p>{userData.gender}</p>
              )}
            </div>
            <div>
              <label className="text-gray-600 block">Birthday:</label>
              {isEdit ? (
                <input
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{userData.dob}</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEdit(!isEdit)}
          className={`px-6 py-2 rounded-full ${
            isEdit
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } transition-colors`}
        >
          {isEdit ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Cột huy hiệu thành tích */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">
    Huy hiệu Thành tích
  </h2>

  {loading ? (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
    </div>
  ) : badges.length > 0 ? (
    <div className="h-[calc(100vh-200px)] overflow-y-auto"> {/* Điều chỉnh 200px theo header của bạn */}
  <div className="space-y-4 pb-4"> {/* Thêm padding-bottom */}
    {badges.map((badge) => (
      <div 
        key={badge.id}
        className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-800"
      >
            <div className="
              bg-gray-800 
              text-white 
              w-10 h-10
              flex items-center justify-center
              rounded-full 
              text-xl
              flex-shrink-0
            ">
              {badge.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{badge.title}</h3>
              <p className="text-sm text-gray-600">Đạt ngày: {badge.date}</p>
              <p className="mt-1 text-gray-700">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-center py-8">Chưa có huy hiệu nào</p>
  )}
</div>
    </div>
  );
};

export default MyProfile;