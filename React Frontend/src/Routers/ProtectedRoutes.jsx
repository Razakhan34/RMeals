// components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element }) => {
  const { auth } = useSelector((store) => store);
  const jwt = localStorage.getItem("jwt");

  if (!auth.jwt && !jwt) {
    return <Navigate to="/account/login" replace />;
  }

  if (
    auth.user?.role === "ROLE_ADMIN" &&
    auth.user?.role === "ROLE_RESTAURANT_OWNER"
  ) {
    return <Navigate to="/admin/restaurant/" replace />;
  }

  return element;
};

export default ProtectedRoute;
