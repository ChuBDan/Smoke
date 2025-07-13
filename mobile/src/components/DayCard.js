import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { parse, format } from "date-fns";
import { Button, Card } from "./index";
import theme from "../theme";

const DayCard = ({ day, allProgresses = [], onSubmit }) => {
  const [daysSmokeFree, setDaysSmokeFree] = useState("");
  const [healthImprovement, setHealthImprovement] = useState("GOOD");
  const [showForm, setShowForm] = useState(false);

  // Current date
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");
  const formattedDay = day.date;

  // Find progress for this day (if any)
  const dayProgress = allProgresses.find((p) => {
    const progressDate = format(
      parse(p.dateCreated, "dd-MM-yyyy", new Date()),
      "yyyy-MM-dd"
    );
    return progressDate === formattedDay;
  });

  const isToday = formattedDay === formattedToday;
  const isPastDay = new Date(formattedDay) < new Date(formattedToday);
  const isCompleted = !!dayProgress;

  const getStatus = () => {
    if (isCompleted) return "completed";
    if (isPastDay) return "missed";
    if (isToday) return "today";
    return "pending";
  };

  const status = getStatus();

  const handleSubmit = () => {
    if (!daysSmokeFree) {
      Alert.alert("Error", "Please enter the number of cigarettes smoked");
      return;
    }

    onSubmit({
      daysSmokeFree: parseInt(daysSmokeFree),
      healthImprovement,
    });
    setShowForm(false);
    setDaysSmokeFree("");
  };

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          borderColor: theme.colors.success,
          backgroundColor: theme.colors.success + "10",
          iconName: "checkmark-circle",
          iconColor: theme.colors.success,
          badgeText: "Completed",
          badgeColor: theme.colors.success,
        };
      case "today":
        return {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primary + "10",
          iconName: "today",
          iconColor: theme.colors.primary,
          badgeText: "Today",
          badgeColor: theme.colors.primary,
        };
      case "missed":
        return {
          borderColor: theme.colors.error,
          backgroundColor: theme.colors.error + "10",
          iconName: "close-circle",
          iconColor: theme.colors.error,
          badgeText: "Missed",
          badgeColor: theme.colors.error,
        };
      default:
        return {
          borderColor: theme.colors.gray300,
          backgroundColor: theme.colors.white,
          iconName: "time",
          iconColor: theme.colors.gray400,
          badgeText: "Pending",
          badgeColor: theme.colors.gray400,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card
      style={[
        styles.card,
        {
          borderColor: statusConfig.borderColor,
          backgroundColor: statusConfig.backgroundColor,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dayInfo}>
          <Text style={styles.dayNumber}>Day {day.dayNumber}</Text>
          <Text style={styles.date}>
            {format(new Date(day.date), "MMM dd")}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.badgeColor },
          ]}
        >
          <Ionicons
            name={statusConfig.iconName}
            size={16}
            color={theme.colors.white}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={14} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Goal</Text>
          </View>
          <Text style={styles.sectionText}>{day.goal || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark" size={14} color={theme.colors.success} />
            <Text style={styles.sectionTitle}>Task</Text>
          </View>
          <Text style={styles.sectionText}>{day.task || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={14} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Tip</Text>
          </View>
          <Text style={styles.sectionText}>{day.tip || "N/A"}</Text>
        </View>
      </View>

      {/* Action Area */}
      <View style={styles.actionArea}>
        {status === "today" && !isCompleted ? (
          !showForm ? (
            <Button
              title="Log Progress"
              onPress={() => setShowForm(true)}
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
              size="small"
            />
          ) : (
            <View style={styles.form}>
              <Text style={styles.formLabel}>Cigarettes smoked today:</Text>
              <TextInput
                style={styles.input}
                value={daysSmokeFree}
                onChangeText={setDaysSmokeFree}
                placeholder="Enter number"
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Health Status:</Text>
              <View style={styles.healthOptions}>
                {[
                  {
                    value: "GOOD",
                    label: "😊 Good",
                    color: theme.colors.success,
                  },
                  {
                    value: "NORMAL",
                    label: "😐 Normal",
                    color: theme.colors.warning,
                  },
                  { value: "BAD", label: "😷 Bad", color: theme.colors.error },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.healthOption,
                      healthImprovement === option.value && {
                        backgroundColor: option.color + "20",
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => setHealthImprovement(option.value)}
                  >
                    <Text
                      style={[
                        styles.healthOptionText,
                        healthImprovement === option.value && {
                          color: option.color,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowForm(false)}
                  style={[styles.formButton, styles.cancelButton]}
                  textStyle={styles.cancelButtonText}
                  size="small"
                />
                <Button
                  title="Submit"
                  onPress={handleSubmit}
                  style={[styles.formButton, styles.submitButton]}
                  textStyle={styles.submitButtonText}
                  size="small"
                />
              </View>
            </View>
          )
        ) : (
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: statusConfig.badgeColor + "20" },
            ]}
          >
            <Ionicons
              name={statusConfig.iconName}
              size={16}
              color={statusConfig.badgeColor}
            />
            <Text
              style={[styles.statusText, { color: statusConfig.badgeColor }]}
            >
              {statusConfig.badgeText}
            </Text>
          </View>
        )}
      </View>

      {/* Today indicator */}
      {isToday && (
        <View style={styles.todayIndicator}>
          <Text style={styles.todayText}>TODAY</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: theme.spacing.xs,
    padding: theme.spacing.md,
    minHeight: 200, // Ensure minimum height for better content display
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: theme.fontSize.lg, // Increased font size
    fontWeight: theme.fontWeight.bold, // Made bolder
    color: theme.colors.textPrimary,
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxs,
  },
  statusBadge: {
    width: 32, // Slightly larger
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginBottom: theme.spacing.md,
    flex: 1, // Allow content to expand
  },
  section: {
    marginBottom: theme.spacing.md, // Increased spacing between sections
    padding: theme.spacing.sm, // Added padding to sections
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm, // Increased spacing
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm, // Slightly larger
    fontWeight: theme.fontWeight.semibold, // Made more prominent
    color: theme.colors.textPrimary, // Changed to primary text color
    marginLeft: theme.spacing.xs,
    textTransform: "uppercase",
  },
  sectionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20, // Increased line height for better readability
    flexWrap: "wrap", // Allow text wrapping
  },
  actionArea: {
    marginTop: "auto",
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
  },
  form: {
    gap: theme.spacing.sm,
  },
  formLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    backgroundColor: theme.colors.white,
  },
  healthOptions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  healthOption: {
    flex: 1,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    alignItems: "center",
  },
  healthOptionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  formActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: theme.colors.gray200,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.white,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  todayIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.borderRadius.sm,
  },
  todayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
});

export default DayCard;
