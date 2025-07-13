import PropTypes from "prop-types";
import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMembers } from "@/redux/slices/membersSlice";
import { fetchAllPackages } from "@/redux/slices/packagesSlice";
import { fetchAllBadges } from "@/redux/slices/badgesSlice";
import { isToday, isYesterday } from "@/utils/dateHelpers";
import { setDashboardLoadedOnce } from "@/redux/slices/membersSlice";
import { ReportsModal } from "../index";

const MetricCard = ({ title, value, change, icon, trend }) => (
  <div className={styles.metricCard}>
    <div className={styles.metricHeader}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={`${styles.metricTrend} ${styles[trend]}`}>
        <span>{change}</span>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {trend === "up" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l5-5 5 5M7 7l5 5 5-5"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7l5 5 5-5M7 17l5-5 5 5"
            />
          )}
        </svg>
      </div>
    </div>
    <div className={styles.metricValue}>{value}</div>
    <div className={styles.metricTitle}>{title}</div>
  </div>
);

// PropTypes definitions
MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  trend: PropTypes.oneOf(["up", "down"]).isRequired,
};

const PatientCard = ({ name, status, lastSession, progress, avatar }) => (
  <div className={styles.patientCard}>
    <div className={styles.patientHeader}>
      <div className={styles.patientAvatar}>{avatar || name.charAt(0)}</div>
      <div className={styles.patientInfo}>
        <h4 className={styles.patientName}>{name}</h4>
        <span
          className={`${styles.patientStatus} ${styles[status.toLowerCase()]}`}
        >
          {status}
        </span>
      </div>
    </div>
    <div className={styles.patientProgress}>
      <div className={styles.progressLabel}>
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
    <div className={styles.patientFooter}>
      <span className={styles.lastSession}>Last session: {lastSession}</span>
    </div>
  </div>
);

PatientCard.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  lastSession: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  avatar: PropTypes.node, // Accepts JSX for custom avatar
};

const STALE_TIME = 5 * 60 * 1000; // 5 minutes in ms

