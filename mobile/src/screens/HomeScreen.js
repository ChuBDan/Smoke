import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../components";
import { logout } from "../redux/slices/authSlice";
import theme from "../theme";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const specialties = [
    { name: "General physician", icon: "medical-outline" },
    { name: "Gynecologist", icon: "woman-outline" },
    { name: "Dermatologist", icon: "body-outline" },
    { name: "Pediatricians", icon: "happy-outline" },
    { name: "Neurologist", icon: "pulse-outline" },
    { name: "Gastroenterologist", icon: "restaurant-outline" },
  ];

  const topDoctors = [
    {
      id: 1,
      name: "Dr. Richard James",
      specialty: "General physician",
      experience: "4 Years",
      image: "https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=RJ",
      available: true,
    },
    {
      id: 2,
      name: "Dr. Emily Watson",
      specialty: "Gynecologist",
      experience: "3 Years",
      image: "https://via.placeholder.com/120x120/EC4899/FFFFFF?text=EW",
      available: true,
    },
    {
      id: 3,
      name: "Dr. Sarah Brown",
      specialty: "Dermatologist",
      experience: "1 Years",
      image: "https://via.placeholder.com/120x120/10B981/FFFFFF?text=SB",
      available: false,
    },
  ];

  // Welcome Header with user greeting
  const WelcomeHeader = () => (
    <View style={styles.welcomeHeader}>
      <View style={styles.welcomeContent}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.fullName || "User"}</Text>
        <Text style={styles.subGreeting}>How are you feeling today?</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={styles.profileButton}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Web-app style Header Banner
  const HeaderBanner = () => (
    <View style={styles.headerBanner}>
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTitle}>
            Book Appointment{"\n"}With Trusted Doctors
          </Text>
          <View style={styles.bannerSubContent}>
            <View style={styles.groupProfiles}>
              <View
                style={[
                  styles.profileCircle,
                  { backgroundColor: theme.colors.success },
                ]}
              />
              <View
                style={[
                  styles.profileCircle,
                  { backgroundColor: theme.colors.warning, marginLeft: -8 },
                ]}
              />
              <View
                style={[
                  styles.profileCircle,
                  { backgroundColor: theme.colors.error, marginLeft: -8 },
                ]}
              />
            </View>
            <Text style={styles.bannerSubtitle}>
              Simply browse through our extensive list of trusted doctors,{"\n"}
              schedule your appointment hassle-free.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookAppointmentBtn}
            onPress={() => navigation.navigate("Appointments")}
          >
            <Text style={styles.bookAppointmentText}>Book appointment</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.gray600}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bannerRight}>
          <View style={styles.headerImageContainer}>
            <Image
              source={{
                uri: "https://via.placeholder.com/300x400/E5E7EB/6B7280?text=Doctor",
              }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // Quick Actions Section
  const QuickActions = () => (
    <View style={styles.specialtySection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Text style={styles.sectionSubtitle}>
        Take control of your smoking cessation journey with these quick actions.
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("SmokingStatusForm")}
        >
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="sparkles" size={24} color={theme.colors.success} />
          </View>
          <Text style={styles.quickActionText}>AI Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Progress")}
        >
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="leaf" size={24} color={theme.colors.success} />
          </View>
          <Text style={styles.quickActionText}>Track Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Membership")}
        >
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="star" size={24} color={theme.colors.warning} />
          </View>
          <Text style={styles.quickActionText}>Upgrade Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Appointments")}
        >
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Book Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="person" size={24} color={theme.colors.info} />
          </View>
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Top Doctors Section
  const TopDoctorsSection = () => (
    <View style={styles.topDoctorsSection}>
      <Text style={styles.sectionTitle}>Top Doctors to Book</Text>
      <Text style={styles.sectionSubtitle}>
        Simply browse through our extensive list of trusted doctors.
      </Text>

      <View style={styles.doctorsGrid}>
        {topDoctors.map((doctor) => (
          <TouchableOpacity key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorImageContainer}>
              <Image
                source={{ uri: doctor.image }}
                style={styles.doctorImage}
              />
              <View
                style={[
                  styles.availabilityIndicator,
                  {
                    backgroundColor: doctor.available
                      ? theme.colors.success
                      : theme.colors.gray400,
                  },
                ]}
              />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>more</Text>
      </TouchableOpacity>
    </View>
  );

  // Banner at bottom (Create Account section)
  const BottomBanner = () => (
    <View style={styles.bottomBanner}>
      <View style={styles.bottomBannerContent}>
        <View style={styles.bottomBannerLeft}>
          <Text style={styles.bottomBannerTitle}>
            Book Appointment{"\n"}With 100+ Trusted Doctors
          </Text>
          <TouchableOpacity style={styles.createAccountBtn}>
            <Text style={styles.createAccountText}>Create account</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomBannerRight}>
          <Image
            source={{
              uri: "https://via.placeholder.com/250x300/E5E7EB/6B7280?text=Appointment",
            }}
            style={styles.appointmentImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader />
        <HeaderBanner />
        <QuickActions />
        <TopDoctorsSection />
        <BottomBanner />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },

  // Welcome Header
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subGreeting: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  profileButton: {
    marginLeft: theme.spacing.sm,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.white,
  },

  // Header Banner (Web-app style)
  headerBanner: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: {
    flex: 1,
    paddingRight: theme.spacing.lg,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.white,
    lineHeight: 40,
    marginBottom: theme.spacing.md,
  },
  bannerSubContent: {
    marginBottom: theme.spacing.lg,
  },
  groupProfiles: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  bookAppointmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  bookAppointmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray700,
    marginRight: theme.spacing.sm,
  },
  bannerRight: {
    alignItems: "center",
  },
  headerImageContainer: {
    position: "relative",
  },
  headerImage: {
    width: width * 0.35,
    height: width * 0.45,
    borderRadius: 20,
  },

  // Specialty Section
  specialtySection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.gray900,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.gray600,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  specialtyScrollContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  specialtyItem: {
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    width: 100,
  },
  specialtyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.gray50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.gray700,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 16,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "48%",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.gray50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray700,
    textAlign: "center",
    fontWeight: theme.fontWeight.medium,
  },

  // Top Doctors Section
  topDoctorsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  doctorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  doctorCard: {
    width: "48%",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    alignItems: "center",
  },
  doctorImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  availabilityIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 5,
    right: 5,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  doctorInfo: {
    alignItems: "center",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  doctorSpecialty: {
    fontSize: 12,
    color: theme.colors.gray600,
    textAlign: "center",
  },
  moreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
    alignSelf: "center",
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.white,
  },

  // Bottom Banner
  bottomBanner: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: 16,
    overflow: "hidden",
  },
  bottomBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  bottomBannerLeft: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  bottomBannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.white,
    lineHeight: 30,
    marginBottom: theme.spacing.md,
  },
  createAccountBtn: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  createAccountText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  bottomBannerRight: {
    alignItems: "center",
  },
  appointmentImage: {
    width: width * 0.25,
    height: width * 0.3,
  },
});

export default HomeScreen;
