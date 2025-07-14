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
  Linking,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button } from "../components";
import { userApi, appointmentApi } from "../services/smokingCessationApi";
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

      if (!user?.id || !token) {
        console.warn("No user ID or token available");
        return;
      }

      console.log("Fetching appointments for member:", user.id);

      // Use the improved API call that matches web-app pattern
      const response = await appointmentApi.getAppointmentsByMember(
        user.id,
        token
      );

      console.log("Appointments API response:", response);

      // The API now returns { consultations, success, message }
      const consultations = response.consultations || [];

      // Map the API response to match the expected format
      const mappedAppointments = consultations.map((consultation) => {
        // Parse the consultation date to extract date and time
        const consultationDate = new Date(
          consultation.consultationDate.replace(
            /(\d{2})-(\d{2})-(\d{4})/,
            "$3-$2-$1"
          )
        );

        return {
          id: consultation.id,
          date: consultationDate.toISOString(),
          time: consultationDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          doctor:
            consultation.coach?.name ||
            consultation.coach?.fullName ||
            "Unknown Coach",
          doctorName:
            consultation.coach?.name ||
            consultation.coach?.fullName ||
            "Unknown Coach",
          specialty:
            consultation.coach?.expertise ||
            consultation.coach?.specialty ||
            "Health Coach",
          speciality:
            consultation.coach?.expertise ||
            consultation.coach?.specialty ||
            "Health Coach",
          status:
            consultation.status === "ACTIVE"
              ? "confirmed"
              : consultation.status.toLowerCase(),
          notes: consultation.notes || "",
          googleMeetLink: consultation.googleMeetLink || "",
          image: consultation.coach?.profileImage || consultation.coach?.avatar,
          // Keep original data for reference
          originalData: consultation,
        };
      });

      setAppointments(mappedAppointments);

      if (!response.success && consultations.length === 0) {
        console.warn(
          "API reported failure but no error thrown:",
          response.message
        );
      }
    } catch (err) {
      // This should rarely happen now since API handles errors gracefully
      console.error("Unexpected error fetching appointments:", err);
      setAppointments([]);
      setError("Unable to load appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleJoinMeeting = async (meetLink, appointmentData) => {
    try {
      Alert.alert(
        "Join Video Call",
        `Join your appointment with ${appointmentData.doctor}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Join",
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(meetLink);
                if (supported) {
                  await Linking.openURL(meetLink);
                } else {
                  Alert.alert(
                    "Unable to open link",
                    "Please copy the link and open it in your browser.",
                    [
                      {
                        text: "Copy Link",
                        onPress: () => {
                          Clipboard.setString(meetLink);
                          Alert.alert(
                            "Link Copied",
                            "The meeting link has been copied to your clipboard."
                          );
                        },
                      },
                      { text: "OK" },
                    ]
                  );
                }
              } catch (error) {
                console.error("Error opening Google Meet link:", error);
                Alert.alert(
                  "Error",
                  "Unable to open the meeting link. Please try again."
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error handling meeting join:", error);
      Alert.alert("Error", "Unable to join the meeting. Please try again.");
    }
  };

  const handleCancelAppointment = async (appointmentId, appointmentData) => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${appointmentData.doctor}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentApi.cancelAppointment(appointmentId, token);
              Alert.alert("Success", "Appointment cancelled successfully");
              fetchAppointments(); // Refresh appointments
            } catch (error) {
              console.error("Error cancelling appointment:", error);
              Alert.alert(
                "Error",
                "Failed to cancel appointment. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Filter appointments based on active tab and date
  const now = new Date();

  const upcomingAppointments = appointments.filter((apt) => {
    const appointmentDateTime = new Date(apt.date);
    // Upcoming: appointment datetime is in the future and status is active/confirmed
    const isUpcoming =
      appointmentDateTime > now &&
      (apt.status === "confirmed" ||
        apt.status === "ACTIVE" ||
        apt.status === "pending" ||
        apt.status === "PENDING");
    return isUpcoming;
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDateTime = new Date(apt.date);
    // Past: appointment datetime is in the past OR status is completed/cancelled
    const isPast =
      appointmentDateTime <= now ||
      apt.status === "completed" ||
      apt.status === "COMPLETED" ||
      apt.status === "cancelled" ||
      apt.status === "CANCELLED";
    return isPast;
  });

  console.log(
    `Total appointments: ${appointments.length}, Upcoming: ${upcomingAppointments.length}, Past: ${pastAppointments.length}`
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "ACTIVE":
        return theme.colors.success;
      case "pending":
      case "PENDING":
        return theme.colors.warning;
      case "completed":
      case "COMPLETED":
        return theme.colors.gray500;
      case "cancelled":
      case "CANCELLED":
        return theme.colors.error;
      default:
        return theme.colors.gray500;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
      case "ACTIVE":
        return "Confirmed";
      case "pending":
      case "PENDING":
        return "Pending";
      case "completed":
      case "COMPLETED":
        return "Completed";
      case "cancelled":
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const AppointmentCard = ({ appointment }) => {
    return (
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
            <View style={styles.headerRow}>
              <View style={styles.doctorInfoHeader}>
                <Text style={styles.doctorName}>
                  {appointment.doctor ||
                    appointment.doctorName ||
                    "Unknown Doctor"}
                </Text>
                <Text style={styles.doctorSpecialty}>
                  {appointment.specialty ||
                    appointment.speciality ||
                    "Health Coach"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadgeTopRight,
                  { backgroundColor: getStatusColor(appointment.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </View>
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
              <Text style={styles.appointmentTime}>
                {appointment.time}
                {appointment.originalData?.endDate && (
                  <Text style={styles.appointmentDuration}> (1 hour)</Text>
                )}
              </Text>
            </View>
            {appointment.notes && (
              <View style={styles.appointmentDateTime}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={theme.colors.gray500}
                />
                <Text style={styles.appointmentNotes} numberOfLines={2}>
                  {appointment.notes}
                </Text>
              </View>
            )}
            {/* Action Buttons */}
            <View style={styles.actionButtonsOnly}>
              {appointment.googleMeetLink && (
                <TouchableOpacity
                  style={styles.meetButton}
                  onPress={() =>
                    handleJoinMeeting(appointment.googleMeetLink, appointment)
                  }
                >
                  <Ionicons
                    name="videocam-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.meetButtonText}>Join</Text>
                </TouchableOpacity>
              )}
              {(appointment.status === "confirmed" ||
                appointment.status === "ACTIVE") && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>
                    handleCancelAppointment(appointment.id, appointment)
                  }
                >
                  <Ionicons
                    name="close-outline"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  doctorInfoHeader: {
    flex: 1,
    marginRight: theme.spacing.sm,
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
  appointmentDuration: {
    fontSize: 12,
    color: theme.colors.gray400,
    fontStyle: "italic",
  },
  appointmentNotes: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  statusBadgeTopRight: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.white,
  },
  actionButtonsOnly: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  meetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  meetButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.error + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  cancelButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
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
