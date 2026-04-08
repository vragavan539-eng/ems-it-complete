const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { status, employee } = req.query;
    let query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;
    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeCode department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const d = req.body;
    const from = new Date(d.fromDate), to = new Date(d.toDate);
    const days = Math.ceil((to - from) / (1000*60*60*24)) + 1;
    const leave = await Leave.create({ ...d, days });
    res.status(201).json(leave);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id,
      { status: req.body.status, approvedBy: req.body.approvedBy, remarks: req.body.remarks },
      { new: true });
    if (!leave) return res.status(404).json({ message: 'Not found' });
    res.json(leave);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
