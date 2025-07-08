import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DateAppointmentsModal from "./DateAppointmentsModal";
import AppointmentModal from "./AppointmentModal";
import { toast } from "react-toastify";
import Dropdown from "react-bootstrap/Dropdown";

function Navbar({ toggleSidebar, sidebarCollapsed }) {
  const [user, setUser] = useState({ email: "demo@ravco.com" }); // mock user
  const [adminData, setAdminData] = useState({
    fullName: "Demo Admin",
    role: "Super Admin",
  });
  const [activeAppointments, setActiveAppointments] = useState(0);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Female",
    email: "",
    mobile: "",
    mobile2: "",
    address: "",
    date: "",
    time: "",
    notes: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getIstanbulDate = () => {
    const now = new Date();
    return new Date(now.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
  };

  // Simulate appointments on load
  useEffect(() => {
    const today = getIstanbulDate();
    const demoAppointments = [
      {
        id: "1",
        fullName: "Jane Doe",
        age: 30,
        gender: "Female",
        email: "jane@example.com",
        mobile: "1234567890",
        mobile2: "",
        address: "Demo Street 1",
        date: today,
        time: "14:00",
        notes: "",
        status: "Active",
      },
    ];
    setTodayAppointments(demoAppointments);
    setActiveAppointments(demoAppointments.length);
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully (Demo)");
    setUser(null);
    setAdminData(null);
  };

  const handleDeleteAppointment = (id) => {
    setTodayAppointments((prev) => prev.filter((app) => app.id !== id));
    setActiveAppointments((prev) => prev - 1);
    toast.success("Appointment deleted (Demo)");
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({ ...appointment });
    setShowAppointmentModal(true);
  };

  const handleAddNewAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      fullName: "",
      age: "",
      gender: "Female",
      email: "",
      mobile: "",
      mobile2: "",
      address: "",
      date: getIstanbulDate(),
      time: "",
      notes: "",
      status: "Active",
    });
    setShowAppointmentModal(true);
  };

  const checkDuplicateAppointment = (date, time, excludeId = null) => {
    return todayAppointments.some(
      (a) => a.date === date && a.time === time && a.id !== excludeId
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rawMobile = formData.mobile.replace(/\s/g, "");
    if (rawMobile.length !== 10 || !/^\d+$/.test(rawMobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      setIsSubmitting(false);
      return;
    }

    const requiredFields = ["fullName", "age", "date", "time", "status"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }

    const isDuplicate = checkDuplicateAppointment(
      formData.date,
      formData.time,
      editingAppointment?.id
    );

    if (isDuplicate) {
      toast.error("An appointment already exists at this date and time");
      setIsSubmitting(false);
      return;
    }

    const appointmentData = {
      ...formData,
      id: editingAppointment ? editingAppointment.id : Date.now().toString(),
    };

    if (editingAppointment) {
      setTodayAppointments((prev) =>
        prev.map((a) => (a.id === editingAppointment.id ? appointmentData : a))
      );
      toast.success("Appointment updated (Demo)");
    } else {
      setTodayAppointments((prev) => [...prev, appointmentData]);
      setActiveAppointments((prev) => prev + 1);
      toast.success("Appointment created (Demo)");
    }

    setShowAppointmentModal(false);
    setEditingAppointment(null);
    setFormData({
      fullName: "",
      age: "",
      gender: "Female",
      email: "",
      mobile: "",
      mobile2: "",
      address: "",
      date: getIstanbulDate(),
      time: "",
      notes: "",
      status: "Active",
    });

    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <nav
      className="navbar navbar-dark bg-primary sticky-top"
      style={{ zIndex: 1030 }}
    >
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center me-3"
            onClick={toggleSidebar}
            style={{ cursor: "pointer" }}
          >
            <button className="navbar-toggler" aria-label="Toggle sidebar">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <Link className="navbar-brand flex-grow-1" to="/">
            <span className="d-none d-md-inline">Ravco Polyclinic Center</span>
            <span className="d-md-none">Ravco</span>
          </Link>
        </div>

        <div className="d-flex align-items-center">
          <div className="position-relative me-3">
            <button
              className="btn btn-link text-white p-0"
              onClick={() => {
                setSelectedDate(getIstanbulDate());
                setShowAppointmentsModal(true);
              }}
            >
              <i className="bi bi-bell-fill fs-5"></i>
              {activeAppointments > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {activeAppointments}
                </span>
              )}
            </button>
          </div>

          {user ? (
            <Dropdown>
              <Dropdown.Toggle
                id="admin-dropdown"
                className="d-flex align-items-center"
              >
                <i className="bi bi-person-circle me-2 fs-5"></i>
                <span className="d-none d-md-inline">
                  {adminData?.fullName || user.email}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-end">
                <Dropdown.ItemText className="small">
                  <i className="bi bi-person-badge me-2"></i>
                  {adminData?.role || "Admin"}
                </Dropdown.ItemText>
                <Dropdown.Divider />

                {adminData?.role === "Super Admin" && (
                  <Dropdown.Item as={Link} to="/admins">
                    <i className="bi bi-people-fill me-2"></i>
                    Manage Admins
                  </Dropdown.Item>
                )}

                <Dropdown.Item
                  as="button"
                  className="text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Link className="btn btn-outline-light" to="/login">
              Login
            </Link>
          )}
        </div>

        <DateAppointmentsModal
          show={showAppointmentsModal}
          onClose={() => setShowAppointmentsModal(false)}
          date={selectedDate}
          appointments={todayAppointments}
          onEdit={handleEditAppointment}
          onAddNew={handleAddNewAppointment}
          onDelete={handleDeleteAppointment}
          showFooterButtons={false}
        />

        <AppointmentModal
          show={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          onSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
          isSubmitting={isSubmitting}
          isEditMode={!!editingAppointment}
        />
      </div>
    </nav>
  );
}

export default Navbar;
