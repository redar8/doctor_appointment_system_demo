import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Simulate data fetching with dummy data
  useEffect(() => {
    // Dummy patients
    const dummyPatients = [
      { id: "p1", fullName: "John Doe", mobile: "1234567890" },
      { id: "p2", fullName: "Jane Smith", mobile: "0987654321" },
      { id: "p3", fullName: "Alice Johnson", mobile: "5555555555" },
    ];

    // Dummy appointments
    const now = new Date();
    const isoToday = now.toISOString().split("T")[0];
    const dummyAppointments = [
      {
        id: "a1",
        fullName: "John Doe",
        mobile: "1234567890",
        date: isoToday + "T09:00:00Z",
        time: "09:00",
        status: "Active",
      },
      {
        id: "a2",
        fullName: "Jane Smith",
        mobile: "0987654321",
        date: isoToday + "T11:30:00Z",
        time: "11:30",
        status: "Completed",
      },
      {
        id: "a3",
        fullName: "Alice Johnson",
        mobile: "5555555555",
        date: isoToday + "T14:00:00Z",
        time: "14:00",
        status: "Cancelled",
      },
      {
        id: "a4",
        fullName: "John Doe",
        mobile: "1234567890",
        date: "2025-07-07T10:00:00Z",
        time: "10:00",
        status: "Active",
      },
    ];

    // Mimic async loading delay
    setTimeout(() => {
      setPatients(dummyPatients);
      setAppointments(dummyAppointments);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle status updates locally
  const handleUpdateStatus = (appointmentId, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, status: newStatus } : app
      )
    );
  };

  // Helper function to check if date is today (consider timezone)
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate chart data for today's appointments
  const statusCounts = appointments
    .filter((app) => app.date && isToday(app.date))
    .reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

  const chartData = [
    {
      name: "Active",
      value: statusCounts.Active || 0,
      color: "#4e73df",
      isToday: true,
    },
    {
      name: "Completed",
      value: statusCounts.Completed || 0,
      color: "#1cc88a",
      isToday: true,
    },
    {
      name: "Cancelled",
      value: statusCounts.Cancelled || 0,
      color: "#e74a3b",
      isToday: true,
    },
  ];

  // Stats calculations
  const totalPatients = patients.length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "Completed"
  ).length;
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "Cancelled"
  ).length;
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (a) => a.date?.split("T")[0] === today
  ).length;
  const activeAppointments = appointments.filter(
    (a) => a.status === "Active"
  ).length;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get today's appointments sorted by time
  const todaysAppointmentsList = appointments
    .filter((app) => {
      const appointmentDate = new Date(app.date);
      const todayDate = new Date();
      return (
        appointmentDate.getDate() === todayDate.getDate() &&
        appointmentDate.getMonth() === todayDate.getMonth() &&
        appointmentDate.getFullYear() === todayDate.getFullYear()
      );
    })
    .sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);

      // Add time to date objects if available
      if (a.time) {
        const [aHours, aMinutes] = a.time.split(":").map(Number);
        aDate.setHours(aHours, aMinutes);
      }
      if (b.time) {
        const [bHours, bMinutes] = b.time.split(":").map(Number);
        bDate.setHours(bHours, bMinutes);
      }

      return aDate - bDate;
    });

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="container-fluid py-4">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mobile Appointment Card Component
  const MobileAppointmentCard = ({ app }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row">
          <div className="col-8">
            <h5 className="card-title">{app.fullName}</h5>
            <p className="card-text mb-1">
              <span className="fw-bold">Mobile:</span> {app.mobile}
            </p>
            <p className="card-text mb-1">
              <span className="fw-bold">Date:</span>{" "}
              {new Date(app.date).toLocaleDateString()}
            </p>
            <p className="card-text mb-1">
              <span className="fw-bold">Time:</span>{" "}
              {app.time ||
                new Date(app.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
          </div>
          <div className="col-4 text-end">
            <span
              className={`badge ${
                app.status === "Completed"
                  ? "bg-success"
                  : app.status === "Cancelled"
                  ? "bg-danger"
                  : "bg-primary"
              }`}
            >
              {app.status}
            </span>
          </div>
        </div>
        <div className="d-grid gap-2 mt-3">
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm flex-fill ${
                app.status === "Active" ? "btn-primary" : "btn-outline-primary"
              }`}
              disabled={app.status === "Active"}
              onClick={() => handleUpdateStatus(app.id, "Active")}
            >
              <i className="bi bi-x-lg d-none d-sm-inline"></i>
              <span className="ms-sm-1">Active</span>
            </button>
            <button
              className={`btn btn-sm flex-fill ${
                app.status === "Completed"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              disabled={app.status === "Completed"}
              onClick={() => handleUpdateStatus(app.id, "Completed")}
            >
              <i className="bi bi-check-lg d-none d-sm-inline"></i>
              <span className="ms-sm-1">Complete</span>
            </button>
            <button
              className={`btn btn-sm flex-fill ${
                app.status === "Cancelled" ? "btn-danger" : "btn-outline-danger"
              }`}
              disabled={app.status === "Cancelled"}
              onClick={() => handleUpdateStatus(app.id, "Cancelled")}
            >
              <i className="bi bi-x-lg d-none d-sm-inline"></i>
              <span className="ms-sm-1">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar
        toggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <Sidebar collapsed={sidebarCollapsed} />

      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="container-fluid py-4">
          {/* Stats Cards Section - Responsive Grid */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link to="/patients" className="text-decoration-none">
                <StatCard
                  title="Total Patients"
                  value={totalPatients}
                  icon="people-fill"
                  iconColor="#4e73df"
                  isLoading={isLoading}
                />
              </Link>
            </div>

            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link to="/appointments" className="text-decoration-none">
                <StatCard
                  title="Total Appointments"
                  value={totalAppointments}
                  icon="calendar2-event-fill"
                  iconColor="#1cc88a"
                  isLoading={isLoading}
                />
              </Link>
            </div>

            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link
                to="/appointments?status=completed"
                className="text-decoration-none"
              >
                <StatCard
                  title="Completed"
                  value={completedAppointments}
                  icon="check-circle-fill"
                  iconColor="#36b9cc"
                  isLoading={isLoading}
                />
              </Link>
            </div>

            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link
                to="/appointments?status=cancelled"
                className="text-decoration-none"
              >
                <StatCard
                  title="Cancelled"
                  value={cancelledAppointments}
                  icon="x-circle-fill"
                  iconColor="#e74a3b"
                  isLoading={isLoading}
                />
              </Link>
            </div>

            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link
                to={`/appointments?date=${
                  new Date().toISOString().split("T")[0]
                }`}
                className="text-decoration-none"
              >
                <StatCard
                  title="Today"
                  value={todaysAppointments}
                  icon="calendar2-fill"
                  iconColor="#f6c23e"
                  isLoading={isLoading}
                />
              </Link>
            </div>

            <div className="col-6 col-sm-4 col-md-4 col-lg-2">
              <Link
                to="/appointments?status=active"
                className="text-decoration-none"
              >
                <StatCard
                  title="Active"
                  value={activeAppointments}
                  icon="clock-fill"
                  iconColor="#858796"
                  isLoading={isLoading}
                />
              </Link>
            </div>
          </div>

          {/* Pie Chart Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    Today's Appointment Status
                  </h5>
                  <div
                    style={{ height: "300px" }}
                    className="d-flex justify-content-center"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments List */}
          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">Today's Appointments</h4>

              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Mobile</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointmentsList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No appointments today.
                        </td>
                      </tr>
                    ) : (
                      todaysAppointmentsList.map((app) => (
                        <tr key={app.id}>
                          <td>{app.fullName}</td>
                          <td>{app.mobile}</td>
                          <td>{new Date(app.date).toLocaleDateString()}</td>
                          <td>
                            {app.time ||
                              new Date(app.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                app.status === "Completed"
                                  ? "bg-success"
                                  : app.status === "Cancelled"
                                  ? "bg-danger"
                                  : "bg-primary"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className={`btn btn-sm ${
                                  app.status === "Active"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                disabled={app.status === "Active"}
                                onClick={() =>
                                  handleUpdateStatus(app.id, "Active")
                                }
                              >
                                <i className="bi bi-x-lg"></i> Active
                              </button>
                              <button
                                className={`btn btn-sm ${
                                  app.status === "Completed"
                                    ? "btn-success"
                                    : "btn-outline-success"
                                }`}
                                disabled={app.status === "Completed"}
                                onClick={() =>
                                  handleUpdateStatus(app.id, "Completed")
                                }
                              >
                                <i className="bi bi-check-lg"></i> Complete
                              </button>
                              <button
                                className={`btn btn-sm ${
                                  app.status === "Cancelled"
                                    ? "btn-danger"
                                    : "btn-outline-danger"
                                }`}
                                disabled={app.status === "Cancelled"}
                                onClick={() =>
                                  handleUpdateStatus(app.id, "Cancelled")
                                }
                              >
                                <i className="bi bi-x-lg"></i> Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {todaysAppointmentsList.length === 0 ? (
                  <p>No appointments today.</p>
                ) : (
                  todaysAppointmentsList.map((app) => (
                    <MobileAppointmentCard key={app.id} app={app} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, iconColor, isLoading }) {
  return (
    <div className="card shadow-sm text-center">
      <div className="card-body">
        <i
          className={`bi bi-${icon}`}
          style={{ fontSize: "2rem", color: iconColor }}
          aria-hidden="true"
        ></i>
        <h5 className="card-title mt-2">{title}</h5>
        {isLoading ? (
          <div
            className="spinner-border spinner-border-sm text-secondary"
            role="status"
          />
        ) : (
          <p className="card-text fs-4 fw-bold">{value}</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
