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
              {" "}
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
                        {" "}                        <svg
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
      </div>
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
