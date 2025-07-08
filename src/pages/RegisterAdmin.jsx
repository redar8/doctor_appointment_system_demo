import React, { useState } from "react";
import { Button, Form, Alert, Container, Card, Spinner } from "react-bootstrap";
import { Envelope, Person, Shield } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const RegisterAdmin = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName.match(/^[a-zA-Z ]{3,30}$/)) {
      setError("Invalid full name (3-30 letters only)");
      return false;
    }
    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      setError("Invalid email address format");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      // Demo-mode: simulate registration
      const registeredAdmins =
        JSON.parse(localStorage.getItem("demoAdmins")) || [];

      const emailExists = registeredAdmins.some(
        (admin) => admin.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (emailExists) {
        setError("Email already registered");
        return;
      }

      const newAdmin = {
        ...formData,
        email: formData.email.toLowerCase(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem(
        "demoAdmins",
        JSON.stringify([...registeredAdmins, newAdmin])
      );

      // Simulate login of the newly registered admin
      sessionStorage.setItem(
        "authUser",
        JSON.stringify({ email: newAdmin.email, role: newAdmin.role })
      );

      alert("Admin account created successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Demo registration error:", error);
      setError("Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar
        toggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <Sidebar collapsed={sidebarCollapsed} />

      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <Card className="shadow">
                <Card.Body>
                  <div className="text-center mb-4">
                    <h2>
                      <Shield className="me-2" />
                      Admin Registration
                    </h2>
                    <div className="text-muted">Secure Admin Portal Setup</div>
                  </div>

                  {error && (
                    <Alert variant="danger" className="text-center">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Person className="me-2" /> Full Name
                      </Form.Label>
                      <Form.Control
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Type Your Full Name"
                        required
                        autoFocus
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Envelope className="me-2" /> Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Type Your Email"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>
                        <Shield className="me-2" /> Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Type Your Password"
                        required
                      />
                      <Form.Text className="text-muted">
                        Minimum 6 characters
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="w-100 py-2"
                    >
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Create Admin Account"
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterAdmin;
