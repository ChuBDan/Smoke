import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);

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
      path: "/admin/Apointments",
      label: "  Appointments",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      path: "/admin/profile",
      label: "Profile",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>Admin</div>
                <div className={styles.userRole}>Administrator</div>
              </div>
            </div>
            <button className={styles.logoutButton}>
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
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
