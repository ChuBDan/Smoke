import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { formatVND } from "@/utils/format";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  clearError,
  setSearchTerm,
  setFilterStatus,
} from "@/redux/slices/packagesSlice";
import styles from "./Packages.module.css";
import ConfirmModal from "@/components/ConfirmModal";
import PropTypes from "prop-types";

const PackagesPage = () => {
  const dispatch = useDispatch();
  const { packages, loading, error, searchTerm, filterStatus } = useSelector(
    (state) => state.packages
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch packages on component mount
  useEffect(() => {
    dispatch(fetchAllPackages()).finally(() => {
      setIsInitialLoad(false);
    });
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Filter packages based on search and status (category removed)
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || pkg.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [packages, searchTerm, filterStatus]);

  const handleAddPackage = async (packageData) => {
    try {
      await dispatch(createPackage(packageData)).unwrap();
      await dispatch(fetchAllPackages());
      setShowAddModal(false);
      toast.success("Package created successfully!");
    } catch (error) {
      toast.error("Failed to create package");
      console.error("Failed to create package:", error);
    }
  };

  const handleEditPackage = async (packageData) => {
    try {
      await dispatch(
        updatePackage({ id: selectedPackage.id, packageData })
      ).unwrap();
      await dispatch(fetchAllPackages());
      setShowEditModal(false);
      setSelectedPackage(null);
      toast.success("Package updated successfully!");
    } catch (error) {
      toast.error("Failed to update package");
      console.error("Failed to update package:", error);
    }
  };

  const handleDeletePackage = async (packageId) => {
    setDeleteId(packageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deletePackage(deleteId)).unwrap();
      await dispatch(fetchAllPackages());
      toast.success("Package deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete package");
      console.error("Failed to delete package:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Category color logic removed

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter((pkg) => pkg.status === "active").length,
    totalMembers: packages.reduce(
      (sum, pkg) => sum + (pkg.memberCount || 0),
      0
    ),
    totalRevenue: packages.reduce(
      (sum, pkg) => sum + pkg.price * (pkg.memberCount || 0),
      0
    ),
  };
  if (loading && packages.length === 0 && isInitialLoad) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading packages...</p>
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
          <h1>Packages Management</h1>
          <p>Manage membership packages and subscription plans</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
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
            Add Package
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Packages</span>
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
                  d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalPackages}</div>
          <div className={`${styles.statChange} ${styles.neutral}`}>
            All available packages
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Active Packages</span>
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
          <div className={styles.statValue}>{stats.activePackages}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Currently available
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Members</span>
            <div className={`${styles.statIcon} ${styles.subscribers}`}>
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
          <div className={styles.statValue}>{stats.totalMembers}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Total subscribers
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Revenue</span>
            <div className={`${styles.statIcon} ${styles.revenue}`}>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {formatVND(stats.totalRevenue)}
          </div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Total earnings
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
            placeholder="Search packages by name or description..."
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
          {/* Category filter removed */}
          <button
            className={styles.refreshButton}
            onClick={() => dispatch(fetchAllPackages())}
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
      {/* Packages Grid */}
      <div className={styles.packagesGrid}>
        {filteredPackages.length === 0 ? (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                />
              </svg>
            </div>
            <h3>No packages found</h3>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "No packages match your current filters."
                : "Start by creating your first membership package."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                className={styles.createFirstButton}
                onClick={() => setShowAddModal(true)}
              >
                Create First Package
              </button>
            )}
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <div key={pkg.id} className={styles.packageCard}>
              <div className={styles.packageHeader}>
                <div className={styles.packageInfo}>
                  <h3>{pkg.packageName}</h3>
                  <div className={styles.packageMeta}>
                    <span
                      className={`${styles.statusBadge} ${styles[pkg.status]}`}
                    >
                      {pkg.status}
                    </span>
                  </div>
                </div>
                <div className={styles.packageActions}>
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
                    title="Edit package"
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f0f9ff";
                      e.target.style.borderColor = "#0284c7";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowEditModal(true);
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
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      color: "#ef4444",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    title="Delete package"
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fef2f2";
                      e.target.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                    onClick={() => handleDeletePackage(pkg.id)}
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
              </div>

              <div className={styles.packageContent}>
                <p className={styles.packageDescription}>{pkg.description}</p>

                <div className={styles.packageDetails}>
                  <div className={styles.priceSection}>
                    <span className={styles.price}>{formatVND(pkg.price)}</span>
                  </div>

                  <div className={styles.memberCount}>
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
                    <span>{pkg.memberCount || 0} members</span>
                  </div>
                </div>

                <div className={styles.packageDates}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateLabel}>Created:</span>
                    <span className={styles.dateValue}>
                      {pkg.dateCreated
                        ? new Date(pkg.dateCreated).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  {pkg.dateUpdated && (
                    <div className={styles.dateInfo}>
                      <span className={styles.dateLabel}>Updated:</span>
                      <span className={styles.dateValue}>
                        {new Date(pkg.dateUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Add Package Modal */}
      {showAddModal && (
        <PackageModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPackage}
          title="Add New Package"
          loading={loading}
        />
      )}
      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <PackageModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPackage(null);
          }}
          onSubmit={handleEditPackage}
          title="Edit Package"
          initialData={selectedPackage}
          loading={loading}
        />
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

// Package Form Modal Component
const PackageModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    packageName: initialData?.packageName || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    status: initialData?.status || "active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = "Package name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        packageName: formData.packageName,
        description: formData.description,
        price: parseFloat(formData.price),
        status: formData.status,
      });
    }
  };

  if (!isOpen) return null;
  return (
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
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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
                Package Name *
              </label>
              <input
                type="text"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                placeholder="Enter package name"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: errors.packageName
                    ? "1px solid #ef4444"
                    : "1px solid #d1d5db",
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
                  e.target.style.borderColor = errors.packageName
                    ? "#ef4444"
                    : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.packageName && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {errors.packageName}
                </span>
              )}
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
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: errors.price
                    ? "1px solid #ef4444"
                    : "1px solid #d1d5db",
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
                  e.target.style.borderColor = errors.price
                    ? "#ef4444"
                    : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.price && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {errors.price}
                </span>
              )}
            </div>
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
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter package description"
              rows="3"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.description
                  ? "1px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                resize: "vertical",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.description
                  ? "#ef4444"
                  : "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.description && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {errors.description}
              </span>
            )}
          </div>
          {/* Category and Duration fields removed */}
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
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
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
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                backgroundColor: "white",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "white";
                  e.target.style.borderColor = "#d1d5db";
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "white",
                backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "1rem",
                      height: "1rem",
                      border: "2px solid transparent",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Package"
              ) : (
                "Create Package"
              )}
            </button>
          </div>{" "}
        </form>
      </div>
    </div>
  );
};

PackageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialData: PropTypes.shape({
    packageName: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
  }),
  loading: PropTypes.bool,
};

export default PackagesPage;
