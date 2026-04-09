import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseAPI } from '../services/api';
import toast from 'react-hot-toast'; // ✅ ADDED: Import toast

const EditExercise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    language: 'python',
    time_limit: 5,
    memory_limit: 128000,
  });
  const [testCases, setTestCases] = useState([]);
  // ✅ REMOVED: error state (replaced with toast.error)

  useEffect(() => {
    loadExercise();
  }, [id]);

  const loadExercise = async () => {
    try {
      const response = await exerciseAPI.getById(id);
      const exercise = response.data.data.exercise;
      
      setFormData({
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        language: exercise.language,
        time_limit: exercise.time_limit,
        memory_limit: exercise.memory_limit,
      });

      if (exercise.testCases && exercise.testCases.length > 0) {
        setTestCases(exercise.testCases);
      } else {
        setTestCases([{ input: '', expected_output: '', is_sample: true, points: 10 }]);
      }
    } catch (error) {
      console.error('Failed to load exercise:', error);
      // ✅ UPDATED: Toast error instead of state error
      toast.error('Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { input: '', expected_output: '', is_sample: false, points: 10 },
    ]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ UPDATED: Validation with toast
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (testCases.length === 0) {
      toast.error('Please add at least one test case');
      return;
    }

    if (testCases.some((tc) => !tc.expected_output)) {
      toast.error('All test cases must have expected output');
      return;
    }

    setSubmitting(true);

    // ✅ ADDED: Loading toast
    const updateToast = toast.loading('Updating exercise...');

    try {
      await exerciseAPI.update(id, {
        ...formData,
        test_cases: testCases,
      });

      // ✅ UPDATED: Success toast instead of alert
      toast.success('Exercise updated successfully!', { id: updateToast });
      navigate('/dashboard');
    } catch (error) {
      // ✅ UPDATED: Error toast instead of error state
      toast.error(
        error.response?.data?.message || 'Failed to update exercise',
        { id: updateToast }
      );
    } finally {
      setSubmitting(false);
    }
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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(251, 191, 36, 0.3)',
            borderTop: '4px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '16px',
            fontSize: '16px'
          }}>
            Loading exercise...
          </p>
        </div>
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
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(30, 64, 175, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <nav style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  color: '#fbbf24',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginRight: '16px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fcd34d'}
                onMouseLeave={(e) => e.target.style.color = '#fbbf24'}
              >
                ← Back to Dashboard
              </button>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ffffff'
              }}>
                Edit Exercise
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ✅ REMOVED: Error Message div - replaced with toast */}

          {/* Basic Info */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#fbbf24',
              marginBottom: '24px'
            }}>
              Exercise Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  disabled={submitting} // ✅ ADDED: Disable during loading
                  placeholder="e.g., Two Sum Problem"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    opacity: submitting ? 0.6 : 1, // ✅ ADDED: Visual feedback
                    cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                  }}
                  onFocus={(e) => {
                    if (!submitting) { // ✅ ADDED: Only allow focus when not loading
                      e.target.style.border = '1px solid #fbbf24';
                      e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows="6"
                  disabled={submitting} // ✅ ADDED: Disable during loading
                  placeholder="Describe the problem, input format, output format, and any constraints..."
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    opacity: submitting ? 0.6 : 1, // ✅ ADDED: Visual feedback
                    cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                  }}
                  onFocus={(e) => {
                    if (!submitting) { // ✅ ADDED: Only allow focus when not loading
                      e.target.style.border = '1px solid #fbbf24';
                      e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Difficulty and Language */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    disabled={submitting} // ✅ ADDED: Disable during loading
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                      boxSizing: 'border-box',
                      opacity: submitting ? 0.6 : 1 // ✅ ADDED: Visual feedback
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    disabled={submitting} // ✅ ADDED: Disable during loading
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                      boxSizing: 'border-box',
                      opacity: submitting ? 0.6 : 1 // ✅ ADDED: Visual feedback
                    }}
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
              </div>

              {/* Time and Memory Limits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    name="time_limit"
                    min="1"
                    max="60"
                    value={formData.time_limit}
                    onChange={handleChange}
                    disabled={submitting} // ✅ ADDED: Disable during loading
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      opacity: submitting ? 0.6 : 1, // ✅ ADDED: Visual feedback
                      cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    Memory Limit (KB)
                  </label>
                  <input
                    type="number"
                    name="memory_limit"
                    min="1000"
                    step="1000"
                    value={formData.memory_limit}
                    onChange={handleChange}
                    disabled={submitting} // ✅ ADDED: Disable during loading
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      opacity: submitting ? 0.6 : 1, // ✅ ADDED: Visual feedback
                      cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#fbbf24'
              }}>
                Test Cases
              </h2>
              <button
                type="button"
                onClick={addTestCase}
                disabled={submitting} // ✅ ADDED: Disable during loading
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: submitting ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // ✅ UPDATED: Visual feedback
                  border: 'none',
                  borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) { // ✅ ADDED: Only allow hover effect when not loading
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                }}
              >
                + Add Test Case
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {testCases.map((testCase, index) => (
                <div key={index} style={{
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  opacity: submitting ? 0.6 : 1 // ✅ ADDED: Visual feedback for test cases
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      Test Case {index + 1}
                    </h3>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        disabled={submitting} // ✅ ADDED: Disable during loading
                        style={{
                          color: submitting ? 'rgba(239, 68, 68, 0.5)' : '#ef4444', // ✅ UPDATED: Visual feedback
                          background: 'none',
                          border: 'none',
                          fontSize: '14px',
                          cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                          fontWeight: '500',
                          transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting) e.target.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          if (!submitting) e.target.style.color = '#ef4444';
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Input */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '8px'
                      }}>
                        Input (leave empty if none)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 5 10"
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        disabled={submitting} // ✅ ADDED: Disable during loading
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                        }}
                      />
                    </div>

                    {/* Expected Output */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '8px'
                      }}>
                        Expected Output *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 15"
                        value={testCase.expected_output}
                        onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                        disabled={submitting} // ✅ ADDED: Disable during loading
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                        }}
                      />
                    </div>

                    {/* Checkbox and Points */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: submitting ? 'not-allowed' : 'pointer' // ✅ UPDATED: Cursor feedback
                      }}>
                        <input
                          type="checkbox"
                          checked={testCase.is_sample}
                          onChange={(e) => handleTestCaseChange(index, 'is_sample', e.target.checked)}
                          disabled={submitting} // ✅ ADDED: Disable during loading
                          style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '8px',
                            cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                            accentColor: '#fbbf24'
                          }}
                        />
                        <span style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                          Show as sample (visible to students)
                        </span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                          Points:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={testCase.points}
                          onChange={(e) => handleTestCaseChange(index, 'points', parseInt(e.target.value))}
                          disabled={submitting} // ✅ ADDED: Disable during loading
                          style={{
                            width: '80px',
                            padding: '6px 10px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: submitting ? 'not-allowed' : 'text' // ✅ ADDED: Cursor feedback
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={submitting} // ✅ ADDED: Disable during loading
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: submitting ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.9)', // ✅ UPDATED: Visual feedback
                background: 'rgba(51, 65, 85, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer', // ✅ UPDATED: Cursor feedback
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!submitting) { // ✅ ADDED: Only allow hover effect when not loading
                  e.target.style.background = 'rgba(51, 65, 85, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(51, 65, 85, 0.8)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                background: submitting ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                display: 'flex', // ✅ ADDED: For spinner alignment
                alignItems: 'center', // ✅ ADDED: For spinner alignment
                justifyContent: 'center', // ✅ ADDED: For spinner alignment
                gap: '8px' // ✅ ADDED: Space between spinner and text
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
              }}
            >
              {/* ✅ ADDED: Spinning loader */}
              {submitting && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #0f172a',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></div>
              )}
              <span>{submitting ? 'Updating...' : 'Update Exercise'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExercise;