import React, { useState, useEffect } from "react";
import { BankingServices } from "../api/bankingServices";

const MakerDashboard = () => {
  // --- APP & DATA STATE ---
  const [activeTab, setActiveTab] = useState("ACTION");
  const [actionMode, setActionMode] = useState("ADD");
  const [inquiryData, setInquiryData] = useState([]);

  // Master Data State
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [bicCodes, setBicCodes] = useState([]);

  // --- TRANSACTION FORM STATE ---
  const initialForm = {
    date: "",
    paymentType: "",
    fromAccount: "",
    paymentCurrency: "USD",
    paymentAmount: "",
    beneficiaryBic: "",
    beneficiaryAccount: "",
    beneficiaryName: "",
    beneficiaryAddress: "",
    paymentRemarks: "",
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MASTER MODAL STATES ---
  const [showPaymentMaster, setShowPaymentMaster] = useState(false);
  const [paymentMasterMode, setPaymentMasterMode] = useState("ADD"); // ADD or MODIFY
  const initialPaymentMaster = {
    baseCode: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    currency: "USD",
  };
  const [paymentMasterForm, setPaymentMasterForm] =
    useState(initialPaymentMaster);

  const [showBicMaster, setShowBicMaster] = useState(false);
  const [bicMasterMode, setBicMasterMode] = useState("ADD"); // ADD or MODIFY
  const initialBicMaster = {
    bicCode: "",
    bankName: "",
    branchName: "",
    allowedTypes: [],
  };
  const [bicMasterForm, setBicMasterForm] = useState(initialBicMaster);

  // --- INITIALIZATION ---
  useEffect(() => {
    loadMasters();
    if (activeTab === "INQUIRY") fetchInquiries();
  }, [activeTab]);

  const loadMasters = async () => {
    const types = await BankingServices.fetchPaymentTypesMaster();
    const bics = await BankingServices.fetchBicCodesMaster();
    setPaymentTypes(types);
    setBicCodes(bics);

    // Auto-select first payment type if form is empty
    if (!formData.paymentType && types.length > 0) {
      setFormData((prev) => ({ ...prev, paymentType: types[0].typeCode }));
    }
  };

  const fetchInquiries = async () => {
    const data = await BankingServices.fetchMakerInquiries();
    setInquiryData(data);
  };

  // --- TRANSACTION HANDLERS ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await BankingServices.initiatePaymentTransfer(formData);
      alert(`Payment Initiated!\nSerial No: ${response.paymentSerialNo}`);
      setFormData(initialForm);
      setActiveTab("INQUIRY");
    } catch (error) {
      alert("Failed to initiate payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MASTER HANDLERS: PAYMENT TYPE ---
  const handlePaymentMasterSubmit = async (e) => {
    e.preventDefault();
    // Construct the 8-char primary key (6 chars + CO)
    const formattedCode =
      paymentMasterMode === "ADD"
        ? `${paymentMasterForm.baseCode.toUpperCase()}CO`
        : paymentMasterForm.typeCode; // Keep existing if modifying

    await BankingServices.savePaymentTypeMaster({
      typeCode: formattedCode,
      description: paymentMasterForm.description,
      minAmount: parseFloat(paymentMasterForm.minAmount),
      maxAmount: parseFloat(paymentMasterForm.maxAmount),
      currency: paymentMasterForm.currency,
    });

    await loadMasters();
    setShowPaymentMaster(false);
    setPaymentMasterForm(initialPaymentMaster);
    alert(`Payment Type ${formattedCode} saved successfully.`);
  };

  const loadPaymentForModification = (e) => {
    const selected = paymentTypes.find((p) => p.typeCode === e.target.value);
    if (selected) {
      setPaymentMasterForm({
        ...selected,
        baseCode: selected.typeCode.replace("CO", ""),
      });
    }
  };

  // --- MASTER HANDLERS: BIC CODE ---
  const handleBicMasterSubmit = async (e) => {
    e.preventDefault();
    if (bicMasterForm.allowedTypes.length === 0) {
      alert("Please select at least one associated Payment Type.");
      return;
    }
    await BankingServices.saveBicCodeMaster({
      ...bicMasterForm,
      bicCode: bicMasterForm.bicCode.toUpperCase(),
    });
    await loadMasters();
    setShowBicMaster(false);
    setBicMasterForm(initialBicMaster);
    alert(`BIC Code ${bicMasterForm.bicCode} saved successfully.`);
  };

  const loadBicForModification = (e) => {
    const selected = bicCodes.find((b) => b.bicCode === e.target.value);
    if (selected) setBicMasterForm(selected);
  };

  const handleBicTypeCheckbox = (typeCode) => {
    setBicMasterForm((prev) => {
      const exists = prev.allowedTypes.includes(typeCode);
      if (exists)
        return {
          ...prev,
          allowedTypes: prev.allowedTypes.filter((t) => t !== typeCode),
        };
      return { ...prev, allowedTypes: [...prev.allowedTypes, typeCode] };
    });
  };

  // --- UI HELPERS ---
  // Find the currently selected payment type to show its description
  const selectedPaymentMaster = paymentTypes.find(
    (p) => p.typeCode === formData.paymentType,
  );

  // Filter BIC codes so the user can only select a BIC that allows the currently chosen Payment Type
  const filteredBicCodes = bicCodes.filter((bic) =>
    bic.allowedTypes.includes(formData.paymentType),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-fintech-900">
            Maker Workspace
          </h2>
          <select
            className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none bg-white font-medium text-slate-700"
            value={actionMode}
            onChange={(e) => setActionMode(e.target.value)}
          >
            <option value="ADD">Action: Add New Transfer</option>
            <option value="MODIFY">Action: Modify Existing</option>
            <option value="COPY">Action: Copy Transfer</option>
          </select>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("ACTION")}
            className={`px-6 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === "ACTION" ? "bg-white text-fintech-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200"}`}
          >
            Transfer Action
          </button>
          <button
            onClick={() => setActiveTab("INQUIRY")}
            className={`px-6 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === "INQUIRY" ? "bg-white text-fintech-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200"}`}
          >
            Transfer Inquiry
          </button>
        </div>
      </div>

      <div className="p-6 min-h-[600px]">
        {/* ================= TRANSACTION ACTION VIEW ================= */}
        {activeTab === "ACTION" && (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 p-6 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              />
            </div>

            {/* DYNAMIC PAYMENT TYPE FIELD */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase">
                  Payment Type
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMasterMode("ADD");
                    setShowPaymentMaster(true);
                  }}
                  className="text-xs text-fintech-600 hover:text-fintech-800 font-bold tracking-wide"
                >
                  + MASTER
                </button>
              </div>
              <select
                name="paymentType"
                required
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 font-mono font-medium"
              >
                {paymentTypes.map((pt) => (
                  <option key={pt.typeCode} value={pt.typeCode}>
                    {pt.typeCode}
                  </option>
                ))}
              </select>
              {/* Brief discussion displayed in smaller font */}
              {selectedPaymentMaster && (
                <p className="mt-1.5 text-[11px] text-slate-500 italic leading-tight">
                  {selectedPaymentMaster.description} <br />
                  <span className="font-semibold">Limits:</span>{" "}
                  {selectedPaymentMaster.currency}{" "}
                  {selectedPaymentMaster.minAmount} -{" "}
                  {selectedPaymentMaster.maxAmount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                From Account
              </label>
              <input
                type="text"
                name="fromAccount"
                required
                value={formData.fromAccount}
                onChange={handleChange}
                placeholder="Account UUID"
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Currency
              </label>
              <select
                name="paymentCurrency"
                value={formData.paymentCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                name="paymentAmount"
                required
                value={formData.paymentAmount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              />
            </div>

            {/* DYNAMIC BIC CODE FIELD */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase">
                  Beneficiary BIC
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBicMasterMode("ADD");
                    setShowBicMaster(true);
                  }}
                  className="text-xs text-fintech-600 hover:text-fintech-800 font-bold tracking-wide"
                >
                  + MASTER
                </button>
              </div>
              <select
                name="beneficiaryBic"
                required
                value={formData.beneficiaryBic}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 uppercase font-mono"
              >
                <option value="">-- Select BIC --</option>
                {filteredBicCodes.map((bic) => (
                  <option key={bic.bicCode} value={bic.bicCode}>
                    {bic.bicCode} - {bic.bankName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Beneficiary A/C
              </label>
              <input
                type="text"
                name="beneficiaryAccount"
                required
                value={formData.beneficiaryAccount}
                onChange={handleChange}
                placeholder="IBAN or A/C No"
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Beneficiary Name
              </label>
              <input
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                placeholder="Legal Name"
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Beneficiary Address
              </label>
              <input
                type="text"
                name="beneficiaryAddress"
                value={formData.beneficiaryAddress}
                onChange={handleChange}
                placeholder="Street, City, Country"
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Payment Remarks
              </label>
              <input
                type="text"
                name="paymentRemarks"
                value={formData.paymentRemarks}
                onChange={handleChange}
                placeholder="Remarks..."
                className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-fintech-600"
              />
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-fintech-600 hover:bg-fintech-700 text-white rounded font-bold shadow transition-all disabled:bg-slate-400"
              >
                {isSubmitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        {/* ================= TRANSACTION INQUIRY VIEW ================= */}
        {activeTab === "INQUIRY" && (
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-600 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Serial No</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">From A/C</th>
                  <th className="px-4 py-3">Ben. A/C</th>
                  <th className="px-4 py-3">BIC</th>
                </tr>
              </thead>
              <tbody>
                {inquiryData.map((trx, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-fintech-600">
                      {trx.paymentSerialNo}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500">
                      {trx.status.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-mono">{trx.paymentType}</td>
                    <td className="px-4 py-3 font-semibold">
                      {trx.paymentCurrency} {trx.paymentAmount}
                    </td>
                    <td className="px-4 py-3 font-mono">{trx.fromAccount}</td>
                    <td className="px-4 py-3 font-mono">
                      {trx.beneficiaryAccount}
                    </td>
                    <td className="px-4 py-3 uppercase">
                      {trx.beneficiaryBic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: PAYMENT TYPE MASTER ================= */}
      {showPaymentMaster && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold tracking-wide">Master: Payment Type</h3>
              <button
                onClick={() => setShowPaymentMaster(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="flex space-x-2 border-b border-slate-200 mb-6 pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMasterMode === "ADD"}
                    onChange={() => {
                      setPaymentMasterMode("ADD");
                      setPaymentMasterForm(initialPaymentMaster);
                    }}
                    className="text-fintech-600 focus:ring-fintech-500"
                  />
                  <span className="font-medium text-sm text-slate-700">
                    Add New
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer ml-4">
                  <input
                    type="radio"
                    checked={paymentMasterMode === "MODIFY"}
                    onChange={() => setPaymentMasterMode("MODIFY")}
                    className="text-fintech-600 focus:ring-fintech-500"
                  />
                  <span className="font-medium text-sm text-slate-700">
                    Modify Existing
                  </span>
                </label>
              </div>

              <form onSubmit={handlePaymentMasterSubmit} className="space-y-4">
                {paymentMasterMode === "MODIFY" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Select Record to Modify
                    </label>
                    <select
                      onChange={loadPaymentForModification}
                      className="w-full px-3 py-2 border rounded outline-none font-mono text-sm bg-slate-50"
                    >
                      <option value="">-- Select --</option>
                      {paymentTypes.map((pt) => (
                        <option key={pt.typeCode} value={pt.typeCode}>
                          {pt.typeCode}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Payment Type (Max 6 chars)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      maxLength="6"
                      disabled={paymentMasterMode === "MODIFY"}
                      value={paymentMasterForm.baseCode}
                      onChange={(e) =>
                        setPaymentMasterForm({
                          ...paymentMasterForm,
                          baseCode: e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-l outline-none focus:border-fintech-600 uppercase font-mono tracking-widest disabled:bg-slate-100"
                    />
                    <div className="px-4 py-2 bg-slate-200 border-t border-r border-b rounded-r text-slate-600 font-bold font-mono">
                      CO
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentMasterForm.description}
                    onChange={(e) =>
                      setPaymentMasterForm({
                        ...paymentMasterForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded outline-none focus:border-fintech-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      required
                      value={paymentMasterForm.minAmount}
                      onChange={(e) =>
                        setPaymentMasterForm({
                          ...paymentMasterForm,
                          minAmount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded outline-none focus:border-fintech-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      required
                      value={paymentMasterForm.maxAmount}
                      onChange={(e) =>
                        setPaymentMasterForm({
                          ...paymentMasterForm,
                          maxAmount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded outline-none focus:border-fintech-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={paymentMasterForm.currency}
                    onChange={(e) =>
                      setPaymentMasterForm({
                        ...paymentMasterForm,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-800 text-white rounded font-medium shadow-sm hover:bg-slate-700"
                  >
                    Save Master Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BIC CODE MASTER ================= */}
      {showBicMaster && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold tracking-wide">
                Master: Beneficiary BIC
              </h3>
              <button
                onClick={() => setShowBicMaster(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="flex space-x-2 border-b border-slate-200 mb-6 pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={bicMasterMode === "ADD"}
                    onChange={() => {
                      setBicMasterMode("ADD");
                      setBicMasterForm(initialBicMaster);
                    }}
                    className="text-fintech-600 focus:ring-fintech-500"
                  />
                  <span className="font-medium text-sm text-slate-700">
                    Add New
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer ml-4">
                  <input
                    type="radio"
                    checked={bicMasterMode === "MODIFY"}
                    onChange={() => setBicMasterMode("MODIFY")}
                    className="text-fintech-600 focus:ring-fintech-500"
                  />
                  <span className="font-medium text-sm text-slate-700">
                    Modify Existing
                  </span>
                </label>
              </div>

              <form onSubmit={handleBicMasterSubmit} className="space-y-4">
                {bicMasterMode === "MODIFY" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Select BIC to Modify
                    </label>
                    <select
                      onChange={loadBicForModification}
                      className="w-full px-3 py-2 border rounded outline-none font-mono text-sm bg-slate-50"
                    >
                      <option value="">-- Select --</option>
                      {bicCodes.map((b) => (
                        <option key={b.bicCode} value={b.bicCode}>
                          {b.bicCode} - {b.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    BIC Code (8 or 12 chars)
                  </label>
                  <input
                    type="text"
                    required
                    minLength="8"
                    maxLength="12"
                    disabled={bicMasterMode === "MODIFY"}
                    value={bicMasterForm.bicCode}
                    onChange={(e) =>
                      setBicMasterForm({
                        ...bicMasterForm,
                        bicCode: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 border rounded outline-none uppercase font-mono tracking-widest disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bicMasterForm.bankName}
                    onChange={(e) =>
                      setBicMasterForm({
                        ...bicMasterForm,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bicMasterForm.branchName}
                    onChange={(e) =>
                      setBicMasterForm({
                        ...bicMasterForm,
                        branchName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded outline-none"
                  />
                </div>

                {/* Multi-Select for Allowed Payment Types */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                    Allowed Payment Types
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border border-slate-200 rounded">
                    {paymentTypes.map((pt) => (
                      <label
                        key={pt.typeCode}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={bicMasterForm.allowedTypes.includes(
                            pt.typeCode,
                          )}
                          onChange={() => handleBicTypeCheckbox(pt.typeCode)}
                          className="rounded text-fintech-600 focus:ring-fintech-500"
                        />
                        <span className="text-sm font-mono text-slate-700">
                          {pt.typeCode}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-800 text-white rounded font-medium shadow-sm hover:bg-slate-700"
                  >
                    Save BIC Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakerDashboard;