const Dashboard = () => {
  const dispatch = useDispatch();
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const membersState = useSelector((state) => state.members);
  const packagesState = useSelector((state) => state.packages);
  const badgesState = useSelector((state) => state.badges);

  // Debug logs for state
  console.log("membersState:", membersState);
  console.log("packagesState:", packagesState);
  console.log("badgesState:", badgesState);

  useEffect(() => {
    const now = Date.now();
    // Only fetch if missing or stale
    if (
      !membersState.members ||
      membersState.members.length === 0 ||
      !membersState.lastFetch ||
      now - new Date(membersState.lastFetch).getTime() > STALE_TIME
    ) {
      dispatch(fetchAllMembers());
    }
    if (
      !packagesState.packages ||
      packagesState.packages.length === 0 ||
      !packagesState.lastFetch ||
      now - new Date(packagesState.lastFetch).getTime() > STALE_TIME
    ) {
      dispatch(fetchAllPackages());
    }
    if (
      !badgesState.badges ||
      badgesState.badges.length === 0 ||
      !badgesState.lastFetch ||
      now - new Date(badgesState.lastFetch).getTime() > STALE_TIME
    ) {
      dispatch(fetchAllBadges());
    }
  }, [
    dispatch,
    membersState.members,
    membersState.lastFetch,
    packagesState.packages,
    packagesState.lastFetch,
    badgesState.badges,
    badgesState.lastFetch,
  ]);

  // Metrics
  const totalPatients = membersState.members?.length || 0;
  const activeSessions =
    packagesState.packages?.filter((pkg) => pkg.status === "active").length ||
    0;
  // Appointments: fetch from consultations API
  const [appointments, setAppointments] = useState(0);

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/user/get-all-consultations");
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.consultations?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments(0);
      }
    };

    fetchAppointments();
  }, []);

  // Active Badges: total count for display
  const activeBadges = (badgesState.badges || []).filter(
    (b) => b.status === "active"
  ).length;

  // Total Patients: change = new patients today
  const newPatientsToday = (membersState.members || []).filter((m) =>
    isToday(m.joinDate || m.dateCreated)
  ).length;
  const totalPatientsChange =
    newPatientsToday > 0 ? `+${newPatientsToday}` : "+0";

  // Active Packages: change = active today - active yesterday
  const activePackagesToday = (packagesState.packages || []).filter(
    (pkg) =>
      pkg.status === "active" &&
      isToday(pkg.dateUpdated || pkg.updatedAt || pkg.dateCreated)
  ).length;
  const activePackagesYesterday = (packagesState.packages || []).filter(
    (pkg) =>
      pkg.status === "active" &&
      isYesterday(pkg.dateUpdated || pkg.updatedAt || pkg.dateCreated)
  ).length;
  const activePackagesChange = activePackagesToday - activePackagesYesterday;
  const activePackagesChangeStr =
    (activePackagesChange >= 0 ? "+" : "") + activePackagesChange;

  // Active Badges: change = active today - active yesterday
  const activeBadgesToday = (badgesState.badges || []).filter(
    (b) =>
      b.status === "active" &&
      isToday(b.dateUpdated || b.updatedAt || b.dateCreated)
  ).length;
  const activeBadgesYesterday = (badgesState.badges || []).filter(
    (b) =>
      b.status === "active" &&
      isYesterday(b.dateUpdated || b.updatedAt || b.dateCreated)
  ).length;
  const activeBadgesChange = activeBadgesToday - activeBadgesYesterday;
  const activeBadgesChangeStr =
    (activeBadgesChange >= 0 ? "+" : "") + activeBadgesChange;

  // Recent Patients: show up to 6 most recently joined members
  const recentPatients = (membersState.members || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.joinDate || b.dateCreated) -
        new Date(a.joinDate || a.dateCreated)
    )
    .slice(0, 6)
    .map((member) => ({
      name: member.fullName || member.name || member.username || "Unknown",
      status: member.status
        ? member.status.charAt(0).toUpperCase() + member.status.slice(1)
        : "Active",
      lastSession:
        member.lastSession ||
        member.lastLogin ||
        member.dateUpdated ||
        member.dateCreated ||
        "-",
      progress: member.progress || 0,
      avatar: (
        <div
          style={{
            width: "48px",
            minWidth: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: "1.125rem",
            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
            aspectRatio: "1 / 1",
          }}
        >
          {(member.fullName || member.name || "Unknown")
            .charAt(0)
            .toUpperCase()}
        </div>
      ),
    }));

  // New Enrollments: members joined in the last 7 days
  const now = new Date();
  const newEnrollments = (membersState.members || []).filter((m) => {
    const join = new Date(m.joinDate || m.dateCreated);
    return (now - join) / (1000 * 60 * 60 * 24) <= 7;
  }).length;
  // Milestones Reached: total number of badges awarded (sum of memberCount for all badges)
  const milestonesReached = (badgesState.badges || []).reduce(
    (sum, badge) => sum + (badge.memberCount || 0),
    0
  );

  // Robust loading: show loading only on first load
  const isMembersReady =
    !membersState.loading && membersState.members?.length > 0;
  const isPackagesReady =
    !packagesState.loading && packagesState.packages?.length > 0;
  const isBadgesReady = !badgesState.loading && badgesState.badges?.length > 0;

  useEffect(() => {
    if (
      isMembersReady &&
      isPackagesReady &&
      isBadgesReady &&
      !membersState.dashboardLoadedOnce
    ) {
      dispatch(setDashboardLoadedOnce(true));
    }
  }, [
    isMembersReady,
    isPackagesReady,
    isBadgesReady,
    membersState.dashboardLoadedOnce,
    dispatch,
  ]);

  if (
    !membersState.dashboardLoadedOnce &&
    (!isMembersReady || !isPackagesReady || !isBadgesReady)
  ) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>Good morning, Admin! 👋</h1>
          <p className={styles.welcomeSubtitle}>
            Here&apos;s what&apos;s happening with your smoking cessation
            program today.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => setIsReportsModalOpen(true)}
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Reports
          </button>
        </div>
      </div>
      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Members"
          value={totalPatients}
          change={totalPatientsChange}
          trend={newPatientsToday >= 0 ? "up" : "down"}
          icon={
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Active Packages"
          value={activeSessions}
          change={activePackagesChangeStr}
          trend={activePackagesChange >= 0 ? "up" : "down"}
          icon={
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
          }
        />
        <MetricCard
          title="Active Badges"
          value={activeBadges}
          change={activeBadgesChangeStr}
          trend={activeBadgesChange >= 0 ? "up" : "down"}
          icon={
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Appointments"
          value={appointments}
          change={"+0"}
          trend="up"
          icon={
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>
      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Patients */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Members</h2>
            <button className={styles.viewAllButton}>View All</button>
          </div>
          <div className={styles.patientsList}>
            {recentPatients.map((patient, index) => (
              <PatientCard key={index} {...patient} />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Today&apos;s Overview</h2>
          </div>
          <div className={styles.quickStats}>
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <div className={styles.quickStatValue}>{newEnrollments}</div>
                <div className={styles.quickStatLabel}>New Enrollments</div>
              </div>
            </div>
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <div className={styles.quickStatValue}>{milestonesReached}</div>
                <div className={styles.quickStatLabel}>Milestones Reached</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
