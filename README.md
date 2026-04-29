# ⚡ TechEMS — IT Company Employee Management System

Full Stack EMS with **15 Modules** built on **React + Node.js + Express + MongoDB**

---

## 📦 15 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | 🏠 Dashboard | Stats, charts, recent activity |
| 2 | 👥 Employees | Profile with photo, CRUD |
| 3 | 🏢 Departments | Dept management with budget |
| 4 | 🔐 Roles & Access | Permission-based access control |
| 5 | 💰 Payroll | Salary, allowances, deductions |
| 6 | 📅 Leave | Apply, approve, reject leaves |
| 7 | 🕐 Attendance | Daily tracking, check-in/out |
| 8 | ⭐ Performance | Reviews with ratings |
| 9 | 🚀 Projects | IT project management |
| 10 | 💻 Assets | Laptop, device tracking |
| 11 | 🎓 Training | Programs and enrollment |
| 12 | 📄 Documents | Upload and verify docs |
| 13 | 📢 Announcements | Company-wide posts |
| 14 | 🎫 IT Helpdesk | Support ticket system |
| 15 | 📊 Reports | Payroll, Performance, Leave analytics |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Step 1 — Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas
# Update MONGO_URI in backend/.env
```

### Step 2 — Backend Setup
```bash
cd backend
npm install
npm run dev
# ✅ Running on http://https://ems-it-complete-2.onrender.com:5000
```

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://https://ems-it-complete-2.onrender.com:5173
```

### Step 4 — Create Admin User
Open browser → http://https://ems-it-complete-2.onrender.com:5173/login → Register → Select role: **Admin**

---

## 🔧 Environment Variables

### `backend/.env`
```
MONGO_URI=mongodb://https://ems-it-complete-2.onrender.com:27017/ems_it_db
JWT_SECRET=ems_it_super_secret_2024
PORT=5000
```

---

## 📁 Project Structure

```
ems-it/
├── backend/
│   ├── config/
│   │   └── multer.js          # File upload config
│   ├── middleware/
│   │   └── auth.js            # JWT + role middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Role.js
│   │   ├── Payroll.js
│   │   ├── Leave.js
│   │   ├── Attendance.js
│   │   ├── Performance.js
│   │   ├── Project.js
│   │   ├── Asset.js
│   │   ├── Training.js
│   │   ├── Document.js
│   │   ├── Announcement.js
│   │   └── Ticket.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── departments.js
│   │   ├── roles.js
│   │   ├── payroll.js
│   │   ├── leave.js
│   │   ├── attendance.js
│   │   ├── performance.js
│   │   ├── projects.js
│   │   ├── assets.js
│   │   ├── training.js
│   │   ├── documents.js
│   │   ├── announcements.js
│   │   ├── tickets.js
│   │   └── reports.js
│   ├── uploads/               # Uploaded files stored here
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx     # Sidebar + Topbar
    │   │   └── UI.jsx         # Reusable components
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Departments.jsx
    │   │   ├── Roles.jsx
    │   │   ├── Payroll.jsx
    │   │   ├── Leave.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── Performance.jsx
    │   │   ├── Projects.jsx
    │   │   ├── Assets.jsx
    │   │   ├── Training.jsx
    │   │   ├── Documents.jsx
    │   │   ├── Announcements.jsx
    │   │   ├── Tickets.jsx
    │   │   └── Reports.jsx
    │   ├── api.js             # Centralized API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register user |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/employees | ✅ | List employees |
| POST | /api/employees | ✅ Admin | Add employee |
| PUT | /api/employees/:id | ✅ | Update employee |
| DELETE | /api/employees/:id | ✅ Admin | Delete employee |
| GET | /api/departments | ✅ | List departments |
| GET | /api/payroll | ✅ | List payroll |
| POST | /api/payroll | ✅ Admin | Generate payroll |
| PATCH | /api/payroll/:id/status | ✅ Admin | Mark paid |
| GET | /api/leave | ✅ | List leaves |
| POST | /api/leave | ✅ | Apply leave |
| PATCH | /api/leave/:id/status | ✅ Admin | Approve/Reject |
| GET | /api/attendance | ✅ | Attendance records |
| GET | /api/performance | ✅ | Performance reviews |
| GET | /api/projects | ✅ | List projects |
| GET | /api/assets | ✅ | IT assets |
| GET | /api/training | ✅ | Training programs |
| GET | /api/documents | ✅ | Documents |
| GET | /api/announcements | ✅ | Announcements |
| GET | /api/tickets | ✅ | Support tickets |
| GET | /api/reports/dashboard | ✅ | Dashboard stats |
| GET | /api/reports/payroll | ✅ Admin | Payroll report |
| GET | /api/reports/performance | ✅ Admin | Perf report |
| GET | /api/reports/leave | ✅ Admin | Leave report |

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, React Router v6, Recharts
**Backend:** Node.js, Express.js, Mongoose, JWT, Multer, Bcrypt
**Database:** MongoDB
