import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const InstructorClasses = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classDetails, setClassDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Create class form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Invite student form
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/classes/my-classes');
            if (res.data.success) setClasses(res.data.classes);
        } catch {
            toast.error('Failed to load classes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassDetails = async (classId) => {
        setDetailsLoading(true);
        try {
            const res = await api.get(`/classes/${classId}`);
            if (res.data.success) setClassDetails(res.data);
        } catch {
            toast.error('Failed to load class details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleSelectClass = (c) => {
        setSelectedClass(c);
        setClassDetails(null);
        setInviteEmail('');
        fetchClassDetails(c.id);
    };

    const handleCreateClass = async () => {
        if (!createName.trim()) { toast.error('Class name is required.'); return; }
        setCreateLoading(true);
        try {
            const res = await api.post('/classes', { name: createName, description: createDescription });
            if (res.data.success) {
                toast.success('Class created successfully!');
                setCreateName('');
                setCreateDescription('');
                setShowCreateForm(false);
                await fetchClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create class.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleInviteStudent = async () => {
        if (!inviteEmail.trim()) { toast.error('Please enter a student email.'); return; }
        setInviteLoading(true);
        try {
            const res = await api.post(`/classes/${selectedClass.id}/invite`, { email: inviteEmail });
            if (res.data.success) {
                toast.success(res.data.message);
                setInviteEmail('');
                fetchClassDetails(selectedClass.id);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send invite.');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (studentId, studentName) => {
        if (!window.confirm(`Remove ${studentName} from this class?`)) return;
        try {
            const res = await api.delete(`/classes/${selectedClass.id}/members/${studentId}`);
            if (res.data.success) {
                toast.success('Student removed.');
                fetchClassDetails(selectedClass.id);
                fetchClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove student.');
        }
    };

    const handleDeleteClass = async () => {
        setDeleteLoading(true);
        try {
            const res = await api.delete(`/classes/${deleteTarget.id}`);
            if (res.data.success) {
                toast.success('Class deleted.');
                setDeleteTarget(null);
                setSelectedClass(null);
                setClassDetails(null);
                fetchClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete class.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Invite code "${code}" copied!`);
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
        background: `rgba(${color === '#fbbf24' ? '251,191,36' : color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : '239,68,68'}, 0.15)`,
        border: `1px solid rgba(${color === '#fbbf24' ? '251,191,36' : color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : '239,68,68'}, 0.3)`,
        color,
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
    });

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const activeMembers = classDetails?.members?.filter(m => m.status === 'active') || [];
    const pendingMembers = classDetails?.members?.filter(m => m.status === 'pending') || [];

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
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Delete Class?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                            "<strong style={{ color: '#fff' }}>{deleteTarget.name}</strong>" and all its memberships will be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteTarget(null)} style={btnStyle('#3b82f6')}>Cancel</button>
                            <button onClick={handleDeleteClass} disabled={deleteLoading} style={{ ...btnStyle('#ef4444'), opacity: deleteLoading ? 0.6 : 1 }}>
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
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
                    <span style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>instructor</span>
                    <button onClick={() => navigate('/instructor-dashboard')} style={btnStyle('#fbbf24')}>📊 Dashboard</button>
                    <button onClick={() => navigate('/dashboard')} style={btnStyle('#3b82f6')}>🏠 Home</button>
                    <button onClick={() => navigate('/profile')} style={btnStyle('#a855f7')}>Profile</button>
                    <button onClick={handleLogout} style={btnStyle('#ef4444')}>Logout</button>
                </div>
            </nav>

            {/* Main content */}
            <div style={{ padding: '2rem', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '2rem' }}>🏫</span>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>My Private Classes</h1>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Create classes, share invite codes, and manage your students</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(251,191,36,0.3)' }}
                    >
                        + New Class
                    </button>
                </div>

                {/* Create Class Modal */}
                {showCreateForm && (
                    <div onClick={() => setShowCreateForm(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%' }}>
                            <h2 style={{ color: '#fbbf24', fontSize: '20px', fontWeight: '700', marginBottom: '24px', marginTop: 0 }}>🏫 Create New Class</h2>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Class Name <span style={{ color: '#fbbf24' }}>*</span></label>
                                <input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g. Python Fundamentals — Batch 2026" style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Description <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span></label>
                                <textarea value={createDescription} onChange={e => setCreateDescription(e.target.value)} placeholder="Brief description of this class..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', lineHeight: '1.5' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowCreateForm(false)} style={btnStyle('#6b7280')}>Cancel</button>
                                <button onClick={handleCreateClass} disabled={createLoading} style={{ padding: '0.5rem 1.5rem', background: createLoading ? 'rgba(251,191,36,0.4)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: createLoading ? 'not-allowed' : 'pointer' }}>
                                    {createLoading ? 'Creating...' : 'Create Class'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedClass ? '360px 1fr' : '1fr', gap: '1.5rem' }}>

                    {/* Left: Class List */}
                    <div>
                        {loading ? (
                            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(251,191,36,0.3)', borderTop: '3px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                            </div>
                        ) : classes.length === 0 ? (
                            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>No classes yet. Create your first one!</p>
                                <button onClick={() => setShowCreateForm(true)} style={{ padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                                    + Create Class
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {classes.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelectClass(c)}
                                        style={{
                                            ...cardStyle,
                                            cursor: 'pointer',
                                            border: selectedClass?.id === c.id ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                            background: selectedClass?.id === c.id ? 'rgba(251,191,36,0.08)' : 'rgba(30,41,59,0.8)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                                                {c.description && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span
                                                        onClick={e => { e.stopPropagation(); handleCopyCode(c.invite_code); }}
                                                        style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'monospace' }}
                                                        title="Click to copy"
                                                    >
                                                        {c.invite_code}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>📋 copy</span>
                                                </div>
                                            </div>
                                            <div style={{ marginLeft: '12px', textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ color: '#10b981', fontWeight: '700', fontSize: '18px' }}>{c.member_count}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>members</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Class Details */}
                    {selectedClass && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Class Header Card */}
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>{selectedClass.name}</h2>
                                        {selectedClass.description && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 16px' }}>{selectedClass.description}</p>}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Invite Code:</span>
                                            <span
                                                onClick={() => handleCopyCode(selectedClass.invite_code)}
                                                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24', padding: '6px 16px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', letterSpacing: '4px', cursor: 'pointer', fontFamily: 'monospace' }}
                                                title="Click to copy"
                                            >
                                                {selectedClass.invite_code}
                                            </span>
                                            <button onClick={() => handleCopyCode(selectedClass.invite_code)} style={btnStyle('#fbbf24')}>📋 Copy Code</button>
                                        </div>
                                    </div>
                                    <button onClick={() => setDeleteTarget(selectedClass)} style={btnStyle('#ef4444')}>🗑️ Delete</button>
                                </div>
                            </div>

                            {/* Invite Student Card */}
                            <div style={cardStyle}>
                                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>✉️</span> Manually Invite a Student
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 14px' }}>
                                    Enter the student's registered email. They will receive a pending invite and must accept it to join.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="student@email.com"
                                        onKeyDown={e => e.key === 'Enter' && handleInviteStudent()}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                    <button
                                        onClick={handleInviteStudent}
                                        disabled={inviteLoading}
                                        style={{ padding: '10px 20px', background: inviteLoading ? 'rgba(251,191,36,0.3)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: inviteLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        {inviteLoading ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </div>

                            {detailsLoading ? (
                                <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(251,191,36,0.3)', borderTop: '3px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                                </div>
                            ) : (
                                <>
                                    {/* Active Members */}
                                    <div style={cardStyle}>
                                        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>👥</span> Active Members
                                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 10px', borderRadius: '9999px', fontSize: '13px' }}>{activeMembers.length}</span>
                                        </h3>
                                        {activeMembers.length === 0 ? (
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '1.5rem' }}>No active members yet.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {activeMembers.map(m => (
                                                    <div key={m.membership_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <div>
                                                            <p style={{ color: '#fff', fontWeight: '600', fontSize: '14px', margin: '0 0 2px' }}>{m.student?.first_name} {m.student?.last_name}</p>
                                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{m.student?.email}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ fontSize: '11px', color: m.invited_by ? '#a855f7' : '#3b82f6', background: m.invited_by ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                                                {m.invited_by ? 'Invited' : 'Via Code'}
                                                            </span>
                                                            <button onClick={() => handleRemoveMember(m.student_id, `${m.student?.first_name} ${m.student?.last_name}`)} style={{ ...btnStyle('#ef4444'), padding: '4px 10px', fontSize: '12px' }}>Remove</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pending Invites */}
                                    {pendingMembers.length > 0 && (
                                        <div style={cardStyle}>
                                            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>⏳</span> Pending Invites
                                                <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 10px', borderRadius: '9999px', fontSize: '13px' }}>{pendingMembers.length}</span>
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {pendingMembers.map(m => (
                                                    <div key={m.membership_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(251,191,36,0.04)', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.15)' }}>
                                                        <div>
                                                            <p style={{ color: '#fff', fontWeight: '600', fontSize: '14px', margin: '0 0 2px' }}>{m.student?.first_name} {m.student?.last_name}</p>
                                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{m.student?.email}</p>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 10px', borderRadius: '6px' }}>Awaiting Response</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorClasses;