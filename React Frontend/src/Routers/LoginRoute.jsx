import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
const LoginRoute = ({ element }) => {
  // const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);
  const jwt = localStorage.getItem("jwt");

  if (auth.jwt || jwt) {
    return <Navigate to="/" replace />;
  }
  return element;
};

export default LoginRoute;
