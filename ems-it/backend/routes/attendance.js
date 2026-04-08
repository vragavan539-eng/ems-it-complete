const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { employee, month, year } = req.query;
    let query = {};
    if (employee) query.employee = employee;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(query)
      .populate('employee', 'name employeeCode user')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ✅ PATCH — Employee Check Out (checkout time, hours, location update)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { checkOut, workHours, location } = req.body;
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: { checkOut, workHours, location } },
      { new: true }
    ).populate('employee', 'name employeeCode user');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;