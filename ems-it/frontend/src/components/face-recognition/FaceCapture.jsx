import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const FaceCapture = ({ onFaceDetected, mode = 'register' }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [error, setError] = useState('');
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const capturingRef = useRef(false);
    const animFrameRef = useRef(null);
    const autoTriggerRef = useRef(null);
    const faceDetectedRef = useRef(false);

    // ✅ Models load ஆனதும் auto camera start (login & attendance mode)
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
                console.log('Face detection models loaded successfully');
            } catch (err) {
                console.error('Error loading models:', err);
                setError('Failed to load face detection models');
            }
        };
        loadModels();
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current);
        };
    }, []);

    // ✅ Models load ஆனதும் auto start camera (login/attendance mode)
    useEffect(() => {
        if (modelsLoaded && (mode === 'login' || mode === 'attendance')) {
            startCamera();
        }
    }, [modelsLoaded]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
                setError('');
            }
        } catch (err) {
            setError('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        setFaceDetected(false);
        setCountdown(null);
        capturingRef.current = false;
        faceDetectedRef.current = false;
    };

    // ✅ Face detection loop
    useEffect(() => {
        if (!modelsLoaded || !isCameraOn) return;
        capturingRef.current = false;
        faceDetectedRef.current = false;

        const detectFaces = async () => {
            if (capturingRef.current) return;
            if (!videoRef.current || !canvasRef.current) return;
            const video = videoRef.current;
            if (video.readyState !== 4) {
                animFrameRef.current = requestAnimationFrame(detectFaces);
                return;
            }

            try {
                const detections = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
                );

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (detections.length > 0) {
                    detections.forEach(det => {
                        const box = det.box;
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);
                        ctx.fillStyle = 'rgba(0,255,0,0.1)';
                        ctx.fillRect(box.x, box.y, box.width, box.height);
                        ctx.fillStyle = '#00ff00';
                        ctx.font = 'bold 14px Arial';
                        ctx.fillText('✓ Face', box.x + 5, box.y - 8);
                    });
                    setFaceDetected(true);

                    // ✅ Login/Attendance mode: face detected ஆனதும் 2 sec-ல auto capture
                    if ((mode === 'login' || mode === 'attendance') && !faceDetectedRef.current && !capturingRef.current) {
                        faceDetectedRef.current = true;
                        let count = 2;
                        setCountdown(count);
                        const interval = setInterval(() => {
                            count--;
                            if (count > 0) {
                                setCountdown(count);
                            } else {
                                clearInterval(interval);
                                setCountdown(null);
                                captureFaceAuto();
                            }
                        }, 1000);
                    }
                } else {
                    setFaceDetected(false);
                    // Face போனா reset பண்ணு
                    if (faceDetectedRef.current) {
                        faceDetectedRef.current = false;
                        if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current);
                        setCountdown(null);
                    }
                }
            } catch (e) {
                // silent
            }

            if (!capturingRef.current) {
                animFrameRef.current = requestAnimationFrame(detectFaces);
            }
        };

        const timer = setTimeout(detectFaces, 500);
        return () => clearTimeout(timer);
    }, [modelsLoaded, isCameraOn]);

    // ✅ Auto capture (login/attendance mode)
    const captureFaceAuto = async () => {
        if (capturingRef.current) return;
        capturingRef.current = true;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setCapturing(true);
        setError('');

        await new Promise(r => setTimeout(r, 300));

        try {
            const video = videoRef.current;
            let detection = null;

            for (let i = 0; i < 5; i++) {
                try {
                    detection = await faceapi
                        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    if (detection) break;
                } catch (e) {
                    console.log('Retry', i, e.message);
                }
                await new Promise(r => setTimeout(r, 300));
            }

            if (!detection) {
                setError('Could not get face data. Please try again in good lighting.');
                setCapturing(false);
                capturingRef.current = false;
                faceDetectedRef.current = false;
                return;
            }

            const descriptor = Array.from(detection.descriptor);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            tempCanvas.getContext('2d').drawImage(video, 0, 0);

            tempCanvas.toBlob((blob) => {
                const file = new File([blob], `face-${Date.now()}.jpg`, { type: 'image/jpeg' });
                onFaceDetected && onFaceDetected({ faceImage: file, faceDescriptor: descriptor, detection });
                setCapturing(false);
                capturingRef.current = false;
                stopCamera();
            }, 'image/jpeg', 0.95);

        } catch (err) {
            console.error('Capture error:', err);
            setError('Failed to capture. Please try again.');
            setCapturing(false);
            capturingRef.current = false;
            faceDetectedRef.current = false;
        }
    };

    // Manual capture (register mode)
    const captureFace = async () => {
        if (!faceDetected) {
            setError('No face detected. Please position your face in the frame.');
            return;
        }
        await captureFaceAuto();
    };

    return (
        <div style={styles.container}>
            {/* Header - login/attendance mode-ல hide பண்ணு (facelogin.jsx already shows title) */}
            {mode === 'register' && (
                <div style={styles.header}>
                    <h3 style={styles.title}>📷 Register Your Face</h3>
                    <p style={styles.subtitle}>Position your face clearly and click capture</p>
                </div>
            )}

            {error && <div style={styles.alertError}>⚠️ {error}</div>}

            {!modelsLoaded && (
                <div style={styles.loadingBox}>
                    <div style={styles.spinner}></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading face detection models...</p>
                </div>
            )}

            <div style={styles.videoWrapper}>
                <video
                    ref={videoRef}
                    autoPlay muted playsInline
                    style={{ ...styles.video, display: isCameraOn ? 'block' : 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ ...styles.canvas, display: isCameraOn ? 'block' : 'none' }}
                />
                {!isCameraOn && modelsLoaded && (
                    <div style={styles.placeholder}>
                        <span style={{ fontSize: '3rem' }}>📷</span>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            {modelsLoaded ? 'Starting camera...' : 'Loading models...'}
                        </p>
                    </div>
                )}

                {/* ✅ Countdown overlay */}
                {countdown !== null && (
                    <div style={styles.countdownOverlay}>
                        <div style={styles.countdownCircle}>{countdown}</div>
                        <p style={{ color: 'white', marginTop: '0.5rem', fontSize: '0.9rem' }}>Scanning...</p>
                    </div>
                )}

                {/* ✅ Capturing overlay */}
                {capturing && (
                    <div style={styles.countdownOverlay}>
                        <div style={styles.spinnerWhite}></div>
                        <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem' }}>Verifying face...</p>
                    </div>
                )}
            </div>

            {isCameraOn && !capturing && (
                <div style={faceDetected ? styles.detectedBadge : styles.detectingBadge}>
                    {faceDetected
                        ? (countdown !== null ? `✓ Face Detected - Scanning in ${countdown}s` : '✓ Face Detected!')
                        : '🔍 Position your face in the camera...'}
                </div>
            )}

            {/* Buttons - login mode-ல cancel மட்டும், register mode-ல full buttons */}
            <div style={styles.btnRow}>
                {mode === 'register' && (
                    <>
                        {!isCameraOn ? (
                            <button onClick={startCamera} disabled={!modelsLoaded}
                                style={{ ...styles.btn, background: '#3b82f6', opacity: modelsLoaded ? 1 : 0.5 }}>
                                📷 Start Camera
                            </button>
                        ) : (
                            <>
                                <button onClick={captureFace} disabled={!faceDetected || capturing}
                                    style={{ ...styles.btn, background: '#10b981', opacity: (!faceDetected || capturing) ? 0.5 : 1 }}>
                                    {capturing ? '⏳ Processing...' : '📸 Capture & Register'}
                                </button>
                                <button onClick={stopCamera}
                                    style={{ ...styles.btn, background: '#6b7280' }}>
                                    ✕ Cancel
                                </button>
                            </>
                        )}
                    </>
                )}

                {(mode === 'login' || mode === 'attendance') && isCameraOn && !capturing && (
                    <button onClick={stopCamera}
                        style={{ ...styles.btn, background: '#6b7280', fontSize: '0.85rem' }}>
                        ✕ Cancel
                    </button>
                )}
            </div>

            <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
    );
};

