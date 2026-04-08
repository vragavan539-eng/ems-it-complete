import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const FaceScanner = ({ onDetect, buttonLabel = "Scan Face", autoScan = false }) => {
  const videoRef = useRef();
  const intervalRef = useRef();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('⏳ Loading models...');

  useEffect(() => {
    loadModels();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setReady(true);
      if (autoScan) {
        setStatus('📷 Auto scanning... முகம் camera-ல வையுங்க');
        setTimeout(() => startAutoScan(), 1000);
      } else {
        setStatus('✅ Camera ready! Click Scan.');
      }
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  const startAutoScan = () => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) {
          clearInterval(intervalRef.current);
          setStatus('✅ Face detected! Logging in...');
          onDetect(Array.from(detection.descriptor));
        } else {
          setStatus('📷 Scanning... முகம் camera-ல வையுங்க');
        }
      } catch (err) {
        setStatus('❌ Scan error: ' + err.message);
        clearInterval(intervalRef.current);
      }
    }, 1500);
  };

  const handleScan = async () => {
    setStatus('🔍 Detecting face...');
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) {
        setStatus('❌ No face detected! Try again.');
        return;
      }
      setStatus('✅ Face detected!');
      onDetect(Array.from(detection.descriptor));
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', padding:'16px', border:'2px solid #4f46e5', borderRadius:'12px', background:'#f5f3ff' }}>
      <video ref={videoRef} autoPlay muted width={320} height={240} style={{ borderRadius:'8px', background:'#000' }} />
      {!autoScan && (
        <button onClick={handleScan} disabled={!ready}
          style={{ padding:'10px 24px', background: ready ? '#4f46e5' : '#a5b4fc', color:'#fff', border:'none', borderRadius:'8px', cursor: ready ? 'pointer' : 'not-allowed', fontWeight:'bold', fontSize:'14px' }}>
          📷 {buttonLabel}
        </button>
      )}
      {autoScan && ready && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#4f46e5', animation:'pulse 1s infinite' }} />
          <span style={{ fontSize:13, color:'#4f46e5', fontWeight:600 }}>Auto Scanning...</span>
          <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>
        </div>
      )}
      <p style={{ margin:0, fontSize:'13px', color: status.includes('❌') ? '#dc2626' : '#16a34a' }}>
        {status}
      </p>
    </div>
  );
};

export default FaceScanner;