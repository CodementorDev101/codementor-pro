import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ClassExercises = () => {
    const navigate = useNavigate();
    const { class_id } = useParams();

    const [classInfo, setClassInfo] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassExercises();
    }, [class_id]);

    const fetchClassExercises = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/exercises/class/${class_id}`);
            if (res.data.success) {
                setClassInfo(res.data.class);
                setExercises(res.data.exercises);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load class exercises.');
            navigate('/my-classes');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return { bg: '#10b981', text: '#ffffff' };
            case 'medium': return { bg: '#f59e0b', text: '#ffffff' };
            case 'hard': return { bg: '#ef4444', text: '#ffffff' };
            default: return { bg: '#6b7280', text: '#ffffff' };
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ width: '60px', height: '60px', border: '4px solid rgba(251,191,36,0.3)', borderTop: '4px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>

            {/* Navbar */}
            <nav style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    CodeMentor+ Pro
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>student</span>
                    <button onClick={() => navigate('/my-classes')} style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                        ← My Classes
                    </button>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                        🏠 Dashboard
                    </button>
                    <button onClick={() => navigate('/profile')} style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                        Profile
                    </button>
                    <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <div style={{ padding: '2rem', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>

                {/* Class Header */}
                {classInfo && (
                    <div style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>🏫</span>
                            <div>
                                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{classInfo.name}</h1>
                                {classInfo.description && <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '15px' }}>{classInfo.description}</p>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                            <span style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>
                                🔒 Private Class
                            </span>
                            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>
                                📚 {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}

                {/* Exercises */}
                <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '0 0 1.5rem' }}>
                        📝 Class Exercises
                    </h2>
                </div>

                {exercises.length === 0 ? (
                    <div style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', marginBottom: '0.5rem' }}>No exercises yet.</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Your instructor hasn't added any exercises to this class yet. Check back later!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {exercises.map((exercise) => {
                            const diffColor = getDifficultyColor(exercise.difficulty);
                            return (
                                <div
                                    key={exercise.id}
                                    onClick={() => navigate(`/exercise/${exercise.id}`)}
                                    style={{
                                        background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)',
                                        borderRadius: '16px', padding: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer', transition: 'all 0.3s ease',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,191,36,0.2)';
                                        e.currentTarget.style.border = '1px solid rgba(251,191,36,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {/* Private badge */}
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                        🔒 Private
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingRight: '70px' }}>
                                        <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#fff', margin: 0 }}>{exercise.title}</h3>
                                    </div>

                                    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', background: diffColor.bg, color: diffColor.text, marginBottom: '10px', textTransform: 'capitalize' }}>
                                        {exercise.difficulty}
                                    </span>

                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {exercise.description}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {exercise.language}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                            ⏱ {exercise.time_limit}s
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassExercises;