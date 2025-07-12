import React, { useState, useEffect } from "react";
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
import { Button, Card } from "../../components";
import { smokingCessationApi } from "../../services/smokingCessationApi";
import theme from "../../theme";

const SmokingCessationScreen = ({ navigation }) => {
  const [plan, setPlan] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [moneySaved, setMoneySaved] = useState(0);
  const [daysSmokeFree, setDaysSmokeFree] = useState(0);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id || !token) return;

      // Fetch user's smoking cessation plan
      const planData = await smokingCessationApi.getPlanByUserId(
        user.id,
        token
      );

      if (planData.plans && planData.plans.length > 0) {
        const currentPlan = planData.plans[0];
        setPlan(currentPlan);

        // Map phases from plan data
        const mappedPhases =
          planData.planPhases?.map((phase, index) => ({
            id: phase.id,
            number: phase.phaseNumber || index + 1,
            title: `Phase ${phase.phaseNumber || index + 1}: ${
              phase.weekRange || "Phase"
            }`,
            subtitle: phase.goal || "",
            icon: ["🎯", "🚀", "💪", "🏆"][index % 4],
            color: [
              "from-blue-400 to-blue-600",
              "from-green-400 to-green-600",
              "from-purple-400 to-purple-600",
              "from-yellow-400 to-yellow-600",
            ][index % 4],
            completed: false, // You can determine this based on progress
          })) || [];

        setPhases(mappedPhases);
      }

      // Fetch progress data
      const progress = await smokingCessationApi.getDailyProgressByMemberId(
        user.id,
        token
      );
      setProgressData(progress.progresses || []);

      // Calculate money saved and days smoke-free from progress data
      if (progress.progresses && progress.progresses.length > 0) {
        const latestProgress =
          progress.progresses[progress.progresses.length - 1];
        setMoneySaved(latestProgress.moneySaved || 0);
        setDaysSmokeFree(latestProgress.daysSmokeFree || 0);
      }
    } catch (err) {
      console.error("Error fetching smoking cessation data:", err);
      // Don't show error for 403 - user might not have a plan yet
      if (err.response?.status === 403) {
        setError(""); // Clear error for 403, show empty state instead
      } else {
        setError("Failed to load smoking cessation program");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const submitDailyProgress = async (healthImprovement) => {
    try {
      const daysSmokeFree = progressData.length + 1; // Simple calculation

      const result = await smokingCessationApi.submitDailyProgress(
        user.id,
        {
          daysSmokeFree,
          healthImprovement,
          completed: true,
        },
        token
      );

      // Update money saved from API response
      if (result.moneySaved) {
        setMoneySaved(result.moneySaved);
      }

      // Refresh data
      await fetchData();

      Alert.alert("Success", "Your daily progress has been recorded!");
    } catch (err) {
      console.error("Error submitting progress:", err);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    }
  };

  const PhaseCard = ({ phase, index, isActive, isCompleted }) => (
    <Card
      style={[
        styles.phaseCard,
        isActive && styles.activePhaseCard,
        isCompleted && styles.completedPhaseCard,
      ]}
    >
      <View style={styles.phaseHeader}>
        <View
          style={[
            styles.phaseNumber,
            isActive && styles.activePhaseNumber,
            isCompleted && styles.completedPhaseNumber,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color={theme.colors.white} />
          ) : (
            <Text
              style={[
                styles.phaseNumberText,
                isActive && styles.activePhaseNumberText,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>
        <View style={styles.phaseTitleContainer}>
          <Text
            style={[styles.phaseTitle, isActive && styles.activePhaseTitle]}
          >
            {phase.title || `Phase ${index + 1}`}
          </Text>
          <Text style={styles.phaseDuration}>{phase.duration || "7 days"}</Text>
        </View>
        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Current</Text>
          </View>
        )}
      </View>

      <Text style={styles.phaseDescription}>
        {phase.description || "Complete daily tasks and track your progress"}
      </Text>

      <View style={styles.phaseProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Progress: {phase.progress || 0}%
          </Text>
          <Text style={styles.tasksText}>
            {phase.completedTasks || 0}/{phase.totalTasks || 0} tasks
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${phase.progress || 0}%` }]}
          />
        </View>
      </View>

      {isActive && (
        <Button
          title="Continue Phase"
          onPress={() =>
            Alert.alert(
              "Phase Details",
              `${phase.title}\n\n${phase.description}\n\nDuration: ${phase.duration} days`,
              [{ text: "OK" }]
            )
          }
          style={styles.continueButton}
          size="small"
        />
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your program...</Text>
        </View>
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
        <Text style={styles.headerTitle}>Smoking Cessation</Text>
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
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Journey to Freedom</Text>
          <Text style={styles.heroSubtitle}>
            Follow our proven step-by-step program to quit smoking
          </Text>
        </View>

        {error && <Alert type="error" message={error} style={styles.alert} />}

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Ionicons
              name="trophy-outline"
              size={32}
              color={theme.colors.primary}
            />
            <View>
              <Text style={styles.overviewTitle}>Overall Progress</Text>
              <Text style={styles.overviewSubtitle}>
                Phase {currentPhase} of {phases.length}
              </Text>
            </View>
          </View>
          <View style={styles.overallProgress}>
            <View style={styles.overallProgressBar}>
              <View
                style={[
                  styles.overallProgressFill,
                  { width: `${(currentPhase / phases.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.overallProgressText}>
              {Math.round((currentPhase / phases.length) * 100)}% Complete
            </Text>
          </View>
        </View>

        <View style={styles.phasesContainer}>
          <Text style={styles.sectionTitle}>Program Phases</Text>
          {phases.map((phase, index) => (
            <PhaseCard
              key={index}
              phase={phase}
              index={index}
              isActive={index + 1 === currentPhase}
              isCompleted={index + 1 < currentPhase}
            />
          ))}
        </View>

        {phases.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons
              name="leaf-outline"
              size={64}
              color={theme.colors.gray400}
            />
            <Text style={styles.emptyTitle}>No program available</Text>
            <Text style={styles.emptySubtitle}>
              Please purchase a membership to access the smoking cessation
              program
            </Text>
            <Button
              title="View Membership Plans"
              onPress={() => navigation.navigate("Membership")}
              style={styles.membershipButton}
            />
          </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  heroSection: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: theme.fontSize["3xl"],
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
  alert: {
    marginBottom: theme.spacing.lg,
  },
  overviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  overviewTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  overviewSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  overallProgress: {
    gap: theme.spacing.sm,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    overflow: "hidden",
  },
  overallProgressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  phasesContainer: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  phaseCard: {
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
  },
  activePhaseCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "05",
  },
  completedPhaseCard: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + "05",
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  phaseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray200,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  activePhaseNumber: {
    backgroundColor: theme.colors.primary,
  },
  completedPhaseNumber: {
    backgroundColor: theme.colors.success,
  },
  phaseNumberText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray600,
  },
  activePhaseNumberText: {
    color: theme.colors.white,
  },
  phaseTitleContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  activePhaseTitle: {
    color: theme.colors.primary,
  },
  phaseDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  activeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.white,
  },
  phaseDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  phaseProgress: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  tasksText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.gray200,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  continueButton: {
    marginTop: theme.spacing.sm,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
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
  membershipButton: {
    marginTop: theme.spacing.md,
  },
});

export default SmokingCessationScreen;
