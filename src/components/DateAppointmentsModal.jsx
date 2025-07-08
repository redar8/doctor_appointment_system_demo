import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { toast } from "react-toastify";

// Helper: Convert HH:MM string to minutes since midnight
const getTimeInMinutes = (timeStr) => {
  if (!timeStr) return -1;
  const time = timeStr.trim().toUpperCase();
  let hours, minutes;
  let period = null;

  if (time.endsWith("AM") || time.endsWith("PM")) {
    period = time.slice(-2);
    timeStr = time.substring(0, time.length - 2).trim();
  }

  const parts = timeStr.split(":");
  if (parts.length < 2) return -1;

  hours = parseInt(parts[0], 10);
  minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return -1;

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const DateAppointmentsModal = ({
  show,
  onClose,
  date,
  appointments,
  onEdit,
  onAddNew,
  onDelete,
  showFooterButtons = true,
}) => {
  // Sort appointments by date (desc) and time (desc)
  const sortedAppointments = React.useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return [...appointments].sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;

      const aMins = getTimeInMinutes(b.time);
      const bMins = getTimeInMinutes(a.time);
      return bMins - aMins;
    });
  }, [appointments]);

  const handleDelete = (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        // Simulate deletion in demo
        onDelete(appointmentId);
        toast.success("Appointment deleted successfully!");
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment.");
      }
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {date
                ? `Appointments for ${format(new Date(date), "MMMM d, yyyy")}`
                : "Appointments"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            {sortedAppointments.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                <p className="mt-3">No appointments found for this date</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAppointments.map((app) => (
                      <tr key={app.id}>
                        <td>{app.fullName}</td>
                        <td>{app.time || "N/A"}</td>
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
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEdit(app)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(app.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showFooterButtons && (
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onAddNew}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add New Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DateAppointmentsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      time: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showFooterButtons: PropTypes.bool,
};

export default DateAppointmentsModal;
