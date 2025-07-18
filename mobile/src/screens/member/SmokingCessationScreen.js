import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { parse, format } from "date-fns";
import { Button, Card, DayCard } from "../../components";
import {
  smokingCessationApi,
  userApi,
} from "../../services/smokingCessationApi";
import { buildCalendar, mapPhases } from "../../utils/calendar";
import theme from "../../theme";

const SmokingCessationScreen = ({ navigation }) => {
  const [plan, setPlan] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [moneySaved, setMoneySaved] = useState(0);
  const [daysSmokeFree, setDaysSmokeFree] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [phaseInfo, setPhaseInfo] = useState([]);
  const [progressToday, setProgressToday] = useState(null);
  const [allProgresses, setAllProgresses] = useState([]);
  const [membershipData, setMembershipData] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  // Check if user is VIP
  const isVIP =
    membershipData?.plans === "VIP" ||
    membershipData?.membership_Package?.packageName === "VIP";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPlan = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const { plans, planPhases } = await smokingCessationApi.getPlanByUserId(
        user.id,
        token
      );

      if (!plans?.length) {
        return;
      }
      const activePlan = plans[0];
      setPlan(activePlan);
      setCalendar(buildCalendar(activePlan));
      setPhaseInfo(
        planPhases?.length ? mapPhases(planPhases) : mapPhases([{}, {}, {}, {}])
      );
    } catch (err) {
      console.error("fetchPlan", err);
    }
  }, [user?.id, token]);

  const fetchTodayProgress = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const { progresses, progressLog } =
        await smokingCessationApi.getDailyProgressByMemberId(user.id, token);

      const today = new Date().toISOString().split("T")[0];
      const todayData =
        progresses?.find((p) => {
          const progressDate = new Date(
            p.dateCreated.split("-").reverse().join("-")
          )
            .toISOString()
            .split("T")[0];
          return progressDate === today;
        }) ?? null;

      setProgressToday(todayData);
      setMoneySaved(progressLog?.totalMoneySaved || 0);
      setAllProgresses(progresses || []);
    } catch (err) {
      if (err.response?.status === 400) {
        console.warn("No progress yet for today");
        setProgressToday(null);
        setMoneySaved(0);
      } else {
        console.error("Unexpected error loading progress:", err);
      }
    }
  }, [user?.id, token]);

  const fetchMembershipData = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const member = await userApi.getMemberById(user.id, token);
      setMembershipData(member);
    } catch (err) {
      console.warn("Could not fetch membership data");
    }
  }, [user?.id, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id || !token) return;

      // Fetch all data in parallel
      await Promise.all([
        fetchPlan(),
        fetchTodayProgress(),
        fetchMembershipData(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Some features may not be available");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const submitDailyProgress = async ({ daysSmokeFree, healthImprovement }) => {
    if (loadingSubmit) return;
    setLoadingSubmit(true);

    try {
      const result = await smokingCessationApi.submitDailyProgress(
        user.id,
        {
          completed: true,
          daysSmokeFree,
          healthImprovement,
        },
        token
      );

      Alert.alert(
        "Success!",
        `Progress saved! 💰 Money saved: ${result.moneySaved || 0} đ`
      );

      // Refresh data
      await fetchTodayProgress();
    } catch (err) {
      console.error("Error submitting progress:", err);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Helper function to render days organized by weeks
  const renderWeeksView = (phaseDays) => {
    // Group days into weeks (7 days each)
    const weeks = [];
    for (let i = 0; i < phaseDays.length; i += 7) {
      weeks.push(phaseDays.slice(i, i + 7));
    }

    return weeks.map((weekDays, weekIndex) => {
      // Calculate current date to highlight current week
      const today = new Date().toISOString().split("T")[0];
      const isCurrentWeek = weekDays.some((day) => day.date === today);

      return (
        <View key={weekIndex} style={styles.weekContainer}>
          <View
            style={[
              styles.weekHeader,
              isCurrentWeek && styles.currentWeekHeader,
            ]}
          >
            <View style={styles.weekHeaderLeft}>
              <Text
                style={[
                  styles.weekTitle,
                  isCurrentWeek && styles.currentWeekTitle,
                ]}
              >
                📅 Week {weekIndex + 1}
                {isCurrentWeek && " (Current)"}
              </Text>
              <Text
                style={[
                  styles.weekSubtitle,
                  isCurrentWeek && styles.currentWeekSubtitle,
                ]}
              >
                Days {weekIndex * 7 + 1} -{" "}
                {Math.min((weekIndex + 1) * 7, phaseDays.length)}
              </Text>
            </View>
            {isCurrentWeek && (
              <View style={styles.currentWeekIndicator}>
                <Text style={styles.currentWeekBadge}>●</Text>
              </View>
            )}
          </View>

          <View style={styles.weekDaysContainer}>
            {weekDays.map((day, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;

              // Show VIP lock for non-VIP users after day 3 in phase 1
              if (!isVIP && activePhase === 0 && globalIndex >= 3) {
                return (
                  <Card key={globalIndex} style={styles.lockedDayCard}>
                    <View style={styles.lockedDayContent}>
                      <Text style={styles.lockedIcon}>🔒</Text>
                      <Text style={styles.lockedText}>VIP Only</Text>
                      <Text style={styles.lockedSubtext}>
                        Day {globalIndex + 1}
                      </Text>
                    </View>
                  </Card>
                );
              }

              return (
                <View key={globalIndex} style={styles.dayCardWrapper}>
                  <DayCard
                    day={day}
                    allProgresses={allProgresses}
                    todayProgress={progressToday}
                    moneySaved={moneySaved}
                    onSubmit={submitDailyProgress}
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    });
  };

  const PhaseTab = ({ phase, index, isActive, isLocked }) => (
    <TouchableOpacity
      style={[
        styles.phaseTab,
        isActive && styles.activePhaseTab,
        isLocked && styles.lockedPhaseTab,
      ]}
      onPress={() => !isLocked && setActivePhase(index)}
      disabled={isLocked}
    >
      <View style={styles.phaseTabContent}>
        <Text style={styles.phaseIcon}>{phase.icon}</Text>
        {isLocked && (
          <Ionicons name="lock-closed" size={12} color={theme.colors.gray400} />
        )}
        <Text
          style={[
            styles.phaseTabTitle,
            isActive && styles.activePhaseTabTitle,
            isLocked && styles.lockedPhaseTabTitle,
          ]}
        >
          {phase.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Loading your personalized plan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smoking Cessation</Text>
        </View>

        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚭</Text>
            <Text style={styles.emptyTitle}>No plan found</Text>
            <Text style={styles.emptySubtitle}>
              Go back & create one to start your journey.
            </Text>
            <Button
              title="Create New Plan"
              onPress={() => navigation.navigate("SmokingStatusForm")}
              style={styles.createPlanButton}
              textStyle={styles.createPlanButtonText}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>28-Day Journey</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("BookAppointment")}
          style={styles.appointmentButton}
        >
          <Ionicons name="calendar" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🚭</Text>
          <Text style={styles.heroTitle}>28-Day Smoking Cessation Journey</Text>
          <Text style={styles.heroSubtitle}>
            Your personalized path to a smoke-free life. Each phase is designed
            to support your journey.
          </Text>
        </View>

        {/* Money Saved Card */}
        <Card style={styles.moneyCard}>
          <View style={styles.moneyCardContent}>
            <Text style={styles.moneyIcon}>💰</Text>
            <Text style={styles.moneyLabel}>Money Saved</Text>
            <Text style={styles.moneyAmount}>
              {moneySaved?.toLocaleString() || 0} đ
            </Text>
          </View>
        </Card>

        {/* Phase Tabs */}
        {phaseInfo.length > 0 && (
          <View style={styles.phaseTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.phaseTabsScrollContent}
            >
              <View style={styles.phaseTabs}>
                {phaseInfo.map((phase, index) => {
                  const isActive = activePhase === index;
                  const isLocked = !isVIP && index > 0;

                  // Calculate progress for the current active phase
                  const currentPhaseData = calendar[activePhase] || [];
                  const completedDays = currentPhaseData.filter((day) => {
                    return allProgresses.some((progress) => {
                      const progressDate = format(
                        parse(progress.dateCreated, "dd-MM-yyyy", new Date()),
                        "yyyy-MM-dd"
                      );
                      return progressDate === day.date;
                    });
                  }).length;

                  return (
                    <View key={index} style={styles.phaseTabWrapper}>
                      <PhaseTab
                        phase={phase}
                        index={index}
                        isActive={isActive}
                        isLocked={isLocked}
                      />
                      {isActive && (
                        <View style={styles.progressIndicator}>
                          <Text style={styles.progressText}>
                            {completedDays}/{currentPhaseData.length} days
                            completed
                          </Text>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${
                                    (completedDays / currentPhaseData.length) *
                                    100
                                  }%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Calendar View */}
        {calendar.length > 0 && (
          <Card style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarIcon}>
                {phaseInfo[activePhase]?.icon}
              </Text>
              <View style={styles.calendarHeaderText}>
                <Text style={styles.calendarTitle}>
                  {phaseInfo[activePhase]?.title}
                </Text>
                <Text style={styles.calendarSubtitle}>
                  {phaseInfo[activePhase]?.subtitle}
                </Text>
              </View>
            </View>

            {/* Week-by-week view for better organization */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {calendar[activePhase] && renderWeeksView(calendar[activePhase])}
            </ScrollView>
          </Card>
        )}

        {/* VIP Upgrade Banner */}
        {!isVIP && (
          <Card style={styles.vipBanner}>
            <View style={styles.vipBannerContent}>
              <View style={styles.vipBannerText}>
                <View style={styles.vipBannerHeader}>
                  <Text style={styles.vipIcon}>⭐</Text>
                  <Text style={styles.vipTitle}>Preview Mode</Text>
                </View>
                <Text style={styles.vipSubtitle}>
                  You're viewing a preview. Upgrade to VIP to unlock the full
                  28-day plan with all phases.
                </Text>
              </View>
              <Button
                title="Upgrade to VIP"
                onPress={() => navigation.navigate("Membership")}
                style={styles.vipButton}
                textStyle={styles.vipButtonText}
                size="small"
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  appointmentButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  heroSection: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  moneyCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  moneyCardContent: {
    alignItems: "center",
  },
  moneyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  moneyLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  moneyAmount: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  phaseTabsContainer: {
    marginTop: theme.spacing.xl, // Further increase top margin to prevent clipping
    marginBottom: theme.spacing.lg,
  },
  phaseTabs: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.sm,
  },
  phaseTabsScrollContent: {
    paddingVertical: theme.spacing.md, // Add vertical padding to prevent clipping
  },
  phaseTabWrapper: {
    alignItems: "center",
  },
  phaseTab: {
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    minWidth: 180, // Increased width to show more text
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.gray200,
  },
  progressIndicator: {
    marginTop: theme.spacing.sm,
    minWidth: 180,
    alignItems: "center",
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: theme.colors.gray200,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  activePhaseTab: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
    transform: [{ scale: 1.05 }], // Slightly scale up active tab
  },
  lockedPhaseTab: {
    opacity: 0.5,
  },
  phaseTabContent: {
    alignItems: "center",
  },
  phaseIcon: {
    fontSize: 28, // Larger icon
    marginBottom: theme.spacing.sm,
  },
  phaseTabTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold, // Made bolder
    color: theme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 18, // Better line spacing for multi-line text
  },
  activePhaseTabTitle: {
    color: theme.colors.primary,
  },
  lockedPhaseTabTitle: {
    color: theme.colors.gray400,
  },
  calendarCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  calendarIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  calendarHeaderText: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  calendarSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  // New week-based layout styles
  weekContainer: {
    marginBottom: theme.spacing.xl,
  },
  weekHeader: {
    backgroundColor: theme.colors.gray50,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentWeekHeader: {
    backgroundColor: theme.colors.primary + "15",
    borderLeftColor: theme.colors.primary,
  },
  weekHeaderLeft: {
    flex: 1,
  },
  weekTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  currentWeekTitle: {
    color: theme.colors.primary,
  },
  weekSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  currentWeekSubtitle: {
    color: theme.colors.primary,
  },
  currentWeekIndicator: {
    marginLeft: theme.spacing.md,
  },
  currentWeekBadge: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  weekDaysContainer: {
    gap: theme.spacing.md,
  },
  dayCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  dayRow: {
    justifyContent: "space-between",
  },
  lockedDayCard: {
    flex: 1,
    margin: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.gray50,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  lockedDayContent: {
    alignItems: "center",
  },
  lockedIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  lockedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray400,
  },
  lockedSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray400,
    marginTop: theme.spacing.xxs,
  },
  vipBanner: {
    marginBottom: theme.spacing.lg,
    backgroundColor: "#FFF7ED",
    borderColor: "#FB923C",
    borderWidth: 1,
  },
  vipBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  vipBannerText: {
    flex: 1,
  },
  vipBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  vipIcon: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  vipTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: "#9A3412",
  },
  vipSubtitle: {
    fontSize: theme.fontSize.sm,
    color: "#9A3412",
    lineHeight: 18,
  },
  vipButton: {
    backgroundColor: "#FB923C",
    marginLeft: theme.spacing.md,
  },
  vipButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  createPlanButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
  },
  createPlanButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default SmokingCessationScreen;
