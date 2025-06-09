import { useState, useEffect } from "react";
import styles from "./Members.module.css";
import { membersApi } from "../../../services/membersApi";

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [apiMembers, setApiMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to load API data
  const loadApiData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await membersApi.testGetAllUsers();

      if (result.success && result.data) {
        // Extract members array from the API response
        const membersData = result.data.members || [];
        // Map API data to component format with clean data mapping
        const mappedMembers = membersData.map((member) => {
          return {
            id: member.id,
            name: member.fullName,
            username: member.username,
            email: member.email,
            phone: member.phoneNumber,
            joinDate: member.join_Date,
            status: member.status.toLowerCase(), // Convert "ACTIVE" to "active"
            gender: member.gender,
            dob: member.dob,
            role: member.role,
            dateCreated: member.dateCreated,
            memberBadges: member.memberBadges || [],
          };
        });

        setApiMembers(mappedMembers);
        setError(null);
        console.log(
          `✅ Successfully mapped ${mappedMembers.length} members from API`
        );
      } else {
        setError(result.message || "Failed to fetch data");
        setApiMembers([]);
      }
    } catch (err) {
      console.error("Error loading API data:", err);
      setError("Failed to connect to API endpoint");
      setApiMembers([]);
    } finally {
      setLoading(false);
    }
  };
  // Load API data on component mount
  useEffect(() => {
    loadApiData();
  }, []);

  // Use API data instead of mock data
  const members = apiMembers;
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  return (
    <div className={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Members Management</h1>
          <p>Manage and track all platform members</p>
        </div>{" "}
        <div className={styles.headerActions}>
          <button className={styles.addButton}>
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
            Add Member
          </button>
        </div>{" "}
      </div>
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
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
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>{" "}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>⏳</div>
            <h3 className={styles.loadingTitle}>Loading members...</h3>
            <p className={styles.loadingText}>
              Fetching latest data from API endpoint
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Member
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Contact
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Details
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Joined
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "all 0.2s ease",
                      background: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0 ? "#ffffff" : "#fafbfc";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "1.125rem",
                            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#1e293b",
                              fontSize: "0.9rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {member.name}
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "0.8rem",
                              fontFamily: "monospace",
                            }}
                          >
                            @{member.username}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                            }}
                          >
                            ID: {member.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div>
                        <div
                          style={{
                            fontWeight: "500",
                            color: "#1e293b",
                            marginBottom: "0.25rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          {member.email}
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                        <div style={{ marginBottom: "0.25rem" }}>
                          <span style={{ color: "#64748b" }}>Gender:</span>{" "}
                          <span
                            style={{
                              color: "#1e293b",
                              fontWeight: "500",
                              textTransform: "capitalize",
                            }}
                          >
                            {member.gender.toLowerCase()}
                          </span>
                        </div>
                        <div style={{ marginBottom: "0.25rem" }}>
                          <span style={{ color: "#64748b" }}>DOB:</span>{" "}
                          <span style={{ color: "#1e293b", fontWeight: "500" }}>
                            {new Date(member.dob).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#64748b" }}>Role:</span>{" "}
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              textTransform: "capitalize",
                            }}
                          >
                            {member.role.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                          background:
                            member.status === "active"
                              ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                              : "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                          color:
                            member.status === "active" ? "#166534" : "#dc2626",
                          border: `1px solid ${
                            member.status === "active" ? "#bbf7d0" : "#fecaca"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background:
                              member.status === "active"
                                ? "#22c55e"
                                : "#ef4444",
                          }}
                        ></div>
                        {member.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontSize: "0.8rem" }}>
                        <div
                          style={{
                            fontWeight: "500",
                            color: "#1e293b",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.75rem",
                          }}
                        >
                          {member.dateCreated}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#64748b",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#f8fafc";
                            e.target.style.color = "#3b82f6";
                            e.target.style.borderColor = "#3b82f6";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#64748b";
                            e.target.style.borderColor = "#e2e8f0";
                          }}
                          title="View Details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#64748b",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#f8fafc";
                            e.target.style.color = "#059669";
                            e.target.style.borderColor = "#059669";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#64748b";
                            e.target.style.borderColor = "#e2e8f0";
                          }}
                          title="Edit"
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#64748b",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#fef2f2";
                            e.target.style.color = "#dc2626";
                            e.target.style.borderColor = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#64748b";
                            e.target.style.borderColor = "#e2e8f0";
                          }}
                          title="Delete"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Empty state with error handling */}
      {filteredMembers.length === 0 && !loading && (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3>{error ? "Failed to load members" : "No members found"}</h3>
          <p>
            {error
              ? "Check API connection and try again"
              : "Try adjusting your search criteria"}
          </p>{" "}
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
              Retry API Call
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
