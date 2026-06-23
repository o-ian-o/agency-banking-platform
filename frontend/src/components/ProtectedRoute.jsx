import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-3xl font-bold text-rose-600 mb-4">Access Denied</h2>
        <p>
          Your role ({user.role}) does not have permission to view this module.
        </p>
      </div>
    );
  }
  return children;
};
export default ProtectedRoute;
