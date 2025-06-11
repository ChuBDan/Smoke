import { useState } from "react";
import { assets } from "@/assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // Mock user role - in real app this would come from auth context
  const [userRole, setUserRole] = useState("user"); // "admin", "coach", "user"

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img className="w-44 cursor-pointer" src={assets.logo} alt="" />
      <ul className="hidden md:flex items-start gap-4 font-medium">
        <NavLink to="/">
          <li className="py-1">Home</li>
          <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">All Doctors</li>
          <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">About</li>
          <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">Contact</li>
          <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
        </NavLink>

        {/* Role-based navigation */}
        {userRole === "admin" && (
          <NavLink to="/admin">
            <li className="py-1">Admin Panel</li>
            <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
          </NavLink>
        )}
        {userRole === "coach" && (
          <NavLink to="/coach">
            <li className="py-1">Coach Panel</li>
            <hr className="border-none outline-none h-0.5 bg-primary w3/5 m-auto hidden" />
          </NavLink>
        )}
      </ul>

      {/* Role switcher for testing */}
      <div className="flex items-center gap-2">
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="px-2 py-1 border rounded text-xs"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8  rounded-full"
              src={assets.profile_pic}
              alt=""
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate("profile")}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile{" "}
                </p>
                <p
                  onClick={() => navigate("my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appontments{" "}
                </p>
                <p
                  onClick={() => dispatch(logout()) &&  navigate("/")}
                  className="hover:text-black cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
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
