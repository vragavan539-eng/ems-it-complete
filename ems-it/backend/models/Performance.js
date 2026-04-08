const mongoose = require('mongoose');
const performanceSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  period:      { type: String, required: true },
  year:        { type: Number, required: true },
  ratings: {
    technical:    { type: Number, min: 1, max: 5, default: 3 },
    communication:{ type: Number, min: 1, max: 5, default: 3 },
    teamwork:     { type: Number, min: 1, max: 5, default: 3 },
    leadership:   { type: Number, min: 1, max: 5, default: 3 },
    punctuality:  { type: Number, min: 1, max: 5, default: 3 },
    productivity: { type: Number, min: 1, max: 5, default: 3 },
  },
  overallRating: { type: Number },
  goals:         [{ goal: String, achieved: Boolean, remarks: String }],
  strengths:     { type: String },
  improvements:  { type: String },
  comments:      { type: String },
  status:        { type: String, enum: ['draft','submitted','acknowledged'], default: 'draft' },
}, { timestamps: true });
module.exports = mongoose.model('Performance', performanceSchema);
