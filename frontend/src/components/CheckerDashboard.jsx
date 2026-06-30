import React, { useState, useEffect } from "react";
import { BankingServices } from "../api/bankingServices";

const CheckerDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);

  // --- CHECKER FILTER STATE ---
  const [filters, setFilters] = useState({
    paymentType: "",
    fromDate: "",
    toDate: "",
    fromAccount: "",
    toAccount: "",
    status: "PENDING_AUTHORIZATION", // Default focus for a checker
  });

  // --- CHECKER ACTION MODAL STATE ---
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    data: null,
    action: "",
    remarks: "",
  });

  const [isFetching, setIsFetching] = useState(false);

  // Initial Load
  useEffect(() => {
    loadFilterData();
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFilterData = async () => {
    alert("Loading filter data...");
    const types = await BankingServices.fetchPaymentTypesMaster();
    setPaymentTypes(types);
  };

  const fetchQueue = async () => {
    setIsFetching(true);
    try {
      const data = await BankingServices.fetchTransfersForChecker(filters);
      setQueue(data);
    } catch (error) {
      alert("Failed to fetch queue.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      await BankingServices.authorizeTransfer({
        paymentSerialNo: actionModal.data.paymentSerialNo,
        action: actionModal.action,
        remarks: actionModal.remarks,
      });
      setActionModal({ isOpen: false, data: null, action: "", remarks: "" });
      alert(`Transaction ${actionModal.action.toLowerCase()} successfully.`);
      fetchQueue(); // Refresh the table automatically
    } catch (error) {
      alert("Authorization action failed.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-800 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Checker Authorization Queue
        </h2>
        <p className="text-slate-400 text-sm">
          Secure authorization portal. Review and action initiated payment
          transfers.
        </p>
      </div>

      <div className="p-6">
        {/* ================= COMPREHENSIVE FILTER FORM ================= */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
            Filter Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={filters.paymentType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm"
              >
                <option value="">ALL TYPES</option>
                {paymentTypes.map((pt) => (
                  <option key={pt.typeCode} value={pt.typeCode}>
                    {pt.typeCode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                From A/C
              </label>
              <input
                type="text"
                name="fromAccount"
                placeholder="Sender Account"
                value={filters.fromAccount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                To A/C (Beneficiary)
              </label>
              <input
                type="text"
                name="toAccount"
                placeholder="Receiver Account"
                value={filters.toAccount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 text-sm font-bold text-slate-700"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="PENDING_AUTHORIZATION">
                  PENDING AUTHORIZATION
                </option>
                <option value="AUTHORIZED">AUTHORIZED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="MODIFICATION_REQUESTED">
                  MODIFICATION REQUESTED
                </option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                onClick={fetchQueue}
                disabled={isFetching}
                className="px-8 py-2.5 bg-fintech-600 text-white font-bold rounded shadow transition-all hover:bg-fintech-700 disabled:bg-slate-400"
              >
                {isFetching ? "Fetching..." : "Fetch Transactions"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= COMPREHENSIVE DATA TABLE ================= */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
            <thead className="text-xs text-slate-600 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Action
                </th>
                <th className="px-4 py-3">Serial No</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Out/In</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">From A/C</th>
                <th className="px-4 py-3">To A/C (Ben)</th>
                <th className="px-4 py-3">BIC Code</th>
                <th className="px-4 py-3">Ben Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Maker ID</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td
                    colSpan="13"
                    className="px-4 py-8 text-center text-slate-400 font-medium"
                  >
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                queue.map((trx, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {/* Sticky Action Column */}
                    <td className="px-4 py-3 sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() =>
                          setActionModal({
                            isOpen: true,
                            data: trx,
                            action: "",
                            remarks: "",
                          })
                        }
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-sm transition-colors"
                      >
                        VIEW
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-fintech-700">
                      {trx.paymentSerialNo}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          trx.status === "PENDING_AUTHORIZATION"
                            ? "bg-amber-100 text-amber-800"
                            : trx.status === "AUTHORIZED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {trx.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{trx.paymentType}</td>
                    <td className="px-4 py-3">{trx.outIn}</td>
                    <td className="px-4 py-3 font-bold">
                      {trx.paymentCurrency}
                    </td>
                    <td className="px-4 py-3 font-semibold text-lg">
                      {trx.paymentAmount}
                    </td>
                    <td className="px-4 py-3 font-mono">{trx.fromAccount}</td>
                    <td className="px-4 py-3 font-mono">
                      {trx.beneficiaryAccount}
                    </td>
                    <td className="px-4 py-3 uppercase">
                      {trx.beneficiaryBic}
                    </td>
                    <td className="px-4 py-3">{trx.beneficiaryName}</td>
                    <td className="px-4 py-3">{trx.date}</td>
                    <td className="px-4 py-3 text-slate-500">{trx.makerId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SCREEN 3 MODAL: CHECKER ACTION POPUP ================= */}
      {actionModal.isOpen && actionModal.data && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">Review Transaction</h3>
                <p className="text-slate-300 text-sm font-mono mt-1">
                  Serial: {actionModal.data.paymentSerialNo}
                </p>
              </div>
              <button
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    data: null,
                    action: "",
                    remarks: "",
                  })
                }
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              {/* Comprehensive Read-only view of Maker Inputs */}
              <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">
                Maker Submitted Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Initiation Date
                  </span>
                  <span className="font-medium text-slate-800">
                    {actionModal.data.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Payment Type
                  </span>
                  <span className="font-mono font-bold text-fintech-700">
                    {actionModal.data.paymentType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Direction
                  </span>
                  <span className="font-medium text-slate-800">
                    {actionModal.data.outIn}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Transfer Amount
                  </span>
                  <span className="font-bold text-2xl text-fintech-900 tracking-tight">
                    {actionModal.data.paymentCurrency}{" "}
                    {actionModal.data.paymentAmount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    From Account
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {actionModal.data.fromAccount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Maker ID
                  </span>
                  <span className="font-medium text-slate-800">
                    {actionModal.data.makerId}
                  </span>
                </div>

                <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2"></div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Beneficiary BIC
                  </span>
                  <span className="font-mono font-bold text-slate-800 uppercase">
                    {actionModal.data.beneficiaryBic}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Beneficiary Account
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {actionModal.data.beneficiaryAccount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Beneficiary Name
                  </span>
                  <span className="font-medium text-slate-800">
                    {actionModal.data.beneficiaryName || "N/A"}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Beneficiary Address
                  </span>
                  <span className="font-medium text-slate-800">
                    {actionModal.data.beneficiaryAddress || "N/A"}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Maker Remarks
                  </span>
                  <span className="font-medium italic text-slate-700 bg-slate-50 px-3 py-2 rounded block mt-1">
                    {actionModal.data.paymentRemarks || "No remarks provided."}
                  </span>
                </div>
              </div>

              {/* Checker Action Form */}
              {actionModal.data.status === "PENDING_AUTHORIZATION" ? (
                <form
                  onSubmit={handleActionSubmit}
                  className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
                >
                  <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
                    Authorization Decision
                  </h4>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-4">
                      <label
                        className={`flex items-center space-x-3 cursor-pointer p-3 border rounded-lg transition-all ${actionModal.action === "APPROVE" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          required
                          value="APPROVE"
                          onChange={(e) =>
                            setActionModal({
                              ...actionModal,
                              action: e.target.value,
                            })
                          }
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-emerald-700">
                          Approve Transfer
                        </span>
                      </label>

                      <label
                        className={`flex items-center space-x-3 cursor-pointer p-3 border rounded-lg transition-all ${actionModal.action === "REJECT" ? "border-rose-500 bg-rose-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          required
                          value="REJECT"
                          onChange={(e) =>
                            setActionModal({
                              ...actionModal,
                              action: e.target.value,
                            })
                          }
                          className="w-5 h-5 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-bold text-rose-700">
                          Reject Transfer
                        </span>
                      </label>

                      <label
                        className={`flex items-center space-x-3 cursor-pointer p-3 border rounded-lg transition-all ${actionModal.action === "MODIFY" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          required
                          value="MODIFY"
                          onChange={(e) =>
                            setActionModal({
                              ...actionModal,
                              action: e.target.value,
                            })
                          }
                          className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-bold text-amber-700">
                          Request Modification
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Checker Remarks{" "}
                      {actionModal.action !== "APPROVE" && (
                        <span className="text-rose-500">*</span>
                      )}
                    </label>
                    <textarea
                      required={actionModal.action !== "APPROVE"}
                      placeholder={
                        actionModal.action === "APPROVE"
                          ? "Optional approval notes..."
                          : "Provide a mandatory reason for Rejection or Modification..."
                      }
                      value={actionModal.remarks}
                      onChange={(e) =>
                        setActionModal({
                          ...actionModal,
                          remarks: e.target.value,
                        })
                      }
                      className="w-full h-24 p-3 border border-slate-300 rounded outline-none focus:border-fintech-600 focus:ring-1 focus:ring-fintech-600 text-sm"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActionModal({
                          isOpen: false,
                          data: null,
                          action: "",
                          remarks: "",
                        })
                      }
                      className="px-6 py-2.5 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!actionModal.action}
                      className="px-8 py-2.5 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 transition-colors shadow disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      Submit Authorization
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 text-center">
                  <p className="text-slate-600 font-medium">
                    This transaction has already been processed and is marked as{" "}
                    <span className="font-bold">{actionModal.data.status}</span>
                    .
                  </p>
                  {actionModal.data.checkerRemarks && (
                    <p className="mt-2 text-sm italic text-slate-500">
                      Checker Note: "{actionModal.data.checkerRemarks}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckerDashboard;
