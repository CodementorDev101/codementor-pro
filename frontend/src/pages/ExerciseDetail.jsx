import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exerciseAPI, submissionAPI } from '../services/api';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadExercise();
  }, [id]);

  const loadExercise = async () => {
    try {
      const response = await exerciseAPI.getById(id);
      const exerciseData = response.data.data.exercise;
      setExercise(exerciseData);
      
      // Set default code template based on language
      setCode(getDefaultCode(exerciseData.language));
    } catch (error) {
      console.error('Failed to load exercise:', error);
      toast.error('Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (language) => {
    const templates = {
      python: '# Write your solution here\ndef solution():\n    pass\n',
      javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
      c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
    };
    return templates[language] || '';
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting!');
      return;
    }

    setSubmitting(true);
    setResult(null);
    
    const submitToast = toast.loading('Running your code against test cases...');

    try {
      const response = await submissionAPI.submit({
        exercise_id: id,
        code: code,
        language: exercise.language,
      });

      const resultData = response.data.data;
      setResult(resultData);

      // Show success or failure toast
      if (resultData.status === 'accepted') {
        toast.success(
          `All test cases passed! Score: ${resultData.score}%`,
          { id: submitToast, duration: 4000 }
        );
      } else {
        toast.error(
          `${resultData.passed_test_cases}/${resultData.total_test_cases} test cases passed. Score: ${resultData.score}%`,
          { id: submitToast, duration: 5000 }
        );
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error(
        error.response?.data?.message || 'Submission failed. Please try again.',
        { id: submitToast }
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

  if (!exercise) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }}>Exercise not found</p>
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
          maxWidth: '1400px',
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
                {exercise.title}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '6px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '20px',
                background: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                {exercise.language.toUpperCase()}
              </span>
              <span style={{
                padding: '6px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '20px',
                background: exercise.difficulty === 'easy'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : exercise.difficulty === 'medium'
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
                color: exercise.difficulty === 'easy'
                  ? '#22c55e'
                  : exercise.difficulty === 'medium'
                  ? '#fbbf24'
                  : '#ef4444',
                border: exercise.difficulty === 'easy'
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : exercise.difficulty === 'medium'
                  ? '1px solid rgba(251, 191, 36, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Left: Problem Description */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px'
            }}>
              Problem Description
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '24px',
              whiteSpace: 'pre-wrap'
            }}>
              {exercise.description}
            </p>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fbbf24',
              marginBottom: '12px'
            }}>
              Constraints
            </h3>
            <ul style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px',
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '8px' }}>Time Limit: {exercise.time_limit} seconds</li>
              <li>Memory Limit: {exercise.memory_limit / 1000} KB</li>
            </ul>

            {exercise.testCases && exercise.testCases.some((tc) => tc.is_sample) && (
              <>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  marginBottom: '12px'
                }}>
                  Sample Test Cases
                </h3>
                {exercise.testCases
                  .filter((tc) => tc.is_sample)
                  .map((tc, index) => (
                    <div key={tc.id} style={{
                      marginBottom: '16px',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#fbbf24',
                        marginBottom: '8px'
                      }}>
                        Example {index + 1}:
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '500', color: '#fbbf24' }}>Input:</span> {tc.input || '(empty)'}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        <span style={{ fontWeight: '500', color: '#fbbf24' }}>Expected Output:</span> {tc.expected_output}
                      </p>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Right: Code Editor */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 160px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff'
              }}>
                Code Editor
              </h2>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: submitting ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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
                <span>{submitting ? 'Submitting...' : 'Submit Solution'}</span>
              </button>
            </div>

            <div style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              flexShrink: 0
            }}>
              <Editor
                height="400px"
                language={exercise.language === 'cpp' ? 'cpp' : exercise.language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Results */}
            {result && (
              <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  marginBottom: '12px'
                }}>
                  Submission Results
                </h3>
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: result.status === 'accepted'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: result.status === 'accepted'
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <p style={{
                    fontWeight: '600',
                    marginBottom: '12px',
                    fontSize: '16px',
                    color: '#ffffff'
                  }}>
                    Status:{' '}
                    <span style={{
                      color: result.status === 'accepted' ? '#22c55e' : '#ef4444'
                    }}>
                      {result.status === 'accepted' ? 'Accepted ✓' : 'Wrong Answer ✗'}
                    </span>
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '16px'
                  }}>
                    Score: <span style={{ fontWeight: '600', color: '#fbbf24' }}>{result.score}%</span> ({result.passed_test_cases}/{result.total_test_cases} test cases passed)
                  </p>

                  <div>
                    <p style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '12px',
                      color: '#fbbf24'
                    }}>
                      Test Case Results:
                    </p>
                    {result.results.map((testResult, index) => (
                      <div key={index} style={{
                        fontSize: '14px',
                        marginBottom: '12px',
                        padding: '12px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <p style={{
                          fontWeight: '500',
                          marginBottom: '8px',
                          color: '#ffffff'
                        }}>
                          Test Case {index + 1}:{' '}
                          {testResult.passed ? (
                            <span style={{ color: '#22c55e' }}>Passed ✓</span>
                          ) : (
                            <span style={{ color: '#ef4444' }}>Failed ✗</span>
                          )}
                        </p>
                        {testResult.is_sample && (
                          <>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>
                              Input: {testResult.input}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>
                              Expected: {testResult.expected_output}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Your Output: {testResult.actual_output}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;