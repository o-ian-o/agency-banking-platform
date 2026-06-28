import React, { useState, useEffect } from "react";
import { BankingServices } from "../api/bankingServices";

const SystemMasterDashboard = () => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [bics, setBics] = useState([]);

  const [ptForm, setPtForm] = useState({
    typeCode: "",
    description: "",
    isActive: true,
  });
  const [bicForm, setBicForm] = useState({
    bicCode: "",
    bankName: "",
    country: "Papua New Guinea",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setPaymentTypes(await BankingServices.fetchPaymentTypesMaster());
    setBics(await BankingServices.fetchBeneficiaryBicsMaster());
  };

  const handleSavePT = async (e) => {
    e.preventDefault();
    await BankingServices.savePaymentTypeMaster({
      ...ptForm,
      typeCode: ptForm.typeCode.toUpperCase(),
    });
    setPtForm({ typeCode: "", description: "", isActive: true });
    loadData();
  };

  const handleSaveBic = async (e) => {
    e.preventDefault();

    await BankingServices.saveBeneficiaryBicMaster({
      ...bicForm,
      bicCode: bicForm.bicCode.toUpperCase(),
      // FORCE the string from the dropdown into an Integer:
      paymentTypeId: parseInt(bicForm.paymentTypeId, 10),
    });

    // Reset the form after successful save
    setBicForm({
      bicCode: "",
      bankName: "",
      country: "Papua New Guinea",
      paymentTypeId: "",
      isActive: true,
    });
    loadData();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">
        System Master Configuration
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* PAYMENT TYPES MASTER */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold">Payment Types</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSaveBic} className="flex flex-col gap-2 mb-6">
              <div className="flex gap-2">
                <input
                  required
                  value={bicForm.bicCode}
                  onChange={(e) =>
                    setBicForm({ ...bicForm, bicCode: e.target.value })
                  }
                  placeholder="BIC Code"
                  className="border p-2 rounded w-1/4 uppercase font-mono text-sm"
                />
                <input
                  required
                  value={bicForm.bankName}
                  onChange={(e) =>
                    setBicForm({ ...bicForm, bankName: e.target.value })
                  }
                  placeholder="Bank Name"
                  className="border p-2 rounded flex-1 text-sm"
                />

                {/* NEW: Dropdown to link BIC to a Payment Type */}
                <select
                  required
                  value={bicForm.paymentTypeId || ""}
                  onChange={(e) =>
                    setBicForm({ ...bicForm, paymentTypeId: e.target.value })
                  }
                  className="border p-2 rounded flex-1 text-sm"
                >
                  <option value="">-- Select Payment Type --</option>
                  {paymentTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.description} ({pt.typeCode})
                    </option>
                  ))}
                </select>
              </div>
              <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-bold">
                Add / Update Bank BIC
              </button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {paymentTypes.map((pt) => (
                  <tr key={pt.typeCode} className="border-b">
                    <td className="p-2 font-mono font-bold text-emerald-600">
                      {pt.typeCode}
                    </td>
                    <td className="p-2">{pt.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BENEFICIARY BIC MASTER */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold">Beneficiary BICs</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSaveBic} className="flex flex-col gap-2 mb-6">
              <div className="flex gap-2">
                <input
                  required
                  value={bicForm.bicCode}
                  onChange={(e) =>
                    setBicForm({ ...bicForm, bicCode: e.target.value })
                  }
                  placeholder="BIC Code"
                  className="border p-2 rounded w-1/3 uppercase font-mono text-sm"
                />
                <input
                  required
                  value={bicForm.bankName}
                  onChange={(e) =>
                    setBicForm({ ...bicForm, bankName: e.target.value })
                  }
                  placeholder="Bank Name"
                  className="border p-2 rounded flex-1 text-sm"
                />
              </div>
              <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-bold">
                Add / Update Bank BIC
              </button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-2">BIC</th>
                  <th className="p-2">Bank Name</th>
                </tr>
              </thead>
              <tbody>
                {bics.map((b) => (
                  <tr key={b.bicCode} className="border-b">
                    <td className="p-2 font-mono font-bold text-emerald-600">
                      {b.bicCode}
                    </td>
                    <td className="p-2">{b.bankName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SystemMasterDashboard;
