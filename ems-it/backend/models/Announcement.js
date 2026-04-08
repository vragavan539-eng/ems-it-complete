const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['general','holiday','policy','event','alert'], default: 'general' },
  priority:   { type: String, enum: ['low','medium','high'], default: 'medium' },
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  targetDept: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  expiryDate: { type: Date },
  isPinned:   { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Announcement', announcementSchema);
