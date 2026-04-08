const mongoose = require('mongoose');
const payrollSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month:       { type: Number, required: true },
  year:        { type: Number, required: true },
  basicSalary: { type: Number, default: 0 },
  hra:         { type: Number, default: 0 },
  ta:          { type: Number, default: 0 },
  da:          { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  pf:          { type: Number, default: 0 },
  esi:         { type: Number, default: 0 },
  tds:         { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  bonus:       { type: Number, default: 0 },
  lop:         { type: Number, default: 0 },
  lopDays:     { type: Number, default: 0 },
  grossSalary: { type: Number, default: 0 },
  netSalary:   { type: Number, default: 0 },
  status:      { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  paidOn:      { type: Date },
  remarks:     { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Payroll', payrollSchema);
