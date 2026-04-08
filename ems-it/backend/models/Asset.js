const mongoose = require('mongoose');
const assetSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  assetCode:    { type: String, unique: true },
  type:         { type: String, enum: ['laptop','desktop','monitor','mouse','keyboard','phone','other'] },
  brand:        { type: String },
  model:        { type: String },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  purchasePrice:{ type: Number },
  warrantyTill: { type: Date },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  assignedDate: { type: Date },
  status:       { type: String, enum: ['available','assigned','maintenance','retired'], default: 'available' },
  condition:    { type: String, enum: ['new','good','fair','poor'], default: 'new' },
  notes:        { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Asset', assetSchema);
