/* eslint-disable react/prop-types */
"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { smokingCessationApi } from "@/services/smokingCessationApi";
import { useSelector } from "react-redux";
import { dateUtils } from "@/utils/dateUtils";
import { getCurrentSmokingLog } from "@/utils/smokingLogUtils";

/**
 * SmokingStatusForm (v2 – no polling)
 * ‑ Sau khi lưu log và gọi createPlan (VIP) ➜ điều hướng thẳng sang /smokingprogress.
 * ‑ Trang SmokingProgress chịu trách nhiệm tự fetch plan; nếu BE vẫn chưa tạo kịp sẽ hiển thị spinner.
 */
const SmokingStatusForm = () => {
  const navigate = useNavigate();
  const { userId, token, memberPackage } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    cigarettesPerDay: "",
    frequency: "",
    cost: "",
  });
  const [hasActiveLog, setHasActiveLog] = useState(false);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  /* ───────────────────────────── Init ───────────────────────────── */
  useEffect(() => {
    const init = async () => {
      if (!userId || !token) return;
      try {
        const active = await getCurrentSmokingLog(userId, token);
        if (active) {
          setHasActiveLog(true);
          setLog(active);
        }
      } catch (err) {
        console.error("init", err);
      } finally {
        setInitLoading(false);
      }
    };
    init();
  }, [userId, token]);

  /* ────────────────────────── Handlers ─────────────────────────── */
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { cigarettesPerDay, frequency, costPerPack } = form;
      if (!cigarettesPerDay || !frequency || !costPerPack) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!userId) {
        toast.error("Please log in to continue");
        navigate("/login");
        return;
      }

      /* 1️⃣  Create / update smoking‑log */
      const payload = {
        cigarettesPerDay: cigarettesPerDay,
        frequency: `${frequency} times per day`,
        cost: costPerPack,
      };
      const { smokingLog } = await smokingCessationApi.createSmokingLog(
        userId,
        payload,
        token
      );

      /* 2️⃣  Always create plan (non-blocking) if log exists */
      if (smokingLog?.id) {
        try {
          await smokingCessationApi.createPlan(userId, smokingLog.id, token);
          toast.info(
            "Your AI plan is being generated – it will appear on the Progress page in a moment."
          );
        } catch (err) {
          console.error("createPlan", err);
          toast.warning(
            "Could not generate AI plan right now. You can retry from the Progress page."
          );
        }
      }

      /* 3️⃣  Go straight to Progress page. It will keep checking for the plan. */
      navigate("/smokingprogress");
    } catch (err) {
      console.error("submit", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────── UI ────────────────────────────── */
  if (initLoading) return <Loader msg="Loading your smoking log…" />;

  if (hasActiveLog && log)
    return (
      <ActiveLogNotice
        log={log}
        onContinue={() => navigate("/smokingprogress")}
      />
    );

  return (
    <FormUI
      form={form}
      onChange={onChange}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};

/* ───────────────────────── helpers ───────────────────────── */
const Loader = ({ msg }) => (
  <div className="flex justify-center py-6">
    <p>{msg}</p>
  </div>
);

const ActiveLogNotice = ({ log, onContinue }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h3 className="text-lg font-medium mb-2">Active Plan Found</h3>
      <p className="text-sm mb-4">
        You already started a plan on{" "}
        {new Date(dateUtils.parseDDMMYYYY(log.logDate)).toLocaleDateString(
          "vi-VN"
        )}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Go to Progress
      </button>
    </div>
  </div>
);

const FormUI = ({ form, onChange, onSubmit, loading }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
    <div className="bg-white p-8 rounded-lg shadow max-w-4xl w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Detailed Smoking Status Assessment
      </h2>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Cigarettes/day *"
            name="cigarettesPerDay"
            value={form.cigarettesPerDay}
            onChange={onChange}
            placeholder="10"
          />
          <Input
            label="Frequency (times/day) *"
            name="frequency"
            value={form.frequency}
            onChange={onChange}
            placeholder="5"
          />
          <Input
            label="Cost/pack (VND) *"
            name="costPerPack"
            value={form.costPerPack}
            onChange={onChange}
            placeholder="30000"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing…" : "Submit & Continue"}
        </button>
      </form>
    </div>
  </div>
);

const Input = ({ label, ...rest }) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-gray-700">{label}</span>
    <input
      type="number"
      className="w-full border rounded p-3 focus:outline-none"
      min="0"
      required
      {...rest}
    />
  </label>
);

export default SmokingStatusForm;
