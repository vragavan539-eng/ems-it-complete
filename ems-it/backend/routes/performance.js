const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { employee, year } = req.query;
    let query = {};
    if (employee) query.employee = employee;
    if (year) query.year = year;
    const reviews = await Performance.find(query)
      .populate('employee', 'name employeeCode designation')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const d = req.body;
    const r = d.ratings || {};
    const vals = [r.technical, r.communication, r.teamwork, r.leadership, r.punctuality, r.productivity].filter(Boolean);
    const overall = vals.length ? (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(2) : 0;
    const review = await Performance.create({ ...d, overallRating: overall });
    res.status(201).json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const d = req.body;
    if (d.ratings) {
      const r = d.ratings;
      const vals = [r.technical, r.communication, r.teamwork, r.leadership, r.punctuality, r.productivity].filter(Boolean);
      d.overallRating = vals.length ? (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(2) : 0;
    }
    const review = await Performance.findByIdAndUpdate(req.params.id, d, { new: true });
    if (!review) return res.status(404).json({ message: 'Not found' });
    res.json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Performance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
