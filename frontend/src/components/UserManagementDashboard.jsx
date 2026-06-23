import React, { useState, useEffect } from "react";
import { BankingServices } from "../api/bankingServices";

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    mobile: "",
    email: "",
    groupId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setUsers(await BankingServices.fetchUsers());
    setGroups(await BankingServices.fetchGroups());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = await BankingServices.createUser(form);
    alert(`User Created!\nAssigned Meaningful ID: ${newUser.userId}`);
    loadData();
    setForm({ userName: "", mobile: "", email: "", groupId: "" });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-bold">Assign User Profiles</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-slate-50 p-6 rounded border border-slate-200"
        >
          <div>
            <label className="block text-xs font-bold mb-1">User Name</label>
            <input
              type="text"
              required
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Mobile</label>
            <input
              type="text"
              required
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Assign Group</label>
            <select
              required
              value={form.groupId}
              onChange={(e) => setForm({ ...form, groupId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.groupId} value={g.groupId}>
                  {g.groupName} ({g.groupId})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white font-bold py-2 rounded"
          >
            Create User Profile
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Group ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-b">
                  <td className="p-3 font-mono font-bold text-emerald-600">
                    {u.userId}
                  </td>
                  <td className="p-3">{u.userName}</td>
                  <td className="p-3 font-mono">{u.groupId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserManagementDashboard;
