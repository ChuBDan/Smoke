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
import { Button, Input, Card, Alert, RadioButton } from "../../components";
import {
  loginUser,
  loginCoach,
  clearMessages,
} from "../../redux/slices/authSlice";
import theme from "../../theme";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
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

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const loginData = {
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    try {
      if (role === "COACH") {
        await dispatch(loginCoach(loginData)).unwrap();
      } else {
        await dispatch(loginUser(loginData)).unwrap();
      }
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error("Login failed:", error);
    }
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
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your journey
            </Text>

            {/* Form Card */}
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

              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={styles.roleSectionTitle}>Sign in as</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === "MEMBER" && styles.roleOptionActive,
                    ]}
                    onPress={() => setRole("MEMBER")}
                  >
                    <Ionicons
                      name="person"
                      size={20}
                      color={
                        role === "MEMBER"
                          ? theme.colors.white
                          : theme.colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.roleText,
                        role === "MEMBER" && styles.roleTextActive,
                      ]}
                    >
                      Member
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === "COACH" && styles.roleOptionActive,
                    ]}
                    onPress={() => setRole("COACH")}
                  >
                    <Ionicons
                      name="medical"
                      size={20}
                      color={
                        role === "COACH"
                          ? theme.colors.white
                          : theme.colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.roleText,
                        role === "COACH" && styles.roleTextActive,
                      ]}
                    >
                      Coach
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formFields}>
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
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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
                    value={password}
                    onChangeText={setPassword}
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
              </View>

              {/* Login Button */}
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                size="large"
              />

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </Card>

            {/* Sign Up Prompt */}
            <View style={styles.signupPrompt}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signupLink}>Create Account</Text>
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
  roleSection: {
    marginBottom: theme.spacing.lg,
  },
  roleSectionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  roleOption: {
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
  roleOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  roleTextActive: {
    color: theme.colors.white,
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
    transform: [{ translateY: -13 }],
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  passwordToggle: {
    position: "absolute",
    right: theme.spacing.md,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  forgotPassword: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  signupText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default LoginScreen;
