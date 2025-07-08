// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// const AppointmentModal = ({
//   show,
//   onClose,
//   onSubmit,
//   formData,
//   handleChange,
// }) => {
//   const [timeOptions, setTimeOptions] = useState([]);
//   const [minDate, setMinDate] = useState("");

//   const getIstanbulDate = () => {
//     return new Date()
//       .toLocaleString("en-US", {
//         timeZone: "Europe/Istanbul",
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//       })
//       .split(",")[0]
//       .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2");
//   };

//   const getIstanbulTime = () => {
//     return new Date().toLocaleString("en-US", {
//       timeZone: "Europe/Istanbul",
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const generateTimeOptions = (selectedDate) => {
//     const options = [];
//     const now = new Date();
//     const istanbulDate = getIstanbulDate();
//     const istanbulTime = getIstanbulTime().split(":");

//     let startTime = new Date(
//       now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
//     );

//     if (selectedDate === istanbulDate) {
//       const currentHour = parseInt(istanbulTime[0]);
//       const currentMinute = parseInt(istanbulTime[1]);

//       if (currentMinute < 15) {
//         startTime.setMinutes(15);
//       } else {
//         startTime.setHours(currentHour + 1);
//         startTime.setMinutes(0);
//       }
//     } else {
//       startTime = new Date(selectedDate + "T13:30:00+03:00");
//     }

//     const endTime = new Date(selectedDate + "T23:30:00+03:00");

//     while (startTime <= endTime) {
//       const hours = String(startTime.getHours()).padStart(2, "0");
//       const minutes = String(startTime.getMinutes()).padStart(2, "0");
//       options.push(`${hours}:${minutes}`);
//       startTime.setMinutes(startTime.getMinutes() + 15);
//     }

//     return options;
//   };

//   useEffect(() => {
//     const today = getIstanbulDate();
//     setMinDate(today);

//     if (formData.date) {
//       try {
//         const options = generateTimeOptions(formData.date);
//         setTimeOptions(options);

//         if (
//           options.length > 0 &&
//           (!formData.time || !options.includes(formData.time))
//         ) {
//           handleChange({
//             target: { name: "time", value: options[0] },
//           });
//         }
//       } catch (error) {
//         toast.error("Error generating time slots");
//       }
//     }
//   }, [formData.date]);

//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) onClose();
//   };

//   if (!show) return null;

//   return (
//     <div
//       className="modal fade show"
//       style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
//       onClick={handleBackdropClick}
//     >
//       <div className="modal-dialog modal-dialog-centered modal-lg">
//         <div className="modal-content">
//           <div className="modal-header bg-primary text-white">
//             <h5 className="modal-title">Book Appointment</h5>
//             <button
//               type="button"
//               className="btn-close btn-close-white"
//               onClick={onClose}
//               aria-label="Close"
//             />
//           </div>

//           <div className="modal-body p-4">
//             <form onSubmit={onSubmit}>
//               <div className="row g-3">
//                 {/* Full Name */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="text"
//                       name="fullName"
//                       className="form-control"
//                       placeholder="Full Name"
//                       value={formData.fullName}
//                       onChange={handleChange}
//                       required
//                     />
//                     <label>Full Name *</label>
//                   </div>
//                 </div>

//                 {/* Age */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="number"
//                       name="age"
//                       className="form-control"
//                       placeholder="Age"
//                       min="1"
//                       value={formData.age}
//                       onChange={handleChange}
//                       required
//                     />
//                     <label>Age *</label>
//                   </div>
//                 </div>

//                 {/* Gender */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <select
//                       name="gender"
//                       className="form-select"
//                       value={formData.gender}
//                       onChange={handleChange}
//                     >
//                       <option value="Female">Female</option>
//                       <option value="Male">Male</option>
//                     </select>
//                     <label>Gender</label>
//                   </div>
//                 </div>

//                 {/* Mobile 1 */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="tel"
//                       name="mobile"
//                       className="form-control"
//                       placeholder="750 475 9202"
//                       value={formData.mobile}
//                       onChange={handleChange}
//                       required
//                     />
//                     <label>Mobile (Primary) *</label>
//                   </div>
//                 </div>

//                 {/* Mobile 2 */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="tel"
//                       name="mobile2"
//                       className="form-control"
//                       placeholder="Mobile (Secondary)"
//                       value={formData.mobile2}
//                       onChange={handleChange}
//                     />
//                     <label>Mobile (Secondary)</label>
//                   </div>
//                 </div>

//                 {/* Email */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="email"
//                       name="email"
//                       className="form-control"
//                       placeholder="Email"
//                       value={formData.email}
//                       onChange={handleChange}
//                     />
//                     <label>Email</label>
//                   </div>
//                 </div>

//                 {/* Date */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <input
//                       type="date"
//                       name="date"
//                       className="form-control"
//                       min={minDate}
//                       value={formData.date}
//                       onChange={handleChange}
//                       required
//                     />
//                     <label>Appointment Date *</label>
//                   </div>
//                 </div>

//                 {/* Time */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <select
//                       name="time"
//                       className="form-select"
//                       value={formData.time}
//                       onChange={handleChange}
//                       required
//                       disabled={!formData.date}
//                     >
//                       {timeOptions.map((time) => (
//                         <option key={time} value={time}>
//                           {time}
//                         </option>
//                       ))}
//                     </select>
//                     <label>Appointment Time *</label>
//                   </div>
//                 </div>

//                 {/* Status */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <select
//                       name="status"
//                       className="form-select"
//                       value={formData.status}
//                       onChange={handleChange}
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Completed">Completed</option>
//                       <option value="Cancelled">Cancelled</option>
//                     </select>
//                     <label>Status</label>
//                   </div>
//                 </div>

//                 {/* Patient Type */}
//                 <div className="col-md-6">
//                   <div className="form-floating">
//                     <select
//                       className="form-select"
//                       name="patientStatus"
//                       value={formData.patientStatus}
//                       onChange={handleChange}
//                     >
//                       <option value="General">General</option>
//                       <option value="Pregnancy">Pregnancy</option>
//                       <option value="IVF">IVF</option>
//                     </select>
//                     <label>Patient Type</label>
//                   </div>
//                 </div>

//                 {/* Address */}
//                 <div className="col-12">
//                   <div className="form-floating">
//                     <textarea
//                       name="address"
//                       className="form-control"
//                       placeholder="Address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       style={{ height: "100px" }}
//                     />
//                     <label>Address</label>
//                   </div>
//                 </div>

//                 {/* Notes */}
//                 <div className="col-12">
//                   <div className="form-floating">
//                     <textarea
//                       name="notes"
//                       className="form-control"
//                       placeholder="Additional Notes"
//                       value={formData.notes}
//                       onChange={handleChange}
//                       style={{ height: "80px" }}
//                     />
//                     <label>Additional Notes</label>
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer mt-4">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={onClose}
//                 >
//                   Close
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Confirm Booking
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentModal;

import React from "react";

const AppointmentModal = ({
  show,
  onClose,
  onSubmit,
  formData,
  handleChange,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Book Appointment</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="age" className="form-label">
                  Age *
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  className="form-select"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="mobile" className="form-label">
                  Mobile *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="mobile2" className="form-label">
                  Mobile 2
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="mobile2"
                  name="mobile2"
                  value={formData.mobile2}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="time" className="form-label">
                  Time *
                </label>
                <input
                  type="time"
                  className="form-control"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
