import React, { useState } from "react";
import { BankingServices } from "../api/bankingServices";

const StatementDashboard = () => {
  const [accountId, setAccountId] = useState("");
  const [result, setResult] = useState(null);

  const handleMiniStatement = async () => {
    try {
      const res = await BankingServices.getMiniStatement(accountId);
      setResult(JSON.stringify(res, null, 2));
    } catch (error) {
      setResult("Error fetching statement. Check console.");
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold text-fintech-800 mb-6 border-b pb-4">
        Account Statements
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Account UUID"
          className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-fintech-600 focus:border-fintech-600 outline-none"
          onChange={(e) => setAccountId(e.target.value)}
        />
        <div className="flex gap-4">
          <button
            onClick={handleMiniStatement}
            className="bg-fintech-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Get Mini Statement
          </button>
          {/* You can add the Full Statement button and date pickers here similarly */}
        </div>
        {result && (
          <pre className="mt-4 p-4 bg-slate-100 rounded text-sm overflow-x-auto text-fintech-900 border border-slate-200">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
};
export default StatementDashboard;
