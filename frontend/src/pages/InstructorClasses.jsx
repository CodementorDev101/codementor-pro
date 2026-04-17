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

    // Create exercise for class
    const [showExerciseForm, setShowExerciseForm] = useState(false);
    const [exerciseForm, setExerciseForm] = useState({
        title: '', description: '', difficulty: 'easy',
        language: 'python', time_limit: 5, memory_limit: 128000,
    });
    const [testCases, setTestCases] = useState([
        { input: '', expected_output: '', is_sample: true, points: 10 }
    ]);
    const [exerciseLoading, setExerciseLoading] = useState(false);
    const [classExercises, setClassExercises] = useState([]);

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
        setShowExerciseForm(false);
        setClassExercises([]);
        fetchClassDetails(c.id);
        fetchClassExercises(c.id);
    };

    const fetchClassExercises = async (classId) => {
        try {
            const res = await api.get(`/exercises/class/${classId}`);
            if (res.data.success) setClassExercises(res.data.exercises);
        } catch {
            setClassExercises([]);
        }
    };

    const handleExerciseFormChange = (e) => {
        setExerciseForm({ ...exerciseForm, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', expected_output: '', is_sample: false, points: 10 }]);
    };

    const removeTestCase = (index) => {
        if (testCases.length > 1) setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleCreateExercise = async () => {
        if (!exerciseForm.title.trim() || !exerciseForm.description.trim()) {
            toast.error('Title and description are required.'); return;
        }
        if (testCases.some(tc => !tc.expected_output.trim())) {
            toast.error('All test cases must have expected output.'); return;
        }
        setExerciseLoading(true);
        const t = toast.loading('Creating exercise...');
        try {
            await api.post('/exercises', {
                ...exerciseForm,
                class_id: selectedClass.id,
                test_cases: testCases,
            });
            toast.success('Exercise created!', { id: t });
            setShowExerciseForm(false);
            setExerciseForm({ title: '', description: '', difficulty: 'easy', language: 'python', time_limit: 5, memory_limit: 128000 });
            setTestCases([{ input: '', expected_output: '', is_sample: true, points: 10 }]);
            fetchClassExercises(selectedClass.id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create exercise.', { id: t });
        } finally {
            setExerciseLoading(false);
        }
    };

    const handleDeleteExercise = async (exerciseId, exerciseTitle) => {
        if (!window.confirm(`Delete "${exerciseTitle}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/exercises/${exerciseId}`);
            toast.success('Exercise deleted.');
            fetchClassExercises(selectedClass.id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete exercise.');
        }
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

                                    {/* Class Exercises */}
                                    <div style={cardStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📝</span> Class Exercises
                                                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '2px 10px', borderRadius: '9999px', fontSize: '13px' }}>{classExercises.length}</span>
                                            </h3>
                                            <button
                                                onClick={() => setShowExerciseForm(!showExerciseForm)}
                                                style={{ padding: '8px 16px', background: showExerciseForm ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', border: showExerciseForm ? '1px solid rgba(239,68,68,0.3)' : 'none', color: showExerciseForm ? '#ef4444' : '#0f172a', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                {showExerciseForm ? '✕ Cancel' : '+ Add Exercise'}
                                            </button>
                                        </div>

                                        {/* Create Exercise Form */}
                                        {showExerciseForm && (
                                            <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(251,191,36,0.15)' }}>
                                                <p style={{ color: '#fbbf24', fontWeight: '700', fontSize: '14px', margin: '0 0 16px' }}>🔒 New Private Exercise</p>

                                                {/* Title */}
                                                <div style={{ marginBottom: '12px' }}>
                                                    <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Title *</label>
                                                    <input name="title" value={exerciseForm.title} onChange={handleExerciseFormChange} placeholder="e.g. Fibonacci Sequence" style={{ ...inputStyle, fontSize: '13px' }} />
                                                </div>

                                                {/* Description */}
                                                <div style={{ marginBottom: '12px' }}>
                                                    <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Description *</label>
                                                    <textarea name="description" value={exerciseForm.description} onChange={handleExerciseFormChange} placeholder="Describe the problem..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', lineHeight: '1.5', fontSize: '13px' }} />
                                                </div>

                                                {/* Difficulty & Language */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Difficulty</label>
                                                        <select name="difficulty" value={exerciseForm.difficulty} onChange={handleExerciseFormChange} style={{ ...inputStyle, cursor: 'pointer', fontSize: '13px' }}>
                                                            <option value="easy">Easy</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="hard">Hard</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Language</label>
                                                        <select name="language" value={exerciseForm.language} onChange={handleExerciseFormChange} style={{ ...inputStyle, cursor: 'pointer', fontSize: '13px' }}>
                                                            <option value="python">Python</option>
                                                            <option value="javascript">JavaScript</option>
                                                            <option value="java">Java</option>
                                                            <option value="cpp">C++</option>
                                                            <option value="c">C</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Time & Memory */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Time Limit (s)</label>
                                                        <input type="number" name="time_limit" min="1" max="60" value={exerciseForm.time_limit} onChange={handleExerciseFormChange} style={{ ...inputStyle, fontSize: '13px' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Memory Limit (KB)</label>
                                                        <input type="number" name="memory_limit" min="1000" step="1000" value={exerciseForm.memory_limit} onChange={handleExerciseFormChange} style={{ ...inputStyle, fontSize: '13px' }} />
                                                    </div>
                                                </div>

                                                {/* Test Cases */}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                        <label style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Test Cases</label>
                                                        <button type="button" onClick={addTestCase} style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {testCases.map((tc, index) => (
                                                            <div key={index} style={{ background: 'rgba(15,23,42,0.6)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}>Test Case {index + 1}</span>
                                                                    {testCases.length > 1 && (
                                                                        <button type="button" onClick={() => removeTestCase(index)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Remove</button>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                                    <div>
                                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>Input (optional)</label>
                                                                        <input value={tc.input} onChange={e => handleTestCaseChange(index, 'input', e.target.value)} placeholder="e.g. 5 10" style={{ ...inputStyle, fontSize: '12px', padding: '6px 10px' }} />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>Expected Output *</label>
                                                                        <input value={tc.expected_output} onChange={e => handleTestCaseChange(index, 'expected_output', e.target.value)} placeholder="e.g. 15" style={{ ...inputStyle, fontSize: '12px', padding: '6px 10px' }} />
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                                                        <input type="checkbox" checked={tc.is_sample} onChange={e => handleTestCaseChange(index, 'is_sample', e.target.checked)} style={{ accentColor: '#fbbf24' }} />
                                                                        Show as sample
                                                                    </label>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                                                        Points:
                                                                        <input type="number" min="1" value={tc.points} onChange={e => handleTestCaseChange(index, 'points', parseInt(e.target.value))} style={{ ...inputStyle, width: '60px', padding: '4px 8px', fontSize: '12px' }} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleCreateExercise}
                                                    disabled={exerciseLoading}
                                                    style={{ width: '100%', padding: '12px', background: exerciseLoading ? 'rgba(251,191,36,0.4)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: exerciseLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    {exerciseLoading && <div style={{ width: '14px', height: '14px', border: '2px solid #0f172a', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
                                                    {exerciseLoading ? 'Creating...' : '✓ Create Exercise'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Exercises List */}
                                        {classExercises.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
                                                <p style={{ fontSize: '14px', margin: 0 }}>No exercises yet. Click "+ Add Exercise" to create one.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {classExercises.map(ex => (
                                                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ color: '#fff', fontWeight: '600', fontSize: '14px', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.title}</p>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '11px', color: ex.difficulty === 'easy' ? '#10b981' : ex.difficulty === 'medium' ? '#f59e0b' : '#ef4444', background: ex.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : ex.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: '600', textTransform: 'capitalize' }}>{ex.difficulty}</span>
                                                                <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', textTransform: 'uppercase' }}>{ex.language}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                                                            <button onClick={() => navigate(`/exercise/${ex.id}`)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                                                            <button onClick={() => handleDeleteExercise(ex.id, ex.title)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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