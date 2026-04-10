const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const getDistance = (d1, d2) =>
  Math.sqrt(d1.reduce((sum, val, i) => sum + (val - d2[i]) ** 2, 0));

router.post('/register', async (req, res) => {
  try {
    const { employeeId, descriptor } = req.body;
    const emp = await Employee.findByIdAndUpdate(employeeId, { faceDescriptor: descriptor }, { new: true });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Face registered successfully!', employee: emp });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const verifyFace = async (req, res) => {
  try {
    const { descriptor, faceDescriptor } = req.body;
    let desc = descriptor;
    if (!desc && faceDescriptor) {
      try { desc = typeof faceDescriptor === 'string' ? JSON.parse(faceDescriptor) : faceDescriptor; }
      catch (e) { desc = faceDescriptor; }
    }
    if (!desc || !Array.isArray(desc) || desc.length === 0) {
      return res.status(400).json({ matched: false, message: 'Face descriptor missing or invalid' });
    }

    const employees = await Employee.find({ faceDescriptor: { $exists: true, $ne: null }, status: 'active' });
    if (employees.length === 0) return res.json({ matched: false, message: 'No faces registered yet' });

    let bestMatch = null;
    let minDistance = 0.55;
    for (const emp of employees) {
      if (!emp.faceDescriptor || emp.faceDescriptor.length !== desc.length) continue;
      const dist = getDistance(desc, emp.faceDescriptor);
      if (dist < minDistance) { minDistance = dist; bestMatch = emp; }
    }

    if (!bestMatch) return res.json({ matched: false, message: 'Face not recognized' });

    // Auto mark attendance for employee/manager on login
    let attendanceMarked = false;
    let alreadyMarked = false;
    let attendanceStatus = 'present';

    if (bestMatch.role === 'employee' || bestMatch.role === 'manager') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({ employee: bestMatch._id, date: today });
        if (existing) {
          alreadyMarked = true;
        } else {
          const now = new Date();
          const h = now.getHours(), m = now.getMinutes();
          const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          attendanceStatus = (h > 9 || (h === 9 && m > 15)) ? 'late' : 'present';
          await Attendance.create({ employee: bestMatch._id, date: today, checkIn: timeStr, status: attendanceStatus });
          attendanceMarked = true;
        }
      } catch (e) { console.error('Attendance error:', e.message); }
    }

    const token = jwt.sign({ id: bestMatch._id, role: bestMatch.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      matched: true, success: true, token,
      attendanceMarked, alreadyMarked, attendanceStatus,
      user: {
        _id: bestMatch._id, name: bestMatch.name, email: bestMatch.email,
        employeeCode: bestMatch.employeeCode, role: bestMatch.role,
        department: bestMatch.department, photo: bestMatch.photo
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

router.post('/verify', upload.single('faceImage'), verifyFace);
router.post('/verify-login', upload.single('faceImage'), verifyFace);
module.exports = router;