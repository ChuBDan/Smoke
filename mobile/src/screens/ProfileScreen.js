import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button } from "../components";
import { logout } from "../redux/slices/authSlice";
import {
  userApi,
  smokingCessationApi,
  membershipApi,
  appointmentApi,
  badgeApi,
  paymentApi,
  httpMethods,
} from "../services/smokingCessationApi";
import theme from "../theme";

const ProfileScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [profileStats, setProfileStats] = useState({
    appointments: 0,
    daysSmokeFree: 0,
    moneySaved: 0,
  });
  const [membershipStatus, setMembershipStatus] = useState("Free");
  const [membershipPackage, setMembershipPackage] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProfileData();
    fetchUserBadges();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      if (!user?.id || !token) return;

      // Fetch member data to get membership status and package info
      try {
        const memberData = await userApi.getMemberById(user.id, token);
        // userApi now returns member data directly (updated to match web-app)
        const member = memberData || {};

        // Check if user has an active membership package
        if (member.membership_Package) {
          // Store both package info and member's subscription date
          setMembershipPackage({
            ...member.membership_Package,
            subscriptionDate: member.dateCreated, // Use member's dateCreated as subscription date
          });
          setMembershipStatus("VIP Member");
        } else if (member.plans === "VIP") {
          setMembershipStatus("VIP Member");
        } else {
          setMembershipStatus("Free Member");
        }
      } catch (memberError) {
        console.error("Error fetching member data:", memberError);
        // Set default values if member data is not accessible
        setMembershipStatus("Free Member");
      }

      // Fetch smoking cessation progress for statistics
      try {
        const progressData =
          await smokingCessationApi.getDailyProgressByMemberId(user.id, token);
        if (progressData.progresses && progressData.progresses.length > 0) {
          const latestProgress =
            progressData.progresses[progressData.progresses.length - 1];
          setProfileStats((prev) => ({
            ...prev,
            daysSmokeFree: latestProgress.daysSmokeFree || 0,
            moneySaved: latestProgress.moneySaved || 0,
          }));
        }
      } catch (progressErr) {
        if (progressErr.response?.status === 400) {
          console.warn("No progress yet for user");
        } else {
          console.error("Error fetching progress:", progressErr);
        }
      }

      // Fetch appointments count
      try {
        const appointmentsResponse =
          await appointmentApi.getAppointmentsByMember(user.id, token);

        // Use the new response structure
        const appointmentCount =
          appointmentsResponse.consultations?.length || 0;

        setProfileStats((prev) => ({
          ...prev,
          appointments: appointmentCount,
        }));

        console.log("Appointments count:", appointmentCount);
      } catch (appointmentErr) {
        // This should rarely happen now since API handles errors gracefully
        console.warn(
          "Error fetching appointment count:",
          appointmentErr.message
        );
        setProfileStats((prev) => ({
          ...prev,
          appointments: 0,
        }));
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    if (!user?.id || !token) return;

    try {
      setBadgeLoading(true);
      const badges = await badgeApi.getBadgesByMember(user.id, token);
      console.log("Fetched badges:", badges); // Debug log
      // badgeApi now returns badges array directly (updated to match web-app)
      setBadges(Array.isArray(badges) ? badges : []);
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn("No badges yet for user");
      } else {
        console.error("Error fetching badges:", error);
      }
      setBadges([]);
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleUpgradeToVIP = () => {
    Alert.alert("Upgrade to VIP", "Do you want to upgrade to VIP membership?", [
      { text: "Cancel", style: "cancel" },
      { text: "Upgrade", onPress: () => navigation.navigate("Membership") },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfileData(), fetchUserBadges()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      id: 1,
      title: "Personal Information",
      subtitle: "Update your personal details",
      icon: "person-outline",
      action: () => navigation.navigate("ProfileEdit"),
    },
    {
      id: 2,
      title: "Membership",
      subtitle: "Manage your membership plan",
      icon: "star-outline",
      action: () => navigation.navigate("Membership"),
    },
    {
      id: 3,
      title: "Smoking Cessation Progress",
      subtitle: "Track your journey to quit smoking",
      icon: "leaf-outline",
      action: () => navigation.navigate("Progress"),
    },
    {
      id: 4,
      title: "Appointments",
      subtitle: "View and manage your appointments",
      icon: "calendar-outline",
      action: () => navigation.navigate("Appointments"),
    },
    {
      id: 5,
      title: "Payment History",
      subtitle: "View your payment transactions",
      icon: "card-outline",
      action: () => navigation.navigate("PaymentHistory"),
    },
    {
      id: 6,
      title: "Help & Support",
      subtitle: "Get help or contact support",
      icon: "help-circle-outline",
      action: () =>
        Alert.alert("Help & Support", "Contact us at support@prescripto.com"),
    },
    {
      id: 7,
      title: "About",
      subtitle: "App version and information",
      icon: "information-circle-outline",
      action: () =>
        Alert.alert(
          "About",
          "Prescripto Mobile App v1.0.0\n\nA comprehensive healthcare platform for smoking cessation and medical consultations."
        ),
    },
  ];

  const MenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.action}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
    </TouchableOpacity>
  );

  const ProfileHeader = () => (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.fullName || "User Name"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
          <View style={styles.membershipBadge}>
            <Ionicons
              name="star"
              size={16}
              color={
                membershipStatus === "VIP Member"
                  ? theme.colors.warning
                  : theme.colors.gray500
              }
            />
            <Text
              style={[
                styles.membershipText,
                {
                  color:
                    membershipStatus === "VIP Member"
                      ? theme.colors.warning
                      : theme.colors.gray500,
                },
              ]}
            >
              {membershipStatus}
            </Text>
          </View>
          {membershipStatus === "Free Member" && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeToVIP}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to VIP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? (
        <View style={styles.statsContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileStats.appointments}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileStats.daysSmokeFree}</Text>
            <Text style={styles.statLabel}>Today's cigarettes</Text>
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
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
        <ProfileHeader />

        {/* Badges Section */}
        <Card style={styles.badgesCard}>
          <View style={styles.badgesHeader}>
            <Text style={styles.badgesTitle}>Achievement Badges</Text>
            <Ionicons name="trophy" size={24} color={theme.colors.warning} />
          </View>
          {badgeLoading ? (
            <View style={styles.badgesLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading badges...</Text>
            </View>
          ) : badges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.badgesContainer}
            >
              {badges.map((badge) => {
                console.log("Badge debug:", badge); // Debug log
                return (
                  <View key={badge.id} style={styles.badgeItem}>
                    <View style={styles.badgeIcon}>
                      <Text style={styles.badgeEmoji}>🏅</Text>
                    </View>
                    <Text style={styles.badgeName}>{badge.badgeName}</Text>
                    <Text style={styles.badgeDate}>
                      {(() => {
                        // Prefer sentDate, fallback to dateCreated
                        const dateString = badge.sentDate || badge.dateCreated;
                        console.log(
                          "Date string for badge:",
                          badge.badgeName,
                          dateString
                        ); // Debug log
                        if (!dateString) return "N/A";

                        // Try DD-MM-YYYY HH:mm:ss format first
                        let match = dateString.match(
                          /^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/
                        );
                        let date;
                        if (match) {
                          const [_, day, month, year, hour, minute, second] =
                            match;
                          date = new Date(
                            Number(year),
                            Number(month) - 1,
                            Number(day),
                            Number(hour),
                            Number(minute),
                            Number(second)
                          );
                        } else {
                          // Try DD-MM-YYYY format (without time)
                          match = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                          if (match) {
                            const [_, day, month, year] = match;
                            date = new Date(
                              Number(year),
                              Number(month) - 1,
                              Number(day)
                            );
                          } else {
                            // Try native Date parsing as fallback
                            date = new Date(dateString);
                          }
                        }

                        if (
                          !isNaN(date.getTime()) &&
                          date.getFullYear() >= 1970
                        ) {
                          return date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          });
                        }
                        return "N/A";
                      })()}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noBadges}>
              <Ionicons
                name="medal-outline"
                size={48}
                color={theme.colors.gray400}
              />
              <Text style={styles.noBadgesText}>No badges earned yet</Text>
              <Text style={styles.noBadgesSubtext}>
                Complete challenges to earn your first badge!
              </Text>
            </View>
          )}
        </Card>

        {/* Membership Package Section */}
        {membershipPackage && (
          <Card style={styles.membershipCard}>
            <Text style={styles.membershipCardTitle}>Membership Package</Text>
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>
                {membershipPackage.packageName}
              </Text>
              <Text style={styles.packageDescription}>
                {membershipPackage.description}
              </Text>
              <Text style={styles.packagePrice}>
                Price: {Number(membershipPackage.price).toLocaleString()} VND
              </Text>
              <Text style={styles.packageDate}>
                Subscribed:{" "}
                {membershipPackage.subscriptionDate
                  ? (() => {
                      // Parse DD-MM-YYYY format from API
                      const [day, month, year] =
                        membershipPackage.subscriptionDate.split("-");
                      const date = new Date(year, month - 1, day);
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        });
                      }
                      return membershipPackage.subscriptionDate;
                    })()
                  : ""}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.slice(0, 6).map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {menuItems.slice(6, 8).map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {menuItems.slice(8).map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.colors.error}
            />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>
            © 2024 Prescripto. All rights reserved.
          </Text>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warning + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    marginTop: theme.spacing.sm,
  },
  upgradeButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray600,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.gray200,
    marginHorizontal: theme.spacing.md,
  },
  menuSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: theme.colors.gray600,
  },
  logoutSection: {
    marginVertical: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + "30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  // Badges Section Styles
  badgesCard: {
    marginBottom: theme.spacing.lg,
  },
  badgesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  badgesLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.gray600,
  },
  badgesContainer: {
    paddingVertical: theme.spacing.sm,
  },
  badgeItem: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    width: 80,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  badgeDate: {
    fontSize: 10,
    color: theme.colors.gray500,
    textAlign: "center",
  },
  noBadges: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  noBadgesText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray600,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  noBadgesSubtext: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: "center",
  },
  // Membership Package Styles
  membershipCard: {
    marginBottom: theme.spacing.lg,
  },
  membershipCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  packageInfo: {
    backgroundColor: theme.colors.primary + "10",
    padding: theme.spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  packageDescription: {
    fontSize: 14,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.sm,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  packageDate: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
});

export default ProfileScreen;
