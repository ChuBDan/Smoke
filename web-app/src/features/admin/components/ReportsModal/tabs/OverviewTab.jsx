import { useSelector } from "react-redux";
import { useMemo } from "react";
import styles from "./OverviewTab.module.css";
import { formatCurrency } from "@/utils/format";
import { isThisMonth, isThisWeek } from "@/utils/dateHelpers";

const OverviewTab = () => {
  const membersState = useSelector((state) => state.members);
  const packagesState = useSelector((state) => state.packages);
  const badgesState = useSelector((state) => state.badges);

  const members = useMemo(
    () => membersState.members || [],
    [membersState.members]
  );
  const packages = useMemo(
    () => packagesState.packages || [],
    [packagesState.packages]
  );
  const badges = useMemo(() => badgesState.badges || [], [badgesState.badges]);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    // User metrics
    const totalUsers = members.length;
    const activeUsers = members.filter((m) => m.status === "active").length;
    const newUsersThisMonth = members.filter((m) =>
      isThisMonth(m.joinDate || m.dateCreated)
    ).length;
    const newUsersThisWeek = members.filter((m) =>
      isThisWeek(m.joinDate || m.dateCreated)
    ).length;

    // Package metrics
    const totalPackages = packages.length;
    const activePackages = packages.filter((p) => p.status === "active").length;
    // No completedPackages/completionRate for packages
    const totalRevenue = packages.reduce(
      (sum, pkg) => sum + (Number(pkg.price) || 0) * (pkg.memberCount || 0),
      0
    );
    const monthlyRevenue = packages
      .filter((pkg) => isThisMonth(pkg.dateCreated))
      .reduce(
        (sum, pkg) => sum + (Number(pkg.price) || 0) * (pkg.memberCount || 0),
        0
      );

    // Badge metrics
    const totalBadges = badges.length;
    const activeBadges = badges.filter((b) => b.status === "active").length;
    const totalBadgesAwarded = badges.reduce(
      (sum, badge) => sum + (badge.memberCount || 0),
      0
    );

    // User retention rate
    const userRetentionRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Active package rate
    const activePackageRate =
      totalPackages > 0 ? (activePackages / totalPackages) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalPackages,
      activePackages,
      totalRevenue,
      monthlyRevenue,
      totalBadges,
      activeBadges,
      totalBadgesAwarded,
      userRetentionRate,
      activePackageRate,
    };
  }, [members, packages, badges]);

  // Growth trends (simplified)
  const growthData = useMemo(() => {
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthUsers = members.filter((m) => {
        const joinDate = new Date(m.joinDate || m.dateCreated);
        return joinDate >= monthStart && joinDate <= monthEnd;
      }).length;

      const monthPackages = packages.filter((p) => {
        const createDate = new Date(p.dateCreated);
        return createDate >= monthStart && createDate <= monthEnd;
      }).length;

      last6Months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        users: monthUsers,
        packages: monthPackages,
      });
    }

    return last6Months;
  }, [members, packages]);

  return (
    <div className={styles.overviewContainer}>
      {/* Key Metrics Cards */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Key Performance Indicators
        </h3>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
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
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{metrics.totalUsers}</div>
              <div className={styles.metricLabel}>Total Members</div>
              <div className={styles.metricChange}>
                +{metrics.newUsersThisMonth} this month
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
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
                  d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                />
              </svg>
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{metrics.activePackages}</div>
              <div className={styles.metricLabel}>Active Packages</div>
              {/* No completion rate shown */}
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className={styles.metricLabel}>Total Revenue</div>
              <div className={styles.metricChange}>
                {formatCurrency(metrics.monthlyRevenue)} this month
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {metrics.totalBadgesAwarded}
              </div>
              <div className={styles.metricLabel}>Badges Awarded</div>
              <div className={styles.metricChange}>
                {metrics.activeBadges} active badge types
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Success Metrics
        </h3>

        <div className={styles.successGrid}>
          <div className={styles.successCard}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className={styles.successTitle}>Active Package Rate</div>
            </div>
            <div className={styles.successValue}>
              {metrics.activePackageRate.toFixed(1)}%
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${metrics.activePackageRate}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.successCard}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className={styles.successTitle}>User Retention</div>
            </div>
            <div className={styles.successValue}>
              {metrics.userRetentionRate.toFixed(1)}%
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${metrics.userRetentionRate}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.successCard}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>
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
              <div className={styles.successTitle}>Growth Rate</div>
            </div>
            <div className={styles.successValue}>
              {metrics.newUsersThisMonth > 0
                ? `+${(
                    (metrics.newUsersThisMonth /
                      Math.max(
                        metrics.totalUsers - metrics.newUsersThisMonth,
                        1
                      )) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(
                    (metrics.newUsersThisMonth /
                      Math.max(metrics.totalUsers, 1)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          6-Month Growth Trends
        </h3>

        <div className={styles.trendsContainer}>
          <div className={styles.trendChart}>
            {growthData.map((data, index) => (
              <div key={index} className={styles.trendBar}>
                <div className={styles.barContainer}>
                  <div
                    className={styles.userBar}
                    style={{
                      height: `${
                        (data.users /
                          Math.max(...growthData.map((d) => d.users), 1)) *
                        100
                      }%`,
                    }}
                  >
                    <div className={styles.barTooltip}>
                      <div>{data.users} users</div>
                      <div>{data.packages} packages</div>
                    </div>
                  </div>
                  <div
                    className={styles.packageBar}
                    style={{
                      height: `${
                        (data.packages /
                          Math.max(...growthData.map((d) => d.packages), 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className={styles.trendLabel}>{data.month}</div>
              </div>
            ))}
          </div>

          <div className={styles.trendLegend}>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ background: "#3b82f6" }}
              ></div>
              <span>New Users</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ background: "#10b981" }}
              ></div>
              <span>New Packages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Quick Insights
        </h3>

        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
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
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <h4>Strong Growth</h4>
              <p>
                {metrics.newUsersThisMonth} new users joined this month, showing{" "}
                {metrics.newUsersThisWeek} just this week.
              </p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
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
            </div>
            <div className={styles.insightContent}>
              <h4>High Engagement</h4>
              <p>
                Your program has a high number of active users and packages,
                indicating strong engagement and effectiveness.
              </p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <h4>Revenue Performance</h4>
              <p>
                {formatCurrency(metrics.monthlyRevenue)} generated this month
                from {""}
                {metrics.activePackages} active packages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
