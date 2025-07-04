import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateMemberPackage } from "@/redux/slices/authSlice";
import { getMemberInfo } from "@/features/auth/services/getMemberInfo";

const MyProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, token, memberPackage } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!userId || !token) navigate("/login");
  }, [userId, token, navigate]);

  useEffect(() => {
    const mockBadges = [
      {
        id: 1,
        title: "1-Day Free",
        date: "11/06/2025",
        description: "Cố lên!",
        icon: "🚭",
      },
      {
        id: 2,
        title: "100K Saved",
        date: "12/06/2025",
        description: "Tiết kiệm tốt!",
        icon: "💰",
      },
      {
        id: 3,
        title: "1 Week!",
        date: "18/06/2025",
        description: "Tiến bộ!",
        icon: "🏆",
      },
    ];
    setTimeout(() => setBadges(mockBadges), 800);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const member = await getMemberInfo(userId, token);

        setUserData({
          fullName: member.fullName || "",
          email: member.email || "",
          phoneNumber: member.phoneNumber || "",
          gender: member.gender || "",
          dob: member.dob || "",
        });

        if (member.membership_Package) {
          dispatch(updateMemberPackage(member.membership_Package));
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) fetchUser();
  }, [userId, token, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `https://deploy-smk.onrender.com/api/member/update-member/${userId}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Updated:", res.data);
      setIsEdit(false);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center h-screen">{error}</div>;

  return (
    <div className="container mx-auto p-6 flex flex-col md:flex-row gap-6">
      {/* Profile Section */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          {isEdit ? (
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              className="text-xl font-bold border-b w-full focus:outline-none"
            />
          ) : (
            <h1 className="text-xl font-bold">{userData.fullName}</h1>
          )}
        </div>

        {[
          { label: "Email", name: "email", readOnly: true },
          { label: "Phone", name: "phoneNumber" },
          { label: "Gender", name: "gender", isSelect: true },
          { label: "Birthday", name: "dob", type: "date" },
        ].map(({ label, name, isSelect, type = "text", readOnly }) => (
          <div key={name} className="mb-4">
            <label className="text-gray-600 block">{label}:</label>
            {isEdit && !readOnly ? (
              isSelect ? (
                <select
                  name={name}
                  value={userData[name]}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select {label}</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={userData[name]}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              )
            ) : (
              <p className={readOnly ? "text-gray-500" : ""}>
                {userData[name]}
              </p>
            )}
          </div>
        ))}

        <button
          onClick={isEdit ? handleSave : () => setIsEdit(true)}
          className={`mt-6 px-6 py-2 rounded-full transition ${
            isEdit ? "bg-green-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {isEdit ? "Lưu" : "Chỉnh sửa"}
        </button>

        {/* Member Package Section */}
        <div className="mt-8">
          <h3 className="text-gray-700 text-lg font-semibold mb-2">
            Gói thành viên
          </h3>
          {memberPackage ? (
            <div className="p-4 border rounded bg-blue-50">
              <p className="text-blue-800 font-bold text-lg">
                {memberPackage.packageName}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {memberPackage.description}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Giá:{" "}
                <strong>
                  {Number(memberPackage.price).toLocaleString()} VND
                </strong>
              </p>
              <p className="text-sm text-gray-500">
                Ngày tạo: {memberPackage.dateCreated}
              </p>
              {memberPackage.packageName.toUpperCase() === "FREE" && (
                <button
                  onClick={() => navigate("/membership")}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Nâng cấp gói VIP
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-500 italic">
                Chưa đăng ký gói thành viên nào.
              </p>
              <button
                onClick={() => navigate("/membership")}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Đăng ký gói thành viên
              </button>
            </>
          )}
        </div>
      </div>

      {/* Badges Section */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Huy hiệu thành tích</h2>
        {badges.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-gray-100 rounded-lg flex items-start gap-3 border-l-4 border-blue-600"
              >
                <div className="w-10 h-10 text-xl bg-blue-600 text-white flex items-center justify-center rounded-full">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{badge.title}</h3>
                  <p className="text-sm text-gray-600">
                    Ngày đạt: {badge.date}
                  </p>
                  <p className="text-gray-700">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có huy hiệu nào.</p>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
