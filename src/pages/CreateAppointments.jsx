import React, { useState, useEffect } from "react";
import AppointmentModal from "../components/AppointmentModal";
import DateAppointmentsModal from "../components/DateAppointmentsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  setYear,
  getYear,
} from "date-fns";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function CreateAppointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDateAppointments, setShowDateAppointments] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);

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
    patientStatus: "General",
  });

  const today = new Date().toISOString().split("T")[0];

  // Helper to generate unique ID for localStorage entries
  const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

  // Load appointments and patients from localStorage
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    const storedAppointments =
      JSON.parse(localStorage.getItem("appointments")) || [];
    const storedPatients = JSON.parse(localStorage.getItem("patients")) || [];

    setAppointments(storedAppointments);
    setPatients(storedPatients);
    setIsLoading(false);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const saveAppointments = (newAppointments) => {
    localStorage.setItem("appointments", JSON.stringify(newAppointments));
    setAppointments(newAppointments);
  };

  const savePatients = (newPatients) => {
    localStorage.setItem("patients", JSON.stringify(newPatients));
    setPatients(newPatients);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkDuplicateAppointment = (date, time, excludeId = null) => {
    return appointments.some(
      (app) => app.date === date && app.time === time && app.id !== excludeId
    );
  };

  const checkExistingPatient = (fullName, mobile) => {
    return patients.some(
      (pat) => pat.fullName === fullName && pat.mobile === mobile
    );
  };

  const handleAddNewClick = (date = null) => {
    setEditingAppointment(null);
    setFormData({
      fullName: "",
      age: "",
      gender: "Female",
      email: "",
      mobile: "",
      mobile2: "",
      address: "",
      date: date ? format(date, "yyyy-MM-dd") : "",
      time: "",
      notes: "",
      status: "Active",
      patientStatus: "General",
    });
    setShowModal(true);
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    const filtered = appointments.filter((app) => app.date === formattedDate);

    if (filtered.length > 0) {
      setSelectedDateAppointments(filtered);
      setShowDateAppointments(true);
    } else {
      handleAddNewClick(date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      date,
      time,
      fullName,
      mobile,
      age,
      address,
      status,
      patientStatus,
    } = formData;

    if (
      !fullName ||
      !mobile ||
      !age ||
      !date ||
      !time ||
      !status ||
      !patientStatus
    ) {
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
      let newPatients = [...patients];
      if (!editingAppointment) {
        const patientExists = checkExistingPatient(fullName, mobile);
        if (!patientExists) {
          newPatients.push({
            id: generateId(),
            fullName,
            age,
            gender: formData.gender,
            email: formData.email,
            address,
            mobile,
            createdAt: new Date().toISOString(),
          });
          savePatients(newPatients);
        }
      }

      const appointmentData = {
        id: editingAppointment ? editingAppointment.id : generateId(),
        fullName,
        age,
        gender: formData.gender,
        email: formData.email,
        address,
        mobile,
        date,
        time,
        status,
        patientStatus,
      };

      let newAppointments = [...appointments];
      if (editingAppointment) {
        newAppointments = newAppointments.map((app) =>
          app.id === editingAppointment.id ? appointmentData : app
        );
        toast.success("Appointment updated successfully!");
      } else {
        newAppointments.push(appointmentData);
        toast.success("Appointment created successfully!");
      }

      saveAppointments(newAppointments);

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
        patientStatus: "General",
      });
      setEditingAppointment(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment.");
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      const newAppointments = appointments.filter(
        (app) => app.id !== appointmentId
      );
      saveAppointments(newAppointments);
      setSelectedDateAppointments((prev) =>
        prev.filter((app) => app.id !== appointmentId)
      );
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment.");
    }
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startWeekday = monthStart.getDay();
    const paddedDays = [];
    for (let i = 0; i < startWeekday; i++) {
      paddedDays.push(null);
    }

    daysInMonth.forEach((day) => paddedDays.push(day));

    while (paddedDays.length % 7 !== 0) {
      paddedDays.push(null);
    }

    const weeks = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    return weeks;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return 0;
    const dateString = format(date, "yyyy-MM-dd");
    return appointments.filter((app) => app.date === dateString).length;
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleYearChange = (e) => {
    const newDate = setYear(currentDate, parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Calendar rendering logic (desktop and mobile) remain unchanged
  const renderDesktopCalendar = () => (
    <div className="table-responsive">
      <table className="table table-bordered mb-0">
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <th key={day} className="text-center bg-light py-2">
                <span className="d-none d-sm-block">{day}</span>
                <span className="d-sm-none">{day.substring(0, 1)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getCalendarDays().map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, dayIndex) => {
                const isCurrentMonth =
                  date && format(date, "MM") === format(currentDate, "MM");
                const isToday =
                  date &&
                  format(date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                const appointmentCount = date
                  ? getAppointmentsForDate(date)
                  : 0;

                return (
                  <td
                    key={dayIndex}
                    className={`p-1 p-sm-2 position-relative ${
                      !isCurrentMonth ? "bg-light" : ""
                    }`}
                    style={{
                      height: "70px",
                      verticalAlign: "top",
                      cursor: "pointer",
                      borderBottom: "1px solid #dee2e6",
                    }}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="d-flex flex-column h-100">
                      <div
                        className={`d-flex justify-content-center align-items-center ${
                          isToday ? "text-white bg-primary rounded-circle" : ""
                        }`}
                        style={{
                          width: "24px",
                          height: "24px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {date && format(date, "d")}
                      </div>

                      <div className="flex-grow-1 mt-1 text-center">
                        {date && appointmentCount > 0 && (
                          <div className="d-flex justify-content-center">
                            <span className="badge bg-danger rounded-pill">
                              {appointmentCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMobileCalendar = () => (
    <div className="list-group">
      {getCalendarDays()
        .flat()
        .map((date, idx) => {
          if (!date) return null;
          const isCurrentMonth =
            format(date, "MM") === format(currentDate, "MM");
          const isToday =
            format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const appointmentCount = getAppointmentsForDate(date);

          return (
            <button
              key={idx}
              type="button"
              className={`list-group-item d-flex justify-content-between align-items-center ${
                isCurrentMonth ? "" : "bg-light"
              } ${isToday ? "active" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              <span>{format(date, "EEE, MMM d")}</span>
              {appointmentCount > 0 && (
                <span className="badge bg-danger rounded-pill">
                  {appointmentCount}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div
        className={`flex-grow-1 d-flex flex-column ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid flex-grow-1 py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button
              className="btn btn-primary"
              onClick={() => handleAddNewClick()}
            >
              New Appointment
            </button>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handlePrevMonth}
              >
                &lt;
              </button>
              <h5 className="mb-0">{format(currentDate, "MMMM yyyy")}</h5>
              <button
                className="btn btn-outline-secondary"
                onClick={handleNextMonth}
              >
                &gt;
              </button>
              <select
                className="form-select"
                style={{ width: "100px" }}
                value={getYear(currentDate)}
                onChange={handleYearChange}
              >
                {[...Array(10).keys()].map((i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {windowWidth > 768 ? renderDesktopCalendar() : renderMobileCalendar()}

          <AppointmentModal
            show={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingAppointment(null);
            }}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isEditing={!!editingAppointment}
          />

          <DateAppointmentsModal
            show={showDateAppointments}
            onClose={() => setShowDateAppointments(false)}
            appointments={selectedDateAppointments}
            onEdit={(appointment) => {
              setEditingAppointment(appointment);
              setFormData({ ...appointment });
              setShowDateAppointments(false);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default CreateAppointments;
