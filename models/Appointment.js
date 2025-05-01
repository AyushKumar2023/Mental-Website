const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  concern: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
