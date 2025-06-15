import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "@/redux/slices/authSlice"; // Giả sử bạn sẽ tạo action này

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", line2: "" },
    gender: "",
    dob: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Mock data cho huy hiệu
  useEffect(() => {
    const mockBadges = [
      { id: 1, title: "1-Day Smoking Free", date: "11/06/2025", description: "Chúc mừng bạn!", icon: "🚭" },
      { id: 2, title: "100K Money Save", date: "12/06/2025", description: "Tiết kiệm 100K!", icon: "💰" },
      { id: 3, title: "1-Week Milestone", date: "18/06/2025", description: "Kiên trì 1 tuần!", icon: "🏆" },
      { id: 4, title: "Health Improvement", date: "25/06/2025", description: "Cải thiện sức khỏe!", icon: "❤️" },
      { id: 5, title: "1-Month Achievement", date: "20/07/2025", description: "1 tháng không thuốc!", icon: "🎯" },
      { id: 6, title: "2-Month Champion", date: "20/08/2025", description: "Nhà vô địch!", icon: "🏅" },
    ];

    setTimeout(() => {
      setBadges(mockBadges);
      setLoading(false);
    }, 1000);
  }, []);

  // Lấy dữ liệu người dùng từ API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId || !token) throw new Error("No userId or token found, please log in first");

        const response = await fetch(`https://deploy-smk.onrender.com/api/user/get-member-by-id/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const member = data.member;
        setUserData({
          name: member.fullName || member.username || "",
          email: member.email || "",
          phone: member.phoneNumber || "",
          address: { line1: "", line2: "" }, // Thêm logic nếu API có address
          gender: member.gender || "",
          dob: member.dob || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e, line) => {
    const { value } = e.target;
    setUserData((prev) => ({
      ...prev,
      address: { ...prev.address, [line]: value },
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://deploy-smk.onrender.com/api/user/update-member-by-id/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userData.name,
          email: userData.email,
          phoneNumber: userData.phone,
          gender: userData.gender,
          dob: userData.dob,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setUserData((prev) => ({
        ...prev,
        ...data.member, // Cập nhật state với dữ liệu mới từ server
      }));
      setIsEdit(false);
      // Tùy chọn: Dispatch action để cập nhật Redux state nếu cần
      // dispatch(updateUserProfile(data.member));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center h-screen">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
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
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">Contact Information</h2>
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
          <h2 className="text-gray-500 uppercase text-sm font-bold mb-3">Basic Information</h2>
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
            isEdit ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } transition-colors`}
        >
          {isEdit ? "Save Changes" : "Edit Profile"}
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