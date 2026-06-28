import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./components/Login";
import Layout from "./components/Layout";
import MakerDashboard from "./components/MakerDashboard";
import CheckerDashboard from "./components/CheckerDashboard";
import UserManagementDashboard from "./components/UserManagementDashboard";
import GroupMasterDashboard from "./components/GroupMasterDashboard";
import VoucherDashboard from "./components/VoucherDashboard"; // Assuming you have this
import SystemMasterDashboard from "./components/SystemMasterDashboard";

const SmartRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "SUPERUSER") return <Navigate to="/admin/users" replace />;
  if (user?.role === "CHECKER")
    return <Navigate to="/transfers/checker" replace />;
  return <Navigate to="/transfers/maker" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SmartRedirect />
              </ProtectedRoute>
            }
          />

          {/* RBAC Routes */}
          <Route
            path="/transfers/maker"
            element={
              <ProtectedRoute allowedRoles={["MAKER", "SUPERUSER"]}>
                <Layout>
                  <MakerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfers/checker"
            element={
              <ProtectedRoute allowedRoles={["CHECKER", "SUPERUSER"]}>
                <Layout>
                  <CheckerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["SUPERUSER"]}>
                <Layout>
                  <UserManagementDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute allowedRoles={["SUPERUSER"]}>
                <Layout>
                  <GroupMasterDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/masters"
            element={
              <ProtectedRoute allowedRoles={["SUPERUSER"]}>
                <Layout>
                  <SystemMasterDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vouchers"
            element={
              <ProtectedRoute>
                <Layout>
                  <VoucherDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
