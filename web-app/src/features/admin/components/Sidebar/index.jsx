import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { logout } from "@/redux/slices/authSlice";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);
  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Users",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      hasDropdown: true,
      subItems: [
        {
          path: "/admin/users/members",
          label: "Members",
          icon: (
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
        {
          path: "/admin/users/coaches",
          label: "Coaches",
          icon: (
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
        },
        {
          path: "/admin/users/admins",
          label: "Admins",
          icon: (
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      path: "/admin/badges",
      label: "Badges",
      icon: (
        <svg
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth="5"
          stroke="currentColor"
          fill="none"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M45.41,11.16l.86,2.61a3.75,3.75,0,0,0,1.5,2L50,17.21a3.85,3.85,0,0,1,1.43,4.62l-.84,2.09a3.83,3.83,0,0,0,0,2.88l.83,2a3.83,3.83,0,0,1-1.32,4.58L48.13,34.8a3.86,3.86,0,0,0-1.46,2.08L46,39.32a3.84,3.84,0,0,1-4,2.78l-2.1-.18a3.88,3.88,0,0,0-2.74.84l-2,1.63a3.83,3.83,0,0,1-4.85,0L28.54,43a3.85,3.85,0,0,0-2.45-.88H23a3.83,3.83,0,0,1-3.74-3l-.55-2.35a3.82,3.82,0,0,0-1.58-2.31L15.3,33.19a3.84,3.84,0,0,1-1.45-4.48l.86-2.36a3.86,3.86,0,0,0,0-2.66l-.77-2.06a3.86,3.86,0,0,1,1.51-4.58l2-1.31a3.87,3.87,0,0,0,1.61-2.19l.61-2.18a3.85,3.85,0,0,1,4-2.79l1.93.17a3.88,3.88,0,0,0,2.74-.84l1.83-1.48a3.84,3.84,0,0,1,4.87,0L36.7,7.81a3.82,3.82,0,0,0,2.75.88l2-.15A3.84,3.84,0,0,1,45.41,11.16Z"></path>
            <path
              d="M44.59,41.57l7,12.21c.18.31,0,.64-.23.55l-8.61-3.5a.24.24,0,0,0-.31.19l-1.06,9c-.06.29-.42.25-.6-.06L32.65,45.25"
              strokeLinecap="round"
            ></path>
            <path
              d="M32.65,45.25,25.14,60c-.19.31-.53.35-.6.07l-1.27-9.2a.24.24,0,0,0-.31-.18L14.59,54.3c-.28.08-.43-.24-.24-.56l7-12.17"
              strokeLinecap="round"
            ></path>
            <path
              d="M32.74,16.89l2.7,5.49a.1.1,0,0,0,.08.05l6,.88c.08,0,.12.12.06.17l-4.38,4.27a.09.09,0,0,0,0,.09l1,6a.1.1,0,0,1-.14.11l-5.42-2.85a.07.07,0,0,0-.09,0L27.19,34a.11.11,0,0,1-.15-.11l1-6a.1.1,0,0,0,0-.09l-4.39-4.27a.11.11,0,0,1,.06-.17l6.05-.88a.09.09,0,0,0,.08-.05l2.71-5.49A.1.1,0,0,1,32.74,16.89Z"
              strokeLinecap="round"
            ></path>
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/packages",
      label: "Packages",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
          />
        </svg>
      ),
    },
    {
      path: "/admin/appointments",
      label: "Appointments",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isUsersPathActive = () => {
    return location.pathname.startsWith("/admin/users");
  };

  const toggleUsersDropdown = () => {
    setUsersDropdownOpen(!usersDropdownOpen);
  };
  return (
    <>
      {/* Mobile overlay - only show on mobile screens */}
      {isMobile && (
        <div
          className={`${styles.sidebarOverlay} ${isOpen ? styles.active : ""}`}
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        {/* Mobile close button */}
        <button
          className={styles.mobileCloseButton}
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <svg
            width="16"
            height="16"
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
        </button>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            {isOpen && (
              <div className={styles.logoText}>
                <h2>SmokeFree</h2>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
        </div>{" "}
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            {isOpen && <div className={styles.sectionLabel}>Main Menu</div>}
            {navItems.map((item, index) => (
              <div key={item.path || index}>
                {item.hasDropdown ? (
                  // Dropdown item
                  <>
                    <button
                      className={`${styles.navItem} ${styles.dropdownToggle} ${
                        isUsersPathActive() ? styles.navItemActive : ""
                      }`}
                      onClick={toggleUsersDropdown}
                      title={item.label}
                    >
                      <div className={styles.navIcon}>{item.icon}</div>
                      {isOpen && (
                        <span className={styles.navLabel}>{item.label}</span>
                      )}
                      {isOpen && (
                        <svg
                          className={`${styles.dropdownArrow} ${
                            usersDropdownOpen ? styles.dropdownArrowOpen : ""
                          }`}
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                      {isUsersPathActive() && (
                        <div className={styles.activeIndicator}></div>
                      )}
                    </button>
                    {isOpen && usersDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`${styles.subNavItem} ${
                              isActive(subItem.path)
                                ? styles.subNavItemActive
                                : ""
                            }`}
                            onClick={() => {
                              if (isMobile && isOpen) {
                                toggleSidebar();
                              }
                            }}
                          >
                            <div className={styles.subNavIcon}>
                              {subItem.icon}
                            </div>
                            <span className={styles.subNavLabel}>
                              {subItem.label}
                            </span>
                            {isActive(subItem.path) && (
                              <div className={styles.subActiveIndicator}></div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Regular item
                  <Link
                    to={item.path}
                    title={item.label}
                    className={`${styles.navItem} ${
                      isActive(item.path) ? styles.navItemActive : ""
                    }`}
                    onClick={() => {
                      if (isMobile && isOpen) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <div className={styles.navIcon}>{item.icon}</div>
                    {isOpen && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {isActive(item.path) && (
                      <div className={styles.activeIndicator}></div>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
        {isOpen && (
          <div className={styles.sidebarFooter}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>{" "}
              <div className={styles.userInfo}>
                <div className={styles.userName}>Admin</div>
                <div className={styles.userRole}>Administrator</div>
              </div>
            </div>{" "}
            <button className={styles.logoutButton} onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>{" "}
          </div>
        )}
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
