import React, { useState, useEffect } from "react";
import { BankingServices } from "../api/bankingServices";

const GroupMasterDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    groupId: "",
    groupName: "",
    description: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);
  const loadGroups = async () => setGroups(await BankingServices.fetchGroups());

  const handleSubmit = async (e) => {
    e.preventDefault();
    await BankingServices.saveGroup({
      ...form,
      groupId: `GRP_${form.groupName.toUpperCase()}`,
      access: ["MAPPED_LATER"],
    });
    loadGroups();
    setForm({ groupId: "", groupName: "", description: "" });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-bold">Group Master Configuration</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-slate-50 p-6 rounded border border-slate-200"
        >
          <div>
            <label className="block text-xs font-bold mb-1">Group Name</label>
            <input
              type="text"
              required
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="e.g. Auditor"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Description</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white font-bold py-2 rounded"
          >
            Save Group
          </button>
        </form>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="p-3">Group ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Desc</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.groupId} className="border-b">
                  <td className="p-3 font-mono font-bold text-emerald-600">
                    {g.groupId}
                  </td>
                  <td className="p-3">{g.groupName}</td>
                  <td className="p-3">{g.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default GroupMasterDashboard;
