const FaceData = require('./faceModel');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Helper function to calculate face similarity (Euclidean distance)
const calculateFaceSimilarity = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2) return 0;
    
    let sum = 0;
    for (let i = 0; i < Math.min(descriptor1.length, descriptor2.length); i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    
    const distance = Math.sqrt(sum);
    const similarity = Math.max(0, 100 - (distance * 10));
    return similarity;
};

// Feature 1: Register Employee Face
const registerEmployeeFace = async (req, res) => {
    try {
        const { employeeId, faceDescriptor } = req.body;
        
        if (!employeeId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Employee ID is required' 
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Face image is required' 
            });
        }

        let parsedDescriptor = null;
        if (faceDescriptor) {
            try {
                parsedDescriptor = JSON.parse(faceDescriptor);
            } catch (e) {
                console.error('Error parsing face descriptor:', e);
            }
        }

        let faceData = await FaceData.findOne({ employeeId });

        if (faceData) {
            faceData.faceImagePath = req.file.path;
            faceData.faceDescriptor = parsedDescriptor;
            faceData.isActive = true;
            faceData.updatedAt = Date.now();
        } else {
            faceData = new FaceData({
                employeeId,
                faceImagePath: req.file.path,
                faceDescriptor: parsedDescriptor,
                isActive: true
            });
        }

        await faceData.save();

        employee.faceRegistered = true;
        await employee.save();

        res.status(200).json({
            success: true,
            message: 'Employee face registered successfully',
            data: {
                employeeId: employee._id,
                employeeName: employee.name,
                faceImagePath: req.file.path,
                registeredAt: faceData.createdAt
            }
        });

    } catch (error) {
        console.error('Error registering employee face:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register employee face',
            error: error.message
        });
    }
};

// Feature 2: Verify Face for Login ✅ FIXED - JWT token added
const verifyFaceLogin = async (req, res) => {
    try {
        const { faceDescriptor } = req.body;

        if (!req.file && !faceDescriptor) {
            return res.status(400).json({
                success: false,
                message: 'Face image or descriptor is required'
            });
        }

        let parsedDescriptor = null;
        if (faceDescriptor) {
            try {
                parsedDescriptor = JSON.parse(faceDescriptor);
            } catch (e) {
                console.error('Error parsing face descriptor:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid face descriptor format'
                });
            }
        }

        if (!parsedDescriptor || parsedDescriptor.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Face descriptor is required for verification'
            });
        }

        const allFaceData = await FaceData.find({ isActive: true }).populate('employeeId');

        let bestMatch = null;
        let highestSimilarity = 0;
        const SIMILARITY_THRESHOLD = 60;

        for (const faceData of allFaceData) {
            if (!faceData.faceDescriptor) continue;

            const similarity = calculateFaceSimilarity(
                parsedDescriptor, 
                faceData.faceDescriptor
            );

            if (similarity > highestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
                highestSimilarity = similarity;
                bestMatch = faceData;
            }
        }

        if (bestMatch && bestMatch.employeeId) {
            const employee = bestMatch.employeeId;

            bestMatch.lastLoginAttempt = new Date();
            await bestMatch.save();

            // ✅ JWT Token generate பண்ணு
            const token = jwt.sign(
                {
                    id: employee._id,
                    email: employee.email,
                    role: employee.role || 'employee'
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            // ✅ token + user + matched return பண்ணு
            res.status(200).json({
                success: true,
                matched: true,
                message: 'Face verified successfully',
                token: token,
                user: {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    role: employee.role || 'employee'
                },
                similarity: highestSimilarity.toFixed(2)
            });
        } else {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(401).json({
                success: false,
                matched: false,
                message: 'Face not recognized. Please try again or use password login.',
                similarity: highestSimilarity.toFixed(2)
            });
        }

    } catch (error) {
        console.error('Error verifying face login:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to verify face',
            error: error.message
        });
    }
};

