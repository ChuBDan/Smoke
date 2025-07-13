import React, { useEffect, useState } from "react";
import axios from "@/config/api";
import { useSelector } from "react-redux";
import { Table, Tag, Typography, Spin } from "antd";

const { Title } = Typography;

const PaymentHistory = () => {
  const { token, userId } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `api/user/get-transactions-by-member/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchTransactions();
    } else {
      console.warn("Missing userId or token");
      setLoading(false);
    }
  }, [userId, token]);

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Order Info",
      dataIndex: "orderInfo",
      key: "orderInfo",
    },
    {
      title: "Bank",
      dataIndex: "bankCode",
      key: "bankCode",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString()} đ`,
    },
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) =>
        new Date(date).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "COMPLETED" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <Title level={3}>Transaction History</Title>

      {loading ? (
        <Spin size="large" tip="Loading data..." />
      ) : (
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
};

export default PaymentHistory;
