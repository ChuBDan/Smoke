import { useState, useEffect } from "react";
import styles from "./Badges.module.css";

const BadgeModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    badgeName: initialData?.badgeName || "",
    description: initialData?.description || "",
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

    if (!formData.badgeName.trim()) {
      newErrors.badgeName = "Badge name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        badgeName: "",
        description: "",
        status: "active",
      });
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        badgeName: initialData.badgeName || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
    } else {
      // Reset form for add mode
      setFormData({
        badgeName: "",
        description: "",
        status: "active",
      });
    }
  }, [initialData]);

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
            disabled={loading}
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
          <div className={styles.formGroup}>
            <label htmlFor="badgeName">Badge Name *</label>
            <input
              type="text"
              id="badgeName"
              name="badgeName"
              value={formData.badgeName}
              onChange={handleChange}
              className={errors.badgeName ? styles.error : ""}
              placeholder="Enter badge name"
              required
              disabled={loading}
            />
            {errors.badgeName && (
              <span className={styles.errorText}>{errors.badgeName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? styles.error : ""}
              placeholder="Enter badge description"
              rows="3"
              required
              disabled={loading}
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
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
                "Update Badge"
              ) : (
                "Create Badge"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeModal;
