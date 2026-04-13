import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            toast.error('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/auth/forgot-password`, { email });
            setSent(true);
            toast.success('Reset link sent! Check your email.');
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
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
                <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '32px' }}>🔐</span>
                    <h1 style={{ color: '#f59e0b', fontSize: '24px', margin: '8px 0 4px' }}>
                        Forgot Password?
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {!sent ? (
                    <>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
                            onClick={handleSubmit}
                            disabled={loading}
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
                            {loading ? 'Sending...' : 'Send Reset Link'}
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
                        ✅ Reset link sent to <strong>{email}</strong>.<br />
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                            Check your inbox (and spam folder just in case).
                        </span>
                    </div>
                )}

                <p style={{ marginTop: '24px', color: '#94a3b8', fontSize: '14px' }}>
                    Remembered it?{' '}
                    <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' }}>
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}