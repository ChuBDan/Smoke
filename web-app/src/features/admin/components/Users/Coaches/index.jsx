import { useState, useMemo } from "react";
import styles from "./Coaches.module.css";

const CoachesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock coaches data
  const [coaches] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@smokefree.com",
      phone: "+1 (555) 123-4567",
      specialization: "Addiction Counseling",
      certification: "Licensed Clinical Social Worker",
      status: "active",
      joinDate: "2022-03-15",
      lastActivity: "2024-06-02T14:30:00",
      avatar: "SJ",
      experience: "8 years",
      clientsManaged: 245,
      successRate: 87,
      rating: 4.9,
      languages: ["English", "Spanish"],
      availability: "Full-time",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@smokefree.com",
      phone: "+1 (555) 234-5678",
      specialization: "Behavioral Therapy",
      certification: "Certified Addiction Counselor",
      status: "active",
      joinDate: "2021-08-20",
      lastActivity: "2024-06-02T11:15:00",
      avatar: "MC",
      experience: "6 years",
      clientsManaged: 189,
      successRate: 92,
      rating: 4.8,
      languages: ["English", "Mandarin"],
      availability: "Part-time",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@smokefree.com",
      phone: "+1 (555) 345-6789",
      specialization: "Cognitive Behavioral Therapy",
      certification: "Licensed Professional Counselor",
      status: "active",
      joinDate: "2020-01-10",
      lastActivity: "2024-06-01T16:45:00",
      avatar: "ER",
      experience: "12 years",
      clientsManaged: 312,
      successRate: 89,
      rating: 4.7,
      languages: ["English", "Spanish", "Portuguese"],
      availability: "Full-time",
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@smokefree.com",
      phone: "+1 (555) 456-7890",
      specialization: "Group Therapy",
      certification: "Master of Social Work",
      status: "active",
      joinDate: "2022-11-05",
      lastActivity: "2024-06-02T09:20:00",
      avatar: "JW",
      experience: "5 years",
      clientsManaged: 156,
      successRate: 85,
      rating: 4.6,
      languages: ["English"],
      availability: "Full-time",
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      email: "lisa.thompson@smokefree.com",
      phone: "+1 (555) 567-8901",
      specialization: "Mindfulness Therapy",
      certification: "Licensed Clinical Psychologist",
      status: "inactive",
      joinDate: "2019-05-18",
      lastActivity: "2024-05-28T13:10:00",
      avatar: "LT",
      experience: "15 years",
      clientsManaged: 278,
      successRate: 94,
      rating: 4.9,
      languages: ["English", "French"],
      availability: "Sabbatical",
    },
    {
      id: 6,
      name: "Robert Kim",
      email: "robert.kim@smokefree.com",
      phone: "+1 (555) 678-9012",
      specialization: "Motivational Interviewing",
      certification: "Certified Tobacco Treatment Specialist",
      status: "active",
      joinDate: "2023-02-28",
      lastActivity: "2024-06-02T12:45:00",
      avatar: "RK",
      experience: "4 years",
      clientsManaged: 98,
      successRate: 88,
      rating: 4.5,
      languages: ["English", "Korean"],
      availability: "Part-time",
    },
  ]);

  // Filter coaches based on search and filters
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const matchesSearch =
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialization.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization =
        specializationFilter === "all" ||
        coach.specialization
          .toLowerCase()
          .includes(specializationFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || coach.status === statusFilter;

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  }, [coaches, searchTerm, specializationFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCoaches = filteredCoaches.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Stats calculation
  const stats = useMemo(() => {
    const total = coaches.length;
    const active = coaches.filter((c) => c.status === "active").length;
    const inactive = coaches.filter((c) => c.status === "inactive").length;
    const avgSuccessRate = Math.round(
      coaches.reduce((sum, c) => sum + c.successRate, 0) / coaches.length
    );
    const totalClients = coaches.reduce((sum, c) => sum + c.clientsManaged, 0);

    return { total, active, inactive, avgSuccessRate, totalClients };
  }, [coaches]);

  // Helper functions
  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getSpecializationColor = (specialization) => {
    const colors = {
      "Addiction Counseling": "addiction",
      "Behavioral Therapy": "behavioral",
      "Cognitive Behavioral Therapy": "cognitive",
      "Group Therapy": "group",
      "Mindfulness Therapy": "mindfulness",
      "Motivational Interviewing": "motivational",
    };
    return colors[specialization] || "default";
  };

  const getStatusColor = (status) => {
    return status === "active" ? "active" : "inactive";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpecializationFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Coaches Management</h1>
          <p>Manage certified coaches and their specializations</p>
        </div>
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={`${styles.statChange} ${styles.neutral}`}>
            <span>→</span> Professional coaches
          </div>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Currently available
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Avg Success Rate</span>
            <div className={`${styles.statIcon} ${styles.success}`}>
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.avgSuccessRate}%</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Excellent performance
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Clients</span>
            <div className={`${styles.statIcon} ${styles.clients}`}>
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
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalClients}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Clients managed
          </div>
        </div>
      </div>{" "}
      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>Filter & Search Coaches</h3>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Coaches</label>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Specialization</label>
            <select
              className={styles.filterSelect}
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="all">All Specializations</option>
              <option value="addiction">Addiction Counseling</option>
              <option value="behavioral">Behavioral Therapy</option>
              <option value="cognitive">Cognitive Behavioral</option>
              <option value="group">Group Therapy</option>
              <option value="mindfulness">Mindfulness Therapy</option>
              <option value="motivational">Motivational Interviewing</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>&nbsp;</label>
            <button className={styles.clearButton} onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
      {/* Coaches Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>
            Coaches ({filteredCoaches.length})
          </h3>
          <div className={styles.tableActions}>
            <button className={styles.exportButton}>
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {paginatedCoaches.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
              <tr>
                <th>Coach</th>
                <th>Contact</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Clients</th>
                <th>Success Rate</th>
                <th>Rating</th>
                <th>Last Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {paginatedCoaches.map((coach) => (
                <tr key={coach.id}>
                  <td>
                    <div className={styles.coachInfo}>
                      <div className={styles.coachAvatar}>{coach.avatar}</div>
                      <div className={styles.coachDetails}>
                        <h4>{coach.name}</h4>
                        <p>{coach.certification}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{coach.email}</div>
                      <div className={styles.phoneNumber}>{coach.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.specializationBadge} ${
                        styles[getSpecializationColor(coach.specialization)]
                      }`}
                    >
                      {coach.specialization}
                    </span>
                  </td>
                  <td>
                    <div className={styles.experienceInfo}>
                      <span className={styles.experienceValue}>
                        {coach.experience}
                      </span>
                      <span className={styles.availabilityLabel}>
                        {coach.availability}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.clientsCount}>
                      {coach.clientsManaged}
                    </div>
                  </td>
                  <td>
                    <div className={styles.successRate}>
                      <span className={styles.rateValue}>
                        {coach.successRate}%
                      </span>
                      <div className={styles.rateBar}>
                        <div
                          className={styles.rateFill}
                          style={{ width: `${coach.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.rating}>
                      <span className={styles.ratingValue}>{coach.rating}</span>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            width="12"
                            height="12"
                            fill={
                              i < Math.floor(coach.rating)
                                ? "#fbbf24"
                                : "#e5e7eb"
                            }
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.lastActivity}>
                      <span>{formatLastActivity(coach.lastActivity)}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[getStatusColor(coach.status)]
                      }`}
                    >
                      {coach.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.view}`}
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
                        className={`${styles.actionButton} ${styles.edit}`}
                        title="Edit Coach"
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
                        className={`${styles.actionButton} ${styles.assign}`}
                        title="Assign Clients"
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
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
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3>No coaches found</h3>
            <p>No coaches match your current search criteria.</p>
            <button className={styles.addButton} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredCoaches.length > itemsPerPage && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredCoaches.length)} of{" "}
              {filteredCoaches.length} coaches
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`${styles.paginationButton} ${
                      currentPage === page ? styles.active : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className={styles.paginationButton}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachesPage;
