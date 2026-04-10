const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for face image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/faces');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'face-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
    }
});

// Import controllers
const {
    registerEmployeeFace,
    verifyFaceLogin,
    markAttendanceWithFace,
    getEmployeeFaceData,
    updateEmployeeFace,
    deleteEmployeeFace,
    getAllFaceRegistrations
} = require('./faceController');

// Routes

// 1. Register employee face (for new employee registration)
router.post('/register', upload.single('faceImage'), registerEmployeeFace);

// 2. Verify face for login
router.post('/verify-login', upload.single('faceImage'), verifyFaceLogin);

// 3. Mark attendance with face scan
router.post('/mark-attendance', upload.single('faceImage'), markAttendanceWithFace);

// 4. Get employee face data
router.get('/employee/:employeeId', getEmployeeFaceData);

// 5. Update employee face
router.put('/employee/:employeeId', upload.single('faceImage'), updateEmployeeFace);

// 6. Delete employee face data
router.delete('/employee/:employeeId', deleteEmployeeFace);

// 7. Get all face registrations (admin only)
router.get('/all', getAllFaceRegistrations);

module.exports = router;