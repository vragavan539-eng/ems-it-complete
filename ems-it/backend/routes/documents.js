const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', auth, async (req, res) => {
  try {
    const { employee } = req.query;
    let query = employee ? { employee } : {};
    const docs = await Document.find(query).populate('employee', 'name employeeCode').populate('uploadedBy', 'name');
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) { data.fileName = req.file.originalname; data.filePath = `/uploads/${req.file.filename}`; }
    res.status(201).json(await Document.create(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try { await Document.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
