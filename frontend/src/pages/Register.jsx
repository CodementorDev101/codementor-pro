import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const EyeIcon = ({ show }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// ─── Terms & Privacy Modal ───────────────────────────────────────────────────
const MODAL_CONTENT = {
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By registering an account on CodeMentor+ Pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not register or use the platform.',
      },
      {
        heading: '2. Eligibility',
        body: 'You must be enrolled in or affiliated with an academic institution to use CodeMentor+ Pro. Students and instructors must provide accurate registration information. Instructors are subject to admin approval before gaining full access.',
      },
      {
        heading: '3. Account Responsibilities',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your login information with others. Any activity that occurs under your account is your responsibility. Report unauthorized access to the platform administrators immediately.',
      },
      {
        heading: '4. Acceptable Use',
        body: 'Users agree to use CodeMentor+ Pro solely for legitimate educational purposes. The following are strictly prohibited: submitting plagiarized code, attempting to bypass the automated grading system, uploading malicious files, harassing other users, and any activity that disrupts platform operations.',
      },
      {
        heading: '5. Code Submissions',
        body: 'All code submitted through the platform is processed by an automated grading system (Judge0 CE). Submissions are stored in the database for academic record purposes. The platform does not claim ownership of any code you submit.',
      },
      {
        heading: '6. Instructor Verification',
        body: 'Instructors must upload a valid government-issued or institutional ID during registration. Providing false credentials is grounds for immediate account termination. Admin approval is required before instructor accounts become active.',
      },
      {
        heading: '7. Platform Availability',
        body: 'CodeMentor+ Pro is provided as a thesis capstone project. While we strive for uptime, we do not guarantee uninterrupted service. The platform may undergo maintenance or updates without prior notice.',
      },
      {
        heading: '8. Modifications',
        body: 'These Terms of Service may be updated at any time. Continued use of the platform after changes constitutes acceptance of the new terms.',
      },
      {
        heading: '9. Termination',
        body: 'Accounts that violate these terms may be suspended or permanently terminated by administrators without prior notice.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'When you register, we collect your first name, last name, email address, role (student or instructor), and password (stored as a hashed value). Instructors additionally provide their institution, department, position, employee ID, reason for joining, and a valid ID image.',
      },
      {
        heading: '2. How We Use Your Information',
        body: 'Your information is used to: create and manage your account, authenticate your identity via JSON Web Tokens (JWT), send transactional emails (welcome, approval, password reset) through SendGrid, display your profile within the platform, and generate anonymized analytics for instructors and administrators.',
      },
      {
        heading: '3. Data Storage',
        body: 'All data is stored securely in a MySQL database hosted on Railway. Passwords are never stored in plain text — they are hashed using bcrypt before storage. Valid ID images uploaded by instructors are stored as base64-encoded data and are accessible only to platform administrators.',
      },
      {
        heading: '4. Email Communications',
        body: 'We use SendGrid to send transactional emails. Your email address is used only for account-related communications such as account creation confirmation, instructor approval notifications, and password reset requests. We do not send marketing emails.',
      },
      {
        heading: '5. Code Submissions & Academic Data',
        body: 'Code submissions, test case results, scores, and submission history are stored in the database. This data is used to compute grades, display your submission history, and generate instructor analytics. This academic data is not shared with third parties.',
      },
      {
        heading: '6. Sharing of Information',
        body: 'We do not sell, trade, or share your personal information with third parties. Instructor credential information (including uploaded ID) is visible only to platform administrators for verification purposes.',
      },
      {
        heading: '7. Cookies & Local Storage',
        body: 'CodeMentor+ Pro uses browser local storage to maintain your authentication session via JWT tokens. No third-party tracking cookies are used on this platform.',
      },
      {
        heading: '8. Data Retention',
        body: 'Your account data is retained for the duration of your account\'s existence on the platform. You may request account deletion by contacting the platform administrator.',
      },
      {
        heading: '9. Security',
        body: 'We implement industry-standard security practices including password hashing, JWT-based authentication, and HTTPS-secured API communication. However, no system is completely immune to security risks.',
      },
      {
        heading: '10. Contact',
        body: 'For any privacy-related concerns or data requests, please contact the CodeMentor+ Pro development team at codementorpluspro@gmail.com.',
      },
    ],
  },
};

