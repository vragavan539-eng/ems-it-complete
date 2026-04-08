const mongoose = require('mongoose');
const deptSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  code:        { type: String, unique: true },
  description: { type: String },
  head:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  budget:      { type: Number, default: 0 },
  location:    { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Department', deptSchema);
