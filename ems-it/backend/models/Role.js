const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{
    module: String,
    actions: [{ type: String, enum: ['view','create','edit','delete'] }]
  }],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Role', roleSchema);
