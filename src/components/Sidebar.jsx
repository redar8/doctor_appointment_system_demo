import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "speedometer2" },
    {
      path: "/create-appointments",
      label: "Create Appointment",
      icon: "calendar-plus",
    },
    { path: "/appointments", label: "Appointments", icon: "calendar" },
    { path: "/patients", label: "Patients", icon: "people" },
    { path: "/admins", label: "Admins", icon: "shield-lock" },
    { path: "/register-admin", label: "Register", icon: "person-plus" },
    { path: "/profile", label: "Doctor Profile", icon: "heart-pulse" },
  ];

  useEffect(() => {
    const demoUser = JSON.parse(sessionStorage.getItem("authUser"));
    if (demoUser && demoUser.role) {
      setCurrentUserRole(demoUser.role);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", {
      replace: true,
      state: {
        from: location.pathname,
        message: "You have been logged out successfully",
      },
    });
    window.location.reload();
  };

  return (
    <div
      className={`sidebar bg-dark text-white ${collapsed ? "collapsed" : ""}`}
    >
      <div className="sidebar-header p-3 d-flex align-items-center">
        <Link to="/dashboard" className="text-white text-decoration-none">
          <h5 className="mb-0">&nbsp;</h5>
        </Link>
      </div>
      <hr className="sidebar-divider my-0" />
      <div className="sidebar-body p-4">
        <ul className="nav nav-pills flex-column">
          {navItems.map((item) => {
            if (
              item.label === "Register" &&
              currentUserRole !== "Super Admin"
            ) {
              return null;
            }
            return (
              <li className="nav-item mb-2" key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center ${
                    location.pathname === item.path ? "active" : "text-white"
                  }`}
                  aria-current={
                    location.pathname === item.path ? "page" : undefined
                  }
                >
                  <i className={`bi bi-${item.icon} me-3 fs-5`}></i>
                  {(isSmallScreen || !collapsed) && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer p-3 mt-auto">
        <div className="nav-item">
          <button
            onClick={handleLogout}
            className="nav-link text-white d-flex align-items-center w-100 bg-transparent border-0"
          >
            <i className="bi bi-box-arrow-left me-3 fs-5"></i>
            {(isSmallScreen || !collapsed) && <span>Logout</span>}
          </button>
        </div>
        <hr className="sidebar-divider my-0" />
        {(isSmallScreen || !collapsed) && (
          <div className="text-center text-white-50 small mt-2 mb-3">
            © {new Date().getFullYear()} Ravco Polyclinic Center. Developed by{" "}
            <a
              href="mailto:redarreda8@gmail.com"
              className="text-primary text-decoration"
            >
              Redar Abdulkareem
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
