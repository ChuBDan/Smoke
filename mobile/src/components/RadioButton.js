import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../theme";

const RadioButton = ({
  label,
  value,
  selected,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  label: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  labelDisabled: {
    color: theme.colors.gray400,
  },
});

export default RadioButton;
