import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateMemberPackage } from "@/redux/slices/authSlice";
import { getMemberInfo } from "@/features/auth/services/getMemberInfo";
import { fetchUserBadges } from "@/redux/slices/userBadgeSlice";

// ...imports remain the same

const MyProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, token, memberPackage } = useSelector((state) => state.auth);
  const { badges, loading: badgeLoading } = useSelector((state) => state.userBadges);

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

  useEffect(() => {
    if (!userId || !token) navigate("/login");
  }, [userId, token, navigate]);

  useEffect(() => {
    if (userId && token) {
      dispatch(fetchUserBadges({ userId, token }));
    }
  }, [userId, token, dispatch]);

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
        setError("Unable to load user information.");
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
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
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
          { label: "Date of Birth", name: "dob", type: "date" },
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
              <input
                type={type}
                value={userData[name]}
                disabled
                className={`w-full border p-2 rounded ${
                  readOnly ? "bg-gray-100 text-gray-500" : ""
                }`}
              />
            )}
          </div>
        ))}

        <button
          onClick={isEdit ? handleSave : () => setIsEdit(true)}
          className={`mt-6 px-6 py-2 rounded-full transition ${
            isEdit ? "bg-green-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {isEdit ? "Save" : "Edit"}
        </button>

        {/* Member Package Section */}
        <div className="mt-8">
          <h3 className="text-gray-700 text-lg font-semibold mb-2">
            Membership Package
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
                Price:{" "}
                <strong>
                  {Number(memberPackage.price).toLocaleString()} VND
                </strong>
              </p>
              <p className="text-sm text-gray-500">
                Created: {memberPackage.dateCreated}
              </p>
              {memberPackage.packageName.toUpperCase() === "FREE" && (
                <button
                  onClick={() => navigate("/membership")}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Upgrade to VIP
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-500 italic">
                No membership package registered yet.
              </p>
              <button
                onClick={() => navigate("/membership")}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Register a package
              </button>
            </>
          )}
        </div>
      </div>

      {/* Badges Section */}
<div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-6 text-blue-700">Achievement Badges</h2>
  {badges.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
      {badges.map((badge) => (
  <div
    key={badge.id}
    className="relative bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
  >
    <div className="flex items-center gap-4 mb-3">
      <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-2xl shadow-md">
        🏅
      </div>
      <div>
        <h3 className="text-lg font-semibold text-blue-800">
          {badge.badgeName}
        </h3>
        <p className="text-sm text-gray-500">
          Achieved on: <span className="font-medium">{badge.dateCreated}</span>
        </p>
      </div>
    </div>
    <p className="text-gray-700 text-sm">{badge.description}</p>
  </div>
))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm italic">No badges earned yet.</p>
  )}
</div>

    </div>
  );
};

export default MyProfile;
