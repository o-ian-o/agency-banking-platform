import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BankingServices } from "../api/bankingServices";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState(""); // State updated to password
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Pass the password to the backend
      const userData = await BankingServices.login(userId, password);
      login(userData);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-xl w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          System Login
        </h2>

        {error && (
          <p className="text-rose-500 text-sm mb-4 text-center bg-rose-50 border border-rose-200 p-2 rounded">
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
              autoFocus
              value={userId}
              onChange={(e) => setUserId(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-slate-300 rounded outline-none uppercase font-mono focus:border-emerald-600"
              placeholder="e.g. SUP-00001"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-emerald-600"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded hover:bg-emerald-700 transition-colors disabled:bg-slate-400 mt-2"
          >
            {isLoading ? "Authenticating..." : "Enter Portal"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by AES-256 / BCrypt Security
        </p>
      </div>
    </div>
  );
};

export default Login;
