import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "@/components/ConfirmModal";
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

  // ConfirmModal state for delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState(null);

  // Handle delete admin (open modal)
  const handleDelete = (id) => {
    setDeletingAdminId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (deletingAdminId) {
      dispatch(deleteAdmin(deletingAdminId));
    }
    setShowDeleteModal(false);
    setDeletingAdminId(null);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingAdminId(null);
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
      </div>
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
                            style={{
                              marginRight: "0.5rem",
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              border: "1px solid #e2e8f0",
                              background: "white",
                              color: "#0284c7",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            title="Edit Admin"
                            onMouseEnter={(e) => {
                              e.target.style.background = "#f0f9ff";
                              e.target.style.borderColor = "#0284c7";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "white";
                              e.target.style.borderColor = "#e2e8f0";
                            }}
                            onClick={() => {
                              /* TODO: Implement handleEdit(admin) when edit is available */
                            }}
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            className={styles.deleteButton}
                            style={{
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              border: "1px solid #e2e8f0",
                              background: "white",
                              color: "#ef4444",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => handleDelete(admin.id)}
                            title="Delete Admin"
                            onMouseEnter={(e) => {
                              e.target.style.background = "#fef2f2";
                              e.target.style.borderColor = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "white";
                              e.target.style.borderColor = "#e2e8f0";
                            }}
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
                            strokeWidth={1.5}
                            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
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
      </div>{" "}
      {/* Add Admin Modal */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Add New Admin
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f1f5f9";
                  e.target.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "#64748b";
                }}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {" "}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter admin username"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter admin password"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "white",
                    backgroundColor: "#3b82f6",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#3b82f6";
                  }}
                >
                  Create Admin
                </button>
              </div>{" "}
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminsPage;
