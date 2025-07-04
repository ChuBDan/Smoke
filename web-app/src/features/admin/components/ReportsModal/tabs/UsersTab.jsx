import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import styles from "./UsersTab.module.css";
import { isThisMonth, isThisWeek } from "@/utils/dateHelpers";

const UsersTab = () => {
  const [selectedView, setSelectedView] = useState("overview");
  const membersState = useSelector((state) => state.members);
  const coachesState = useSelector((state) => state.coaches);
  const adminsState = useSelector((state) => state.admins);

  const members = useMemo(
    () =>
      (membersState.members || []).filter(
        (member) => member.status !== "deleted" && !member.isDeleted
      ),
    [membersState.members]
  );
  const coaches = useMemo(
    () =>
      (coachesState.coaches || []).filter(
        (coach) => coach.status !== "deleted" && !coach.isDeleted
      ),
    [coachesState.coaches]
  );
  const admins = useMemo(
    () =>
      (adminsState.admins || []).filter(
        (admin) => admin.status !== "deleted" && !admin.isDeleted
      ),
    [adminsState.admins]
  );

  // User analytics
  const analytics = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "active").length;
    const newMembersThisMonth = members.filter((m) =>
      isThisMonth(m.joinDate || m.dateCreated)
    ).length;
    const newMembersThisWeek = members.filter((m) =>
      isThisWeek(m.joinDate || m.dateCreated)
    ).length;

    const totalCoaches = coaches.length;
    const activeCoaches = coaches.filter((c) => c.status === "active").length;

    const totalAdmins = admins.length;

    // User retention rate
    const retentionRate =
      totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

    // Growth rate
    const growthRate =
      totalMembers > newMembersThisMonth
        ? (newMembersThisMonth / (totalMembers - newMembersThisMonth)) * 100
        : 0;

    return {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      newMembersThisWeek,
      totalCoaches,
      activeCoaches,
      totalAdmins,
      retentionRate,
      growthRate,
    };
  }, [members, coaches, admins]);

  // User distribution by status
  const membersByStatus = useMemo(() => {
    const statusCounts = members.reduce((acc, member) => {
      const status = member.status || "active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage:
        analytics.totalMembers > 0
          ? ((count / analytics.totalMembers) * 100).toFixed(1)
          : 0,
    }));
  }, [members, analytics.totalMembers]);

  // Recent members (last 10)
  const recentMembers = useMemo(() => {
    return members
      .slice()
      .sort(
        (a, b) =>
          new Date(b.joinDate || b.dateCreated) -
          new Date(a.joinDate || a.dateCreated)
      )
      .slice(0, 10)
      .map((member) => ({
        id: member.id,
        name: member.fullName || member.name || member.username || "Unknown",
        email: member.email || "No email",
        joinDate: member.joinDate || member.dateCreated,
        status: member.status || "active",
        progress: member.progress || 0,
      }));
  }, [members]);

  // Monthly registration trends (robust - always returns 6 months with 0 for empty months)
  const registrationTrends = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthMembers = members.filter((m) => {
        const joinDate = new Date(m.joinDate || m.dateCreated);
        return joinDate >= monthStart && joinDate <= monthEnd;
      });

      const monthCoaches = coaches.filter((c) => {
        const joinDate = new Date(c.joinDate || c.dateCreated);
        return joinDate >= monthStart && joinDate <= monthEnd;
      });

      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        members: monthMembers.length,
        coaches: monthCoaches.length,
        activeMembers: monthMembers.filter((m) => m.status === "active").length,
        totalUsers: monthMembers.length + monthCoaches.length,
      });
    }

    return months;
  }, [members, coaches]);

  const views = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      id: "members",
      label: "Members",
      icon: (
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
      ),
    },
    {
      id: "trends",
      label: "Trends",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5,14H7V19H5V14M10,10H12V19H10V10M15,6H17V19H15V6M20,2V4H4V2H20M21,5H3V20A1,1 0 0,0 4,21H20A1,1 0 0,0 21,20V5Z" />
        </svg>
      ),
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#64748b";
      case "pending":
        return "#f59e0b";
      case "suspended":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  return (
    <div className={styles.usersContainer}>
      {/* User Overview */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
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
          User Overview
        </h3>

        <div className={styles.overviewCards}>
          <div className={styles.mainCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
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
              <div className={styles.growthBadge}>
                +{analytics.newMembersThisWeek} this week
              </div>
            </div>
            <div className={styles.cardValue}>{analytics.totalMembers}</div>
            <div className={styles.cardLabel}>Total Members</div>
          </div>

          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
            </div>
            <div className={styles.cardValue}>{analytics.activeMembers}</div>
            <div className={styles.cardLabel}>Active Members</div>
          </div>

          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,2A3,3 0 0,1 15,5V7A3,3 0 0,1 12,10A3,3 0 0,1 9,7V5A3,3 0 0,1 12,2M21,22H3V20C3,17.79 4.69,16 6.75,16H17.25C19.31,16 21,17.79 21,20V22Z" />
              </svg>
            </div>
            <div className={styles.cardValue}>{analytics.totalCoaches}</div>
            <div className={styles.cardLabel}>Coaches</div>
          </div>

          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.1,7 14,7.9 14,9C14,10.1 13.1,11 12,11C10.9,11 10,10.1 10,9C10,7.9 10.9,7 12,7M12,13C13.5,13 16,13.75 16,15.25V17H8V15.25C8,13.75 10.5,13 12,13Z" />
              </svg>
            </div>
            <div className={styles.cardValue}>{analytics.totalAdmins}</div>
            <div className={styles.cardLabel}>Administrators</div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className={styles.section}>
        <div className={styles.viewSelector}>
          {views.map((view) => (
            <button
              key={view.id}
              className={`${styles.viewButton} ${
                selectedView === view.id ? styles.active : ""
              }`}
              onClick={() => setSelectedView(view.id)}
            >
              <span className={styles.viewIcon}>{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        {/* Overview View */}
        {selectedView === "overview" && (
          <div className={styles.viewContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5,14H7V19H5V14M10,10H12V19H10V10M15,6H17V19H15V6M20,2V4H4V2H20M21,5H3V20A1,1 0 0,0 4,21H20A1,1 0 0,0 21,20V5Z" />
                    </svg>
                  </div>
                  <div className={styles.statsTitle}>Growth Rate</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.growthRate.toFixed(1)}%
                </div>
                <div className={styles.statsSubtext}>Monthly growth</div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
                    </svg>
                  </div>
                  <div className={styles.statsTitle}>Retention Rate</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.retentionRate.toFixed(1)}%
                </div>
                <div className={styles.statsSubtext}>User retention</div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                  </div>
                  <div className={styles.statsTitle}>New This Month</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.newMembersThisMonth}
                </div>
                <div className={styles.statsSubtext}>New registrations</div>
              </div>
            </div>

            <div className={styles.statusDistribution}>
              <h4>Member Status Distribution</h4>
              <div className={styles.statusList}>
                {membersByStatus.map((item, index) => (
                  <div key={index} className={styles.statusItem}>
                    <div className={styles.statusInfo}>
                      <div
                        className={styles.statusIndicator}
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      ></div>
                      <span className={styles.statusName}>{item.status}</span>
                    </div>
                    <div className={styles.statusStats}>
                      <span className={styles.statusCount}>{item.count}</span>
                      <span className={styles.statusPercentage}>
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members View */}
        {selectedView === "members" && (
          <div className={styles.viewContent}>
            <div className={styles.membersSection}>
              <h4>Recent Members ({recentMembers.length})</h4>
              <div className={styles.membersList}>
                {recentMembers.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberEmail}>{member.email}</div>
                      <div className={styles.memberJoined}>
                        Joined: {formatDate(member.joinDate)}
                      </div>
                    </div>
                    <div className={styles.memberStats}>
                      <div
                        className={styles.memberStatus}
                        style={{ color: getStatusColor(member.status) }}
                      >
                        {member.status?.charAt(0).toUpperCase() +
                          member.status?.slice(1)}
                      </div>
                      <div className={styles.memberProgress}>
                        <span>{member.progress}% progress</span>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${member.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends View */}
        {selectedView === "trends" && (
          <div className={styles.viewContent}>
            <div className={styles.trendsSection}>
              <h4>Registration Trends (Last 6 Months)</h4>
              <div className={styles.trendChart}>
                {registrationTrends.map((data, index) => {
                  const maxMembers = Math.max(
                    ...registrationTrends.map((d) => d.members),
                    1
                  );
                  const height =
                    maxMembers > 0 ? (data.members / maxMembers) * 100 : 0;

                  return (
                    <div key={index} className={styles.trendBar}>
                      <div
                        className={styles.memberBar}
                        style={{
                          height: `${Math.max(
                            height,
                            data.members > 0 ? 10 : 0
                          )}%`,
                          minHeight: data.members > 0 ? "20px" : "0px",
                        }}
                      >
                        <div className={styles.barTooltip}>
                          <div>{data.members} new members</div>
                          <div>{data.coaches} new coaches</div>
                          <div>{data.totalUsers} total</div>
                        </div>
                      </div>
                      <div className={styles.trendLabel}>{data.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.trendInsights}>
              <div className={styles.trendCard}>
                <div className={styles.trendIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Strong Growth</h5>
                  <p>
                    User registrations have increased by{" "}
                    {analytics.growthRate.toFixed(1)}% this month with{" "}
                    {analytics.newMembersThisWeek} new members this week.
                  </p>
                </div>
              </div>

              <div className={styles.trendCard}>
                <div className={styles.trendIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>High Retention</h5>
                  <p>
                    {analytics.retentionRate.toFixed(1)}% of users remain
                    active, indicating strong program engagement and
                    satisfaction.
                  </p>
                </div>
              </div>

              <div className={styles.trendCard}>
                <div className={styles.trendIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12,2A3,3 0 0,1 15,5V7A3,3 0 0,1 12,10A3,3 0 0,1 9,7V5A3,3 0 0,1 12,2M21,22H3V20C3,17.79 4.69,16 6.75,16H17.25C19.31,16 21,17.79 21,20V22Z" />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Quality Support</h5>
                  <p>
                    {analytics.totalCoaches} active coaches providing
                    personalized support to help members achieve their goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
