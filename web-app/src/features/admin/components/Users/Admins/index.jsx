import { useState, useMemo } from "react";
import styles from "./Admins.module.css";

const AdminsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock admins data
  const [admins] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@smokefree.com",
      phone: "+1 (555) 123-4567",
      role: "Super Admin",
      department: "Technology",
      status: "active",
      joinDate: "2019-01-15",
      lastLogin: "2024-06-02T10:30:00",
      avatar: "JS",
      permissions: ["all"],
      sessionsManaged: 1250,
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@smokefree.com",
      phone: "+1 (555) 234-5678",
      role: "Content Admin",
      department: "Content Management",
      status: "active",
      joinDate: "2020-03-20",
      lastLogin: "2024-06-02T09:15:00",
      avatar: "MG",
      permissions: ["content", "users"],
      sessionsManaged: 890,
    },
    {
      id: 3,
      name: "David Wilson",
      email: "david.wilson@smokefree.com",
      phone: "+1 (555) 345-6789",
      role: "User Admin",
      department: "User Management",
      status: "active",
      joinDate: "2020-07-10",
      lastLogin: "2024-06-01T16:45:00",
      avatar: "DW",
      permissions: ["users", "reports"],
      sessionsManaged: 720,
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@smokefree.com",
      phone: "+1 (555) 456-7890",
      role: "Analytics Admin",
      department: "Data Analytics",
      status: "active",
      joinDate: "2021-02-14",
      lastLogin: "2024-06-02T08:20:00",
      avatar: "SJ",
      permissions: ["analytics", "reports"],
      sessionsManaged: 450,
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.brown@smokefree.com",
      phone: "+1 (555) 567-8901",
      role: "Content Admin",
      department: "Content Management",
      status: "inactive",
      joinDate: "2021-09-05",
      lastLogin: "2024-05-28T14:30:00",
      avatar: "MB",
      permissions: ["content"],
      sessionsManaged: 320,
    },
  ]);

  // Filter admins based on search and filters
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || admin.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter((a) => a.status === "active").length;
    const inactiveAdmins = admins.filter((a) => a.status === "inactive").length;
    const superAdmins = admins.filter((a) => a.role === "Super Admin").length;

    return {
      total: totalAdmins,
      active: activeAdmins,
      inactive: inactiveAdmins,
      superAdmins,
    };
  }, [admins]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getActiveFilters = () => {
    const filters = [];
    if (roleFilter !== "all") filters.push({ type: "role", value: roleFilter });
    if (statusFilter !== "all")
      filters.push({ type: "status", value: statusFilter });
    return filters;
  };

  const removeFilter = (filterType) => {
    if (filterType === "role") setRoleFilter("all");
    if (filterType === "status") setStatusFilter("all");
    setCurrentPage(1);
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Super Admin":
        return "superAdmin";
      case "Content Admin":
        return "contentAdmin";
      case "User Admin":
        return "userAdmin";
      case "Analytics Admin":
        return "analyticsAdmin";
      default:
        return "default";
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Admins Management</h1>
          <p>Manage administrative users and their permissions</p>
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
            <span>→</span> No change this month
          </div>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> {Math.round((stats.active / stats.total) * 100)}%
            active
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Inactive Admins</span>
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.inactive}</div>
          <div className={`${styles.statChange} ${styles.neutral}`}>
            <span>→</span> Monitoring required
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Super Admins</span>
            <div className={`${styles.statIcon} ${styles.superAdmin}`}>
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.superAdmins}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <span>↗</span> Full access level
          </div>
        </div>
      </div>{" "}
      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>Filter & Search Admins</h3>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Admins</label>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Role</label>
            <select
              className={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Content Admin">Content Admin</option>
              <option value="User Admin">User Admin</option>
              <option value="Analytics Admin">Analytics Admin</option>
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

        {getActiveFilters().length > 0 && (
          <div className={styles.activeFilters}>
            {getActiveFilters().map((filter, index) => (
              <span key={index} className={styles.filterTag}>
                {filter.type}: {filter.value}
                <button onClick={() => removeFilter(filter.type)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Admins Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>
            Admins ({filteredAdmins.length})
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
          </div>        </div>

        {paginatedAdmins.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
              <tr>
                <th>Admin</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Department</th>
                <th>Permissions</th>
                <th>Last Login</th>
                <th>Sessions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className={styles.adminInfo}>
                      <div className={styles.adminAvatar}>{admin.avatar}</div>
                      <div className={styles.adminDetails}>
                        <h4>{admin.name}</h4>
                        <p>
                          Joined {new Date(admin.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{admin.email}</div>
                      <div className={styles.phoneNumber}>{admin.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${
                        styles[getRoleColor(admin.role)]
                      }`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td>{admin.department}</td>
                  <td>
                    <div className={styles.permissions}>
                      {admin.permissions.map((permission, index) => (
                        <span key={index} className={styles.permissionTag}>
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className={styles.lastLogin}>
                      <span>{formatLastLogin(admin.lastLogin)}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.sessionsCount}>
                      {admin.sessionsManaged.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[admin.status]
                      }`}
                    >
                      {admin.status}
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
                        title="Edit Admin"
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
                        className={`${styles.actionButton} ${styles.permissions}`}
                        title="Manage Permissions"
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3>No admins found</h3>
            <p>No admins match your current search criteria.</p>
            <button className={styles.addButton} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredAdmins.length > itemsPerPage && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of{" "}
              {filteredAdmins.length} admins
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

export default AdminsPage;
