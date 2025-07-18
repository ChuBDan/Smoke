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
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  // Handle tooltip visibility
  const showTooltip = (e, text) => {
    if (!isOpen && text) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        text,
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const hideTooltip = () => {
    setTooltip({ show: false, text: "", x: 0, y: 0 });
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

  // Auto-open Users dropdown when on users pages
  useEffect(() => {
    if (location.pathname.startsWith("/admin/users")) {
      setUsersDropdownOpen(true);
    }
  }, [location.pathname]);

  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M12 12C12 11.4477 12.4477 11 13 11H19C19.5523 11 20 11.4477 20 12V19C20 19.5523 19.5523 20 19 20H13C12.4477 20 12 19.5523 12 19V12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
            <path
              d="M4 5C4 4.44772 4.44772 4 5 4H8C8.55228 4 9 4.44772 9 5V19C9 19.5523 8.55228 20 8 20H5C4.44772 20 4 19.5523 4 19V5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
            <path
              d="M12 5C12 4.44772 12.4477 4 13 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H13C12.4477 8 12 7.55228 12 7V5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
          </g>
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
      path: "/admin/payments",
      label: "Payments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <rect
              x="3"
              y="6"
              width="18"
              height="13"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></rect>{" "}
            <path
              d="M3 10H20.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>{" "}
            <path
              d="M7 15H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>{" "}
          </g>
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
                <h2>Prescripto</h2>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
        </div>
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
                      onMouseEnter={(e) => showTooltip(e, item.label)}
                      onMouseLeave={hideTooltip}
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
                    className={`${styles.navItem} ${
                      isActive(item.path) ? styles.navItemActive : ""
                    }`}
                    onMouseEnter={(e) => showTooltip(e, item.label)}
                    onMouseLeave={hideTooltip}
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
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>Admin</div>
                <div className={styles.userRole}>Administrator</div>
              </div>
            </div>
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
            </button>
          </div>
        )}
      </aside>

      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          className={styles.customTooltip}
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
            zIndex: 999999,
            pointerEvents: "none",
          }}
        >
          <div className={styles.tooltipArrow} />
          <div className={styles.tooltipContent}>{tooltip.text}</div>
        </div>
      )}
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
