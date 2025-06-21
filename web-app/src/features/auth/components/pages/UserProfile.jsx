import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    password: "", 
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    role: "MEMBER",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
  console.log("userId:", userId);
  console.log("token:", token);
}, []);

  // 🚫 Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!userId || !token) {
      navigate("/signup");
    }
  }, [userId, token, navigate]);

  // 🏅 Fake badge
  useEffect(() => {
    const mockBadges = [
      { id: 1, title: "1-Day Smoking Free", date: "11/06/2025", description: "Chúc mừng bạn!", icon: "🚭" },
      { id: 2, title: "100K Money Save", date: "12/06/2025", description: "Tiết kiệm 100K!", icon: "💰" },
      { id: 3, title: "1-Week Milestone", date: "18/06/2025", description: "Kiên trì 1 tuần!", icon: "🏆" },
    ];

    setTimeout(() => {
      setBadges(mockBadges);
      setLoading(false);
    }, 1000);
  }, []);

  // 📥 Lấy thông tin user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `https://deploy-smk.onrender.com/api/user/get-member-by-id/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const member = res.data.member;
        setUserData({
          fullName: member.fullName || "",
          username: member.username || "",
          password: "",
          email: member.email || "",
          phoneNumber: member.phoneNumber || "",
          gender: member.gender || "",
          dob: member.dob || "",
          role: member.role || "MEMBER",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const dataToSend = {
        fullName: userData.fullName,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        dob: userData.dob,
        role: userData.role,
      };

      console.log("Sending data:", dataToSend);

      const res = await axios.put(
        `https://deploy-smk.onrender.com/api/user/update-member-by-id/${userId}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data.member;
      setUserData((prev) => ({
        ...prev,
        ...updated,
      }));
      setIsEdit(false);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError("Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center h-screen">{error}</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl">👤</div>
          {isEdit ? (
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleInputChange}
              className="text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-black"
            />
          ) : (
            <h1 className="text-2xl font-bold">{userData.fullName}</h1>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">Thông tin liên hệ</h2>
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
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{userData.phoneNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">Thông tin cơ bản</h2>
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
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
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
          onClick={isEdit ? handleSaveChanges : () => setIsEdit(true)}
          className={`px-6 py-2 rounded-full ${
            isEdit
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } transition-colors`}
        >
          {isEdit ? "Lưu thông tin" : "Chỉnh sửa"}
        </button>
      </div>

      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Huy hiệu Thành tích</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
          </div>
        ) : badges.length > 0 ? (
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-4 pb-4">
              {badges.map((badge) => (
                <div key={badge.id} className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-800">
                  <div className="bg-gray-800 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl flex-shrink-0">
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
