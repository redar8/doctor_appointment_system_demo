import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppointmentModal from "../components/AppointmentModal";

const initialFormData = {
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
};

const ProfileSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [appointments, setAppointments] = useState([]); // Local storage of appointments

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulated duplicate appointment check
  const checkDuplicateAppointment = (date, time) => {
    return appointments.some(
      (appt) => appt.date === date && appt.time === time
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { date, time, fullName, mobile: mobile1, age } = formData;
    const today = new Date().toISOString().split("T")[0];
    const selectedDate = new Date(date);
    const currentDate = new Date(today);

    if (!fullName || !mobile1 || !age || !date || !time) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedDate < currentDate) {
      toast.error("Appointment date cannot be in the past");
      return;
    }

    if (checkDuplicateAppointment(date, time)) {
      toast.error("An appointment already exists at this date and time");
      return;
    }

    // Add appointment to local state
    setAppointments((prev) => [
      ...prev,
      { ...formData, createdAt: new Date().toISOString() },
    ]);

    toast.success("Appointment booked successfully!");
    setFormData(initialFormData);
    setShowModal(false);
  };

  return (
    <div className="dashboard-wrapper">
      <ToastContainer position="top-right" autoClose={5000} />

      <Navbar
        toggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="container-fluid py-4">
          <div
            className="card p-4 shadow-lg"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            {/* Doctor Profile Section */}
            <div className="text-end">
              {/* Header Section */}
              <div className="mb-4">
                <h1 className="display-5 fw-bold text-primary" dir="rtl">
                  دکتۆرە رنا عوني البزاز
                </h1>
                <p className="h5 text-dark mb-1">
                  M. B. CH. B IVF Subspecialist - Bahceci Istanbul
                </p>
              </div>
              {/* Profile Image */}
              <div className="d-flex justify-content-end mb-4">
                <img
                  src="https://www.tabibiraq.com/files/Rana-Al-Bazzaz-22.jpg"
                  alt="Dr. Jessika Linda"
                  className="img-fluid rounded-circle"
                  style={{
                    width: "200px",
                    height: "200px",
                    border: "4px solid #0d6efd",
                    boxShadow: "0 0 20px rgba(13, 110, 253, 0.3)",
                  }}
                />
              </div>
              {/* About Section */}
              <div className="mb-4 border-top pt-3" dir="rtl">
                <h3 className="fw-bold text-primary mb-3">About</h3>
                <p className="text-muted lead">
                  پسپۆڕی ئافرەتان ولە دایک بوون و نەزۆکی و منداڵی بلووری و
                  نەشتەرگەریی نازووری منداڵدان
                </p>
                <p className="text-muted lead"></p>
                اخصائية دكتورة (بورد) فى الامراض النسائية و التوليد و العقم و
                اطفال الانابيب و الجراجة التنضيرية للرحم
              </div>
              {/* Availability Schedule */}
              <div className="mb-4 text-end">
                <h4 className="fw-bold text-primary mb-3">Availability</h4>
                <div className="row mt-4">
                  <div className="col-md-6">
                    <p className="text-muted">Sat - 3PM - 9PM</p>
                    <p className="text-muted">Mon - 3PM - 9PM</p>
                    <p className="text-muted">Wed - 3PM - 9PM</p>
                    <p className="text-muted">Fri - Off</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted">Sun - 3PM - 9PM</p>
                    <p className="text-muted">Tue - 3PM - 9PM</p>
                    <p className="text-muted">Thu - Off</p>
                  </div>
                </div>
              </div>
              {/* Appointment Button */}
              <button
                className="btn btn-primary btn-lg w-100 py-3 mt-4 fw-bold"
                onClick={() => setShowModal(true)}
              >
                Book Appointment Now
              </button>
            </div>
          </div>
        </div>
        <AppointmentModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
        />
      </main>
    </div>
  );
};

export default ProfileSettings;
