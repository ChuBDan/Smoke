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
import { membershipApi, userApi } from "../../services/smokingCessationApi";
import theme from "../../theme";

const MembershipScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("free");
  const [currentPackage, setCurrentPackage] = useState(null);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) return;

      // Fetch membership packages
      const packagesData = await membershipApi.getAllMembershipPackages(token);
      const activePackages =
        packagesData.membership_Packages?.filter(
          (pkg) => pkg.status === "ACTIVE"
        ) || [];
      setPackages(activePackages);

      // Check current membership status
      if (user?.id) {
        const memberData = await userApi.getMemberById(user.id, token);
        console.log("Full API response:", JSON.stringify(memberData, null, 2));

        // Handle different API response structures
        const member = memberData.member || memberData;
        console.log("Extracted member:", JSON.stringify(member, null, 2));

        if (member && member.membership_Package) {
          console.log("Setting current package:", member.membership_Package);
          setCurrentPackage(member.membership_Package);

          // Check the package name to determine membership status
          if (member.membership_Package.packageName === "VIP") {
            console.log("Setting membership status to VIP");
            setMembershipStatus("vip");
          } else {
            console.log("Setting membership status to premium");
            setMembershipStatus("premium"); // They have a package but not VIP
          }
        } else {
          console.log("No membership package found, setting to free");
          setMembershipStatus("free");
        }
      }
    } catch (err) {
      setError("Failed to load membership data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleBuyPackage = async (packageId, packageName) => {
    try {
      Alert.alert(
        "Confirm Purchase",
        `Are you sure you want to purchase ${packageName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Purchase",
            onPress: async () => {
              try {
                const response = await membershipApi.buyMembershipPackage(
                  packageId,
                  user.id,
                  token
                );

                // Handle payment URL if provided
                if (response.token) {
                  Alert.alert(
                    "Payment Required",
                    "You will be redirected to complete the payment.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Continue",
                        onPress: () => {
                          // In a real app, you'd open a WebView or external browser
                          console.log("Payment URL:", response.token);
                          Alert.alert(
                            "Info",
                            "Payment processing would happen here."
                          );
                        },
                      },
                    ]
                  );
                }

                // Refresh membership status
                await fetchData();

                Alert.alert("Success", "Membership purchased successfully!");
              } catch (err) {
                console.error("Error buying package:", err);
                Alert.alert(
                  "Error",
                  "Failed to purchase membership. Please try again."
                );
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error in handleBuyPackage:", err);
    }
  };

  const PackageCard = ({ pkg }) => {
    const isCurrentPackage = currentPackage && currentPackage.id === pkg.id;
    const isFreeUser = membershipStatus === "free";
    const hasAnyPackage = membershipStatus !== "free";

    console.log(
      `Package: ${pkg.packageName}, isCurrentPackage: ${isCurrentPackage}, isFreeUser: ${isFreeUser}, hasAnyPackage: ${hasAnyPackage}`
    );
    console.log(`Current package state:`, currentPackage);
    console.log(`Membership status:`, membershipStatus);
    console.log(`Package ID comparison: ${currentPackage?.id} === ${pkg.id}`);

    return (
      <Card
        style={[
          styles.packageCard,
          isCurrentPackage && styles.currentPackageCard,
        ]}
      >
        {isCurrentPackage && (
          <>
            <View style={styles.currentBadge}>
              <Ionicons name="star" size={14} color={theme.colors.white} />
              <Text style={styles.currentBadgeText}>Active Plan</Text>
            </View>
            <View style={styles.currentGlowEffect} />
          </>
        )}

        <View style={styles.packageHeader}>
          <View style={styles.packageTitleRow}>
            <Text
              style={[
                styles.packageName,
                isCurrentPackage && styles.currentPackageName,
              ]}
            >
              {pkg.packageName || pkg.name}
            </Text>
            {isCurrentPackage && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeIndicatorDot} />
                <Text style={styles.activeIndicatorText}>Active</Text>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text
              style={[styles.price, isCurrentPackage && styles.currentPrice]}
            >
              {Number(pkg.price).toLocaleString()} VND
            </Text>
            <Text
              style={[
                styles.duration,
                isCurrentPackage && styles.currentDuration,
              ]}
            >
              /{pkg.duration || "30"} days
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.packageDescription,
            isCurrentPackage && styles.currentPackageDescription,
          ]}
        >
          {pkg.description}
        </Text>

        <View style={styles.featuresContainer}>
          <View
            style={[
              styles.featureItem,
              isCurrentPackage && styles.currentFeatureItem,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={
                isCurrentPackage ? theme.colors.primary : theme.colors.success
              }
            />
            <Text
              style={[
                styles.featureText,
                isCurrentPackage && styles.currentFeatureText,
              ]}
            >
              Access to smoking cessation programs
            </Text>
          </View>
          <View
            style={[
              styles.featureItem,
              isCurrentPackage && styles.currentFeatureItem,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={
                isCurrentPackage ? theme.colors.primary : theme.colors.success
              }
            />
            <Text
              style={[
                styles.featureText,
                isCurrentPackage && styles.currentFeatureText,
              ]}
            >
              Priority appointment booking
            </Text>
          </View>
          <View
            style={[
              styles.featureItem,
              isCurrentPackage && styles.currentFeatureItem,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={
                isCurrentPackage ? theme.colors.primary : theme.colors.success
              }
            />
            <Text
              style={[
                styles.featureText,
                isCurrentPackage && styles.currentFeatureText,
              ]}
            >
              24/7 support access
            </Text>
          </View>
          {pkg.packageName?.toLowerCase() === "vip" && (
            <View
              style={[
                styles.featureItem,
                isCurrentPackage && styles.currentFeatureItem,
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={
                  isCurrentPackage ? theme.colors.primary : theme.colors.success
                }
              />
              <Text
                style={[
                  styles.featureText,
                  isCurrentPackage && styles.currentFeatureText,
                ]}
              >
                Exclusive coach consultations
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.packageButton,
            isCurrentPackage && styles.currentPackageButton,
            (isCurrentPackage ||
              (hasAnyPackage && pkg.packageName?.toLowerCase() !== "vip")) &&
              styles.disabledButton,
          ]}
          onPress={() => handleBuyPackage(pkg.id, pkg.packageName || pkg.name)}
          disabled={
            isCurrentPackage ||
            (hasAnyPackage && pkg.packageName?.toLowerCase() !== "vip")
          }
        >
          {isCurrentPackage && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={theme.colors.white}
              style={styles.buttonIcon}
            />
          )}
          <Text
            style={[
              styles.packageButtonText,
              isCurrentPackage && styles.currentPackageButtonText,
            ]}
          >
            {isCurrentPackage
              ? "Active Plan"
              : hasAnyPackage && pkg.packageName?.toLowerCase() !== "vip"
              ? "Already Subscribed"
              : isFreeUser
              ? "Purchase"
              : "Upgrade to VIP"}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading membership packages...</Text>
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={{ width: 24 }} />
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
          <Text style={styles.heroTitle}>
            {membershipStatus === "vip"
              ? "Upgrade Options"
              : "Choose Your Plan"}
          </Text>
          <Text style={styles.heroSubtitle}>
            Select the perfect membership plan to enhance your smoke-free
            journey
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </View>
        )}

        {packages.length === 0 && !loading && !error && (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={64}
              color={theme.colors.gray400}
            />
            <Text style={styles.emptyTitle}>No packages available</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for membership options
            </Text>
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
  packagesContainer: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  packageCard: {
    padding: theme.spacing.lg,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  packageName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  duration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  packageDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  buyButton: {
    marginTop: theme.spacing.md,
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
  },
  // New styles for improved features
  currentPackageSection: {
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  currentPackageInfo: {
    backgroundColor: theme.colors.primary + "10",
    padding: theme.spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  currentPackageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  currentPackagePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  currentPackageDate: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  currentPackageCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "05",
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  currentBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  currentGlowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  currentBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  packageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPackageName: {
    color: theme.colors.primary,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
  },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  activeIndicatorText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.success,
  },
  currentPrice: {
    color: theme.colors.primary,
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
  },
  currentDuration: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  currentPackageDescription: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  currentFeatureItem: {
    backgroundColor: theme.colors.primary + "10",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 8,
    marginVertical: 2,
  },
  currentFeatureText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  packageButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  packageButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  currentPackageButton: {
    backgroundColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.success,
    shadowColor: theme.colors.success,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentPackageButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  buttonIcon: {
    marginRight: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray200,
    opacity: 0.6,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MembershipScreen;
