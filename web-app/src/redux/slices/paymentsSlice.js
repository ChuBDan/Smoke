import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsApi } from "@/features/admin/services/paymentsApi";

// Async thunk for fetching all transactions
export const fetchAllTransactions = createAsyncThunk(
  "payments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await paymentsApi.getAllTransactions();
      if (result.success) {
        // Extract transactions array from the API response
        const transactionsData = result.data || [];

        // Validate that transactionsData is an array
        if (!Array.isArray(transactionsData)) {
          console.error("Invalid transactions data format:", transactionsData);
          return rejectWithValue("Invalid data format received from server");
        }

        // Map API data to component format with clean data mapping
        const mappedTransactions = transactionsData.map((transaction) => {
          try {
            return {
              id: transaction.id || Math.random().toString(36).substr(2, 9),
              memberId: transaction.memberId || null,
              packageId: transaction.packageId || null,
              orderInfo: transaction.orderInfo || "",
              bankCode: transaction.bankCode || "",
              amount: parseFloat(transaction.amount || 0),
              responseCode: transaction.responseCode || "",
              transactionDate:
                transaction.transactionDate ||
                transaction.createdAt ||
                new Date().toISOString(),
              status: transaction.status
                ? transaction.status.toLowerCase()
                : "pending",
              // Legacy fields for backward compatibility
              createdAt:
                transaction.transactionDate ||
                transaction.createdAt ||
                new Date().toISOString(),
              updatedAt: transaction.updatedAt || new Date().toISOString(),
            };
          } catch (mappingError) {
            console.error(
              "Error mapping transaction data:",
              transaction,
              mappingError
            );
            return {
              id: Math.random().toString(36).substr(2, 9),
              memberId: null,
              packageId: null,
              orderInfo: "Error parsing data",
              bankCode: "",
              amount: 0,
              responseCode: "",
              transactionDate: new Date().toISOString(),
              status: "error",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        });

        return mappedTransactions;
      } else {
        return rejectWithValue(
          result.message || "Failed to fetch transactions"
        );
      }
    } catch (error) {
      console.error("Error in fetchAllTransactions:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch transactions"
      );
    }
  }
);

// Async thunk for fetching transactions by member
export const fetchTransactionsByMember = createAsyncThunk(
  "payments/fetchByMember",
  async (memberId, { rejectWithValue }) => {
    try {
      const result = await paymentsApi.getTransactionsByMember(memberId);
      if (result.success) {
        return result.data || [];
      } else {
        return rejectWithValue(
          result.message || "Failed to fetch member transactions"
        );
      }
    } catch (error) {
      console.error("Error in fetchTransactionsByMember:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch member transactions"
      );
    }
  }
);

// Async thunk for updating transaction
export const updateTransaction = createAsyncThunk(
  "payments/update",
  async ({ transactionId, transactionData }, { rejectWithValue }) => {
    try {
      const result = await paymentsApi.updateTransaction(
        transactionId,
        transactionData
      );
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(
          result.message || "Failed to update transaction"
        );
      }
    } catch (error) {
      console.error("Error in updateTransaction:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update transaction"
      );
    }
  }
);

// Async thunk for deleting transaction
export const deleteTransaction = createAsyncThunk(
  "payments/delete",
  async (transactionId, { rejectWithValue }) => {
    try {
      const result = await paymentsApi.deleteTransaction(transactionId);
      if (result.success) {
        return transactionId;
      } else {
        return rejectWithValue(
          result.message || "Failed to delete transaction"
        );
      }
    } catch (error) {
      console.error("Error in deleteTransaction:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete transaction"
      );
    }
  }
);

// Async thunk for fetching payment statistics
export const fetchPaymentStats = createAsyncThunk(
  "payments/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const result = await paymentsApi.getPaymentStats();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(
          result.message || "Failed to fetch payment statistics"
        );
      }
    } catch (error) {
      console.error("Error in fetchPaymentStats:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch payment statistics"
      );
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    transactions: [],
    memberTransactions: [],
    stats: {
      totalRevenue: 0,
      totalTransactions: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
    },
    searchTerm: "",
    filterStatus: "all",
    loading: false,
    error: null,
    lastFetch: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.memberTransactions = [];
      state.lastFetch = null;
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
        state.lastFetch = new Date().toISOString();

        // Calculate stats from transactions
        const transactions = action.payload;
        const totalRevenue = transactions
          .filter((t) => t.status === "completed" || t.status === "success")
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        state.stats = {
          totalRevenue,
          totalTransactions: transactions.length,
          successfulTransactions: transactions.filter(
            (t) => t.status === "completed" || t.status === "success"
          ).length,
          pendingTransactions: transactions.filter(
            (t) => t.status === "pending"
          ).length,
        };
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch transactions by member
      .addCase(fetchTransactionsByMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByMember.fulfilled, (state, action) => {
        state.loading = false;
        state.memberTransactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactionsByMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransaction = action.payload;
        const index = state.transactions.findIndex(
          (t) => t.id === updatedTransaction.id
        );
        if (index !== -1) {
          state.transactions[index] = updatedTransaction;
        }
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const transactionId = action.payload;
        // Soft delete: set status to 'deleted' instead of removing
        const idx = state.transactions.findIndex((t) => t.id === transactionId);
        if (idx !== -1) {
          state.transactions[idx].status = "deleted";
        }
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = { ...state.stats, ...action.payload };
        state.error = null;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearTransactions,
  setStats,
  setSearchTerm,
  setFilterStatus,
} = paymentsSlice.actions;
export default paymentsSlice.reducer;
