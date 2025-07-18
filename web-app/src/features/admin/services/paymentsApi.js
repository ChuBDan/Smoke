// Payments API service
import api from "@/config/api";

export const paymentsApi = {
  // Get all payment transactions (Admin)
  getAllTransactions: async () => {
    try {
      const response = await api.get("/api/admin/get-all-transactions");

      // Validate response data
      if (!response || !response.data) {
        throw new Error("Empty response from server");
      }

      // Handle cases where response might be a string that needs parsing
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }

      // Normalize transaction data
      let transactionsArr =
        responseData.transactions || responseData.data || responseData;
      if (Array.isArray(transactionsArr)) {
        transactionsArr = transactionsArr.map(normalizeTransactionData);
      }

      return {
        success: true,
        data: transactionsArr,
        message: "Transactions fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);

      // Handle different types of errors
      let errorMessage = "Failed to fetch transactions";
      if (error.message.includes("JSON")) {
        errorMessage = "Server returned invalid data format";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network connection failed";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        data: null,
        message: errorMessage,
        error: error.response?.data || error.message,
      };
    }
  },

  // Get specific transaction by ID (Admin)
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(
        `/api/admin/get-transaction/${transactionId}`
      );
      return {
        success: true,
        data: normalizeTransactionData(response.data),
        message: "Transaction fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch transaction",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get transactions by member ID
  getTransactionsByMember: async (memberId) => {
    try {
      const response = await api.get(
        `/api/user/get-transactions-by-member/${memberId}`
      );

      let transactionsArr = response.data;
      if (Array.isArray(transactionsArr)) {
        transactionsArr = transactionsArr.map(normalizeTransactionData);
      }

      return {
        success: true,
        data: transactionsArr,
        message: "Member transactions fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching member transactions:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Failed to fetch member transactions",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update transaction (Admin)
  updateTransaction: async (
    transactionId,
    updatedFields,
    originalTransaction
  ) => {
    try {
      // Always send all fields by merging originalTransaction with updatedFields
      const fullPayload = { ...originalTransaction, ...updatedFields };
      const response = await api.put(
        `/api/admin/update-transaction/transaction/${transactionId}`,
        fullPayload
      );
      return {
        success: true,
        data: normalizeTransactionData(response.data),
        message: "Transaction updated successfully",
      };
    } catch (error) {
      console.error("Error updating transaction:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to update transaction",
        error: error.response?.data || error.message,
      };
    }
  },

  // Delete transaction (Admin)
  deleteTransaction: async (transactionId) => {
    try {
      const response = await api.delete(
        `/api/admin/delete-transaction/${transactionId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Transaction deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to delete transaction",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const response = await api.get("/api/admin/payment-stats");
      return {
        success: true,
        data: response.data,
        message: "Payment stats fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch payment stats",
        error: error.response?.data || error.message,
      };
    }
  },

  // Mock data for development (remove when real API is available)
  getMockTransactions: () => {
    return {
      success: true,
      data: [
        {
          id: 1,
          userId: 101,
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          membershipPackage: "Premium Monthly",
          amount: 29.99,
          currency: "USD",
          paymentMethod: "Credit Card",
          transactionId: "txn_1234567890",
          status: "completed",
          createdAt: "2024-12-01T10:30:00Z",
          updatedAt: "2024-12-01T10:30:00Z",
        },
        {
          id: 2,
          userId: 102,
          userName: "Jane Smith",
          userEmail: "jane.smith@example.com",
          membershipPackage: "Basic Annual",
          amount: 199.99,
          currency: "USD",
          paymentMethod: "PayPal",
          transactionId: "txn_0987654321",
          status: "completed",
          createdAt: "2024-11-28T14:15:00Z",
          updatedAt: "2024-11-28T14:15:00Z",
        },
        {
          id: 3,
          userId: 103,
          userName: "Mike Johnson",
          userEmail: "mike.johnson@example.com",
          membershipPackage: "Premium Annual",
          amount: 299.99,
          currency: "USD",
          paymentMethod: "Credit Card",
          transactionId: "txn_1122334455",
          status: "pending",
          createdAt: "2024-12-06T09:20:00Z",
          updatedAt: "2024-12-06T09:20:00Z",
        },
      ],
      message: "Mock transactions data",
    };
  },
};

// Helper to normalize transaction data
function normalizeTransactionData(transaction) {
  return {
    id: transaction.id,
    memberId: transaction.memberId,
    packageId: transaction.packageId,
    orderInfo: transaction.orderInfo,
    bankCode: transaction.bankCode,
    amount: parseFloat(transaction.amount || 0),
    responseCode: transaction.responseCode,
    transactionDate: convertDateFormat(transaction.transactionDate),
    status: transaction.status ? transaction.status.toLowerCase() : undefined,
    // Legacy fields for backward compatibility
    createdAt: convertDateFormat(
      transaction.transactionDate ||
        transaction.createdAt ||
        transaction.created_at
    ),
    updatedAt: convertDateFormat(
      transaction.updatedAt || transaction.updated_at
    ),
  };
}

// Helper to convert date formats
function convertDateFormat(dateString) {
  if (!dateString) return null;
  if (dateString.includes("T") || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString;
  }
  if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  }
  const testDate = new Date(dateString);
  if (!isNaN(testDate.getTime())) {
    return dateString;
  }
  return dateString;
}

export default paymentsApi;
