const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title:       { type: String, required: true },
  type:        { type: String, enum: ['offer-letter','appointment','experience','payslip','id-proof','address-proof','other'] },
  fileName:    { type: String },
  filePath:    { type: String },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isVerified:  { type: Boolean, default: false },
  expiryDate:  { type: Date },
}, { timestamps: true });
module.exports = mongoose.model('Document', documentSchema);
