const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

const getDistance = (d1, d2) =>
  Math.sqrt(d1.reduce((sum, val, i) => sum + (val - d2[i]) ** 2, 0));

// ✅ Register Face
router.post('/register', async (req, res) => {
  try {
    const { employeeId, descriptor } = req.body;
    const emp = await Employee.findByIdAndUpdate(
      employeeId,
      { faceDescriptor: descriptor },
      { new: true }
    );
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: '✅ Face registered successfully!', employee: emp });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Verify Face
router.post('/verify', async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: 'Invalid descriptor' });
    }

    const employees = await Employee.find({
      faceDescriptor: { $exists: true, $ne: null },
      status: 'active'
    });

    if (employees.length === 0) {
      return res.json({ matched: false, message: 'No faces registered yet' });
    }

    let bestMatch = null;
    let minDistance = 0.55;

    for (const emp of employees) {
      if (!emp.faceDescriptor || emp.faceDescriptor.length !== descriptor.length) continue;
      const dist = getDistance(descriptor, emp.faceDescriptor);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = emp;
      }
    }

    if (!bestMatch) {
      return res.json({ matched: false, message: '❌ Face not recognized' });
    }

    // ✅ Attendance mark
    const today = new Date().toISOString().split('T')[0];
    let record = null;

    try {
      record = await Attendance.findOne({ employee: bestMatch._id, date: today });
      if (!record) {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        await Attendance.create({
          employee: bestMatch._id,
          date: today,
          checkIn: timeStr,
          status: 'present'
        });
      }
    } catch (attendanceErr) {
      console.error('Attendance error:', attendanceErr.message);
    }

const token = jwt.sign(
  { id: bestMatch._id, role: bestMatch.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.json({
  matched: true,
  alreadyMarked: !!record,
  token: token,
  employee: {
    _id: bestMatch._id,
    name: bestMatch.name,
    employeeCode: bestMatch.employeeCode,
    role: bestMatch.role,
    department: bestMatch.department,
    photo: bestMatch.photo
  }
});

  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;