import React from "react";
import { View, StyleSheet } from "react-native";
import theme from "../theme";

const Card = ({ children, style, padding = true, shadow = true }) => {
  return (
    <View
      style={[
        styles.card,
        padding && styles.cardPadding,
        shadow && theme.shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPadding: {
    padding: theme.spacing.lg,
  },
});

export default Card;
