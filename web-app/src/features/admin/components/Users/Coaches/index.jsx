import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Coaches.module.css";
import {
  fetchAllCoaches,
  registerCoach,
  deleteCoach,
  clearError,
} from "@/redux/slices/coachesSlice";
import { toast } from "react-toastify";

const CoachesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dob: "",
    gender: "male",
    expertise: "",
  });
  const dispatch = useDispatch();
  const { coaches, loading, error } = useSelector((state) => state.coaches);

  // Handle delete coach
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coach?")) {
      dispatch(deleteCoach(id))
        .unwrap()
        .then(() => {
          toast.success("Coach deleted successfully");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to delete coach");
          console.error("Failed to delete coach:", error);
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

  // Handle form submission for adding coach
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(registerCoach(formData)).unwrap();

      toast.success("Coach created successfully");
      setShowAddForm(false);
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dob: "",
        gender: "male",
        expertise: "",
      });

      // Refresh the coaches list
      dispatch(fetchAllCoaches());
    } catch (error) {
      toast.error(error.message || "Failed to create coach");
      console.error("Failed to create coach:", error);
    }
  };

  // Load API data on component mount
  useEffect(() => {
    dispatch(fetchAllCoaches());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Use Redux data - Updated to match API DTO structure
  const filteredCoaches = coaches.filter((coach) => {
    const searchFields = [
      coach.name || "",
      coach.username || "",
      coach.email || "",
      coach.expertise || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || coach.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Coaches Management</h1>
          <p>Manage and track all platform coaches</p>
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
            Add Coach
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Coaches</span>
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
          <div className={styles.statValue}>{coaches.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Active Coaches</span>
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
            {coaches.filter((coach) => coach.status === "active").length}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Inactive Coaches</span>
            <div className={`${styles.statIcon} ${styles.inactive}`}>
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {coaches.filter((coach) => coach.status === "inactive").length}
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
            placeholder="Search coaches..."
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

      {/* Coaches Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Coach Info</th>
              <th>Contact</th>
              <th>Expertise</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoaches.length > 0 ? (
              filteredCoaches.map((coach) => (
                <tr key={coach.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {coach.name?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div>
                        <div className={styles.userName}>{coach.name}</div>
                        <div className={styles.userMeta}>@{coach.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{coach.email}</div>
                      <div className={styles.phone}>{coach.phoneNumber}</div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.expertise}>
                      {coach.expertise || "General"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[
                          coach.status === "active" ? "active" : "inactive"
                        ]
                      }`}
                    >
                      {coach.status || "active"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(coach.id)}
                        title="Delete Coach"
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
                        strokeWidth={1}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <h3>No coaches found</h3>
                    <p>
                      Get started by adding your first coach to the platform.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Coach Modal */}
      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Coach</h2>
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
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
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
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className={styles.formSelect}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="expertise">Expertise</label>
                  <input
                    type="text"
                    id="expertise"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    placeholder="e.g., Smoking Cessation, Behavioral Therapy"
                    className={styles.formInput}
                  />
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
                  Add Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachesPage;
