import React, { useState } from "react";
import { BankingServices } from "../api/bankingServices";

const ProfileDashboard = () => {
  const [formData, setFormData] = useState({
    customerId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    kycTier: "TIER_1",
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await BankingServices.updateProfile(formData);
      setStatusMessage({
        type: "success",
        text: `Profile successfully updated for Customer ID: ${formData.customerId}`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile. Please check connection and credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-fintech-800">
          Profile Management
        </h2>
        <p className="text-sm text-slate-500">
          Update customer account records and adjust KYC levels securely.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Customer ID (UUID)
            </label>
            <input
              type="text"
              name="customerId"
              required
              placeholder="e.g. f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none transition-all text-sm font-mono"
              value={formData.customerId}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="John"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none transition-all text-sm"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none transition-all text-sm"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="john.doe@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none transition-all text-sm"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              required
              placeholder="+1234567890"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 outline-none transition-all text-sm"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              KYC Verification Tier
            </label>
            <select
              name="kycTier"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fintech-500 focus:border-fintech-500 bg-white outline-none transition-all text-sm"
              value={formData.kycTier}
              onChange={handleChange}
            >
              <option value="TIER_1">Tier 1 (Basic Operational)</option>
              <option value="TIER_2">Tier 2 (Semi-Verified)</option>
              <option value="TIER_3">Tier 3 (Fully Verified Asset)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-medium py-2.5 rounded-lg text-white transition-colors ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-fintech-600 hover:bg-fintech-700"
          }`}
        >
          {loading ? "Processing Update..." : "Commit Profile Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfileDashboard;
