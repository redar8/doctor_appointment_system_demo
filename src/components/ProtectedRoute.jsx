import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));

  return authUser ? (
    <Outlet />
  ) : (
    <Navigate
      to="/"
      replace
      state={{
        from: location,
        error: "You need to login to access this page",
      }}
    />
  );
};

export default ProtectedRoute;
