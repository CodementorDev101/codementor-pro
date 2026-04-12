import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    // Instructor-only fields
    institution: '',
    department: '',
    position: '',
    employeeId: '',
    reason: '',
  });
  const [idImageBase64, setIdImageBase64] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState(null);
  const [idImageError, setIdImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isInstructor = formData.role === 'instructor';

  const inputStyle = (disabled) => ({
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text'
  });

  const labelStyle = {
    display: 'block',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (e) => {
    if (!loading) {
      e.target.style.border = '1px solid #fbbf24';
      e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
    }
  };

  const handleBlur = (e) => {
    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    e.target.style.boxShadow = 'none';
  };

  const handleIdImageUpload = (e) => {
    const file = e.target.files[0];
    setIdImageError('');

    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setIdImageError('Only JPG and PNG files are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setIdImageError('File size must be under 5MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdImageBase64(reader.result);
      setIdImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate instructor fields
    if (isInstructor) {
      if (!formData.institution || !formData.department || !formData.position || !formData.employeeId || !formData.reason) {
        toast.error('Please fill in all instructor credential fields.');
        return;
      }
      if (!idImageBase64) {
        toast.error('Please upload a valid ID image.');
        return;
      }
    }

    setLoading(true);
    const registerToast = toast.loading('Creating your account...');

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      };

      // Add instructor fields if registering as instructor
      if (isInstructor) {
        payload.institution = formData.institution;
        payload.department = formData.department;
        payload.position = formData.position;
        payload.employee_id = formData.employeeId;
        payload.reason = formData.reason;
        payload.valid_id_image = idImageBase64;
      }

      await api.post('/auth/register', payload);

      if (isInstructor) {
        toast.success(
          'Registration submitted! Please wait for admin approval before logging in.',
          { id: registerToast, duration: 6000 }
        );
        setFormData({
          email: '', password: '', confirmPassword: '',
          firstName: '', lastName: '', role: 'student',
          institution: '', department: '', position: '',
          employeeId: '', reason: '',
        });
        setIdImageBase64(null);
        setIdImagePreview(null);
        return;
      }

      toast.success('Account created successfully! Please sign in.', { id: registerToast });
      navigate('/login');

    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Registration failed. Please try again.',
        { id: registerToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #0f172a; color: #ffffff; }
      `}</style>

      {/* Register Card */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: isInstructor ? '680px' : '560px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(251, 191, 36, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10,
        transition: 'max-width 0.3s ease'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px', fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Join CodeMentor+ Pro
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
            Start your coding journey today
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Name Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName}
                onChange={handleChange} required disabled={loading}
                placeholder="John" style={inputStyle(loading)}
                onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName}
                onChange={handleChange} required disabled={loading}
                placeholder="Doe" style={inputStyle(loading)}
                onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} required disabled={loading}
              placeholder="your.email@example.com" style={inputStyle(loading)}
              onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>I am a...</label>
            <select name="role" value={formData.role}
              onChange={handleChange} disabled={loading}
              style={{ ...inputStyle(loading), cursor: loading ? 'not-allowed' : 'pointer' }}
              onFocus={handleFocus} onBlur={handleBlur}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          {/* ── INSTRUCTOR CREDENTIAL FIELDS (conditional) ── */}
          {isInstructor && (
            <div style={{
              background: 'rgba(251, 191, 36, 0.05)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px' }}>🪪</span>
                <div>
                  <p style={{ color: '#fbbf24', fontWeight: '600', fontSize: '15px', margin: 0 }}>
                    Instructor Credentials
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                    Required for admin verification and approval
                  </p>
                </div>
              </div>

              {/* Institution & Department row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Institution / School <span style={{ color: '#fbbf24' }}>*</span></label>
                  <input type="text" name="institution" value={formData.institution}
                    onChange={handleChange} disabled={loading}
                    placeholder="e.g. World Citi Colleges"
                    style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Department <span style={{ color: '#fbbf24' }}>*</span></label>
                  <input type="text" name="department" value={formData.department}
                    onChange={handleChange} disabled={loading}
                    placeholder="e.g. College of IT"
                    style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>

              {/* Position & Employee ID row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Position / Designation <span style={{ color: '#fbbf24' }}>*</span></label>
                  <select name="position" value={formData.position}
                    onChange={handleChange} disabled={loading}
                    style={{ ...inputStyle(loading), cursor: loading ? 'not-allowed' : 'pointer' }}
                    onFocus={handleFocus} onBlur={handleBlur}>
                    <option value="">Select position...</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Teaching Assistant">Teaching Assistant</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Employee / Faculty ID <span style={{ color: '#fbbf24' }}>*</span></label>
                  <input type="text" name="employeeId" value={formData.employeeId}
                    onChange={handleChange} disabled={loading}
                    placeholder="e.g. WCC-2024-001"
                    style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Reason for Joining <span style={{ color: '#fbbf24' }}>*</span></label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Briefly explain why you want to be an instructor on CodeMentor+ Pro..."
                  rows={3}
                  style={{
                    ...inputStyle(loading),
                    resize: 'vertical',
                    minHeight: '90px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Valid ID Upload */}
              <div>
                <label style={labelStyle}>Upload Valid ID <span style={{ color: '#fbbf24' }}>*</span></label>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px', marginTop: '-4px' }}>
                  School ID, Employee ID, or Government-issued ID (JPG/PNG, max 5MB)
                </p>

                {/* Upload area */}
                <label style={{
                  display: 'block',
                  border: `2px dashed ${idImagePreview ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: idImagePreview ? 'rgba(251,191,36,0.05)' : 'rgba(15,23,42,0.4)',
                }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleIdImageUpload}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  {idImagePreview ? (
                    <div>
                      <img
                        src={idImagePreview}
                        alt="ID Preview"
                        style={{
                          maxWidth: '100%', maxHeight: '180px',
                          borderRadius: '8px', marginBottom: '10px',
                          objectFit: 'contain'
                        }}
                      />
                      <p style={{ color: '#fbbf24', fontSize: '13px', margin: 0 }}>
                        ✓ ID uploaded — click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                        Click to upload your valid ID
                      </p>
                    </div>
                  )}
                </label>

                {idImageError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                    {idImageError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={formData.password}
              onChange={handleChange} required disabled={loading}
              placeholder="Create a strong password"
              style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} required disabled={loading}
              placeholder="Re-enter your password"
              style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0f172a', border: 'none', borderRadius: '12px',
              fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'; }}
          >
            {loading && (
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid #0f172a', borderTop: '2px solid transparent',
                borderRadius: '50%', animation: 'spin 0.6s linear infinite'
              }} />
            )}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ padding: '0 16px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600' }}
                onMouseEnter={(e) => e.target.style.color = '#fcd34d'}
                onMouseLeave={(e) => e.target.style.color = '#fbbf24'}>
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '14px' }}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;