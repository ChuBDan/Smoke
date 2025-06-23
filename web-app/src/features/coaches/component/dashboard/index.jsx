import PropTypes from "prop-types";
import styles from "./Dashboard.module.css";

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
  avatar: PropTypes.string,
};

const Dashboard = () => {
  const recentPatients = [
    {
      name: "John Smith",
      status: "Active",
      lastSession: "2 hours ago",
      progress: 75,
      avatar: "👨",
    },
    {
      name: "Sarah Johnson",
      status: "Active",
      lastSession: "1 day ago",
      progress: 60,
      avatar: "👩",
    },
    {
      name: "Mike Davis",
      status: "Pending",
      lastSession: "3 days ago",
      progress: 45,
      avatar: "👨",
    },
    {
      name: "Emily Brown",
      status: "Completed",
      lastSession: "1 week ago",
      progress: 100,
      avatar: "👩",
    },
    {
      name: "David Wilson",
      status: "Active",
      lastSession: "5 hours ago",
      progress: 82,
      avatar: "👨",
    },
    {
      name: "Lisa Martinez",
      status: "Active",
      lastSession: "12 hours ago",
      progress: 68,
      avatar: "👩",
    },
  ];
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
          <button className={styles.primaryButton}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Patient
          </button>
          <button className={styles.secondaryButton}>
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
          title="Total Patients"
          value="1,247"
          change="+12%"
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Active Sessions"
          value="89"
          change="+8%"
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Success Rate"
          value="82%"
          change="+5%"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Avg. Days Smoke-Free"
          value="52"
          change="+15%"
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
            <h2 className={styles.sectionTitle}>Recent Patients</h2>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className={styles.quickStatValue}>18</div>
                <div className={styles.quickStatLabel}>Scheduled Sessions</div>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <div className={styles.quickStatValue}>7</div>
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
                <div className={styles.quickStatValue}>12</div>
                <div className={styles.quickStatLabel}>Milestones Reached</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
