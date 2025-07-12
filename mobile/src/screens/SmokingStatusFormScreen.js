import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Input, Button, Card } from "../components";
import { smokingCessationApi } from "../services/smokingCessationApi";
import theme from "../theme";

const SmokingStatusFormScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    yearsSmoked: "",
    cigarettesPerDay: "",
    frequency: "",
    costPerPack: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { yearsSmoked, cigarettesPerDay, frequency, costPerPack } = formData;

    if (
      !yearsSmoked.trim() ||
      !cigarettesPerDay.trim() ||
      !frequency.trim() ||
      !costPerPack.trim()
    ) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return false;
    }

    if (isNaN(yearsSmoked) || parseInt(yearsSmoked) < 0) {
      Alert.alert("Validation Error", "Please enter a valid number of years");
      return false;
    }

    if (isNaN(cigarettesPerDay) || parseInt(cigarettesPerDay) < 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid number of cigarettes per day"
      );
      return false;
    }

    if (isNaN(frequency) || parseInt(frequency) < 0) {
      Alert.alert("Validation Error", "Please enter a valid frequency");
      return false;
    }

    if (isNaN(costPerPack) || parseFloat(costPerPack) < 0) {
      Alert.alert("Validation Error", "Please enter a valid cost per pack");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (!user?.id || !token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      // 1️⃣ Create smoking log
      const payload = {
        yearsSmoked: parseInt(formData.yearsSmoked),
        cigarettesPerDay: parseInt(formData.cigarettesPerDay),
        frequency: `${formData.frequency} times per day`,
        cost: parseFloat(formData.costPerPack),
      };

      const { smokingLog } = await smokingCessationApi.createSmokingLog(
        user.id,
        payload,
        token
      );

      // 2️⃣ Create AI plan (non-blocking)
      if (smokingLog?.id) {
        try {
          await smokingCessationApi.createPlan(user.id, smokingLog.id, token);
          Alert.alert(
            "Success",
            "Your AI plan is being generated – it will appear on the Progress page in a moment.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("Progress"),
              },
            ]
          );
        } catch (planErr) {
          console.error("createPlan error:", planErr);
          Alert.alert(
            "Partial Success",
            "Smoking log saved, but AI plan generation failed. You can retry from the Progress page.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("Progress"),
              },
            ]
          );
        }
      } else {
        // Still navigate to progress even if plan creation fails
        navigation.navigate("Progress");
      }
    } catch (error) {
      console.error("Error submitting smoking status:", error);
      Alert.alert("Error", "Failed to save smoking status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smoking Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf" size={48} color={theme.colors.success} />
          </View>

          <Text style={styles.title}>Tell us about your smoking habits</Text>
          <Text style={styles.subtitle}>
            This information helps us create a personalized AI-powered cessation
            plan for you.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Years of smoking *</Text>
            <Input
              value={formData.yearsSmoked}
              onChangeText={(value) => handleInputChange("yearsSmoked", value)}
              placeholder="e.g., 5"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cigarettes per day *</Text>
            <Input
              value={formData.cigarettesPerDay}
              onChangeText={(value) =>
                handleInputChange("cigarettesPerDay", value)
              }
              placeholder="e.g., 20"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Smoking frequency (times per day) *
            </Text>
            <Input
              value={formData.frequency}
              onChangeText={(value) => handleInputChange("frequency", value)}
              placeholder="e.g., 10"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cost per pack ($) *</Text>
            <Input
              value={formData.costPerPack}
              onChangeText={(value) => handleInputChange("costPerPack", value)}
              placeholder="e.g., 12.50"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <Text style={styles.requiredNote}>* Required fields</Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text style={styles.loadingText}>Creating AI Plan...</Text>
              </View>
            ) : (
              "Generate My AI Plan"
            )}
          </Button>

          <Button
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  backButton: {
    backgroundColor: "transparent",
    padding: theme.spacing.xs,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.gray600,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
  },
  requiredNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray500,
    fontStyle: "italic",
    marginTop: theme.spacing.sm,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  submitButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.gray600,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
});

export default SmokingStatusFormScreen;
