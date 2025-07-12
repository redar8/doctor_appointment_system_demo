import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "./firebase"; // Firebase Auth only
import { onAuthStateChanged } from "firebase/auth";

import Dashboard from "./pages/Dashboard";
import CreateAppointments from "./pages/CreateAppointments";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import AdminList from "./pages/AdminList";
import ProfileSettings from "./pages/ProfileSettings";
import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";

const ProtectedRoute = ({ user }) => {
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public route: login */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-appointments" element={<CreateAppointments />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/admins" element={<AdminList />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
