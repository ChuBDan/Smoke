import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  clearError,
  setSearchTerm,
  setFilterStatus,
} from "@/redux/slices/badgesSlice";
import { toast } from "react-toastify";
import styles from "./Badges.module.css";
import BadgeModal from "./BadgeModal";
import ConfirmModal from "@/components/ConfirmModal";

const BadgesPage = () => {
  const dispatch = useDispatch();
  const {
    badges = [],
    loading,
    error,
    searchTerm,
    filterStatus,
  } = useSelector((state) => state.badges);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch badges on component mount
  useEffect(() => {
    dispatch(fetchAllBadges());
  }, [dispatch]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);
  // Filter badges based on search and status
  const filteredBadges = useMemo(() => {
    // Ensure badges is an array before filtering
    if (!Array.isArray(badges)) {
      return [];
    }

    return badges.filter((badge) => {
      // Filter out deleted badges
      if (badge.status && badge.status.toLowerCase() === "deleted")
        return false;
      const matchesSearch =
        badge.badgeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || badge.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [badges, searchTerm, filterStatus]);

  const handleAddBadge = async (badgeData) => {
    setIsSubmitting(true);
    try {
      await dispatch(createBadge(badgeData)).unwrap();
      setShowAddModal(false);
      toast.success("Badge created successfully!");
      await dispatch(fetchAllBadges());
    } catch (error) {
      toast.error("Failed to create badge");
      console.error("Failed to create badge:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBadge = async (badgeData) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateBadge({ id: selectedBadge.id, badgeData })).unwrap();
      setShowEditModal(false);
      setSelectedBadge(null);
      toast.success("Badge updated successfully!");
      await dispatch(fetchAllBadges());
    } catch (error) {
      toast.error("Failed to update badge");
      console.error("Failed to update badge:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setSelectedBadge(null);
    setShowAddModal(true);
  };

  const openEditModal = (badge) => {
    setSelectedBadge(badge);
    setShowEditModal(true);
  };

  const handleDeleteBadge = (badgeId) => {
    setDeleteId(badgeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteBadge(deleteId)).unwrap();
      toast.success("Badge deleted successfully!");
      await dispatch(fetchAllBadges());
    } catch (error) {
      toast.error("Failed to delete badge");
      console.error("Failed to delete badge:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "active";
      case "inactive":
        return "inactive";
      default:
        return "default";
    }
  };
  const stats = {
    totalBadges:
      badges?.filter((badge) => badge.status?.toLowerCase() !== "deleted")
        .length || 0,
    activeBadges:
      badges?.filter((badge) => badge.status === "active").length || 0,
    inactiveBadges:
      badges?.filter((badge) => badge.status === "inactive").length || 0,
    totalMembersAchieved:
      badges?.reduce(
        (sum, badge) =>
          badge.status?.toLowerCase() !== "deleted"
            ? sum + (badge.memberCount || 0)
            : sum,
        0
      ) || 0,
  };
  if (loading && (!badges || badges.length === 0)) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Error Display */}
      {(error?.fetch ||
        error?.create ||
        error?.update ||
        error?.delete ||
        error?.fetchById) && (
        <div className={styles.errorBanner}>
          <div className={styles.errorContent}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>
              {error?.fetch?.message ||
                error?.create?.message ||
                error?.update?.message ||
                error?.delete?.message ||
                error?.fetchById?.message ||
                "An error occurred"}
            </span>
            <button
              onClick={() => dispatch(clearError())}
              className={styles.closeError}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Badges Management</h1>
          <p>Manage user badges and achievements</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={openAddModal}
            disabled={loading}
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
            Add Badge
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Badges</span>
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalBadges}</div>
          <div className={`${styles.statChange} ${styles.neutral}`}>
            All available badges
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Active Badges</span>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.activeBadges}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Currently available
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Inactive Badges</span>
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
          <div className={styles.statValue}>{stats.inactiveBadges}</div>
          <div className={`${styles.statChange} ${styles.negative}`}>
            <span>↓</span> Not available
          </div>
        </div>{" "}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Achievements</span>
            <div className={`${styles.statIcon} ${styles.achievements}`}>
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalMembersAchieved}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Total achievements
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className={styles.filtersSection}>
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search badges by name or description..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            className={styles.refreshButton}
            onClick={() => dispatch(fetchAllBadges())}
            disabled={loading}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className={loading ? styles.spinning : ""}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 4v6h6M23 20v-6h-6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      {/* Badges Grid */}
      <div className={styles.badgesGrid}>
        {filteredBadges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
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
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3>No badges found</h3>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "No badges match your current filters."
                : "Start by creating your first badge."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                className={styles.createFirstButton}
                onClick={() => setShowAddModal(true)}
              >
                Create First Badge
              </button>
            )}
          </div>
        ) : (
          filteredBadges.map((badge) => (
            <div key={badge.id} className={styles.badgeCard}>
              <div className={styles.badgeHeader}>
                <div className={styles.badgeInfo}>
                  <h3>{badge.badgeName}</h3>
                  <div className={styles.badgeMeta}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[getStatusColor(badge.status)]
                      }`}
                    >
                      {badge.status}
                    </span>
                  </div>
                </div>
                <div className={styles.badgeActions}>
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
                    title="Edit badge"
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f0f9ff";
                      e.target.style.borderColor = "#0284c7";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                    onClick={() => openEditModal(badge)}
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
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      color: "#ef4444",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    title="Delete badge"
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fef2f2";
                      e.target.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                    onClick={() => handleDeleteBadge(badge.id)}
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
              </div>{" "}
              <div className={styles.badgeContent}>
                <p className={styles.badgeDescription}>{badge.description}</p>{" "}
                <div className={styles.badgeDetails}>
                  <div></div>{" "}
                  {/* Empty left section to match packages layout */}
                  <div
                    className={
                      badge.memberCount && badge.memberCount > 0
                        ? styles.memberCount
                        : styles.memberCountEmpty
                    }
                  >
                    {" "}
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
                    <span>
                      {badge.memberCount && badge.memberCount > 0
                        ? `${badge.memberCount} members`
                        : "No members yet"}
                    </span>
                  </div>
                </div>
                <div className={styles.badgeDates}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateLabel}>Created:</span>
                    <span className={styles.dateValue}>
                      {badge.dateCreated
                        ? new Date(badge.dateCreated).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </span>
                  </div>
                  {badge.dateUpdated && (
                    <div className={styles.dateInfo}>
                      <span className={styles.dateLabel}>Updated:</span>
                      <span className={styles.dateValue}>
                        {new Date(badge.dateUpdated).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Add Badge Modal */}
      <BadgeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBadge}
        title="Add New Badge"
        loading={isSubmitting}
      />
      {/* Edit Badge Modal */}
      <BadgeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBadge(null);
        }}
        onSubmit={handleEditBadge}
        title="Edit Badge"
        initialData={selectedBadge}
        loading={isSubmitting}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Badge"
        message="Are you sure you want to delete this badge? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BadgesPage;
