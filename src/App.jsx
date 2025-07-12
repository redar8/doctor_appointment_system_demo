import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

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

  // On mount, check if user is saved in localStorage (simulate logged in)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Function to simulate login: save user to state and localStorage
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Function to simulate logout: clear user state and localStorage
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public route: login */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route
            path="/dashboard"
            element={<Dashboard user={user} onLogout={handleLogout} />}
          />
          <Route
            path="/create-appointments"
            element={<CreateAppointments user={user} />}
          />
          <Route path="/appointments" element={<Appointments user={user} />} />
          <Route path="/patients" element={<Patients user={user} />} />
          <Route path="/admins" element={<AdminList user={user} />} />
          <Route
            path="/register-admin"
            element={<RegisterAdmin user={user} />}
          />
          <Route
            path="/profile"
            element={<ProfileSettings user={user} onLogout={handleLogout} />}
          />
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
