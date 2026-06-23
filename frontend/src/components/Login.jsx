import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BankingServices } from "../api/bankingServices";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await BankingServices.login(userId, userName);
      login(userData);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-xl w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          System Login
        </h2>
        {error && (
          <p className="text-rose-500 text-sm mb-4 text-center bg-rose-50 p-2 rounded">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              User ID
            </label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded outline-none uppercase font-mono"
              placeholder="e.g. SUP-00001"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              User Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border rounded outline-none"
              placeholder="e.g. System Admin"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded hover:bg-emerald-700"
          >
            Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