const styles = {
    container: { padding: '0.5rem', maxWidth: '680px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '1rem' },
    title: { fontSize: '1.3rem', fontWeight: '600', margin: '0 0 0.3rem' },
    subtitle: { color: '#6b7280', margin: 0, fontSize: '0.85rem' },
    alertError: {
        background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5',
        borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem',
    },
    loadingBox: { textAlign: 'center', padding: '1rem' },
    spinner: {
        border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6',
        borderRadius: '50%', width: '40px', height: '40px',
        animation: 'spin 1s linear infinite', margin: '0 auto',
    },
    spinnerWhite: {
        border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white',
        borderRadius: '50%', width: '50px', height: '50px',
        animation: 'spin 1s linear infinite', margin: '0 auto',
    },
    videoWrapper: {
        position: 'relative', width: '100%', maxWidth: '640px',
        margin: '0 auto', background: '#1f2937', borderRadius: '12px',
        overflow: 'hidden', minHeight: '240px',
    },
    video: { width: '100%', display: 'block' },
    canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    placeholder: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: '240px',
    },
    countdownOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
    },
    countdownCircle: {
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(16,185,129,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', fontWeight: '700', color: 'white',
        border: '4px solid white',
    },
    detectedBadge: {
        textAlign: 'center', margin: '0.75rem auto', padding: '0.5rem 1rem',
        background: '#d1fae5', color: '#065f46', borderRadius: '8px',
        fontWeight: '600', maxWidth: '320px', fontSize: '0.9rem',
    },
    detectingBadge: {
        textAlign: 'center', margin: '0.75rem auto', padding: '0.5rem 1rem',
        background: '#fef3c7', color: '#92400e', borderRadius: '8px',
        maxWidth: '320px', fontSize: '0.9rem',
    },
    btnRow: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem' },
    btn: {
        padding: '0.6rem 1.2rem', color: 'white', border: 'none',
        borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem',
    },
};

export default FaceCapture;