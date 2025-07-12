import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { Envelope, Lock } from "react-bootstrap-icons";

function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("Demo!Pass2025");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Replace this with actual validation if needed
      const validDemoCredentials = {
        email: "admin@demo.com",
        password: "Demo!Pass2025",
        role: "Super Admin",
      };

      if (
        email.toLowerCase().trim() !== validDemoCredentials.email ||
        password !== validDemoCredentials.password
      ) {
        throw new Error("Invalid email or password");
      }

      // Set demo auth session
      sessionStorage.setItem(
        "authUser",
        JSON.stringify({
          email: validDemoCredentials.email,
          role: validDemoCredentials.role,
        })
      );

      navigate("/dashboard", {
        replace: true,
        state: { freshLogin: true },
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
                  onChange={(e) =>
                    setEmail(e.target.value.toLowerCase().trim())
                  }
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
