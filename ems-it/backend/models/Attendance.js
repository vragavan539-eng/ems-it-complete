const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date:       { type: Date, required: true },
  checkIn:    { type: String },
  checkOut:   { type: String },
  status:     { type: String, enum: ['present','absent','half-day','late','holiday','weekend'], default: 'present' },
  workHours:  { type: Number, default: 0 },
  location:   { type: String },
  remarks:    { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Attendance', attendanceSchema);
