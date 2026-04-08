const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
     const totalEmployees  = await Employee.countDocuments({ role: { $ne: 'admin' } }).catch(() => 0);
     const activeEmployees = await Employee.countDocuments({ status: 'active', role: { $ne: 'admin' } }).catch(() => 0);
    const departments     = await Department.countDocuments().catch(() => 0);
    const projects        = await Project.countDocuments({ status: 'active' }).catch(() => 0);
    const openTickets     = await Ticket.countDocuments({ status: 'open' }).catch(() => 0);
    const pendingLeaves   = await Leave.countDocuments({ status: 'pending' }).catch(() => 0);

    const payrollAgg = await Payroll.aggregate([
      { $match: { month: now.getMonth() + 1, year: now.getFullYear() } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } }
    ]).catch(() => []);
    const monthlyPayroll = payrollAgg[0]?.total || 0;

    const deptWise = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } }
    ]).catch(() => []);

    const statusBreakdown = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).catch(() => []);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).catch(() => []);

    const recentJoinings = await Employee.find({ status: 'active' })
      .sort({ joiningDate: -1 }).limit(5)
      .populate('department', 'name')
      .select('name designation department joiningDate photo')
      .catch(() => []);

    res.json({
      totalEmployees, activeEmployees, departments, projects,
      openTickets, pendingLeaves, monthlyPayroll,
      deptWise, statusBreakdown, attendanceAgg, recentJoinings
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/payroll', auth, async (req, res) => {
  try {
    const y = req.query.year || new Date().getFullYear();
    const monthly = await Payroll.aggregate([
      { $match: { year: Number(y) } },
      { $group: { _id: '$month', total: { $sum: '$netSalary' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).catch(() => []);
    res.json({ monthly });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/performance', auth, async (req, res) => {
  try {
    const y = req.query.year || new Date().getFullYear();
    const reviews = await Performance.aggregate([
      { $match: { year: Number(y) } },
      { $group: { _id: null, avgRating: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]).catch(() => []);
    const topPerformers = await Performance.find({ year: Number(y) })
      .sort({ overallRating: -1 }).limit(5)
      .populate('employee', 'name designation photo')
      .catch(() => []);
    res.json({ summary: reviews[0] || {}, topPerformers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/leave', auth, async (req, res) => {
  try {
    const byType = await Leave.aggregate([
      { $group: { _id: '$leaveType', count: { $sum: 1 }, days: { $sum: '$days' } } }
    ]).catch(() => []);
    const byStatus = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).catch(() => []);
    res.json({ byType, byStatus });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;