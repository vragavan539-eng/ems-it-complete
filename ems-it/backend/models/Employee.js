const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        { type: String },
  photo:        { type: String },
  department:   { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation:  { type: String },
  role:         { type: String, enum: ['admin','hr','manager','employee'], default: 'employee' },
  salary:       { type: Number, default: 0 },
  joiningDate:  { type: Date, default: Date.now },
  status:       { type: String, enum: ['active','inactive','resigned'], default: 'active' },
  skills:       [String],
  address:      { type: String },
  bloodGroup:   { type: String },
  emergencyContact: { name: String, phone: String },
  bankDetails:  { accountNo: String, ifsc: String, bankName: String },
  reportingTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // ✅ Face Recognition - New field
  faceDescriptor: { type: [Number], default: null },

}, { timestamps: true });

employeeSchema.pre('save', async function(next) {
  if (!this.employeeCode) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeCode = 'EMP' + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);