// Feature 3: Mark Attendance with Face Scan
const markAttendanceWithFace = async (req, res) => {
    try {
        const { faceDescriptor, latitude, longitude } = req.body;

        if (!faceDescriptor) {
            return res.status(400).json({
                success: false,
                message: 'Face descriptor is required'
            });
        }

        let parsedDescriptor = null;
        try {
            parsedDescriptor = JSON.parse(faceDescriptor);
        } catch (e) {
            console.error('Error parsing face descriptor:', e);
            return res.status(400).json({
                success: false,
                message: 'Invalid face descriptor format'
            });
        }

        const allFaceData = await FaceData.find({ isActive: true }).populate('employeeId');

        let bestMatch = null;
        let highestSimilarity = 0;
        const SIMILARITY_THRESHOLD = 70;

        for (const faceData of allFaceData) {
            if (!faceData.faceDescriptor) continue;

            const similarity = calculateFaceSimilarity(
                parsedDescriptor, 
                faceData.faceDescriptor
            );

            if (similarity > highestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
                highestSimilarity = similarity;
                bestMatch = faceData;
            }
        }

        if (!bestMatch || !bestMatch.employeeId) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(401).json({
                success: false,
                message: 'Face not recognized. Please register your face first.',
                similarity: highestSimilarity.toFixed(2)
            });
        }

        const employee = bestMatch.employeeId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            employeeId: employee._id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingAttendance) {
            if (!existingAttendance.checkOut) {
                existingAttendance.checkOut = new Date();
                existingAttendance.status = 'present';
                
                const checkIn = new Date(existingAttendance.checkIn);
                const checkOut = new Date(existingAttendance.checkOut);
                const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
                existingAttendance.hoursWorked = hoursWorked.toFixed(2);

                await existingAttendance.save();

                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Check-out marked successfully',
                    data: {
                        employeeName: employee.name,
                        checkIn: existingAttendance.checkIn,
                        checkOut: existingAttendance.checkOut,
                        hoursWorked: existingAttendance.hoursWorked,
                        similarity: highestSimilarity.toFixed(2)
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Attendance already marked for today'
                });
            }
        }

        const attendance = new Attendance({
            employeeId: employee._id,
            date: new Date(),
            checkIn: new Date(),
            status: 'present',
            markedBy: 'face-recognition',
            location: latitude && longitude ? {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            } : null,
            faceVerificationScore: highestSimilarity
        });

        await attendance.save();

        bestMatch.lastAttendanceMarked = new Date();
        await bestMatch.save();

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            data: {
                employeeName: employee.name,
                checkIn: attendance.checkIn,
                date: attendance.date,
                similarity: highestSimilarity.toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error marking attendance with face:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to mark attendance',
            error: error.message
        });
    }
};

// Get employee face data
const getEmployeeFaceData = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const faceData = await FaceData.findOne({ employeeId }).populate('employeeId');

        if (!faceData) {
            return res.status(404).json({
                success: false,
                message: 'Face data not found for this employee'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                employeeId: faceData.employeeId._id,
                employeeName: faceData.employeeId.name,
                faceImagePath: faceData.faceImagePath,
                isActive: faceData.isActive,
                registeredAt: faceData.createdAt,
                lastLoginAttempt: faceData.lastLoginAttempt,
                lastAttendanceMarked: faceData.lastAttendanceMarked
            }
        });

    } catch (error) {
        console.error('Error getting face data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get face data',
            error: error.message
        });
    }
};

// Update employee face
const updateEmployeeFace = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { faceDescriptor } = req.body;

        const faceData = await FaceData.findOne({ employeeId });

        if (!faceData) {
            return res.status(404).json({
                success: false,
                message: 'Face data not found for this employee'
            });
        }

        if (req.file && faceData.faceImagePath) {
            if (fs.existsSync(faceData.faceImagePath)) {
                fs.unlinkSync(faceData.faceImagePath);
            }
            faceData.faceImagePath = req.file.path;
        }

        if (faceDescriptor) {
            try {
                faceData.faceDescriptor = JSON.parse(faceDescriptor);
            } catch (e) {
                console.error('Error parsing face descriptor:', e);
            }
        }

        faceData.updatedAt = new Date();
        await faceData.save();

        res.status(200).json({
            success: true,
            message: 'Face data updated successfully',
            data: faceData
        });

    } catch (error) {
        console.error('Error updating face data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update face data',
            error: error.message
        });
    }
};

// Delete employee face data
const deleteEmployeeFace = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const faceData = await FaceData.findOne({ employeeId });

        if (!faceData) {
            return res.status(404).json({
                success: false,
                message: 'Face data not found for this employee'
            });
        }

        if (faceData.faceImagePath && fs.existsSync(faceData.faceImagePath)) {
            fs.unlinkSync(faceData.faceImagePath);
        }

        await FaceData.deleteOne({ employeeId });

        await Employee.findByIdAndUpdate(employeeId, { faceRegistered: false });

        res.status(200).json({
            success: true,
            message: 'Face data deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting face data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete face data',
            error: error.message
        });
    }
};

// Get all face registrations (Admin only)
const getAllFaceRegistrations = async (req, res) => {
    try {
        const faceRegistrations = await FaceData.find()
            .populate('employeeId', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: faceRegistrations.length,
            data: faceRegistrations
        });

    } catch (error) {
        console.error('Error getting all face registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get face registrations',
            error: error.message
        });
    }
};

module.exports = {
    registerEmployeeFace,
    verifyFaceLogin,
    markAttendanceWithFace,
    getEmployeeFaceData,
    updateEmployeeFace,
    deleteEmployeeFace,
    getAllFaceRegistrations
};