import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link.');
        }
    }, [token]);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in both fields.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/auth/reset-password`, { token, newPassword });
            setDone(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Reset failed. Link may have expired.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a, #1a2744, #2a1a4e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <Toaster position="top-center" />

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '440px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '32px' }}>🔑</span>
                    <h1 style={{ color: '#f59e0b', fontSize: '24px', margin: '8px 0 4px' }}>
                        Reset Your Password
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                        Enter your new password below.
                    </p>
                </div>

                {!done ? (
                    <>
                        <input
                            type="password"
                            placeholder="New password (min. 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#ffffff',
                                fontSize: '15px',
                                marginBottom: '12px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#ffffff',
                                fontSize: '15px',
                                marginBottom: '16px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />

                        <button
                            onClick={handleReset}
                            disabled={loading || !token}
                            style={{
                                width: '100%',
                                padding: '13px',
                                borderRadius: '8px',
                                border: 'none',
                                background: loading ? '#92400e' : '#f59e0b',
                                color: '#0f172a',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </>
                ) : (
                    <div style={{
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        borderRadius: '10px',
                        padding: '20px',
                        color: '#4ade80',
                        fontSize: '15px'
                    }}>
                        ✅ Password reset successful!<br />
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                            Redirecting you to login in 3 seconds...
                        </span>
                    </div>
                )}

                <p style={{ marginTop: '24px', color: '#94a3b8', fontSize: '14px' }}>
                    <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' }}>
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}