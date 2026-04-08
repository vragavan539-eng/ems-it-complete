const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { status, category, assignedTo } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    const tickets = await Ticket.find(query)
      .populate('raisedBy', 'name department')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try { res.status(201).json(await Ticket.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const d = req.body;
    if (d.status === 'resolved') d.resolvedAt = new Date();
    const t = await Ticket.findByIdAndUpdate(req.params.id, d, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const t = await Ticket.findByIdAndUpdate(req.params.id,
      { $push: { comments: { by: req.body.by, text: req.body.text } } },
      { new: true });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try { await Ticket.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
