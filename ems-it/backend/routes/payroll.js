const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { month, year, employee } = req.query;
    let query = {};
    if (month) query.month = month;
    if (year) query.year = year;
    if (employee) query.employee = employee;
    const payrolls = await Payroll.find(query).populate('employee', 'name employeeCode department designation');
    res.json(payrolls);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const p = await Payroll.findById(req.params.id).populate('employee', 'name employeeCode designation department bankDetails');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const d = req.body;
    const gross = (d.basicSalary||0) + (d.hra||0) + (d.ta||0) + (d.da||0) + (d.otherAllowances||0) + (d.bonus||0);
    const deductions = (d.pf||0) + (d.esi||0) + (d.tds||0) + (d.otherDeductions||0) + (d.lop||0);
    const net = gross - deductions;
    const payroll = await Payroll.create({ ...d, grossSalary: gross, netSalary: net });
    res.status(201).json(payroll);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const d = req.body;
    if (d.basicSalary !== undefined) {
      d.grossSalary = (d.basicSalary||0)+(d.hra||0)+(d.ta||0)+(d.da||0)+(d.otherAllowances||0)+(d.bonus||0);
      d.netSalary = d.grossSalary - ((d.pf||0)+(d.esi||0)+(d.tds||0)+(d.otherDeductions||0)+(d.lop||0));
    }
    const p = await Payroll.findByIdAndUpdate(req.params.id, d, { new: true });
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'paid') update.paidOn = new Date();
    const p = await Payroll.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(p);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
