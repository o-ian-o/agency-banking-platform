import React, { useState } from "react";
import { BankingServices } from "../api/bankingServices";

const VoucherDashboard = () => {
  const [amount, setAmount] = useState("");
  const [voucherCode, setVoucherCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInitiateVoucher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Business layer call mapping to VoucherController
      const response = await BankingServices.initiateVoucher({
        amount: parseFloat(amount),
      });
      setVoucherCode(response.voucherCode); // Assuming response contains voucherCode
    } catch (error) {
      alert("Failed to initiate voucher. Check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold text-fintech-800 mb-6 border-b pb-4">
        Voucher Management
      </h2>

      <form onSubmit={handleInitiateVoucher} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Voucher Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-fintech-600 focus:border-fintech-600 outline-none transition-colors"
            placeholder="0.00"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fintech-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? "Processing..." : "Initiate Voucher"}
        </button>
      </form>

      {voucherCode && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
          <p className="font-semibold">Voucher Successfully Initiated</p>
          <p className="text-lg tracking-wider mt-1 font-mono">{voucherCode}</p>
        </div>
      )}
    </div>
  );
};

export default VoucherDashboard;
