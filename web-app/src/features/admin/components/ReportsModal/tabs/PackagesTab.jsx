import { useSelector } from "react-redux";
import { useState, useMemo } from "react";
import styles from "./PackagesTab.module.css";
import { formatCurrency } from "@/utils/format";

const PackagesTab = () => {
  const [selectedView, setSelectedView] = useState("overview");
  const packagesState = useSelector((state) => state.packages);
  // Filter out deleted packages and only include valid packages
  const packages = (packagesState.packages || []).filter(
    (pkg) => pkg && pkg.status !== "deleted" && !pkg.isDeleted
  );

  // Only show data if packages exist
  // (Hooks must be called unconditionally, so move useMemo above this check)

  // Package analytics with only valid statuses
  const totalPackages = packages.length;
  const activePackages = packages.filter(
    (pkg) => pkg.status === "active"
  ).length;
  const nonActivePackages = totalPackages - activePackages;

  // Revenue from packages - try multiple date fields for when revenue was actually generated
  const totalRevenue = packages.reduce(
    (sum, pkg) => sum + (Number(pkg.price) || 0) * (pkg.memberCount || 0),
    0
  );

  // Monthly revenue calculation - revert to only using package creation date as proxy for revenue
  const monthlyRevenue = (() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return packages
      .filter((pkg) => {
        if (!pkg.dateCreated) return false;
        const pkgDate = new Date(pkg.dateCreated);
        return (
          pkgDate.getFullYear() === currentYear &&
          pkgDate.getMonth() === currentMonth
        );
      })
      .reduce(
        (sum, pkg) => sum + (Number(pkg.price) || 0) * (pkg.memberCount || 0),
        0
      );
  })();

  // Package types analysis (using packageName and actual revenue)
  const packageTypes = packages.reduce((acc, pkg) => {
    const type = pkg.packageName || pkg.name || pkg.title || "Standard Package";
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        revenue: 0,
        active: 0,
        nonActive: 0,
        memberCount: 0,
      };
    }
    acc[type].count++;
    acc[type].revenue += (Number(pkg.price) || 0) * (pkg.memberCount || 0);
    acc[type].memberCount += pkg.memberCount || 0;
    if (pkg.status === "active") acc[type].active++;
    else acc[type].nonActive++;
    return acc;
  }, {});

  // Real metrics based on available data
  const averagePackageValue =
    totalPackages > 0 ? totalRevenue / totalPackages : 0;
  const averageMembersPerPackage =
    totalPackages > 0
      ? packages.reduce((sum, pkg) => sum + (pkg.memberCount || 0), 0) /
        totalPackages
      : 0;
  const packageUtilizationRate =
    totalPackages > 0 ? (activePackages / totalPackages) * 100 : 0;

  // Monthly trends data (last 6 months, robust, revert to creation date only for revenue)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const monthPackages = packages.filter((pkg) => {
        // Use creation date since no purchase tracking exists
        const createdDate = pkg.dateCreated;
        if (!createdDate) return false;
        const pkgDate = new Date(createdDate);
        return pkgDate >= monthStart && pkgDate <= monthEnd;
      });
      // Calculate revenue for this month (only new packages created this month)
      const monthRevenue = monthPackages.reduce(
        (sum, pkg) => sum + (Number(pkg.price) || 0) * (pkg.memberCount || 0),
        0
      );
      const monthActive = monthPackages.filter(
        (pkg) => pkg.status === "active"
      ).length;
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        packages: monthPackages.length,
        revenue: monthRevenue,
        active: monthActive,
      });
    }
    return months;
  }, [packages]);

  // Calculate quarterly growth rate
  const quarterlyGrowthRate =
    monthlyData.length >= 3
      ? (((monthlyData[monthlyData.length - 1]?.packages || 0) -
          (monthlyData[monthlyData.length - 4]?.packages || 0)) /
          Math.max(monthlyData[monthlyData.length - 4]?.packages || 1, 1)) *
        100
      : 0;

  // Top performing packages
  const topPackages = Object.entries(packageTypes)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 6);

  const views = [
    {
      id: "overview",
      label: "Overview",
      icon: (
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
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      icon: (
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      id: "trends",
      label: "Trends",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.packagesContainer}>
      {/* Package Overview */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
            />
          </svg>
          Packages Management
        </h3>

        <div className={styles.overviewCards}>
          <div className={styles.mainCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
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
              <div className={styles.monthlyBadge}>{activePackages} active</div>
            </div>
            <div className={styles.cardValue}>{totalPackages}</div>
            <div className={styles.cardLabel}>Total Packages</div>
          </div>

          <div className={styles.overviewCard}>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className={styles.cardValue}>{activePackages}</div>
            <div className={styles.cardLabel}>Active Packages</div>
          </div>

          <div className={styles.overviewCard}>
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
            <div className={styles.cardValue}>
              {packages.reduce((sum, pkg) => sum + (pkg.memberCount || 0), 0)}
            </div>
            <div className={styles.cardLabel}>Total Members</div>
          </div>

          <div className={styles.overviewCard}>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className={styles.cardValue}>
              {formatCurrency(averagePackageValue)}
            </div>
            <div className={styles.cardLabel}>Avg. Value</div>
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
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <div className={styles.statusIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#10b981"
                  >
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <div className={styles.statusContent}>
                  <div className={styles.statusValue}>{activePackages}</div>
                  <div className={styles.statusLabel}>Active Packages</div>
                  <div className={styles.statusPercentage}>
                    {totalPackages > 0
                      ? ((activePackages / totalPackages) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusIcon}>
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
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-5-5m7.778-7.778A9 9 0 1021 12h-9"
                    />
                  </svg>
                </div>
                <div className={styles.statusContent}>
                  <div className={styles.statusValue}>{nonActivePackages}</div>
                  <div className={styles.statusLabel}>Non-Active</div>
                  <div className={styles.statusPercentage}>
                    {totalPackages > 0
                      ? ((nonActivePackages / totalPackages) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#10b981"
                  >
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                  </svg>
                </div>
                <div className={styles.statusContent}>
                  <div className={styles.statusValue}>
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className={styles.statusLabel}>Total Revenue</div>
                  <div className={styles.statusPercentage}>
                    {formatCurrency(monthlyRevenue)} this month
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.packageTypesGrid}>
              <h4>Package Types Distribution</h4>
              <div className={styles.typesList}>
                {Object.entries(packageTypes).map(([type, data]) => (
                  <div key={type} className={styles.typeItem}>
                    <div className={styles.typeInfo}>
                      <div className={styles.typeName}>{type}</div>
                      <div className={styles.typeStats}>
                        {data.count} packages • {data.active} active •{" "}
                        {data.nonActive} non-active
                      </div>
                    </div>
                    <div className={styles.typeRevenue}>
                      <div className={styles.revenueValue}>
                        {formatCurrency(data.revenue)}
                      </div>
                      <div className={styles.revenueAvg}>
                        {formatCurrency(data.revenue / data.count)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance View */}
        {selectedView === "performance" && (
          <div className={styles.viewContent}>
            <div className={styles.performanceGrid}>
              <div className={styles.metricsCard}>
                <h4>Key Performance Metrics</h4>
                <div className={styles.metricsList}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Active Packages</span>
                    <span className={styles.metricValue}>{activePackages}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>
                      Avg. Members/Package
                    </span>
                    <span className={styles.metricValue}>
                      {averageMembersPerPackage.toFixed(1)}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Average Value</span>
                    <span className={styles.metricValue}>
                      {formatCurrency(averagePackageValue)}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Utilization Rate</span>
                    <span className={styles.metricValue}>
                      {packageUtilizationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.topPackagesCard}>
                <h4>Top Performing Packages</h4>
                <div className={styles.topPackagesList}>
                  {topPackages.map(([name, data], index) => (
                    <div key={name} className={styles.topPackageItem}>
                      <div className={styles.packageRank}>#{index + 1}</div>
                      <div className={styles.packageDetails}>
                        <div className={styles.packageName}>{name}</div>
                        <div className={styles.packageMetrics}>
                          {data.count} created • {data.active} active •{" "}
                          {data.memberCount} members
                        </div>
                      </div>
                      <div className={styles.packageRevenue}>
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends View */}
        {selectedView === "trends" && (
          <div className={styles.viewContent}>
            <div className={styles.trendsSection}>
              <h4>Monthly Package Trends</h4>
              <div className={styles.trendChart}>
                {monthlyData.map((data, index) => {
                  const maxPackages = Math.max(
                    ...monthlyData.map((d) => d.packages),
                    1
                  );
                  const height =
                    maxPackages > 0 ? (data.packages / maxPackages) * 100 : 0;

                  return (
                    <div key={index} className={styles.trendBar}>
                      <div
                        className={styles.packageBar}
                        style={{
                          height: `${Math.max(
                            height,
                            data.packages > 0 ? 10 : 0
                          )}%`,
                          minHeight: data.packages > 0 ? "20px" : "0px",
                        }}
                      >
                        <div className={styles.barTooltip}>
                          <div>{data.packages} packages</div>
                          <div>{formatCurrency(data.revenue)}</div>
                          <div>{data.active} active</div>
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
                    <path d="M5,14H7V19H5V14M10,10H12V19H10V10M15,6H17V19H15V6M20,2V4H4V2H20M21,5H3V20A1,1 0 0,0 4,21H20A1,1 0 0,0 21,20V5Z" />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Growth Trend</h5>
                  <p>
                    Package sales have{" "}
                    {quarterlyGrowthRate >= 0 ? "increased" : "decreased"} by{" "}
                    {Math.abs(quarterlyGrowthRate).toFixed(1)}% over the last
                    quarter.
                  </p>
                </div>
              </div>

              <div className={styles.trendCard}>
                <div className={styles.trendIcon}>
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
                <div className={styles.trendContent}>
                  <h5>Active Packages</h5>
                  <p>
                    Currently {activePackages} packages are active out of{" "}
                    {totalPackages} total packages.
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
                    <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7L15,1L13.5,2.5L16.17,5.33H10.83L13.5,2.5L12,1L6,7V9H21M12.5,12L16,8.5L14.5,7L12.5,9L9.5,6L8,7.5L11.5,11L8,14.5L9.5,16L12.5,13L15.5,16L17,14.5L14,11.5L17.5,8L16,6.5L12.5,10V12Z" />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Revenue Impact</h5>
                  <p>
                    Monthly revenue reached {formatCurrency(monthlyRevenue)}{" "}
                    this month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Insights */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginRight: "8px" }}
          >
            <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7L15,1L13.5,2.5L16.17,5.33H10.83L13.5,2.5L12,1L6,7V9H21M12.5,12L16,8.5L14.5,7L12.5,9L9.5,6L8,7.5L11.5,11L8,14.5L9.5,16L12.5,13L15.5,16L17,14.5L14,11.5L17.5,8L16,6.5L12.5,10V12Z" />
          </svg>
          Package Insights
        </h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <h4>Active Package Rate</h4>
              <p>
                {totalPackages > 0
                  ? ((activePackages / totalPackages) * 100).toFixed(1)
                  : 0}
                % of your packages are currently active, indicating good
                engagement and member adoption.
              </p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <h4>Revenue Performance</h4>
              <p>
                {topPackages[0]?.[0] || "Premium packages"} generate the highest
                revenue with {formatCurrency(topPackages[0]?.[1]?.revenue || 0)}{" "}
                total earnings.
              </p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <h4>Growth Opportunity</h4>
              <p>
                Consider expanding successful package types and optimizing
                underperforming ones to maximize revenue potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesTab;
