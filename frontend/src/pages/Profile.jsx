// ✅ Profile Page with show/hide password toggles
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const EyeIcon = ({ show }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullProfile, setFullProfile] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await userAPI.getProfile();
      const userData = response.data.data.user;
      setFullProfile(userData);
      setProfileData({ first_name: userData.first_name, last_name: userData.last_name, email: userData.email });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.first_name.trim() || !profileData.last_name.trim() || !profileData.email.trim()) {
      toast.error('All fields are required.'); return;
    }
    const loadingToast = toast.loading('Updating profile...');
    try {
      setIsSavingProfile(true);
      const response = await userAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;
      updateUser(updatedUser); setFullProfile(updatedUser); setIsEditingProfile(false);
      toast.success('Profile updated successfully!', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.', { id: loadingToast });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({ first_name: fullProfile.first_name, last_name: fullProfile.last_name, email: fullProfile.email });
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('All password fields are required.'); return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match.'); return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long.'); return;
    }
    const loadingToast = toast.loading('Changing password...');
    try {
      setIsChangingPassword(true);
      await userAPI.changePassword(passwordData);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
      toast.success('Password changed successfully!', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.', { id: loadingToast });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'instructor': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      case 'student': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  const pwInputStyle = (disabled) => ({
    width: '100%', padding: '12px 48px 12px 16px',
    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
    transition: 'all 0.3s ease', boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text'
  });

  const eyeBtnStyle = {
    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.5)', padding: '0', display: 'flex', alignItems: 'center'
  };

  if (isLoadingProfile) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '500' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 20s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 15s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>My Profile</h1>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Manage your account settings and preferences</p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
            onMouseOver={(e) => { e.target.style.background = 'rgba(51, 65, 85, 0.8)'; e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(51, 65, 85, 0.6)'; e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'; }}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Profile Information Card */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '20px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9' }}>Profile Information</h2>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '10px', color: '#1e293b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)' }}
                onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)'; }}
                onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'; }}>
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>First Name</label>
                <input type="text" name="first_name" value={profileData.first_name} onChange={handleProfileChange} disabled={!isEditingProfile || isSavingProfile} style={{ width: '100%', padding: '12px 16px', background: isEditingProfile ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'all 0.3s ease', cursor: isEditingProfile ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Last Name</label>
                <input type="text" name="last_name" value={profileData.last_name} onChange={handleProfileChange} disabled={!isEditingProfile || isSavingProfile} style={{ width: '100%', padding: '12px 16px', background: isEditingProfile ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'all 0.3s ease', cursor: isEditingProfile ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
              <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} disabled={!isEditingProfile || isSavingProfile} style={{ width: '100%', padding: '12px 16px', background: isEditingProfile ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'all 0.3s ease', cursor: isEditingProfile ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Role</label>
                <div style={{ padding: '12px 16px', background: getRoleBadgeColor(fullProfile?.role), borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '600', textAlign: 'center', textTransform: 'capitalize' }}>{fullProfile?.role}</div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Member Since</label>
                <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#94a3b8', fontSize: '14px' }}>{formatDate(fullProfile?.created_at)}</div>
              </div>
            </div>

            {isEditingProfile && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCancelEdit} disabled={isSavingProfile} style={{ padding: '12px 24px', background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', cursor: isSavingProfile ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', opacity: isSavingProfile ? 0.5 : 1 }}>Cancel</button>
                <button type="submit" disabled={isSavingProfile} style={{ padding: '12px 24px', background: isSavingProfile ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '10px', color: '#1e293b', fontSize: '14px', fontWeight: '600', cursor: isSavingProfile ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSavingProfile && <div style={{ width: '16px', height: '16px', border: '2px solid #1e293b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password Card */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(148, 163, 184, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '24px' }}>Change Password</h2>

          <form onSubmit={handleChangePassword}>
            {/* Current Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showCurrentPassword ? 'text' : 'password'} name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} disabled={isChangingPassword} placeholder="Enter your current password" style={pwInputStyle(isChangingPassword)} />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={eyeBtnStyle}><EyeIcon show={showCurrentPassword} /></button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showNewPassword ? 'text' : 'password'} name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} disabled={isChangingPassword} placeholder="Enter your new password (min. 6 characters)" style={pwInputStyle(isChangingPassword)} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={eyeBtnStyle}><EyeIcon show={showNewPassword} /></button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} disabled={isChangingPassword} placeholder="Confirm your new password" style={pwInputStyle(isChangingPassword)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeBtnStyle}><EyeIcon show={showConfirmPassword} /></button>
              </div>
            </div>

            <button type="submit" disabled={isChangingPassword} style={{ padding: '12px 24px', background: isChangingPassword ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '10px', color: '#1e293b', fontSize: '14px', fontWeight: '600', cursor: isChangingPassword ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseOver={(e) => { if (!isChangingPassword) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)'; } }}
              onMouseOut={(e) => { if (!isChangingPassword) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'; } }}>
              {isChangingPassword && <div style={{ width: '16px', height: '16px', border: '2px solid #1e293b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(30px, -30px) rotate(5deg); } 66% { transform: translate(-20px, 20px) rotate(-5deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Profile;