const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo, type } = req.query;
    let query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (type) query.type = type;
    const assets = await Asset.find(query).populate('assignedTo', 'name employeeCode').sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const count = await Asset.countDocuments();
    const data = { ...req.body, assetCode: 'AST' + String(count + 1).padStart(4, '0') };
    res.status(201).json(await Asset.create(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const d = req.body;
    if (d.assignedTo) { d.status = 'assigned'; d.assignedDate = new Date(); }
    if (d.assignedTo === null || d.assignedTo === '') { d.status = 'available'; d.assignedTo = null; }
    const asset = await Asset.findByIdAndUpdate(req.params.id, d, { new: true });
    if (!asset) return res.status(404).json({ message: 'Not found' });
    res.json(asset);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try { await Asset.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
