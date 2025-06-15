import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./Badges.module.css";

const BadgeForm = ({ badge, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    badgeName: "",
    description: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && badge) {
      setFormData({
        badgeName: badge.badgeName || "",
        description: badge.description || "",
        status: badge.status || "active",
      });
    } else {
      setFormData({
        badgeName: "",
        description: "",
        status: "active",
      });
    }
    setErrors({});
  }, [badge, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.badgeName.trim()) {
      newErrors.badgeName = "Badge name is required";
    } else if (formData.badgeName.trim().length < 2) {
      newErrors.badgeName = "Badge name must be at least 2 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving badge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? "Edit Badge" : "Add New Badge"}</h2>
          <button className={styles.closeButton} onClick={onCancel}>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="badgeName" className={styles.formLabel}>
              Badge Name *
            </label>
            <input
              type="text"
              id="badgeName"
              name="badgeName"
              value={formData.badgeName}
              onChange={handleInputChange}
              className={`${styles.formInput} ${
                errors.badgeName ? styles.inputError : ""
              }`}
              placeholder="Enter badge name"
              disabled={isLoading}
            />
            {errors.badgeName && (
              <span className={styles.errorMessage}>{errors.badgeName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.formTextarea} ${
                errors.description ? styles.inputError : ""
              }`}
              placeholder="Enter badge description"
              rows={4}
              disabled={isLoading}
            />
            {errors.description && (
              <span className={styles.errorMessage}>{errors.description}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.formLabel}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={styles.formSelect}
              disabled={isLoading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className={styles.spinner}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isEditing ? "Update Badge" : "Create Badge"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

BadgeForm.propTypes = {
  badge: PropTypes.shape({
    badgeName: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

BadgeForm.defaultProps = {
  badge: null,
  isEditing: false,
};

export default BadgeForm;
