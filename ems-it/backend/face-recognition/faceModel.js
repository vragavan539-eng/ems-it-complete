const mongoose = require('mongoose');

const faceDataSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },
    faceImagePath: {
        type: String,
        required: true
    },
    faceDescriptor: {
        type: [Number],
        required: true,
        // Face descriptor is an array of 128 or 512 numbers (depending on face-api.js model)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAttempt: {
        type: Date,
        default: null
    },
    lastAttendanceMarked: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
faceDataSchema.index({ employeeId: 1 });
faceDataSchema.index({ isActive: 1 });

module.exports = mongoose.model('FaceData', faceDataSchema);