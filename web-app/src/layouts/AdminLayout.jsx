import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../features/admin/components";
import styles from "../pages/Admin/AdminPage/AdminPage.module.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Prevent body scroll when admin layout is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "Dashboard";
    if (path.includes("/admin/users")) {
      if (path.includes("/members")) return "Members";
      if (path.includes("/coaches")) return "Coaches";
      if (path.includes("/admins")) return "Admins";
      return "Users";
    }
    if (path.includes("/admin/appointments")) return "Appointments";
    if (path.includes("/admin/reports")) return "Reports";
    if (path.includes("/admin/badges")) return "Badges";
    if (path.includes("/admin/settings")) return "Settings";
    return "Admin";
  };

  return (
    <div className={styles.container} data-admin-page>
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`${styles.mainContent} ${
          !sidebarOpen ? styles.expanded : ""
        }`}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.menuButton}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbText}>SmokeFree Admin</span>
              <span className={styles.breadcrumbSeparator}>›</span>
              <span className={styles.breadcrumbCurrent}>{getPageTitle()}</span>
            </div>{" "}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
