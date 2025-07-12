import React, { useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { Envelope, Lock } from "react-bootstrap-icons";

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Your demo credentials
      const validDemoCredentials = {
        email: "admin@demo.com",
        password: "Admin@123",
        role: "Super Admin",
      };

      if (
        email.toLowerCase().trim() !== validDemoCredentials.email ||
        password !== validDemoCredentials.password
      ) {
        throw new Error("Invalid email or password");
      }

      // Call onLogin with user info to set user state in App.jsx
      onLogin({
        email: validDemoCredentials.email,
        role: validDemoCredentials.role,
        uid: "demo-user-id", // you can add any identifier here
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="w-100" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <h2 className="text-center mb-4">Admin Portal</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <Envelope />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <Lock />
                </span>
                <Form.Control
                  type="password"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </Form.Group>

            <Button
              disabled={loading}
              className="w-100 mb-3"
              variant="primary"
              type="submit"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
