import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import MakerDashboard from "./components/MakerDashboard";
import CheckerDashboard from "./components/CheckerDashboard";

import VoucherDashboard from "./components/VoucherDashboard";
import StatementDashboard from "./components/StatementDashboard";
import CommissionDashboard from "./components/CommissionDashboard";
import ProfileDashboard from "./components/ProfileDashboard";
import SyncDashboard from "./components/SyncDashboard";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Default Route: Redirects the root URL to the Vouchers module */}
          <Route path="/" element={<Navigate to="/vouchers" replace />} />

          <Route path="/transfers/maker" element={<MakerDashboard />} />
          <Route path="/transfers/checker" element={<CheckerDashboard />} />

          {/* Exhaustive API Routes */}

          <Route path="/vouchers" element={<VoucherDashboard />} />
          <Route path="/statements" element={<StatementDashboard />} />
          <Route path="/commissions" element={<CommissionDashboard />} />
          <Route path="/profile" element={<ProfileDashboard />} />
          <Route path="/sync" element={<SyncDashboard />} />

          {/* Fallback 404 Route for unmatched URLs */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                  !
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-700">
                    404 - Module Not Found
                  </h2>
                  <p className="mt-2">
                    The requested operational module does not exist.
                  </p>
                  <p>Please select a valid option from the sidebar menu.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
