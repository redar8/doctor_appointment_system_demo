import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AppointmentModal from "../components/AppointmentModal";
import { useLocation, useNavigate } from "react-router-dom";

function Appointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Female",
    email: "",
    mobile: "",
    address: "",
    date: "",
    time: "",
    notes: "",
    status: "Active",
    patientStatus: "Pregnancy",
  });
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [patientStatusFilter, setPatientStatusFilter] = useState("All");

  // Initialize with sample data for demo
  useEffect(() => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    } else {
      // Default demo data
      const demoAppointments = [
        {
          id: "1",
          fullName: "Sarah Johnson",
          mobile: "555-1234",
          date: "2023-10-15",
          time: "10:00",
          status: "Active",
          address: "123 Main St",
          age: "28",
          gender: "Female",
          email: "sarah@example.com",
          notes: "First consultation",
          patientStatus: "Pregnancy",
        },
        {
          id: "2",
          fullName: "Michael Chen",
          mobile: "555-5678",
          date: "2023-10-16",
          time: "14:30",
          status: "Completed",
          address: "456 Oak Ave",
          age: "35",
          gender: "Male",
          email: "michael@example.com",
          notes: "Follow-up visit",
          patientStatus: "IVF",
        },
      ];
      setAppointments(demoAppointments);
      localStorage.setItem("appointments", JSON.stringify(demoAppointments));
    }
  }, []);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem("appointments", JSON.stringify(appointments));
    }
  }, [appointments]);

  // Read URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) {
      const statusMap = {
        cancelled: "Cancelled",
        completed: "Completed",
        active: "Active",
      };

      if (statusMap[statusParam.toLowerCase()]) {
        setStatusFilter(statusMap[statusParam.toLowerCase()]);
      }
    }
  }, [location.search]);

  useEffect(() => {
    const selectedIds = appointments
      .filter((appointment) => appointment.selected)
      .map((appointment) => appointment.id);
    setSelectedAppointments(selectedIds);
  }, [appointments]);

  // Clear URL params when filters are reset
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("");
    setPatientStatusFilter("All");
    navigate("/appointments");
  };

  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter((appointment) => {
        const nameMatch = appointment.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const mobileMatch = String(appointment.mobile || "").includes(
          searchTerm
        );
        return nameMatch || mobileMatch;
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.date === dateFilter
      );
    }

    if (patientStatusFilter !== "All") {
      filtered = filtered.filter(
        (appointment) => appointment.patientStatus === patientStatusFilter
      );
    }

    // Sort appointments by date descending (newest first)
    filtered.sort((a, b) => {
      if (b.date > a.date) return -1;
      if (b.date < a.date) return 1;
      if (b.time > a.time) return -1;
      if (b.time < a.time) return 1;
      return 0;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter, patientStatusFilter]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkDuplicateAppointment = (date, time, excludeId = null) => {
    return appointments.some(
      (app) => app.date === date && app.time === time && app.id !== excludeId
    );
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      fullName: appointment.fullName,
      age: appointment.age,
      gender: appointment.gender,
      email: appointment.email,
      mobile: appointment.mobile,
      address: appointment.address,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || "",
      patientStatus: appointment.patientStatus || "Pregnancy",
    });
    setShowModal(true);
  };

  const handleAddNewClick = () => {
    setEditingAppointment(null);
    setFormData({
      fullName: "",
      age: "",
      gender: "Female",
      email: "",
      mobile: "",
      address: "",
      date: "",
      time: "",
      notes: "",
      status: "Active",
      patientStatus: "Pregnancy",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, mobile, date, time, status } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!fullName || !mobile || !date || !time || !status) {
      toast.error("Please fill all required fields");
      return;
    }

    if (date < today) {
      toast.error("Appointment date cannot be in the past");
      return;
    }

    const isDuplicate = checkDuplicateAppointment(
      date,
      time,
      editingAppointment?.id
    );

    if (isDuplicate) {
      toast.error("An appointment already exists at this date and time");
      return;
    }

    try {
      const appointmentData = {
        fullName,
        age: formData.age,
        gender: formData.gender,
        email: formData.email,
        mobile,
        address: formData.address,
        date,
        time,
        status,
        notes: formData.notes,
        patientStatus: formData.patientStatus,
      };

      if (editingAppointment) {
        const updatedAppointments = appointments.map((app) =>
          app.id === editingAppointment.id
            ? { ...appointmentData, id: app.id }
            : app
        );
        setAppointments(updatedAppointments);
        toast.success("Appointment updated successfully!");
      } else {
        const newAppointment = {
          ...appointmentData,
          id: Date.now().toString(),
        };
        setAppointments([...appointments, newAppointment]);
        toast.success("Appointment created successfully!");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment.");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    try {
      const updatedAppointments = appointments.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      );
      setAppointments(updatedAppointments);
      toast.success("Appointment status updated successfully!");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const updatedAppointments = appointments.filter((app) => app.id !== id);
        setAppointments(updatedAppointments);
        toast.success("Appointment deleted successfully!");
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment.");
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Navbar
        toggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <Sidebar collapsed={sidebarCollapsed} />

      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-header pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6>Appointments List</h6>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddNewClick}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      New Appointment
                    </button>
                  </div>
                  <div className="row mt-3 ">
                    <div className="col-md-4 col-12 mb-2">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-2">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-2 col-6 mb-2">
                      <select
                        className="form-select"
                        value={patientStatusFilter}
                        onChange={(e) => setPatientStatusFilter(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option value="Pregnancy">Pregnancy</option>
                        <option value="IVF">IVF</option>
                      </select>
                    </div>
                    <div className="col-md-3 col-6 mb-2">
                      <input
                        type="date"
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                      {dateFilter && (
                        <button
                          className="btn btn-sm btn-link text-danger"
                          onClick={() => setDateFilter("")}
                        >
                          Clear date
                        </button>
                      )}
                    </div>
                    <div className="col-md-2 col-12 mb-2">
                      {(statusFilter !== "All" ||
                        searchTerm ||
                        dateFilter ||
                        patientStatusFilter !== "All") && (
                        <button
                          className="btn btn-outline-secondary btn-sm w-100"
                          onClick={clearFilters}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body px-0 pt-0 pb-2">
                  {/* Loading state removed since data is local */}
                  <>
                    {/* Desktop Table */}
                    <div className="d-none d-md-block">
                      <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Patient
                              </th>
                              <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                Contact
                              </th>
                              <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Date
                              </th>
                              <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Time
                              </th>
                              <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Status
                              </th>
                              <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Type
                              </th>
                              <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                Address
                              </th>
                              <th className="text-secondary opacity-7">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAppointments.length > 0 ? (
                              filteredAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                  <td>
                                    <div className="d-flex align-items-center px-2 py-1">
                                      <div className="d-flex flex-column">
                                        <h6 className="mb-0 text-sm">
                                          {appointment.fullName}
                                        </h6>
                                        <p className="text-xs text-secondary mb-0">
                                          {appointment.age} yrs,{" "}
                                          {appointment.gender}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <p className="text-xs font-weight-bold mb-0">
                                      {appointment.mobile}
                                    </p>
                                    <p className="text-xs text-secondary mb-0">
                                      {appointment.email}
                                    </p>
                                  </td>
                                  <td className="align-middle text-center">
                                    <span className="text-secondary text-xs font-weight-bold">
                                      {appointment.date}
                                    </span>
                                  </td>
                                  <td className="align-middle text-center">
                                    <span className="text-secondary text-xs font-weight-bold">
                                      {appointment.time}
                                    </span>
                                  </td>
                                  <td className="align-middle text-center">
                                    <span
                                      className={`badge badge-sm ${
                                        appointment.status === "Completed"
                                          ? "bg-success"
                                          : appointment.status === "Cancelled"
                                          ? "bg-danger"
                                          : "bg-primary"
                                      }`}
                                    >
                                      {appointment.status}
                                    </span>
                                  </td>
                                  <td className="align-middle text-center">
                                    <span
                                      className={`badge badge-sm ${
                                        appointment.patientStatus ===
                                        "Pregnancy"
                                          ? "bg-warning text-dark"
                                          : appointment.patientStatus === "IVF"
                                          ? "bg-info"
                                          : "bg-secondary"
                                      }`}
                                    >
                                      {appointment.patientStatus}
                                    </span>
                                  </td>
                                  <td className="align-middle text-center">
                                    <span className="text-secondary text-xs font-weight-bold">
                                      {appointment.address}
                                    </span>
                                  </td>
                                  <td className="align-middle">
                                    <div className="btn-group">
                                      <button
                                        className="btn btn-info btn-sm px-3 py-1 me-1"
                                        onClick={() =>
                                          handleEditClick(appointment)
                                        }
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button
                                        className="btn btn-success btn-sm px-3 py-1 me-1"
                                        onClick={() =>
                                          handleStatusChange(
                                            appointment.id,
                                            "Completed"
                                          )
                                        }
                                        disabled={
                                          appointment.status === "Completed"
                                        }
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm px-3 py-1 me-1"
                                        onClick={() =>
                                          handleStatusChange(
                                            appointment.id,
                                            "Cancelled"
                                          )
                                        }
                                        disabled={
                                          appointment.status === "Cancelled"
                                        }
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>

                                      <button
                                        className="btn btn-warning btn-sm px-3 py-1"
                                        onClick={() =>
                                          handleDelete(appointment.id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  No appointments found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="d-md-none">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="card mb-3 shadow-sm"
                          >
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 className="card-title mb-1">
                                    <i className="bi bi-person-fill me-1"></i>
                                    {appointment.fullName}
                                  </h6>
                                  <p className="card-text text-muted mb-1">
                                    {appointment.age} yrs, {appointment.gender}
                                  </p>
                                </div>
                                <p
                                  className={`d-flex align-items-center badge ${
                                    appointment.status === "Completed"
                                      ? "bg-success "
                                      : appointment.status === "Cancelled"
                                      ? "bg-danger"
                                      : "bg-primary"
                                  }`}
                                >
                                  {appointment.status}
                                </p>
                              </div>

                              <div className="mt-3">
                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-telephone-fill me-1"></i>
                                  </div>
                                  <div>{appointment.mobile}</div>
                                </div>

                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-envelope-fill me-1"></i>
                                  </div>
                                  <div>{appointment.email || "N/A"}</div>
                                </div>

                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-calendar-fill me-1"></i>
                                  </div>
                                  <div>{appointment.date}</div>
                                </div>

                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-clock-fill me-1"></i>
                                  </div>
                                  <div>{appointment.time}</div>
                                </div>

                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-heart-pulse-fill me-1"></i>
                                  </div>
                                  <div>
                                    <span
                                      className={`badge ${
                                        appointment.patientStatus ===
                                        "Pregnancy"
                                          ? "bg-warning text-dark"
                                          : appointment.patientStatus === "IVF"
                                          ? "bg-info"
                                          : "bg-secondary"
                                      }`}
                                    >
                                      {appointment.patientStatus}
                                    </span>
                                  </div>
                                </div>

                                <div className="d-flex mb-2">
                                  <div className="me-2">
                                    <i className="bi bi-geo-alt-fill me-1"></i>
                                  </div>
                                  <div>{appointment.address || "N/A"}</div>
                                </div>
                              </div>

                              <div className="d-flex flex-wrap gap-2 mt-3">
                                <button
                                  className="btn btn-primary btn-sm flex-grow-1"
                                  onClick={() => handleEditClick(appointment)}
                                >
                                  <i className="bi bi-pencil me-1"></i> Edit
                                </button>
                                <button
                                  className={`btn btn-success btn-sm flex-grow-1 ${
                                    appointment.status === "Completed"
                                      ? "disabled"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "Completed"
                                    )
                                  }
                                  disabled={appointment.status === "Completed"}
                                >
                                  <i className="bi bi-check-lg me-1"></i>{" "}
                                  Complete
                                </button>
                                <button
                                  className={`btn btn-danger btn-sm flex-grow-1 ${
                                    appointment.status === "Cancelled"
                                      ? "disabled"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "Cancelled"
                                    )
                                  }
                                  disabled={appointment.status === "Cancelled"}
                                >
                                  <i className="bi bi-x-lg me-1"></i> Cancel
                                </button>
                                <button
                                  className="btn btn-warning btn-sm flex-grow-1"
                                  onClick={() => handleDelete(appointment.id)}
                                >
                                  <i className="bi bi-trash me-1"></i> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          No appointments found
                        </div>
                      )}
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>

          <AppointmentModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            formData={formData}
            handleChange={handleChange}
            isEdit={!!editingAppointment}
          ></AppointmentModal>
        </div>
      </main>
    </div>
  );
}

export default Appointments;
