import React, { useState } from 'react';
import FaceCapture from '../components/face-recognition/FaceCapture';
import axios from 'axios';

const API_URL = 'http://https://ems-it-complete-2.onrender.com:5000';

const RegisterEmployeeFace = ({ employeeId, employeeName, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFaceDetected = async (faceData) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${API_URL}/api/face/register`,
                {
                    employeeId: employeeId,
                    descriptor: faceData.faceDescriptor
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.message || response.data.employee) {
                setSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess(response.data);
                }, 2000);
            }

        } catch (err) {
            console.error('Face registration error:', err);
            setError(err.response?.data?.message || 'Failed to register face. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.successContainer}>
                <div style={styles.successIcon}>✅</div>
                <h2 style={styles.successTitle}>Face Registered Successfully!</h2>
                <p style={styles.successText}>
                    {employeeName}'s face has been registered and can now be used for login and attendance.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📷 Register Face for {employeeName}</h2>
                <p style={styles.subtitle}>Capture employee's face to enable face recognition</p>
            </div>

            {error && (
                <div style={styles.alertError}>⚠️ {error}</div>
            )}

            {loading && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.spinner}></div>
                    <p style={{ color: 'white', marginTop: '1rem' }}>Registering face...</p>
                </div>
            )}

            <FaceCapture
                onFaceDetected={handleFaceDetected}
                mode="register"
            />

            {onCancel && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button onClick={onCancel} style={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            )}

            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '1rem' },
    header: { textAlign: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', fontSize: '0.95rem' },
    alertError: {
        background: '#fee2e2', color: '#991b1b',
        border: '1px solid #fca5a5', borderRadius: '8px',
        padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem',
    },
    loadingOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    spinner: {
        border: '4px solid #f3f3f3', borderTop: '4px solid #667eea',
        borderRadius: '50%', width: '50px', height: '50px',
        animation: 'spin 1s linear infinite',
    },
    successContainer: {
        textAlign: 'center', padding: '3rem 2rem',
        background: 'white', borderRadius: '12px',
    },
    successIcon: { fontSize: '4rem', marginBottom: '1rem' },
    successTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' },
    successText: { color: '#6b7280' },
    cancelBtn: {
        background: '#6b7280', color: 'white',
        padding: '0.75rem 2rem', borderRadius: '8px',
        border: 'none', cursor: 'pointer', fontWeight: '500',
    },
};

export default RegisterEmployeeFace;