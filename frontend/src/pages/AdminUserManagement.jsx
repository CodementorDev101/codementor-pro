import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userManagementAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', role: 'all' });
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });

  // Instructor credentials modal
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    loadUsers();
    loadPendingInstructors();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.search) params.search = filter.search;
      if (filter.role !== 'all') params.role = filter.role;
      const response = await userManagementAPI.getAllUsers(params);
      setUsers(response.data.data);
      if (!filter.search && filter.role === 'all') {
        setTotalUsers(response.data.data.length);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInstructors = async () => {
    try {
      const response = await userManagementAPI.getAllUsers({ role: 'instructor' });
      const pending = response.data.data.filter(u => u.status === 'pending');
      setPendingInstructors(pending);
    } catch (error) {
      console.error('Failed to load pending instructors:', error);
    }
  };

  const handleApprove = async (userId, userName) => {
    const loadingToast = toast.loading(`Approving ${userName}...`);
    try {
      await userManagementAPI.updateUser(userId, { status: 'approved' });
      toast.success(`${userName} has been approved!`, { id: loadingToast });
      setShowCredentialsModal(false);
      loadPendingInstructors();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user', { id: loadingToast });
    }
  };

  const handleReject = async (userId, userName) => {
    const loadingToast = toast.loading(`Rejecting ${userName}...`);
    try {
      await userManagementAPI.updateUser(userId, { status: 'rejected' });
      toast.success(`${userName} has been rejected.`, { id: loadingToast });
      setShowCredentialsModal(false);
      loadPendingInstructors();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user', { id: loadingToast });
    }
  };

  const handleViewCredentials = (instructor) => {
    setSelectedInstructor(instructor);
    setShowCredentialsModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '', password: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating user...');
    try {
      const updateData = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password.trim() !== '') updateData.password = editForm.password;
      await userManagementAPI.updateUser(editingUser.id, updateData);
      toast.success('User updated successfully!', { id: loadingToast });
      handleCloseModal();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user', { id: loadingToast });
    }
  };

  const handleDeleteClick = (user) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <strong style={{ color: '#ffffff' }}>Delete User?</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            Are you sure you want to delete {user.name}? This cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            const deleteToast = toast.loading('Deleting user...');
            try {
              await userManagementAPI.deleteUser(user.id);
              toast.success('User deleted successfully!', { id: deleteToast });
              loadUsers();
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to delete user', { id: deleteToast });
            }
          }} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff', background: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    ), { duration: Infinity, style: { minWidth: '350px', padding: '16px' } });
  };

  const clearFilters = () => { setFilter({ search: '', role: 'all' }); toast.success('Filters cleared!'); };
  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return { bg: '#ef4444', text: '#ffffff' };
      case 'instructor': return { bg: '#3b82f6', text: '#ffffff' };
      case 'student': return { bg: '#10b981', text: '#ffffff' };
      default: return { bg: '#6b7280', text: '#ffffff' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(16,185,129,0.2)', color: '#10b981', label: 'Approved' };
      case 'pending': return { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', label: 'Pending' };
      case 'rejected': return { bg: 'rgba(239,68,68,0.2)', color: '#ef4444', label: 'Rejected' };
      default: return { bg: 'rgba(107,114,128,0.2)', color: '#6b7280', label: 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fieldStyle = {
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '1.5'
  };

  const fieldLabelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '6px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              CodeMentor+ Pro
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', flexShrink: 0 }}>
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>{user?.first_name} {user?.last_name}</span>
                  <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
              </div>
              {['Dashboard', 'Profile'].map((label) => (
                <button key={label} onClick={() => navigate(label === 'Dashboard' ? '/dashboard' : '/profile')}
                  style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}>
                  {label === 'Dashboard' ? '🏠' : '👤'} {label}
                </button>
              ))}
              <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 10 }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>👥 User Management</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Manage all users in the system</p>
        </div>

        {/* Pending Instructor Approvals */}
        {pendingInstructors.length > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', margin: '0 0 16px 0' }}>
              ⏳ Pending Instructor Approvals ({pendingInstructors.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingInstructors.map((instructor) => (
                <div key={instructor.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(30,41,59,0.6)', borderRadius: '12px', padding: '16px 20px',
                  border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <p style={{ color: '#ffffff', fontWeight: '600', margin: '0 0 4px 0', fontSize: '15px' }}>
                      {instructor.name}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '13px' }}>
                      📧 {instructor.email} · 📅 Registered {formatDate(instructor.createdAt)}
                    </p>
                    {/* Show institution if available */}
                    {instructor.institution && (
                      <p style={{ color: '#fbbf24', margin: '4px 0 0 0', fontSize: '13px' }}>
                        🏫 {instructor.institution} — {instructor.department}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* View Credentials Button */}
                    <button
                      onClick={() => handleViewCredentials(instructor)}
                      style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}>
                      🪪 View Credentials
                    </button>
                    <button
                      onClick={() => handleApprove(instructor.id, instructor.name)}
                      style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', color: '#ffffff', background: 'rgba(16,185,129,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(16,185,129,1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(16,185,129,0.8)'}>
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(instructor.id, instructor.name)}
                      style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', color: '#ffffff', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.8)'}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
            <input type="text" placeholder="🔍 Search by name or email..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.target.style.border = '1px solid #fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.1)'; }}
              onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <select value={filter.role} onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            style={{ padding: '12px 16px', background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#ffffff', fontSize: '14px', cursor: 'pointer', outline: 'none', minWidth: '150px' }}>
            <option value="all" style={{ background: '#0f172a' }}>All Roles</option>
            <option value="student" style={{ background: '#0f172a' }}>Students</option>
            <option value="instructor" style={{ background: '#0f172a' }}>Instructors</option>
            <option value="admin" style={{ background: '#0f172a' }}>Admins</option>
          </select>
          {(filter.search || filter.role !== 'all') && (
            <button onClick={clearFilters}
              style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '600', color: '#ffffff', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.8)'}>
              ✕ Clear Filters
            </button>
          )}
          {!loading && totalUsers > 0 && (
            <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#fbbf24', marginLeft: 'auto' }}>
              Showing {users.length} of {totalUsers} users
            </div>
          )}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(251,191,36,0.3)', borderTop: '4px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '48px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '500px', margin: '0 auto' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', marginBottom: '24px' }}>
                {filter.search || filter.role !== 'all' ? '🔍 No users found matching your filters' : '👥 No users in the system yet'}
              </p>
              {(filter.search || filter.role !== 'all') && (
                <button onClick={clearFilters} style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600', color: '#0f172a', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Clear Filters</button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {users.map((userItem) => {
              const roleColor = getRoleBadgeColor(userItem.role);
              const statusBadge = getStatusBadge(userItem.status);
              return (
                <div key={userItem.id} style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,191,36,0.2)'; e.currentTarget.style.border = '1px solid rgba(251,191,36,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0, flex: 1 }}>{userItem.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '12px', background: roleColor.bg, color: roleColor.text, textTransform: 'uppercase' }}>{userItem.role}</span>
                      {userItem.role === 'instructor' && (
                        <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', background: statusBadge.bg, color: statusBadge.color }}>{statusBadge.label}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>📧 {userItem.email}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: userItem.role === 'instructor' ? '8px' : '0' }}>📅 Joined {formatDate(userItem.createdAt)}</p>
                  {/* Show institution for instructors */}
                  {userItem.role === 'instructor' && userItem.institution && (
                    <p style={{ fontSize: '12px', color: '#fbbf24' }}>🏫 {userItem.institution}</p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
                    {/* View Credentials button for instructors */}
                    {userItem.role === 'instructor' && (
                      <button onClick={() => handleViewCredentials(userItem)}
                        style={{ flex: '1 1 auto', padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}>
                        🪪 Credentials
                      </button>
                    )}
                    <button onClick={() => handleEditClick(userItem)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px', fontWeight: '600', color: '#0f172a', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 4px 12px rgba(251,191,36,0.4)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteClick(userItem)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px', fontWeight: '600', color: '#ffffff', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.background = 'rgba(239,68,68,1)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.background = 'rgba(239,68,68,0.8)'; }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INSTRUCTOR CREDENTIALS MODAL ── */}
      {showCredentialsModal && selectedInstructor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCredentialsModal(false); }}>
          <div style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '36px', maxWidth: '600px', width: '100%', border: '1px solid rgba(251,191,36,0.2)', animation: 'fadeIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0' }}>
                  🪪 Instructor Credentials
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
                  Review before making an approval decision
                </p>
              </div>
              <button onClick={() => setShowCredentialsModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '18px' }}>
                ✕
              </button>
            </div>

            {/* Status Badge */}
            {selectedInstructor.status && (
              <div style={{ marginBottom: '24px' }}>
                <span style={{ ...getStatusBadge(selectedInstructor.status), padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: getStatusBadge(selectedInstructor.status).bg, color: getStatusBadge(selectedInstructor.status).color }}>
                  Status: {getStatusBadge(selectedInstructor.status).label}
                </span>
              </div>
            )}

            {/* Personal Info */}
            <div style={{ marginBottom: '20px' }}>
              <p style={fieldLabelStyle}>Full Name</p>
              <div style={fieldStyle}>{selectedInstructor.name}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={fieldLabelStyle}>Email Address</p>
              <div style={fieldStyle}>{selectedInstructor.email}</div>
            </div>

            {/* Credential Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={fieldLabelStyle}>Institution / School</p>
                <div style={fieldStyle}>{selectedInstructor.institution || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not provided</span>}</div>
              </div>
              <div>
                <p style={fieldLabelStyle}>Department</p>
                <div style={fieldStyle}>{selectedInstructor.department || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not provided</span>}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={fieldLabelStyle}>Position / Designation</p>
                <div style={fieldStyle}>{selectedInstructor.position || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not provided</span>}</div>
              </div>
              <div>
                <p style={fieldLabelStyle}>Employee / Faculty ID</p>
                <div style={fieldStyle}>{selectedInstructor.employee_id || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not provided</span>}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={fieldLabelStyle}>Reason for Joining</p>
              <div style={{ ...fieldStyle, minHeight: '80px' }}>{selectedInstructor.reason || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not provided</span>}</div>
            </div>

            {/* Valid ID Image */}
            <div style={{ marginBottom: '28px' }}>
              <p style={fieldLabelStyle}>Uploaded Valid ID</p>
              {selectedInstructor.valid_id_image ? (
                <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(15,23,42,0.6)' }}>
                  <img
                    src={selectedInstructor.valid_id_image}
                    alt="Valid ID"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{ ...fieldStyle, textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)' }}>
                  No ID image uploaded
                </div>
              )}
            </div>

            {/* Registration Date */}
            <div style={{ marginBottom: '28px' }}>
              <p style={fieldLabelStyle}>Registration Date</p>
              <div style={fieldStyle}>📅 {formatDate(selectedInstructor.createdAt)}</div>
            </div>

            {/* Action Buttons — only show for pending */}
            {selectedInstructor.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleApprove(selectedInstructor.id, selectedInstructor.name)}
                  style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '700', color: '#ffffff', background: 'rgba(16,185,129,0.9)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.9)'}>
                  ✅ Approve Instructor
                </button>
                <button onClick={() => handleReject(selectedInstructor.id, selectedInstructor.name)}
                  style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '700', color: '#ffffff', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.9)'}>
                  ❌ Reject Instructor
                </button>
              </div>
            )}

            {selectedInstructor.status !== 'pending' && (
              <button onClick={() => setShowCredentialsModal(false)}
                style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '600', color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer' }}>
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>Edit User</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>{label}</label>
                  <input type={type} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} required
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} required
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                  <option value="student" style={{ background: '#0f172a' }}>Student</option>
                  <option value="instructor" style={{ background: '#0f172a' }}>Instructor</option>
                  <option value="admin" style={{ background: '#0f172a' }}>Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>New Password (optional)</label>
                <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave blank to keep current"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={handleCloseModal}
                  style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600', color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600', color: '#0f172a', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(251,191,36,0.3)' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;