import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import styles from "./BadgesTab.module.css";

const BadgesTab = () => {
  const [selectedView, setSelectedView] = useState("overview");
  const badgesState = useSelector((state) => state.badges);
  const badges = useMemo(
    () =>
      (badgesState.badges || []).filter(
        (badge) => badge.status !== "deleted" && !badge.isDeleted
      ),
    [badgesState.badges]
  );

  // Badge analytics (removed memberCount references since not available)
  const analytics = useMemo(() => {
    const totalBadges = badges.length;
    const activeBadges = badges.filter((b) => b.status === "active").length;

    // Badge categories analysis
    const categoryStats = badges.reduce((acc, badge) => {
      const category = badge.category || badge.type || "General";
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          active: 0,
        };
      }
      acc[category].count++;
      if (badge.status === "active") acc[category].active++;
      return acc;
    }, {});

    return {
      totalBadges,
      activeBadges,
      categoryStats,
    };
  }, [badges]);

  // Monthly badge awards trends (robust - always returns 6 months with 0 for empty months)
  const monthlyTrends = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Filter badges created in this month
      const monthBadges = badges.filter((b) => {
        const badgeDate = new Date(b.dateCreated);
        return badgeDate >= monthStart && badgeDate <= monthEnd;
      });

      // Calculate badges created in this month (no award counting since memberCount not available)
      const monthAwards = 0; // Disabled since memberCount not available

      const activeBadges = monthBadges.filter(
        (b) => b.status === "active"
      ).length;

      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        badges: monthBadges.length,
        awarded: monthAwards,
        active: activeBadges,
      });
    }

    return months;
  }, [badges]);

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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "popular",
      label: "Popular",
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
  ];

  const getBadgeIcon = (badgeName) => {
    const name = badgeName?.toLowerCase() || "";

    if (name.includes("smoke") || name.includes("quit")) {
      return (
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
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
          />
        </svg>
      );
    }
    if (name.includes("day") || name.includes("week")) {
      return (
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
      );
    }
    if (name.includes("month")) {
      return (
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
            d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      );
    }
    if (name.includes("milestone")) {
      return (
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
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
      );
    }
    if (name.includes("progress")) {
      return (
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      );
    }
    if (name.includes("champion") || name.includes("hero")) {
      return (
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
      );
    }
    if (name.includes("start") || name.includes("first")) {
      return (
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );
    }

    // Default badge icon
    return (
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
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      General: "#64748b",
      Progress: "#10b981",
      Milestone: "#f59e0b",
      Achievement: "#8b5cf6",
      "Time-based": "#3b82f6",
      Special: "#ef4444",
    };
    return colors[category] || "#64748b";
  };

  return (
    <div className={styles.badgesContainer}>
      {/* Badge Overview */}
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
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          Badge System Overview
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div className={styles.monthlyBadge}>
                +{analytics.awardedThisMonth} this month
              </div>
            </div>
            <div className={styles.cardValue}>{analytics.totalAwarded}</div>
            <div className={styles.cardLabel}>Total Badges Awarded</div>
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className={styles.cardValue}>{analytics.totalBadges}</div>
            <div className={styles.cardLabel}>Badge Types</div>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className={styles.cardValue}>{analytics.activeBadges}</div>
            <div className={styles.cardLabel}>Active Badges</div>
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className={styles.cardValue}>
              {analytics.totalBadges > 0
                ? (analytics.totalAwarded / analytics.totalBadges).toFixed(1)
                : 0}
            </div>
            <div className={styles.cardLabel}>Avg. per Badge</div>
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
            <div className={styles.categoryGrid}>
              <h4>Badge Categories</h4>
              <div className={styles.categoriesList}>
                {Object.entries(analytics.categoryStats).map(
                  ([category, stats]) => (
                    <div key={category} className={styles.categoryItem}>
                      <div className={styles.categoryInfo}>
                        <div
                          className={styles.categoryColor}
                          style={{
                            backgroundColor: getCategoryColor(category),
                          }}
                        ></div>
                        <div className={styles.categoryDetails}>
                          <div className={styles.categoryName}>{category}</div>
                          <div className={styles.categoryStats}>
                            {stats.count} badges • {stats.active} active
                          </div>
                        </div>
                      </div>
                      <div className={styles.categoryAwarded}>
                        <div className={styles.awardedValue}>
                          {stats.awarded}
                        </div>
                        <div className={styles.awardedLabel}>awarded</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>🎯</div>
                  <div className={styles.statsTitle}>Engagement Rate</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.totalBadges > 0
                    ? (
                        (analytics.activeBadges / analytics.totalBadges) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <div className={styles.statsSubtext}>Active badge ratio</div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <svg
                      width="18"
                      height="18"
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
                  <div className={styles.statsTitle}>Monthly Growth</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.awardedThisMonth}
                </div>
                <div className={styles.statsSubtext}>
                  Badges awarded this month
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <svg
                      width="18"
                      height="18"
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
                  <div className={styles.statsTitle}>Active Badges</div>
                </div>
                <div className={styles.statsValue}>
                  {analytics.activeBadges}
                </div>
                <div className={styles.statsSubtext}>
                  Currently active badges
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories View (replacing popular since memberCount not available) */}
        {selectedView === "popular" && (
          <div className={styles.viewContent}>
            <div className={styles.categoriesSection}>
              <h4>Badge Categories</h4>
              <div className={styles.categoriesGrid}>
                {Object.entries(analytics.categoryStats).map(
                  ([category, stats]) => (
                    <div key={category} className={styles.categoryCard}>
                      <div className={styles.categoryIcon}>
                        {category === "Achievement"
                          ? "🏆"
                          : category === "Progress"
                          ? "📈"
                          : category === "Milestone"
                          ? "🎯"
                          : "🏅"}
                      </div>
                      <div className={styles.categoryDetails}>
                        <div className={styles.categoryName}>{category}</div>
                        <div className={styles.categoryStats}>
                          <div className={styles.categoryStat}>
                            <span className={styles.statNumber}>
                              {stats.count}
                            </span>
                            <span className={styles.statLabel}>Total</span>
                          </div>
                          <div className={styles.categoryStat}>
                            <span className={styles.statNumber}>
                              {stats.active}
                            </span>
                            <span className={styles.statLabel}>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className={styles.allBadgesSection}>
              <h4>All Available Badges ({badges.length})</h4>
              <div className={styles.badgesGrid}>
                {badges.map((badge, index) => (
                  <div key={badge.id || index} className={styles.badgeCard}>
                    <div className={styles.badgeCardIcon}>
                      {getBadgeIcon(
                        badge.badgeName || badge.name || badge.type
                      )}
                    </div>
                    <div className={styles.badgeCardName}>
                      {badge.badgeName ||
                        badge.name ||
                        badge.title ||
                        `Badge #${badge.id || index + 1}`}
                    </div>
                    <div className={styles.badgeCardDescription}>
                      {badge.description ||
                        badge.criteria ||
                        "Achievement badge"}
                    </div>
                    <div className={styles.badgeCardCategory}>
                      {badge.category || badge.type || "General"}
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
              <h4>Badge Award Trends (Last 6 Months)</h4>
              <div className={styles.trendChart}>
                {monthlyTrends.map((data, index) => {
                  const maxAwarded = Math.max(
                    ...monthlyTrends.map((d) => d.awarded),
                    1
                  );
                  const height =
                    maxAwarded > 0 ? (data.awarded / maxAwarded) * 100 : 0;

                  return (
                    <div key={index} className={styles.trendBar}>
                      <div
                        className={styles.badgeBar}
                        style={{
                          height: `${Math.max(
                            height,
                            data.awarded > 0 ? 10 : 0
                          )}%`,
                          minHeight: data.awarded > 0 ? "20px" : "0px",
                        }}
                      >
                        <div className={styles.barTooltip}>
                          <div>{data.badges} new badges</div>
                          <div>{data.awarded} total awards</div>
                          <div>{data.active} active badges</div>
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
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Strong Motivation</h5>
                  <p>
                    Badge system is effectively motivating users with{" "}
                    {analytics.totalAwarded} total awards across{" "}
                    {analytics.totalBadges} different badge types.
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Popular Categories</h5>
                  <p>
                    {Object.keys(analytics.categoryStats)[0] || "Progress"}{" "}
                    badges are the most popular, showing users value achievement
                    recognition.
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className={styles.trendContent}>
                  <h5>Growing Engagement</h5>
                  <p>
                    {analytics.awardedThisMonth} badges awarded this month,
                    indicating healthy user engagement and progress.
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

export default BadgesTab;
