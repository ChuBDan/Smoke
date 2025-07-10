import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { formatVND } from "@/utils/format";
import styles from "./Payments.module.css";
import { paymentsApi } from "@/features/admin/services/paymentsApi";
import {
  fetchAllTransactions,
  updateTransaction as updateTransactionRedux,
  deleteTransaction as deleteTransactionRedux,
  clearError,
  setSearchTerm,
  setFilterStatus,
} from "@/redux/slices/paymentsSlice";
import ConfirmModal from "@/components/ConfirmModal";

const PaymentHistoryPage = () => {
  const dispatch = useDispatch();
  const {
    transactions: reduxTransactions,
    loading: reduxLoading,
    error: reduxError,
    searchTerm: reduxSearchTerm,
    filterStatus: reduxFilterStatus,
    // stats: reduxStats
  } = useSelector((state) => state.payments);

  // Local state for when Redux is not available or for UI-specific state
  const [localTransactions, setLocalTransactions] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  // Removed unused local search/filter state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [useRedux] = useState(true); // Toggle this to use Redux or local state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Use Redux state or local state
  const transactions = useRedux ? reduxTransactions : localTransactions;
  const loading = useRedux ? reduxLoading : localLoading;
  const searchTerm = reduxSearchTerm;
  const filterStatus = reduxFilterStatus;

  // Load all transactions using Redux
  const loadTransactionsRedux = useCallback(() => {
    dispatch(fetchAllTransactions()).finally(() => {
      setIsInitialLoad(false);
    });
  }, [dispatch]);

  // Load all transactions using local state
  const loadTransactionsLocal = useCallback(async () => {
    setLocalLoading(true);
    try {
      const result = await paymentsApi.getAllTransactions();
      if (result.success) {
        setLocalTransactions(result.data || []);
      } else {
        toast.error(result.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Error loading transactions");
    } finally {
      setLocalLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Load transactions based on chosen method
  const loadTransactions = useCallback(() => {
    if (useRedux) {
      loadTransactionsRedux();
    } else {
      loadTransactionsLocal();
    }
  }, [useRedux, loadTransactionsRedux, loadTransactionsLocal]);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Clear Redux error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear Redux error when it changes
  useEffect(() => {
    if (useRedux && reduxError) {
      toast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch, useRedux]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (transaction.status === "deleted") return false;
      const matchesSearch =
        transaction.orderInfo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.bankCode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id?.toString().includes(searchTerm) ||
        transaction.memberId?.toString().includes(searchTerm);

      const matchesStatus =
        filterStatus === "all" || transaction.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filtered = transactions.filter((t) => t.status !== "deleted");
    const totalRevenue = filtered
      .filter((t) => t.status === "completed" || t.status === "success")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totalTransactions = filtered.length;
    const successfulTransactions = filtered.filter(
      (t) => t.status === "completed" || t.status === "success"
    ).length;
    const pendingTransactions = filtered.filter(
      (t) => t.status === "pending"
    ).length;

    return {
      totalRevenue,
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
    };
  }, [transactions]);

  // Handle delete transaction
  const handleDeleteTransaction = (transactionId) => {
    setDeleteId(transactionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (useRedux) {
        const result = await dispatch(deleteTransactionRedux(deleteId));
        if (deleteTransactionRedux.fulfilled.match(result)) {
          toast.success("Transaction deleted successfully");
        } else {
          toast.error(result.payload || "Failed to delete transaction");
        }
      } else {
        const result = await paymentsApi.deleteTransaction(deleteId);
        if (result.success) {
          toast.success("Transaction deleted successfully");
          loadTransactions(); // Reload data
        } else {
          toast.error(result.message || "Failed to delete transaction");
        }
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Error deleting transaction");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  // Handle update transaction
  const handleUpdate = async (updatedData) => {
    try {
      if (useRedux) {
        const result = await dispatch(
          updateTransactionRedux({
            transactionId: editingTransaction.id,
            transactionData: updatedData,
          })
        );
        if (updateTransactionRedux.fulfilled.match(result)) {
          toast.success("Transaction updated successfully");
          setShowEditModal(false);
          setEditingTransaction(null);
        } else {
          toast.error(result.payload || "Failed to update transaction");
        }
      } else {
        const result = await paymentsApi.updateTransaction(
          editingTransaction.id,
          updatedData
        );
        if (result.success) {
          toast.success("Transaction updated successfully");
          setShowEditModal(false);
          setEditingTransaction(null);
          loadTransactions(); // Reload data
        } else {
          toast.error(result.message || "Failed to update transaction");
        }
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Error updating transaction");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return styles.statusSuccess;
      case "pending":
        return styles.statusPending;
      case "failed":
      case "error":
        return styles.statusFailed;
      default:
        return styles.statusDefault;
    }
  };

  // Show loading state similar to packages page
  if (loading && transactions.length === 0 && isInitialLoad) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Error Display */}
      {reduxError && (
        <div className={styles.errorBanner}>
          <div className={styles.errorContent}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{reduxError}</span>
            <button
              onClick={() => dispatch(clearError())}
              className={styles.closeError}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Payment History & Transactions</h1>
          <p>Manage user payments and membership transactions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Revenue</span>
            <div className={`${styles.statIcon} ${styles.revenue}`}>
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {formatVND(stats.totalRevenue)}
          </div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            ↗ Total earnings
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Transactions</span>
            <div className={`${styles.statIcon} ${styles.total}`}>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalTransactions}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            ↗ All transactions
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Successful</span>
            <div className={`${styles.statIcon} ${styles.active}`}>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.successfulTransactions}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            ↗ Completed payments
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Pending</span>
            <div className={`${styles.statIcon} ${styles.subscribers}`}>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{stats.pendingTransactions}</div>
          <div className={`${styles.statChange} ${styles.positive}`}>
            ↗ Awaiting processing
          </div>
        </div>
      </div>

      {/* Controls and Table Section */}

      {/* Filters Container - matches Coaches page */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search transactions by order info, bank code, or ID..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => dispatch(setFilterStatus(e.target.value))}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <button
          className={styles.refreshButton}
          onClick={loadTransactions}
          disabled={loading}
          type="button"
          aria-label="Refresh"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={loading ? styles.spinning : ""}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className={styles.tableContentContainer}>
        {filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              width="64"
              height="64"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className={styles.emptyIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3>No transactions found</h3>
            <p>
              No transactions match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Member ID</th>
                  <th>Package ID</th>
                  <th>Order Info</th>
                  <th>Bank Code</th>
                  <th>Amount</th>
                  <th>Response Code</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className={styles.transactionId}>
                        #{transaction.id}
                      </span>
                    </td>
                    <td>{transaction.memberId}</td>
                    <td>{transaction.packageId || "N/A"}</td>
                    <td className={styles.orderInfo}>
                      {transaction.orderInfo || "N/A"}
                    </td>
                    <td>{transaction.bankCode || "N/A"}</td>
                    <td className={styles.amount}>
                      {formatVND(transaction.amount)}
                    </td>
                    <td>{transaction.responseCode || "N/A"}</td>
                    <td className={styles.date}>
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadge(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className={styles.editBtn}
                          title="Edit transaction"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className={styles.deleteBtn}
                          title="Delete transaction"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleUpdate}
          onCancel={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          open={showDeleteModal}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          type="danger"
        />
      )}
    </div>
  );
};

// Edit Transaction Modal Component
const EditTransactionModal = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    orderInfo: transaction.orderInfo || "",
    bankCode: transaction.bankCode || "",
    amount: transaction.amount || "",
    responseCode: transaction.responseCode || "",
    status: transaction.status || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Edit Transaction</h3>
          <button onClick={onCancel} className={styles.closeBtn}>
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Order Info *</label>
            <input
              type="text"
              name="orderInfo"
              value={formData.orderInfo}
              onChange={handleChange}
              placeholder="Enter order information"
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Bank Code *</label>
            <input
              type="text"
              name="bankCode"
              value={formData.bankCode}
              onChange={handleChange}
              placeholder="Enter bank code"
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Response Code *</label>
            <input
              type="text"
              name="responseCode"
              value={formData.responseCode}
              onChange={handleChange}
              placeholder="Enter response code"
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelBtn}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className={styles.spinner}
                    style={{ width: 22, height: 22, marginRight: 8 }}
                  />
                  Saving changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditTransactionModal.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderInfo: PropTypes.string,
    bankCode: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    responseCode: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PaymentHistoryPage;
