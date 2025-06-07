import { useState } from "react";
import styles from "./Members.module.css";

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for members
  const members = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      joinDate: "2024-01-15",
      status: "active",
      quitDate: "2024-02-01",
      progress: 85,
      smokeFreeDays: 45,
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 987-6543",
      joinDate: "2024-02-20",
      status: "active",
      quitDate: "2024-03-01",
      progress: 92,
      smokeFreedays: 30,
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1 (555) 456-7890",
      joinDate: "2024-01-10",
      status: "inactive",
      quitDate: "2024-01-25",
      progress: 45,
      smokeFreedays: 15,
      avatar: null,
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusClass =
      status === "active" ? styles.statusActive : styles.statusInactive;
    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
    );
  };

  const getProgressBar = (progress) => (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className={styles.progressText}>{progress}%</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Members Management</h1>
          <p>Manage and track all platform members</p>
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
            Add Member
          </button>
        </div>
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
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Smoke-Free Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberId}>ID: {member.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.contactInfo}>
                    <div>{member.email}</div>
                    <div className={styles.phoneNumber}>{member.phone}</div>
                  </div>
                </td>
                <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                <td>{getStatusBadge(member.status)}</td>
                <td>{getProgressBar(member.progress)}</td>
                <td>
                  <div className={styles.smokeFreeInfo}>
                    <span className={styles.daysCount}>
                      {member.smokeFreedays || member.smokeFreedays}
                    </span>
                    <span className={styles.daysLabel}>days</span>
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
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
                    <button className={styles.actionButton} title="Edit">
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
                    <button className={styles.actionButton} title="Delete">
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

      {filteredMembers.length === 0 && (
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
          <h3>No members found</h3>
          <p>Try adjusting your search criteria or add new members</p>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