const TermsModal = ({ type, onClose }) => {
  const content = MODAL_CONTENT[type];
  if (!content) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '20px',
          width: '100%', maxWidth: '640px',
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{type === 'terms' ? '📋' : '🔒'}</span>
            <h2 style={{
              margin: 0, fontSize: '20px', fontWeight: '700',
              background: 'linear-gradient(135deg, #fbbf24, #fcd34d)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              borderRadius: '8px', color: 'rgba(255,255,255,0.7)',
              width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '18px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body — scrollable */}
        <div style={{
          overflowY: 'auto', padding: '24px 28px 28px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(251,191,36,0.3) transparent',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
            Last updated: April 2026 &nbsp;·&nbsp; CodeMentor+ Pro — World Citi Colleges Quezon City
          </p>
          {content.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <h3 style={{
                color: '#fbbf24', fontSize: '14px', fontWeight: '600',
                marginBottom: '8px', marginTop: 0,
              }}>
                {section.heading}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '14px',
                lineHeight: '1.7', margin: 0,
              }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0, textAlign: 'right',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 28px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0f172a', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(251,191,36,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(251,191,36,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251,191,36,0.3)'; }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', role: 'student',
    institution: '', department: '', position: '',
    employeeId: '', reason: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idImageBase64, setIdImageBase64] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState(null);
  const [idImageError, setIdImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [openModal, setOpenModal] = useState(null); // 'terms' | 'privacy' | null
  const navigate = useNavigate();

  const isInstructor = formData.role === 'instructor';

  const inputStyle = (disabled) => ({
    width: '100%', padding: '14px 16px',
    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px', color: '#ffffff', fontSize: '16px', outline: 'none',
    transition: 'all 0.3s ease', boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text'
  });

  const labelStyle = {
    display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (e) => {
    if (!loading) { e.target.style.border = '1px solid #fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)'; }
  };

  const handleBlur = (e) => {
    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none';
  };

  const handleIdImageUpload = (e) => {
    const file = e.target.files[0];
    setIdImageError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setIdImageError('Only JPG and PNG files are allowed.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setIdImageError('File size must be under 5MB.'); return;
    }
    const reader = new FileReader();
    reader.onloadend = () => { setIdImageBase64(reader.result); setIdImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Please read and agree to the Terms of Service and Privacy Policy before registering.');
      return;
    }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (isInstructor) {
      if (!formData.institution || !formData.department || !formData.position || !formData.employeeId || !formData.reason) {
        toast.error('Please fill in all instructor credential fields.'); return;
      }
      if (!idImageBase64) { toast.error('Please upload a valid ID image.'); return; }
    }
    setLoading(true);
    const registerToast = toast.loading('Creating your account...');
    try {
      const payload = {
        email: formData.email, password: formData.password,
        first_name: formData.firstName, last_name: formData.lastName, role: formData.role,
      };
      if (isInstructor) {
        payload.institution = formData.institution; payload.department = formData.department;
        payload.position = formData.position; payload.employee_id = formData.employeeId;
        payload.reason = formData.reason; payload.valid_id_image = idImageBase64;
      }
      await api.post('/auth/register', payload);
      if (isInstructor) {
        toast.success('Registration submitted! Please wait for admin approval before logging in.', { id: registerToast, duration: 6000 });
        setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', role: 'student', institution: '', department: '', position: '', employeeId: '', reason: '' });
        setIdImageBase64(null); setIdImagePreview(null); setAgreedToTerms(false); return;
      }
      toast.success('Account created successfully! Please sign in.', { id: registerToast });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.', { id: registerToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite reverse' }} />

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #0f172a; color: #ffffff; }
      `}</style>

      {/* Terms / Privacy Modal */}
      {openModal && <TermsModal type={openModal} onClose={() => setOpenModal(null)} />}

      <div style={{
        background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)',
        borderRadius: '24px', padding: '48px', width: '100%',
        maxWidth: isInstructor ? '680px' : '560px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(251, 191, 36, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', zIndex: 10,
        transition: 'max-width 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            Join CodeMentor+ Pro
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>Start your coding journey today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={loading} placeholder="John" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={loading} placeholder="Doe" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} placeholder="your.email@example.com" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>I am a...</label>
            <select name="role" value={formData.role} onChange={handleChange} disabled={loading} style={{ ...inputStyle(loading), cursor: loading ? 'not-allowed' : 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          {/* Instructor Fields */}
          {isInstructor && (
            <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px' }}>🪪</span>
                <div>
                  <p style={{ color: '#fbbf24', fontWeight: '600', fontSize: '15px', margin: 0 }}>Instructor Credentials</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Required for admin verification and approval</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Institution / School <span style={{ color: '#fbbf24' }}>*</span></label>
                  <input type="text" name="institution" value={formData.institution} onChange={handleChange} disabled={loading} placeholder="e.g. World Citi Colleges" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Department <span style={{ color: '#fbbf24' }}>*</span></label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={loading} placeholder="e.g. College of IT" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Position / Designation <span style={{ color: '#fbbf24' }}>*</span></label>
                  <select name="position" value={formData.position} onChange={handleChange} disabled={loading} style={{ ...inputStyle(loading), cursor: loading ? 'not-allowed' : 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
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
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} disabled={loading} placeholder="e.g. WCC-2024-001" style={inputStyle(loading)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Reason for Joining <span style={{ color: '#fbbf24' }}>*</span></label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} disabled={loading} placeholder="Briefly explain why you want to be an instructor on CodeMentor+ Pro..." rows={3} style={{ ...inputStyle(loading), resize: 'vertical', minHeight: '90px', fontFamily: 'inherit', lineHeight: '1.5' }} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div>
                <label style={labelStyle}>Upload Valid ID <span style={{ color: '#fbbf24' }}>*</span></label>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px', marginTop: '-4px' }}>School ID, Employee ID, or Government-issued ID (JPG/PNG, max 5MB)</p>
                <label style={{ display: 'block', border: `2px dashed ${idImagePreview ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`, borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', background: idImagePreview ? 'rgba(251,191,36,0.05)' : 'rgba(15,23,42,0.4)' }}>
                  <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleIdImageUpload} disabled={loading} style={{ display: 'none' }} />
                  {idImagePreview ? (
                    <div>
                      <img src={idImagePreview} alt="ID Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', marginBottom: '10px', objectFit: 'contain' }} />
                      <p style={{ color: '#fbbf24', fontSize: '13px', margin: 0 }}>✓ ID uploaded — click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Click to upload your valid ID</p>
                    </div>
                  )}
                </label>
                {idImageError && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{idImageError}</p>}
              </div>
            </div>
          )}

          {/* Password with toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required disabled={loading}
                placeholder="Create a strong password"
                style={{ ...inputStyle(loading), padding: '14px 48px 14px 16px' }}
                onFocus={handleFocus} onBlur={handleBlur}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '0', display: 'flex', alignItems: 'center' }}>
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </div>

          {/* Confirm Password with toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required disabled={loading}
                placeholder="Re-enter your password"
                style={{ ...inputStyle(loading), padding: '14px 48px 14px 16px' }}
                onFocus={handleFocus} onBlur={handleBlur}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '0', display: 'flex', alignItems: 'center' }}>
                <EyeIcon show={showConfirmPassword} />
              </button>
            </div>
          </div>

          {/* ── Terms & Privacy Checkbox ── */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: `1px solid ${agreedToTerms ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px', padding: '16px 18px',
            marginBottom: '28px',
            transition: 'border-color 0.3s ease',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              {/* Custom checkbox */}
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                  marginTop: '1px',
                  border: `2px solid ${agreedToTerms ? '#fbbf24' : 'rgba(255,255,255,0.3)'}`,
                  background: agreedToTerms ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(15,23,42,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
              >
                {agreedToTerms && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.6' }}>
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenModal('terms'); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#fbbf24', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenModal('privacy'); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#fbbf24', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Privacy Policy
                </button>
                {' '}of CodeMentor+ Pro.
              </span>
            </label>
          </div>
          {/* ── End Terms & Privacy Checkbox ── */}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'; }}>
            {loading && <div style={{ width: '16px', height: '16px', border: '2px solid #0f172a', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ padding: '0 16px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600' }} onMouseEnter={(e) => e.target.style.color = '#fcd34d'} onMouseLeave={(e) => e.target.style.color = '#fbbf24'}>Sign in</Link>
            </p>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '14px' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;