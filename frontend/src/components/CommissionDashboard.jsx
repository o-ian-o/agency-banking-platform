import React, { useState } from "react";
import { BankingServices } from "../api/bankingServices";

const CommissionDashboard = () => {
  const [payload, setPayload] = useState(
    '{"amount": 100, "transactionType": "DEPOSIT"}',
  );

  const calculate = async () => {
    try {
      const res = await BankingServices.calculateCommission(
        JSON.parse(payload),
      );
      alert(`Calculated Successfully: ${JSON.stringify(res)}`);
    } catch (e) {
      alert("Calculation failed.");
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold text-fintech-800 mb-6 border-b pb-4">
        Commission Calculator
      </h2>
      <textarea
        className="w-full h-32 p-3 border border-slate-300 rounded font-mono text-sm mb-4 outline-none focus:border-fintech-600"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <button
        onClick={calculate}
        className="w-full bg-fintech-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Calculate Fees
      </button>
    </div>
  );
};
export default CommissionDashboard;
