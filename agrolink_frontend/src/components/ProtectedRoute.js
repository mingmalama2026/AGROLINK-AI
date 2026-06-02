import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    // Not logged in → force to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role → block access
    return <Navigate to="/" replace />;
  }

  // Allowed → show the page
  return children;
}

export default ProtectedRoute;
