import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Card, Alert } from "../../components";
import { registerUser, clearMessages } from "../../redux/slices/authSlice";
import theme from "../../theme";

const { width } = Dimensions.get("window");

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "MALE",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (error || successMessage) {
      dispatch(clearMessages());
    }
  }, [error, successMessage, dispatch]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    if (!formData.dob.trim()) {
      newErrors.dob = "Date of birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const registrationData = {
      ...formData,
      email: formData.email.toLowerCase().trim(),
      username: formData.username.toLowerCase().trim(),
    };

    try {
      await dispatch(registerUser(registrationData)).unwrap();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const formatDateInput = (text) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length >= 4) {
      formatted = cleaned.substring(0, 4);
      if (cleaned.length >= 6) {
        formatted += "-" + cleaned.substring(4, 6);
        if (cleaned.length >= 8) {
          formatted += "-" + cleaned.substring(6, 8);
        }
      } else if (cleaned.length > 4) {
        formatted += "-" + cleaned.substring(4);
      }
    }

    return formatted.substring(0, 10);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { justifyContent: "flex-start", paddingTop: theme.spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingTop: theme.spacing.lg,
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Join Us Today</Text>
            <Text style={styles.welcomeSubtitle}>
              Create your account to start your journey
            </Text>

            <Card style={styles.formCard}>
              {error && (
                <Alert type="error" message={error} style={styles.alert} />
              )}

              {successMessage && (
                <Alert
                  type="success"
                  message={successMessage}
                  style={styles.alert}
                />
              )}

              <View style={styles.formFields}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChangeText={(value) => updateFormData("fullName", value)}
                    error={errors.fullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.inputWithIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="at-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChangeText={(value) => updateFormData("username", value)}
                    error={errors.username}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.inputWithIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => updateFormData("email", value)}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.inputWithIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChangeText={(value) =>
                      updateFormData("phoneNumber", value)
                    }
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    style={styles.inputWithIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData("password", value)}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.inputWithIcon}
                  />
                  <TouchableOpacity
                    style={[
                      styles.passwordToggle,
                      {
                        top: 44,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.gray400}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.inputIcon}
                  />
                  <Input
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    value={formData.dob}
                    onChangeText={(value) =>
                      updateFormData("dob", formatDateInput(value))
                    }
                    error={errors.dob}
                    keyboardType="numeric"
                    maxLength={10}
                    style={styles.inputWithIcon}
                  />
                </View>

                <View style={styles.genderSection}>
                  <Text style={styles.genderSectionTitle}>Gender</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        formData.gender === "MALE" && styles.genderOptionActive,
                      ]}
                      onPress={() => updateFormData("gender", "MALE")}
                    >
                      <Ionicons
                        name="male"
                        size={20}
                        color={
                          formData.gender === "MALE"
                            ? theme.colors.white
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.genderText,
                          formData.gender === "MALE" && styles.genderTextActive,
                        ]}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        formData.gender === "FEMALE" &&
                          styles.genderOptionActive,
                      ]}
                      onPress={() => updateFormData("gender", "FEMALE")}
                    >
                      <Ionicons
                        name="female"
                        size={20}
                        color={
                          formData.gender === "FEMALE"
                            ? theme.colors.white
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.genderText,
                          formData.gender === "FEMALE" &&
                            styles.genderTextActive,
                        ]}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.gender && (
                    <Text style={styles.errorText}>{errors.gender}</Text>
                  )}
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
                size="large"
              />
            </Card>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  // headerSection, logoContainer, logoCircle, logoIcon removed
  welcomeTitle: {
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: "center",
  },
  formCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  alert: {
    marginBottom: theme.spacing.md,
  },
  formFields: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  inputIcon: {
    position: "absolute",
    left: theme.spacing.md,
    top: "40%",
    transform: [{ translateY: -13 }], // adjust for better vertical centering
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  passwordToggle: {
    position: "absolute",
    right: theme.spacing.md,
    top: "50%",
    transform: [{ translateY: -14 }], // adjust for better vertical centering
    padding: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  genderSection: {
    marginBottom: theme.spacing.md,
  },
  genderSectionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  genderContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  genderOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  genderText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  genderTextActive: {
    color: theme.colors.white,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  registerButton: {
    marginBottom: theme.spacing.md,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  loginText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default RegisterScreen;
