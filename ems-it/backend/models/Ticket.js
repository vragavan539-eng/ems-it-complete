const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['hardware','software','network','access','hr','other'], default: 'other' },
  priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  status:      { type: String, enum: ['open','in-progress','resolved','closed'], default: 'open' },
  raisedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  resolvedAt:  { type: Date },
  comments:    [{ by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, text: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
module.exports = mongoose.model('Ticket', ticketSchema);
