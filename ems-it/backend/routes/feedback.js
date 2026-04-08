const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const { auth, adminOnly } = require('../middleware/auth');

// Employee - feedback submit
router.post('/', auth, async (req, res) => {
  try {
    const feedback = new Feedback({
      employee: req.user.id,
      message: req.body.message,
      rating: req.body.rating
    });
    await feedback.save();
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - all feedbacks get
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('employee', 'name designation')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;