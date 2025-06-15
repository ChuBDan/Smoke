import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  clearError,
  setSearchTerm,
  setFilterStatus,
  setFilterCategory,
} from "@/redux/slices/packagesSlice";
import styles from "./Packages.module.css";

const PackagesPage = () => {
  const dispatch = useDispatch();
  const { packages, loading, error, searchTerm, filterStatus, filterCategory } =
    useSelector((state) => state.packages);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  // Filter packages based on search and status
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || pkg.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || pkg.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [packages, searchTerm, filterStatus, filterCategory]);

  const handleAddPackage = async (packageData) => {
    try {
      await dispatch(createPackage(packageData)).unwrap();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to create package:", error);
    }
  };

  const handleEditPackage = async (packageData) => {
    try {
      await dispatch(
        updatePackage({ id: selectedPackage.id, packageData })
      ).unwrap();
      setShowEditModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Failed to update package:", error);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await dispatch(deletePackage(packageId)).unwrap();
      } catch (error) {
        console.error("Failed to delete package:", error);
      }
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "basic":
        return "basic";
      case "premium":
        return "premium";
      case "ultimate":
        return "ultimate";
      case "trial":
        return "trial";
      default:
        return "default";
    }
  };

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
      {" "}
      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <div className={styles.errorContent}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>
              {typeof error === "string"
                ? error
                : error?.message || "An error occurred"}
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
            <span className={styles.statLabel}>Total Packages</span>{" "}
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
            <span className={styles.statLabel}>Total Members</span>{" "}
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
            <span className={styles.statLabel}>Revenue</span>{" "}
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
            ${stats.totalRevenue.toFixed(2)}
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
            placeholder="Search packages by name, description, or category..."
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
          <select
            value={filterCategory}
            onChange={(e) => dispatch(setFilterCategory(e.target.value))}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="ultimate">Ultimate</option>
            <option value="trial">Trial</option>
          </select>{" "}
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
            {" "}
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
              {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                ? "No packages match your current filters."
                : "Start by creating your first membership package."}
            </p>
            {!searchTerm &&
              filterStatus === "all" &&
              filterCategory === "all" && (
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
                    <span
                      className={`${styles.categoryBadge} ${
                        styles[getCategoryColor(pkg.category)]
                      }`}
                    >
                      {pkg.category}
                    </span>
                  </div>
                </div>
                <div className={styles.packageActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowEditModal(true);
                    }}
                    title="Edit package"
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
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeletePackage(pkg.id)}
                    title="Delete package"
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
                    <span className={styles.price}>${pkg.price}</span>
                    <span className={styles.duration}>/{pkg.duration}</span>
                  </div>

                  <div className={styles.memberCount}>
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
    category: initialData?.category || "Premium",
    duration: initialData?.duration || "1 month",
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
        ...formData,
        price: parseFloat(formData.price),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
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

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="packageName">Package Name *</label>
              <input
                type="text"
                id="packageName"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                className={errors.packageName ? styles.error : ""}
                placeholder="Enter package name"
                required
              />
              {errors.packageName && (
                <span className={styles.errorText}>{errors.packageName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? styles.error : ""}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              {errors.price && (
                <span className={styles.errorText}>{errors.price}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? styles.error : ""}
              placeholder="Enter package description"
              rows="3"
              required
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Ultimate">Ultimate</option>
                <option value="Trial">Trial</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              >
                <option value="7 days">7 days</option>
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Package"
              ) : (
                "Create Package"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackagesPage;
