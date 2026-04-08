const express = require('express');
const router = express.Router();
const Training = require('../models/Training');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const trainings = await Training.find().populate('participants', 'name').sort({ startDate: -1 });
    res.json(trainings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Training.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const t = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/enroll', auth, async (req, res) => {
  try {
    const t = await Training.findByIdAndUpdate(req.params.id,
      { $addToSet: { participants: req.body.employeeId } }, { new: true });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try { await Training.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
