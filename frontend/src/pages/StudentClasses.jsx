import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const StudentClasses = () => {
    const navigate = useNavigate();

    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);

    // Join via code
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    // Leave confirm
    const [leaveTarget, setLeaveTarget] = useState(null);
    const [leaveLoading, setLeaveLoading] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/classes/student/my-classes');
            if (res.data.success) setMemberships(res.data.memberships);
        } catch {
            toast.error('Failed to load your classes.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { toast.error('Please enter an invite code.'); return; }
        setJoinLoading(true);
        try {
            const res = await api.post('/classes/join', { invite_code: joinCode.trim().toUpperCase() });
            if (res.data.success) {
                toast.success(res.data.message);
                setJoinCode('');
                fetchMyClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join class.');
        } finally {
            setJoinLoading(false);
        }
    };

    const handleRespond = async (classId, action) => {
        try {
            const res = await api.post(`/classes/${classId}/respond`, { action });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchMyClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to respond to invite.');
        }
    };

    const handleLeave = async () => {
        setLeaveLoading(true);
        try {
            const res = await api.delete(`/classes/${leaveTarget.class.id}/leave`);
            if (res.data.success) {
                toast.success('You have left the class.');
                setLeaveTarget(null);
                fetchMyClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to leave class.');
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const cardStyle = {
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
    };

    const btnStyle = (color = '#fbbf24') => ({
        background: `rgba(${color === '#fbbf24' ? '251,191,36' : color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : color === '#ef4444' ? '239,68,68' : '107,114,128'}, 0.15)`,
        border: `1px solid rgba(${color === '#fbbf24' ? '251,191,36' : color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : color === '#ef4444' ? '239,68,68' : '107,114,128'}, 0.3)`,
        color,
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
    });

    const activeClasses = memberships.filter(m => m.status === 'active');
    const pendingInvites = memberships.filter(m => m.status === 'pending');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Background orbs */}
            <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)', borderRadius: '50%', top: '-250px', right: '-250px' }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%', bottom: '-200px', left: '-200px' }} />

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

            {/* Leave Confirm Modal */}
            {leaveTarget && (
                <div onClick={() => setLeaveTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚪</div>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Leave Class?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                            Are you sure you want to leave <strong style={{ color: '#fff' }}>{leaveTarget.class.name}</strong>? You can rejoin later using the invite code.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setLeaveTarget(null)} style={btnStyle('#3b82f6')}>Cancel</button>
                            <button onClick={handleLeave} disabled={leaveLoading} style={{ ...btnStyle('#ef4444'), opacity: leaveLoading ? 0.6 : 1 }}>
                                {leaveLoading ? 'Leaving...' : 'Yes, Leave'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    CodeMentor+ Pro
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>student</span>
                    <button onClick={() => navigate('/dashboard')} style={btnStyle('#fbbf24')}>🏠 Dashboard</button>
                    <button onClick={() => navigate('/profile')} style={btnStyle('#a855f7')}>Profile</button>
                    <button onClick={handleLogout} style={btnStyle('#ef4444')}>Logout</button>
                </div>
            </nav>

            {/* Main content */}
            <div style={{ padding: '2rem', position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>

                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '2rem' }}>🎓</span>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>My Classes</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Join a class using an invite code or manage your current classes</p>
                </div>

                {/* Join via Code Card */}
                <div style={{ ...cardStyle, marginBottom: '1.5rem', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <h3 style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔑 Join a Class
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 14px' }}>
                        Enter the 8-character invite code given by your instructor.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="e.g. ABC12345"
                            maxLength={8}
                            onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            style={{
                                flex: 1, padding: '12px 16px',
                                background: 'rgba(15,23,42,0.6)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', color: '#fff',
                                fontSize: '18px', fontWeight: '700',
                                letterSpacing: '4px', outline: 'none',
                                fontFamily: 'monospace', textTransform: 'uppercase',
                            }}
                        />
                        <button
                            onClick={handleJoin}
                            disabled={joinLoading}
                            style={{ padding: '12px 24px', background: joinLoading ? 'rgba(251,191,36,0.3)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: joinLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                        >
                            {joinLoading ? 'Joining...' : 'Join Class'}
                        </button>
                    </div>
                </div>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <div style={{ ...cardStyle, marginBottom: '1.5rem', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📬</span> Pending Invites
                            <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 10px', borderRadius: '9999px', fontSize: '13px' }}>{pendingInvites.length}</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pendingInvites.map(m => (
                                <div key={m.membership_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(251,191,36,0.04)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.15)', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>{m.class.name}</p>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                                            Instructor: {m.class.instructor?.first_name} {m.class.instructor?.last_name}
                                        </p>
                                        {m.class.description && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0' }}>{m.class.description}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleRespond(m.class.id, 'accept')}
                                            style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            ✓ Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(m.class.id, 'decline')}
                                            style={btnStyle('#ef4444')}
                                        >
                                            ✕ Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Classes */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🏫</span> My Active Classes
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 10px', borderRadius: '9999px', fontSize: '13px' }}>{activeClasses.length}</span>
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(251,191,36,0.3)', borderTop: '3px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                        </div>
                    ) : activeClasses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>You haven't joined any classes yet.</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Enter an invite code above to get started.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {activeClasses.map(m => (
                                <div key={m.membership_id} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                        <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>{m.class.name}</p>
                                        {m.class.description && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 8px' }}>{m.class.description}</p>}
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
                                            👨‍🏫 {m.class.instructor?.first_name} {m.class.instructor?.last_name}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: '#10b981', fontWeight: '700', fontSize: '16px' }}>{m.class.member_count}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>members</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '11px', color: m.invited_by ? '#a855f7' : '#3b82f6', background: m.invited_by ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '6px', marginTop: '2px' }}>
                                                    {m.invited_by ? 'Invited' : 'Via Code'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setLeaveTarget(m)}
                                            style={{ ...btnStyle('#ef4444'), padding: '6px 12px', fontSize: '12px' }}
                                        >
                                            🚪 Leave
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentClasses;