const express = require("express");
const { db, admin } = require("./firebase");

const router = express.Router();

// Middleware to verify Firebase token
async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
}

// Get all appointments
router.get("/appointments", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("appointments").get();
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching appointments" });
  }
});

// Add an appointment
router.post("/appointments", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    await db.collection("appointments").add(data);
    res.status(201).send({ message: "Appointment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding appointment" });
  }
});

// Get all admins
router.get("/admins", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("admins").get();
    const admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "Error fetching admins" });
  }
});

// Update admin details
router.put("/admins/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.collection("admins").doc(id).update(updates);
    res.status(200).send({ message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating admin" });
  }
});

module.exports = router;
