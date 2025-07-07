import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar } from "../features/admin/components";
import styles from "../pages/Admin/AdminPage/AdminPage.module.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  // Check authentication and role
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      navigate("/admin/login");
      return;
    }
  }, [token, navigate]);

  // Prevent body scroll when admin layout is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Don't render content if not authenticated
  const role = localStorage.getItem("role");
  if (!token || role !== "ADMIN") {
    return <div>Redirecting to login...</div>;
  }
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
    if (path.includes("/admin/payments")) return "Payments";
    if (path.includes("/admin/badges")) return "Badges";
    if (path.includes("/admin/packages")) return "Packages";
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
              <span className={styles.breadcrumbText}>Prescripto Admin</span>
              <span className={styles.breadcrumbSeparator}>›</span>
              <span className={styles.breadcrumbCurrent}>{getPageTitle()}</span>
            </div>
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
