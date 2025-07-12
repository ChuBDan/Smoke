import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button } from "../components";
import { userApi } from "../services/smokingCessationApi";
import theme from "../theme";

const AppointmentsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id || !token) return;

      try {
        const response = await userApi.getAppointmentsByMember(user.id, token);
        setAppointments(response.consultations || []);
      } catch (apiError) {
        // If API fails, show empty state instead of hardcoded data
        console.log(
          "Appointments API not available or user has no appointments"
        );
        setAppointments([]);
        if (apiError.response?.status !== 404) {
          setError("Unable to load appointments. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  // Filter appointments based on active tab and date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  const upcomingAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today && apt.status !== "completed";
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today || apt.status === "completed";
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "completed":
        return theme.colors.gray500;
      default:
        return theme.colors.gray500;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <Card style={styles.appointmentCard}>
      <View style={styles.appointmentContent}>
        <Image
          source={{
            uri:
              appointment.image ||
              "https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=DR",
          }}
          style={styles.doctorImage}
        />
        <View style={styles.appointmentInfo}>
          <Text style={styles.doctorName}>
            {appointment.doctor || appointment.doctorName}
          </Text>
          <Text style={styles.doctorSpecialty}>
            {appointment.specialty || appointment.speciality}
          </Text>
          <View style={styles.appointmentDateTime}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.gray500}
            />
            <Text style={styles.appointmentDate}>
              {new Date(appointment.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.appointmentDateTime}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.gray500}
            />
            <Text style={styles.appointmentTime}>{appointment.time}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(appointment.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentActions}>
          {appointment.status === "confirmed" && (
            <View style={styles.statusIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.confirmedText}>Confirmed</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const EmptyState = ({ type }) => (
    <View style={styles.emptyState}>
      <Ionicons
        name={type === "upcoming" ? "calendar-outline" : "time-outline"}
        size={64}
        color={theme.colors.gray400}
      />
      <Text style={styles.emptyTitle}>No {type} appointments</Text>
      <Text style={styles.emptySubtitle}>
        {type === "upcoming"
          ? "You don't have any upcoming appointments scheduled."
          : "You don't have any past appointments yet."}
      </Text>
      {type === "upcoming" && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("BookAppointment")}
        >
          <Text style={styles.bookButtonText}>Book New Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("BookAppointment")}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.activeTabText,
            ]}
          >
            Past ({pastAppointments.length})
          </Text>
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
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={theme.colors.error}
            />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchAppointments}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === "upcoming" ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <EmptyState type="upcoming" />
          )
        ) : pastAppointments.length > 0 ? (
          pastAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <EmptyState type="past" />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.gray600,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
  },
  appointmentContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.md,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  appointmentDateTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  appointmentDate: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginLeft: theme.spacing.xs,
  },
  appointmentTime: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginLeft: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    marginTop: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.white,
  },
  appointmentActions: {
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.success + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  confirmedText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.gray600,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    marginTop: theme.spacing.sm,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: 14,
    color: theme.colors.gray600,
    textAlign: "center",
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

export default AppointmentsScreen;
