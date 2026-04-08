const mongoose = require('mongoose');
const leaveSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType:   { type: String, enum: ['casual','sick','earned','maternity','paternity','unpaid'], required: true },
  fromDate:    { type: Date, required: true },
  toDate:      { type: Date, required: true },
  days:        { type: Number },
  reason:      { type: String, required: true },
  status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  remarks:     { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Leave', leaveSchema);
