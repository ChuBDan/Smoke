import { useState, useEffect, useRef } from "react";
import { assets } from "@/assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, clearMessages } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/config/api";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, successMessage, userId } = useSelector((state) => state.auth);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Notifications -----------------------------------------------------------
  const [notiList, setNotiList] = useState([]);
  const [unread, setUnread]   = useState(0);
  const [openNoti, setOpenNoti] = useState(false);
  const notiRef = useRef(null);

  // Fetch notifications + add click‑outside listener ------------------------
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(
          `/api/user/get-notifications-by-member/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const notifications = res.data.notifications || [];
        setNotiList(notifications);
        setUnread(notifications.length); 
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();

    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setOpenNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token, userId]);

  // Success message ---------------------------------------------------------
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // -------------------------------------------------------------------------
  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <Link to="/">
  <img className="w-44 cursor-pointer" src={assets.logo} alt="Logo" />
</Link>

      <ul className="hidden md:flex items-start gap-4 font-medium">
        <NavLink to="/"><li className="py-1">Home</li></NavLink>
        <NavLink to="/smokingcessation"><li className="py-1">Smoking Cessation</li></NavLink>
        <NavLink to="/about"><li className="py-1">About</li></NavLink>
        <NavLink to="/contact"><li className="py-1">Contact</li></NavLink>
        {token && <NavLink to="/smokingstatusform"><li className="py-1">Smoking Form</li></NavLink>}
        {token === "admin" && <NavLink to="/admin"><li className="py-1">Admin Panel</li></NavLink>}
        {token === "coach" && <NavLink to="/coach"><li className="py-1">Coach Panel</li></NavLink>}
      </ul>

      <div className="flex items-center gap-4">
        {showSuccessMessage && (
          <span className="text-green-600 text-xs animate-fade-in">{successMessage}</span>
        )}

        {token ? (
          <>
            {/* 🔔 Bell */}
            <div className="relative" ref={notiRef}>
              <button 
                onClick={() => setOpenNoti((o) => !o)} 
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Bell className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>

              {openNoti && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-30 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Thông báo</h3>
                      {unread > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                          {unread} mới
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  {notiList.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bell className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Không có thông báo nào</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notiList.map((n, index) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setUnread((u) => Math.max(u - 1, 0));
                            setOpenNoti(false);
                            // navigate(n.link || "#");
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            {/* Notification dot */}
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                                {n.title}
                              </div>
                              <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {n.message}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>🕒</span>
                                {n.sentDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  {notiList.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          setUnread(0);
                          setOpenNoti(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img className="w-8 rounded-full" src={assets.profile_pic} alt="Profile" />
              <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p onClick={() => navigate("profile")} className="hover:text-black cursor-pointer">My Profile</p>
                  <p
                  onClick={() => navigate("paymenthistory")}
                  className="hover:text-black cursor-pointer"
                >
                  Payment History                </p>
                  <p onClick={() => navigate("smokingprogress")} className="hover:text-black cursor-pointer">Smoking Progress</p>
                  <p
                    onClick={() => {
                      dispatch(logout());
                      navigate("/");
                    }}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;