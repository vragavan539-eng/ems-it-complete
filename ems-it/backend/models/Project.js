const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  code:        { type: String, unique: true },
  description: { type: String },
  client:      { type: String },
  techStack:   [String],
  startDate:   { type: Date },
  endDate:     { type: Date },
  status:      { type: String, enum: ['planning','active','on-hold','completed','cancelled'], default: 'planning' },
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  team:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  budget:      { type: Number, default: 0 },
  priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });
module.exports = mongoose.model('Project', projectSchema);
