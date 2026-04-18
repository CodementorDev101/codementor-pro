import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instructorAnalyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [performance, setPerformance] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, exercisesRes, submissionsRes, performanceRes] = await Promise.all([
        instructorAnalyticsAPI.getStats(),
        instructorAnalyticsAPI.getExercises(),
        instructorAnalyticsAPI.getSubmissions(10),
        instructorAnalyticsAPI.getPerformance()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (exercisesRes.data.success) {
        setExercises(exercisesRes.data.data);
      }
      if (submissionsRes.data.success) {
        setSubmissions(submissionsRes.data.data);
      }
      if (performanceRes.data.success) {
        setPerformance(performanceRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'error': return '#ef4444';
      case 'timeout': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(251, 191, 36, 0.3)',
          borderTop: '4px solid #fbbf24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Orbs */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-250px',
        right: '-250px',
        animation: 'float 20s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-200px',
        left: '-200px',
        animation: 'float 15s ease-in-out infinite reverse'
      }}></div>

      {/* Navigation Bar */}
      <nav style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          CodeMentor+ Pro
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User info card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>
                {user?.first_name} {user?.last_name}
              </span>
              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' }}>
                Instructor
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate('/profile')}
            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            👤 Profile
          </button>

          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>👨‍🏫</span>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff',
              margin: 0
            }}>
              Instructor Dashboard
            </h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Manage your exercises and track student performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Exercises */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(251, 191, 36, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.25rem' }}>
              {stats?.totalExercises || 0}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Total Exercises
            </div>
          </div>

          {/* Total Submissions */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.25rem' }}>
              {stats?.totalSubmissions || 0}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Total Submissions
            </div>
          </div>

          {/* Success Rate */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>
              {stats?.successRate || 0}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Success Rate
            </div>
          </div>

          {/* Average Score */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.25rem' }}>
              {stats?.averageScore || 0}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Average Score
            </div>
          </div>

          {/* Unique Students */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(236, 72, 153, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899', marginBottom: '0.25rem' }}>
              {stats?.uniqueStudents || 0}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Active Students
            </div>
          </div>
        </div>

        {/* Exercise Performance Chart */}
        {performance.length > 0 && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📈</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                Exercise Performance
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="title"
                  stroke="rgba(255, 255, 255, 0.7)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.7)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="attempts" fill="#3b82f6" name="Total Attempts" />
                <Bar dataKey="passed" fill="#10b981" name="Passed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* My Exercises Table */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              My Exercises
            </h2>
          </div>

          {exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p>No exercises created yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Title</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Difficulty</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Language</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Submissions</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Success Rate</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise) => (
                    <tr key={exercise.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem', color: '#fff' }}>{exercise.title}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: `${getDifficultyColor(exercise.difficulty)}22`,
                          color: getDifficultyColor(exercise.difficulty),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {exercise.language}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#3b82f6', fontWeight: 'bold' }}>
                        {exercise.totalSubmissions}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          color: exercise.successRate > 60 ? '#10b981' : exercise.successRate > 30 ? '#f59e0b' : '#ef4444',
                          fontWeight: 'bold'
                        }}>
                          {exercise.successRate}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/exercise/${exercise.id}`)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Submissions Table */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              Recent Submissions
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p>No submissions yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Student</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Exercise</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Score</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: '#fff', fontWeight: '500' }}>{submission.student.name}</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>{submission.student.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: '#fff' }}>{submission.exercise.title}</div>
                        <span style={{
                          background: `${getDifficultyColor(submission.exercise.difficulty)}22`,
                          color: getDifficultyColor(submission.exercise.difficulty),
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {submission.exercise.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: `${getStatusColor(submission.status)}22`,
                          color: getStatusColor(submission.status),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {submission.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {submission.score}
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                        {formatDate(submission.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;