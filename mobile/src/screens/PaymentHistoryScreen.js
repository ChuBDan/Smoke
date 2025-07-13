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
import { Card } from "../components";
import { paymentApi } from "../services/smokingCessationApi";
import theme from "../theme";

const PaymentHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id || !token) {
        console.warn("No user ID or token available");
        return;
      }

      console.log("Fetching transactions for member:", user.id);

      const response = await paymentApi.getTransactionsByMember(user.id, token);

      console.log("Payment transactions response:", response);

      if (response.success) {
        setTransactions(response.transactions || []);
      } else {
        setError(response.message || "Failed to load payment history");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Unable to load payment history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() < 1970) {
      // Invalid date or year is suspiciously old
      return "N/A";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return "0 ₫";
    return `${Number(amount).toLocaleString()} ₫`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "failed":
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.gray500;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
      case "error":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const TransactionCard = ({ transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionId}>#{transaction.id}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.transactionDate || transaction.createdAt)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(transaction.status)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.colors.gray500}
          />
          <Text style={styles.detailLabel}>Order Info:</Text>
          <Text style={styles.detailValue}>
            {transaction.orderInfo || "N/A"}
          </Text>
        </View>

        {transaction.bankCode && (
          <View style={styles.detailRow}>
            <Ionicons
              name="business-outline"
              size={16}
              color={theme.colors.gray500}
            />
            <Text style={styles.detailLabel}>Bank:</Text>
            <Text style={styles.detailValue}>{transaction.bankCode}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons
            name="cash-outline"
            size={16}
            color={theme.colors.gray500}
          />
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={[styles.detailValue, styles.amountText]}>
            {formatAmount(transaction.amount)}
          </Text>
        </View>

        {transaction.responseCode && (
          <View style={styles.detailRow}>
            <Ionicons
              name="code-working-outline"
              size={16}
              color={theme.colors.gray500}
            />
            <Text style={styles.detailLabel}>Response Code:</Text>
            <Text style={styles.detailValue}>{transaction.responseCode}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color={theme.colors.gray400} />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any payment transactions yet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
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
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading payment history...</Text>
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
              onPress={fetchTransactions}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : transactions.length > 0 ? (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Transaction Summary</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{transactions.length}</Text>
                  <Text style={styles.statLabel}>Total Transactions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {
                      transactions.filter(
                        (t) =>
                          t.status?.toLowerCase() === "completed" ||
                          t.status?.toLowerCase() === "success"
                      ).length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Successful</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {formatAmount(
                      transactions
                        .filter(
                          (t) =>
                            t.status?.toLowerCase() === "completed" ||
                            t.status?.toLowerCase() === "success"
                        )
                        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Total Paid</Text>
                </View>
              </View>
            </View>

            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </>
        ) : (
          <EmptyState />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  statsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
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
  transactionCard: {
    marginBottom: theme.spacing.md,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.white,
  },
  transactionDetails: {
    marginTop: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  amountText: {
    fontWeight: "600",
    color: theme.colors.primary,
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
    paddingHorizontal: theme.spacing.lg,
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

export default PaymentHistoryScreen;
