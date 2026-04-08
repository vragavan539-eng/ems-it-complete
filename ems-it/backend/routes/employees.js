const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

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

router.get('/:id', auth, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id)
      .populate('department', 'name code')
      .populate('reportingTo', 'name designation');
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const emp = await Employee.create(data);
    res.status(201).json(emp);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const emp = await Employee.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
