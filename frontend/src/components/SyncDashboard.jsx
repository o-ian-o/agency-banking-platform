import React, { useState } from "react";
import { BankingServices } from "../api/bankingServices";

const SyncDashboard = () => {
  const defaultBatchTemplate = {
    enrolments: [
      {
        offlineId: "OFF-ENR-101",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phoneNumber: "+1987654321",
        kycTier: "TIER_1",
      },
    ],
    transactions: [
      {
        offlineId: "OFF-TXN-202",
        accountId: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
        amount: 250.0,
        transactionType: "DEPOSIT",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const [jsonPayload, setJsonPayload] = useState(
    JSON.stringify(defaultBatchTemplate, null, 2),
  );
  const [syncResponse, setSyncResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSyncSubmit = async () => {
    setLoading(true);
    setSyncResponse(null);
    try {
      const parsedData = JSON.parse(jsonPayload);
      const res = await BankingServices.syncOfflineBatch(parsedData);
      setSyncResponse({
        status: "success",
        data: res,
      });
    } catch (error) {
      setSyncResponse({
        status: "error",
        message:
          error instanceof SyntaxError
            ? "Malformed JSON Structure. Verify comma usage and brackets."
            : error.response?.data?.message || "Sync execution failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-fintech-800">
          Offline Data Sync Engine
        </h2>
        <p className="text-sm text-slate-500">
          Reconcile offline micro-banking transactions and customer entries back
          to server registries.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Batch Transaction Payload (JSON Format)
          </label>
          <textarea
            className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none bg-slate-50 text-slate-800"
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
          />
        </div>

        <button
          onClick={handleSyncSubmit}
          disabled={loading}
          className={`w-full font-medium py-3 rounded-lg text-white transition-all tracking-wide ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-fintech-600 hover:bg-fintech-700 shadow-md"
          }`}
        >
          {loading ? "Transmitting Data Batch..." : "Push Pending Offline Data"}
        </button>

        {syncResponse && (
          <div className="mt-6 border rounded-lg overflow-hidden text-sm">
            <div
              className={`px-4 py-2 font-semibold ${
                syncResponse.status === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {syncResponse.status === "success"
                ? "Synchronization Sequence Clear"
                : "Process Aborted"}
            </div>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60">
              {syncResponse.status === "success" ? (
                <pre>{JSON.stringify(syncResponse.data, null, 2)}</pre>
              ) : (
                <span className="text-rose-400">{syncResponse.message}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncDashboard;
