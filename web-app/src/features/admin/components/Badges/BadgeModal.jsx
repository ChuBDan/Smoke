import { useState, useEffect } from "react";

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
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: loading ? "not-allowed" : "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "#f1f5f9";
                e.target.style.color = "#1e293b";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "none";
                e.target.style.color = "#64748b";
              }
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
              Badge Name *
            </label>
            <input
              type="text"
              name="badgeName"
              value={formData.badgeName}
              onChange={handleChange}
              placeholder="Enter badge name"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.badgeName
                  ? "1px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }
              }}
              onBlur={(e) => {
                if (!loading) {
                  e.target.style.borderColor = errors.badgeName
                    ? "#ef4444"
                    : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            {errors.badgeName && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {errors.badgeName}
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
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter badge description"
              rows="3"
              required
              disabled={loading}
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
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }
              }}
              onBlur={(e) => {
                if (!loading) {
                  e.target.style.borderColor = errors.description
                    ? "#ef4444"
                    : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }
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
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                backgroundColor: "white",
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }
              }}
              onBlur={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }
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
                "Update Badge"
              ) : (
                "Create Badge"
              )}
            </button>
          </div>{" "}
        </form>
      </div>
    </div>
  );
};

export default BadgeModal;
