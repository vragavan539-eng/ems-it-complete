const mongoose = require('mongoose');
const trainingSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String, enum: ['technical','soft-skills','compliance','onboarding','other'] },
  trainer:     { type: String },
  startDate:   { type: Date },
  endDate:     { type: Date },
  mode:        { type: String, enum: ['online','offline','hybrid'], default: 'online' },
  venue:       { type: String },
  link:        { type: String },
  participants:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status:      { type: String, enum: ['upcoming','ongoing','completed','cancelled'], default: 'upcoming' },
  certificate: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Training', trainingSchema);
