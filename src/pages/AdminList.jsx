import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Badge, Spinner, Alert } from "react-bootstrap";

const LOCAL_STORAGE_KEY = "admins";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load admins from localStorage on mount
  useEffect(() => {
    const storedAdmins = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (storedAdmins && Array.isArray(storedAdmins)) {
      setAdmins(storedAdmins);
    } else {
      // Initialize with default Super Admin if none found
      const defaultAdmin = [
        {
          uid: "1",
          fullName: "Super Admin",
          email: "superadmin@example.com",
          role: "Super Admin",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true,
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultAdmin));
      setAdmins(defaultAdmin);
    }
  }, []);

  // Save admins to localStorage whenever admins state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(admins));
  }, [admins]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (admin) => {
    setError("");
    setEditingAdmin(admin);
    setEditForm({
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    });
  };

  const handleDeleteClick = (uid) => {
    const adminToDelete = admins.find((a) => a.uid === uid);
    if (!adminToDelete) return;

    if (
      adminToDelete.role === "Super Admin" &&
      admins.filter((a) => a.role === "Super Admin").length === 1
    ) {
      alert("Cannot delete the last Super Admin!");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${adminToDelete.fullName}?`
      )
    ) {
      setAdmins(admins.filter((a) => a.uid !== uid));
    }
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const validateEditForm = () => {
    if (!editForm.fullName.match(/^[a-zA-Z ]{3,30}$/)) {
      setError("Full name must be 3-30 letters only.");
      return false;
    }
    if (!editForm.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      setError("Invalid email format.");
      return false;
    }
    if (editForm.role !== "Admin" && editForm.role !== "Super Admin") {
      setError("Role must be either 'Admin' or 'Super Admin'.");
      return false;
    }
    return true;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setLoading(true);
    setTimeout(() => {
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) =>
          admin.uid === editingAdmin.uid
            ? {
                ...admin,
                fullName: editForm.fullName.trim(),
                email: editForm.email.toLowerCase(),
                role: editForm.role,
              }
            : admin
        )
      );
      setLoading(false);
      setEditingAdmin(null);
    }, 1000);
  };

  const closeModal = () => {
    setEditingAdmin(null);
    setError("");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin List</h2>

      <Form.Control
        type="search"
        placeholder="Search admins by name, email or role"
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-3"
      />

      {filteredAdmins.length === 0 ? (
        <Alert variant="info">No admins found.</Alert>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin.uid}>
                <td>{admin.fullName}</td>
                <td>{admin.email}</td>
                <td>
                  <Badge
                    bg={admin.role === "Super Admin" ? "danger" : "secondary"}
                  >
                    {admin.role}
                  </Badge>
                </td>
                <td>{new Date(admin.createdAt).toLocaleString()}</td>
                <td>{new Date(admin.lastLogin).toLocaleString()}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(admin)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick(admin.uid)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Admin Modal */}
      <Modal show={!!editingAdmin} onHide={closeModal}>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Admin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="editFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditFormChange}
                required
                placeholder="Full Name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                required
                placeholder="Email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editRole">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={editForm.role}
                onChange={handleEditFormChange}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
