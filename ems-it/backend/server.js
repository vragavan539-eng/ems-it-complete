const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/roles',         require('./routes/roles'));
app.use('/api/payroll',       require('./routes/payroll'));
app.use('/api/leave',         require('./routes/leave'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/performance',   require('./routes/performance'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/assets',        require('./routes/assets'));
app.use('/api/training',      require('./routes/training'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/tickets',       require('./routes/tickets'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/feedback',      require('./routes/feedback'));

// ✅ Face Recognition Route — NEW
app.use('/api/face',          require('./routes/face'));

app.get('/', (req, res) => res.json({ message: '✅ EMS IT API Running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));