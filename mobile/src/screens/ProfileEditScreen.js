import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Input, Button, Card } from "../components";
import { userApi } from "../services/smokingCessationApi";
import theme from "../theme";

const ProfileEditScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!user?.id || !token) return;

      const memberData = await userApi.getMemberById(user.id, token);
      console.log("Member data for edit:", memberData);

      // Handle different response structures
      const member = memberData?.member || memberData || {};

      setFormData({
        fullName: member.fullName || user?.fullName || "",
        email: member.email || user?.email || "",
        phoneNumber: member.phoneNumber || user?.phoneNumber || "",
        gender: member.gender || user?.gender || "",
        dob: member.dob || user?.dob || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to user data from Redux if API fails
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        gender: user?.gender || "",
        dob: user?.dob || "",
      });
      Alert.alert(
        "Warning",
        "Could not load latest profile data. Showing cached information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.fullName.trim()) {
        Alert.alert("Validation Error", "Full name is required");
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert("Validation Error", "Email is required");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert("Validation Error", "Please enter a valid email address");
        return;
      }

      const response = await userApi.updateMemberProfile(
        user.id,
        formData,
        token
      );

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray600} />
        </Button>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <Input
              value={formData.fullName}
              onChangeText={(value) => handleInputChange("fullName", value)}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <Input
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <Input
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <Input
              value={formData.gender}
              onChangeText={(value) => handleInputChange("gender", value)}
              placeholder="Enter your gender"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <Input
              value={formData.dob}
              onChangeText={(value) => handleInputChange("dob", value)}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>

          <Text style={styles.requiredNote}>* Required fields</Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              "Save Changes"
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.gray600,
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
  backButtonText: {
    fontSize: 0,
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
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
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
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
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

export default ProfileEditScreen;
