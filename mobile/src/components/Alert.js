import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../theme";

const Alert = ({ type = "info", message, title, showIcon = true, style }) => {
  const getAlertStyle = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme.colors.successLight,
          borderColor: theme.colors.success,
        };
      case "error":
        return {
          backgroundColor: theme.colors.errorLight,
          borderColor: theme.colors.error,
        };
      case "warning":
        return {
          backgroundColor: theme.colors.warningLight,
          borderColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.infoLight,
          borderColor: theme.colors.info,
        };
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  return (
    <View style={[styles.container, getAlertStyle(), style]}>
      <View style={styles.content}>
        {showIcon && (
          <Ionicons
            name={getIcon()}
            size={20}
            color={getTextColor()}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: getTextColor() }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, { color: getTextColor() }]}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});

export default Alert;
