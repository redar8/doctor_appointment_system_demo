import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointments, setSelectedAppointments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Female",
    email: "",
    mobile: "",
    address: "",
    notes: "",
  });
  const [currentUserRole] = useState("Super Admin"); // Static for demo

  // Initialize with demo data
  useEffect(() => {
    const storedPatients = localStorage.getItem("patients");
    const storedAppointments = localStorage.getItem("appointments");

    if (storedPatients && storedAppointments) {
      setPatients(JSON.parse(storedPatients));
      setAppointments(JSON.parse(storedAppointments));
    } else {
      // Default demo data
      const demoPatients = [
        {
          id: "1",
          fullName: "Sarah Johnson",
          age: "28",
          gender: "Female",
          email: "sarah@example.com",
          mobile: "555-1234",
          address: "123 Main St, New York",
          notes: "First-time patient. Recommended by Dr. Smith.",
          isSelected: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          fullName: "Michael Chen",
          age: "35",
          gender: "Male",
          email: "michael@example.com",
          mobile: "555-5678",
          address: "456 Oak Ave, Los Angeles",
          notes: "Follow-up consultation. IVF treatment.",
          isSelected: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const demoAppointments = [
        {
          id: "a1",
          patientId: "1",
          fullName: "Sarah Johnson",
          mobile: "555-1234",
          date: "2023-10-15",
          time: "10:00",
          status: "Active",
          notes: "Initial consultation",
        },
        {
          id: "a2",
          patientId: "2",
          fullName: "Michael Chen",
          mobile: "555-5678",
          date: "2023-10-16",
          time: "14:30",
          status: "Completed",
          notes: "Follow-up appointment",
        },
        {
          id: "a3",
          patientId: "1",
          fullName: "Sarah Johnson",
          mobile: "555-1234",
          date: "2023-10-20",
          time: "11:15",
          status: "Scheduled",
          notes: "Ultrasound scan",
        },
      ];

      setPatients(demoPatients);
      setAppointments(demoAppointments);
      localStorage.setItem("patients", JSON.stringify(demoPatients));
      localStorage.setItem("appointments", JSON.stringify(demoAppointments));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem("patients", JSON.stringify(patients));
    }
    if (appointments.length > 0) {
      localStorage.setItem("appointments", JSON.stringify(appointments));
    }
  }, [patients, appointments]);

  // Check for existing patient
  const checkExistingPatient = (fullName, mobile, age) => {
    return patients.some(
      (patient) =>
        patient.fullName === fullName &&
        patient.mobile === mobile &&
        patient.age === age
    );
  };

  // Filter and sort patients
  useEffect(() => {
    const mergedData = patients.map((patient) => {
      const patientApps = appointments.filter(
        (app) => app.mobile === patient.mobile
      );
      const latestAppointment = patientApps.reduce((latest, app) => {
        const appDate = new Date(app.date);
        return appDate > latest ? appDate : latest;
      }, new Date(0));

      return {
        ...patient,
        appointments: patientApps,
        latestAppointmentDate: latestAppointment,
        selectedAppt: selectedAppointments[patient.id] || patientApps[0]?.id,
      };
    });

    const filtered = mergedData
      .filter(
        (patient) =>
          patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.mobile?.includes(searchTerm)
      )
      .sort((a, b) => b.latestAppointmentDate - a.latestAppointmentDate);

    setFilteredPatients(filtered);
  }, [patients, appointments, searchTerm, selectedAppointments]);

  // Radio button handler
  const handleCheckBoxChange = (patientId) => {
    const updatedPatients = patients.map((patient) =>
      patient.id === patientId
        ? { ...patient, isSelected: !patient.isSelected }
        : patient
    );
    setPatients(updatedPatients);
    toast.success("Patient selection updated");
  };

  // Appointment selection handler
  const handleAppointmentSelect = (patientId, appointmentId) => {
    setSelectedAppointments((prev) => ({
      ...prev,
      [patientId]: appointmentId,
    }));
  };

  // Status change handler
  const handleStatusChange = (patientId, newStatus) => {
    const appointmentId = selectedAppointments[patientId];
    if (!appointmentId) {
      toast.error("No appointment selected");
      return;
    }

    const updatedAppointments = appointments.map((appt) =>
      appt.id === appointmentId ? { ...appt, status: newStatus } : appt
    );
    setAppointments(updatedAppointments);
    toast.success("Appointment status updated!");
  };

  // Patient edit handlers
  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      email: patient.email,
      mobile: patient.mobile,
      address: patient.address,
      notes: patient.notes || "",
    });
    setShowEditModal(true);
  };

  const handlePatientUpdate = (e) => {
    e.preventDefault();
    const updatedPatients = patients.map((patient) =>
      patient.id === editingPatient.id
        ? { ...editingPatient, ...formData }
        : patient
    );
    setPatients(updatedPatients);
    toast.success("Patient updated successfully!");
    setShowEditModal(false);
  };

  // Add new patient
  const handleAddPatient = (e) => {
    e.preventDefault();
    const { fullName, mobile, age } = formData;

    if (!fullName || !mobile || !age) {
      toast.error("Name, Mobile, and Age are required fields");
      return;
    }

    const exists = checkExistingPatient(fullName, mobile, age);
    if (exists) {
      toast.error("Patient already exists with these details");
      return;
    }

    const newPatient = {
      ...formData,
      id: `patient-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSelected: false,
    };

    setPatients([...patients, newPatient]);
    toast.success("Patient added successfully!");
    setShowAddModal(false);
    setFormData({
      fullName: "",
      age: "",
      gender: "Female",
      email: "",
      mobile: "",
      address: "",
      notes: "",
    });
  };

  // Delete handler
  const handleDelete = (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      const updatedPatients = patients.filter(
        (patient) => patient.id !== patientId
      );
      setPatients(updatedPatients);

      // Also remove related appointments
      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        const updatedAppointments = appointments.filter(
          (appt) => appt.mobile !== patient.mobile
        );
        setAppointments(updatedAppointments);
      }

      toast.success("Patient deleted successfully!");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />

      <Navbar toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar collapsed={sidebarCollapsed} />

      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-header pb-0">
                  <div className="d-flex flex-column justify-content-between align-items-md-center">
                    <h4 className="mb-3 mb-md-4 text-center">Patients List</h4>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-2 w-100 w-md-auto">
                      <div className="input-group w-100 mb-2">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search patients..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm w-100 mb-2 py-2"
                        onClick={() => setShowAddModal(true)}
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Add Patient
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body px-0 pt-0 pb-2">
                  <>
                    {/* Desktop Table */}
                    <div className="d-none d-md-block">
                      <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                          <thead>
                            <tr>
                              {currentUserRole === "Super Admin" && (
                                <th style={{ width: "20px" }}></th>
                              )}
                              <th>Patient</th>
                              <th>Contact</th>
                              <th>Appointments</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Address</th>
                              {currentUserRole === "Super Admin" && (
                                <th>Notes</th>
                              )}
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPatients.map((patient) => {
                              const patientApps = patient.appointments || [];
                              const selectedAppt = patientApps.find(
                                (a) => a.id === patient.selectedAppt
                              );

                              return (
                                <tr
                                  key={patient.id}
                                  style={{
                                    backgroundColor: patient.isSelected
                                      ? "#ffebee"
                                      : "inherit",
                                    transition: "background-color 0.3s ease",
                                  }}
                                >
                                  {currentUserRole === "Super Admin" && (
                                    <td>
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={patient.isSelected}
                                          onChange={() =>
                                            handleCheckBoxChange(patient.id)
                                          }
                                          style={{
                                            cursor: "pointer",
                                            transform: "scale(1.2)",
                                            accentColor: "#dc3545",
                                            border: "2px solid #ccc",
                                          }}
                                        />
                                      </div>
                                    </td>
                                  )}
                                  <td>
                                    <div className="d-flex flex-column">
                                      <h6 className="mb-0 text-sm">
                                        {patient.fullName}
                                      </h6>
                                      <p className="text-xs text-secondary mb-0">
                                        {patient.age} yrs, {patient.gender}
                                      </p>
                                    </div>
                                  </td>
                                  <td>
                                    <p className="text-xs font-weight-bold mb-0">
                                      {patient.mobile}
                                    </p>
                                    <p className="text-xs text-secondary mb-0">
                                      {patient.email}
                                    </p>
                                  </td>
                                  <td>
                                    <div className="d-flex flex-column">
                                      <span className="badge bg-primary rounded-pill">
                                        {patientApps.length}
                                      </span>
                                      {patientApps.length > 1 && (
                                        <select
                                          className="form-select form-select-sm mt-1"
                                          value={patient.selectedAppt || ""}
                                          onChange={(e) =>
                                            handleAppointmentSelect(
                                              patient.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          {patientApps.map((appt) => (
                                            <option
                                              key={appt.id}
                                              value={appt.id}
                                            >
                                              {new Date(
                                                appt.date
                                              ).toLocaleDateString()}{" "}
                                              - {appt.time}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    {selectedAppt?.date
                                      ? new Date(
                                          selectedAppt.date
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td>{selectedAppt?.time || "N/A"}</td>
                                  <td>{patient.address || "N/A"}</td>
                                  {currentUserRole === "Super Admin" && (
                                    <td>
                                      {patient.notes?.substring(0, 30) ||
                                        "No notes"}
                                      {patient.notes?.length > 30 && "..."}
                                    </td>
                                  )}
                                  <td className="align-middle text-center">
                                    <span
                                      className={`badge badge-sm ${
                                        selectedAppt?.status === "Completed"
                                          ? "bg-success"
                                          : selectedAppt?.status === "Cancelled"
                                          ? "bg-danger"
                                          : "bg-primary"
                                      }`}
                                    >
                                      {selectedAppt?.status || "N/A"}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="btn-group">
                                      <button
                                        className="btn btn-info btn-sm px-3 py-1 me-1"
                                        onClick={() => handleEditClick(patient)}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>

                                      <>
                                        <button
                                          className="btn btn-warning btn-sm px-3 py-1"
                                          onClick={() =>
                                            handleDelete(patient.id)
                                          }
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="d-md-none">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                          const patientApps = patient.appointments || [];
                          const selectedAppt = patientApps.find(
                            (a) => a.id === patient.selectedAppt
                          );

                          return (
                            <div
                              key={patient.id}
                              className="card mb-3 shadow-sm"
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h5 className="card-title mb-1">
                                      {patient.fullName}
                                    </h5>
                                    <p className="card-text text-muted mb-2">
                                      {patient.age} yrs, {patient.gender}
                                    </p>
                                  </div>
                                  <span
                                    className={`badge ${
                                      selectedAppt?.status === "Completed"
                                        ? "bg-success"
                                        : selectedAppt?.status === "Cancelled"
                                        ? "bg-danger"
                                        : "bg-primary"
                                    }`}
                                  >
                                    {selectedAppt?.status || "N/A"}
                                  </span>
                                </div>

                                <div className="mt-3">
                                  <div className="d-flex mb-2">
                                    <div className="me-2">
                                      <i className="bi bi-telephone-fill me-1"></i>
                                    </div>
                                    <div>{patient.mobile}</div>
                                  </div>

                                  <div className="d-flex mb-2">
                                    <div className="me-2">
                                      <i className="bi bi-envelope-fill me-1"></i>
                                    </div>
                                    <div>{patient.email || "N/A"}</div>
                                  </div>

                                  <div className="d-flex mb-2">
                                    <div className="me-2">
                                      <i className="bi bi-geo-alt-fill me-1"></i>
                                    </div>
                                    <div>{patient.address || "N/A"}</div>
                                  </div>

                                  <div className="d-flex mb-2 align-items-center">
                                    <div className="me-2">
                                      <i className="bi bi-calendar-check-fill me-1"></i>
                                      <strong>Appointments:</strong>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">
                                      {patientApps.length}
                                    </span>
                                  </div>

                                  {patientApps.length > 0 && (
                                    <div className="d-flex mb-2">
                                      <div className="me-2">
                                        <i className="bi bi-calendar-fill me-1"></i>
                                      </div>
                                      <div>
                                        {selectedAppt?.date
                                          ? new Date(
                                              selectedAppt.date
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </div>
                                    </div>
                                  )}

                                  {patientApps.length > 0 && (
                                    <div className="d-flex mb-2">
                                      <div className="me-2">
                                        <i className="bi bi-clock-fill me-1"></i>
                                      </div>
                                      <div>{selectedAppt?.time || "N/A"}</div>
                                    </div>
                                  )}

                                  {currentUserRole === "Super Admin" && (
                                    <div className="d-flex mb-2">
                                      <div className="me-2">
                                        <i className="bi bi-journal-fill me-1"></i>
                                        <strong>Notes:</strong>
                                      </div>
                                      <div>
                                        {patient.notes?.substring(0, 50) ||
                                          "No notes"}
                                        {patient.notes?.length > 50 && "..."}
                                      </div>
                                    </div>
                                  )}

                                  {patientApps.length > 1 && (
                                    <div className="mb-3">
                                      <select
                                        className="form-select form-select-sm"
                                        value={patient.selectedAppt || ""}
                                        onChange={(e) =>
                                          handleAppointmentSelect(
                                            patient.id,
                                            e.target.value
                                          )
                                        }
                                      >
                                        {patientApps.map((appt) => (
                                          <option key={appt.id} value={appt.id}>
                                            {new Date(
                                              appt.date
                                            ).toLocaleDateString()}{" "}
                                            - {appt.time}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {currentUserRole === "Super Admin" && (
                                    <div className="form-check mb-3">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={patient.isSelected}
                                        onChange={() =>
                                          handleCheckBoxChange(patient.id)
                                        }
                                        id={`select-${patient.id}`}
                                        style={{
                                          cursor: "pointer",
                                          accentColor: "#dc3545",
                                          border: "2px solid #ccc",
                                        }}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`select-${patient.id}`}
                                      >
                                        Mark as selected
                                      </label>
                                    </div>
                                  )}

                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    <button
                                      className="btn btn-info btn-sm flex-grow-1"
                                      onClick={() => handleEditClick(patient)}
                                    >
                                      <i className="bi bi-pencil me-1"></i> Edit
                                    </button>

                                    <button
                                      className="btn btn-warning btn-sm flex-grow-1"
                                      onClick={() => handleDelete(patient.id)}
                                    >
                                      <i className="bi bi-trash me-1"></i>{" "}
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          No patients found
                        </div>
                      )}
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>

          {/* Add Patient Modal */}
          {showAddModal && (
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Patient</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddPatient}>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label>Mobile *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label>Age *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Gender</label>
                          <select
                            className="form-select"
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </div>
                        <div className="col-12 mb-3">
                          <label>Address</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label>Notes</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowAddModal(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Add Patient
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Patient Modal */}
          {showEditModal && (
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Patient</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handlePatientUpdate}>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label>Mobile *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label>Age *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Gender</label>
                          <select
                            className="form-select"
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </div>
                        <div className="col-12 mb-3">
                          <label>Address</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label>Notes</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEditModal(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Patients;
