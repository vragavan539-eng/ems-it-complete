const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const { dept, status, search } = req.query;
    let query = {};
    if (dept) query.department = dept;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } },
    ];
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('reportingTo', 'name')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id)
      .populate('department', 'name code')
      .populate('reportingTo', 'name designation');
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create employee + auto create user account
router.post('/', auth, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const { password, ...empData } = req.body;
    if (req.file) empData.photo = `/uploads/${req.file.filename}`;

    // Create employee
    const emp = await Employee.create(empData);

    // Create user account with provided password
    const userPassword = password || 'Welcome@123';
    const hashed = await bcrypt.hash(userPassword, 10);
    
    const existingUser = await User.findOne({ email: emp.email });
    if (!existingUser) {
      await User.create({
        name: emp.name,
        email: emp.email,
        password: hashed,
        role: empData.role || 'employee',
        employeeId: emp._id
      });
    }

    res.status(201).json({ 
      ...emp.toObject(), 
      loginEmail: emp.email,
      loginPassword: userPassword
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(400).json({ message: err.message });
  }
});

// Update employee
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { password, ...data } = req.body;
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    
    const emp = await Employee.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!emp) return res.status(404).json({ message: 'Not found' });

    // Update password if provided
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate(
        { email: emp.email },
        { password: hashed }
      );
    }

    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete employee + user account
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (emp) {
      await User.findOneAndDelete({ email: emp.email });
      await Employee.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;