import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Admins.module.css";
import {
  fetchAllAdmins,
  registerAdmin,
  deleteAdmin,
  clearError,
} from "@/redux/slices/adminsSlice";
import { toast } from "react-toastify";

const AdminsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin",
  });

  const dispatch = useDispatch();
  const { admins, loading, error } = useSelector((state) => state.admins);

  // Handle delete admin
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      dispatch(deleteAdmin(id))
        .unwrap()
        .then(() => {
          toast.success("Admin deleted successfully");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to delete admin");
          console.error("Failed to delete admin:", error);
        });
    }
  };

  // Handle input change for add form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for adding admin
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(registerAdmin(formData)).unwrap();

      toast.success("Admin created successfully");
      setShowAddForm(false);
      setFormData({
        username: "",
        password: "",
        role: "admin",
      });

      // Refresh the admins list
      dispatch(fetchAllAdmins());
    } catch (error) {
      toast.error(error.message || "Failed to create admin");
      console.error("Failed to create admin:", error);
    }
  };

  // Load API data on component mount
  useEffect(() => {
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Filter admins based on search and status
  const filteredAdmins = admins.filter((admin) => {
    const searchFields = [admin.username || "", admin.role || ""]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || admin.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Function to reload API data
  const loadApiData = () => {
    dispatch(fetchAllAdmins());
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Admins Management</h1>
          <p>Manage system administrators and their permissions</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Admin
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Admins</span>
            <div className={`${styles.statIcon} ${styles.total}`}>
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{admins.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Active Admins</span>
            <div className={`${styles.statIcon} ${styles.active}`}>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {admins.filter((admin) => admin.status === "active").length}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Super Admins</span>
            <div className={`${styles.statIcon} ${styles.superAdmin}`}>
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {admins.filter((admin) => admin.role === "super_admin").length}
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
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
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>{" "}
      {/* Admins Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>⏳</div>
            <h3 className={styles.loadingTitle}>Loading admins...</h3>
            <p className={styles.loadingText}>
              Fetching latest data from API endpoint
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.avatar}>
                            {admin.username?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div>
                            <div className={styles.userName}>
                              @{admin.username}
                            </div>
                            <div className={styles.userMeta}>
                              ID: {admin.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.role} ${
                            styles[
                              admin.role?.toLowerCase().replace("_", "") ||
                                "admin"
                            ]
                          }`}
                        >
                          {admin.role?.replace("_", " ").toUpperCase() ||
                            "ADMIN"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[
                              admin.status === "active" ? "active" : "inactive"
                            ]
                          }`}
                        >
                          {admin.status || "active"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.dateInfo}>
                          <div>
                            {admin.dateCreated
                              ? new Date(admin.dateCreated).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className={styles.time}>
                            {admin.dateCreated
                              ? new Date(admin.dateCreated).toLocaleTimeString()
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(admin.id)}
                            title="Delete Admin"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      <div className={styles.emptyStateContent}>
                        {" "}
                        <svg
                          width="48"
                          height="48"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className={styles.emptyIcon}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <h3>No admins found</h3>
                        <p>
                          Get started by adding your first admin to the system.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Empty state with error handling */}
      {filteredAdmins.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <svg
            width="64"
            height="64"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3>{error ? "Failed to load admins" : "No admins found"}</h3>
          <p>
            {error
              ? "Check API connection and try again"
              : "Get started by adding your first admin to the system."}
          </p>
          {error && (
            <button
              className={styles.testButton}
              onClick={loadApiData}
              style={{
                background: "#3B82F6",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                marginTop: "1rem",
                cursor: "pointer",
              }}
            >
              Retry Loading
            </button>
          )}
        </div>
      )}
      {/* Add Admin Modal */}
      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Admin</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddForm(false)}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter admin username"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter admin password"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className={styles.formSelect}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
