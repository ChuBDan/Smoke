import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { addDays, addHours, format, startOfWeek } from "date-fns";
import { Input, Button, Card } from "../components";
import { userApi, coachApi } from "../services/smokingCessationApi";
import theme from "../theme";

const WEEK_DAYS = 7;
const SLOT_LABELS = [
  "08AM-09AM",
  "09AM-10AM",
  "10AM-11AM",
  "11AM-12PM",
  "01PM-02PM",
  "02PM-03PM",
  "03PM-04PM",
  "04PM-05PM",
];

const getStartHour24 = (slot) => {
  const raw = slot.split("-")[0];
  const hour = parseInt(raw.replace(/AM|PM/, ""), 10);
  return raw.includes("PM") && hour < 12 ? hour + 12 : hour;
};

const buildWeekDays = (anchor) =>
  Array.from({ length: WEEK_DAYS }, (_, i) => {
    const d = addDays(anchor, i);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "long" }),
      short: d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
      }),
      date: d,
    };
  });

const BookAppointmentScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const weekAnchor = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    []
  );
  const weekDays = useMemo(() => buildWeekDays(weekAnchor), [weekAnchor]);

  // Generate next 7 days for date selection
  const availableDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString("en-US", { month: "short" }),
        isToday: i === 0,
      };
    });
  }, []);

  useEffect(() => {
    fetchCoaches();
    fetchAppointments();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const response = await coachApi.getAllCoaches(token);
      const coachesData = response?.coaches || response?.data?.coaches || [];
      const activeCoaches = coachesData.filter(
        (coach) => coach.status === "ACTIVE"
      );
      setCoaches(activeCoaches);
    } catch (error) {
      // Simplified error handling - no console.error to avoid Expo warnings
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.id || !token) return;
    try {
      const response = await userApi.getAppointmentsByMember(user.id, token);
      const appointmentsList = response?.consultations || [];
      setAppointments(appointmentsList);
    } catch (error) {
      // Simplified error handling
      setAppointments([]);
    }
  };

  const isSlotBooked = (dateObj, slot, coachId, memberId) => {
    const dayKey = format(dateObj, "dd-MM-yyyy");
    const hour24 = getStartHour24(slot);
    const hourKey = String(hour24).padStart(2, "0") + ":00:00";

    return appointments.find(
      (a) =>
        a.coach?.id?.toString() === coachId?.toString() &&
        a.member?.id?.toString() === memberId?.toString() &&
        a.status === "ACTIVE" &&
        a.consultationDate?.startsWith(dayKey) &&
        a.consultationDate?.includes(hourKey)
    );
  };

  const getAvailableTimeSlotsForDate = (date) => {
    return SLOT_LABELS.map((slot) => {
      const booked = isSlotBooked(date, slot, selectedCoach, user.id);
      return {
        slot,
        isBooked: !!booked,
        isAvailable: !booked && selectedCoach,
      };
    });
  };

  const handleBookAppointment = async () => {
    if (!selectedCoach || !selectedSlot) {
      Alert.alert("Validation Error", "Please select a coach and time slot");
      return;
    }

    const { time } = selectedSlot;
    const start = new Date(selectedDate);
    start.setHours(getStartHour24(time), 0, 0, 0);

    if (start <= new Date()) {
      Alert.alert("Validation Error", "Please select a future start time");
      return;
    }

    const payload = {
      consultationDate: format(start, "dd-MM-yyyy HH:mm:ss"),
      startDate: format(start, "dd-MM-yyyy HH:mm:ss"),
      endDate: format(addHours(start, 1), "dd-MM-yyyy HH:mm:ss"),
      notes: notes.trim() || "Health consultation",
    };

    try {
      setSubmitting(true);
      await userApi.createConsultation(selectedCoach, user.id, payload, token);

      Alert.alert("Success", "Appointment booked successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);

      setSelectedSlot(null);
      setNotes("");
      await fetchAppointments();
    } catch (error) {
      Alert.alert("Booking Failed", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading coaches...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Select Coach */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👨‍⚕️</Text>
            <Text style={styles.sectionTitle}>Select Coach *</Text>
          </View>

          {coaches.length === 0 ? (
            <Text style={styles.noCoachesText}>
              No active coaches available
            </Text>
          ) : (
            <View style={styles.coachSelector}>
              <Text style={styles.dropdownLabel}>Choose a suitable coach</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coachScrollContainer}
              >
                {coaches.map((coach) => (
                  <TouchableOpacity
                    key={coach.id}
                    style={[
                      styles.coachCard,
                      selectedCoach === coach.id.toString() &&
                        styles.selectedCoachCard,
                    ]}
                    onPress={() => setSelectedCoach(coach.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View style={styles.coachAvatar}>
                      <Text style={styles.coachInitial}>
                        {coach.name?.charAt(0) ||
                          coach.fullName?.charAt(0) ||
                          "C"}
                      </Text>
                    </View>
                    <Text style={styles.coachName} numberOfLines={2}>
                      {coach.name || coach.fullName || "Coach"}
                    </Text>
                    <Text style={styles.coachSpecialty} numberOfLines={1}>
                      {coach.expertise || coach.specialty || "Health Coach"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Card>

        {/* Date & Time Selection */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📅</Text>
            <Text style={styles.sectionTitle}>Select Date & Time</Text>
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text style={styles.subsectionTitle}>Choose Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContainer}
            >
              {availableDates.map((dateItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    selectedDate.toDateString() ===
                      dateItem.date.toDateString() && styles.selectedDateCard,
                    dateItem.isToday && styles.todayDateCard,
                  ]}
                  onPress={() => {
                    setSelectedDate(dateItem.date);
                    setSelectedSlot(null); // Reset time selection
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateCardDay,
                      selectedDate.toDateString() ===
                        dateItem.date.toDateString() &&
                        styles.selectedDateCardDay,
                    ]}
                  >
                    {dateItem.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dateCardNumber,
                      selectedDate.toDateString() ===
                        dateItem.date.toDateString() &&
                        styles.selectedDateCardNumber,
                    ]}
                  >
                    {dateItem.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.dateCardMonth,
                      selectedDate.toDateString() ===
                        dateItem.date.toDateString() &&
                        styles.selectedDateCardMonth,
                    ]}
                  >
                    {dateItem.monthName}
                  </Text>
                  {dateItem.isToday && (
                    <View style={styles.todayIndicator}>
                      <Text style={styles.todayText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.timeSection}>
            <Text style={styles.subsectionTitle}>
              Available Times for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>

            {!selectedCoach ? (
              <View style={styles.noCoachMessage}>
                <Text style={styles.noCoachMessageText}>
                  👆 Please select a coach first to see available times
                </Text>
              </View>
            ) : (
              <View style={styles.timeGrid}>
                {getAvailableTimeSlotsForDate(selectedDate).map(
                  (timeSlot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        timeSlot.isBooked && styles.bookedTimeSlot,
                        selectedSlot?.time === timeSlot.slot &&
                          styles.selectedTimeSlot,
                        !timeSlot.isAvailable && styles.disabledTimeSlot,
                      ]}
                      onPress={() => {
                        if (timeSlot.isAvailable) {
                          setSelectedSlot({ time: timeSlot.slot });
                        }
                      }}
                      disabled={!timeSlot.isAvailable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.timeSlotContent}>
                        <Text
                          style={[
                            styles.timeSlotText,
                            timeSlot.isBooked && styles.bookedTimeSlotText,
                            selectedSlot?.time === timeSlot.slot &&
                              styles.selectedTimeSlotText,
                            !timeSlot.isAvailable &&
                              styles.disabledTimeSlotText,
                          ]}
                        >
                          {timeSlot.slot}
                        </Text>
                        <View style={styles.timeSlotStatus}>
                          {timeSlot.isBooked ? (
                            <Text style={styles.bookedStatusText}>
                              ❌ Booked
                            </Text>
                          ) : selectedSlot?.time === timeSlot.slot ? (
                            <Text style={styles.selectedStatusText}>
                              ✅ Selected
                            </Text>
                          ) : timeSlot.isAvailable ? (
                            <Text style={styles.availableStatusText}>
                              ✨ Available
                            </Text>
                          ) : (
                            <Text style={styles.disabledStatusText}>
                              🔒 Select Coach
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          </View>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="E.g., mental health consultation, nutrition, health concerns..."
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            blurOnSubmit={true}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (Platform.OS === "ios" || Platform.OS === "android") {
                // Dismiss keyboard on submit
                if (typeof Keyboard !== "undefined" && Keyboard.dismiss) {
                  Keyboard.dismiss();
                }
              }
            }}
          />
        </Card>

        {/* Book Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleBookAppointment}
            style={[
              styles.bookButton,
              (!selectedCoach || !selectedSlot || submitting) &&
                styles.disabledButton,
            ]}
            disabled={!selectedCoach || !selectedSlot || submitting}
          >
            {submitting ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text style={styles.loadingButtonText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📅</Text>
                <Text
                  style={[styles.bookButtonText, { color: theme.colors.white }]}
                >
                  Confirm Appointment
                </Text>
              </View>
            )}
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
    padding: theme.spacing.xs,
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
  },
  content: {
    flex: 1,
    todayIndicator: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: theme.colors.success,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      minWidth: 40,
      alignItems: "center",
    },
    padding: theme.spacing.lg,
  },
  headerCard: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xl,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
  },
  coachSelector: {
    gap: theme.spacing.md,
  },
  coachScrollContainer: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  dropdownLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  noCoachesText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.gray500,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  coachCard: {
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
    width: 140,
    marginRight: theme.spacing.md,
    shadowColor: theme.colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCoachCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  coachInitial: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  coachName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  coachSpecialty: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray500,
    textAlign: "center",
  },
  // Date & Time Selection Styles
  dateSection: {
    marginBottom: theme.spacing.xl,
  },
  subsectionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  dateScrollContainer: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  dateCard: {
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
    minWidth: 80,
    marginRight: theme.spacing.sm,
    shadowColor: theme.colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedDateCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  todayDateCard: {
    borderColor: theme.colors.success,
  },
  dateCardDay: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.xs,
  },
  selectedDateCardDay: {
    color: theme.colors.white,
  },
  dateCardNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
  },
  selectedDateCardNumber: {
    color: theme.colors.white,
  },
  dateCardMonth: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray500,
  },
  selectedDateCardMonth: {
    color: theme.colors.white,
  },
  todayIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  todayText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
    marginTop: -2, // Center vertically
  },
  timeSection: {
    marginTop: theme.spacing.md,
  },
  noCoachMessage: {
    backgroundColor: theme.colors.warning + "20",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  noCoachMessageText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.warning,
    textAlign: "center",
    fontWeight: theme.fontWeight.medium,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  timeSlot: {
    flex: 1,
    minWidth: "48%",
    maxWidth: "48%",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.gray900,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTimeSlot: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + "20",
    shadowColor: theme.colors.success,
    shadowOpacity: 0.3,
  },
  bookedTimeSlot: {
    borderColor: theme.colors.error + "60",
    backgroundColor: theme.colors.error + "10",
  },
  disabledTimeSlot: {
    borderColor: theme.colors.gray100,
    backgroundColor: theme.colors.gray50,
    opacity: 0.6,
  },
  timeSlotContent: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  timeSlotText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray800,
  },
  selectedTimeSlotText: {
    color: theme.colors.success,
  },
  bookedTimeSlotText: {
    color: theme.colors.error,
  },
  disabledTimeSlotText: {
    color: theme.colors.gray400,
  },
  timeSlotStatus: {
    marginTop: theme.spacing.xs,
  },
  availableStatusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray600,
    fontWeight: theme.fontWeight.medium,
  },
  selectedStatusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  bookedStatusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold,
  },
  disabledStatusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray400,
    fontWeight: theme.fontWeight.medium,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
    fontSize: theme.fontSize.base,
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.gray900,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  loadingButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  buttonIcon: {
    fontSize: 24,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
  },
});

export default BookAppointmentScreen;
