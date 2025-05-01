const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, concern, notes } = req.body;
  try {
    const appointment = new Appointment({ name, email, phone, concern, notes });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

module.exports = router;
