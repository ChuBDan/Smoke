import React, { useState, useEffect } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Input, Button, Card } from "../components";
import { userApi } from "../services/smokingCessationApi";
import theme from "../theme";

const BookAppointmentScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const response = await userApi.getAllCoaches(token);
      const activeCoaches = (response.coaches || []).filter(
        (coach) => coach.status === "ACTIVE"
      );
      setCoaches(activeCoaches);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      Alert.alert("Error", "Failed to load coaches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (timeString) => {
    return timeString + ":00";
  };

  const handleBookAppointment = async () => {
    try {
      // Validation
      if (!selectedCoach) {
        Alert.alert("Validation Error", "Please select a coach");
        return;
      }

      if (!selectedDate) {
        Alert.alert("Validation Error", "Please select a date");
        return;
      }

      if (!selectedTime) {
        Alert.alert("Validation Error", "Please select a time");
        return;
      }

      // Check if selected date/time is in the future
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (appointmentDateTime <= new Date()) {
        Alert.alert("Validation Error", "Please select a future date and time");
        return;
      }

      setSubmitting(true);

      // Format date for API (dd-MM-yyyy HH:mm:ss)
      const formattedDateTime = `${appointmentDateTime
        .getDate()
        .toString()
        .padStart(2, "0")}-${(appointmentDateTime.getMonth() + 1)
        .toString()
        .padStart(
          2,
          "0"
        )}-${appointmentDateTime.getFullYear()} ${hours}:${minutes}:00`;

      const endDateTime = new Date(appointmentDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
      const formattedEndDateTime = `${endDateTime
        .getDate()
        .toString()
        .padStart(2, "0")}-${(endDateTime.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${endDateTime.getFullYear()} ${endDateTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${endDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:00`;

      const consultationData = {
        consultationDate: formattedDateTime,
        startDate: formattedDateTime,
        endDate: formattedEndDateTime,
        notes: notes.trim() || "Health consultation",
      };

      await userApi.createConsultation(
        selectedCoach.id,
        user.id,
        consultationData,
        token
      );

      Alert.alert("Success", "Appointment booked successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);
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
          <Text style={styles.sectionTitle}>Select Coach</Text>
          {coaches.length === 0 ? (
            <Text style={styles.noCoachesText}>
              No active coaches available
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.coachList}>
                {coaches.map((coach) => (
                  <TouchableOpacity
                    key={coach.id}
                    style={[
                      styles.coachCard,
                      selectedCoach?.id === coach.id &&
                        styles.selectedCoachCard,
                    ]}
                    onPress={() => setSelectedCoach(coach)}
                  >
                    <View style={styles.coachAvatar}>
                      <Text style={styles.coachInitial}>
                        {coach.fullName?.charAt(0) || "C"}
                      </Text>
                    </View>
                    <Text style={styles.coachName} numberOfLines={2}>
                      {coach.fullName || "Coach"}
                    </Text>
                    <Text style={styles.coachSpecialty} numberOfLines={1}>
                      {coach.specialty || "Health Coach"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </Card>

        {/* Select Date */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
        </Card>

        {/* Select Time */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlotGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any specific concerns or notes for the consultation..."
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </Card>

        {/* Book Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleBookAppointment}
            style={styles.bookButton}
            textStyle={styles.bookButtonText}
            disabled={
              submitting || !selectedCoach || !selectedDate || !selectedTime
            }
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              "Book Appointment"
            )}
          </Button>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
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
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.md,
  },
  noCoachesText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.gray500,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  coachList: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  coachCard: {
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
    width: 120,
  },
  selectedCoachCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  coachInitial: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  coachName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray900,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  coachSpecialty: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray500,
    textAlign: "center",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.white,
  },
  dateTimeText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.gray700,
  },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.white,
    minWidth: 80,
    alignItems: "center",
  },
  selectedTimeSlot: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  timeSlotText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray700,
    fontWeight: theme.fontWeight.medium,
  },
  selectedTimeSlotText: {
    color: theme.colors.white,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default BookAppointmentScreen;
